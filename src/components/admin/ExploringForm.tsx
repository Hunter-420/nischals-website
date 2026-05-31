'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GripVertical, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

interface ExploringItem {
  title: string;
  completed: boolean;
}

interface ExploringCategory {
  category: string;
  items: ExploringItem[];
}

interface ExploringFormProps {
  initialData: ExploringCategory[];
}

export default function ExploringForm({ initialData }: ExploringFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const defaultCategories: ExploringCategory[] = [
    {
      category: 'Networking and communication between machines',
      items: [
        { title: 'TCP/IP', completed: false },
        { title: 'Sockets', completed: false },
        { title: 'Latency', completed: false },
        { title: 'Throughput', completed: false }
      ]
    },
    {
      category: 'Systems engineering fundamentals',
      items: [
        { title: 'Operating systems', completed: false },
        { title: 'Concurrency', completed: false },
        { title: 'Scheduling', completed: false },
        { title: 'Memory behavior', completed: false },
        { title: 'Distributed systems', completed: false }
      ]
    },
    {
      category: 'Market infrastructure',
      items: [
        { title: 'Order books', completed: false },
        { title: 'Matching engines', completed: false },
        { title: 'Market data systems', completed: false },
        { title: 'Exchange architecture', completed: false },
        { title: 'Market microstructure', completed: false }
      ]
    },
    {
      category: 'Performance engineering',
      items: [
        { title: 'Bottleneck analysis', completed: false },
        { title: 'System measurement', completed: false },
        { title: 'Optimization', completed: false },
        { title: 'Real-time systems', completed: false }
      ]
    }
  ];

  const [categories, setCategories] = useState<ExploringCategory[]>(
    initialData.length > 0 ? initialData : defaultCategories
  );

  const addCategory = () => {
    setCategories([...categories, { category: '', items: [] }]);
  };

  const removeCategory = (index: number) => {
    const newCats = [...categories];
    newCats.splice(index, 1);
    setCategories(newCats);
  };

  const updateCategoryTitle = (index: number, title: string) => {
    const newCats = [...categories];
    newCats[index].category = title;
    setCategories(newCats);
  };

  const addItem = (catIndex: number) => {
    const newCats = [...categories];
    newCats[catIndex].items.push({ title: '', completed: false });
    setCategories(newCats);
  };

  const updateItem = (catIndex: number, itemIndex: number, field: keyof ExploringItem, value: any) => {
    const newCats = [...categories];
    newCats[catIndex].items[itemIndex] = { ...newCats[catIndex].items[itemIndex], [field]: value };
    setCategories(newCats);
  };

  const removeItem = (catIndex: number, itemIndex: number) => {
    const newCats = [...categories];
    newCats[catIndex].items.splice(itemIndex, 1);
    setCategories(newCats);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up empty data
      const cleanedData = categories
        .filter(c => c.category.trim())
        .map(c => ({
          ...c,
          items: c.items.filter(i => i.title.trim())
        }));

      const res = await fetch('/api/exploring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });

      if (!res.ok) throw new Error('Failed to save exploring data');

      alert('Exploring section saved successfully!');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error saving exploring data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {categories.map((cat, catIndex) => (
        <div key={catIndex} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center gap-4">
            <GripVertical className="w-5 h-5 text-gray-400 cursor-move hidden sm:block" />
            <input
              type="text"
              value={cat.category}
              onChange={e => updateCategoryTitle(catIndex, e.target.value)}
              placeholder="Category Title (e.g. Market infrastructure)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black font-medium"
              required
            />
            <button
              type="button"
              onClick={() => removeCategory(catIndex)}
              className="p-2 text-gray-400 hover:text-red-500 rounded-md transition-colors"
              title="Remove Category"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            {cat.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                <button
                  type="button"
                  onClick={() => updateItem(catIndex, itemIndex, 'completed', !item.completed)}
                  className={`p-1 rounded-full transition-colors ${item.completed ? 'text-green-500 hover:text-green-600' : 'text-gray-300 hover:text-gray-400'}`}
                  title={item.completed ? 'Mark uncompleted' : 'Mark completed'}
                >
                  {item.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>
                
                <input
                  type="text"
                  value={item.title}
                  onChange={e => updateItem(catIndex, itemIndex, 'title', e.target.value)}
                  placeholder="Item title (e.g. TCP/IP)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black text-sm"
                  required
                />

                <button
                  type="button"
                  onClick={() => removeItem(catIndex, itemIndex)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-md transition-colors self-end sm:self-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => addItem(catIndex)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-dashed border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors w-full justify-center"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addCategory}
        className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium hover:border-gray-400 hover:text-gray-900 transition-colors"
      >
        <Plus className="w-5 h-5" /> Add Category
      </button>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors shadow-sm"
        >
          {loading ? 'Saving...' : 'Save Exploring Section'}
        </button>
      </div>
    </form>
  );
}
