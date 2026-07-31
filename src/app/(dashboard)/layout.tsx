import Link from "next/link";
import { LogoutButton } from "@/components/layout/LogoutButton";

const NAV_LINKS = [
  { href: "/dashboard", label: "Leads" },
  { href: "/dashboard/stats", label: "Stats" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-semibold">Inbound Lead Radar</span>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <LogoutButton />
      </header>
      <main className="flex flex-1 flex-col p-6">{children}</main>
    </div>
  );
}
