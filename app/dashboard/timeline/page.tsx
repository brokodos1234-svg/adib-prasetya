"use client";

import { HeroStat } from "@/components/HeroStat";
import { useDashboardData } from "@/lib/store";
import { formatIDR, formatCompactIDR } from "@/lib/data";

export default function TimelinePage() {
  const { bundle } = useDashboardData();
  const { timeline, timelineTotalActivities, timelineTotalTarget, timelineValuedActivities } = bundle;

  if (timeline.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-muted sm:px-7">
        Belum ada data timeline. Unggah workbook melalui halaman{" "}
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
          <div className="text-xl font-extrabold text-strong sm:text-[22px]">Timeline Eksekusi</div>
          <div className="mt-0.5 text-[12.5px] text-muted">
            Time frame implementasi Reduce Inventory Site Bayan
          </div>
        </div>
      </div>

      <div className="px-4 pb-8 sm:px-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-5 rounded-lg2 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f766e] px-6 py-6 text-white sm:px-7">
          <div>
            <h2 className="mb-3 text-xl font-extrabold sm:text-2xl">
              {formatCompactIDR(timelineTotalTarget)} target eksekusi tercatat di {timelineValuedActivities} aktivitas
            </h2>
            <div className="flex flex-wrap gap-6">
              <HeroStat value={timelineTotalActivities} label="Total Aktivitas" />
              <HeroStat value={timeline.length} label="Fase Program" />
              <HeroStat value={timelineValuedActivities} label="Aktivitas Bernilai" />
            </div>
          </div>
          <div className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-white/10 text-3xl">
            ◷
          </div>
        </div>

        <div className="mb-4 flex gap-3 rounded-lg2 border border-[#f5dfad] bg-[#fef1da] p-5">
          <div className="text-lg">⚠️</div>
          <div className="text-[13px] leading-relaxed text-[#7c5a0a]">
            <b>Catatan sumber data:</b> Jadwal mingguan (W1–W5) pada tracker TIMELINE belum diisi oleh perencana,
            sehingga progres per-aktivitas di bawah ini ditampilkan berdasarkan <b>nilai target (Rp)</b> yang sudah
            ditetapkan, bukan persentase minggu berjalan. Angka <b>achievement</b> di halaman Overview dihitung dari
            data realisasi STO aktual (sheet Review STO) untuk aktivitas yang sudah berjalan.
          </div>
        </div>

        {timeline.map((phase) => (
          <div key={phase.phase} className="card mb-4">
            <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
              <div className="text-base font-extrabold text-strong">
                Fase {phase.phase} · {phase.title}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Aktivitas</th>
                    <th>Target Nilai (Rp)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {phase.activities.map((a) => (
                    <tr key={a.code}>
                      <td className="font-bold text-strong">{a.code}</td>
                      <td>{a.name}</td>
                      <td>{a.targetValue !== null ? formatIDR(a.targetValue) : "—"}</td>
                      <td>
                        {a.targetValue !== null ? (
                          <span className="pill pill-green">Bernilai</span>
                        ) : (
                          <span className="pill pill-gray">Belum Ditetapkan</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
