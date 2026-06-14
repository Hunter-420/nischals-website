'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Eye, EyeOff, ChevronDown, AlertTriangle, Zap, Activity, Code2, Table2, ListOrdered, Square } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface WriterStudioProps {
  initialData?: any;
}

interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  keyTakeaway: string;
  domain: string;
  content: string;
  published: boolean;
  tags: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DOMAINS = [
  'Networking and Communication',
  'Systems Engineering Fundamentals',
  'Market Infrastructure',
  'Performance Engineering',
];

const TELEMETRY_TEMPLATE = `\`\`\`telemetry
P99 Latency   : <15µs
P50 Latency   : 4µs
Throughput    : 100,000 msg/s
CPU Util      : 12% (single core)
Memory        : 2MB working set
Queue Depth   : ~0 under load
\`\`\``;

const MATH_TEMPLATE = `$$
\\begin{align}
  L &= \\lambda W          & \\text{(Little's Law)} \\\\
  W &= W_q + \\frac{1}{\\mu} & \\text{(Residency Time)} \\\\
  \\rho &= \\frac{\\lambda}{\\mu}  & \\text{(Server Utilization)}
\\end{align}
$$`;

const WORKFLOW_TEMPLATE = `[IN]  → Incoming market event (UDP multicast)
[Q]   ↳ Lock-free SPSC ring buffer (capacity: 65536)
[OUT] → Worker thread dequeues and dispatches handler
[Q_SIZE] ≈ 0 under steady-state (burst tolerance: 8µs)`;

const SVG_TEMPLATE = `{! asset_id="ring-buffer-diagram" width="600" height="300" !}`;

