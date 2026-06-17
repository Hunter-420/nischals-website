'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, FileText, X } from 'lucide-react';
import { FormInput } from '../ui/FormInput';
import { FormTextarea } from '../ui/FormTextarea';

interface SettingsFormProps {
  initialData?: any;
}

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || 'My Portfolio',
    description: initialData?.description || 'Personal Engineering Portfolio',
    aboutText: initialData?.aboutText || '',
    resumeUrl: initialData?.resumeUrl || '',
    resumeExperience: initialData?.resumeExperience || '',
    skills: initialData?.skills || ['C++', 'Go', 'Rust', 'Python', 'TCP/IP', 'Distributed Systems'],
    socialLinks: {
      github: initialData?.socialLinks?.github || '',
      twitter: initialData?.socialLinks?.twitter || '',
      linkedin: initialData?.socialLinks?.linkedin || '',
      email: initialData?.socialLinks?.email || '',
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (['github', 'twitter', 'linkedin', 'email'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [name]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setResumeUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      setFormData(prev => ({ ...prev, resumeUrl: url }));
    } catch {
      alert('Failed to upload resume. Please try again.');
    } finally {
      setResumeUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save settings');

      alert('Settings saved successfully!');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  const getResumeFilename = () => {
    if (!formData.resumeUrl) return '';
    try {
      if (formData.resumeUrl.startsWith('/api/media')) {
        const urlObj = new URL(formData.resumeUrl, 'http://localhost');
        const targetUrl = urlObj.searchParams.get('url');
        if (targetUrl) return targetUrl.split('/').pop() || 'resume.pdf';
      }
      return formData.resumeUrl.split('/').pop() || 'resume.pdf';
    } catch {
      return 'resume.pdf';
    }
  };
  const resumeFilename = getResumeFilename();

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput label="Site Title" type="text" name="title" value={formData.title} onChange={handleChange} required />
          <FormInput label="Site Description" type="text" name="description" value={formData.description} onChange={handleChange} required />
        </div>
        <FormInput 
          label="Skills (comma separated)" 
          type="text" 
          name="skills" 
          value={formData.skills.join(', ')} 
          onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} 
        />
        <FormTextarea label="About Text" name="aboutText" value={formData.aboutText} onChange={handleChange} rows={4} />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Resume Settings</h2>
        <FormTextarea 
          label="Experience Details" 
          name="resumeExperience" 
          value={formData.resumeExperience} 
          onChange={handleChange} 
          rows={6} 
        />
      </div>

      {/* Resume Upload */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Resume (PDF)</h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {formData.resumeUrl ? (
            <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg flex-1">
              <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 truncate">{resumeFilename}</p>
                <a
                  href={formData.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 hover:underline"
                >
                  View current resume ↗
                </a>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, resumeUrl: '' }))}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Remove resume"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex-1 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-center text-sm text-gray-500">
              No resume uploaded yet
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={resumeUploading}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2 flex-shrink-0"
          >
            {resumeUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {resumeUploading ? 'Uploading…' : formData.resumeUrl ? 'Replace PDF' : 'Upload PDF'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleResumeUpload}
          />
        </div>
        <p className="text-xs text-gray-500">
          The resume will appear on your home page with a Download button. Visitors can also view it online.
        </p>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Social Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput label="GitHub URL" type="url" name="github" value={formData.socialLinks.github} onChange={handleChange} />
          <FormInput label="Twitter URL" type="url" name="twitter" value={formData.socialLinks.twitter} onChange={handleChange} />
          <FormInput label="LinkedIn URL" type="url" name="linkedin" value={formData.socialLinks.linkedin} onChange={handleChange} />
          <FormInput label="Email Address" type="email" name="email" value={formData.socialLinks.email} onChange={handleChange} />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-900 disabled:opacity-50 sm:w-auto"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}
