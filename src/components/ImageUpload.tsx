
import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  isProcessing: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, isProcessing }) => {
  const [dragActive, setDragActive] = React.useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelect(file);
      }
    }
  }, [onImageSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  }, [onImageSelect]);

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
        ${dragActive 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
        }
        ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isProcessing}
      />
      
      <div className="flex flex-col items-center space-y-4">
        <div className="p-4 bg-gray-100 rounded-full">
          <ImageIcon size={48} className="text-gray-600" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Choose an image or drag it here
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload JPG, PNG, or WebP files
          </p>
        </div>
        
        <Button variant="outline" className="flex items-center space-x-2">
          <Upload size={20} />
          <span>Browse Files</span>
        </Button>
      </div>
    </div>
  );
};

export default ImageUpload;
