import { ReactNode } from 'react';

type SectionProps = {
  eyebrow?: string;
  title: string;
  body?: string;
  children: ReactNode;
  className?: string;
};

export function Section({ eyebrow, title, body, children, className = '' }: SectionProps) {
  return (
    <section className={`section ${className}`.trim()}>
      <div className="shell">
        <div className="section-heading">
          {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
          <h2>{title}</h2>
          {body ? <p className="section-copy">{body}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
