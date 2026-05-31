import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";
import connectToDatabase from "@/lib/db";
import Post from "@/models/Post";
import Exploring from "@/models/Exploring";
import PostList from "./PostList";

export const revalidate = 60;

export const metadata = {
  title: 'Writing | Nischal Khanel',
  description: 'Thoughts on systems engineering, performance, and learning.',
};

export default async function WritingPage() {
  await connectToDatabase();
  const posts = await Post.find({ published: true })
    .sort({ publishedAt: -1 })
    .lean();

  const exploringData = await Exploring.find().sort({ order: 1 }).lean();
  
  const categories = (exploringData as any[]).map(cat => ({
    name: cat.category,
    tags: cat.items.map((item: any) => item.title)
  }));

  // Convert MongoDB ObjectIds to strings to pass to Client Component safely
  const serializedPosts = (posts as any[]).map(post => ({
    ...post,
    _id: post._id.toString(),
    publishedAt: post.publishedAt.toISOString ? post.publishedAt.toISOString() : post.publishedAt,
  }));

  return (
    <Container>
      <Navigation />
      
      <main className="flex-1 mt-8 mb-24 flex flex-col gap-12">
        <header className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Writing</h1>
          <p className="text-gray-900 dark:text-gray-100 font-normal leading-[1.8]">
            Thoughts on systems engineering, performance, and continuous learning.
          </p>
        </header>

        <PostList posts={serializedPosts} categories={categories} />
      </main>
    </Container>
  );
}
