import React, { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
}

export function FormInput({ label, className = '', ...props }: FormInputProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
        {...props}
      />
    </div>
  );
}
