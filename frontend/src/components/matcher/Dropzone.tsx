import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export function Dropzone({ onFileSelect, isLoading }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isLoading) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5 MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div
              className={`relative rounded-neo border-4 border-dashed border-ink p-12 transition-all duration-[120ms] flex flex-col items-center justify-center text-center overflow-hidden
                ${isDragging ? 'bg-yellow neo-shadow-lg scale-100' : 'bg-surface neo-shadow hover:bg-surface/90'}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isLoading && fileInputRef.current?.click()}
              style={{ cursor: isLoading ? 'default' : 'pointer' }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleChange}
                accept="application/pdf"
                className="hidden"
                disabled={isLoading}
              />
              
              <div className={`w-20 h-20 rounded-circle flex items-center justify-center mb-6 border-2 border-ink ${isDragging ? 'bg-pink' : 'bg-purple'}`}>
                <UploadCloud size={40} className="text-ink" />
              </div>
              
              <h3 className="text-2xl font-display font-bold text-ink mb-2">
                Upload your Resume
              </h3>
              <p className="text-ink font-medium mb-6 max-w-sm mx-auto">
                Drag and drop your PDF here, or click to browse. Let the AI find your perfect match.
              </p>
              
              <div className="flex gap-4 text-xs font-bold text-ink uppercase tracking-wider">
                <span>PDF ONLY</span>
                <span>•</span>
                <span>MAX 5 MB</span>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 flex justify-center"
                >
                  <div className="bg-danger text-ink font-bold text-sm px-4 py-2 neo-border rounded-neo neo-shadow-sm flex items-center gap-3 w-max">
                    <AlertCircle size={20} className="text-ink" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="filecard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full"
          >
            <Card className="p-6 relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
              <div className="w-16 h-20 bg-pink border-2 border-ink rounded-neo flex items-center justify-center text-ink neo-shadow-sm shrink-0">
                <FileText size={32} />
              </div>
              
              <div className="flex-1 text-center sm:text-left truncate">
                <h4 className="text-lg font-bold text-ink truncate">{selectedFile.name}</h4>
                <p className="text-ink font-medium text-sm">{formatSize(selectedFile.size)} • PDF Document</p>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button 
                  variant="secondary" 
                  onClick={() => setSelectedFile(null)}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none"
                >
                  <X size={18} className="mr-1 text-ink" /> Remove
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => onFileSelect(selectedFile)}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none"
                >
                  Find my matches
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
