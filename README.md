# BSS Warehouse Management Dashboard

Dashboard pemantauan progres program **Reduce Inventory** di Site Bayan — SOH harian, capaian STO per site, kategori program, dan dead stock.

## Menjalankan proyek

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk halaman **Overview** (ringkasan), dan
[http://localhost:3000/dashboard](http://localhost:3000/dashboard) untuk halaman internal
(Kategori Program, Breakdown Site, Dead Stock, Timeline Eksekusi, Update Data).

## Struktur data

Seluruh angka yang ditampilkan berasal dari `Plan Reduce Inventory Bayan.xlsx` (sheet
`DASHBOARD`, `DAILY`, `Review STO`, `TIMELINE`), diagregasi menjadi bentuk `DashboardRaw` dan
dijadikan `DashboardBundle` (raw + semua total turunan) oleh `buildBundle()` di
[`lib/data.ts`](lib/data.ts). Ada dua cara data ini bisa berubah:

1. **Manual (permanen, untuk semua orang)** — edit langsung objek `DEFAULT_RAW` di `lib/data.ts`,
   lalu commit & deploy ulang.
2. **Upload lewat halaman `/dashboard/update-data` (harian, per-browser)** — lihat bagian
   "Update Data" di bawah.

Semua halaman membaca dataset aktif lewat `useDashboardData()` (lihat `lib/store.tsx`) — tidak
ada angka yang di-hardcode di komponen UI.

## Halaman

| Route | Deskripsi |
|---|---|
| `/` | Overview — ringkasan KPI, tren SOH, status realisasi STO, prioritas per site |
| `/dashboard` | Kategori Program — tabel detail per kategori (REMARK) dengan filter capaian |
| `/dashboard/site` | Breakdown Site — grafik & tabel capaian STO per site |
| `/dashboard/dead-stock` | Dead Stock — detail per batch |
| `/dashboard/timeline` | Timeline Eksekusi — fase & aktivitas program beserta target nilai |
| `/dashboard/update-data` | Update Data — unggah workbook baru untuk memperbarui seluruh dashboard |

## Update Data

Halaman `/dashboard/update-data` membiarkan siapa pun mengunggah `Plan Reduce Inventory
Bayan.xlsx` versi terbaru langsung dari browser:

- Parsing 100% di client (`lib/parseWorkbook.ts`, pakai library `xlsx`/SheetJS) — file tidak
  pernah dikirim ke server manapun.
- Membaca ulang sheet `DAILY` (tren SOH), `Review STO` (kategori/site/status/dead stock,
  agregasi otomatis berdasarkan kolom `REMARK`/`SITE`/`Status STO`), `TIMELINE` (fase &
  aktivitas), dan judul periode dari sheet `DASHBOARD`.
- Menampilkan pratinjau + peringatan (mis. kolom/sheet yang tidak ditemukan) sebelum diterapkan.
- "Terapkan ke Dashboard" menyimpan hasil parse ke `localStorage` (`lib/store.tsx`) — dipakai
  otomatis oleh semua halaman selama browser/perangkat yang sama, tanpa perlu restart server.
- Karena ini situs statis tanpa database, pembaruan lewat upload **hanya berlaku di browser yang
  mengunggah**. Untuk menjadikannya permanen (terlihat semua orang), pakai tombol "Salin kode
  `lib/data.ts`" di halaman yang sama, tempelkan ke `lib/data.ts`, lalu deploy ulang.

Format sheet yang diharapkan sama persis dengan workbook aslinya — lihat komentar di
`lib/parseWorkbook.ts` untuk nama kolom yang dicari per sheet.

## Pencarian material

Kotak pencarian di sidebar (`components/MaterialSearch.tsx`) mencari kode material, part
number, atau deskripsi langsung dari data item-level sheet `Review STO`, di-generate ke
`public/data/review-sto.json`. Data dimuat sekali (lazy, saat kotak pencarian difokus) lalu
difilter di browser — tidak butuh backend/API. File ini statis (snapshot bundel), terpisah dari
alur upload/`update-data` di atas; perbarui manual bila perlu data pencarian yang sama-sama baru.

## Preview statis (tanpa instalasi)

Folder [`../preview`](../preview) berisi versi HTML+CSS mandiri (tanpa dependency, tanpa CDN)
dari desain yang sama — buka `preview/index.html` langsung di browser untuk cek visual cepat
tanpa perlu `npm install`. Halaman Update Data di preview statis ini adalah mockup tampilan saja
(parsing file .xlsx penuh hanya berjalan di versi Next.js).

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Tidak ada dependency chart/UI library eksternal — semua grafik adalah SVG custom
  (lihat `components/SohTrendChart.tsx`, `components/Sparkline.tsx`, `lib/chart.ts`)
- `xlsx` (SheetJS) dipakai khusus untuk membaca file yang diunggah di halaman Update Data
