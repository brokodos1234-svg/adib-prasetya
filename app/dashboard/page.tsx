"use client";

import { useMemo, useState } from "react";
import { HeroStat } from "@/components/HeroStat";
import { useDashboardData } from "@/lib/store";
import {
  achievementBucket,
  achievementStatusLabel,
  formatIDR,
  formatCompactIDR,
  formatCount,
  formatPct,
} from "@/lib/data";

type Bucket = "all" | "high" | "mid" | "low";

export default function KategoriProgramPage() {
  const { bundle } = useDashboardData();
  const { categories, totalItems, totalPlanValue, totalStoValue, achievementPct } = bundle;
  const [filter, setFilter] = useState<Bucket>("all");

  const rows = useMemo(() => {
    return categories.map((c) => {
      const pct = c.plan > 0 ? c.sto / c.plan : 0;
      return { ...c, pct, bucket: achievementBucket(pct) };
    });
  }, [categories]);

  const counts = useMemo(() => {
    return {
      high: rows.filter((r) => r.bucket === "high").length,
      mid: rows.filter((r) => r.bucket === "mid").length,
      low: rows.filter((r) => r.bucket === "low").length,
    };
  }, [rows]);

  const visibleRows = filter === "all" ? rows : rows.filter((r) => r.bucket === filter);
  const outstanding = totalPlanValue - totalStoValue;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3.5 px-4 py-5 sm:px-7">
        <div>
          <div className="text-xl font-extrabold text-strong sm:text-[22px]">Kategori Program</div>
          <div className="mt-0.5 text-[12.5px] text-muted">
            Breakdown nilai rencana &amp; realisasi STO per kategori — {formatCount(totalItems)} item
          </div>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Bucket)}
          className="cursor-pointer appearance-none rounded-full border border-border bg-white bg-[url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2210%22%20height%3D%226%22%3E%3Cpath%20d%3D%22M0%200l5%206%205-6z%22%20fill%3D%22%2364748b%22%2F%3E%3C%2Fsvg%3E')] bg-[right_14px_center] bg-no-repeat px-4 py-2.5 pr-9 text-[13px] font-bold text-strong"
        >
          <option value="all">Semua Capaian</option>
          <option value="high">Capaian ≥ 80%</option>
          <option value="mid">Capaian 50–80%</option>
          <option value="low">Capaian &lt; 50%</option>
        </select>
      </div>

      <div className="px-4 pb-8 sm:px-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-5 rounded-lg2 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f766e] px-6 py-6 text-white sm:px-7">
          <div>
            <h2 className="mb-3 text-xl font-extrabold sm:text-2xl">Ringkasan Kategori Program</h2>
            <div className="flex flex-wrap gap-6">
              <HeroStat value={rows.length} label="Total Kategori" />
              <HeroStat value={counts.high} label="Capaian ≥ 80%" />
              <HeroStat value={counts.mid} label="Capaian 50–80%" />
              <HeroStat value={counts.low} label="Capaian < 50%" />
            </div>
          </div>
          <div className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-white/10 text-3xl">
            📦
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          <KpiMini label="Total Rencana" value={formatCompactIDR(totalPlanValue)} />
          <KpiMini label="Total Realisasi STO" value={formatCompactIDR(totalStoValue)} />
          <KpiMini label="Achievement Rata-rata" value={formatPct(achievementPct)} />
          <KpiMini label="Outstanding" value={formatCompactIDR(outstanding)} />
        </div>

        <div className="card">
          <div className="mb-3.5">
            <div className="text-base font-extrabold text-strong">Detail per Kategori Program</div>
            <div className="mt-0.5 text-[12.5px] text-muted">
              REMARK pada tracker Review STO · diurutkan berdasarkan nilai rencana
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th>Item</th>
                  <th>Rencana (Rp)</th>
                  <th>Realisasi STO (Rp)</th>
                  <th>Capaian</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((c) => {
                  const s = achievementStatusLabel(c.pct);
                  return (
                    <tr key={c.name}>
                      <td className="font-bold text-strong">
                        {c.name}
                        {c.note ? <span className="ml-1.5 text-[11.5px] font-normal text-muted">({c.note})</span> : null}
                      </td>
                      <td>{formatCount(c.items)}</td>
                      <td>{formatIDR(c.plan)}</td>
                      <td>{formatIDR(c.sto)}</td>
                      <td>
                        <span className="mini-bar-track">
                          <span className="mini-bar-fill" style={{ width: `${Math.min(c.pct * 100, 100)}%` }} />
                        </span>
                        {formatPct(c.pct)}
                      </td>
                      <td>
                        <span className={`pill ${s.pill}`}>{s.label}</span>
                      </td>
                    </tr>
                  );
                })}
                {visibleRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted">
                      Tidak ada kategori pada rentang capaian ini.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="font-extrabold">
                  <td className="text-strong">Grand Total</td>
                  <td className="text-strong">{formatCount(totalItems)}</td>
                  <td className="text-strong">{formatIDR(totalPlanValue)}</td>
                  <td className="text-strong">{formatIDR(totalStoValue)}</td>
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

function KpiMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md2 bg-card p-4 shadow-card sm:p-5">
      <div className="stat-label">{label}</div>
      <div className="mt-1 text-lg font-extrabold text-strong sm:text-xl">{value}</div>
    </div>
  );
}
