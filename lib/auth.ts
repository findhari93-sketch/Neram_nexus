import AzureADProvider from "next-auth/providers/azure-ad";
import type { NextAuthOptions } from "next-auth";
import { mapAzureRoleToAppRole, verifyTenant } from "./auth-config";

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
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        const rawProfile = profile as any;
        const tenantId = rawProfile.tid || rawProfile.tenantId;
        if (!verifyTenant(tenantId, process.env.AZURE_AD_TENANT_ID)) {
          throw new Error("Unauthorized tenant");
        }
        token.tenantId = tenantId;
        // Preserve raw roles/groups in the token for backend logic
        const roles: string[] | undefined =
          rawProfile.roles || rawProfile.groups;
        if (roles) token.roles = roles;
        // Keep a mapped single app role for quick checks
        token.role = mapAzureRoleToAppRole(roles);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).tenantId = token.tenantId;
        (session.user as any).roles = (token as any).roles || [];
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

export default authOptions;
