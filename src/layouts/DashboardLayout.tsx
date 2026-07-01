import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiCommand,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiPackage,
  FiX,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui";
import { cx } from "../utils/format";

const navItems = [
  { to: "/", label: "Dashboard", icon: FiGrid },
  { to: "/rooms", label: "Rooms", icon: FiPackage },
  { to: "/bookings", label: "Bookings", icon: FiClipboard },
  { to: "/checkin", label: "Check-In", icon: FiCalendar },
  { to: "/checkout", label: "Check-Out", icon: FiCheckCircle },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();
  return (
    <aside className="flex h-full w-[min(18rem,calc(100vw-1rem))] flex-col overflow-hidden bg-royal-ink text-white shadow-royal">
      <div className="bg-gradient-to-br from-royal-navy via-royal-ink to-slate-950 p-4 sm:p-5">
        <div className="mb-5 flex items-center justify-between sm:mb-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-royal-gold/35 bg-royal-gold/15 text-royal-gold shadow-inner">
              <FiCommand size={21} />
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-wide sm:text-xl">Hotel Desk</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-amber-100 hover:bg-white/10"
              aria-label="Close menu"
            >
              <FiX />
            </button>
          )}
        </div>
        <div className="royal-divider" />
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto bg-royal-ink px-3 py-4 sm:px-4 sm:py-5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              cx(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition",
                isActive
                  ? "bg-white text-royal-navy shadow-soft"
                  : "text-slate-300 hover:bg-white/10 hover:text-white",
              )
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="m-3 rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur sm:m-4">
        <p className="text-sm font-bold text-white">{admin?.name || "Admin"}</p>
        <p className="truncate text-xs text-amber-100/70">{admin?.email}</p>
        <Button
          className="mt-3 w-full !border-white/15 !bg-white/10 !text-white hover:!bg-white/15"
          variant="secondary"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <FiLogOut /> Logout
        </Button>
      </div>
    </aside>
  );
}

export function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { admin } = useAuth();
  return (
    <div className="min-h-screen bg-transparent">
      <div className="hidden fixed inset-y-0 left-0 z-30 lg:block">
        <Sidebar />
      </div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            className="relative h-full"
          >
            <Sidebar onClose={() => setOpen(false)} />
          </motion.div>
        </div>
      )}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-app-border bg-white/85 px-3 shadow-sm backdrop-blur-xl sm:px-4 lg:px-8">
          <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 py-2">
            <button
              className="shrink-0 rounded-xl border border-app-border bg-white p-2 text-royal-navy shadow-sm lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-royal-gold">
                Operations
              </p>
              <h1 className="truncate text-lg font-extrabold tracking-tight text-royal-ink">
                Hotel Management
              </h1>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-3 sm:p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
