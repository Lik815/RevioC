import Link from 'next/link';
import { siteConfig } from '../lib/content';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__grid">
        <div>
          <div className="brand brand--footer">
            <span className="brand-mark">R</span>
            <span className="brand-word">evio</span>
          </div>
          <p className="site-footer__copy">
            Revio ist ein ruhiger, hochwertiger Zugang zu moderner Physiotherapie.
          </p>
        </div>

        <div>
          <div className="eyebrow">Navigation</div>
          <div className="footer-links">
            {siteConfig.nav.map((item) => (
              <Link key={item.href} href={item.href} className="footer-link">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="eyebrow">Rechtliches</div>
          <div className="footer-links">
            {siteConfig.footerNav.map((item) => (
              <Link key={item.href} href={item.href} className="footer-link">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
