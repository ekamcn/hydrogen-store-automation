import React from 'react';

type CardProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
};

export default function Card({
  children,
  title,
  description,
  footer,
  className = '',
}: CardProps) {
  return (
    <div className={`border dark:border-gray-700 rounded-md overflow-hidden ${className}`}>
      {(title || description) && (
        <div className="bg-gray-50 dark:bg-background px-4 py-3 border-b dark:border-gray-700">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="bg-gray-50 dark:bg-background px-4 py-3 border-t dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
}