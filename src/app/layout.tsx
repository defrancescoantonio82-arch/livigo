import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "LIVIGO · Muoviti a Livigno",
  description:
    "Orari programmati Silvestri di Livigno da PDF ufficiali. Blu, Verde e Trepalle. Nessun dato in tempo reale.",
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
