'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormInput } from '../ui/FormInput';
import { FormSelect } from '../ui/FormSelect';
import { FormTextarea } from '../ui/FormTextarea';
import { FormActions } from '../ui/FormActions';

interface LibraryFormProps {
  initialData?: any;
}

export default function LibraryForm({ initialData }: LibraryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    author: initialData?.author || '',
    type: initialData?.type || 'book',
    status: initialData?.status || 'completed',
    link: initialData?.link || '',
    rating: initialData?.rating || '',
    review: initialData?.review || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        rating: formData.rating ? parseInt(formData.rating.toString(), 10) : undefined,
      };
      const url = initialData ? `/api/library/${initialData._id}` : '/api/library';
      const method = initialData ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save library item');
      router.push('/admin/library');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error saving library item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput label="Title" type="text" name="title" value={formData.title} onChange={handleChange} required />
        <FormInput label="Author / Creator" type="text" name="author" value={formData.author} onChange={handleChange} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormSelect
          label="Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          options={[
            { value: 'book', label: 'Book' },
            { value: 'podcast', label: 'Podcast' },
            { value: 'article', label: 'Article' },
            { value: 'video', label: 'Video' },
          ]}
        />
        <FormSelect
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={[
            { value: 'completed', label: 'Completed' },
            { value: 'reading', label: 'Reading / Listening' },
            { value: 'to-read', label: 'To Read / To Listen' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput label="Link (Optional)" type="url" name="link" value={formData.link} onChange={handleChange} />
        <FormInput label="Rating (1-5)" type="number" name="rating" min="1" max="5" value={formData.rating} onChange={handleChange} />
      </div>

      <FormTextarea label="Review (Optional)" name="review" value={formData.review} onChange={handleChange} rows={4} />

      <FormActions loading={loading} saveText="Save Item" />
    </form>
  );
}
