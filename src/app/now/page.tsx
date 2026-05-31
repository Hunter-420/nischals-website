import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";
import connectToDatabase from "@/lib/db";
import Now from "@/models/Now";
import React from 'react';

export const revalidate = 60;

async function getNowContent() {
  await connectToDatabase();
  const doc = await Now.findOne().sort({ updatedAt: -1 }).lean();
  return doc as any;
}

function parseMarkdownLinks(text: string) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <a key={lastIndex} href={match[2]} className="text-blue-600 hover:underline dark:text-blue-400 font-medium">
        {match[1]}
      </a>
    );
    lastIndex = linkRegex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : text;
}

export default async function NowPage() {
  const nowDoc = await getNowContent();
  const sections = nowDoc?.sections || [];
  const previous = nowDoc?.previous || [];
  const addons = nowDoc?.addons || [];
  const content = nowDoc?.content || '';
  const updatedAt = nowDoc?.updatedAt ? new Date(nowDoc.updatedAt) : null;

  const hasContent = sections.length > 0 || previous.length > 0 || addons.length > 0 || content;

  return (
    <Container>
      <Navigation />

      <main className="flex-1 mt-8 mb-24 flex flex-col gap-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Now</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            What I&apos;m focused on right now.
          </p>
          {updatedAt && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Last updated:{' '}
              {updatedAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </header>

        {hasContent ? (
          <div className="flex flex-col gap-10">
            {/* Structured sections (Current) */}
            {sections.length > 0 && (
              <div className="flex flex-col gap-8">
                {sections.map((section: any, idx: number) => (
                  <section key={idx} className="flex flex-col gap-3">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      {section.category}
                    </h2>
                    <ul className="flex flex-col gap-2">
                      {(section.items as string[])
                        .filter(item => item.trim())
                        .map((item, iIdx) => (
                          <li
                            key={iIdx}
                            className="text-sm text-gray-900 dark:text-gray-100 font-normal leading-[1.8] flex items-start gap-2"
                          >
                            <span className="text-gray-300 dark:text-gray-600 mt-0.5 flex-shrink-0">·</span>
                            <span>{parseMarkdownLinks(item)}</span>
                          </li>
                        ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}

            {/* Previously Sections */}
            {previous.length > 0 && (
              <div className="flex flex-col gap-8 border-t border-gray-100 dark:border-gray-800 pt-10">
                <h2 className="text-lg font-semibold tracking-tight">Previously</h2>
                {previous.map((section: any, idx: number) => (
                  <section key={idx} className="flex flex-col gap-3">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      {section.category}
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {(section.items as string[])
                        .filter(item => item.trim())
                        .map((item, iIdx) => (
                          <li
                            key={iIdx}
                            className="text-sm text-gray-900 dark:text-gray-100 font-normal leading-[1.8] flex items-start gap-2"
                          >
                            <span className="text-gray-300 dark:text-gray-700 mt-0.5 flex-shrink-0">·</span>
                            <span>{parseMarkdownLinks(item)}</span>
                          </li>
                        ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}

            {/* Addons Sections */}
            {addons.length > 0 && (
              <div className="flex flex-col gap-8 border-t border-gray-100 dark:border-gray-800 pt-10">
                <h2 className="text-lg font-semibold tracking-tight">Addons & Side Quests</h2>
                {addons.map((section: any, idx: number) => (
                  <section key={idx} className="flex flex-col gap-3">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      {section.category}
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {(section.items as string[])
                        .filter(item => item.trim())
                        .map((item, iIdx) => (
                          <li
                            key={iIdx}
                            className="text-sm text-gray-900 dark:text-gray-100 font-normal leading-[1.8] flex items-start gap-2"
                          >
                            <span className="text-gray-300 dark:text-gray-700 mt-0.5 flex-shrink-0">·</span>
                            <span>{parseMarkdownLinks(item)}</span>
                          </li>
                        ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}

            {/* Optional freeform content */}
            {content && (
              <div
                className="prose prose-zinc dark:prose-invert max-w-none text-sm
                  prose-headings:font-semibold prose-headings:tracking-tight
                  prose-p:text-gray-900 dark:prose-p:text-gray-100 prose-p:font-normal prose-p:leading-[1.8]
                  prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">Nothing here yet — check back soon.</p>
        )}
      </main>
    </Container>
  );
}
