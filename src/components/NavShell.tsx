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
  userInitial?: string;
}

function UserAvatar({ initial, isProfileActive }: { initial: string; isProfileActive: boolean }) {
  return (
    <Link
      href="/profile"
      aria-label="Profile"
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        background: isProfileActive ? "#2a7a48" : "#e8d8c0",
        border: `2px solid ${isProfileActive ? "#2a7a48" : "rgba(28,46,30,.12)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Syne, sans-serif",
        fontSize: 13,
        fontWeight: 800,
        color: isProfileActive ? "#f5f0e4" : "#6a9a78",
        textDecoration: "none",
        flexShrink: 0,
        transition: "all .15s",
        letterSpacing: ".01em",
      }}
    >
      {initial}
    </Link>
  );
}

export default function NavShell({ children, userInitial = "?" }: NavShellProps) {
  const pathname = usePathname();
  const isProfileActive = pathname.startsWith("/profile");

  return (
    <div style={{ minHeight: "100vh", background: "#f5f0e4", display: "flex", flexDirection: "column", maxWidth: 390, margin: "0 auto" }}>
      {/* Desktop sidebar */}
      <nav
        className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-56 md:z-40"
        style={{ background: "#f5f0e4", borderRight: "1px solid rgba(28,46,30,.06)" }}
        aria-label="Main navigation"
      >
        <div style={{ padding: "24px 24px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: ".07em", textTransform: "uppercase", display: "inline-flex" }}>
            {"SCOUT".split("").map((ch, i) => (
              <span key={i} style={{ display: "inline-block", animation: "dawn-char-in 1.0s ease-out both", animationDelay: `${i * 0.28}s` }}>{ch}</span>
            ))}
          </span>
          <UserAvatar initial={userInitial} isProfileActive={isProfileActive} />
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

      {/* Top nav bar — mobile */}
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
        <span style={{ fontFamily: "Syne, sans-serif", fontSize: 17, fontWeight: 800, letterSpacing: ".07em", textTransform: "uppercase", display: "inline-flex" }}>
          {"SCOUT".split("").map((ch, i) => (
            <span key={i} style={{ display: "inline-block", animation: "dawn-char-in 1.0s ease-out both", animationDelay: `${i * 0.28}s` }}>{ch}</span>
          ))}
        </span>
        <UserAvatar initial={userInitial} isProfileActive={isProfileActive} />
      </div>

      {/* Main content area */}
      <main style={{ flex: 1, paddingBottom: 100 }}>
        {children}
      </main>

      {/* Mobile bottom tab bar — 2 items now, profile moved to avatar */}
      <nav
        className="md:hidden"
        aria-label="Tab bar"
        style={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 4,
          padding: "8px 10px",
          borderRadius: 50,
          background: "rgba(245,240,228,0.55)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.55)",
          boxShadow: "0 8px 32px rgba(28,46,30,0.13), 0 2px 8px rgba(28,46,30,0.07), inset 0 1px 0 rgba(255,255,255,0.5)",
          zIndex: 100,
        }}
      >
        {navItems.map(({ label, href, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "7px 22px",
                borderRadius: 40,
                textDecoration: "none",
                background: active ? "rgba(42,122,72,0.13)" : "transparent",
                transition: "background 0.2s ease, transform 0.15s ease",
                transform: active ? "scale(1)" : "scale(0.94)",
                minWidth: 72,
              }}
            >
              <Icon active={active} />
              <span style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 9,
                fontWeight: 600,
                color: active ? "#2a7a48" : "#a0b8a0",
                letterSpacing: ".06em",
                textTransform: "uppercase",
              }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
