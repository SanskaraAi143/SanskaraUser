import React, { useState } from 'react';

interface CategoryManagerProps {
  categories: string[];
  onAdd: (cat: string) => void;
  onDelete: (cat: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onAdd, onDelete }) => {
  const [input, setInput] = useState('');
  return (
    <div className="my-2">
      <div className="flex gap-2 mb-2">
        <input
          className="border rounded px-2 py-1 text-sm"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add new category"
          aria-label="Add new category"
        />
        <button
          className="px-2 py-1 rounded border bg-green-200"
          onClick={() => { if (input.trim()) { onAdd(input.trim()); setInput(''); }}}
          aria-label="Add category"
        >Add</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <span key={cat} className="px-2 py-1 bg-blue-50 border rounded flex items-center gap-1">
            {cat}
            <button className="text-red-500 ml-1" onClick={() => onDelete(cat)} aria-label={`Delete category ${cat}`}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;
