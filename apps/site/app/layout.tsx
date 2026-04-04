import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { MaintenanceScreen } from '../components/maintenance-screen';
import { SiteFooter } from '../components/site-footer';
import { SiteHeader } from '../components/site-header';
import { getSiteSettings } from '../lib/site-settings';

export const metadata: Metadata = {
  title: 'Revio',
  description: 'Ruhiger, hochwertiger Zugang zu moderner Physiotherapie.',
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: ReactNode }) {
  const siteSettings = await getSiteSettings();

  return (
    <html lang="de">
      <body suppressHydrationWarning>
        {siteSettings.underConstruction ? (
          <MaintenanceScreen />
        ) : (
          <div className="site-chrome">
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
          </div>
        )}
      </body>
    </html>
  );
}
