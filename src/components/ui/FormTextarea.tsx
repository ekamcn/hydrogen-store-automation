import React from 'react';

type FormTextareaProps = {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  rows?: number;
  className?: string;
};

export default function FormTextarea({
  id,
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  helpText = '',
  rows = 4,
  className = '',
}: FormTextareaProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
      />
      {helpText && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}