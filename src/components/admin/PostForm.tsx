'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from './RichTextEditor';
import { X, ChevronDown } from 'lucide-react';
import { FormInput } from '../ui/FormInput';
import { FormTextarea } from '../ui/FormTextarea';
import { FormCheckbox } from '../ui/FormCheckbox';
import { FormActions } from '../ui/FormActions';

interface PostFormProps {
  initialData?: any;
}

export default function PostForm({ initialData }: PostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    published: initialData?.published || false,
    tags: (initialData?.tags || []) as string[],
  });

  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [customTagInput, setCustomTagInput] = useState('');

  useEffect(() => {
    fetch('/api/exploring/tags')
      .then(res => res.ok ? res.json() : [])
      .then((tags: string[]) => setSuggestedTags(tags))
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const generateSlug = () => {
    if (!formData.title) return;
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setFormData(prev => ({ ...prev, slug }));
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed) return;
    if (formData.tags.includes(trimmed)) return;
    setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleCustomTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(customTagInput);
      setCustomTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };
      const url = initialData ? `/api/posts/${initialData._id}` : '/api/posts';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save post');
      
      router.push('/admin/posts');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error saving post');
    } finally {
      setLoading(false);
    }
  };

  const availableSuggestions = suggestedTags.filter(
    t => !formData.tags.includes(t.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput label="Title" type="text" name="title" value={formData.title} onChange={handleChange} required />
        <FormInput 
          label={
            <div className="flex justify-between w-full">
              <span>Slug</span>
              <button type="button" onClick={generateSlug} className="text-xs text-blue-600 hover:underline">
                Generate from Title
              </button>
            </div>
          } 
          type="text" 
          name="slug" 
          value={formData.slug} 
          onChange={handleChange} 
          required 
        />
      </div>

      <FormTextarea label="Excerpt" name="excerpt" value={formData.excerpt} onChange={handleChange} rows={3} />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Content</label>
        <RichTextEditor content={formData.content} onChange={handleContentChange} />
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Tags
          <span className="ml-2 text-xs font-normal text-gray-400">(pick from exploring items or add custom)</span>
        </label>

        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <span
                key={tag}
                className="flex items-center gap-1.5 text-sm font-medium bg-gray-900 text-white px-3 py-1 rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-gray-300 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 flex-wrap items-start">
          {availableSuggestions.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setTagDropdownOpen(o => !o)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
              >
                <span>+ Add from Exploring</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${tagDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {tagDropdownOpen && (
                <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48 max-h-60 overflow-y-auto">
                  {availableSuggestions.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        addTag(tag);
                        setTagDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customTagInput}
              onChange={e => setCustomTagInput(e.target.value)}
              onKeyDown={handleCustomTagKeyDown}
              placeholder="Custom tag, press Enter"
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-black focus:border-black w-48"
            />
            <button
              type="button"
              onClick={() => { addTag(customTagInput); setCustomTagInput(''); }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <FormCheckbox label="Published" id="published" name="published" checked={formData.published} onChange={handleChange} />

      <FormActions loading={loading} saveText="Save Post" />
    </form>
  );
}
