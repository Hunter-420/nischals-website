import { getCollection } from 'astro:content';

export async function GET() {
    const posts = await getCollection('blog');
    const daily = await getCollection('daily');
    const projects = await getCollection('projects');
    const books = await getCollection('books');

    const allContent = [
        ...posts.map(post => ({
            title: post.data.title,
            description: post.data.description,
            date: post.data.date,
            slug: `blog/${post.slug}`,
            tags: post.data.tags,
            type: 'Blog'
        })),
        ...daily.map(post => ({
            title: post.data.title,
            description: "Daily Update",
            date: post.data.date,
            slug: `daily/${post.slug}`,
            tags: [],
            type: 'Daily'
        })),
        ...projects.map(post => ({
            title: post.data.title,
            description: post.data.description,
            date: post.data.date,
            slug: `projects/${post.slug}`,
            tags: post.data.tags,
            type: 'Project'
        })),
        ...books.map(post => ({
            title: post.data.title,
            description: `Book by ${post.data.author}`,
            date: post.data.date,
            slug: `library/${post.slug}`,
            tags: post.data.tags,
            type: 'Book'
        }))
    ];

	return new Response(
		JSON.stringify(allContent)
	);
}
