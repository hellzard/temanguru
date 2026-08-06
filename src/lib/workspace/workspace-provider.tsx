"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createEmptyWorkspace } from "./defaults";
import { loadLocalWorkspace, saveLocalWorkspace } from "./db";
import type { LocalWorkspace } from "./types";

type WorkspaceContextValue = {
  workspace: LocalWorkspace;
  ready: boolean;
  saving: boolean;
  updateWorkspace: (recipe: (draft: LocalWorkspace) => void) => void;
  replaceWorkspace: (workspace: LocalWorkspace, options?: { touch?: boolean }) => void;
  resetWorkspace: () => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<LocalWorkspace>(() => createEmptyWorkspace());
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const skipInitialSave = useRef(true);

  useEffect(() => {
    let active = true;
    void loadLocalWorkspace().then((stored) => {
      if (!active) return;
      setWorkspace(stored);
      setReady(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (skipInitialSave.current) {
      skipInitialSave.current = false;
      return;
    }
    setSaving(true);
    const timeout = window.setTimeout(() => {
      void saveLocalWorkspace(workspace).finally(() => setSaving(false));
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [ready, workspace]);

  const updateWorkspace = useCallback((recipe: (draft: LocalWorkspace) => void) => {
    setWorkspace((current) => {
      const next = structuredClone(current);
      recipe(next);
      next.updatedAt = new Date().toISOString();
      return next;
    });
  }, []);

  const replaceWorkspace = useCallback((next: LocalWorkspace, options?: { touch?: boolean }) => {
    const cloned = structuredClone(next);
    setWorkspace(options?.touch === false ? cloned : { ...cloned, updatedAt: new Date().toISOString() });
  }, []);

  const resetWorkspace = useCallback(() => setWorkspace(createEmptyWorkspace()), []);

  const value = useMemo(() => ({ workspace, ready, saving, updateWorkspace, replaceWorkspace, resetWorkspace }), [workspace, ready, saving, updateWorkspace, replaceWorkspace, resetWorkspace]);
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace harus dipakai di dalam WorkspaceProvider.");
  return context;
}
