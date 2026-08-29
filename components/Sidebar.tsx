"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { MaterialSearch } from "@/components/MaterialSearch";
import { useDashboardData } from "@/lib/store";
import { formatCount } from "@/lib/data";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: "▦" },
  { href: "/dashboard", label: "Kategori Program", icon: "☰" },
  { href: "/dashboard/site", label: "Breakdown Site", icon: "⌂" },
  { href: "/dashboard/dead-stock", label: "Dead Stock", icon: "▢" },
  { href: "/dashboard/timeline", label: "Timeline Eksekusi", icon: "◷" },
  { href: "/dashboard/update-data", label: "Update Data", icon: "⭯" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { bundle, meta } = useDashboardData();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex h-screen w-64 -translate-x-full flex-none flex-col
        overflow-y-auto bg-sidebar p-4 text-[#cbd2de] transition-transform duration-200 peer-checked:translate-x-0
        lg:sticky lg:top-0 lg:translate-x-0"
    >
      <div className="mb-4 flex items-center gap-2.5 border-b border-white/10 px-2 pb-5">
        <Logo className="h-5 w-auto" invert />
        <div>
          <div className="text-sm font-extrabold text-white">Warehouse Mgmt</div>
          <div className="text-[10px] text-[#7b8496]">Site Bayan</div>
        </div>
        <label
          htmlFor="sidebar-toggle"
          className="ml-auto cursor-pointer rounded-lg px-2 py-1 text-white/70 hover:bg-white/10 lg:hidden"
        >
          ✕
        </label>
      </div>

      <MaterialSearch />

      <div className="mb-2 mt-1 px-2 text-[10px] font-bold uppercase tracking-wide text-[#5c6577]">Menu</div>
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 text-[13.5px] font-semibold transition ${
                active ? "bg-white text-sidebar" : "text-[#a7afc0] hover:bg-sidebarSoft hover:text-white"
              }`}
            >
              <span className="w-[18px] flex-none opacity-85">{item.icon}</span> {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mb-2 mt-4 px-2 text-[10px] font-bold uppercase tracking-wide text-[#5c6577]">Data</div>
      <div className="flex flex-col gap-0.5">
        <div className="flex cursor-default items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 text-[13.5px] font-semibold text-[#a7afc0] opacity-60">
          <span className="w-[18px] flex-none">⤓</span> Review STO ({formatCount(bundle.totalItems)} item)
        </div>
        <div className="flex cursor-default items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 text-[13.5px] font-semibold text-[#a7afc0] opacity-60">
          <span className="w-[18px] flex-none">🕑</span> Update: {bundle.asOfLabel}
        </div>
        <div className="flex cursor-default items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 text-[13.5px] font-semibold text-[#a7afc0] opacity-60">
          <span className="w-[18px] flex-none">{meta.source === "upload" ? "📤" : "📦"}</span>
          {meta.source === "upload" ? "Data: hasil upload" : "Data: bawaan (demo)"}
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2.5 border-t border-white/10 pt-4">
        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#2a2e3a] text-xs font-bold text-white">
          WM
        </div>
        <div>
          <div className="text-[12.5px] font-bold text-white">Tim Warehouse Bayan</div>
          <div className="text-[10.5px] text-[#7b8496]">Program Reduce Inventory</div>
        </div>
      </div>
    </aside>
  );
}
