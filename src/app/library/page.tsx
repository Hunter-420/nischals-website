import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";
import connectToDatabase from "@/lib/db";
import LibraryItem from "@/models/LibraryItem";
import { unstable_cache } from "next/cache";

export const revalidate = 300;

const getLibraryItems = unstable_cache(
  async () => {
    await connectToDatabase();
    return LibraryItem.find().sort({ createdAt: -1 }).lean() as Promise<any[]>;
  },
  ["library-items"],
  { revalidate: 300 }
);

export const metadata = {
  title: "Library",
  description: "Books, podcasts, and articles I recommend.",
  openGraph: {
    title: "Library | Nischal Khanal",
    description: "Books, podcasts, and articles I recommend.",
  },
};

const TYPE_LABELS: Record<string, string> = {
  book: "Books",
  podcast: "Podcasts",
  article: "Articles",
  video: "Videos",
};

const TYPE_ORDER = ["book", "podcast", "article", "video"];

const STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  reading: "Currently Reading",
  "to-read": "To Read",
};

function StarRating({ rating }: { rating?: number }) {
  if (!rating) return null;
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${
            i < rating
              ? "text-amber-400 fill-amber-400"
              : "text-slate-200 dark:text-slate-700 fill-slate-200 dark:fill-slate-700"
          }`}
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default async function LibraryPage() {
  const items = await getLibraryItems();

  // Serialize Mongo docs
  const serialized = items.map((item) => ({
    ...item,
    _id: item._id.toString(),
    createdAt: item.createdAt?.toISOString?.() ?? item.createdAt,
    updatedAt: item.updatedAt?.toISOString?.() ?? item.updatedAt,
  }));

  // Group by type
  const grouped: Record<string, typeof serialized> = {};
  for (const item of serialized) {
    if (!grouped[item.type]) grouped[item.type] = [];
    grouped[item.type].push(item);
  }

  const hasItems = serialized.length > 0;

  return (
    <Container>
      <Navigation />

      <main className="flex-1 mt-8 mb-24 flex flex-col gap-12">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Library
          </h1>
          <p className="text-slate-800 dark:text-slate-200 font-normal text-base leading-relaxed">
            Books, podcasts, and articles I recommend.
          </p>
        </header>

        {!hasItems ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
            No library items yet — check back soon.
          </p>
        ) : (
          <div className="flex flex-col gap-14">
            {TYPE_ORDER.filter((t) => grouped[t]?.length).map((type) => (
              <section key={type} className="flex flex-col gap-0">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-5">
                  {TYPE_LABELS[type]}
                </h2>

                <div className="flex flex-col border-t border-slate-200 dark:border-slate-800">
                  {grouped[type].map((item) => (
                    <div
                      key={item._id}
                      className="py-6 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          {item.link ? (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-base text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug"
                            >
                              {item.title}
                            </a>
                          ) : (
                            <span className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug">
                              {item.title}
                            </span>
                          )}
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {item.author}
                          </span>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <StarRating rating={item.rating} />
                          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 whitespace-nowrap">
                            {STATUS_LABELS[item.status] ?? item.status}
                          </span>
                        </div>
                      </div>

                      {item.review && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-[1.75]">
                          {item.review}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </Container>
  );
}
