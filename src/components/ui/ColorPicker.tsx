import React from 'react';

type ColorPickerProps = {
  id: string;
  label: string;
  value: string;
  onChange: (color: string) => void;
  required?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
};

export default function ColorPicker({
  id,
  label,
  value,
  onChange,
  required = false,
  error = '',
  helpText = '',
  className = '',
}: ColorPickerProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center space-x-2">
        <div 
          className="w-8 h-8 rounded border" 
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          id={`${id}-hex`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
        />
        <input
          type="color"
          id={id}
          name={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 p-0 border-0 rounded-md cursor-pointer"
        />
      </div>
      {helpText && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}