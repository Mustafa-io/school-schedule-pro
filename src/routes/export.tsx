import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card, SectionTitle, Field, Select, Button, Empty } from "@/components/ui-bits";
import { useStore, buildTimeSlots } from "@/lib/store";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FileDown, FileSpreadsheet, Printer } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/export")({ component: ExportPage });

function ExportPage() {
  const { state } = useStore();
  const [classId, setClassId] = useState<string>(state.classes[0]?.id ?? "");
  const cls = state.classes.find((c) => c.id === classId);
  const days = state.settings.workingDays;
  const slots = useMemo(() => buildTimeSlots(state.settings), [state.settings]);
  const periods = state.settings.periodsPerDay;

  const buildRows = () => {
    if (!cls) return [];
    return Array.from({ length: periods }).map((_, p) => {
      const row: string[] = [`P${p + 1}\n${slots[p]}`];
      for (const d of days) {
        const tid = state.timetable[cls.id]?.[d]?.[p];
        const t = state.teachers.find((x) => x.id === tid);
        row.push(t ? `${t.subject}\n${t.name}` : "—");
      }
      return row;
    });
  };

  const exportPDF = () => {
    if (!cls) return;
    const doc = new jsPDF({ orientation: "landscape" });
    const pageW = doc.internal.pageSize.getWidth();
    let cursorY = 12;

    if (state.school.logo) {
      try { doc.addImage(state.school.logo, "PNG", 12, 8, 18, 18); } catch {}
    }
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(state.school.name || "School", pageW / 2, 14, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (state.school.address) doc.text(state.school.address, pageW / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`${cls.name} — Section ${cls.section} Timetable`, pageW / 2, 28, { align: "center" });
    cursorY = 34;

    autoTable(doc, {
      startY: cursorY,
      head: [["Time", ...days]],
      body: buildRows(),
      styles: { fontSize: 9, cellPadding: 3, valign: "middle", halign: "center" },
      headStyles: { fillColor: [37, 116, 138], textColor: 255 },
      columnStyles: { 0: { fontStyle: "bold", halign: "left" } },
      theme: "grid",
    });

    doc.save(`${cls.name}-${cls.section}-timetable.pdf`);
    toast.success("PDF downloaded");
  };

  const exportExcel = () => {
    if (!cls) return;
    const header = [
      [state.school.name || "School"],
      [state.school.address || ""],
      [`${cls.name} — Section ${cls.section} Timetable`],
      [],
      ["Time", ...days],
    ];
    const rows = buildRows();
    const aoa = [...header, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 18 }, ...days.map(() => ({ wch: 22 }))];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${cls.name} ${cls.section}`);
    XLSX.writeFile(wb, `${cls.name}-${cls.section}-timetable.xlsx`);
    toast.success("Excel downloaded");
  };

  if (state.classes.length === 0) {
    return (
      <AppLayout>
        <SectionTitle title="Export" />
        <Empty title="No classes to export" description="Create a class and build its timetable first." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SectionTitle title="Export Timetable" description="Download a printable timetable for any class." />

      <Card className="no-print mb-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto_auto]">
          <Field label="Class">
            <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
              {state.classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — Section {c.section}</option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end"><Button onClick={exportPDF}><FileDown className="h-4 w-4" /> PDF</Button></div>
          <div className="flex items-end"><Button variant="outline" onClick={exportExcel}><FileSpreadsheet className="h-4 w-4" /> Excel</Button></div>
          <div className="flex items-end"><Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button></div>
        </div>
      </Card>

      {cls && (
        <Card>
          <div className="mb-4 flex items-center gap-4 border-b pb-4">
            {state.school.logo && <img src={state.school.logo} alt="" className="h-14 w-14 rounded-lg object-cover" />}
            <div>
              <div className="text-xl font-bold">{state.school.name || "School"}</div>
              {state.school.address && <div className="text-sm text-muted-foreground">{state.school.address}</div>}
              <div className="mt-1 text-sm font-semibold">{cls.name} — Section {cls.section} Timetable</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="border px-3 py-2 text-left">Time</th>
                  {days.map((d) => <th key={d} className="border px-3 py-2 text-left">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: periods }).map((_, p) => (
                  <tr key={p} className="even:bg-muted/30">
                    <td className="border px-3 py-2 align-top">
                      <div className="font-semibold">P{p + 1}</div>
                      <div className="text-xs text-muted-foreground">{slots[p]}</div>
                    </td>
                    {days.map((d) => {
                      const tid = state.timetable[cls.id]?.[d]?.[p];
                      const t = state.teachers.find((x) => x.id === tid);
                      return (
                        <td key={d} className="border px-3 py-2 align-top">
                          {t ? (
                            <>
                              <div className="font-semibold">{t.subject}</div>
                              <div className="text-xs text-muted-foreground">{t.name}</div>
                            </>
                          ) : <span className="text-muted-foreground">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AppLayout>
  );
}
