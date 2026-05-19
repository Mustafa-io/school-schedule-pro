import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card, SectionTitle, Field, Select, Button, Empty, Badge } from "@/components/ui-bits";
import {
  useStore,
  buildTimeSlots,
  findTeacherConflict,
  countTeacherDaily,
  countTeacherWeekly,
  findNextAvailableSlot,
} from "@/lib/store";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { X, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/timetable")({ component: TimetablePage });

function TimetablePage() {
  const { state, setState } = useStore();
  const [classId, setClassId] = useState<string>(state.classes[0]?.id ?? "");

  const cls = state.classes.find((c) => c.id === classId);
  const days = state.settings.workingDays;
  const slots = useMemo(() => buildTimeSlots(state.settings), [state.settings]);
  const periods = state.settings.periodsPerDay;

  const ensureGrid = (cid: string) => {
    setState((s) => {
      if (s.timetable[cid] && Object.keys(s.timetable[cid]).length === days.length) return s;
      const grid: Record<string, (string | null)[]> = {};
      for (const d of days) grid[d] = Array(periods).fill(null);
      return { ...s, timetable: { ...s.timetable, [cid]: grid } };
    });
  };

  const assign = (day: string, p: number, teacherId: string) => {
    if (!cls) return;
    if (!teacherId) {
      setState((s) => {
        const grid = { ...s.timetable[cls.id], [day]: [...(s.timetable[cls.id]?.[day] ?? [])] };
        grid[day][p] = null;
        return { ...s, timetable: { ...s.timetable, [cls.id]: grid } };
      });
      return;
    }
    // Conflict checks
    const conflictClass = findTeacherConflict(state.timetable, state.classes, teacherId, day, p, cls.id);
    if (conflictClass) {
      const cc = state.classes.find((c) => c.id === conflictClass);
      const next = findNextAvailableSlot(state.timetable, state.classes, cls.id, teacherId, days, periods);
      toast.error(`Teacher already teaches ${cc?.name} ${cc?.section} at ${day} P${p + 1}.`, {
        description: next ? `Try ${next.day} P${next.period + 1}.` : "No free slot found.",
      });
      return;
    }
    const dayCount = countTeacherDaily(state.timetable, teacherId, day);
    const cur = state.timetable[cls.id]?.[day]?.[p];
    const adjDay = cur === teacherId ? 0 : 1;
    if (dayCount + adjDay > state.settings.maxPeriodsPerTeacherPerDay) {
      return toast.error(`Daily limit reached (${state.settings.maxPeriodsPerTeacherPerDay}/day).`);
    }
    const wkCount = countTeacherWeekly(state.timetable, teacherId);
    if (wkCount + adjDay > state.settings.maxPeriodsPerTeacherPerWeek) {
      return toast.error(`Weekly limit reached (${state.settings.maxPeriodsPerTeacherPerWeek}/week).`);
    }
    setState((s) => {
      const grid = { ...s.timetable[cls.id] };
      grid[day] = [...(grid[day] ?? Array(periods).fill(null))];
      grid[day][p] = teacherId;
      return { ...s, timetable: { ...s.timetable, [cls.id]: grid } };
    });
  };

  const resetClass = () => {
    if (!cls) return;
    if (!confirm(`Clear all slots for ${cls.name} ${cls.section}?`)) return;
    setState((s) => {
      const grid: Record<string, (string | null)[]> = {};
      for (const d of days) grid[d] = Array(periods).fill(null);
      return { ...s, timetable: { ...s.timetable, [cls.id]: grid } };
    });
    toast.success("Timetable cleared");
  };

  if (state.classes.length === 0) {
    return (
      <AppLayout>
        <SectionTitle title="Timetable" />
        <Empty title="Add a class first" description="Go to Classes & Teachers to create one." />
      </AppLayout>
    );
  }

  if (!cls) {
    setTimeout(() => setClassId(state.classes[0].id), 0);
    return null;
  }

  ensureGrid(cls.id);
  const grid = state.timetable[cls.id] ?? {};

  return (
    <AppLayout>
      <SectionTitle title="Timetable Builder" description="Pick a teacher in each slot. Collisions and limits are enforced automatically." />

      <Card className="mb-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <Field label="Class">
            <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
              {state.classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — Section {c.section}</option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end gap-2">
            <Button variant="outline" onClick={resetClass}><RotateCcw className="h-4 w-4" /> Reset</Button>
          </div>
        </div>
      </Card>

      {state.teachers.length === 0 ? (
        <Empty title="No teachers yet" description="Add teachers before building the timetable." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[700px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-muted/40">
                <th className="sticky left-0 z-10 border-b bg-muted/40 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Time
                </th>
                {days.map((d) => (
                  <th key={d} className="border-b px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: periods }).map((_, p) => (
                <tr key={p} className="hover:bg-muted/20">
                  <td className="sticky left-0 z-10 border-b bg-card px-3 py-2 align-top text-xs font-medium text-muted-foreground">
                    <div className="font-semibold text-foreground">P{p + 1}</div>
                    <div>{slots[p]}</div>
                  </td>
                  {days.map((d) => {
                    const teacherId = grid[d]?.[p] ?? "";
                    const teacher = state.teachers.find((t) => t.id === teacherId);
                    return (
                      <td key={d} className="border-b px-2 py-2 align-top">
                        <div className="flex items-stretch gap-1">
                          <Select
                            value={teacherId}
                            onChange={(e) => assign(d, p, e.target.value)}
                            className="h-9 flex-1 text-sm"
                          >
                            <option value="">— Free —</option>
                            {state.teachers.map((t) => (
                              <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                            ))}
                          </Select>
                          {teacher && (
                            <button
                              onClick={() => assign(d, p, "")}
                              className="rounded-md border px-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              title="Clear"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        {teacher && (
                          <div className="mt-1.5 px-1">
                            <Badge tone="success">{teacher.subject}</Badge>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </AppLayout>
  );
}
