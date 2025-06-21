
import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  src: string;
  alt: string;
  title: string;
  showDownload?: boolean;
  downloadFileName?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ 
  src, 
  alt, 
  title, 
  showDownload = false,
  downloadFileName = 'processed-image.png'
}) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      <div className="p-4">
        <div className="relative group">
          <img
            src={src}
            alt={alt}
            className="w-full h-auto max-h-96 object-contain rounded-lg bg-gray-50"
            style={{
              // Checkered background for transparent images
              backgroundImage: showDownload ? `
                linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
                linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
                linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
              ` : undefined,
              backgroundSize: showDownload ? '20px 20px' : undefined,
              backgroundPosition: showDownload ? '0 0, 0 10px, 10px -10px, -10px 0px' : undefined,
            }}
          />
        </div>
        
        {showDownload && (
          <div className="mt-4 flex justify-center">
            <Button 
              onClick={handleDownload}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              <Download size={20} />
              <span>Download Image</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePreview;
