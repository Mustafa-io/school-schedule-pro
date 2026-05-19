import { Link, useRouterState, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, School, Settings, Users, CalendarRange, Download, Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/school", label: "School Profile", icon: School },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/classes", label: "Classes & Teachers", icon: Users },
  { to: "/timetable", label: "Timetable", icon: CalendarRange },
  { to: "/export", label: "Export", icon: Download },
];

export function AppLayout({ children }: { children?: ReactNode }) {
  const { state } = useStore();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const SidebarInner = (
    <nav className="flex h-full flex-col gap-1 p-3">
      <div className="mb-4 flex items-center gap-3 px-2 py-3">
        {state.school.logo ? (
          <img src={state.school.logo} alt="logo" className="h-10 w-10 rounded-lg object-cover ring-1 ring-border" />
        ) : (
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground font-bold">
            {(state.school.name || "S")[0]}
          </div>
        )}
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{state.school.name || "My School"}</div>
          <div className="text-xs text-muted-foreground">Timetable Admin</div>
        </div>
      </div>
      {nav.map((item) => {
        const Icon = item.icon;
        const active = path === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
      <div className="mt-auto px-3 py-4 text-xs text-muted-foreground">
        Data is saved locally in your browser.
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar md:block">{SidebarInner}</aside>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 border-r bg-sidebar">{SidebarInner}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur md:px-6">
          <button
            className="grid h-9 w-9 place-items-center rounded-md border md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <h1 className="text-sm font-semibold tracking-tight md:text-base">
            {state.school.name || "School Timetable"}
          </h1>
        </header>
        <main className="flex-1 p-4 md:p-8">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
