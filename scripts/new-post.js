import fs from 'fs';
import path from 'path';

const title = process.argv[2];
if (!title) {
  console.error('Please provide a post title.');
  console.error('Usage: npm run new-post "My New Post"');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)+/g, '');

const date = new Date().toISOString().split('T')[0];
const filename = `${slug}.md`;
const filepath = path.join('src/content/blog', filename);

const content = `---
title: "${title}"
description: "Description for ${title}"
date: ${date}
tags: []
image: ""
---

Write your content here...
`;

if (fs.existsSync(filepath)) {
  console.error(`File ${filename} already exists.`);
  process.exit(1);
}

fs.writeFileSync(filepath, content);
console.log(`Created new post: ${filepath}`);
