import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
	type: 'content',
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		date: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		image: z.string().optional(),
        tags: z.array(z.string()).optional(),
	}),
});

const dailyCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		// Transform string to Date object
		date: z.coerce.date(),
        image: z.string().optional(),
	}),
});

const projectsCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
        date: z.coerce.date().optional(),
        repoUrl: z.string().optional(),
        demoUrl: z.string().optional(),
        tags: z.array(z.string()).optional(),
        image: z.string().optional(),
	}),
});

const booksCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
        author: z.string(),
        rating: z.number().min(1).max(5).optional(),
		date: z.coerce.date().optional(),
        image: z.string().optional(),
        tags: z.array(z.string()).optional(),
	}),
});

export const collections = {
	'blog': blogCollection,
    'daily': dailyCollection,
    'projects': projectsCollection,
    'books': booksCollection,
};
