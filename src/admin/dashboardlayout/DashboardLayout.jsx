import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../reducers/user";
import {
  getDashboardHome,
  isCounsellor,
  isFranchiseAdmin,
  isPlatformAdmin,
  isSales,
} from "../../utils/roles";

// ── Icons ──────────────────────────────────────────────────────────────────

const LeadsIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ChevronLeftIcon = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const LogoutIcon = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const DaybookIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="14" x2="9" y2="19" />
    <line x1="15" y1="14" x2="15" y2="19" />
  </svg>
);

const FranchiseIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 21h18" />
    <path d="M5 21V7l7-4 7 4v14" />
    <path d="M9 10h.01" />
    <path d="M15 10h.01" />
    <path d="M12 21v-5" />
  </svg>
);

const CarrierIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </svg>
);

const UsersIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="3.5" />
    <path d="M20 8v6" />
    <path d="M17 11h6" />
  </svg>
);

// ── Nav config ──────────────────────────────────────────────────────────────

const counsellorNavItems = [
  {
    path: "/counsellor/dashboard",
    label: "Dashboard",
    icon: DaybookIcon,
    end: true,
  },
  {
    path: "/counsellor/dashboard/assigned-users",
    label: "Assigned users",
    icon: UsersIcon,
    end: false,
  },
  {
    path: "/counsellor/dashboard/sessions",
    label: "Sessions",
    icon: LeadsIcon,
    end: false,
  },
];

const salesNavItems = [
  {
    path: "/sales/dashboard/enquiries",
    label: "Enquiries",
    icon: LeadsIcon,
    end: false,
  },
];

const franchiseAdminNavItems = [
  {
    path: "/franchise-admin/dashboard/team",
    label: "Team",
    icon: UsersIcon,
    end: false,
  },
  {
    path: "/franchise-admin/dashboard/enquiries",
    label: "Enquiries",
    icon: LeadsIcon,
    end: false,
  },
  {
    path: "/franchise-admin/dashboard/carriers",
    label: "Carriers",
    icon: CarrierIcon,
    end: false,
  },
];

const adminNavItems = [
  {
    path: "/admin/dashboard/questionaries",
    label: "Questionaries",
    icon: DaybookIcon,
    end: false,
  },
  {
    path: "/admin/dashboard/enquiries",
    label: "Enquiries",
    icon: LeadsIcon,
    end: false,
  },
  {
    path: "/admin/dashboard/franchise",
    label: "Franchise",
    icon: FranchiseIcon,
    end: false,
  },
  {
    path: "/admin/dashboard/carriers",
    label: "Carriers",
    icon: CarrierIcon,
    end: false,
  },
  {
    path: "/admin/dashboard/users",
    label: "Users",
    icon: UsersIcon,
    end: false,
  },
];

// ── Avatar ─────────────────────────────────────────────────────────────────

function Avatar({ name, size = 32 }) {
  const initial = name ? String(name).trim().charAt(0).toUpperCase() : "A";
  return (
    <div
      className="rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #7c6fcd, #5ab99c)",
      }}
    >
      {initial}
    </div>
  );
}

// ── Sidebar NavLink ────────────────────────────────────────────────────────

function SidebarNavItem({ path, label, icon: Icon, end, collapsed }) {
  return (
    <NavLink
      to={path}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-[10px] cursor-pointer transition-all duration-150",
          "text-white/70 font-medium text-sm no-underline whitespace-nowrap w-full",
          collapsed ? "justify-center p-[10px]" : "px-3.5 py-2.5",
          isActive
            ? "bg-white/20 text-white [&_svg]:stroke-white"
            : "hover:bg-white/10 hover:text-white",
        ].join(" ")
      }
    >
      <Icon size={18} />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

// ── Bottom NavLink ─────────────────────────────────────────────────────────

