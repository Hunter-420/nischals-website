import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";
import connectToDatabase from "@/lib/db";
import Exploring from "@/models/Exploring";
import Post from "@/models/Post";
import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

export const revalidate = 60;

// Slugify an item title into a URL-safe tag
function toTagSlug(title: string) {
  return encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'));
}



export default async function ExploringPage() {
  await connectToDatabase();
  const exploringData = await Exploring.find().sort({ order: 1 }).lean();

  // For each item, count how many published posts have that tag
  const allItems = (exploringData as any[]).flatMap((cat: any) =>
    cat.items.map((item: any) => item.title.toLowerCase())
  );
  const postCounts: Record<string, number> = {};
  if (allItems.length > 0) {
    const posts = await Post.find({ published: true, tags: { $in: allItems } })
      .select('tags')
      .lean();
    for (const post of posts as any[]) {
      for (const tag of (post.tags || [])) {
        postCounts[tag.toLowerCase()] = (postCounts[tag.toLowerCase()] || 0) + 1;
      }
    }
  }

  return (
    <Container>
      <Navigation />
      
      <main className="flex-1 mt-8 mb-24 flex flex-col gap-16">
        {/* Exploring Section */}
        <div className="flex flex-col gap-12">
          <header className="flex flex-col gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">What I&apos;m Exploring</h1>
            <p className="text-slate-800 dark:text-slate-200 font-normal text-base leading-relaxed max-w-xl">
              I&apos;m interested in systems where engineering decisions directly affect outcomes.
              My current focus is understanding how information moves through systems, how bottlenecks
              emerge, and why certain architectures perform better under pressure.
            </p>
          </header>

          <section className="flex flex-col gap-10">
            {(exploringData as any[]).length > 0 ? (
              (exploringData as any[]).map((cat: any) => (
                <div key={cat._id.toString()} className="flex flex-col gap-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {cat.category}
                  </h2>

                  <ul className="flex flex-col gap-2">
                    {cat.items.map((item: any) => {
                      const tagSlug = toTagSlug(item.title);
                      const count = postCounts[item.title.toLowerCase()] || 0;
                      return (
                        <li key={item._id?.toString() || item.title}>
                          <Link
                            href={`/exploring/tag/${tagSlug}`}
                            className="group flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <span className="flex-shrink-0">
                              {item.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                              )}
                            </span>

                            <span className={`flex-1 text-sm font-medium transition-colors ${
                              item.completed
                                ? 'text-slate-400 dark:text-slate-500 line-through'
                                : 'text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-100'
                            }`}>
                              {item.title}
                            </span>

                            {count > 0 && (
                              <span className="flex-shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                {count} {count === 1 ? 'post' : 'posts'}
                              </span>
                            )}

                            <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors flex-shrink-0" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-slate-500 dark:text-slate-400 italic text-sm">No exploring areas listed yet.</p>
            )}
          </section>

          <p className="text-slate-800 dark:text-slate-200 font-normal text-base leading-relaxed italic border-t border-slate-100 dark:border-slate-800 pt-8">
            The common theme across all of these areas is understanding how systems behave when performance,
            scale, and timing become important constraints.
          </p>
        </div>

      </main>
    </Container>
  );
}
