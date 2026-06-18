import { ImageResponse } from 'next/og';
import connectToDatabase from '@/lib/db';
import Post from '@/models/Post';

export const runtime = 'nodejs';
export const alt = 'Writing preview image';
export const size = {
  width: 1200,
  height: 630,
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  await connectToDatabase();
  const post = await Post.findOne({ slug, published: true }).lean() as any;

  if (!post) {
    return new Response('Not Found', { status: 404 });
  }

  const title = post.title || 'Nischal Khanal';
  const description = post.keyTakeaway || post.excerpt || 'Systems engineering, performance, and continuous learning.';
  const tags = Array.isArray(post.tags) ? post.tags.slice(0, 3) : [];

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background:
          'radial-gradient(circle at top left, rgba(59, 130, 246, 0.22), transparent 34%), radial-gradient(circle at bottom right, rgba(15, 23, 42, 0.18), transparent 30%), linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        color: '#0f172a',
        padding: '64px',
        position: 'relative',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '34px',
          border: '1px solid rgba(15, 23, 42, 0.12)',
          borderRadius: '28px',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '-0.03em',
          }}
        >
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #0f172a, #3b82f6)',
            }}
          />
          Nischal Khanal
        </div>
        <div
          style={{
            padding: '10px 16px',
            borderRadius: '999px',
            background: 'rgba(15, 23, 42, 0.08)',
            fontSize: '18px',
            fontWeight: 600,
          }}
        >
          Writing
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', zIndex: 1, maxWidth: '960px' }}>
        <div
          style={{
            fontSize: '22px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: '#2563eb',
          }}
        >
          Article Preview
        </div>
        <div
          style={{
            fontSize: '64px',
            lineHeight: 1.04,
            fontWeight: 800,
            letterSpacing: '-0.05em',
            maxWidth: '1040px',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: '30px',
            lineHeight: 1.35,
            color: '#334155',
            maxWidth: '980px',
          }}
        >
          {description}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1, gap: '18px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {tags.map((tag: string) => (
            <div
              key={tag}
              style={{
                padding: '10px 16px',
                borderRadius: '999px',
                background: 'rgba(15, 23, 42, 0.08)',
                color: '#0f172a',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            fontSize: '20px',
            color: '#475569',
          }}
        >
          <span>khanalnischal.com.np</span>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>Systems and performance engineering</span>
        </div>
      </div>
    </div>,
    size
  );
}