export function HeroStat({ value, label }: { value: number | string; label: string }) {
  return (
    <div>
      <b className="block text-xl font-extrabold">{value}</b>
      <span className="text-[11.5px] text-slate-300">{label}</span>
    </div>
  );
}
