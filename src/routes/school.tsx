import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card, SectionTitle, Field, Input, Textarea, Button } from "@/components/ui-bits";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { useRef } from "react";

export const Route = createFileRoute("/school")({ component: SchoolPage });

function SchoolPage() {
  const { state, setState } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const onLogo = (file: File) => {
    if (file.size > 1_500_000) { toast.error("Please pick an image under 1.5 MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setState((s) => ({ ...s, school: { ...s.school, logo: String(reader.result) } }));
      toast.success("Logo updated");
    };
    reader.readAsDataURL(file);
  };

  return (
    <AppLayout>
      <SectionTitle title="School Profile" description="This info appears on every exported timetable." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="grid gap-4">
            <Field label="School name">
              <Input
                value={state.school.name}
                onChange={(e) => setState((s) => ({ ...s, school: { ...s.school, name: e.target.value } }))}
                placeholder="Greenwood Public School"
              />
            </Field>
            <Field label="Address">
              <Textarea
                value={state.school.address}
                onChange={(e) => setState((s) => ({ ...s, school: { ...s.school, address: e.target.value } }))}
                placeholder="123 Main Road, City"
              />
            </Field>
          </div>
          <div className="mt-6">
            <Button onClick={() => toast.success("Saved")}>Save changes</Button>
          </div>
        </Card>
        <Card>
          <h3 className="text-base font-semibold">School logo</h3>
          <p className="mt-1 text-xs text-muted-foreground">PNG or JPG, under 1.5 MB.</p>
          <div className="mt-4 grid place-items-center rounded-lg border border-dashed bg-muted/30 p-6">
            {state.school.logo ? (
              <img src={state.school.logo} alt="logo" className="h-32 w-32 rounded-lg object-cover" />
            ) : (
              <div className="grid h-32 w-32 place-items-center rounded-lg bg-primary/10 text-3xl font-bold text-primary">
                {(state.school.name || "S")[0]}
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onLogo(f); }}
          />
          <div className="mt-4 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => fileRef.current?.click()}>Upload</Button>
            {state.school.logo && (
              <Button
                variant="ghost"
                onClick={() => setState((s) => ({ ...s, school: { ...s.school, logo: "" } }))}
              >
                Remove
              </Button>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
