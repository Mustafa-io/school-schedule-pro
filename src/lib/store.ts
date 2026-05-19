import { createContext, useContext } from "react";

export type School = {
  name: string;
  address: string;
  logo: string; // data URL
};

export type Settings = {
  periodsPerDay: number;
  workingDays: string[]; // ["Mon", "Tue", ...]
  periodDuration: number; // minutes
  startTime: string; // "08:00"
  breakAfterPeriod: number; // index 1-based, 0 = no break
  breakDuration: number;
  maxPeriodsPerTeacherPerDay: number;
  maxPeriodsPerTeacherPerWeek: number;
};

export type ClassDef = {
  id: string;
  name: string; // "Class 1"
  section: string; // "A"
};

export type Teacher = {
  id: string;
  name: string;
  subject: string;
};

// timetable[classId][day][periodIndex] = teacherId | null
export type Timetable = Record<string, Record<string, (string | null)[]>>;

export type AppState = {
  school: School;
  settings: Settings;
  classes: ClassDef[];
  teachers: Teacher[];
  timetable: Timetable;
};

export const defaultState: AppState = {
  school: { name: "My School", address: "", logo: "" },
  settings: {
    periodsPerDay: 7,
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    periodDuration: 45,
    startTime: "08:00",
    breakAfterPeriod: 3,
    breakDuration: 20,
    maxPeriodsPerTeacherPerDay: 6,
    maxPeriodsPerTeacherPerWeek: 30,
  },
  classes: [],
  teachers: [],
  timetable: {},
};

const STORAGE_KEY = "school-timetable-v1";

export function loadState(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed, settings: { ...defaultState.settings, ...parsed.settings }, school: { ...defaultState.school, ...parsed.school } };
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export type StoreCtx = {
  state: AppState;
  setState: (updater: (s: AppState) => AppState) => void;
};

export const StoreContext = createContext<StoreCtx | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

// Time slot label builder
export function buildTimeSlots(settings: Settings): string[] {
  const slots: string[] = [];
  const [h, m] = settings.startTime.split(":").map(Number);
  let cur = h * 60 + m;
  for (let i = 0; i < settings.periodsPerDay; i++) {
    const start = cur;
    cur += settings.periodDuration;
    const end = cur;
    const fmt = (t: number) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
    slots.push(`${fmt(start)} - ${fmt(end)}`);
    if (settings.breakAfterPeriod && i + 1 === settings.breakAfterPeriod) {
      cur += settings.breakDuration;
    }
  }
  return slots;
}

// Conflict detection: returns conflicting classId if teacher is already assigned at day/period in another class
export function findTeacherConflict(
  timetable: Timetable,
  classes: ClassDef[],
  teacherId: string,
  day: string,
  periodIdx: number,
  exceptClassId: string,
): string | null {
  for (const c of classes) {
    if (c.id === exceptClassId) continue;
    const t = timetable[c.id]?.[day]?.[periodIdx];
    if (t === teacherId) return c.id;
  }
  return null;
}

export function countTeacherDaily(timetable: Timetable, teacherId: string, day: string): number {
  let n = 0;
  for (const classId of Object.keys(timetable)) {
    const arr = timetable[classId]?.[day] ?? [];
    for (const t of arr) if (t === teacherId) n++;
  }
  return n;
}

export function countTeacherWeekly(timetable: Timetable, teacherId: string): number {
  let n = 0;
  for (const classId of Object.keys(timetable)) {
    for (const day of Object.keys(timetable[classId] ?? {})) {
      for (const t of timetable[classId][day]) if (t === teacherId) n++;
    }
  }
  return n;
}

export function findNextAvailableSlot(
  timetable: Timetable,
  classes: ClassDef[],
  classId: string,
  teacherId: string,
  days: string[],
  periodsPerDay: number,
): { day: string; period: number } | null {
  for (const day of days) {
    for (let p = 0; p < periodsPerDay; p++) {
      const occupied = timetable[classId]?.[day]?.[p];
      if (occupied) continue;
      if (!findTeacherConflict(timetable, classes, teacherId, day, p, classId)) {
        return { day, period: p };
      }
    }
  }
  return null;
}
