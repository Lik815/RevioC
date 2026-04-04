import { Section } from '../../components/section';

export default function ImpressumPage() {
  return (
    <Section
      eyebrow="Rechtliches"
      title="Impressum"
      body="Diese Seite ist bewusst als Platzhalter für den Aufbau der Präsentationsseite angelegt."
      className="section--legal"
    >
      <div className="legal-card">
        <p>
          Vor dem öffentlichen Launch müssen hier die vollständigen und rechtsverbindlichen Angaben des Betreibers ergänzt werden.
        </p>
        <p>
          Typischerweise gehören dazu:
        </p>
        <ul className="legal-list">
          <li>Name / Firma</li>
          <li>Anschrift</li>
          <li>Kontakt-E-Mail</li>
          <li>Vertretungsberechtigte Person</li>
          <li>USt-IdNr. falls vorhanden</li>
        </ul>
      </div>
    </Section>
  );
}
