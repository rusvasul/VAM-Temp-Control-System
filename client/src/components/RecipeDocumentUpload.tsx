import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface RecipeDocumentUploadProps {
  onFileSelect: (file: File) => void;
  currentFileName?: string;
  onRemove?: () => void;
}

export function RecipeDocumentUpload({ 
  onFileSelect, 
  currentFileName,
  onRemove 
}: RecipeDocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document",
        variant: "destructive",
      });
      return false;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  return (
    <div className="w-full">
      <Label>Recipe Document</Label>
      {currentFileName ? (
        <div className="flex items-center gap-2 mt-2 p-2 border rounded-md">
          <FileText className="h-4 w-4" />
          <span className="flex-1 truncate">{currentFileName}</span>
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          className={`mt-2 border-2 border-dashed rounded-md ${
            dragActive ? 'border-primary' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <label className="flex flex-col items-center justify-center p-6 cursor-pointer">
            <Upload className="h-8 w-8 mb-2 text-gray-400" />
            <span className="text-sm text-gray-600">
              Drag and drop your recipe document here, or click to select
            </span>
            <span className="text-xs text-gray-400 mt-1">
              PDF or Word documents only (max 10MB)
            </span>
            <Input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleChange}
            />
          </label>
        </div>
      )}
    </div>
  );
} 