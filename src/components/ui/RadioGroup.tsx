import React from 'react';

type RadioOption = {
  value: string;
  label: string;
};

type RadioGroupProps = {
  id: string;
  label: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
};

export default function RadioGroup({
  id,
  label,
  options,
  value,
  onChange,
  required = false,
  error = '',
  helpText = '',
  className = '',
}: RadioGroupProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`${id}-${option.value}`}
              name={id}
              type="radio"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={`${id}-${option.value}`} className="ml-3 block text-sm font-medium">
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {helpText && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}