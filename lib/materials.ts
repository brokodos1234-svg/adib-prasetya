// Item-level material data, lazily fetched from /public/data/review-sto.json
// (generated from sheet "Review STO" — one row per material/site/batch combination).
// Kept separate from lib/data.ts (which holds pre-aggregated totals) because this
// dataset is per-item and only needed on demand, for the material search box.

export interface MaterialItem {
  m: string; // Material code
  p: string; // Mfg Part No.
  d: string; // Description
  s: string; // SITE
  k: string; // Kategori program (REMARK)
  qp: number; // QTY Plan
  qs: number; // QTY STO
  vp: number; // Value Plan (Rp)
  vs: number; // Value STO (Rp)
  st: string; // Status STO
  fs: string; // Final Status
}

let cache: MaterialItem[] | null = null;
let inflight: Promise<MaterialItem[]> | null = null;

export function fetchMaterials(): Promise<MaterialItem[]> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;

  inflight = fetch("/data/review-sto.json")
    .then((res) => {
      if (!res.ok) throw new Error(`Gagal memuat data material (${res.status})`);
      return res.json() as Promise<MaterialItem[]>;
    })
    .then((data) => {
      cache = data;
      inflight = null;
      return data;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });

  return inflight;
}

export function searchMaterials(items: MaterialItem[], query: string, limit = 20): MaterialItem[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const results: MaterialItem[] = [];
  for (const item of items) {
    if (
      item.m.toLowerCase().includes(q) ||
      item.p.toLowerCase().includes(q) ||
      item.d.toLowerCase().includes(q)
    ) {
      results.push(item);
      if (results.length >= limit) break;
    }
  }
  return results;
}
