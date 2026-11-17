import { NavLink, Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import UserMenu from "../components/UserMenu.jsx";

// Slim ink rail on desktop, bottom tab bar on phones. Chat is in the rail:
// it is the main entry point for users with connected platforms.
const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "home" },
  { to: "/chat", label: "Chat", icon: "chat" },
  { to: "/create", label: "Create Campaign", icon: "plus" },
  { to: "/campaigns", label: "My Campaigns", icon: "folder" },
  { to: "/analytics", label: "Analytics", icon: "chart" },
  { to: "/idea-generator", label: "Idea Generator", icon: "lightbulb" },
  { to: "/settings", label: "Settings", icon: "gear" },
  { to: "/help-support", label: "Help & Support", icon: "help" },
];

const mobileItems = [
  { to: "/dashboard", label: "Board", icon: "home" },
  { to: "/chat", label: "Chat", icon: "chat" },
  { to: "/create", label: "Create", icon: "plus", raised: true },
  { to: "/campaigns", label: "Posts", icon: "folder" },
  { to: "/settings", label: "Settings", icon: "gear" },
];

function Icon({ name, className }) {
  const base = "w-5 h-5";
  switch (name) {
    case "home":
      return (
        <svg className={clsx(base, className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5z" />
        </svg>
      );
    case "chat":
      return (
        <svg className={clsx(base, className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a8 8 0 0 1-8 8H4l2.3-2.9A8 8 0 1 1 21 12z" />
          <path d="M8 11h.01M12 11h.01M16 11h.01" strokeLinecap="round" />
        </svg>
      );
    case "plus":
      return (
        <svg className={clsx(base, className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "folder":
      return (
        <svg className={clsx(base, className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
        </svg>
      );
    case "chart":
      return (
        <svg className={clsx(base, className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18" />
          <path d="M7 15v-4M12 19V8M17 19v-8" />
        </svg>
      );
    case "gear":
      return (
        <svg className={clsx(base, className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82L4.21 6.4a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V2a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.39 1.26 1 1.51.18.07.37.1.56.1H21a2 2 0 1 1 0 4h-.09c-.19 0-.38.03-.56.1-.61.25-1 .85-1 1.51z" />
        </svg>
      );
    case "lightbulb":
      return (
        <svg className={clsx(base, className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H15" />
          <path d="M12 17C15.866 17 19 13.866 19 10C19 6.134 15.866 3 12 3C8.134 3 5 6.134 5 10C5 13.866 8.134 17 12 17Z" />
          <path d="M12 17V21" />
        </svg>
      );
    case "help":
      return (
        <svg className={clsx(base, className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </svg>
      );
    default:
      return null;
  }
}

function Sidebar() {
  const { pathname } = useLocation();
  const isActive = (to) => pathname === to || pathname.startsWith(to + "/");

  return (
    <>
      <aside className="app-sidebar fixed left-0 top-0 z-20 hidden h-full w-[76px] flex-col border-r border-[var(--border)] md:flex">
        <div className="flex h-16 items-center justify-center border-b border-[var(--line-on-ink)]">
          <Link to="/dashboard" aria-label="Agent Anywhere home" className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-[var(--signal)] transition-transform duration-200 hover:-translate-y-0.5">
            <span className="font-display text-sm font-bold text-[var(--signal-ink)]">AA</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4" aria-label="Main navigation">
          <ul className="flex flex-col items-center gap-1 px-2">
            {navItems.map((item) => {
              const active = isActive(item.to);
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    title={item.label}
                    aria-label={item.label}
                    className={clsx(
                      "flex h-11 w-11 items-center justify-center rounded-[4px] transition duration-150",
                      active
                        ? "nav-active"
                        : "text-[var(--ink-field-muted)] hover:bg-[var(--hover-on-ink)] hover:text-[var(--ink-field-text)]"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon name={item.icon} className="h-5 w-5" />
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex flex-col items-center gap-3 border-t border-[var(--line-on-ink)] py-4">
          <ThemeToggle />
          <UserMenu compact direction="up" align="left" tone="ink" />
        </div>
      </aside>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--surface)] pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Main navigation"
      >
        <ul className="grid grid-cols-5 items-end">
          {mobileItems.map((item) => {
            const active = isActive(item.to);
            if (item.raised) {
              return (
                <li key={item.to} className="flex justify-center">
                  <NavLink
                    to={item.to}
                    aria-label={item.label}
                    className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-[6px] bg-[var(--signal)] text-[var(--signal-ink)] shadow-[var(--shadow-hard-sm)] transition-transform duration-150 active:translate-y-0"
                  >
                    <Icon name={item.icon} className="h-6 w-6" />
                  </NavLink>
                </li>
              );
            }
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={clsx(
                    "flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold",
                    active ? "text-[var(--text)]" : "text-[var(--text-muted)]"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={clsx(
                      "flex h-9 w-11 items-center justify-center rounded-[4px] transition-colors",
                      active && "nav-active"
                    )}
                  >
                    <Icon name={item.icon} className="h-5 w-5" />
                  </span>
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

export default Sidebar;
