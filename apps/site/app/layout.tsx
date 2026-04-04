import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { SiteFooter } from '../components/site-footer';
import { SiteHeader } from '../components/site-header';

export const metadata: Metadata = {
  title: 'Revio',
  description: 'Ruhiger, hochwertiger Zugang zu moderner Physiotherapie.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body suppressHydrationWarning>
        <div className="site-chrome">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
