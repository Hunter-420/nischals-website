import { MetadataRoute } from 'next';
import connectToDatabase from '@/lib/db';
import Post from '@/models/Post';
import Project from '@/models/Project';
import Exploring from '@/models/Exploring';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectToDatabase();

  // Static routes
  const routes = ['', '/about', '/projects', '/writing', '/certifications', '/exploring', '/what-i-bring', '/now', '/resume'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic Posts
  const posts = await Post.find({ published: true }).select('slug updatedAt').lean();
  const postRoutes = (posts as any[]).map((post) => ({
    url: `${baseUrl}/writing/${post.slug}`,
    lastModified: post.updatedAt || new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Dynamic Projects
  const projects = await Project.find().select('slug updatedAt').lean();
  const projectRoutes = (projects as any[]).map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: project.updatedAt || new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Dynamic Exploring Tags
  const exploringData = await Exploring.find().select('items').lean();
  const exploringTags = new Set<string>();
  (exploringData as any[]).forEach((cat: any) => {
    cat.items?.forEach((item: any) => {
      exploringTags.add(encodeURIComponent(item.title.toLowerCase().replace(/\s+/g, '-')));
    });
  });
  
  const exploringRoutes = Array.from(exploringTags).map((tag) => ({
    url: `${baseUrl}/exploring/tag/${tag}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...routes, ...postRoutes, ...projectRoutes, ...exploringRoutes];
}
