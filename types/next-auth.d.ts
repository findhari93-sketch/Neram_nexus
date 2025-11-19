import { DefaultSession } from "next-auth";
import type { AppRole } from "@/lib/auth-config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
      tenantId?: string;
      roles?: string[];
    } & DefaultSession["user"];
  }
  interface User {
    role: AppRole;
    tenantId?: string;
    roles?: string[];
  }
  interface JWT {
    role?: AppRole;
    tenantId?: string;
    roles?: string[];
  }
}
