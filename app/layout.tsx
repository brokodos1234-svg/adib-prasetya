import type { Metadata } from "next";
import "./globals.css";
import { DashboardDataProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "BSS Warehouse Management — Reduce Inventory Site Bayan",
  description:
    "Dashboard pemantauan progres program reduce inventory Site Bayan: SOH harian, capaian STO per site, kategori program, dan dead stock.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">
        <DashboardDataProvider>{children}</DashboardDataProvider>
      </body>
    </html>
  );
}
