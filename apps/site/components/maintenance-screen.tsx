import Link from 'next/link';

export function MaintenanceScreen() {
  return (
    <main className="maintenance-shell">
      <div className="maintenance-card">
        <div className="brand brand--maintenance" aria-label="Revio">
          <span className="brand-mark">R</span>
          <span className="brand-word">evio</span>
        </div>
        <div className="eyebrow">Under Construction</div>
        <h1 className="maintenance-title">Die Website wird gerade überarbeitet.</h1>
        <p className="maintenance-copy">
          Revio ist nicht offline, sondern wird gerade in Ruhe weiter geschärft. Bitte schau später noch einmal vorbei.
        </p>
        <div className="maintenance-actions">
          <a href="mailto:admin@my-revio.de" className="button button--primary">
            Kontakt per E-Mail
          </a>
          <div className="maintenance-links">
            <Link href="/impressum">Impressum</Link>
            <Link href="/datenschutz">Datenschutz</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
