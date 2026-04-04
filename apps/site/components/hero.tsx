import Link from 'next/link';

type HeroProps = {
  eyebrow: string;
  title: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function Hero({
  eyebrow,
  title,
  body,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: HeroProps) {
  return (
    <section className="hero">
      <div className="shell hero__grid">
        <div className="hero__copy">
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p className="hero__body">{body}</p>
          <div className="hero__actions">
            <Link href={primaryHref} className="button button--primary">
              {primaryLabel}
            </Link>
            {secondaryHref && secondaryLabel ? (
              <Link href={secondaryHref} className="button button--ghost">
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card__line" />
          <div className="hero-card__label">Revio</div>
          <div className="hero-card__text">
            Die Präsentationsseite soll erklären, Vertrauen schaffen und einen hochwertigen ersten Eindruck setzen — nicht das Produkt duplizieren.
          </div>
          <div className="hero-card__meta">
            Finden · Einordnen · Kontakt aufnehmen
          </div>
        </div>
      </div>
    </section>
  );
}
