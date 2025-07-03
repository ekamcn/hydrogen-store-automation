'use client';

import React, { useState } from 'react';
import { Button } from './button';

type FileUploadProps = {
  id: string;
  label: string;
  accept?: string;
  maxSize?: number; // in MB
  onFileSelect: (file: File) => void;
  required?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
  previewUrl?: string;
};

export default function FileUpload({
  id,
  label,
  accept = 'image/*',
  maxSize = 5, // Default 5MB
  onFileSelect,
  required = false,
  error = '',
  helpText = '',
  className = '',
  previewUrl = '',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string>(previewUrl);
  const [fileName, setFileName] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.match(accept.replace(/\*/g, '.*'))) {
      setFileError(`Invalid file type. Please upload a ${accept.replace('*', '')} file.`);
      return;
    }
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setFileError(`File size exceeds ${maxSize}MB limit.`);
      return;
    }
    
    setFileError('');
    setFileName(file.name);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview('');
    }
    
    onFileSelect(file);
  };
  
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-1 text-center">
          {preview ? (
            <div className="mb-4">
              <img src={preview} alt="Preview" className="mx-auto h-32 w-auto object-contain" />
            </div>
          ) : (
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          
          <div className="flex text-sm text-gray-600 dark:text-gray-400">
            <label
              htmlFor={id}
              className="relative cursor-pointer rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
            >
              <span>Upload a file</span>
              <input
                id={id}
                name={id}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {fileName || `${accept.replace('*', '')} up to ${maxSize}MB`}
          </p>
        </div>
      </div>
      
      {helpText && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>}
      {(error || fileError) && <p className="mt-1 text-sm text-red-500">{error || fileError}</p>}
    </div>
  );
}