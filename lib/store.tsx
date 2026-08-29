"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_RAW, buildBundle, type DashboardRaw, type DashboardBundle } from "@/lib/data";

const STORAGE_KEY = "bss-dashboard-raw-v1";

export interface DashboardMeta {
  source: "default" | "upload";
  fileName?: string;
  uploadedAt?: string; // ISO timestamp
}

interface StoredPayload {
  raw: DashboardRaw;
  fileName: string;
  uploadedAt: string;
}

interface DashboardCtxValue {
  bundle: DashboardBundle;
  meta: DashboardMeta;
  applyUpload: (raw: DashboardRaw, fileName: string) => void;
  resetToDefault: () => void;
}

const DashboardCtx = createContext<DashboardCtxValue | null>(null);

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const [raw, setRaw] = useState<DashboardRaw>(DEFAULT_RAW);
  const [meta, setMeta] = useState<DashboardMeta>({ source: "default" });

  // Hydrate from localStorage on mount (client-only; server always renders the default).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as StoredPayload;
      if (parsed && parsed.raw) {
        setRaw(parsed.raw);
        setMeta({ source: "upload", fileName: parsed.fileName, uploadedAt: parsed.uploadedAt });
      }
    } catch {
      // Corrupt or unavailable storage — silently keep the bundled default.
    }
  }, []);

  const bundle = useMemo(() => buildBundle(raw), [raw]);

  function applyUpload(newRaw: DashboardRaw, fileName: string) {
    const uploadedAt = new Date().toISOString();
    setRaw(newRaw);
    setMeta({ source: "upload", fileName, uploadedAt });
    try {
      const payload: StoredPayload = { raw: newRaw, fileName, uploadedAt };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Storage full/unavailable — data still applies for the current session.
    }
  }

  function resetToDefault() {
    setRaw(DEFAULT_RAW);
    setMeta({ source: "default" });
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  const value: DashboardCtxValue = { bundle, meta, applyUpload, resetToDefault };

  return <DashboardCtx.Provider value={value}>{children}</DashboardCtx.Provider>;
}

export function useDashboardData(): DashboardCtxValue {
  const ctx = useContext(DashboardCtx);
  if (!ctx) {
    throw new Error("useDashboardData must be used within <DashboardDataProvider>");
  }
  return ctx;
}
