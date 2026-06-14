import Link from "next/link";

interface TechnicalArticleCardProps {
  post: any;
}

// Generate a deterministic gradient based on title
function getCardGradient(title: string) {
  const gradients = [
    "from-blue-600 to-blue-800",
    "from-blue-700 to-indigo-800",
    "from-slate-700 to-blue-800",
    "from-indigo-600 to-blue-700",
    "from-blue-800 to-slate-700",
  ];
  const idx = (title?.charCodeAt(0) || 0) % gradients.length;
  return gradients[idx];
}

function extractFirstImage(content: string): string | null {
  if (!content) return null;
  const mdMatch = content.match(/!\[.*?\]\((.*?)\)/);
  if (mdMatch && mdMatch[1]) return mdMatch[1];
  const htmlMatch = content.match(/<img[^>]+src=["'](.*?)["']/);
  if (htmlMatch && htmlMatch[1]) return htmlMatch[1];
  return null;
}

export function TechnicalArticleCard({ post }: TechnicalArticleCardProps) {
  const gradient = getCardGradient(post.title || "");
  const coverImage = post.coverImage || extractFirstImage(post.content);
  const initials = (post.title || "?")
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() || "")
    .join("");

  return (
    <Link
      href={`/writing/${post.slug}`}
      className="group flex flex-col sm:flex-row items-stretch rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-colors overflow-hidden"
    >
      {/* Thumbnail — fixed size so all cards are identical */}
      <div className="relative flex-shrink-0 w-full sm:w-[128px] h-[100px] sm:h-auto overflow-hidden border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800/60">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-white font-black text-xl tracking-wider opacity-80 font-mono z-10">
              {initials}
            </span>
            {/* Circuit-board grid pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
              backgroundSize: "10px 10px"
            }} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-center gap-2 min-w-0">
        <div className="flex justify-between items-start gap-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
            {post.title}
          </h3>
          <span className="flex-shrink-0 text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 whitespace-nowrap">
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        {(post.keyTakeaway || post.excerpt) && (
          <p className="text-sm italic text-slate-600 dark:text-slate-400 line-clamp-2">
            <span className="font-semibold not-italic text-slate-700 dark:text-slate-300 mr-1">Takeaway:</span>
            {post.keyTakeaway || post.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
