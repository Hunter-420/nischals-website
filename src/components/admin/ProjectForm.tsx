'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from './RichTextEditor';
import { FormInput } from '../ui/FormInput';
import { FormTextarea } from '../ui/FormTextarea';
import { FormCheckbox } from '../ui/FormCheckbox';
import { FormActions } from '../ui/FormActions';

interface ProjectFormProps {
  initialData?: any;
}

export default function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    content: initialData?.content || '',
    liveUrl: initialData?.liveUrl || '',
    githubUrl: initialData?.githubUrl || '',
    featured: initialData?.featured || false,
    technologies: initialData?.technologies?.join(', ') || '',
    coreProblem: initialData?.coreProblem || '',
    resultMetric: initialData?.resultMetric || '',
    architectureDiagram: initialData?.architectureDiagram?.join(', ') || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
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

  const splitCommaList = (value: string) =>
    value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        technologies: splitCommaList(formData.technologies),
        architectureDiagram: splitCommaList(formData.architectureDiagram),
      };

      const url = initialData ? `/api/projects/${initialData._id}` : '/api/projects';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save project');
      
      router.push('/admin/projects');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error saving project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:flex-wrap">
          <div className="flex-1 min-w-0 lg:min-w-72">
            <FormInput
              label="Project Title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="w-full lg:w-72">
            <FormInput
              label={
                <div className="flex justify-between w-full gap-3">
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
          <div className="flex items-end lg:ml-auto">
            <FormCheckbox label="Featured" id="featured" name="featured" checked={formData.featured} onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FormInput label="Live URL (optional)" type="url" name="liveUrl" value={formData.liveUrl} onChange={handleChange} />
          <FormInput label="GitHub URL (optional)" type="url" name="githubUrl" value={formData.githubUrl} onChange={handleChange} />
        </div>

        <FormTextarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={3}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FormTextarea
            label="Core Problem"
            name="coreProblem"
            value={formData.coreProblem}
            onChange={handleChange}
            rows={3}
          />
          <FormTextarea
            label="Result Metric"
            name="resultMetric"
            value={formData.resultMetric}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FormInput
            label="Technologies (comma separated)"
            type="text"
            name="technologies"
            value={formData.technologies}
            onChange={handleChange}
          />
          <FormInput
            label="Architecture Diagram (comma separated)"
            type="text"
            name="architectureDiagram"
            value={formData.architectureDiagram}
            onChange={handleChange}
          />
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <span className="text-xs text-gray-500">Case study body</span>
        </div>
        <RichTextEditor content={formData.content} onChange={handleContentChange} />
      </section>

      <FormActions loading={loading} saveText="Save Project" />
    </form>
  );
}
