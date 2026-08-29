"use client";

import { HeroStat } from "@/components/HeroStat";
import { useDashboardData } from "@/lib/store";
import {
  achievementStatusLabel,
  formatIDR,
  formatCompactIDR,
  formatCount,
  formatPct,
} from "@/lib/data";

export default function BreakdownSitePage() {
  const { bundle } = useDashboardData();
  const { sites, totalItems, totalPlanValue, totalStoValue, achievementPct } = bundle;

  const rows = [...sites].sort((a, b) => b.plan - a.plan);
  const dcPalaran = rows[0];
  const outstanding = totalPlanValue - totalStoValue;

  // Fold negligible sites (< Rp10jt plan) into one "Lainnya" bar for the chart only.
  const chartMain = rows.filter((r) => r.plan >= 10_000_000);
  const chartRest = rows.filter((r) => r.plan < 10_000_000);
  const restPlan = chartRest.reduce((a, b) => a + b.plan, 0);
  const restSto = chartRest.reduce((a, b) => a + b.sto, 0);
  const chartBars = [
    ...chartMain.map((r) => ({ name: r.name, pct: r.plan > 0 ? r.sto / r.plan : 0 })),
    ...(chartRest.length ? [{ name: "Lainnya", pct: restPlan > 0 ? restSto / restPlan : 0 }] : []),
  ];

  if (!dcPalaran) {
    return (
      <div className="px-4 py-10 text-center text-muted sm:px-7">
        Belum ada data site. Unggah workbook melalui halaman{" "}
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
          <div className="text-xl font-extrabold text-strong sm:text-[22px]">Breakdown Site</div>
          <div className="mt-0.5 text-[12.5px] text-muted">
            Capaian STO per site tujuan — {rows.length} site, {formatCount(totalItems)} item
          </div>
        </div>
      </div>

      <div className="px-4 pb-8 sm:px-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-5 rounded-lg2 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f766e] px-6 py-6 text-white sm:px-7">
          <div>
            <h2 className="mb-3 text-xl font-extrabold sm:text-2xl">
              {dcPalaran.name} mendominasi {Math.round((dcPalaran.items / totalItems) * 100)}% dari total item
              program
            </h2>
            <div className="flex flex-wrap gap-6">
              <HeroStat value={formatCount(dcPalaran.items)} label={`Item di ${dcPalaran.name}`} />
              <HeroStat value={formatCompactIDR(dcPalaran.plan)} label={`Rencana ${dcPalaran.name}`} />
              <HeroStat
                value={formatPct(dcPalaran.plan > 0 ? dcPalaran.sto / dcPalaran.plan : 0)}
                label={`Capaian ${dcPalaran.name}`}
              />
            </div>
          </div>
          <div className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-white/10 text-3xl">
            ⌂
          </div>
        </div>

        <div className="card mb-4">
          <div className="mb-3.5">
            <div className="text-base font-extrabold text-strong">Capaian STO per Site</div>
            <div className="mt-0.5 text-[12.5px] text-muted">% nilai realisasi terhadap rencana</div>
          </div>
          <div className="flex h-[200px] items-end gap-3 overflow-x-auto pt-2.5 sm:gap-4">
            {chartBars.map((b) => {
              const color = b.pct < 0.5 ? "#e11d48" : b.pct < 0.8 ? "#d97706" : "#0d9488";
              return (
                <div key={b.name} className="flex h-full min-w-[64px] flex-1 flex-col items-center justify-end gap-2">
                  <div className="text-[11.5px] font-extrabold text-strong">{formatPct(b.pct, 1)}</div>
                  <div className="flex h-full w-full max-w-[46px] items-end overflow-hidden rounded-t-lg bg-soft">
                    <div
                      className="w-full rounded-t-lg"
                      style={{ height: `${Math.max(b.pct * 100, 2)}%`, background: color }}
                    />
                  </div>
                  <div className="text-center text-[11px] font-bold text-muted">{b.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="mb-3.5">
            <div className="text-base font-extrabold text-strong">Detail per Site</div>
            <div className="mt-0.5 text-[12.5px] text-muted">Diurutkan berdasarkan nilai rencana</div>
          </div>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Item</th>
                  <th>Rencana (Rp)</th>
                  <th>Realisasi STO (Rp)</th>
                  <th>Outstanding (Rp)</th>
                  <th>Capaian</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const pct = r.plan > 0 ? r.sto / r.plan : 0;
                  const s =
                    pct >= 0.999
                      ? { label: r.sto > 0 ? "Selesai" : "Belum Mulai", pill: r.sto > 0 ? "pill-green" : "pill-red" }
                      : achievementStatusLabel(pct);
                  return (
                    <tr key={r.name}>
                      <td className="font-bold text-strong">{r.name}</td>
                      <td>{formatCount(r.items)}</td>
                      <td>{formatIDR(r.plan)}</td>
                      <td>{formatIDR(r.sto)}</td>
                      <td>{formatIDR(r.plan - r.sto)}</td>
                      <td>
                        <span className="mini-bar-track">
                          <span className="mini-bar-fill" style={{ width: `${Math.min(pct * 100, 100)}%` }} />
                        </span>
                        {formatPct(pct)}
                      </td>
                      <td>
                        <span className={`pill ${s.pill}`}>{s.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="font-extrabold">
                  <td className="text-strong">Grand Total</td>
                  <td className="text-strong">{formatCount(totalItems)}</td>
                  <td className="text-strong">{formatIDR(totalPlanValue)}</td>
                  <td className="text-strong">{formatIDR(totalStoValue)}</td>
                  <td className="text-strong">{formatIDR(outstanding)}</td>
                  <td className="text-strong">{formatPct(achievementPct)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
