
import React, { useState } from 'react';
import { Sparkles, Zap, Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';
import ImagePreview from '@/components/ImagePreview';
import LoadingSpinner from '@/components/LoadingSpinner';
import { removeBackgroundWithReplicate, getReplicateApiToken, clearApiToken } from '@/lib/replicate';
import { removeBackground, loadImage } from '@/lib/backgroundRemoval';

type ProcessingMethod = 'browser' | 'replicate';

const Index = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMethod, setProcessingMethod] = useState<ProcessingMethod>('browser');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleImageSelect = (file: File) => {
    console.log('Image selected:', file.name, file.size);
    setSelectedFile(file);
    setProcessedImage(null);
    
    const url = URL.createObjectURL(file);
    setOriginalImage(url);
    
    toast({
      title: "Image uploaded successfully!",
      description: `Selected: ${file.name}`,
    });
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) {
      toast({
        title: "No image selected",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessedImage(null);

    try {
      let resultImageUrl: string;

      if (processingMethod === 'browser') {
        console.log('Using browser-based background removal...');
        toast({
          title: "Processing started",
          description: "Removing background using browser AI...",
        });

        // Load image and process with browser-based AI
        const imageElement = await loadImage(selectedFile);
        const processedBlob = await removeBackground(imageElement);
        resultImageUrl = URL.createObjectURL(processedBlob);
      } else {
        // Replicate API method
        console.log('Using Replicate API...');
        const apiToken = getReplicateApiToken();
        
        if (!apiToken) {
          toast({
            title: "API token required",
            description: "Replicate API token is needed for cloud processing.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Processing started",
          description: "Removing background using Replicate API...",
        });

        resultImageUrl = await removeBackgroundWithReplicate(selectedFile, apiToken);
      }

      setProcessedImage(resultImageUrl);
      
      toast({
        title: "Background removed successfully!",
        description: "Your image is ready for download.",
      });
      
    } catch (error) {
      console.error('Background removal failed:', error);
      
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setSelectedFile(null);
    setIsProcessing(false);
  };

  const handleClearApiToken = () => {
    clearApiToken();
    toast({
      title: "API token cleared",
      description: "You'll be prompted for a new token when using Replicate API.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <Zap size={40} className="text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            BG<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Zap</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Remove image backgrounds in seconds – free and simple.
          </p>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Sparkles size={16} className="text-yellow-500" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap size={16} className="text-blue-500" />
              <span>Lightning Fast</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Free to Use</span>
            </div>
          </div>
        </div>

        {/* Processing Method Selection */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Processing Method</h3>
                <p className="text-sm text-gray-600">Choose how to remove backgrounds</p>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant={processingMethod === 'browser' ? 'default' : 'outline'}
                  onClick={() => setProcessingMethod('browser')}
                  disabled={isProcessing}
                  className="flex items-center space-x-2"
                >
                  <Sparkles size={16} />
                  <span>Browser AI</span>
                </Button>
                
                <Button
                  variant={processingMethod === 'replicate' ? 'default' : 'outline'}
                  onClick={() => setProcessingMethod('replicate')}
                  disabled={isProcessing}
                  className="flex items-center space-x-2"
                >
                  <Zap size={16} />
                  <span>Replicate API</span>
                </Button>
                
                {processingMethod === 'replicate' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearApiToken}
                    disabled={isProcessing}
                    className="flex items-center space-x-1"
                  >
                    <Settings size={14} />
                    <span>Clear Token</span>
                  </Button>
                )}
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {processingMethod === 'browser' 
                  ? "🚀 Browser AI: Processes images locally in your browser. No API keys needed, but may be slower for large images."
                  : "⚡ Replicate API: Cloud-based processing with high-quality results. Requires API token from replicate.com."
                }
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Image</h2>
                <ImageUpload onImageSelect={handleImageSelect} isProcessing={isProcessing} />
              </div>

              {originalImage && (
                <ImagePreview
                  src={originalImage}
                  alt="Original image"
                  title="Original Image"
                />
              )}
            </div>

            {/* Processing & Results Section */}
            <div className="space-y-6">
              {originalImage && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Remove Background</h2>
                  
                  <div className="space-y-4">
                    <Button
                      onClick={handleRemoveBackground}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                      {isProcessing ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Zap size={20} />
                          <span>Remove Background</span>
                        </div>
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      disabled={isProcessing}
                      className="w-full flex items-center space-x-2"
                    >
                      <RefreshCw size={16} />
                      <span>Start Over</span>
                    </Button>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="bg-white rounded-lg shadow-lg">
                  <LoadingSpinner 
                    message={processingMethod === 'browser' ? 'Processing with browser AI...' : 'Processing with Replicate API...'}
                  />
                </div>
              )}

              {processedImage && (
                <ImagePreview
                  src={processedImage}
                  alt="Processed image with background removed"
                  title="Background Removed"
                  showDownload={true}
                  downloadFileName={`bgzap-${Date.now()}.png`}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-4">
            Powered by AI • Built with React & Tailwind CSS
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <span>Browser AI: Hugging Face Transformers</span>
            <span>•</span>
            <span>Cloud AI: Replicate u2net</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
