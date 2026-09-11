// ============================================================================
// Centralized data layer for the Warehouse Management Dashboard.
//
// SOURCE: "Plan Reduce Inventory Bayan.xlsx" — sheets DASHBOARD, DAILY,
//         "Review STO", TIMELINE. Site Bayan, program Reduce Inventory.
// DEFAULT SNAPSHOT PERIOD: Agustus-September 2026, as of 2026-09-11.
//
// This file defines the *shape* of a dashboard dataset (DashboardRaw), a pure
// function to derive every KPI/total from it (buildBundle), and the bundled
// default dataset (DEFAULT_RAW) used until someone uploads a newer workbook
// on the "Update Data" page (see lib/store.tsx + app/dashboard/update-data).
// ============================================================================

// ---- Daily SOH series (sheet DAILY) --------------------------------------
export interface DailyPoint {
  date: string; // YYYY-MM-DD
  soh: number;
  received: number;
  issued: number;
  stoOut: number;
}

// ---- Status realisasi STO (count + value) ---------------------------------
export interface StatusBreakdown {
  status: "CLOSE STO" | "BLM PROGRESS" | "OPEN STO";
  label: string;
  count: number;
  plan: number;
  sto: number;
  color: string;
}

// ---- Kategori Program (REMARK on "Review STO") ----------------------------
export interface CategoryRow {
  name: string;
  note?: string;
  items: number;
  plan: number;
  sto: number;
}

// ---- Breakdown Site (SITE on "Review STO") ---------------------------------
export interface SiteRow {
  name: string;
  items: number;
  plan: number;
  sto: number;
}

// ---- Dead Stock detail (batches, all destined to DC Palaran) --------------
export interface DeadStockBatch {
  batch: string;
  items: number;
  plan: number;
  sto: number;
  site: string;
  statusBreakdown: { status: string; count: number; plan: number; sto: number }[];
}

// ---- Timeline eksekusi (sheet TIMELINE) ------------------------------------
export interface TimelineActivity {
  code: string;
  name: string;
  targetValue: number | null; // null = belum ditetapkan pada tracker
}

export interface TimelinePhase {
  phase: string;
  title: string;
  activities: TimelineActivity[];
}

// ---- The full raw dataset (one workbook snapshot) --------------------------
export interface DashboardRaw {
  period: string; // e.g. "Agustus 2026"
  asOf: string; // ISO date, e.g. "2026-08-29"
  asOfLabel: string; // e.g. "29 Agustus 2026"
  sourceLabel: string;
  daily: DailyPoint[];
  categories: CategoryRow[];
  sites: SiteRow[];
  statusBreakdown: StatusBreakdown[];
  deadStock: DeadStockBatch[];
  timeline: TimelinePhase[];
}

// ---- Everything derived from a DashboardRaw, ready for the UI -------------
export interface DashboardBundle extends DashboardRaw {
  sohLatest: number;
  sohStart: number;
  sohChangePct: number;
  totalItems: number;
  totalPlanValue: number;
  totalStoValue: number;
  achievementPct: number;
  deadStockTotalItems: number;
  deadStockTotalPlan: number;
  deadStockTotalSto: number;
  timelineTotalActivities: number;
  timelineValuedActivities: number;
  timelineTotalTarget: number;
}

export function buildBundle(raw: DashboardRaw): DashboardBundle {
  const sohLatest = raw.daily.length ? raw.daily[raw.daily.length - 1].soh : 0;
  const sohStart = raw.daily.length ? raw.daily[0].soh : 0;
  const sohChangePct = sohStart !== 0 ? (sohLatest - sohStart) / sohStart : 0;

  const totalItems = raw.categories.reduce((a, c) => a + c.items, 0);
  const totalPlanValue = raw.categories.reduce((a, c) => a + c.plan, 0);
  const totalStoValue = raw.categories.reduce((a, c) => a + c.sto, 0);
  const achievementPct = totalPlanValue !== 0 ? totalStoValue / totalPlanValue : 0;

  const deadStockTotalItems = raw.deadStock.reduce((a, b) => a + b.items, 0);
  const deadStockTotalPlan = raw.deadStock.reduce((a, b) => a + b.plan, 0);
  const deadStockTotalSto = raw.deadStock.reduce((a, b) => a + b.sto, 0);

  const allActivities = raw.timeline.flatMap((p) => p.activities);
  const timelineTotalActivities = allActivities.length;
  const timelineValuedActivities = allActivities.filter((a) => a.targetValue !== null).length;
  const timelineTotalTarget = allActivities.reduce((sum, a) => sum + (a.targetValue ?? 0), 0);

  return {
    ...raw,
    sohLatest,
    sohStart,
    sohChangePct,
    totalItems,
    totalPlanValue,
    totalStoValue,
    achievementPct,
    deadStockTotalItems,
    deadStockTotalPlan,
    deadStockTotalSto,
    timelineTotalActivities,
    timelineValuedActivities,
    timelineTotalTarget,
  };
}

