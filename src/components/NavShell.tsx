"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Compass, User } from "lucide-react";

const navItems = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Beastiary", href: "/beastiary", icon: BookOpen },
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "Profile", href: "/profile", icon: User },
];

interface NavShellProps {
  children: React.ReactNode;
}

export default function NavShell({ children }: NavShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop sidebar */}
      <nav
        className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-56 md:border-r md:border-gray-100 md:bg-white md:z-40"
        aria-label="Main navigation"
      >
        <div className="px-6 py-6 mb-4">
          <span className="text-2xl font-bold text-green-500">Scout</span>
        </div>
        <ul className="flex-1 px-3 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-label={label}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-green-50 text-green-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Main content — offset for sidebar on desktop */}
      <main className="flex-1 md:ml-56 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex md:hidden"
        aria-label="Tab bar"
      >
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                active ? "text-green-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
