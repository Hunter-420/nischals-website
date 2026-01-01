---
title: "Run TypeScript in Node.js with tsx"
description: "A quick way to run TypeScript files in Node.js without compiling."
date: 2024-11-04
tags: ["typescript", "node"]
image: "/img/tsnodeerror.png"
---

Yesterday, I tried running a TypeScript file in Node.js directly, but I got an error. Node.js didn’t know what to do with the `.ts` file. This was the error I got:

<img src="/nischals-website/img/tsnodeerror.png" alt="Error when running TypeScript file" style="width: 100%" />

After few hours of googling, I found a package called **tsx** that can run TypeScript files in Node.js without needing to compile them first.

## How to Use tsx

First, install TSX by running this command:

```bash
npm install tsx --save-dev
```

To make it work, I added this line to the `scripts` section in my `package.json`:

```json
"dev": "npx tsx ./src/index.ts"
```

Then, I ran:

```bash
npm run dev
```

This worked! My TypeScript code ran without errors. Here’s what it looked like after using tsx:

<img src="/nischals-website/img/tsnoderun.png" alt="Output after using tsx" style="width: 100%" />

tsx makes it easy to run TypeScript in Node.js. If you want to learn more, check the [tsx documentation](https://tsx.is/getting-started).

Now I can run TypeScript files directly in Node.js without any issues!
