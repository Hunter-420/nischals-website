import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";
import connectToDatabase from "@/lib/db";
import Post from "@/models/Post";
import Exploring from "@/models/Exploring";
import PostList from "./PostList";
import { unstable_cache } from "next/cache";

export const revalidate = 300;

const getWritingData = unstable_cache(
  async () => {
    await connectToDatabase();
    const posts = await Post.find({ published: true })
      .sort({ publishedAt: -1 })
      .lean();
    const exploringData = await Exploring.find().sort({ order: 1 }).lean();
    return { posts: posts as any[], exploringData: exploringData as any[] };
  },
  ["writing-list"],
  { revalidate: 300 }
);

export const metadata = {
  title: 'Writing',
  description: 'Thoughts on systems engineering, performance, and continuous learning.',
  openGraph: {
    title: 'Writing | Nischal Khanal',
    description: 'Thoughts on systems engineering, performance, and continuous learning.',
  },
};

export default async function WritingPage() {
  const { posts, exploringData } = await getWritingData();
  
  const categories = exploringData.map(cat => ({
    name: cat.category,
    tags: cat.items.map((item: any) => item.title)
  }));

  // Convert MongoDB ObjectIds to strings to pass to Client Component safely
  const serializedPosts = posts.map(post => ({
    ...post,
    _id: post._id.toString(),
    publishedAt: post.publishedAt?.toISOString ? post.publishedAt.toISOString() : post.publishedAt,
  }));

  return (
    <Container>
      <Navigation />
      
      <main className="flex-1 mt-8 mb-24 flex flex-col gap-12">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Writing</h1>
          <p className="text-slate-800 dark:text-slate-200 font-normal text-base leading-relaxed">
            Thoughts on systems engineering, performance, and continuous learning.
          </p>
        </header>

        <PostList posts={serializedPosts} categories={categories} />
      </main>
    </Container>
  );
}
