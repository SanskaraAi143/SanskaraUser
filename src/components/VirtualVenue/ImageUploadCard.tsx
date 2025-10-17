"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ImageUploadCardProps {
  id: string;
  title: string;
  description: string;
  onImageChange: (dataUri: string) => void;
  icon: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export default function ImageUploadCard({
  id,
  title,
  description,
  onImageChange,
  icon,
  className,
  disabled = false,
}: ImageUploadCardProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onImageChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className={cn("text-center transition-colors bg-white", className, disabled && 'bg-muted/50')}>
      <CardHeader>
        <CardTitle className="font-sans font-bold text-foreground">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Label htmlFor={id}>
          <div className="relative aspect-square w-full max-w-sm mx-auto border border-solid border-border rounded-xl flex items-center justify-center cursor-pointer hover:border-primary transition-colors hover:bg-secondary/50 bg-white">
            {preview ? (
              <img
                src={preview}
                alt={`${title} preview`}
                className="object-contain rounded-lg p-2"
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                {icon}
                <span className="text-sm">Click or drag to upload</span>
              </div>
            )}
          </div>
        </Label>
        <Input
          id={id}
          name={id}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
}