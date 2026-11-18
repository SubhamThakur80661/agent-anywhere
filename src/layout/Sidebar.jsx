import { NavLink, useLocation } from "react-router-dom";
import clsx from "clsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import UserMenu from "../components/UserMenu.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "home" },
  { to: "/create", label: "Create Campaign", icon: "plus" },
  { to: "/campaigns", label: "My Campaigns", icon: "folder" },
  { to: "/analytics", label: "Analytics", icon: "chart" },
  { to: "/idea-generator", label: "Idea Generator", icon: "lightbulb" },
  { to: "/settings", label: "Settings", icon: "gear" },
  { to: "/help-support", label: "Help & Support", icon: "help" },
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
  return (
    <aside className="app-sidebar fixed left-0 top-0 h-full w-[260px] flex flex-col z-20 border-r border-[var(--border)]">
      <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">AA</span>
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-[15px] text-[var(--text)]">Agent Anywhere</div>
            <div className="text-xs text-[var(--text-muted)]">Social Media Agent</div>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex-1 overflow-y-auto py-4" aria-label="Main navigation">
        <ul className="px-3 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "nav-active"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text)]"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon name={item.icon} className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <UserMenu />
      </div>
    </aside>
  );
}

export default Sidebar;
