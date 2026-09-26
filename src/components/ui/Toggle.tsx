import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  id?: string;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ 
  checked, 
  onChange, 
  label, 
  description, 
  id = 'toggle', 
  disabled = false 
}) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 pr-4">
        <label htmlFor={id} className="text-base font-medium text-gray-900 cursor-pointer select-none">
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${checked ? 'bg-blue-600' : 'bg-gray-200'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 
            transition duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
};

export default Toggle;
