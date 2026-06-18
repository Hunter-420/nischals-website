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

function extractFirstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src="([^"]+)"/i);
  return match ? match[1] : null;
}

function resolveImageUrl(src: string | null, baseUrl: string): string | null {
  if (!src) return null;
  try {
    return new URL(src, baseUrl).toString();
  } catch {
    return null;
  }
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://khanalnischal.com.np').replace(/\/$/, '');
  await connectToDatabase();
  const post = await Post.findOne({ slug, published: true }).lean() as any;

  if (!post) {
    return new Response('Not Found', { status: 404 });
  }

  const title = post.title || 'Nischal Khanal';
  const description = post.keyTakeaway || post.excerpt || 'Systems engineering, performance, and continuous learning.';
  const tags = Array.isArray(post.tags) ? post.tags.slice(0, 3) : [];
  const imageUrl = resolveImageUrl(extractFirstImage(post.content || '') || post.coverImage || null, baseUrl);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        background:
          'radial-gradient(circle at top left, rgba(59, 130, 246, 0.20), transparent 34%), radial-gradient(circle at bottom right, rgba(15, 23, 42, 0.14), transparent 30%), linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        color: '#0f172a',
        padding: '44px',
        position: 'relative',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '26px',
          border: '1px solid rgba(15, 23, 42, 0.12)',
          borderRadius: '30px',
        }}
      />
      <div style={{ display: 'flex', gap: '28px', width: '100%', height: '100%', zIndex: 1 }}>
        <div
          style={{
            flex: '1.08',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '24px',
            padding: '18px 14px 18px 10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '860px' }}>
            <div
              style={{
                fontSize: '60px',
                lineHeight: 1.03,
                fontWeight: 800,
                letterSpacing: '-0.055em',
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: '28px',
                lineHeight: 1.35,
                color: '#334155',
                maxWidth: '820px',
              }}
            >
              {description}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '18px' }}>
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
                fontSize: '18px',
                color: '#475569',
              }}
            >
              <span>khanalnischal.com.np</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>Systems and performance engineering</span>
            </div>
          </div>
        </div>

        <div
          style={{
            flex: '0.92',
            position: 'relative',
            borderRadius: '28px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.08), rgba(59, 130, 246, 0.14))',
            border: '1px solid rgba(15, 23, 42, 0.10)',
            boxShadow: '0 28px 80px rgba(15, 23, 42, 0.18)',
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                textAlign: 'center',
                fontSize: '28px',
                fontWeight: 700,
                color: '#334155',
              }}
            >
              {title}
            </div>
          )}
        </div>
      </div>
    </div>,
    size
  );
}