import { PageShell } from '../../../components/page-shell';
import { AdminApiError, api } from '../../../lib/api';
import { updateAppFeedbackStatus } from '../../../lib/actions';

type SearchParams = Promise<{ status?: string }>;

const statusLabel = {
  NEW: 'Neu',
  RESOLVED: 'Erledigt',
} as const;

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function FeedbackPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const statusFilter = params.status === 'NEW' || params.status === 'RESOLVED' ? params.status : 'ALL';
  let feedbackError: string | null = null;
  let feedback: Awaited<ReturnType<typeof api.getAppFeedback>> = [];

  try {
    feedback = await api.getAppFeedback();
  } catch (error) {
    if (error instanceof AdminApiError) {
      feedbackError = error.message;
    } else if (error instanceof Error) {
      feedbackError = error.message;
    } else {
      feedbackError = 'Feedback konnte gerade nicht geladen werden.';
    }
  }

  const filtered = feedback.filter((item) => statusFilter === 'ALL' || item.status === statusFilter);
  const newCount = feedback.filter((item) => item.status === 'NEW').length;
  const resolvedCount = feedback.filter((item) => item.status === 'RESOLVED').length;

  return (
    <PageShell
      title="Feedback"
      description="Rückmeldungen aus der App zentral einsehen und als erledigt markieren."
      eyebrow="Support"
      actions={<div className="hero-pill">{filtered.length} Einträge</div>}
    >
      <div className="review-summary-grid">
        <article className="review-summary-card">
          <div className="kicker">Neu</div>
          <strong>{newCount}</strong>
          <span>Offene Rückmeldungen</span>
        </article>
        <article className="review-summary-card">
          <div className="kicker">Erledigt</div>
          <strong>{resolvedCount}</strong>
          <span>Bereits bearbeitet</span>
        </article>
      </div>

      <form className="toolbar" action="/feedback">
        <select name="status" defaultValue={statusFilter} className="toolbar-select">
          <option value="ALL">Alle Status</option>
          <option value="NEW">Neu</option>
          <option value="RESOLVED">Erledigt</option>
        </select>
        <button className="primary-btn" type="submit">Filtern</button>
      </form>

      {feedbackError ? (
        <article className="panel panel--compact">
          <div className="panel-header">
            <div className="panel-header__content">
              <div className="kicker">Feedback</div>
              <h3>Feedback aktuell nicht verfügbar</h3>
              <p className="panel-header__description">
                Die Admin-App konnte die Feedback-Daten gerade nicht laden. Wahrscheinlich ist die API oder die Datenbankmigration für `AppFeedback` noch nicht vollständig live.
              </p>
            </div>
          </div>
          <p className="table-note" style={{ marginTop: 0 }}>{feedbackError}</p>
        </article>
      ) : filtered.length === 0 ? (
        <div className="empty-state empty-state--compact">
          <div className="empty-illustration">💬</div>
          <strong>Kein Feedback für diesen Filter</strong>
          <p>Aktuell gibt es keine passenden Rückmeldungen aus der App.</p>
        </div>
      ) : (
        <table className="table table--elevated focus-table">
          <thead>
            <tr>
              <th>Eingang</th>
              <th>Absender</th>
              <th>Nachricht</th>
              <th>Status</th>
              <th>Aktion</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const nextStatus = item.status === 'NEW' ? 'RESOLVED' : 'NEW';
              const badgeClass = item.status === 'RESOLVED' ? 'badge badge--APPROVED' : 'badge badge--PENDING_REVIEW';

              return (
                <tr key={item.id}>
                  <td data-label="Eingang">
                    <strong>{formatDateTime(item.createdAt)}</strong>
                  </td>
                  <td data-label="Absender">
                    <div style={{ display: 'grid', gap: 6 }}>
                      <strong>{item.email}</strong>
                      <span className={`badge ${item.isAuthenticated ? 'badge--APPROVED' : 'badge--DRAFT'}`}>
                        {item.isAuthenticated ? 'Eingeloggt' : 'Gast'}
                      </span>
                    </div>
                  </td>
                  <td data-label="Nachricht" style={{ maxWidth: 420 }}>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{item.message}</div>
                  </td>
                  <td data-label="Status">
                    <span className={badgeClass}>{statusLabel[item.status]}</span>
                  </td>
                  <td data-label="Aktion">
                    <form action={updateAppFeedbackStatus.bind(null, item.id)}>
                      <input type="hidden" name="status" value={nextStatus} />
                      <button className={`primary-btn ${item.status === 'RESOLVED' ? 'primary-btn--muted' : ''}`} type="submit">
                        {item.status === 'NEW' ? 'Als erledigt markieren' : 'Wieder öffnen'}
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </PageShell>
  );
}
