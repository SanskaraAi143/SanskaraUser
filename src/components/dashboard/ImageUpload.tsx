import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onUpload: (file: File, previewUrl: string, tag: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ file: File; preview: string; tag: string }[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews: { file: File; preview: string; tag: string }[] = [];
    const loaded = 0;
    if (!files.length) return;
    let completed = 0;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, { file, preview: reader.result as string, tag: '' }]);
        completed++;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleTagChange = (idx: number, tag: string) => {
    setPreviews(prev => prev.map((item, i) => i === idx ? { ...item, tag } : item));
  };

  const handleUploadClick = (idx: number) => {
    const { file, preview, tag } = previews[idx];
    onUpload(file, preview, tag);
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUploadAll = () => {
    previews.forEach(({ file, preview, tag }) => {
      onUpload(file, preview, tag);
    });
    setPreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-gray-50 file:text-gray-700
          hover:file:bg-gray-100"
      />
      {previews.length > 0 && (
        <>
          <div className="flex flex-wrap gap-4 mt-2">
            {previews.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center border p-2 rounded-lg">
                <img src={item.preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg mb-2" />
                <input
                  type="text"
                  placeholder="Add a tag or note (optional)"
                  value={item.tag}
                  onChange={e => handleTagChange(idx, e.target.value)}
                  className="mb-2 px-2 py-1 border rounded w-full text-sm"
                />
                <Button
                  type="button"
                  onClick={() => handleUploadClick(idx)}
                  className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50"
                  disabled={!item.file}
                >
                  Upload
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="button" onClick={handleUploadAll} className="bg-green-600 text-white px-6 py-2 rounded">
              Upload All
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageUpload;
