import { Link } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Footer from "../components/ui/Footer.jsx";
import { useAuthStore } from "../store/authStore.js";

function AppLayout({ children }) {
  const isGuest = useAuthStore((state) => state.isGuest);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main id="main" className="flex-1 ml-[260px] relative" role="main">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 py-6">
          {isGuest && (
            <div className="guest-banner mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm">
              <p>
                You&apos;re browsing as a guest. Connecting accounts and publishing are disabled in guest mode.
              </p>
              <Link to="/register" className="font-medium text-[var(--primary)] hover:underline">
                Create a free account
              </Link>
            </div>
          )}
          <div className="animate-slide-in flex flex-col min-h-[calc(100vh-8rem)]">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}

export default AppLayout;
