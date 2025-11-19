import QueryProvider from "@/app/components/Providers/QueryProvider";
import SessionProvider from "@/app/providers/SessionProvider";

export const metadata = {
  title: "Neram Admin Nexus",
  description: "Administrative management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "ui-sans-serif, system-ui, Segoe UI" }}>
        <SessionProvider>
          <QueryProvider>
            <div>{children}</div>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
