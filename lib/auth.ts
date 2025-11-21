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
      authorization: {
        params: {
          scope: "openid profile email offline_access User.Read",
        },
      },
      // Enable PKCE (Proof Key for Code Exchange) required by Azure AD
      checks: ["pkce", "state"],
    }),
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
          if (!verifyTenant(tenantId, process.env.AZURE_AD_TENANT_ID)) {
            // Do not throw — mark error to avoid redirect loop
            (token as any).authError = "tenant_mismatch";
          }
          const roles: string[] | undefined =
            rawProfile.roles || rawProfile.groups;
          if (roles) token.roles = roles;
          token.role = mapAzureRoleToAppRole(roles);
          if (envFlag(process.env.NEXTAUTH_DEBUG)) {
            // Minimal debug logging
            console.log(
              "[NextAuth jwt] tenant=",
              tenantId,
              "roles=",
              roles,
              "mappedRole=",
              token.role
            );
          }
        } catch (e: any) {
          console.error("[NextAuth jwt] callback failure", e);
          (token as any).authError = "jwt_exception";
        }
      }
      // If provider-level error surfaced (e.g., invalid client secret), expose minimal flag
      if (account && account.error) {
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
