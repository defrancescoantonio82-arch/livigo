import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'LIVIGO · Muoviti a Livigno', description: 'Prototipo dimostrativo per il trasporto pubblico locale di Livigno. Nessun orario ufficiale o dato in tempo reale.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="it"><body>{children}</body></html>; }
