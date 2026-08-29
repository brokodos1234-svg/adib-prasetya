"use client";

import { useEffect, useRef, useState } from "react";
import { fetchMaterials, searchMaterials, type MaterialItem } from "@/lib/materials";
import { formatIDR, formatCount } from "@/lib/data";

const STATUS_PILL: Record<string, string> = {
  "CLOSE STO": "pill-green",
  "OPEN STO": "pill-red",
  "BLM PROGRESS": "pill-yellow",
};

export function MaterialSearch() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<MaterialItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function ensureLoaded() {
    if (items || loading) return;
    setLoading(true);
    setError(null);
    fetchMaterials()
      .then((data) => setItems(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }

  const results = items ? searchMaterials(items, query) : [];
  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={boxRef} className="relative mb-4">
      <div className="flex items-center gap-2 rounded-[10px] bg-sidebarSoft px-3 py-2.5 text-[12.5px] text-[#7b8496] focus-within:ring-1 focus-within:ring-white/30">
        <span>🔍</span>
        <input
          type="text"
          value={query}
          placeholder="Cari kode material / part / desc…"
          onFocus={() => {
            setOpen(true);
            ensureLoaded();
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          className="w-full min-w-0 flex-1 bg-transparent text-[12.5px] text-white placeholder:text-[#7b8496] focus:outline-none"
        />
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-96 overflow-y-auto rounded-[10px] bg-white text-body shadow-2xl">
          {loading && <div className="p-3 text-[12.5px] text-muted">Memuat data material…</div>}
          {error && <div className="p-3 text-[12.5px] text-danger">{error}</div>}
          {!loading && !error && items && results.length === 0 && (
            <div className="p-3 text-[12.5px] text-muted">
              Tidak ada material cocok dengan &quot;{query}&quot;.
            </div>
          )}
          {results.map((r, i) => (
            <div
              key={`${r.m}-${r.s}-${i}`}
              className="border-b border-border p-3 last:border-b-0 hover:bg-soft"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-bold text-strong">{r.m}</div>
                  <div className="truncate text-[11.5px] text-muted">{r.d || "—"}</div>
                </div>
                <span className={`pill flex-none ${STATUS_PILL[r.st] ?? "pill-gray"}`}>{r.st || "—"}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted">
                <span>
                  Part: <b className="text-strong">{r.p || "—"}</b>
                </span>
                <span>
                  Site: <b className="text-strong">{r.s || "—"}</b>
                </span>
                <span>
                  Kategori: <b className="text-strong">{r.k || "—"}</b>
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted">
                <span>
                  Qty: <b className="text-strong">{formatCount(r.qs)}</b> / {formatCount(r.qp)} plan
                </span>
                <span>
                  Value STO: <b className="text-strong">Rp{formatIDR(r.vs)}</b>
                </span>
              </div>
            </div>
          ))}
          {results.length >= 20 && (
            <div className="p-2.5 text-center text-[11px] text-muted">
              Menampilkan 20 hasil teratas — perhalus pencarian untuk hasil lebih spesifik.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
