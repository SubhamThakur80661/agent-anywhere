import { Link } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Footer from "../components/ui/Footer.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import UserMenu from "../components/UserMenu.jsx";
import { useAuthStore } from "../store/authStore.js";

function AppLayout({ children }) {
  const isGuest = useAuthStore((state) => state.isGuest);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col md:ml-[76px]">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg)] px-4 py-3 md:hidden">
          <Link to="/dashboard" className="flex items-center gap-2.5" aria-label="Agent Anywhere home">
            <span className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-[var(--text)]">
              <span className="font-display text-xs font-bold text-[var(--bg)]">AA</span>
            </span>
            <span className="font-display text-[15px] font-bold tracking-tight text-[var(--text)]">
              Agent Anywhere
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu compact direction="down" align="right" />
          </div>
        </header>

        <main id="main" className="relative flex-1" role="main">
          <div className="mx-auto max-w-screen-2xl px-4 py-6 pb-28 sm:px-6 md:pb-6 lg:px-8">
            {isGuest && (
              <div className="guest-banner mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[4px] border px-4 py-3 text-sm font-medium">
                <p>
                  You&apos;re browsing as a guest. Connecting accounts and publishing are disabled in guest mode.
                </p>
                <Link to="/register" className="font-bold underline underline-offset-4">
                  Create a free account
                </Link>
              </div>
            )}
            <div className="animate-slide-in flex min-h-[calc(100vh-8rem)] flex-col">
              <div className="flex-1">
                {children}
              </div>
              <Footer />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
