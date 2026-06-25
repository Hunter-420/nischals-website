"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Filter } from "lucide-react";
import { TechnicalArticleCard } from "@/components/ui/TechnicalArticleCard";

type Post = {
  _id: string;
  slug: string;
  title: string;
  publishedAt: string | Date;
  excerpt?: string;
  keyTakeaway?: string;
  coverImage?: string;
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
                  ? 'text-slate-900 dark:text-slate-100'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
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
                    className={`text-sm px-4 py-1.5 rounded-lg transition-colors border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100 font-medium'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200/60 text-slate-600 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-400'
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
                  className="text-sm px-4 py-1.5 rounded-lg transition-colors border bg-transparent text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Post List */}
      <section className="flex flex-col border-t border-slate-200 dark:border-slate-800">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <TechnicalArticleCard key={post._id.toString()} post={post} />
          ))
        ) : (
          <p className="text-slate-800 dark:text-slate-200 font-normal text-base leading-relaxed italic">No posts found for selected topics.</p>
        )}
      </section>
    </div>
  );
}
