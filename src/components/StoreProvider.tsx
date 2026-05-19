import { useEffect, useState, type ReactNode } from "react";
import { StoreContext, loadState, saveState, type AppState } from "@/lib/store";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<AppState>(() => loadState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStateRaw(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const setState = (updater: (s: AppState) => AppState) => setStateRaw((prev) => updater(prev));

  return <StoreContext.Provider value={{ state, setState }}>{children}</StoreContext.Provider>;
}
