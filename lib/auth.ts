import AzureADProvider from "next-auth/providers/azure-ad";
import type { NextAuthOptions } from "next-auth";
import { mapAzureRoleToAppRole, verifyTenant } from "./auth-config";

// Utility to safely get boolean env (defaults false)
const envFlag = (v: string | undefined): boolean => v === "1" || v === "true";

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      // Ensure PKCE is used:
      checks: ["pkce", "state"],
      authorization: {
        params: {
          scope: "openid profile email offline_access User.Read",
          response_type: "code",
        },
      },
    } as any),
  ],
  session: { strategy: "jwt" },
  debug: envFlag(process.env.NEXTAUTH_DEBUG),
  callbacks: {
    async jwt({ token, profile, account }) {
      if (profile) {
        try {
          const rawProfile = profile as any;
          const tenantId = rawProfile.tid || rawProfile.tenantId;
          token.tenantId = tenantId;

          // Tenant verification - don't fail, just warn
          if (!verifyTenant(tenantId, process.env.AZURE_AD_TENANT_ID)) {
            console.warn("[NextAuth jwt] Tenant mismatch:", tenantId);
            // Allow sign-in but mark the error
            (token as any).authError = "tenant_mismatch";
          }

          // Role mapping - handle missing roles gracefully
          const roles: string[] | undefined =
            rawProfile.roles || rawProfile.groups || undefined;
          if (roles && Array.isArray(roles)) {
            token.roles = roles;
          }

          // Always set a role (defaults to "student" if no roles found)
          token.role = mapAzureRoleToAppRole(roles);

          if (envFlag(process.env.NEXTAUTH_DEBUG)) {
            console.log(
              "[NextAuth jwt] Successfully processed:",
              {
                tenant: tenantId,
                roles: roles || "none",
                mappedRole: token.role,
                email: rawProfile.email || rawProfile.preferred_username
              }
            );
          }
        } catch (e: any) {
          console.error("[NextAuth jwt] callback failure:", e.message);
          // Don't block sign-in on JWT callback errors
          // Just assign default role and continue
          token.role = "student";
          (token as any).authError = "jwt_exception";
        }
      }
      // If provider-level error surfaced (e.g., invalid client secret), expose minimal flag
      if (account && account.error) {
        console.error("[NextAuth] Account error:", account.error);
        (token as any).authError = account.error;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).tenantId = token.tenantId;
        (session.user as any).roles = (token as any).roles || [];
        (session.user as any).authError = (token as any).authError;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Ensure absolute callbackUrl does not create loops
      if (url.startsWith(`${baseUrl}/auth/signin`)) {
        return `${baseUrl}/auth/signin`;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

export default authOptions;
