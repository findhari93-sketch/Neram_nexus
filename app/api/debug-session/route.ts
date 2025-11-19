import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json(
    {
      session,
      note: "Check session.user.roles - if empty, Azure isn't sending role claims. You need to configure App Roles in the app manifest.",
    },
    { status: 200 }
  );
}
