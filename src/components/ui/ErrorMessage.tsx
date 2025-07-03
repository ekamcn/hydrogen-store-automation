import React from 'react';

type ErrorMessageProps = {
  message: string | null;
  className?: string;
};

export default function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  if (!message) return null;
  
  return (
    <div className={`bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-800 dark:text-red-300 ${className}`}>
      <p>{message}</p>
    </div>
  );
}