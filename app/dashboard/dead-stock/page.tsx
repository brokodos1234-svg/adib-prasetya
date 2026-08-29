"use client";

import { HeroStat } from "@/components/HeroStat";
import { useDashboardData } from "@/lib/store";
import { formatIDR, formatCompactIDR, formatCount, formatPct } from "@/lib/data";

const STATUS_PILL: Record<string, string> = {
  "CLOSE STO": "pill-green",
  "OPEN STO": "pill-red",
  "BLM PROGRESS": "pill-yellow",
};

const STATUS_LABEL: Record<string, string> = {
  "CLOSE STO": "Close STO",
  "OPEN STO": "Open STO",
  "BLM PROGRESS": "Belum Progress",
};

export default function DeadStockPage() {
  const { bundle } = useDashboardData();
  const { deadStock, deadStockTotalItems, deadStockTotalPlan, deadStockTotalSto } = bundle;
  const overallPct = deadStockTotalPlan > 0 ? deadStockTotalSto / deadStockTotalPlan : 0;

  if (deadStock.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-muted sm:px-7">
        Tidak ada kategori &quot;Dead Stock Batch …&quot; pada data saat ini. Unggah workbook melalui halaman{" "}
        <a href="/dashboard/update-data" className="font-bold text-strong underline">
          Update Data
        </a>
        .
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3.5 px-4 py-5 sm:px-7">
        <div>
          <div className="text-xl font-extrabold text-strong sm:text-[22px]">Dead Stock</div>
          <div className="mt-0.5 text-[12.5px] text-muted">
            {deadStock.length} batch · {formatCount(deadStockTotalItems)} item
          </div>
        </div>
      </div>

      <div className="px-4 pb-8 sm:px-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-5 rounded-lg2 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f766e] px-6 py-6 text-white sm:px-7">
          <div>
            <h2 className="mb-3 text-xl font-extrabold sm:text-2xl">Progres Dead Stock</h2>
            <div className="flex flex-wrap gap-6">
              <HeroStat value={formatCompactIDR(deadStockTotalPlan)} label="Total Target" />
              <HeroStat value={formatCompactIDR(deadStockTotalSto)} label="Realisasi STO" />
              <HeroStat value={formatPct(overallPct)} label="Achievement" />
            </div>
          </div>
          <div className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-white/10 text-3xl">
            ▢
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {deadStock.map((b) => {
            const pct = b.plan > 0 ? b.sto / b.plan : 0;
            const pillClass = pct >= 0.8 ? "pill-green" : pct >= 0.5 ? "pill-yellow" : "pill-red";
            const barColor = pct >= 0.8 ? "#0d9488" : pct >= 0.5 ? "#d97706" : "#e11d48";
            return (
              <div key={b.batch} className="card">
                <div className="mb-3.5 flex items-center justify-between">
                  <div className="text-base font-extrabold text-strong">{b.batch}</div>
                  <span className={`pill ${pillClass}`}>{formatPct(pct)}</span>
                </div>
                <div className="text-2xl font-extrabold text-strong">{formatCompactIDR(b.plan)}</div>
                <div className="mb-3.5 mt-0.5 text-[11.5px] text-muted">
                  Target · {formatCount(b.items)} item · {b.site}
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-soft">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(pct * 100, 100)}%`, background: barColor }} />
                </div>
                <div className="mt-3.5 flex flex-wrap justify-between gap-2 text-xs text-muted">
                  {b.statusBreakdown.map((s) => (
                    <span key={s.status}>
                      {STATUS_LABEL[s.status] ?? s.status}: <b className="text-strong">{formatCount(s.count)}</b>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="mb-3.5">
            <div className="text-base font-extrabold text-strong">Detail Status per Batch</div>
            <div className="mt-0.5 text-[12.5px] text-muted">
              Sumber: sheet Review STO, filter REMARK diawali &quot;Dead Stock Batch&quot;
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Status STO</th>
                  <th>Item</th>
                  <th>Rencana (Rp)</th>
                  <th>Realisasi STO (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {deadStock.flatMap((b) =>
                  b.statusBreakdown.map((s, idx) => (
                    <tr key={`${b.batch}-${s.status}`}>
                      <td className="font-bold text-strong">{idx === 0 ? b.batch : ""}</td>
                      <td>
                        <span className={`pill ${STATUS_PILL[s.status] ?? "pill-gray"}`}>
                          {STATUS_LABEL[s.status] ?? s.status}
                        </span>
                      </td>
                      <td>{formatCount(s.count)}</td>
                      <td>{formatIDR(s.plan)}</td>
                      <td>{formatIDR(s.sto)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="font-extrabold">
                  <td className="text-strong">Total</td>
                  <td />
                  <td className="text-strong">{formatCount(deadStockTotalItems)}</td>
                  <td className="text-strong">{formatIDR(deadStockTotalPlan)}</td>
                  <td className="text-strong">{formatIDR(deadStockTotalSto)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
