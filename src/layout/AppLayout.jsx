import Sidebar from "./Sidebar.jsx";
import Footer from "../components/ui/Footer.jsx";
import CalendarPicker from "../components/ui/CalendarPicker.jsx";
import { useAuthStore } from "../store/authStore.js";

function AppLayout({ children }) {
  const isGuest = useAuthStore((state) => state.isGuest);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main id="main" className="flex-1 ml-[280px] relative" role="main">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 py-6">

          {isGuest && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
              <p>
                You&apos;re browsing as a guest. Connecting accounts and publishing are disabled in guest mode.
              </p>
              <a href="/register" className="font-medium underline underline-offset-2">Create a free account</a>
            </div>
          )}

          {/* Glass morphism content wrapper */}
          <div className="glass rounded-3xl p-6 md:p-8 min-h-[calc(100vh-8rem)] animate-slide-in flex flex-col">
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


