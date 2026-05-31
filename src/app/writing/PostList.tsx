"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CalendarDays, Filter } from "lucide-react";

type Post = {
  _id: string;
  slug: string;
  title: string;
  publishedAt: string | Date;
  excerpt?: string;
  tags?: string[];
};

type Category = {
  name: string;
  tags: string[];
};

export default function PostList({ posts, categories = [] }: { posts: Post[], categories?: Category[] }) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Only show categories that have at least one post matching any of their items,
  // OR whose name itself appears as a post tag.
  const activeCategories = useMemo(() => {
    return categories.filter(cat => {
      // Check if the category name itself is a post tag
      const nameMatch = posts.some(p => p.tags?.some(t => t.toLowerCase() === cat.name.toLowerCase()));
      // Check if any of the category's item titles are a post tag
      const itemMatch = posts.some(p => p.tags?.some(t => cat.tags.some(it => it.toLowerCase() === t.toLowerCase())));
      return nameMatch || itemMatch;
    });
  }, [categories, posts]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filteredPosts = useMemo(() => {
    if (selectedCategories.length === 0) return posts;
    return posts.filter(post => {
      if (!post.tags) return false;
      return selectedCategories.some(selectedCat => {
        // Find the category object
        const cat = categories.find(c => c.name === selectedCat);
        if (!cat) return false;
        const postTagsLower = post.tags!.map(t => t.toLowerCase());
        // Match if category name is a tag OR any of the category's items is a tag
        return postTagsLower.includes(cat.name.toLowerCase()) ||
          cat.tags.some(it => postTagsLower.includes(it.toLowerCase()));
      });
    });
  }, [posts, selectedCategories, categories]);

  return (
    <div className="flex flex-col gap-10">
      {/* Filter UI */}
      {activeCategories.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isFilterOpen || selectedCategories.length > 0
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filter by category
              {selectedCategories.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold">
                  {selectedCategories.length}
                </span>
              )}
            </button>
          </div>
          
          {isFilterOpen && (
            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {activeCategories.map(cat => {
                const isSelected = selectedCategories.includes(cat.name);
                return (
                  <button
                    key={cat.name}
                    onClick={() => toggleCategory(cat.name)}
                    className={`text-sm px-4 py-1.5 rounded-full transition-colors border ${
                      isSelected
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white font-medium'
                        : 'bg-transparent text-gray-600 border-gray-200 dark:text-gray-400 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
              
              {/* Clear button as a pill too, if anything is selected */}
              {selectedCategories.length > 0 && (
                <button
                  onClick={() => setSelectedCategories([])}
                  className="text-sm px-4 py-1.5 rounded-full transition-colors border bg-transparent text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Post List */}
      <section className="flex flex-col gap-0">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <article
              key={post._id.toString()}
              className="group relative flex flex-col gap-2 py-6 border-b border-gray-100 dark:border-gray-800 first:pt-0 last:border-0 hover:bg-transparent"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                <h2 className="text-base font-medium text-gray-900 dark:text-gray-100 group-hover:underline leading-snug">
                  <Link href={`/writing/${post.slug}`} className="before:absolute before:inset-0">
                    {post.title}
                  </Link>
                </h2>
                <span className="flex-shrink-0 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              {post.excerpt && (
                <p className="text-sm text-gray-900 dark:text-gray-100 font-normal leading-[1.8] line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-1">
                  {post.tags.slice(0, 4).map((tag: string) => (
                    <Link
                      key={tag}
                      href={`/exploring/tag/${encodeURIComponent(tag.replace(/\s+/g, '-'))}`}
                      className="relative z-10 text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-0.5 rounded-full transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </article>
          ))
        ) : (
          <p className="text-sm text-gray-900 dark:text-gray-100 font-normal leading-[1.8] italic">No posts found for selected topics.</p>
        )}
      </section>
    </div>
  );
}
