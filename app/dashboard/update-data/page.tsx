"use client";

import { useRef, useState } from "react";
import { HeroStat } from "@/components/HeroStat";
import { useDashboardData } from "@/lib/store";
import { buildBundle, formatCompactIDR, formatCount, formatPct, type DashboardRaw } from "@/lib/data";
import { parseWorkbookFile, WorkbookParseError } from "@/lib/parseWorkbook";
import { rawToTsLiteral } from "@/lib/exportCode";

const EXPECTED_FILENAME = "Plan Reduce Inventory Bayan.xlsx";

type PendingState =
  | { status: "idle" }
  | { status: "reading"; fileName: string }
  | { status: "error"; fileName: string; message: string }
  | { status: "ready"; fileName: string; raw: DashboardRaw; warnings: string[] };

export default function UpdateDataPage() {
  const { bundle, meta, applyUpload, resetToDefault } = useDashboardData();
  const [pending, setPending] = useState<PendingState>({ status: "idle" });
  const [dragOver, setDragOver] = useState(false);
  const [applied, setApplied] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setApplied(false);
    setPending({ status: "reading", fileName: file.name });
    try {
      const result = await parseWorkbookFile(file, bundle);
      setPending({ status: "ready", fileName: file.name, raw: result.raw, warnings: result.warnings });
    } catch (err) {
      const message = err instanceof WorkbookParseError ? err.message : "Gagal memproses file. Coba lagi.";
      setPending({ status: "error", fileName: file.name, message });
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onApply() {
    if (pending.status !== "ready") return;
    applyUpload(pending.raw, pending.fileName);
    setApplied(true);
  }

  async function onCopyCode() {
    const code = rawToTsLiteral(bundle);
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("failed");
    }
  }

  const previewBundle = pending.status === "ready" ? buildBundle(pending.raw) : null;
  const filenameMismatch =
    (pending.status === "ready" || pending.status === "error" || pending.status === "reading") &&
    pending.fileName.replace(/\.xlsx$/i, "").trim().toLowerCase() !==
      EXPECTED_FILENAME.replace(/\.xlsx$/i, "").trim().toLowerCase();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3.5 px-4 py-5 sm:px-7">
        <div>
          <div className="text-xl font-extrabold text-strong sm:text-[22px]">Update Data</div>
          <div className="mt-0.5 text-[12.5px] text-muted">
            Unggah workbook &quot;{EXPECTED_FILENAME}&quot; terbaru untuk memperbarui seluruh dashboard
          </div>
        </div>
      </div>

      <div className="px-4 pb-8 sm:px-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-5 rounded-lg2 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f766e] px-6 py-6 text-white sm:px-7">
          <div>
            <h2 className="mb-3 text-xl font-extrabold sm:text-2xl">Perbarui data setiap hari, tanpa deploy ulang</h2>
            <div className="flex flex-wrap gap-6">
              <HeroStat value={formatCount(bundle.totalItems)} label="Item aktif saat ini" />
              <HeroStat value={bundle.period} label="Periode aktif" />
              <HeroStat value={bundle.asOfLabel} label="Data per" />
            </div>
          </div>
          <div className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-white/10 text-3xl">
            ⭯
          </div>
        </div>

        {/* How it works */}
        <div className="card mb-4">
          <div className="mb-3 text-base font-extrabold text-strong">Cara kerja</div>
          <ol className="list-decimal space-y-1.5 pl-5 text-[13px] leading-relaxed text-body">
            <li>
              Setiap hari, ekspor ulang <b>{EXPECTED_FILENAME}</b> dari sumbernya dengan sheet{" "}
              <b>DASHBOARD, DAILY, Review STO, TIMELINE</b> tetap bernama sama.
            </li>
            <li>Unggah file tersebut di bawah ini — semua parsing terjadi di browser, tidak ada file yang dikirim ke server manapun.</li>
            <li>Periksa ringkasan hasil baca (jumlah item, kategori, achievement) sebelum diterapkan.</li>
            <li>
              Klik <b>Terapkan ke Dashboard</b> — Overview, Kategori Program, Breakdown Site, Dead Stock, dan Timeline
              langsung memakai data baru.
            </li>
          </ol>
          <div className="mt-3.5 rounded-md2 bg-[#fef1da] p-3.5 text-[12.5px] leading-relaxed text-[#7c5a0a]">
            <b>Penting:</b> aplikasi ini adalah situs statis tanpa database — &quot;Terapkan&quot; menyimpan data di
            penyimpanan lokal browser ini saja (localStorage), jadi hanya terlihat di perangkat/browser yang sama.
            Agar pembaruan terlihat oleh semua orang secara permanen, gunakan tombol{" "}
            <b>&quot;Salin kode lib/data.ts&quot;</b> di bawah, tempelkan ke file <code>lib/data.ts</code> pada
            source code, lalu deploy ulang.
          </div>
        </div>

        {/* Upload zone */}
        <div className="card mb-4">
          <div className="mb-3 text-base font-extrabold text-strong">Unggah Workbook</div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md2 border-2 border-dashed px-6 py-10 text-center transition ${
              dragOver ? "border-accent bg-accent-soft" : "border-border bg-soft hover:border-accent"
            }`}
          >
            <div className="text-3xl">📄</div>
            <div className="text-sm font-bold text-strong">Tarik &amp; lepas file .xlsx di sini, atau klik untuk memilih</div>
            <div className="text-xs text-muted">Nama file yang diharapkan: {EXPECTED_FILENAME}</div>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
          </div>

          {pending.status === "reading" && (
            <div className="mt-4 text-sm font-semibold text-muted">Membaca &amp; memvalidasi &quot;{pending.fileName}&quot;…</div>
          )}

          {pending.status === "error" && (
            <div className="mt-4 rounded-md2 border border-danger-soft bg-danger-soft/40 p-3.5 text-[13px] text-danger">
              <b>Gagal memproses &quot;{pending.fileName}&quot;:</b> {pending.message}
            </div>
          )}

          {pending.status === "ready" && previewBundle && (
            <div className="mt-4">
              {filenameMismatch && (
                <div className="mb-3 rounded-md2 border border-warning-soft bg-warning-soft/40 p-3 text-[12.5px] text-warning">
                  Nama file &quot;{pending.fileName}&quot; berbeda dari yang diharapkan ({EXPECTED_FILENAME}). Tetap bisa
                  diterapkan jika Anda yakin isinya benar.
                </div>
              )}

              {pending.warnings.length > 0 && (
                <div className="mb-3 rounded-md2 border border-warning-soft bg-warning-soft/40 p-3.5 text-[12.5px] leading-relaxed text-warning">
                  <b>Peringatan saat membaca file:</b>
                  <ul className="mt-1.5 list-disc pl-4">
                    {pending.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-3.5 text-sm font-bold text-strong">Pratinjau hasil baca — &quot;{pending.fileName}&quot;</div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <PreviewStat label="Periode" value={previewBundle.period} />
                <PreviewStat label="Data per" value={previewBundle.asOfLabel} />
                <PreviewStat label="Total Item" value={formatCount(previewBundle.totalItems)} />
                <PreviewStat label="Achievement" value={formatPct(previewBundle.achievementPct)} />
                <PreviewStat label="Total Rencana" value={formatCompactIDR(previewBundle.totalPlanValue)} />
                <PreviewStat label="Total Realisasi" value={formatCompactIDR(previewBundle.totalStoValue)} />
                <PreviewStat label="Kategori" value={String(previewBundle.categories.length)} />
                <PreviewStat label="Site" value={String(previewBundle.sites.length)} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2.5">
                <button onClick={onApply} className="btn-black">
                  Terapkan ke Dashboard →
                </button>
                <button onClick={() => setPending({ status: "idle" })} className="btn-ghost">
                  Batalkan
                </button>
              </div>

              {applied && (
                <div className="mt-3.5 rounded-md2 border border-success-soft bg-success-soft/50 p-3 text-[12.5px] font-semibold text-success">
                  ✓ Diterapkan. Semua halaman dashboard sekarang memakai data dari &quot;{pending.fileName}&quot;.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Currently active data */}
        <div className="card">
          <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
            <div className="text-base font-extrabold text-strong">Data yang Sedang Aktif</div>
            {meta.source === "upload" && (
              <button onClick={resetToDefault} className="btn-ghost">
                Kembalikan ke Data Bawaan
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <PreviewStat label="Sumber" value={meta.source === "upload" ? "Hasil upload" : "Bawaan (demo)"} />
            <PreviewStat label="Nama file" value={meta.fileName ?? "—"} />
            <PreviewStat
              label="Waktu upload"
              value={meta.uploadedAt ? new Date(meta.uploadedAt).toLocaleString("id-ID") : "—"}
            />
            <PreviewStat label="Periode aktif" value={bundle.period} />
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <div className="mb-1.5 text-[13px] font-bold text-strong">Jadikan permanen (untuk semua orang)</div>
            <p className="mb-2.5 text-[12.5px] leading-relaxed text-muted">
              Salin data yang sedang aktif sebagai kode <code>lib/data.ts</code>, tempelkan ke file itu (mengganti
              blok <code>DEFAULT_RAW</code>), lalu commit &amp; deploy ulang aplikasi.
            </p>
            <button onClick={onCopyCode} className="btn-ghost">
              {copyState === "copied" ? "Tersalin ✓" : copyState === "failed" ? "Gagal menyalin — coba manual" : "Salin kode lib/data.ts"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md2 bg-soft p-3">
      <div className="stat-label">{label}</div>
      <div className="mt-1 truncate text-sm font-extrabold text-strong" title={value}>
        {value}
      </div>
    </div>
  );
}
