// Parses an uploaded "Plan Reduce Inventory Bayan.xlsx" workbook, in the browser,
// into a DashboardRaw (see lib/data.ts). No server/backend involved — this runs
// entirely client-side via the "xlsx" (SheetJS) package.
//
// Design note: real-world trackers drift (columns get reordered, a tab gets
// renamed, a row gets inserted). Every section below is parsed defensively and
// wrapped so one broken sheet doesn't sink the whole import — it's reported as
// a warning and that section falls back to the previous dataset instead.

import * as XLSX from "xlsx";
import type {
  DashboardRaw,
  DailyPoint,
  CategoryRow,
  SiteRow,
  StatusBreakdown,
  DeadStockBatch,
  TimelinePhase,
} from "@/lib/data";

const STATUS_COLORS: Record<string, string> = {
  "CLOSE STO": "#0d9488",
  "BLM PROGRESS": "#d97706",
  "OPEN STO": "#e11d48",
};

const STATUS_LABELS: Record<string, string> = {
  "CLOSE STO": "Close STO",
  "BLM PROGRESS": "Belum Progress",
  "OPEN STO": "Open STO",
};

const REQUIRED_SHEETS = ["DAILY", "Review STO", "TIMELINE"] as const;

export interface ParseResult {
  raw: DashboardRaw;
  warnings: string[];
}

export class WorkbookParseError extends Error {}

