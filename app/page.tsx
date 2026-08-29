"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SohTrendChart } from "@/components/SohTrendChart";
import { Sparkline } from "@/components/Sparkline";
import { useDashboardData } from "@/lib/store";
import { formatCompactIDR, formatCount, formatPct, type SiteRow } from "@/lib/data";

export default function OverviewPage() {
  const { bundle } = useDashboardData();
  const {
    period,
    asOfLabel,
    sourceLabel,
    daily,
    categories,
    sites,
    statusBreakdown,
    timeline,
    sohLatest,
    sohChangePct,
    totalItems,
    totalPlanValue,
    totalStoValue,
    achievementPct,
    deadStockTotalPlan,
    deadStockTotalSto,
    deadStockTotalItems,
    timelineTotalTarget,
    timelineValuedActivities,
  } = bundle;

  const topCategories = categories.slice(0, 6);
  const totalExecActivities = timeline.find((p) => p.phase === "2")?.activities.length ?? 0;

  // Alert cards are picked generically so an uploaded workbook with different
  // site names still produces something sensible: the largest site by plan
  // value, plus the two weakest-achievement sites among the rest.
  const byPlanDesc = [...sites].filter((s) => s.plan > 0).sort((a, b) => b.plan - a.plan);
  const largestSite = byPlanDesc[0];
  const weakestSites = byPlanDesc
    .slice(1)
    .sort((a, b) => a.sto / a.plan - b.sto / b.plan)
    .slice(0, 2);
  const alertSites = [...weakestSites, largestSite].filter(
    (s, i, arr): s is SiteRow => !!s && arr.findIndex((x) => x?.name === s.name) === i
  );

  const stoOutSeries = daily.map((d) => d.stoOut);
  const sohSeries = daily.map((d) => d.soh);

  const maxStatusCount = statusBreakdown.reduce((a, s) => a + s.count, 0) || 1;
  const deadStockPct = deadStockTotalPlan > 0 ? deadStockTotalSto / deadStockTotalPlan : 0;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6">
      {/* Top nav */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg2 bg-card px-4 py-3.5 shadow-card sm:px-6">
        <div className="flex items-center gap-2.5">
          <Logo className="h-7 w-auto sm:h-8" />
          <div>
            <div className="text-[15px] font-bold text-strong">Warehouse Management</div>
            <div className="-mt-0.5 text-[11px] text-muted">Site Bayan · Reduce Inventory</div>
          </div>
        </div>

        <div className="hidden items-center gap-1.5 rounded-full bg-soft p-1 md:flex">
          <span className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[13px] font-semibold text-strong shadow-sm">
            ▦ Overview
          </span>
          <Link href="/dashboard" className="rounded-full px-3.5 py-2 text-[13px] font-semibold text-muted hover:text-strong">
            ☰ Kategori
          </Link>
          <Link href="/dashboard/site" className="rounded-full px-3.5 py-2 text-[13px] font-semibold text-muted hover:text-strong">
            ⌂ Site
          </Link>
          <Link href="/dashboard/dead-stock" className="rounded-full px-3.5 py-2 text-[13px] font-semibold text-muted hover:text-strong">
            ▢ Dead Stock
          </Link>
          <Link href="/dashboard/timeline" className="rounded-full px-3.5 py-2 text-[13px] font-semibold text-muted hover:text-strong">
            ◷ Timeline
          </Link>
          <Link href="/dashboard/update-data" className="rounded-full px-3.5 py-2 text-[13px] font-semibold text-muted hover:text-strong">
            ⭯ Update Data
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-soft text-muted">⚑</div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-soft text-muted">⚙</div>
          <div className="flex flex-col border-l border-border pl-3">
            <b className="text-[13px] text-strong">{asOfLabel}</b>
            <span className="text-[10px] uppercase tracking-wide text-muted">Update terakhir</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted">
            Site Bayan · Program Reduce Inventory
          </div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-strong sm:text-[32px]">
            Ringkasan Program<span className="text-accent">.</span>
          </h1>
          <div className="mt-1.5 max-w-[520px] text-sm text-muted">
            Pemantauan SOH harian, capaian STO per site, kategori program, dan dead stock — periode {period}.
          </div>
        </div>
        <div className="flex flex-wrap gap-6 sm:gap-7">
          <div>
            <div className="stat-label">Total SOH</div>
            <div className="stat-value">{formatCompactIDR(sohLatest)}</div>
          </div>
          <div>
            <div className="stat-label">Achievement STO</div>
            <div className="stat-value">{formatPct(achievementPct)}</div>
          </div>
          <div>
            <div className="stat-label">Item Tertrack</div>
            <div className="stat-value">{formatCount(totalItems)}</div>
          </div>
        </div>
      </div>

      {/* Brief banner */}
      <div className="mb-4 flex flex-wrap gap-6 rounded-lg2 border border-[#d9f0ec] bg-gradient-to-br from-[#f2fbf9] to-[#eef0f4] px-6 py-6">
        <div className="min-w-[280px] flex-1">
          <div className="mb-2.5 flex items-center gap-2 text-[12.5px] font-bold text-strong">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_0_4px_theme(colors.accent.soft)]" />
            Ringkasan Otomatis · data per {asOfLabel}
          </div>
          <p className="mb-4 max-w-[640px] text-[14.5px] leading-relaxed text-body">
            {largestSite ? (
              <>
                {formatCount(largestSite.items)} item senilai <b>{formatCompactIDR(largestSite.plan)}</b> tercatat di{" "}
                <b>{largestSite.name}</b> (capaian {formatPct(largestSite.sto / largestSite.plan, 1)}) — site dengan
                volume terbesar.{" "}
              </>
            ) : null}
            Program <b>Dead Stock</b> sudah merealisasikan{" "}
            <b>
              {formatCompactIDR(deadStockTotalSto)} ({formatPct(deadStockPct, 1)})
            </b>{" "}
            dari target {formatCompactIDR(deadStockTotalPlan)}.
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/dashboard/site" className="btn-black">
              Lihat Breakdown Site →
            </Link>
            <Link href="/dashboard/dead-stock" className="btn-ghost">
              Detail Dead Stock
            </Link>
            <Link href="/dashboard" className="text-[13px] font-semibold text-muted hover:text-strong">
              Lihat semua kategori program
            </Link>
          </div>
        </div>
      </div>

      {/* 3 metric cards */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="stat-label text-faint">SOH Saat Ini</div>
          <div className="my-1.5 flex items-end justify-between">
            <div className="text-[26px] font-extrabold text-strong">{formatCompactIDR(sohLatest)}</div>
            <div className="text-xs font-semibold text-danger">{formatPct(sohChangePct, 1)} vs awal periode</div>
          </div>
          {sohSeries.length > 1 ? <Sparkline values={sohSeries} color="#e11d48" /> : <EmptySpark />}
          <div className="mt-1 text-[11.5px] text-muted">
            {daily[0]?.date ?? "—"} → {daily[daily.length - 1]?.date ?? "—"}
          </div>
        </div>
        <div className="card">
          <div className="stat-label text-faint">Achievement STO</div>
          <div className="my-1.5 flex items-end justify-between">
            <div className="text-[26px] font-extrabold text-strong">{formatPct(achievementPct)}</div>
            <div className="text-xs font-semibold text-accent">
              {formatCompactIDR(totalStoValue)} / {formatCompactIDR(totalPlanValue)}
            </div>
          </div>
          {stoOutSeries.length > 1 ? <Sparkline values={stoOutSeries} color="#0d9488" /> : <EmptySpark />}
          <div className="mt-1 text-[11.5px] text-muted">STO Out harian (Rp) · {formatCount(totalItems)} item</div>
        </div>
        <div className="card">
          <div className="stat-label text-faint">Dead Stock Progress</div>
          <div className="my-1.5 flex items-end justify-between">
            <div className="text-[26px] font-extrabold text-strong">{formatPct(deadStockPct)}</div>
            <div className="text-xs font-semibold text-accent">
              {formatCompactIDR(deadStockTotalSto)} / {formatCompactIDR(deadStockTotalPlan)}
            </div>
          </div>
          <div className="flex h-11 items-center gap-2.5">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-soft">
              <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(deadStockPct * 100, 100)}%` }} />
            </div>
          </div>
          <div className="mt-1 text-[11.5px] text-muted">{formatCount(deadStockTotalItems)} item</div>
        </div>
      </div>

      {/* Trend chart + status */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="card">
          <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-base font-extrabold text-strong">Tren SOH Harian</div>
              <div className="mt-0.5 text-[12.5px] text-muted">Stock on Hand vs Received &amp; Issued</div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <span className="inline-block h-2 w-2 rounded-full bg-accent" /> SOH
            </div>
          </div>
          {daily.length > 1 ? (
            <SohTrendChart data={daily} />
          ) : (
            <div className="flex h-[260px] items-center justify-center text-sm text-muted">
              Belum ada data tren harian.
            </div>
          )}
        </div>

        <div className="card">
          <div className="mb-3.5">
            <div className="text-base font-extrabold text-strong">Status Realisasi STO</div>
            <div className="mt-0.5 text-[12.5px] text-muted">{formatCount(totalItems)} item tertrack</div>
          </div>
          <div className="mb-4 flex h-2.5 overflow-hidden rounded-full bg-soft">
            {statusBreakdown.map((s) => (
              <div key={s.status} style={{ width: `${(s.count / maxStatusCount) * 100}%`, background: s.color }} />
            ))}
          </div>
          <div className="flex flex-col gap-2.5">
            {statusBreakdown.map((s) => (
              <div key={s.status} className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2 font-semibold text-body">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </div>
                <div className="flex gap-4 font-bold text-muted">
                  <span className="font-normal">{formatCount(s.count)} item</span>
                  <b className="text-strong">{formatPct(s.count / maxStatusCount, 1)}</b>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alertSites.length > 0 && (
        <>
          <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-base font-extrabold text-strong">🔴 Prioritas Perhatian per Site</div>
              <div className="mt-0.5 text-[12.5px] text-muted">Diurutkan berdasarkan nilai rencana × capaian STO</div>
            </div>
            <Link href="/dashboard/site" className="text-[13px] font-bold text-strong">
              Semua Site →
            </Link>
          </div>
          <div className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-3">
            {alertSites.map((s) => {
              const pct = s.sto / s.plan;
              const isLargest = s.name === largestSite?.name;
              const badge = isLargest ? "VOLUME TERBESAR" : pct < 0.5 ? "CAPAIAN RENDAH" : "PERLU KAWAL";
              const badgeClass = isLargest
                ? "bg-info-soft text-info"
                : pct < 0.5
                ? "bg-danger-soft text-danger"
                : "bg-warning-soft text-warning";
              const body = isLargest
                ? `${formatCount(s.items)} item (${Math.round((s.items / totalItems) * 100)}% dari total item program). ${formatCompactIDR(
                    s.plan - s.sto
                  )} masih outstanding — site dengan nilai outstanding absolut terbesar.`
                : `${formatCount(s.items)} item tracking. Baru ${formatCompactIDR(s.sto)} terealisasi dari ${formatCompactIDR(
                    s.plan
                  )} rencana STO.`;
              return (
                <AlertCard
                  key={s.name}
                  title={s.name}
                  meta={`${formatCompactIDR(s.plan)} rencana · capaian ${formatPct(pct, 1)}`}
                  badge={badge}
                  badgeClass={badgeClass}
                  body={body}
                  href="/dashboard/site"
                  items={s.items}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Category table + forecast */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="card">
          <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-base font-extrabold text-strong">Kategori Program Teratas</div>
              <div className="mt-0.5 text-[12.5px] text-muted">Diurutkan berdasarkan nilai rencana STO</div>
            </div>
            <Link href="/dashboard" className="text-[13px] font-bold text-strong">
              Semua Kategori →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th>Item</th>
                  <th>Rencana</th>
                  <th>Capaian</th>
                </tr>
              </thead>
              <tbody>
                {topCategories.map((c) => {
                  const pct = c.plan > 0 ? c.sto / c.plan : 0;
                  return (
                    <tr key={c.name}>
                      <td className="font-bold text-strong">{c.name}</td>
                      <td>{formatCount(c.items)}</td>
                      <td>{formatCompactIDR(c.plan)}</td>
                      <td>
                        <span className="mini-bar-track">
                          <span className="mini-bar-fill" style={{ width: `${Math.min(pct * 100, 100)}%` }} />
                        </span>
                        {formatPct(pct, 1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card flex flex-col justify-between">
          <div>
            <div className="stat-label">Target Program Keseluruhan</div>
            <div className="my-2.5 text-[28px] font-extrabold text-strong">{formatCompactIDR(timelineTotalTarget)}</div>
            <div className="text-[12.5px] text-muted">
              Total nilai target {timelineValuedActivities} aktivitas eksekusi bertarget pada Timeline Program (dari{" "}
              {totalExecActivities} aktivitas eksekusi).
            </div>
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <div className="stat-label">Sudah Tertrack &amp; Berjalan</div>
            <div className="mt-1 text-xl font-extrabold text-strong">
              {formatCompactIDR(totalPlanValue)}{" "}
              {timelineTotalTarget > 0 ? (
                <span className="text-xs font-bold text-muted">
                  ({formatPct(totalPlanValue / timelineTotalTarget, 1)} dari target)
                </span>
              ) : null}
            </div>
          </div>
          <Link href="/dashboard/timeline" className="mt-3.5 inline-block text-[13px] font-semibold text-muted hover:text-strong">
            Lihat Timeline Eksekusi →
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-between gap-2 rounded-md2 bg-card px-5 py-4 text-xs text-muted shadow-card">
        <span>
          Sumber data: <b>{sourceLabel}</b> · Site Bayan.
        </span>
        <span>
          Periode: {period} · Data per {asOfLabel}.
        </span>
      </div>
    </div>
  );
}

function EmptySpark() {
  return <div className="flex h-11 items-center text-[11px] text-faint">Data tidak cukup</div>;
}

function AlertCard({
  title,
  meta,
  badge,
  badgeClass,
  body,
  href,
  items,
}: {
  title: string;
  meta: string;
  badge: string;
  badgeClass: string;
  body: string;
  href: string;
  items: number;
}) {
  return (
    <div className="rounded-md2 border border-border bg-white p-4">
      <div className="mb-1.5 flex items-start justify-between">
        <div>
          <div className="text-[14.5px] font-extrabold text-strong">{title}</div>
          <div className="mt-0.5 text-xs text-muted">{meta}</div>
        </div>
        <span className={`pill ${badgeClass}`}>{badge}</span>
      </div>
      <div className="my-2.5 text-[12.8px] leading-relaxed text-body">{body}</div>
      <Link href={href} className="btn-black mb-2.5 w-full justify-center">
        Tinjau Site {title} →
      </Link>
      <div className="flex justify-between text-[11.5px] text-muted">
        <span>{formatCount(items)} item</span>
        <Link href={href} className="font-bold text-strong">
          Detail →
        </Link>
      </div>
    </div>
  );
}
