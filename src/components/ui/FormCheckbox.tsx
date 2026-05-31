import React, { InputHTMLAttributes } from 'react';

interface FormCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
}

export function FormCheckbox({ label, className = '', ...props }: FormCheckboxProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="checkbox"
        className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
        {...props}
      />
      <label htmlFor={props.id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
    </div>
  );
}
