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

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {cat.items.map((item: any) => {
                      const tagSlug = toTagSlug(item.title);
                      const count = postCounts[item.title.toLowerCase()] || 0;
                      const isCompleted = item.completed;
                      return (
                        <div key={item._id?.toString() || item.title} className={`group relative flex flex-col p-5 rounded-xl border bg-white dark:bg-slate-900/40 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 ${isCompleted ? 'border-accent-blue dark:border-accent-blue/50 hover:border-accent-blue' : 'border-dashed border-slate-300 dark:border-slate-700 hover:border-neon-green/50'}`}>
                          <Link
                            href={`/exploring/tag/${tagSlug}`}
                            className="flex flex-col gap-2 flex-1"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className={`text-base font-bold transition-colors ${
                                isCompleted
                                  ? 'text-slate-800 dark:text-slate-200 group-hover:text-accent-blue'
                                  : 'text-slate-700 dark:text-slate-300 group-hover:text-neon-green'
                              }`}>
                                {item.title}
                              </span>
                              <span className="flex-shrink-0 mt-0.5">
                                {isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-accent-blue" />
                                ) : (
                                  <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                                )}
                              </span>
                            </div>

                            {count > 0 && (
                              <span className="text-[10px] font-bold tracking-widest text-accent-blue/80 uppercase mt-1">
                                {count} {count === 1 ? 'POST' : 'POSTS'} RELATED
                              </span>
                            )}
                            
                            {/* Hover Reveal Tool Stack */}
                            <div className="mt-auto pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="flex flex-wrap gap-1.5">
                                {(item.toolStack && item.toolStack.length > 0 ? item.toolStack : ['Systems', 'Architecture']).map((tool: string) => (
                                  <span key={tool} className="px-2 py-0.5 bg-slate-100 dark:bg-deep-dark text-slate-600 dark:text-slate-400 text-[10px] font-mono rounded border border-slate-200 dark:border-slate-800">
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </Link>

                          {item.relatedUrl && (
                            <div className="absolute top-full left-0 mt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-10 w-full">
                              <a href={item.relatedUrl} target="_blank" rel="noopener noreferrer" className="bg-deep-dark text-white border border-slate-800 text-xs px-3 py-2 rounded shadow-lg flex items-center justify-between w-full hover:bg-slate-900 transition-colors">
                                <span className="truncate">{item.relatedUrlText || 'View Related Work'}</span>
                                <ArrowRight className="w-3.5 h-3.5 ml-2" />
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
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
