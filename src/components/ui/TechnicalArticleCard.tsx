import Link from "next/link";

interface TechnicalArticleCardProps {
  post: any;
}

function formatDate(dateStr: string | Date): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Truncate to ~250 chars at a word boundary */
function truncate(text: string, max = 250): string {
  if (!text || text.length <= max) return text ?? "";
  const cut = text.lastIndexOf(" ", max);
  return text.slice(0, cut > 0 ? cut : max) + "…";
}

export function TechnicalArticleCard({ post }: TechnicalArticleCardProps) {
  const excerpt = truncate(post.keyTakeaway || post.excerpt || "");

  return (
    <Link
      href={`/writing/${post.slug}`}
      className="group block w-full px-0 py-7 border-b border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
    >
      {/* Row: headline + date */}
      <div className="flex items-start justify-between gap-6 w-full mb-3">
        <h3 className="font-bold text-lg sm:text-xl leading-snug text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1 min-w-0">
          {post.title}
        </h3>
        <time
          dateTime={new Date(post.publishedAt).toISOString()}
          className="flex-shrink-0 text-sm font-mono text-slate-400 dark:text-slate-500 mt-0.5 whitespace-nowrap"
        >
          {formatDate(post.publishedAt)}
        </time>
      </div>

      {/* Full-width excerpt */}
      {excerpt && (
        <p className="text-[0.97rem] text-slate-600 dark:text-slate-400 leading-[1.75] w-full">
          {excerpt}
        </p>
      )}
    </Link>
  );
}
