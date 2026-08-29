import { Sidebar } from "@/components/Sidebar";
import { Logo } from "@/components/Logo";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-page">
      <div className="flex min-h-screen">
        {/* Must be true siblings of <Sidebar/> (not nested) for Tailwind's peer-checked
            general-sibling selector to reach the <aside>. */}
        <input type="checkbox" id="sidebar-toggle" className="peer hidden" />
        <label
          htmlFor="sidebar-toggle"
          className="fixed inset-0 z-30 hidden bg-black/30 peer-checked:block lg:hidden"
        />
        <Sidebar />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
            <label htmlFor="sidebar-toggle" className="cursor-pointer rounded-lg p-1.5 text-strong hover:bg-soft">
              ☰
            </label>
            <Logo className="h-5 w-auto" />
            <span className="text-sm font-bold text-strong">Warehouse Mgmt</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
