'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { FormInput } from '../ui/FormInput';
import { FormActions } from '../ui/FormActions';

interface CertificationFormProps {
  initialData?: any;
}

export default function CertificationForm({ initialData }: CertificationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    issuer: initialData?.issuer || '',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
    expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : '',
    url: initialData?.url || '',
    image: initialData?.image || '',
    credentialId: initialData?.credentialId || '',
    skills: initialData?.skills?.join(', ') || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBadgeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      setFormData(prev => ({ ...prev, image: url }));
    } catch {
      alert('Failed to upload badge image');
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined,
        skills: formData.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
      };

      const url = initialData ? `/api/certifications/${initialData._id}` : '/api/certifications';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save certification');

      router.push('/admin/certifications');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error saving certification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Badge Image (optional)</label>
        <div className="flex items-center gap-4">
          {formData.image ? (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <Image src={formData.image} alt="Badge" fill className="object-contain p-1" />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 text-gray-400">
              <Upload className="w-6 h-6" />
            </div>
          )}
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageUploading}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
            >
              {imageUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              {imageUploading ? 'Uploading…' : 'Upload Badge'}
            </button>
            <p className="text-xs text-gray-500 mt-1">PNG or SVG, square format works best</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleBadgeUpload} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput label="Title" type="text" name="title" value={formData.title} onChange={handleChange} required />
        <FormInput label="Issuer" type="text" name="issuer" value={formData.issuer} onChange={handleChange} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput label="Date Issued" type="date" name="date" value={formData.date} onChange={handleChange} required />
        <FormInput label="Expiry Date (optional)" type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput label="Credential ID (optional)" type="text" name="credentialId" value={formData.credentialId} onChange={handleChange} placeholder="e.g. abc123xyz" />
        <FormInput label="Credential URL (optional)" type="url" name="url" value={formData.url} onChange={handleChange} placeholder="https://www.credly.com/badges/..." />
      </div>

      <FormInput label="Skills (comma separated, optional)" type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. Cloud Computing, Azure, DevOps" />

      <FormActions loading={loading} saveText="Save Certification" />
    </form>
  );
}
