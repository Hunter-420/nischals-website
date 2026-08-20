"use client";

import { useState, useEffect } from 'react';
import { Heart, Eye } from 'lucide-react';

interface ReactButtonProps {
  type: 'post' | 'project';
  slug: string;
}

export function ReactButton({ type, slug }: ReactButtonProps) {
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for like status
    const liked = localStorage.getItem(`liked_${type}_${slug}`);
    if (liked) setHasLiked(true);

    // Fetch initial counts and register a view
    const fetchCounts = async () => {
      try {
        // Register view
        const hasViewed = sessionStorage.getItem(`viewed_${type}_${slug}`);
        if (!hasViewed) {
          const res = await fetch('/api/reactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, slug, action: 'view' }),
          });
          if (res.ok) {
            sessionStorage.setItem(`viewed_${type}_${slug}`, 'true');
            const data = await res.json();
            setLikes(data.likes);
            setViews(data.views);
          }
        } else {
          // Just fetch
          const res = await fetch(`/api/reactions?type=${type}&slug=${slug}`);
          if (res.ok) {
            const data = await res.json();
            setLikes(data.likes);
            setViews(data.views);
          }
        }
      } catch (err) {
        console.error('Failed to fetch reactions', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [type, slug]);

  const handleLike = async () => {
    if (hasLiked) return;
    
    // Optimistic update
    setLikes(prev => prev + 1);
    setHasLiked(true);
    localStorage.setItem(`liked_${type}_${slug}`, 'true');

    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, slug, action: 'like' }),
      });
      
      if (!res.ok) {
        // Revert on failure
        setLikes(prev => prev - 1);
        setHasLiked(false);
        localStorage.removeItem(`liked_${type}_${slug}`);
      }
    } catch (err) {
      setLikes(prev => prev - 1);
      setHasLiked(false);
      localStorage.removeItem(`liked_${type}_${slug}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-4 text-sm text-slate-700 animate-pulse">
        <div className="flex items-center gap-1.5"><Heart className="w-4 h-4" /> --</div>
        <div className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> --</div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <button 
        onClick={handleLike}
        disabled={hasLiked}
        className={`flex items-center gap-1.5 transition-colors ${hasLiked ? 'text-red-500 cursor-default' : 'text-slate-700 hover:text-red-500 '}`}
        title={hasLiked ? 'You liked this' : 'Like this'}
      >
        <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
        <span>{likes}</span>
      </button>
      <div className="flex items-center gap-1.5 text-slate-700 " title="Views">
        <Eye className="w-4 h-4" />
        <span>{views}</span>
      </div>
    </div>
  );
}
