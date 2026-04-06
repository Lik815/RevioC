import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedBlogPost, getPublishedBlogPosts } from '../../../lib/blog';

function formatDate(value: string | null) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function renderContent(content: string) {
  const blocks = content.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);

  return blocks.map((block, index) => {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);

    if (lines.length === 1 && lines[0].startsWith('## ')) {
      return <h2 key={index}>{lines[0].replace(/^##\s+/, '')}</h2>;
    }

    if (lines.every((line) => line.startsWith('- '))) {
      return (
        <ul key={index} className="blog-article__list">
          {lines.map((line) => (
            <li key={line}>{line.replace(/^- /, '')}</li>
          ))}
        </ul>
      );
    }

    return <p key={index}>{lines.join(' ')}</p>;
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);

  if (!post) return { title: 'Beitrag nicht gefunden | Revio' };

  return {
    title: `${post.title} | Revio Blog`,
    description: post.excerpt,
  };
}

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);

  if (!post) notFound();

  return (
    <section className="blog-article">
      <div className="shell blog-article__shell">
        <Link href="/blog" className="page-back-link blog-article__back">← Zurück zum Blog</Link>
        <div className="eyebrow">Blog</div>
        <h1>{post.title}</h1>
        <p className="blog-article__lead">{post.excerpt}</p>
        <div className="blog-article__meta">{post.authorName} · {formatDate(post.publishedAt)}</div>
        <article className="blog-article__body">
          {renderContent(post.content)}
        </article>
      </div>
    </section>
  );
}
