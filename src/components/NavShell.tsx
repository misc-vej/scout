"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

function IconNearby({ active }: { active: boolean }) {
  const s = active ? "#2a7a48" : "#a0b8a0";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="10" r="3.5" stroke={s} strokeWidth="1.7"/>
      <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8z" stroke={s} strokeWidth="1.7" fill="none"/>
    </svg>
  );
}

function IconLogbook({ active }: { active: boolean }) {
  const s = active ? "#2a7a48" : "#a0b8a0";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke={s} strokeWidth="1.7"/>
      <rect x="13" y="3" width="8" height="8" rx="1.5" stroke={s} strokeWidth="1.7"/>
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke={s} strokeWidth="1.7"/>
      <rect x="13" y="13" width="8" height="8" rx="1.5" stroke={s} strokeWidth="1.7"/>
    </svg>
  );
}

const navItems = [
  { label: "Nearby", href: "/discover", Icon: IconNearby },
  { label: "Logbook", href: "/beastiary", Icon: IconLogbook },
];

interface NavShellProps {
  children: React.ReactNode;
}

export default function NavShell({ children }: NavShellProps) {
  const pathname = usePathname();

  return (
    <div style={{ minHeight: "100vh", background: "#f5f0e4", display: "flex", flexDirection: "column", maxWidth: 390, margin: "0 auto" }}>
      {/* Desktop sidebar */}
      <nav
        className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-56 md:z-40"
        style={{ background: "#f5f0e4", borderRight: "1px solid rgba(28,46,30,.06)" }}
        aria-label="Main navigation"
      >
        <div style={{ padding: "24px 24px 16px" }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "#1c2e1e", letterSpacing: ".07em", textTransform: "uppercase" }}>
            SCOUT
          </span>
        </div>
        <ul style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map(({ label, href, Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-label={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: "Outfit, sans-serif",
                    background: active ? "rgba(42,122,72,.1)" : "transparent",
                    color: active ? "#2a7a48" : "#a0b8a0",
                    transition: "color 0.15s, background 0.15s",
                  }}
                >
                  <Icon active={active} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Top nav bar — mobile (hidden on desktop via md:hidden equivalent) */}
      <div
        className="md:hidden"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: 56,
          background: "#f5f0e4",
          borderBottom: "1px solid rgba(28,46,30,.06)",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <span style={{ fontFamily: "Syne, sans-serif", fontSize: 17, fontWeight: 800, color: "#1c2e1e", letterSpacing: ".07em", textTransform: "uppercase" }}>
          SCOUT
        </span>
      </div>

      {/* Main content area */}
      <main style={{ flex: 1, paddingBottom: 80 }}>
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden"
        aria-label="Tab bar"
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 390,
          background: "linear-gradient(to top,#f5f0e4 65%,rgba(245,240,228,0))",
          padding: "8px 0 20px",
          display: "flex",
          justifyContent: "space-around",
          zIndex: 40,
        }}
      >
        {navItems.map(({ label, href, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              style={{ textAlign: "center", cursor: "pointer", minWidth: 80, padding: "4px 0", textDecoration: "none" }}
            >
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Icon active={active} />
              </div>
              <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 9, fontWeight: 600, color: active ? "#2a7a48" : "#a0b8a0", marginTop: 4, letterSpacing: ".06em", textTransform: "uppercase" }}>
                {label}
              </div>
              {active && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#2a7a48", margin: "3px auto 0" }} />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