// ─── Simple Markdown → HTML Renderer ─────────────────────────────────────────
function renderMarkdown(md: string): string {
  let html = md;

  // Telemetry block
  html = html.replace(/```telemetry\n([\s\S]*?)```/g, (_, content) => {
    const rows = content.trim().split('\n').map((line: string) => {
      const [key, ...rest] = line.split(':');
      const val = rest.join(':').trim();
      return `<tr><td class="wr-telem-key">${key.trim()}</td><td class="wr-telem-val">${val}</td></tr>`;
    }).join('');
    return `<div class="wr-telem"><table>${rows}</table></div>`;
  });

  // Code block
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_: string, lang: string, code: string) =>
    `<pre class="wr-code-block" data-lang="${lang}"><code>${escapeHtml(code.trim())}</code></pre>`
  );

  // Math block
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_: string, tex: string) =>
    `<div class="wr-math">$$${tex}$$</div>`
  );

  // SVG asset token
  html = html.replace(/\{! asset_id="([^"]*)"([^!]*) !\}/g, (_: string, id: string, attrs: string) =>
    `<div class="wr-svg-token"><span class="wr-svg-label">⬡ SVG Asset:</span> <code>${id}</code>${attrs.trim() ? ` <span class="wr-svg-attrs">${attrs.trim()}</span>` : ''}</div>`
  );

  // Workflow markers
  html = html.replace(/^\[(IN|OUT|Q|Q_SIZE)\]/gm, (_, tag) => {
    const colors: Record<string,string> = { IN: '#3b82f6', OUT: '#10b981', Q: '#f59e0b', Q_SIZE: '#a78bfa' };
    return `<span class="wr-workflow-tag" style="background:${colors[tag] || '#64748b'}20;color:${colors[tag] || '#64748b'};border:1px solid ${colors[tag] || '#64748b'}40">[${tag}]</span>`;
  });

  // Headings
  html = html.replace(/^#### (.+)$/gm, '<h4 class="wr-h4">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 class="wr-h3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="wr-h2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="wr-h1">$1</h1>');

  // Blockquote
  html = html.replace(/^> (.+)$/gm, '<blockquote class="wr-blockquote">$1</blockquote>');

  // Bold / italic / inline code
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code class="wr-inline-code">$1</code>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="wr-hr" />');

  // Unordered / ordered lists — simple approach
  html = html.replace(/^\s*[-*+] (.+)$/gm, '<li class="wr-li">$1</li>');
  html = html.replace(/^\s*\d+\. (.+)$/gm, '<li class="wr-li wr-oli">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, (block) => `<ul class="wr-list">${block}</ul>`);

  // Paragraphs (double newline)
  html = html
    .split(/\n{2,}/)
    .map(block => {
      const t = block.trim();
      if (!t) return '';
      if (/^<(h[1-6]|ul|ol|li|pre|blockquote|div|hr)/.test(t)) return t;
      return `<p class="wr-p">${t.replace(/\n/g, '<br />')}</p>`;
    })
    .join('\n');

  return html;
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── Syntax highlighting for editor ─────────────────────────────────────────
function applySyntaxHighlight(line: string, lineNum: number) {
  // Headings
  if (/^#{1,6} /.test(line)) {
    const level = (line.match(/^(#+)/) || [''])[0].length;
    const colors = ['#93c5fd','#60a5fa','#3b82f6','#2563eb','#a5b4fc','#818cf8'];
    return (
      <span key={lineNum}>
        <span style={{ color: colors[level - 1] || '#93c5fd', fontWeight: 700 }}>{line}</span>
      </span>
    );
  }
  // Telemetry / code fences
  if (/^```/.test(line)) {
    return <span key={lineNum} style={{ color: '#a78bfa', fontWeight: 600 }}>{line}</span>;
  }
  // Math fences
  if (/^\$\$/.test(line)) {
    return <span key={lineNum} style={{ color: '#f59e0b' }}>{line}</span>;
  }
  // Blockquote
  if (/^>/.test(line)) {
    return <span key={lineNum} style={{ color: '#94a3b8' }}>{line}</span>;
  }
  // Workflow tags
  if (/^\[(IN|OUT|Q|Q_SIZE)\]/.test(line)) {
    return <span key={lineNum} style={{ color: '#34d399' }}>{line}</span>;
  }
  // Bold / code tokens inline via regex replacement
  const parts: React.ReactNode[] = [];
  let remaining = line;
  let i = 0;
  const patterns = [
    { re: /(\*\*[^*]+\*\*)/, color: '#f1f5f9', fontWeight: 700 },
    { re: /(`[^`]+`)/, color: '#fbbf24', fontWeight: 400 },
    { re: /(^[-*+] )/, color: '#3b82f6', fontWeight: 700 },
    { re: /(\$\$[^$]+\$\$)/, color: '#f59e0b', fontWeight: 400 },
  ];
  // Simple char-by-char detection not needed - just render with spans for bold/code
  const boldRe = /\*\*(.+?)\*\*/g;
  const codeRe = /`([^`]+)`/g;
  let last = 0;
  let result: React.ReactNode[] = [];
  let src = line;
  // We'll do a simple pass: split on bold/code and color each segment
  const tokens = src.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  tokens.forEach((tok, ti) => {
    if (/^\*\*[^*]+\*\*$/.test(tok)) {
      result.push(<strong key={ti} style={{ color: '#f1f5f9' }}>{tok.replace(/\*\*/g, '')}</strong>);
    } else if (/^`[^`]+`$/.test(tok)) {
      result.push(<span key={ti} style={{ color: '#fbbf24', background: 'rgba(251,191,36,0.08)', padding: '0 2px', borderRadius: 3 }}>{tok}</span>);
    } else {
      result.push(<span key={ti} style={{ color: '#cbd5e1' }}>{tok}</span>);
    }
  });
  return <span key={lineNum}>{result}</span>;
}

// ─── CPL Tracker ─────────────────────────────────────────────────────────────
function getCPL(content: string, cursorPos: number): number {
  const before = content.slice(0, cursorPos);
  const lineStart = before.lastIndexOf('\n') + 1;
  const lineEnd = content.indexOf('\n', cursorPos);
  const line = content.slice(lineStart, lineEnd === -1 ? content.length : lineEnd);
  return line.length;
}

