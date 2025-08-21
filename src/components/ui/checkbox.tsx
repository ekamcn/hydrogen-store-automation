import * as React from "react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={
          `rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-all duration-150 w-4 h-4 ` +
          className
        }
        style={{ accentColor: '#6366f1', cursor: 'pointer' }}
        {...props}
      />
    );
  }
);

Checkbox.displayName = "Checkbox"; 