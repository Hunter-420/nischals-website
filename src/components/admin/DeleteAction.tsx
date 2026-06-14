'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DeleteActionProps {
  id: string;
  endpoint: string;
  itemName: string;
}

export default function DeleteAction({ id, endpoint, itemName }: DeleteActionProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this ${itemName}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete');
      }

      router.refresh();
    } catch (error) {
      alert(`Error deleting ${itemName}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 disabled:opacity-50 transition-colors"
      title={`Delete ${itemName}`}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
