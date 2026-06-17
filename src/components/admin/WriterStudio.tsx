'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Zap,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  Code2,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Palette,
  Highlighter,
  Table2,
  Columns3,
  Rows3,
  SplitSquareHorizontal,
  Trash2,
  Plus,
  Minus,
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { Markdown } from 'tiptap-markdown';

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

const TEXT_COLORS = [
  { label: 'Slate', value: '#334155' },
  { label: 'Blue', value: '#2563eb' },
  { label: 'Cyan', value: '#0891b2' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Amber', value: '#d97706' },
  { label: 'Rose', value: '#e11d48' },
];

const HIGHLIGHT_COLORS = [
  { label: 'Yellow', value: '#fde68a' },
  { label: 'Pink', value: '#fbcfe8' },
  { label: 'Mint', value: '#a7f3d0' },
  { label: 'Sky', value: '#bae6fd' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WriterStudio({ initialData }: WriterStudioProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showTextColorMenu, setShowTextColorMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);

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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
      Highlight.configure({ multicolor: true }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: 'https',
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: 'Write your post in markdown, then refine it with colors, links, and tables.',
      }),
      Markdown.configure({
        html: true,
        breaks: true,
        linkify: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: formData.content,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, content: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base dark:prose-invert m-5 focus:outline-none max-w-full min-h-[500px]',
      },
    },
  });

  useEffect(() => {
    fetch('/api/exploring/tags')
      .then(r => r.ok ? r.json() : [])
      .then(setSuggestedTags)
      .catch(() => {});
  }, []);

  const clearTextStyle = () => {
    editor?.chain().focus().unsetColor().unsetHighlight().run();
  };

  const clearLink = () => {
    editor?.chain().focus().unsetLink().run();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const generateSlug = () => {
    setFormData(prev => ({
      ...prev,
      slug: prev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));
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

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0];
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          // You can add a loading state here if you want
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!res.ok) throw new Error('Upload failed');
          
          const { url } = await res.json();
          editor?.chain().focus().setImage({ src: url }).run();
        } catch (error) {
          alert('Failed to upload image');
        }
      }
    };
    input.click();
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

  const availableSuggestions = suggestedTags.filter(t => !formData.tags.includes(t.toLowerCase()));

  return (
    <form
      onSubmit={handleSubmit}
      className={`fixed inset-0 flex flex-col bg-white dark:bg-[#0a0e1a] text-slate-800 dark:text-slate-200 overflow-hidden ${
        isFullScreen ? 'left-0' : 'left-0 md:left-[var(--sidebar-width,16rem)]'
      }`}
      style={{ zIndex: isFullScreen ? 50 : 'auto' }}
    >
      {/* ── Top: Meta Config Header ─────────────────────────────────────────── */}
      {!isFullScreen && (
        <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d1120] px-4 py-4 space-y-4 sm:px-6">
          {/* Row 1: Title + Slug + Controls */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:flex-wrap">
            <div className="flex-1 min-w-0 lg:min-w-64">
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
            <div className="w-full lg:w-64">
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
            <div className="w-full lg:w-52">
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:ml-auto">
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:flex-wrap">
            <div className="flex-1 min-w-0 lg:min-w-72">
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
            <div className="min-w-0 flex-1 lg:min-w-64">
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
      )}

      {/* ── Editor Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-[#0d1120] border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto">
          {editor && (
            <>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('bold') ? 'bg-slate-200 dark:bg-slate-800 text-blue-500' : 'text-slate-600 dark:text-slate-400'}`}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('italic') ? 'bg-slate-200 dark:bg-slate-800 text-blue-500' : 'text-slate-600 dark:text-slate-400'}`}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('underline') ? 'bg-slate-200 dark:bg-slate-800 text-blue-500' : 'text-slate-600 dark:text-slate-400'}`}
                title="Underline"
              >
                <UnderlineIcon className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('code') ? 'bg-slate-200 dark:bg-slate-800 text-blue-500' : 'text-slate-600 dark:text-slate-400'}`}
                title="Inline code"
              >
                <Code2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 dark:bg-slate-800 text-blue-500' : 'text-slate-600 dark:text-slate-400'}`}
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 dark:bg-slate-800 text-blue-500' : 'text-slate-600 dark:text-slate-400'}`}
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-200 dark:bg-slate-800 text-blue-500' : 'text-slate-600 dark:text-slate-400'}`}
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('bulletList') ? 'bg-slate-200 dark:bg-slate-800 text-blue-500' : 'text-slate-600 dark:text-slate-400'}`}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('orderedList') ? 'bg-slate-200 dark:bg-slate-800 text-blue-500' : 'text-slate-600 dark:text-slate-400'}`}
                title="Ordered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('blockquote') ? 'bg-slate-200 dark:bg-slate-800 text-blue-500' : 'text-slate-600 dark:text-slate-400'}`}
                title="Blockquote"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('codeBlock') ? 'bg-slate-200 dark:bg-slate-800 text-blue-500' : 'text-slate-600 dark:text-slate-400'}`}
                title="Code Block"
              >
                <span className="text-[10px] font-bold tracking-tight">```</span>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('highlight') ? 'bg-slate-200 dark:bg-slate-800 text-blue-500' : 'text-slate-600 dark:text-slate-400'}`}
                title="Highlight"
              >
                <Highlighter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const url = window.prompt('Paste a link URL');
                  if (!url) return;
                  editor.chain().focus().setLink({ href: url }).run();
                }}
                className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('link') ? 'bg-slate-200 dark:bg-slate-800 text-blue-500' : 'text-slate-600 dark:text-slate-400'}`}
                title="Link"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={clearLink}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                title="Remove link"
              >
                <LinkIcon className="w-4 h-4 opacity-60" />
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowHighlightMenu(false);
                    setShowTextColorMenu(open => !open);
                  }}
                  className={`flex items-center gap-2 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${showTextColorMenu ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-200' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-300 dark:hover:bg-slate-800'}`}
                  title="Text color"
                >
                  <Palette className="w-4 h-4" />
                  Color
                </button>
                {showTextColorMenu && (
                  <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-md border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-[#111827]">
                    <div className="grid grid-cols-3 gap-2">
                      {TEXT_COLORS.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => editor.chain().focus().setColor(color.value).run()}
                          className="flex flex-col items-center gap-1 rounded-md border border-slate-200 px-2 py-2 text-[10px] font-medium text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
                          title={color.label}
                        >
                          <span className="h-4 w-4 rounded-full border border-white shadow" style={{ backgroundColor: color.value }} />
                          {color.label}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        clearTextStyle();
                        setShowTextColorMenu(false);
                      }}
                      className="mt-3 w-full rounded-md border border-dashed border-slate-300 px-2 py-1 text-[10px] font-medium text-slate-500 hover:border-slate-500 dark:border-slate-600 dark:text-slate-400"
                    >
                      Clear color
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowTextColorMenu(false);
                    setShowHighlightMenu(open => !open);
                  }}
                  className={`flex items-center gap-2 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${showHighlightMenu ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-200' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-300 dark:hover:bg-slate-800'}`}
                  title="Highlight color"
                >
                  <Highlighter className="w-4 h-4" />
                  Highlight
                </button>
                {showHighlightMenu && (
                  <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-md border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-[#111827]">
                    <div className="grid grid-cols-2 gap-2">
                      {HIGHLIGHT_COLORS.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => editor.chain().focus().toggleHighlight({ color: color.value }).run()}
                          className="flex items-center gap-2 rounded-md border border-slate-200 px-2 py-2 text-[10px] font-medium text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
                          title={color.label}
                        >
                          <span className="h-4 w-4 rounded-full border border-white shadow" style={{ backgroundColor: color.value }} />
                          {color.label}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().unsetHighlight().run();
                        setShowHighlightMenu(false);
                      }}
                      className="mt-3 w-full rounded-md border border-dashed border-slate-300 px-2 py-1 text-[10px] font-medium text-slate-500 hover:border-slate-500 dark:border-slate-600 dark:text-slate-400"
                    >
                      Clear highlight
                    </button>
                  </div>
                )}
              </div>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
              <button
                type="button"
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                title="Insert table"
              >
                <Table2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                title="Add column before"
              >
                <Columns3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                title="Add column after"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteColumn().run()}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                title="Delete column"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowBefore().run()}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                title="Add row before"
              >
                <Rows3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                title="Add row after"
              >
                <SplitSquareHorizontal className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteRow().run()}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                title="Delete row"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                title="Delete table"
              >
                <Table2 className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
              <button
                type="button"
                onClick={handleImageUpload}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1 text-xs font-medium"
                title="Upload Image"
              >
                <ImageIcon className="w-4 h-4" />
                Upload Image
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isFullScreen && (
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Publish'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Editor Area ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0f1623]">
        <div className="max-w-4xl mx-auto py-8 px-8 lg:px-0">
          <EditorContent editor={editor} />
        </div>
      </div>
      
      {/* ── Optional Styles (scoped) ────────────────────────────────────────── */}
      <style>{`
        /* Make the TipTap editor look like the existing UI */
        .ProseMirror {
          min-height: 500px;
          outline: none;
          color: #1e293b;
        }
        .dark .ProseMirror { color: #e2e8f0; }
        
        .ProseMirror p {
          margin-bottom: 1em;
          line-height: 1.8;
          color: #1e293b;
        }
        .dark .ProseMirror p { color: #e2e8f0; }
        
        .ProseMirror h1 { font-size: 1.75rem; font-weight: 900; margin: 2rem 0 1rem; color: #0f172a; line-height: 1.2; }
        .dark .ProseMirror h1 { color: #f1f5f9; }
        
        .ProseMirror h2 { font-size: 1.35rem; font-weight: 800; margin: 1.75rem 0 0.75rem; color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 4px; }
        .dark .ProseMirror h2 { color: #f1f5f9; }
        
        .ProseMirror h3 { font-size: 1.1rem; font-weight: 700; margin: 1.5rem 0 0.5rem; color: #1e293b; }
        .dark .ProseMirror h3 { color: #f1f5f9; }
        
        .ProseMirror pre { background: #0f172a; color: #e2e8f0; border-radius: 8px; padding: 1rem; font-family: monospace; border: 1px solid #1e293b; overflow-x: auto; margin: 1.25rem 0; }
        
        .ProseMirror code { background: transparent; color: inherit; padding: 0; border: 0; font-size: 0.95em; font-family: inherit; }
        .dark .ProseMirror code { background: transparent; color: inherit; border: 0; }
        
        .ProseMirror blockquote { border-left: 3px solid #3b82f6; padding: 0.5rem 1rem; color: #64748b; background: #f8fafc; border-radius: 0 6px 6px 0; margin: 1rem 0; }
        .dark .ProseMirror blockquote { background: #0f172a; color: #94a3b8; }
        
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin: 1rem 0; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin: 1rem 0; }
        
        .ProseMirror img { max-width: 100%; border-radius: 8px; margin: 1.5rem auto; display: block; border: 1px solid #e2e8f0; }
        .dark .ProseMirror img { border-color: #1e293b; }

        .ProseMirror table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; overflow: hidden; table-layout: fixed; }
        .ProseMirror th, .ProseMirror td { border: 1px solid #cbd5e1; padding: 0.75rem; text-align: left; vertical-align: top; min-width: 6rem; }
        .dark .ProseMirror th, .dark .ProseMirror td { border-color: #334155; }
        .ProseMirror th { background: #eff6ff; font-weight: 700; }
        .dark .ProseMirror th { background: #0f172a; }
        .ProseMirror .tableWrapper { overflow-x: auto; margin: 1rem 0; }
        .ProseMirror mark { border-radius: 0.25rem; padding: 0 0.15rem; }
      `}</style>
    </form>
  );
}
