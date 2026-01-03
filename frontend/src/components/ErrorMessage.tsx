import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  retry?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, retry, className = '' }) => {
  return (
    <div
      className={`rounded-lg bg-red-50 border-2 border-red-200 p-6 ${className}`}
    >
      <div className="flex items-start">
        <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-1">Error</h3>
          <p className="text-sm text-red-700">{message}</p>
          {retry && (
            <button
              onClick={retry}
              className="mt-3 text-sm font-medium text-red-800 hover:text-red-900 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
