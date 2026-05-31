'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface FormActionsProps {
  loading: boolean;
  saveText?: string;
  onCancel?: () => void;
}

export function FormActions({ loading, saveText = 'Save', onCancel }: FormActionsProps) {
  const router = useRouter();
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 mt-6">
      <button
        type="button"
        onClick={handleCancel}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-900 disabled:opacity-50"
      >
        {loading ? 'Saving...' : saveText}
      </button>
    </div>
  );
}
