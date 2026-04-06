import Link from 'next/link';
import { PageShell } from '../../../components/page-shell';
import { createBlogPost, deleteBlogPost, toggleBlogPostPublish, updateBlogPost } from '../../../lib/actions';
import { api } from '../../../lib/api';

function formatDate(value: string | null) {
  if (!value) return 'Noch nicht veröffentlicht';
  return new Date(value).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default async function BlogPage() {
  const posts = await api.getBlogPosts();
  const publishedCount = posts.filter((post) => post.isPublished).length;

  return (
    <PageShell
      title="Blog"
      eyebrow="CMS"
      description="Verwalte die Beiträge für die öffentliche Website direkt hier im Admin."
      actions={<div className="hero-pill">{publishedCount} live</div>}
    >
      <section className="blog-admin-layout">
        <article className="panel panel--compact">
          <div className="panel-header">
            <div>
              <div className="kicker">Neuer Beitrag</div>
              <h3>Blogpost anlegen</h3>
            </div>
          </div>

          <form action={createBlogPost} className="blog-form">
            <div className="blog-form__grid">
              <label className="field">
                <span>Titel</span>
                <input name="title" placeholder="z. B. Mobile Physiotherapie finden" required />
              </label>
              <label className="field">
                <span>Slug</span>
                <input name="slug" placeholder="mobile-physiotherapie-finden" required />
              </label>
            </div>

            <label className="field">
              <span>Excerpt</span>
              <input name="excerpt" placeholder="Kurze Zusammenfassung für Übersicht und Vorschau." required />
            </label>

            <label className="field">
              <span>Autor:in</span>
              <input name="authorName" defaultValue="Revio Team" />
            </label>

            <label className="field">
              <span>Inhalt</span>
              <textarea
                name="content"
                rows={12}
                placeholder={'Schreibe den Artikel hier.\n\nNutze Leerzeilen für neue Absätze.\nBeginne Überschriften mit ## .\nListenzeilen können mit - starten.'}
                required
              />
            </label>

            <div className="settings-feature-actions">
              <button className="primary-btn" type="submit">Beitrag anlegen</button>
            </div>
          </form>
        </article>

        <aside className="settings-status-card">
          <div className="settings-status-card__eyebrow">CMS-Hinweis</div>
          <strong>Blog direkt aus dem Admin</strong>
          <p>Veröffentlichte Beiträge erscheinen sofort auf <span>my-revio.de/blog</span>.</p>
          <p>Entwürfe bleiben intern, bis du sie bewusst veröffentlichst.</p>
          <Link href="https://my-revio.de/blog" className="secondary-btn blog-open-link">
            Öffentlichen Blog öffnen
          </Link>
        </aside>
      </section>

      {posts.length === 0 ? (
        <div className="empty-state empty-state--compact">
          <div className="empty-illustration">✍️</div>
          <div>
            <h3>Noch keine Blogposts</h3>
            <p className="table-note">Lege den ersten Beitrag an und veröffentliche ihn, sobald er bereit ist.</p>
          </div>
        </div>
      ) : (
        <div className="blog-admin-list">
          {posts.map((post) => (
            <article key={post.id} className="panel panel--compact blog-admin-card">
              <div className="blog-admin-card__top">
                <div>
                  <div className="kicker">{post.slug}</div>
                  <h3>{post.title}</h3>
                  <p className="table-note">
                    {post.authorName} · {post.isPublished ? `Live seit ${formatDate(post.publishedAt)}` : 'Entwurf'}
                  </p>
                </div>
                <span className={`badge ${post.isPublished ? 'badge--APPROVED' : 'badge--DRAFT'}`}>
                  {post.isPublished ? 'Live' : 'Entwurf'}
                </span>
              </div>

              <form action={updateBlogPost.bind(null, post.id)} className="blog-form">
                <div className="blog-form__grid">
                  <label className="field">
                    <span>Titel</span>
                    <input name="title" defaultValue={post.title} required />
                  </label>
                  <label className="field">
                    <span>Slug</span>
                    <input name="slug" defaultValue={post.slug} required />
                  </label>
                </div>

                <label className="field">
                  <span>Excerpt</span>
                  <input name="excerpt" defaultValue={post.excerpt} required />
                </label>

                <label className="field">
                  <span>Autor:in</span>
                  <input name="authorName" defaultValue={post.authorName} required />
                </label>

                <label className="field">
                  <span>Inhalt</span>
                  <textarea name="content" rows={12} defaultValue={post.content} required />
                </label>

                <div className="blog-admin-actions">
                  <button className="primary-btn primary-btn--muted" type="submit">Änderungen speichern</button>
                </div>
              </form>

              <div className="blog-admin-actions">
                <form action={toggleBlogPostPublish.bind(null, post.id)}>
                  <button className="secondary-btn blog-inline-btn" type="submit">
                    {post.isPublished ? 'Als Entwurf zurücksetzen' : 'Veröffentlichen'}
                  </button>
                </form>
                <form action={deleteBlogPost.bind(null, post.id)}>
                  <button className="action-btn action-btn--reject" type="submit">Löschen</button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
