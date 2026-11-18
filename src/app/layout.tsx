import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "LIVIGO · Scopri. Muoviti. Vivi Livigno.",
  description:
    "Scopri Livigno e organizza i tuoi spostamenti con gli orari programmati degli autobus. Nessun dato in tempo reale.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
