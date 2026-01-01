# Nischal Khanal's Website

This is my personal website, migrated from static HTML to **Astro**.
It features a blog, daily updates, project portfolio, and personal pages, all powered by modern web technologies while keeping the original design.

## 🚀 How It Works

- **Framework**: [Astro](https://astro.build)
- **Styling**: Standard CSS (migrated from original `style.css`)
- **Content**: Markdown (`.md`) files in `src/content/` (blog, daily, projects)
- **Deployment**: Automatic via GitHub Actions to GitHub Pages

## 🛠️ Local Development

To run this website locally on your machine:

1. **Install Dependencies** (only needed once):

   ```bash
   npm install
   ```

2. **Start the Dev Server**:
   ```bash
   npm run dev
   ```
   open http://localhost:4321/nischals-website/ to view it.

## ✍️ How to Create Content

### New Blog Post

1. Run `npm run new-post "My Title"` OR manually create a file in `src/content/blog/`.
2. Ensure frontmatter has `title`, `description`, `date`, `tags`.

### New Daily Post (Updates)

1. Create a file in `src/content/daily/` (e.g. `update-1.md`).
2. Add frontmatter:
   ```yaml
   ---
   title: "Quick Update"
   date: 2024-01-01
   ---
   ```
3. Write your update!

### New Project

1. Create a file in `src/content/projects/` (e.g. `my-tool.md`).
2. Add frontmatter:
   ```yaml
   ---
   title: "Project Name"
   description: "One line description"
   date: 2023-01-01
   repoUrl: "https://github.com/..."
   tags: ["React", "AI"]
   ---
   ```

## 🌍 Deployment

You do **NOT** need to manually build or upload anything.

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "New content"
   git push origin main
   ```
2. **Wait**:
   GitHub Actions will automatically pick up the change, build the site, and deploy it to `https://hunter-420.github.io/nischals-website/`.

## 🖼️ Adding Images & Screenshots

To add images to your posts:

1. Place your image in the `public/img/` folder.
2. In your Markdown post, use:
   ```markdown
   ![Description of image](/nischals-website/img/filename.png)
   ```
   _Note: Always start with `/nischals-website/`_

## 💻 Adding Code Snippets

Astro supports syntax highlighting out of the box. Just use triple backticks:

    ```javascript
    console.log("Hello World");
    ```
