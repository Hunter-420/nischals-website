import React, { TextareaHTMLAttributes } from 'react';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: React.ReactNode;
}

export function FormTextarea({ label, className = '', ...props }: FormTextareaProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
        {...props}
      />
    </div>
  );
}
