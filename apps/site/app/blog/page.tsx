import Link from 'next/link';
import { Section } from '../../components/section';
import { getPublishedBlogPosts } from '../../lib/blog';

function formatDate(value: string | null) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export const metadata = {
  title: 'Blog | Revio',
  description: 'Gedanken, Einordnung und praktische Artikel rund um moderne Physiotherapie und Revio.',
};

export default async function BlogIndexPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <Section
      eyebrow="Blog"
      title="Gedanken, Einordnung und ruhige Produkttexte"
      body="Hier erscheinen Beiträge zu moderner Physiotherapie, mobiler Versorgung und dem Aufbau von Revio."
      className="section--blog"
    >
      {posts.length === 0 ? (
        <div className="empty-blog-state">
          <h3>Der Blog startet bald.</h3>
          <p>Die ersten Beiträge werden direkt aus dem Admin veröffentlicht.</p>
        </div>
      ) : (
        <div className="blog-grid">
          {posts.map((post) => (
            <article key={post.id} className="blog-card">
              <div className="eyebrow">Magazin</div>
              <h3>{post.title}</h3>
              <p className="blog-card__meta">{post.authorName} · {formatDate(post.publishedAt)}</p>
              <p className="blog-card__excerpt">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="button button--ghost blog-card__link">
                Beitrag lesen
              </Link>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
