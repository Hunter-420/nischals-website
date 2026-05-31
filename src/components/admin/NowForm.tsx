'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, GripVertical, Link as LinkIcon } from 'lucide-react';

interface NowSection {
  category: string;
  items: string[];
}

interface LinkItem {
  title: string;
  url: string;
  group: string;
}

interface NowFormProps {
  initialContent?: string;
  initialSections?: NowSection[];
  initialPrevious?: NowSection[];
  initialAddons?: NowSection[];
  availableLinks?: LinkItem[];
}

const DEFAULT_CATEGORIES = [
  'Exploring',
  'Building',
  'Reading',
  'Podcasts',
  'Learning',
];

export default function NowForm({ 
  initialContent = '', 
  initialSections = [], 
  initialPrevious = [],
  initialAddons = [],
  availableLinks = [] 
}: NowFormProps) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [sections, setSections] = useState<NowSection[]>(initialSections);
  const [previous, setPrevious] = useState<NowSection[]>(initialPrevious);
  const [addons, setAddons] = useState<NowSection[]>(initialAddons);
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Generic updater factory for the arrays
  const handleSections = (setter: React.Dispatch<React.SetStateAction<NowSection[]>>) => ({
    addSection: () => setter(prev => [...prev, { category: '', items: [''] }]),
    removeSection: (sIdx: number) => setter(prev => prev.filter((_, i) => i !== sIdx)),
    updateCategory: (sIdx: number, value: string) => setter(prev => prev.map((s, i) => i === sIdx ? { ...s, category: value } : s)),
    addItem: (sIdx: number) => setter(prev => prev.map((s, i) => i === sIdx ? { ...s, items: [...s.items, ''] } : s)),
    removeItem: (sIdx: number, iIdx: number) => setter(prev => prev.map((s, i) => i === sIdx ? { ...s, items: s.items.filter((_, j) => j !== iIdx) } : s)),
    updateItem: (sIdx: number, iIdx: number, value: string) => setter(prev => prev.map((s, i) => i === sIdx ? { ...s, items: s.items.map((item, j) => j === iIdx ? value : item) } : s)),
    insertLink: (sIdx: number, iIdx: number, url: string, title: string) => {
      const markdownLink = `[${title}](${url})`;
      setter(prev => prev.map((s, i) => i === sIdx ? {
        ...s,
        items: s.items.map((item, j) => j === iIdx ? (item ? `${item} ${markdownLink}` : markdownLink) : item)
      } : s));
    }
  });

  const curHandlers = handleSections(setSections);
  const prevHandlers = handleSections(setPrevious);
  const addonHandlers = handleSections(setAddons);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch('/api/now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, sections, previous, addons }),
      });

      if (!res.ok) throw new Error('Failed to save Now section');

      setSaved(true);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error saving Now section');
    } finally {
      setLoading(false);
    }
  };

  const renderSectionGroup = (
    title: string, 
    subtitle: string, 
    list: NowSection[], 
    handlers: ReturnType<typeof handleSections>
  ) => (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="space-y-4">
        {list.map((section, sIdx) => (
          <div key={sIdx} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
              <input
                type="text"
                value={section.category}
                onChange={e => handlers.updateCategory(sIdx, e.target.value)}
                placeholder="Category (e.g. Exploring, Reading, Building…)"
                list={`cat-suggestions-${title.replace(/\s+/g, '')}`}
                className="flex-1 text-sm font-medium border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <datalist id={`cat-suggestions-${title.replace(/\s+/g, '')}`}>
                {DEFAULT_CATEGORIES.map(c => <option key={c} value={c} />)}
              </datalist>
              <button
                type="button"
                onClick={() => handlers.removeSection(sIdx)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 pl-6">
              {section.items.map((item, iIdx) => (
                <div key={iIdx} className="flex items-center gap-2">
                  <span className="text-gray-300 text-xs">·</span>
                  <input
                    type="text"
                    value={item}
                    onChange={e => handlers.updateItem(sIdx, iIdx, e.target.value)}
                    placeholder="Add item (Markdown supported: [text](url))"
                    className="flex-1 text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  
                  {availableLinks.length > 0 && (
                    <div className="relative group">
                      <button type="button" className="p-1.5 text-gray-400 hover:text-blue-500 rounded-md hover:bg-blue-50 border border-transparent">
                        <LinkIcon className="w-4 h-4" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden z-10 hidden group-hover:block max-h-60 overflow-y-auto">
                        <div className="py-1">
                          {availableLinks.map((link, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handlers.insertLink(sIdx, iIdx, link.url, link.title)}
                              className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
                            >
                              <span className="font-semibold">{link.group}:</span> {link.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handlers.removeItem(sIdx, iIdx)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handlers.addItem(sIdx)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add item
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handlers.addSection}
        className="flex items-center gap-2 px-4 py-2 text-sm border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors w-full justify-center"
      >
        <Plus className="w-4 h-4" />
        Add Section to {title}
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {renderSectionGroup('Current', 'What are you doing right now?', sections, curHandlers)}
      
      <hr className="border-gray-200" />
      
      {renderSectionGroup('Previously', 'What were you working on before?', previous, prevHandlers)}

      <hr className="border-gray-200" />
      
      {renderSectionGroup('Addons', 'Side projects, unrelated tasks, or side quests.', addons, addonHandlers)}

      <hr className="border-gray-200" />

      {/* Optional freeform notes */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Additional notes <span className="text-xs text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={4}
          placeholder="Any extra context, reflections, or a note about where you are right now…"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 sticky bottom-0 bg-white py-4">
        {saved && (
          <p className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-full">✓ Saved successfully!</p>
        )}
        <div className="ml-auto">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