function BottomNavItem({ path, label, icon: Icon, end }) {
  return (
    <NavLink
      to={path}
      end={end}
      className={({ isActive }) =>
        [
          "flex flex-col items-center justify-center gap-1 flex-1 py-2 px-1",
          "no-underline text-[10px] font-semibold tracking-wide transition-colors duration-150",
          "font-sans",
          isActive
            ? "text-[#5eead4] [&_svg]:stroke-[#5eead4]"
            : "text-white/70",
        ].join(" ")
      }
    >
      <Icon size={22} />
      {label}
    </NavLink>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { name, role } = useSelector((state) => state.user.value);
  const navItems = isFranchiseAdmin(role)
    ? franchiseAdminNavItems
    : isSales(role)
      ? salesNavItems
      : isCounsellor(role)
        ? counsellorNavItems
        : adminNavItems;
  const dashboardTitle = isFranchiseAdmin(role)
    ? "Franchise Admin"
    : isSales(role)
      ? "Sales"
      : isCounsellor(role)
        ? "Counsellor"
        : "Admin Dashboard";
  const roleLabel = isFranchiseAdmin(role)
    ? "FRANCHISE ADMIN"
    : isSales(role)
      ? "SALES"
      : isCounsellor(role)
        ? "COUNSELLOR"
        : isPlatformAdmin(role)
          ? "ADMIN"
          : role
            ? String(role).toUpperCase()
            : "USER";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#0a1f14] text-white">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#0a1f14] via-[#0f2e1a] to-[#0d2416]" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-cyan-500/8 blur-3xl" />
        <div className="absolute bottom-20 left-10 h-80 w-80 rounded-full bg-amber-600/10 blur-3xl" />
      </div>
      {/* ══ DESKTOP SIDEBAR ══ */}
      {!isMobile && (
        <aside
          className="relative z-10 h-screen border-r border-white/15 bg-white/10 backdrop-blur-xl flex flex-col shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out"
          style={{ width: collapsed ? "64px" : "220px" }}
        >
          {/* Logo + toggle */}
          <div
            className={[
              "flex items-center gap-2 pb-4 border-b border-white/15 mb-2 px-1 pt-1",
              collapsed ? "justify-center" : "justify-between",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-[8px] shrink-0"
                style={{
                  background: "linear-gradient(135deg, #c9a86c, #5eead4)",
                }}
              />
              {!collapsed && (
                <span className="text-[15px] font-bold text-white font-serif tracking-[-0.01em]">
                  {dashboardTitle}
                </span>
              )}
            </div>
            <button
              onClick={() => setCollapsed((c) => !c)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="flex items-center justify-center w-7 h-7 rounded-[8px] border border-white/20 bg-white/10 text-white/80 shrink-0 cursor-pointer transition-colors duration-150 hover:bg-white/20"
              style={{
                transform: collapsed ? "rotate(180deg)" : "none",
                transition: "background 0.15s, transform 0.25s",
              }}
            >
              <ChevronLeftIcon />
            </button>
          </div>

          {/* Nav links (role-based) */}
          <nav className="flex-1 flex flex-col gap-0.5 px-1">
            {navItems.map(({ path, label, icon, end }) => (
              <SidebarNavItem
                key={path}
                path={path}
                label={label}
                icon={icon}
                end={end}
                collapsed={collapsed}
              />
            ))}
          </nav>

          {/* User card */}
          <div className="px-1 pt-1 mb-3">
            {!collapsed ? (
              <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 p-3">
                <Avatar name={name} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {name || "User"}
                  </div>
                  <div className="text-[11px] text-white/70 truncate">
                    {roleLabel}
                  </div>
                </div>
                <button
                  type="button"
                  title="Logout"
                  onClick={handleLogout}
                  className="flex items-center justify-center h-7 w-7 shrink-0 cursor-pointer rounded-[8px] border-none bg-red-500/20 text-red-200 transition-colors duration-150 hover:bg-red-500/30"
                >
                  <LogoutIcon size={14} />
                </button>
              </div>
            ) : (
              <div className="flex justify-center pt-1">
                <Avatar name={name} />
              </div>
            )}
          </div>
        </aside>
      )}

      {/* ══ MAIN CONTENT ══ */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-white/15 bg-white/10 px-6 backdrop-blur-xl xl:h-[68px] xl:px-8">
          {isMobile ? (
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-white font-serif tracking-[-0.01em] xl:text-[17px]">
                {dashboardTitle}
              </span>
            </div>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-3">
            <Avatar name={name} />
            <button
              type="button"
              onClick={handleLogout}
              className="flex cursor-pointer items-center gap-1.5 rounded-[10px] border-none bg-red-500/20 px-3 py-1.5 text-[12px] font-semibold text-red-200 transition-colors duration-150 hover:bg-red-500/30"
            >
              <LogoutIcon size={14} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Scrollable page content */}
        <main
          className="flex-1 overflow-y-auto p-7 [scrollbar-width:thin] [scrollbar-color:#5eead4_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-[#5eead4] xl:p-9"
          style={{ paddingBottom: isMobile ? "90px" : "28px" }}
        >
          <Outlet />
        </main>
      </div>

      {/* ══ MOBILE BOTTOM NAV ══ */}
      {isMobile && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center border-t border-white/15 bg-[rgba(15,46,26,0.85)] backdrop-blur-md"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {navItems.map(({ path, label, icon, end }) => (
            <BottomNavItem
              key={path}
              path={path}
              label={label}
              icon={icon}
              end={end}
            />
          ))}
        </nav>
      )}
    </div>
  );
}
