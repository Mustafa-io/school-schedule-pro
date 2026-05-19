import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card, SectionTitle, Field, Input, Button, Empty, Badge } from "@/components/ui-bits";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/classes")({ component: ClassesPage });

function uid() { return Math.random().toString(36).slice(2, 10); }

function ClassesPage() {
  const { state, setState } = useStore();
  const [cName, setCName] = useState("");
  const [cSection, setCSection] = useState("");
  const [tName, setTName] = useState("");
  const [tSubject, setTSubject] = useState("");

  const addClass = () => {
    if (!cName.trim() || !cSection.trim()) return toast.error("Enter class and section");
    const id = uid();
    setState((s) => ({
      ...s,
      classes: [...s.classes, { id, name: cName.trim(), section: cSection.trim().toUpperCase() }],
      timetable: {
        ...s.timetable,
        [id]: Object.fromEntries(
          s.settings.workingDays.map((d) => [d, Array(s.settings.periodsPerDay).fill(null)]),
        ),
      },
    }));
    setCName(""); setCSection("");
    toast.success("Class added");
  };

  const removeClass = (id: string) => {
    if (!confirm("Delete this class and its timetable?")) return;
    setState((s) => {
      const { [id]: _, ...rest } = s.timetable;
      return { ...s, classes: s.classes.filter((c) => c.id !== id), timetable: rest };
    });
  };

  const addTeacher = () => {
    if (!tName.trim() || !tSubject.trim()) return toast.error("Enter name and subject");
    setState((s) => ({ ...s, teachers: [...s.teachers, { id: uid(), name: tName.trim(), subject: tSubject.trim() }] }));
    setTName(""); setTSubject("");
    toast.success("Teacher added");
  };

  const removeTeacher = (id: string) => {
    if (!confirm("Delete this teacher? Their slots will be cleared.")) return;
    setState((s) => {
      const timetable = { ...s.timetable };
      for (const cid of Object.keys(timetable)) {
        for (const d of Object.keys(timetable[cid])) {
          timetable[cid][d] = timetable[cid][d].map((t) => (t === id ? null : t));
        }
      }
      return { ...s, teachers: s.teachers.filter((t) => t.id !== id), timetable };
    });
  };

  return (
    <AppLayout>
      <SectionTitle title="Classes & Teachers" description="Create classes, then add teachers and their subjects." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-base font-semibold">Classes</h3>
          <div className="mt-4 grid grid-cols-[1fr_120px_auto] gap-2">
            <Field label="Class name"><Input value={cName} onChange={(e) => setCName(e.target.value)} placeholder="Class 1" /></Field>
            <Field label="Section"><Input value={cSection} onChange={(e) => setCSection(e.target.value)} placeholder="A" /></Field>
            <div className="flex items-end"><Button onClick={addClass}><Plus className="h-4 w-4" /> Add</Button></div>
          </div>
          <div className="mt-5 space-y-2">
            {state.classes.length === 0 ? (
              <Empty title="No classes yet" description="Add your first class above." />
            ) : (
              state.classes.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border bg-background px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">Section {c.section}</div>
                  </div>
                  <button onClick={() => removeClass(c.id)} className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold">Teachers</h3>
          <div className="mt-4 grid grid-cols-[1fr_1fr_auto] gap-2">
            <Field label="Teacher name"><Input value={tName} onChange={(e) => setTName(e.target.value)} placeholder="Rahul Sharma" /></Field>
            <Field label="Subject"><Input value={tSubject} onChange={(e) => setTSubject(e.target.value)} placeholder="Maths" /></Field>
            <div className="flex items-end"><Button onClick={addTeacher}><Plus className="h-4 w-4" /> Add</Button></div>
          </div>
          <div className="mt-5 space-y-2">
            {state.teachers.length === 0 ? (
              <Empty title="No teachers yet" description="Add teachers and assign a subject to each." />
            ) : (
              state.teachers.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border bg-background px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <Badge>{t.subject}</Badge>
                    </div>
                  </div>
                  <button onClick={() => removeTeacher(t.id)} className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
