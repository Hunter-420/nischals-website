const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String },
    keyTakeaway: { type: String },
    coverImage: { type: String },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date, default: Date.now },
    primaryDomain: { type: String, default: '' },
    tags: [{ type: String }],
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

const articles = [
  { primaryDomain: 'Cloud Infrastructure', title: 'Building a Secure, Scalable Cloud Architecture for Fintech Startups' },
  { primaryDomain: 'Cloud Infrastructure', title: 'Infrastructure as Code: Why Terraform is Essential for Fintech Compliance' },
  { primaryDomain: 'Cloud Infrastructure', title: 'Cost Optimisation in Cloud-Native Fintech: Balancing Innovation and Budget' },
  { primaryDomain: 'Cloud Infrastructure', title: 'Designing for 99.9% Uptime: Lessons from Building a Trading Engine' },
  { primaryDomain: 'Cloud Infrastructure', title: 'Multi-Cloud vs. Single-Cloud: What\'s Right for NZ Fintech?' },
  { primaryDomain: 'DevOps & CI/CD', title: 'AI-Assisted DevOps: How I Use Copilot, Cursor, and Claude Code Daily' },
  { primaryDomain: 'DevOps & CI/CD', title: 'Building CI/CD Pipelines for Financial Services: Security First' },
  { primaryDomain: 'DevOps & CI/CD', title: 'From 45 Minutes to 26 Minutes: How Monitoring Reduced Incident Response Time' },
  { primaryDomain: 'DevOps & CI/CD', title: 'Kubernetes in Fintech: Managing Stateful Applications at Scale' },
  { primaryDomain: 'DevOps & CI/CD', title: 'GitOps for Fintech: Why Your Infrastructure Should Be Version-Controlled' },
  { primaryDomain: 'AI & Fintech', title: 'Agentic AI in Fintech: Balancing Innovation with Ironclad Compliance' },
  { primaryDomain: 'AI & Fintech', title: 'AI-Native Development: How I Build Fintech Systems with AI as a Teammate' },
  { primaryDomain: 'AI & Fintech', title: 'MLOps in Fintech: Deploying Models Without Breaking Compliance' },
  { primaryDomain: 'AI & Fintech', title: 'Why Open Banking Demands Better AI Security' },
  { primaryDomain: 'AI & Fintech', title: 'Building Explainable AI Systems for Financial Services' },
  { primaryDomain: 'Open Banking', title: 'Open Banking in NZ: What Engineers Need to Know About the New API Ecosystem' },
  { primaryDomain: 'Open Banking', title: 'Building Secure APIs for Open Finance: Lessons from Akahu and BlinkPay' },
  { primaryDomain: 'Open Banking', title: 'From Open Banking to Open Finance: The Next Frontier for NZ Fintech' },
  { primaryDomain: 'Open Banking', title: 'Securing Client Financial Data in an Open Banking World' },
  { primaryDomain: 'Open Banking', title: 'The Technical Challenges of Open Banking Integration' },
  { primaryDomain: 'Performance & Low-Latency', title: 'Achieving Sub-500μs Latency: Lessons from Building a Trading Engine' },
  { primaryDomain: 'Performance & Low-Latency', title: 'C++ vs. Python for Low-Latency Fintech Systems' },
  { primaryDomain: 'Performance & Low-Latency', title: 'Real-Time Data Pipelines: Building with TimescaleDB in Fintech' },
  { primaryDomain: 'Performance & Low-Latency', title: 'Handling Millions of Data Points Daily: Lessons in Scalability' },
  { primaryDomain: 'Performance & Low-Latency', title: 'Optimising Exchange Connectors for Minimal Latency' },
  { primaryDomain: 'Career & Personal Branding', title: 'How I Built 6 Portfolio Projects to Break Into NZ Fintech' },
  { primaryDomain: 'Career & Personal Branding', title: 'From Nepal to Auckland: A Cloud Engineer\'s Journey to NZ' },
  { primaryDomain: 'Career & Personal Branding', title: 'Why I Chose New Zealand\'s Fintech Sector' },
  { primaryDomain: 'Career & Personal Branding', title: 'What NZ Fintech Employers Really Want in a Cloud Engineer' },
  { primaryDomain: 'Career & Personal Branding', title: 'My AWS Certification Journey: What I Learned and Why It Matters' }
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  for (const article of articles) {
    const slug = article.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existingPost = await Post.findOne({ slug });

    const tags = [article.primaryDomain]; // As requested, primary domain as tag too. Or just use primaryDomain? "add a primary domain and tags" -> let's put the primary domain as a tag as well, and maybe some generic ones.

    if (existingPost) {
      existingPost.primaryDomain = article.primaryDomain;
      // Add primary domain to tags if not exists
      if (!existingPost.tags.includes(article.primaryDomain)) {
        existingPost.tags.push(article.primaryDomain);
      }
      await existingPost.save();
      console.log(`Updated post: ${article.title}`);
    } else {
      await Post.create({
        title: article.title,
        slug: slug,
        content: '<p>Content coming soon...</p>',
        excerpt: article.title,
        published: false,
        primaryDomain: article.primaryDomain,
        tags: tags,
      });
      console.log(`Created post: ${article.title}`);
    }
  }

  // Also add these domains to SiteSettings
  const SiteSettingsSchema = new mongoose.Schema({
    primaryDomains: [{ type: String }],
    tags: [{ type: String }]
  }, { strict: false });
  const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema);

  const settings = await SiteSettings.findOne({});
  const domainsToAdd = [...new Set(articles.map(a => a.primaryDomain))];
  
  if (settings) {
    const newDomains = domainsToAdd.filter(d => !(settings.primaryDomains || []).includes(d));
    if (newDomains.length > 0) {
      settings.primaryDomains = [...(settings.primaryDomains || []), ...newDomains];
      settings.tags = [...new Set([...(settings.tags || []), ...newDomains])];
      await settings.save();
      console.log('Updated SiteSettings with new primary domains and tags.');
    }
  } else {
    await SiteSettings.create({
      title: 'My Portfolio',
      description: 'Personal Engineering Portfolio',
      primaryDomains: domainsToAdd,
      tags: domainsToAdd
    });
    console.log('Created SiteSettings.');
  }

  console.log('Seeding completed.');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
