import { buildLineGeometry } from "@/lib/chart";

export function Sparkline({
  values,
  color = "#0d9488",
  width = 240,
  height = 44,
}: {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const geo = buildLineGeometry(values, width, height, { top: 4, bottom: 4, left: 4, right: 4 });
  return (
    <svg className="block h-11 w-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline
        points={geo.points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
