import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, ButtonHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-card p-5 shadow-sm md:p-6", className)}>{children}</div>
  );
}

export function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-foreground">
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-lg border bg-background px-3 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20",
        props.className,
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-[80px] w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20",
        props.className,
      )}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-10 w-full rounded-lg border bg-background px-3 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20",
        props.className,
      )}
    />
  );
}

type BtnVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  const variants: Record<BtnVariant, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border bg-background hover:bg-muted",
    ghost: "hover:bg-muted",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Empty({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed bg-muted/30 p-10 text-center">
      <p className="text-base font-semibold">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "success" | "warning" | "danger" }) {
  const tones = {
    default: "bg-muted text-muted-foreground",
    success: "bg-success/15 text-success-foreground",
    warning: "bg-warning/20 text-warning-foreground",
    danger: "bg-destructive/15 text-destructive",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone])}>{children}</span>;
}
