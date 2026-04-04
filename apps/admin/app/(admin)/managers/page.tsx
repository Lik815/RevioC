import { PageShell } from '../../../components/page-shell';
import { api } from '../../../lib/api';

const statusLabel: Record<string, string> = {
  PENDING_REVIEW: 'Ausstehend',
  APPROVED: 'Freigegeben',
  REJECTED: 'Abgelehnt',
  CHANGES_REQUESTED: 'Änderungen',
  SUSPENDED: 'Gesperrt',
  DRAFT: 'Entwurf',
};

export default async function ManagersPage() {
  const { managers } = await api.getManagers();
  const linkedPracticeCount = managers.filter((manager) => manager.practice).length;
  const dualRoleCount = managers.filter((manager) => manager.therapistId).length;
  const orphanedCount = managers.filter((manager) => !manager.practice).length;
  const focusManagers = orphanedCount > 0 ? managers.filter((manager) => !manager.practice) : managers;

  return (
    <PageShell
      title="Manager-Accounts"
      description="Fokus auf Bereinigung unvollständiger oder historischer Manager-Konten."
      eyebrow="Verwaltung"
      actions={<div className="hero-pill">{managers.length} Konten</div>}
    >
      <div className="review-summary-grid">
        <article className="review-summary-card">
          <div className="kicker">Mit Praxis</div>
          <strong>{linkedPracticeCount}</strong>
          <span>Sauber verknüpfte Manager-Konten</span>
        </article>
        <article className="review-summary-card review-summary-card--warning">
          <div className="kicker">Ohne Praxis</div>
          <strong>{orphanedCount}</strong>
          <span>Konten mit Bereinigungsbedarf</span>
        </article>
        <article className="review-summary-card">
          <div className="kicker">Doppelrolle</div>
          <strong>{dualRoleCount}</strong>
          <span>Manager mit zusätzlichem Therapeut:innen-Profil</span>
        </article>
      </div>

      {orphanedCount > 0 ? (
        <div className="notice-box notice-box--warning">
          <div className="notice-box__icon">!</div>
          <div>
            <strong>Bereinigung im Fokus:</strong> Es werden zuerst Manager-Konten ohne Praxis gezeigt.
            {linkedPracticeCount > 0 ? ` ${linkedPracticeCount} verknüpfte Konten gelten aktuell als unkritisch.` : ''}
          </div>
        </div>
      ) : null}

      {focusManagers.length === 0 ? (
        <div className="empty-state empty-state--compact">
          <div className="empty-illustration">◈</div>
          <strong>Keine auffälligen Manager-Konten</strong>
          <p>Aktuell gibt es keine unvollständigen oder zu bereinigenden Manager-Datensätze.</p>
        </div>
      ) : (
      <table className="table table--elevated">
        <thead>
          <tr>
            <th>Account</th>
            <th>Rolle</th>
            <th>Hinweis</th>
          </tr>
        </thead>
        <tbody>
          {focusManagers.map((m) => (
            <tr key={m.id}>
              <td data-label="Account">
                <div className="entity-cell">
                  <div className="entity-avatar">{m.email.slice(0, 1).toUpperCase()}</div>
                  <div>
                    <strong>{m.email}</strong>
                    <div className="entity-meta">Seit {new Date(m.createdAt).toLocaleDateString('de-DE')}</div>
                  </div>
                </div>
              </td>
              <td data-label="Rolle">
                <div className="priority-stack">
                  <strong style={{ fontSize: 14 }}>{m.therapistId ? 'Manager + Therapeut' : 'Nur Manager'}</strong>
                  <span className="entity-meta">{m.therapist ? m.therapist.fullName : 'Kein Therapeut:innen-Profil'}</span>
                </div>
              </td>
              <td data-label="Hinweis">
                <div className="priority-stack">
                  {m.practice ? (
                    <span className={`badge badge--${m.practice.reviewStatus}`}>
                      {statusLabel[m.practice.reviewStatus] ?? m.practice.reviewStatus}
                    </span>
                  ) : (
                    <span className="badge badge--DRAFT">Ohne Praxis</span>
                  )}
                  <span className="entity-meta">{m.practice ? `${m.practice.name} · ${m.practice.city}` : 'Legacy- oder unvollständiger Datensatz'}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </PageShell>
  );
}