function normHeader(v: unknown): string {
  return String(v ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

function toNum(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const cleaned = v.trim().replace(/,/g, "");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function toStr(v: unknown): string {
  return String(v ?? "").trim();
}

// Excel serial date (1900 system) -> "YYYY-MM-DD". Matches the convention used
// throughout this workbook (integer day counts, epoch 1899-12-30).
function excelSerialToISODate(serial: number): string {
  const ms = Date.UTC(1899, 11, 30) + Math.round(serial) * 86400000;
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function findSheet(wb: XLSX.WorkBook, name: string): XLSX.WorkSheet | null {
  const key = wb.SheetNames.find((n) => n.trim().toUpperCase() === name.trim().toUpperCase());
  return key ? wb.Sheets[key] : null;
}

function sheetToRows(sheet: XLSX.WorkSheet): unknown[][] {
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: true }) as unknown[][];
}

function buildHeaderIndex(headerRow: unknown[]): Map<string, number> {
  const map = new Map<string, number>();
  headerRow.forEach((cell, i) => {
    const h = normHeader(cell);
    if (h && !map.has(h)) map.set(h, i);
  });
  return map;
}

// ---- DAILY sheet ------------------------------------------------------------
function parseDaily(wb: XLSX.WorkBook, warnings: string[]): DailyPoint[] {
  const sheet = findSheet(wb, "DAILY");
  if (!sheet) {
    warnings.push('Sheet "DAILY" tidak ditemukan — tren SOH harian tidak diperbarui.');
    return [];
  }
  const rows = sheetToRows(sheet);
  if (rows.length < 2) {
    warnings.push('Sheet "DAILY" kosong atau tidak berisi data.');
    return [];
  }
  const idx = buildHeaderIndex(rows[0]);
  const dateCol = idx.get("DATE");
  const sohCol = idx.get("SOH");
  const recvCol = idx.get("RECEIVED");
  const issuedCol = idx.get("ISSUED");
  const stoOutCol = idx.get("STO OUT");

  if (dateCol === undefined || sohCol === undefined) {
    warnings.push('Kolom "DATE" atau "SOH" tidak ditemukan di sheet DAILY.');
    return [];
  }

  const points: DailyPoint[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const dateVal = row[dateCol];
    if (typeof dateVal !== "number") continue; // stop at blank/footer rows
    points.push({
      date: excelSerialToISODate(dateVal),
      soh: toNum(row[sohCol]),
      received: recvCol !== undefined ? toNum(row[recvCol]) : 0,
      issued: issuedCol !== undefined ? toNum(row[issuedCol]) : 0,
      stoOut: stoOutCol !== undefined ? toNum(row[stoOutCol]) : 0,
    });
  }
  if (points.length === 0) {
    warnings.push('Tidak ada baris tanggal valid ditemukan di sheet DAILY.');
  }
  return points;
}

// ---- "Review STO" sheet: categories, sites, status breakdown, dead stock --
interface ReviewRow {
  material: string;
  site: string;
  remark: string;
  valuePlan: number;
  valueSto: number;
  statusSto: string;
}

function parseReviewRows(wb: XLSX.WorkBook, warnings: string[]): ReviewRow[] {
  const sheet = findSheet(wb, "Review STO");
  if (!sheet) {
    warnings.push('Sheet "Review STO" tidak ditemukan — kategori, site, dan status tidak diperbarui.');
    return [];
  }
  const rows = sheetToRows(sheet);
  if (rows.length < 2) {
    warnings.push('Sheet "Review STO" kosong atau tidak berisi data.');
    return [];
  }
  const idx = buildHeaderIndex(rows[0]);
  const materialCol = idx.get("MATERIAL");
  const siteCol = idx.get("SITE");
  const remarkCol = idx.get("REMARK");
  const valuePlanCol = idx.get("VALUE (PLAN)");
  const valueStoCol = idx.get("VALUE STO");
  const statusStoCol = idx.get("STATUS STO");

  if (materialCol === undefined || valuePlanCol === undefined) {
    warnings.push('Kolom wajib ("Material", "Value (Plan)") tidak ditemukan di sheet Review STO.');
    return [];
  }

  const out: ReviewRow[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const material = toStr(row[materialCol]);
    if (!material) continue;
    out.push({
      material,
      site: siteCol !== undefined ? toStr(row[siteCol]) : "",
      remark: remarkCol !== undefined ? toStr(row[remarkCol]) : "",
      valuePlan: toNum(row[valuePlanCol]),
      valueSto: valueStoCol !== undefined ? toNum(row[valueStoCol]) : 0,
      statusSto: statusStoCol !== undefined ? toStr(row[statusStoCol]).toUpperCase() : "",
    });
  }
  if (out.length === 0) {
    warnings.push('Tidak ada baris material valid ditemukan di sheet Review STO.');
  }
  return out;
}

function aggregateCategories(rows: ReviewRow[], topN = 10): CategoryRow[] {
  const groups = new Map<string, { items: number; plan: number; sto: number }>();
  for (const r of rows) {
    const key = r.remark || "(Tanpa Kategori)";
    const g = groups.get(key) ?? { items: 0, plan: 0, sto: 0 };
    g.items += 1;
    g.plan += r.valuePlan;
    g.sto += r.valueSto;
    groups.set(key, g);
  }
  const all = Array.from(groups.entries())
    .map(([name, g]) => ({ name, ...g }))
    .sort((a, b) => b.plan - a.plan);

  const top = all.slice(0, topN);
  const rest = all.slice(topN);
  if (rest.length === 0) return top;

  const restAgg = rest.reduce(
    (acc, r) => ({ items: acc.items + r.items, plan: acc.plan + r.plan, sto: acc.sto + r.sto }),
    { items: 0, plan: 0, sto: 0 }
  );
  return [
    ...top,
    { name: "Lainnya", note: `${rest.length} kategori lain`, items: restAgg.items, plan: restAgg.plan, sto: restAgg.sto },
  ];
}

function aggregateSites(rows: ReviewRow[]): SiteRow[] {
  const groups = new Map<string, { items: number; plan: number; sto: number }>();
  for (const r of rows) {
    const key = r.site || "(Tanpa Site)";
    const g = groups.get(key) ?? { items: 0, plan: 0, sto: 0 };
    g.items += 1;
    g.plan += r.valuePlan;
    g.sto += r.valueSto;
    groups.set(key, g);
  }
  return Array.from(groups.entries())
    .map(([name, g]) => ({ name, ...g }))
    .sort((a, b) => b.plan - a.plan);
}

function aggregateStatus(rows: ReviewRow[]): StatusBreakdown[] {
  const groups = new Map<string, { count: number; plan: number; sto: number }>();
  for (const r of rows) {
    const key = r.statusSto || "BLM PROGRESS";
    const g = groups.get(key) ?? { count: 0, plan: 0, sto: 0 };
    g.count += 1;
    g.plan += r.valuePlan;
    g.sto += r.valueSto;
    groups.set(key, g);
  }
  return Array.from(groups.entries())
    .map(([status, g]) => ({
      status: status as StatusBreakdown["status"],
      label: STATUS_LABELS[status] ?? status,
      color: STATUS_COLORS[status] ?? "#64748b",
      ...g,
    }))
    .sort((a, b) => b.count - a.count);
}

function aggregateDeadStock(rows: ReviewRow[]): DeadStockBatch[] {
  const batchGroups = new Map<string, ReviewRow[]>();
  for (const r of rows) {
    if (!/^dead stock batch/i.test(r.remark)) continue;
    const key = r.remark.trim();
    const arr = batchGroups.get(key) ?? [];
    arr.push(r);
    batchGroups.set(key, arr);
  }

  const batches: DeadStockBatch[] = [];
  for (const [remark, items] of batchGroups.entries()) {
    const batchLabel = remark.replace(/^dead stock\s*/i, "").trim() || remark;
    const siteCounts = new Map<string, number>();
    items.forEach((r) => siteCounts.set(r.site, (siteCounts.get(r.site) ?? 0) + 1));
    const dominantSite = Array.from(siteCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";

    const statusGroups = new Map<string, { count: number; plan: number; sto: number }>();
    for (const r of items) {
      const key = r.statusSto || "BLM PROGRESS";
      const g = statusGroups.get(key) ?? { count: 0, plan: 0, sto: 0 };
      g.count += 1;
      g.plan += r.valuePlan;
      g.sto += r.valueSto;
      statusGroups.set(key, g);
    }

    batches.push({
      batch: batchLabel,
      items: items.length,
      plan: items.reduce((a, r) => a + r.valuePlan, 0),
      sto: items.reduce((a, r) => a + r.valueSto, 0),
      site: dominantSite,
      statusBreakdown: Array.from(statusGroups.entries()).map(([status, g]) => ({ status, ...g })),
    });
  }

  // Keep batches in "Batch 1, 2, 3…" order when possible.
  batches.sort((a, b) => a.batch.localeCompare(b.batch, undefined, { numeric: true }));
  return batches;
}

// ---- TIMELINE sheet ---------------------------------------------------------
function parseTimeline(wb: XLSX.WorkBook, warnings: string[]): TimelinePhase[] {
  const sheet = findSheet(wb, "TIMELINE");
  if (!sheet) {
    warnings.push('Sheet "TIMELINE" tidak ditemukan — halaman Timeline Eksekusi tidak diperbarui.');
    return [];
  }
  const rows = sheetToRows(sheet);

  // Locate the header row: the one containing a cell that reads exactly "VALUE".
  let headerRowIdx = -1;
  let valueCol = -1;
  for (let r = 0; r < Math.min(rows.length, 10); r++) {
    const col = rows[r].findIndex((c) => normHeader(c) === "VALUE");
    if (col !== -1) {
      headerRowIdx = r;
      valueCol = col;
      break;
    }
  }
  if (headerRowIdx === -1) {
    warnings.push('Kolom "VALUE" tidak ditemukan di sheet TIMELINE — target nilai aktivitas tidak dapat dibaca.');
    return [];
  }

  const phases: TimelinePhase[] = [];
  let current: TimelinePhase | null = null;

  for (let r = headerRowIdx + 2; r < rows.length; r++) {
    const row = rows[r];
    const code = toStr(row[1]); // column B
    const name = toStr(row[2]); // column C
    if (!code && !name) continue;

    if (/^\d+\.$/.test(code)) {
      current = { phase: code.replace(".", ""), title: name, activities: [] };
      phases.push(current);
      continue;
    }
    if (/^\d+\.[A-Za-z]$/.test(code)) {
      if (!current) {
        current = { phase: "?", title: "Lainnya", activities: [] };
        phases.push(current);
      }
      const rawVal = toNum(row[valueCol]);
      current.activities.push({ code, name, targetValue: rawVal > 0 ? rawVal : null });
    }
  }

  if (phases.length === 0) {
    warnings.push("Tidak ada baris fase/aktivitas yang dikenali di sheet TIMELINE.");
  }
  return phases;
}

// ---- DASHBOARD sheet: just the period label --------------------------------
function parsePeriodLabel(wb: XLSX.WorkBook): string | null {
  const sheet = findSheet(wb, "DASHBOARD");
  if (!sheet) return null;
  const rows = sheetToRows(sheet);
  for (const row of rows.slice(0, 3)) {
    for (const cell of row) {
      const text = toStr(cell);
      const match = text.match(/PERIODE\s+(.+)$/i);
      if (match) return match[1].trim();
    }
  }
  return null;
}

// ---- Entry point -------------------------------------------------------------
export async function parseWorkbookFile(file: File, previous: DashboardRaw): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.read(buffer, { type: "array" });
  } catch {
    throw new WorkbookParseError("File tidak bisa dibaca sebagai workbook Excel (.xlsx). Pastikan file tidak rusak.");
  }

  const missing = REQUIRED_SHEETS.filter((s) => !findSheet(wb, s));
  if (missing.length === REQUIRED_SHEETS.length) {
    throw new WorkbookParseError(
      `Tidak ada sheet yang dikenali (dibutuhkan salah satu dari: ${REQUIRED_SHEETS.join(", ")}). ` +
        "Pastikan ini file 'Plan Reduce Inventory Bayan.xlsx' yang benar."
    );
  }

  const warnings: string[] = [];

  const daily = parseDaily(wb, warnings);
  const reviewRows = parseReviewRows(wb, warnings);
  const timeline = parseTimeline(wb, warnings);
  const periodLabel = parsePeriodLabel(wb);

  const categories = reviewRows.length ? aggregateCategories(reviewRows) : previous.categories;
  const sites = reviewRows.length ? aggregateSites(reviewRows) : previous.sites;
  const statusBreakdown = reviewRows.length ? aggregateStatus(reviewRows) : previous.statusBreakdown;
  const deadStock = reviewRows.length ? aggregateDeadStock(reviewRows) : previous.deadStock;

  const dailyFinal = daily.length ? daily : previous.daily;
  const lastDate = dailyFinal.length ? dailyFinal[dailyFinal.length - 1].date : previous.asOf;
  const lastDateLabel = formatIndonesianDate(lastDate);

  const raw: DashboardRaw = {
    period: periodLabel ?? previous.period,
    asOf: lastDate,
    asOfLabel: lastDateLabel,
    sourceLabel: `${file.name} (sheet DASHBOARD, DAILY, Review STO, TIMELINE)`,
    daily: dailyFinal,
    categories,
    sites,
    statusBreakdown,
    deadStock,
    timeline: timeline.length ? timeline : previous.timeline,
  };

  return { raw, warnings };
}

const BULAN_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatIndonesianDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${BULAN_ID[m - 1]} ${y}`;
}
