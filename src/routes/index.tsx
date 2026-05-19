import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card, SectionTitle, Button } from "@/components/ui-bits";
import { useStore } from "@/lib/store";
import { School, Settings, Users, CalendarRange, Download } from "lucide-react";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { state } = useStore();
  const stats = [
    { label: "Classes", value: state.classes.length, to: "/classes", icon: Users },
    { label: "Teachers", value: state.teachers.length, to: "/classes", icon: Users },
    { label: "Periods / day", value: state.settings.periodsPerDay, to: "/settings", icon: Settings },
    { label: "Working days", value: state.settings.workingDays.length, to: "/settings", icon: CalendarRange },
  ];

  const steps = [
    { n: 1, title: "Set up school profile", desc: "Add school name, address and logo for exports.", to: "/school", icon: School },
    { n: 2, title: "Configure timetable settings", desc: "Periods per day, working days, teacher limits.", to: "/settings", icon: Settings },
    { n: 3, title: "Add classes & teachers", desc: "Create classes and assign teachers to subjects.", to: "/classes", icon: Users },
    { n: 4, title: "Build the timetable", desc: "Assign teachers to slots — collisions are blocked.", to: "/timetable", icon: CalendarRange },
    { n: 5, title: "Export PDF / Excel", desc: "Download printable timetables for each class.", to: "/export", icon: Download },
  ];

  return (
    <AppLayout>
      <SectionTitle title="Welcome back" description="A simple, beginner-friendly way to plan your school's weekly timetable." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} to={s.to}>
              <Card className="transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</div>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-2 text-3xl font-bold">{s.value}</div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold">Getting started</h3>
          <p className="mt-1 text-sm text-muted-foreground">Follow these steps in order.</p>
          <ol className="mt-5 space-y-3">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.n}>
                  <Link
                    to={s.to}
                    className="group flex items-start gap-4 rounded-lg border bg-card p-4 transition hover:border-primary/40 hover:bg-accent/30"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {s.n}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Icon className="h-4 w-4 text-muted-foreground" /> {s.title}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Quick actions</h3>
          <div className="mt-4 flex flex-col gap-2">
            <Link to="/timetable"><Button className="w-full">Open timetable builder</Button></Link>
            <Link to="/classes"><Button variant="outline" className="w-full">Manage classes & teachers</Button></Link>
            <Link to="/export"><Button variant="outline" className="w-full">Export timetable</Button></Link>
          </div>
          <div className="mt-6 rounded-lg bg-accent/40 p-4 text-sm text-accent-foreground">
            <strong>Tip:</strong> The builder automatically prevents teacher collisions and respects daily / weekly limits.
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
