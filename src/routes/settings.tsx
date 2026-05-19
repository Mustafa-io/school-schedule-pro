import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card, SectionTitle, Field, Input, Button } from "@/components/ui-bits";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const { state, setState } = useStore();
  const s = state.settings;

  const update = (patch: Partial<typeof s>) =>
    setState((st) => {
      const next = { ...st.settings, ...patch };
      // Resize timetable arrays if periodsPerDay changed
      let timetable = st.timetable;
      if (patch.periodsPerDay && patch.periodsPerDay !== st.settings.periodsPerDay) {
        timetable = {};
        for (const cls of st.classes) {
          timetable[cls.id] = {};
          for (const day of next.workingDays) {
            const prev = st.timetable[cls.id]?.[day] ?? [];
            const arr: (string | null)[] = Array.from({ length: next.periodsPerDay }, (_, i) => prev[i] ?? null);
            timetable[cls.id][day] = arr;
          }
        }
      }
      return { ...st, settings: next, timetable };
    });

  const toggleDay = (d: string) => {
    const has = s.workingDays.includes(d);
    const days = has ? s.workingDays.filter((x) => x !== d) : [...ALL_DAYS.filter((x) => s.workingDays.includes(x) || x === d)];
    update({ workingDays: days });
  };

  return (
    <AppLayout>
      <SectionTitle title="Timetable Settings" description="Define the structure your timetable will use." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-base font-semibold">Global timing</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Periods per day">
              <Input type="number" min={1} max={12} value={s.periodsPerDay}
                onChange={(e) => update({ periodsPerDay: Math.max(1, Math.min(12, +e.target.value || 1)) })} />
            </Field>
            <Field label="Period duration (minutes)">
              <Input type="number" min={15} max={120} value={s.periodDuration}
                onChange={(e) => update({ periodDuration: +e.target.value || 45 })} />
            </Field>
            <Field label="Day start time">
              <Input type="time" value={s.startTime} onChange={(e) => update({ startTime: e.target.value })} />
            </Field>
            <Field label="Break after period #" hint="0 = no break">
              <Input type="number" min={0} max={s.periodsPerDay} value={s.breakAfterPeriod}
                onChange={(e) => update({ breakAfterPeriod: +e.target.value || 0 })} />
            </Field>
            <Field label="Break duration (minutes)">
              <Input type="number" min={0} max={60} value={s.breakDuration}
                onChange={(e) => update({ breakDuration: +e.target.value || 0 })} />
            </Field>
          </div>

          <div className="mt-6">
            <div className="mb-2 text-sm font-medium">Working days</div>
            <div className="flex flex-wrap gap-2">
              {ALL_DAYS.map((d) => {
                const active = s.workingDays.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={
                      "rounded-full px-4 py-1.5 text-sm font-medium transition " +
                      (active ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/70")
                    }
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold">Teacher constraints</h3>
          <p className="mt-1 text-sm text-muted-foreground">Limits enforced when assigning slots.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Max periods / teacher / day">
              <Input type="number" min={1} max={12} value={s.maxPeriodsPerTeacherPerDay}
                onChange={(e) => update({ maxPeriodsPerTeacherPerDay: +e.target.value || 1 })} />
            </Field>
            <Field label="Max periods / teacher / week">
              <Input type="number" min={1} max={60} value={s.maxPeriodsPerTeacherPerWeek}
                onChange={(e) => update({ maxPeriodsPerTeacherPerWeek: +e.target.value || 1 })} />
            </Field>
          </div>
          <div className="mt-6">
            <Button onClick={() => toast.success("Settings saved")}>Save settings</Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