function getScannabilityRatio(content: string): { prose: number; structural: number; ratio: number; ok: boolean } {
  const lines = content.split('\n');
  let proseLinesCount = 0, structLinesCount = 0;
  for (const line of lines) {
    if (!line.trim()) continue;
    if (/^(#{1,6} |```|^\$\$|^>|^[-*+] |\d+\. |\[IN\]|\[OUT\]|\[Q\])/.test(line.trim())) {
      structLinesCount++;
    } else {
      proseLinesCount++;
    }
  }
  const total = proseLinesCount + structLinesCount || 1;
  const ratio = proseLinesCount / total;
  return { prose: proseLinesCount, structural: structLinesCount, ratio, ok: ratio < 0.75 };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WriterStudio({ initialData }: WriterStudioProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [recruiterMode, setRecruiterMode] = useState(false);
  const [cursorCPL, setCursorCPL] = useState(0);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [formData, setFormData] = useState<FormData>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    keyTakeaway: initialData?.keyTakeaway || '',
    domain: initialData?.domain || DOMAINS[0],
    content: initialData?.content || '',
    published: initialData?.published || false,
    tags: (initialData?.tags || []) as string[],
  });

  useEffect(() => {
    fetch('/api/exploring/tags')
      .then(r => r.ok ? r.json() : [])
      .then(setSuggestedTags)
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, content: value }));
    const cpl = getCPL(value, e.target.selectionStart || 0);
    setCursorCPL(cpl);
  }, []);

  const handleCursorMove = useCallback(() => {
    if (!textareaRef.current) return;
    const cpl = getCPL(formData.content, textareaRef.current.selectionStart || 0);
    setCursorCPL(cpl);
  }, [formData.content]);

  const generateSlug = () => {
    setFormData(prev => ({
      ...prev,
      slug: prev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));
  };

  const insertAtCursor = (snippet: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newContent = formData.content.slice(0, start) + '\n' + snippet + '\n' + formData.content.slice(end);
    setFormData(prev => ({ ...prev, content: newContent }));
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + snippet.length + 2;
    }, 0);
  };

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase().replace(/^#/, '');
    if (!t || formData.tags.includes(t)) return;
    setFormData(prev => ({ ...prev, tags: [...prev.tags, t] }));
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = initialData ? `/api/posts/${initialData._id}` : '/api/posts';
      const method = initialData ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to save');
      router.push('/admin/posts');
      router.refresh();
    } catch {
      alert('Error saving post');
    } finally {
      setLoading(false);
    }
  };

  const scann = getScannabilityRatio(formData.content);
  const contentLines = formData.content.split('\n');
  const availableSuggestions = suggestedTags.filter(t => !formData.tags.includes(t.toLowerCase()));
  const renderedHtml = renderMarkdown(formData.content);

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed inset-0 flex flex-col bg-white dark:bg-[#0a0e1a] text-slate-800 dark:text-slate-200 overflow-hidden"
      style={{ left: 'var(--sidebar-width, 16rem)' }}
    >

      {/* ── Top: Meta Config Header ─────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d1120] px-6 py-4 space-y-4">
        {/* Row 1: Title + Slug + Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-64">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Article Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Lock-Free Queues and the LMAX Disruptor"
              required
              className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <div className="w-64">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Slug</label>
              <button type="button" onClick={generateSlug} className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors">
                ↺ auto-gen
              </button>
            </div>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <div className="w-52">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Primary Domain</label>
            <select
              name="domain"
              value={formData.domain}
              onChange={handleChange}
              className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 appearance-none"
            >
              {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-slate-400">Published</span>
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleChange}
                className="w-4 h-4 accent-blue-500"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {loading ? 'Saving…' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Row 2: Executive Pitch + Tags */}
        <div className="flex gap-4 flex-wrap items-start">
          <div className="flex-1 min-w-72">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Executive Pitch <span className="text-slate-600">(TL;DR Recruit Preview Card)</span>
              </label>
              <span className={`text-[10px] font-mono ${formData.keyTakeaway.length > 140 ? 'text-amber-400' : formData.keyTakeaway.length > 155 ? 'text-red-400' : 'text-slate-600'}`}>
                {formData.keyTakeaway.length}/160
              </span>
            </div>
            <input
              type="text"
              name="keyTakeaway"
              value={formData.keyTakeaway}
              onChange={handleChange}
              maxLength={160}
              placeholder="One sentence: engineering problem solved + measurable result"
              className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Tech Chips */}
          <div className="min-w-64 flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
              Tech Chips <span className="text-slate-600">(Index Tags)</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {formData.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-blue-600/20 border border-blue-500/40 text-blue-300 text-[11px] font-mono rounded">
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <div className="relative">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onFocus={() => setShowTagDropdown(true)}
                  onBlur={() => setTimeout(() => setShowTagDropdown(false), 150)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); }
                    if (e.key === ',') { e.preventDefault(); addTag(tagInput); }
                  }}
                  placeholder="#concurrency"
                  className="bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 text-[11px] font-mono text-blue-600 dark:text-blue-300 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 w-28"
                />
                {showTagDropdown && availableSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-md shadow-xl z-50 max-h-40 overflow-y-auto min-w-40">
                    {availableSuggestions.filter(s => s.includes(tagInput)).map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onMouseDown={() => addTag(tag)}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-blue-600/20 font-mono"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Split Screen ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* LEFT PANEL ─ Editor */}
        <div className="flex flex-col w-1/2 border-r border-slate-200 dark:border-slate-800 min-h-0">

          {/* Toolbar */}
          <div className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-slate-50 dark:bg-[#0d1120] border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mr-2 whitespace-nowrap">Insert →</span>
            <button
              type="button"
              onClick={() => insertAtCursor(TELEMETRY_TEMPLATE)}
              title="Insert Telemetry Matrix"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-800/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/50 rounded transition-colors whitespace-nowrap"
            >
              <Activity className="w-3 h-3" />
              Telemetry Matrix
            </button>
            <button
              type="button"
              onClick={() => insertAtCursor(MATH_TEMPLATE)}
              title="Insert Systems Math Block"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-800/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800/50 rounded transition-colors whitespace-nowrap"
            >
              <Square className="w-3 h-3" />
              Math Block ∑
            </button>
            <button
              type="button"
              onClick={() => insertAtCursor(WORKFLOW_TEMPLATE)}
              title="Insert Step Workflow List"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800/50 rounded transition-colors whitespace-nowrap"
            >
              <ListOrdered className="w-3 h-3" />
              Workflow List
            </button>
            <button
              type="button"
              onClick={() => insertAtCursor(SVG_TEMPLATE)}
              title="Embed SVG Asset Token"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/40 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-800/50 rounded transition-colors whitespace-nowrap"
            >
              <Table2 className="w-3 h-3" />
              SVG Token
            </button>
            <button
              type="button"
              onClick={() => insertAtCursor('```\n\n```')}
              title="Insert Code Block"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700 rounded transition-colors whitespace-nowrap"
            >
              <Code2 className="w-3 h-3" />
              Code Block
            </button>
          </div>

          {/* Editor Area with Line Numbers */}
          <div className="flex flex-1 min-h-0 overflow-hidden font-mono text-sm">
            {/* Line Numbers */}
            <div
              className="flex-shrink-0 w-10 bg-slate-50 dark:bg-[#090c15] border-r border-slate-200 dark:border-slate-800/60 overflow-hidden select-none"
              aria-hidden="true"
            >
              <div className="py-3 px-0 text-right">
                {contentLines.map((_, i) => (
                  <div
                    key={i}
                    className="text-slate-400 dark:text-slate-700 text-[11px] leading-[1.6rem] pr-2"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* 80-char ruler + Textarea */}
            <div className="relative flex-1 overflow-hidden">
              {/* 80-char ruler */}
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-10 border-r border-slate-200 dark:border-slate-700/30"
                style={{ left: `calc(${80}ch + 12px)` }}
              />
              <textarea
                ref={textareaRef}
                name="content"
                value={formData.content}
                onChange={handleContentChange}
                onKeyUp={handleCursorMove}
                onClick={handleCursorMove}
                spellCheck={false}
                placeholder={'# Article Title\n\nStart writing your technical article…\n\nUse the toolbar above to insert Telemetry Matrices, Math Blocks, Workflow lists, and SVG tokens.'}
                className="w-full h-full resize-none bg-white dark:bg-[#0a0e1a] text-slate-800 dark:text-slate-300 leading-[1.6rem] p-3 focus:outline-none overflow-y-auto text-[14px]"
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", "Fira Code", monospace',
                  tabSize: 2,
                }}
              />
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex-shrink-0 flex items-center gap-6 px-4 py-1.5 bg-slate-100 dark:bg-[#060912] border-t border-slate-200 dark:border-slate-800 text-[10px] font-mono">
            {/* CPL Tracker */}
            <div className={`flex items-center gap-1.5 ${cursorCPL > 75 ? 'text-amber-500 dark:text-amber-400' : 'text-slate-500 dark:text-slate-600'}`}>
              {cursorCPL > 75 && <AlertTriangle className="w-3 h-3" />}
              <span>CPL: <strong>{cursorCPL}</strong></span>
              {cursorCPL > 75 && <span className="text-amber-600 dark:text-amber-500/70">— line too long</span>}
            </div>
            <div className="w-px h-3 bg-slate-300 dark:bg-slate-800" />
            {/* Scannability */}
            <div className={`flex items-center gap-1.5 ${!scann.ok ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-600'}`}>
              {!scann.ok && <AlertTriangle className="w-3 h-3" />}
              <span>
                Scannability: <strong className={scann.ok ? 'text-emerald-600 dark:text-neon-green' : 'text-amber-600 dark:text-amber-400'}>
                  {Math.round(scann.ratio * 100)}% prose
                </strong>
                {' '}/ {scann.structural} structural
              </span>
              {!scann.ok && <span className="text-amber-500/70">— add visual breaks</span>}
            </div>
            <div className="ml-auto text-slate-700">
              {formData.content.split(/\s+/).filter(Boolean).length} words
            </div>
          </div>
        </div>

        {/* RIGHT PANEL ─ Live Preview */}
        <div className="flex flex-col w-1/2 min-h-0 bg-white dark:bg-[#0f1623]">

          {/* Preview Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-[#0d1120] border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Preview</span>
            </div>
            <button
              type="button"
              onClick={() => setRecruiterMode(m => !m)}
              className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded border transition-all ${
                recruiterMode
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-transparent border-slate-700 text-slate-400 hover:border-blue-500 hover:text-blue-400'
              }`}
            >
              {recruiterMode ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              Recruiter View {recruiterMode ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            {/* Article Header in preview */}
            {formData.title && (
              <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-1">{formData.title}</h1>
                {formData.domain && (
                  <span className="inline-block px-2 py-0.5 text-[11px] font-mono bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 rounded">
                    {formData.domain}
                  </span>
                )}
                {formData.keyTakeaway && (
                  <p className="mt-2 text-sm italic text-slate-600 dark:text-slate-400">
                    <span className="font-bold not-italic">Takeaway: </span>{formData.keyTakeaway}
                  </p>
                )}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {formData.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Rendered Markdown */}
            <div
              className={`wr-preview ${recruiterMode ? 'wr-recruiter-mode' : ''}`}
              dangerouslySetInnerHTML={{ __html: renderedHtml || '<p class="wr-p" style="color:#64748b;font-style:italic">Start writing in the editor to see your live preview…</p>' }}
            />
          </div>
        </div>
      </div>

      {/* ── Preview Styles (scoped) ────────────────────────────────────────── */}
      <style>{`
        /* Preview typography */
        .wr-preview { color: #1e293b; font-size: 15px; line-height: 1.8; }
        @media (prefers-color-scheme: dark) { .wr-preview { color: #e2e8f0; } }
        .dark .wr-preview { color: #e2e8f0; }
        
        .wr-h1 { font-size: 1.75rem; font-weight: 900; margin: 2rem 0 1rem; color: #0f172a; line-height:1.2; }
        .wr-h2 { font-size: 1.35rem; font-weight: 800; margin: 1.75rem 0 0.75rem; color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 4px; }
        .wr-h3 { font-size: 1.1rem; font-weight: 700; margin: 1.5rem 0 0.5rem; color: #1e293b; }
        .wr-h4 { font-size: 0.95rem; font-weight: 700; margin: 1rem 0 0.4rem; color: #334155; text-transform: uppercase; letter-spacing: 0.05em; }
        .dark .wr-h1, .dark .wr-h2, .dark .wr-h3, .dark .wr-h4 { color: #f1f5f9; }
        .dark .wr-h2 { border-color: #3b82f6; }

        .wr-p { margin: 0.85rem 0; }
        .wr-list { margin: 0.75rem 0; padding-left: 1.25rem; list-style: none; }
        .wr-li { position:relative; padding-left: 0.5rem; margin: 0.35rem 0; }
        .wr-li::before { content:"→"; position:absolute; left:-1rem; color:#3b82f6; font-weight:700; }
        .wr-oli::before { content:"↳"; }
        .wr-blockquote { border-left: 3px solid #3b82f6; padding: 0.5rem 1rem; color: #64748b; background: #f8fafc; border-radius: 0 6px 6px 0; margin: 1rem 0; }
        .dark .wr-blockquote { background:#0f172a; color:#94a3b8; }
        .wr-hr { border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0; }
        .dark .wr-hr { border-color: #1e293b; }
        
        .wr-inline-code { font-family: monospace; font-size: 0.85em; background: #f1f5f9; color: #db2777; padding: 1px 5px; border-radius: 4px; border: 1px solid #e2e8f0; }
        .dark .wr-inline-code { background: #1e293b; color: #f472b6; border-color: #334155; }
        
        .wr-code-block { background: #0f172a; color: #e2e8f0; border-radius: 8px; padding: 1rem 1.25rem; font-family: monospace; font-size: 0.85rem; line-height: 1.6; overflow-x: auto; margin: 1.25rem 0; border: 1px solid #1e293b; position:relative; }
        .wr-code-block::before { content: attr(data-lang); position:absolute; top:6px; right:12px; font-size:10px; color:#475569; text-transform:uppercase; letter-spacing:0.05em; }
        
        /* Telemetry Matrix */
        .wr-telem { background: #0a0e1a; border: 1px solid #1e3a5f; border-radius: 8px; overflow:hidden; margin: 1.25rem 0; }
        .wr-telem table { width:100%; border-collapse:collapse; }
        .wr-telem-key { padding: 6px 14px; font-family:monospace; font-size:0.8rem; color:#94a3b8; background:#0f172a; border-bottom:1px solid #1e293b; white-space:nowrap; width:40%; }
        .wr-telem-val { padding: 6px 14px; font-family:monospace; font-size:0.9rem; font-weight:700; color:#10b981; border-bottom:1px solid #1e293b; }
        
        /* Math block */
        .wr-math { background:#fffbeb; border:1px solid #fcd34d; border-radius:8px; padding:1rem 1.25rem; margin:1.25rem 0; font-family:monospace; font-size:0.9rem; color:#92400e; overflow-x:auto; }
        .dark .wr-math { background:#1c1500; border-color:#a16207; color:#fbbf24; }
        
        /* SVG Asset Token */
        .wr-svg-token { display:flex; align-items:center; gap:8px; background:#1e1b4b; border:1px dashed #4f46e5; border-radius:6px; padding:8px 12px; margin:1rem 0; font-family:monospace; font-size:0.8rem; }
        .wr-svg-label { color:#818cf8; font-weight:700; }
        .wr-svg-attrs { color:#6366f1; }
        
        /* Workflow tags */
        .wr-workflow-tag { display:inline-block; padding:1px 6px; border-radius:4px; font-family:monospace; font-size:0.75rem; font-weight:700; margin-right:4px; }
        
        /* Recruiter Mode */
        .wr-recruiter-mode .wr-p { opacity: 0.4; }
        .wr-recruiter-mode .wr-h1,
        .wr-recruiter-mode .wr-h2,
        .wr-recruiter-mode .wr-h3,
        .wr-recruiter-mode .wr-telem,
        .wr-recruiter-mode .wr-math,
        .wr-recruiter-mode .wr-code-block,
        .wr-recruiter-mode strong { opacity: 1 !important; }

        /* Editor textarea line height must match line-number div */
        textarea { line-height: 1.6rem !important; }
      `}</style>
    </form>
  );
}