// ============================================================================
// DEFAULT dataset — bundled snapshot, Agustus-September 2026 (as of 2026-09-11).
// ============================================================================

export const DEFAULT_RAW: DashboardRaw = {
  "period": "AGUSTUS-SEPTEMBER 2026",
  "asOf": "2026-09-11",
  "asOfLabel": "11 September 2026",
  "sourceLabel": "Plan Reduce Inventory Bayan.xlsx (sheet DASHBOARD, DAILY, Review STO, TIMELINE)",
  "daily": [
    {
      "date": "2026-08-08",
      "soh": 40893584108,
      "received": 854953499,
      "issued": 729332382,
      "stoOut": 129594177
    },
    {
      "date": "2026-08-09",
      "soh": 37612323910,
      "received": 227216018,
      "issued": 736280102,
      "stoOut": 2797794592
    },
    {
      "date": "2026-08-10",
      "soh": 35426415887,
      "received": 192509240,
      "issued": 592945443,
      "stoOut": 1780474543
    },
    {
      "date": "2026-08-11",
      "soh": 34724599024,
      "received": 394435550,
      "issued": 918531099,
      "stoOut": 147478288
    },
    {
      "date": "2026-08-12",
      "soh": 35052156040,
      "received": 1460758816,
      "issued": 2274748513,
      "stoOut": 1836515
    },
    {
      "date": "2026-08-13",
      "soh": 34471870975,
      "received": 788685108,
      "issued": 1145402462,
      "stoOut": 534712451
    },
    {
      "date": "2026-08-14",
      "soh": 34210084492,
      "received": 534223485,
      "issued": 512964955,
      "stoOut": 254926121
    },
    {
      "date": "2026-08-15",
      "soh": 33676924889,
      "received": 389896518,
      "issued": 426218885,
      "stoOut": 420092378
    },
    {
      "date": "2026-08-16",
      "soh": 33067894800,
      "received": 0,
      "issued": 308270411,
      "stoOut": 437669657
    },
    {
      "date": "2026-08-17",
      "soh": 33161593405,
      "received": 70043340,
      "issued": 213310311,
      "stoOut": 27694000
    },
    {
      "date": "2026-08-18",
      "soh": 32977311673,
      "received": 389836122,
      "issued": 778389019,
      "stoOut": 104754796
    },
    {
      "date": "2026-08-19",
      "soh": 33392141152,
      "received": 762781943,
      "issued": 321400565,
      "stoOut": 40163298
    },
    {
      "date": "2026-08-20",
      "soh": 32422716770,
      "received": 96942300,
      "issued": 1057323016,
      "stoOut": 72577871
    },
    {
      "date": "2026-08-21",
      "soh": 32295171559,
      "received": 657890321,
      "issued": 1484151189,
      "stoOut": 0
    },
    {
      "date": "2026-08-22",
      "soh": 31448435543,
      "received": 374608029,
      "issued": 530158913,
      "stoOut": 31512366
    },
    {
      "date": "2026-08-23",
      "soh": 31448435543,
      "received": 136853040,
      "issued": 655026031,
      "stoOut": 60429428
    },
    {
      "date": "2026-08-24",
      "soh": 28400190874,
      "received": 386497080,
      "issued": 1371634128,
      "stoOut": 2047054258
    },
    {
      "date": "2026-08-25",
      "soh": 27760288045,
      "received": 269683760,
      "issued": 657443728,
      "stoOut": 6088285
    },
    {
      "date": "2026-08-26",
      "soh": 27074524256,
      "received": 1166590920,
      "issued": 1754295433,
      "stoOut": 944192
    },
    {
      "date": "2026-08-27",
      "soh": 24853746843,
      "received": 374855125,
      "issued": 758826428,
      "stoOut": 2151346190
    },
    {
      "date": "2026-08-28",
      "soh": 24749030718,
      "received": 508939120,
      "issued": 499152166,
      "stoOut": 45356688
    },
    {
      "date": "2026-08-29",
      "soh": 24821450034,
      "received": 491939410,
      "issued": 448559066,
      "stoOut": 116385869
    },
    {
      "date": "2026-08-30",
      "soh": 24599474810,
      "received": 99575040,
      "issued": 890379611,
      "stoOut": 356938480
    },
    {
      "date": "2026-08-31",
      "soh": 24061305769,
      "received": 46592980,
      "issued": 848342325,
      "stoOut": 211136000
    },
    {
      "date": "2026-09-01",
      "soh": 23938003343,
      "received": 1586062957,
      "issued": 1364449216,
      "stoOut": 62698474
    },
    {
      "date": "2026-09-02",
      "soh": 24432095734,
      "received": 6256535980,
      "issued": 389753599,
      "stoOut": 50307683
    },
    {
      "date": "2026-09-03",
      "soh": 24203663541,
      "received": 160802600,
      "issued": 293331732,
      "stoOut": 20890220
    },
    {
      "date": "2026-09-04",
      "soh": 24057067134,
      "received": 65665320,
      "issued": 96704047,
      "stoOut": 96370250
    },
    {
      "date": "2026-09-05",
      "soh": 24447325373,
      "received": 490762970,
      "issued": 319017133,
      "stoOut": 82410573
    },
    {
      "date": "2026-09-06",
      "soh": 28313277180,
      "received": 4726671970,
      "issued": 844913802,
      "stoOut": 209965312
    },
    {
      "date": "2026-09-07",
      "soh": 24215438923,
      "received": 39729840,
      "issued": 3796274186,
      "stoOut": 307074685
    },
    {
      "date": "2026-09-08",
      "soh": 23956212758,
      "received": 244883975,
      "issued": 293285468,
      "stoOut": 161807667
    },
    {
      "date": "2026-09-09",
      "soh": 23597466802,
      "received": 30211200,
      "issued": 480251847,
      "stoOut": 5626
    },
    {
      "date": "2026-09-10",
      "soh": 23669709131,
      "received": 3315405240,
      "issued": 3335312305,
      "stoOut": 6182111
    },
    {
      "date": "2026-09-11",
      "soh": 23666276439,
      "received": 0,
      "issued": 15592525,
      "stoOut": 0
    }
  ],
  "categories": [
    {
      "name": "Slow Moving Batch 1",
      "items": 838,
      "plan": 6335383767.5661,
      "sto": 4768812564.7740135
    },
    {
      "name": "Dead Stock Batch 1",
      "items": 367,
      "plan": 2830292572.333333,
      "sto": 2633238998.008077
    },
    {
      "name": "Dead Stock Batch 2",
      "items": 269,
      "plan": 1945715688.767857,
      "sto": 1872540856.267857
    },
    {
      "name": "Medium Moving 1",
      "items": 236,
      "plan": 1663820713.5423748,
      "sto": 1428473011.189922
    },
    {
      "name": "Collecting Hose",
      "items": 221,
      "plan": 1067781444.4214646,
      "sto": 1067781444.4214646
    },
    {
      "name": "Early STO",
      "items": 182,
      "plan": 816797174.219139,
      "sto": 791007683.0593811
    },
    {
      "name": "Dead Stock Batch 3",
      "items": 173,
      "plan": 585409015.5312916,
      "sto": 293908902.09795845
    },
    {
      "name": "XE900 & SDLG",
      "items": 147,
      "plan": 581338453,
      "sto": 221716991.0571478
    },
    {
      "name": "3MRP",
      "items": 69,
      "plan": 565454398.991342,
      "sto": 328960346.7640693
    },
    {
      "name": "Fast Moving",
      "items": 90,
      "plan": 313775457.40472674,
      "sto": 274927780.77194303
    },
    {
      "name": "Lainnya",
      "note": "26 kategori lain",
      "items": 320,
      "plan": 1325595873.3419535,
      "sto": 1182202712.9417
    }
  ],
  "sites": [
    {
      "name": "DC PALARAN",
      "items": 2139,
      "plan": 14887229810.118574,
      "sto": 12523582384.715445
    },
    {
      "name": "MBLM",
      "items": 384,
      "plan": 1670375855.7105975,
      "sto": 1304572348.6733131
    },
    {
      "name": "MHU",
      "items": 300,
      "plan": 1034102428.5680017,
      "sto": 603970799.9923656
    },
    {
      "name": "CDI",
      "items": 45,
      "plan": 350932873.8101661,
      "sto": 346861929.5601661
    },
    {
      "name": "COMEX PALARAN",
      "items": 14,
      "plan": 32803088.76715686,
      "sto": 32701424.76715686
    },
    {
      "name": "COMEX MSJ",
      "items": 15,
      "plan": 24233385,
      "sto": 24233385
    },
    {
      "name": "MSJ",
      "items": 11,
      "plan": 17174554.23600386,
      "sto": 15171814.73600386
    },
    {
      "name": "MAS",
      "items": 3,
      "plan": 14512562.90909091,
      "sto": 12477203.90909091
    },
    {
      "name": "TDM",
      "items": 1,
      "plan": 0,
      "sto": 0
    }
  ],
  "statusBreakdown": [
    {
      "status": "CLOSE STO",
      "label": "Close STO",
      "color": "#0d9488",
      "count": 1976,
      "plan": 12972129398.991638,
      "sto": 12327013443.271885
    },
    {
      "status": "BLM PROGRESS",
      "label": "Belum Progress",
      "color": "#d97706",
      "count": 518,
      "plan": 3059374416.28796,
      "sto": 742307738.0672265
    },
    {
      "status": "OPEN STO",
      "label": "Open STO",
      "color": "#e11d48",
      "count": 418,
      "plan": 1999860743.8399932,
      "sto": 1794250110.0144296
    }
  ],
  "deadStock": [
    {
      "batch": "Batch 1",
      "items": 367,
      "plan": 2830292572.333333,
      "sto": 2633238998.008077,
      "site": "DC PALARAN",
      "statusBreakdown": [
        {
          "status": "CLOSE STO",
          "count": 335,
          "plan": 2722386726.333333,
          "sto": 2631760239.258077
        },
        {
          "status": "BLM PROGRESS",
          "count": 32,
          "plan": 107905846,
          "sto": 1478758.75
        }
      ]
    },
    {
      "batch": "Batch 2",
      "items": 269,
      "plan": 1945715688.767857,
      "sto": 1872540856.267857,
      "site": "DC PALARAN",
      "statusBreakdown": [
        {
          "status": "CLOSE STO",
          "count": 268,
          "plan": 1945205364.767857,
          "sto": 1872030532.267857
        },
        {
          "status": "OPEN STO",
          "count": 1,
          "plan": 510324,
          "sto": 510324
        }
      ]
    },
    {
      "batch": "Batch 3",
      "items": 173,
      "plan": 585409015.5312916,
      "sto": 293908902.09795845,
      "site": "DC PALARAN",
      "statusBreakdown": [
        {
          "status": "BLM PROGRESS",
          "count": 35,
          "plan": 296084922,
          "sto": 0
        },
        {
          "status": "OPEN STO",
          "count": 138,
          "plan": 289324093.5312918,
          "sto": 293908902.09795845
        }
      ]
    }
  ],
  timeline: [
    {
      phase: "1",
      title: "Perencanaan & Pemetaan Aset",
      activities: [
        { code: "1.A", name: "List Aset Logistik", targetValue: null },
        { code: "1.B", name: "List Schedule Maping Inventory Bayan", targetValue: null },
        { code: "1.C", name: "Revisi dan Finalisasi Plan Eksekusi", targetValue: null },
      ],
    },
    {
      phase: "2",
      title: "Eksekusi",
      activities: [
        { code: "2.A", name: "Prepare dan STO Dead Stock Batch 1 ke DC Palaran", targetValue: 2839176938.05 },
        { code: "2.B", name: "Prepare dan STO Dead Stock Batch 2 ke DC Palaran", targetValue: 2093208846.77 },
        { code: "2.C", name: "Prepare & Listing Part Free Stock (Analisa GR GI 2024-2025)", targetValue: null },
        { code: "2.D", name: "Prepare dan STO/GI Deterministic Part by Moving Unit Batch 1", targetValue: 17337954955.12 },
        { code: "2.E", name: "Prepare dan STO Item Fast Moving Site Tujuan", targetValue: 10723736702.92 },
        { code: "2.F", name: "Prepare dan STO LIB Site Tujuan", targetValue: 3297637412.04 },
        { code: "2.G", name: "Prepare dan STO/GI Deterministic Part by Moving Unit Batch 2", targetValue: null },
        { code: "2.H", name: "Prepare dan STO by Populasi Unit Site Tujuan", targetValue: null },
        { code: "2.I", name: "Prepare dan STO Stock ke DC Palaran", targetValue: null },
      ],
    },
    {
      phase: "3",
      title: "Evaluasi",
      activities: [
        { code: "3.A", name: "Analisa dan Evaluasi First Different", targetValue: null },
        { code: "3.B", name: "Zero Inventory Bayan", targetValue: null },
      ],
    },
  ],
};

export const DEFAULT_BUNDLE: DashboardBundle = buildBundle(DEFAULT_RAW);

// ---- Formatting helpers (pure, dataset-independent) ------------------------
export function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.round(value));
}

export function formatCompactIDR(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return `Rp${(value / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} M`;
  }
  if (abs >= 1_000_000) {
    return `Rp${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} Jt`;
  }
  return `Rp${formatIDR(value)}`;
}

export function formatPct(value: number, digits = 2): string {
  return `${(value * 100).toLocaleString("id-ID", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function achievementBucket(pct: number): "high" | "mid" | "low" {
  if (pct >= 0.8) return "high";
  if (pct >= 0.5) return "mid";
  return "low";
}

export function achievementStatusLabel(pct: number): { label: string; pill: string } {
  const bucket = achievementBucket(pct);
  if (bucket === "high") return { label: "On Track", pill: "pill-green" };
  if (bucket === "mid") return { label: "Kawal", pill: "pill-yellow" };
  return { label: "Perlu Perhatian", pill: "pill-red" };
}
