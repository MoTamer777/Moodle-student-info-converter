import React, { useRef } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';

interface FileUploaderProps {
  label: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  accept?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  label, 
  file, 
  onFileSelect, 
  accept = ".xlsx, .xls" 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      {!file ? (
        <div 
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="space-y-1 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center">
              <Upload className="h-8 w-8" />
            </div>
            <div className="flex text-sm text-gray-600 justify-center">
              <span className="font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                Upload a file
              </span>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              Excel files (.xlsx)
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-1 flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg bg-white shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 truncate max-w-[200px] sm:max-w-xs">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={() => onFileSelect(null)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
          }
        }}
        accept={accept}
      />
    </div>
  );
};

export default FileUploader;
