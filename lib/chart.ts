// Small pure-function helpers to turn a numeric series into SVG coordinates.
// No chart/UI library dependency — kept lightweight on purpose.

export interface ChartGeometry {
  points: string; // "x,y x,y ..." for <polyline>
  areaPath: string; // closed path for an area fill under the line
  last: { x: number; y: number };
  min: number;
  max: number;
}

export function buildLineGeometry(
  values: number[],
  width: number,
  height: number,
  padding: { top: number; bottom: number; left: number; right: number }
): ChartGeometry {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const n = values.length;

  const coords = values.map((v, i) => {
    const x = padding.left + (plotW * i) / (n - 1 || 1);
    const y = padding.top + plotH - ((v - min) / range) * plotH;
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  });

  const points = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const baseY = padding.top + plotH;
  const areaPath =
    `M${coords[0].x},${coords[0].y} ` +
    coords.map((c) => `L${c.x},${c.y}`).join(" ") +
    ` L${coords[coords.length - 1].x},${baseY} L${coords[0].x},${baseY} Z`;

  return { points, areaPath, last: coords[coords.length - 1], min, max };
}
