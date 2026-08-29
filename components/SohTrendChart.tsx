import { buildLineGeometry } from "@/lib/chart";
import type { DailyPoint } from "@/lib/data";

export function SohTrendChart({ data }: { data: DailyPoint[] }) {
  const W = 900;
  const H = 260;
  const pad = { top: 15, bottom: 15, left: 10, right: 10 };
  const geo = buildLineGeometry(
    data.map((d) => d.soh),
    W,
    H,
    pad
  );

  const labelCount = Math.min(6, data.length);
  const labelIdx = Array.from(
    new Set(
      Array.from({ length: labelCount }, (_, i) =>
        Math.round(((data.length - 1) * i) / (labelCount - 1 || 1))
      )
    )
  );
  const shortDate = (iso: string) =>
    new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "UTC" }).format(
      new Date(`${iso}T00:00:00Z`)
    );

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
        <line x1={pad.left} y1={pad.top} x2={W - pad.right} y2={pad.top} stroke="#e6e8ec" strokeWidth={1} />
        <line
          x1={pad.left}
          y1={(H - pad.top - pad.bottom) / 2 + pad.top}
          x2={W - pad.right}
          y2={(H - pad.top - pad.bottom) / 2 + pad.top}
          stroke="#e6e8ec"
          strokeWidth={1}
        />
        <line
          x1={pad.left}
          y1={H - pad.bottom}
          x2={W - pad.right}
          y2={H - pad.bottom}
          stroke="#e6e8ec"
          strokeWidth={1}
        />
        <defs>
          <linearGradient id="sohAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={geo.areaPath} fill="url(#sohAreaGrad)" />
        <polyline
          points={geo.points}
          fill="none"
          stroke="#0d9488"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={geo.last.x} cy={geo.last.y} r={4.5} fill="#0d9488" />
        <circle cx={geo.last.x} cy={geo.last.y} r={8} fill="#0d9488" opacity={0.18} />
      </svg>
      <div className="mt-1.5 flex justify-between text-[10.5px] text-faint">
        {labelIdx.map((i) => (
          <span key={i}>{shortDate(data[i].date)}</span>
        ))}
      </div>
    </div>
  );
}
