import { Hero } from '../../components/hero';
import { Section } from '../../components/section';
import { principles } from '../../lib/content';

export default function AboutPage() {
  return (
    <>
      <Hero
        eyebrow="Über Revio"
        title="Warum es Revio gibt"
        body="Die Suche nach passender Physiotherapie ist oft unnötig unübersichtlich. Revio entsteht aus dem Anspruch, diesen Zugang klarer, vertrauenswürdiger und hochwertiger zu gestalten."
        primaryHref="/contact"
        primaryLabel="Kontakt"
        secondaryHref="/patients"
        secondaryLabel="Für Patient:innen"
      />

      <Section
        eyebrow="Haltung"
        title="Wofür Revio steht"
        body="Das Produkt soll nicht durch künstliche Komplexität wichtig wirken. Es soll die richtige Verbindung zwischen Bedarf und Expertise sichtbar machen."
      >
        <div className="card-grid">
          {principles.map((item) => (
            <article key={item} className="feature-card">
              <h3>{item}</h3>
              <p>Diese Richtung bestimmt sowohl das Produkt als auch die visuelle Sprache der Website.</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Bewusst nicht"
        title="Kein Marktplatz. Kein Mini-Operationssystem."
        body="Revio soll im MVP keine aufgeblähte Plattform werden, sondern ein fokussierter Zugang zu besserer Orientierung und Kontaktaufnahme."
      >
        <div className="split-panel">
          <div className="surface-card">
            <h3>Was wir vermeiden</h3>
            <ul className="check-list">
              <li>überladene Workflow-Logik</li>
              <li>unnötig schwere Buchungsprozesse</li>
              <li>laut wirkende Marketplace-Muster</li>
            </ul>
          </div>
          <div className="surface-card">
            <h3>Was wichtig bleibt</h3>
            <ul className="check-list">
              <li>gute Auffindbarkeit</li>
              <li>klare Profile</li>
              <li>Vertrauen und medizinische Glaubwürdigkeit</li>
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}
