import React, { SelectHTMLAttributes } from 'react';

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: React.ReactNode;
  options: { value: string; label: string }[];
}

export function FormSelect({ label, options, className = '', ...props }: FormSelectProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black bg-white"
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
