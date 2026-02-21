import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/providers';

const dmSans = DM_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FleetFlow',
  description: 'Fleet & Logistics Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={dmSans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}