import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string; className?: string }> = ({
  message = 'Loading...',
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-slate-500 ${className}`}>
      <div className="w-10 h-10 border-4 border-civic-200 border-t-civic-600 rounded-full animate-spin"></div>
      {message && <p className="mt-3 text-sm font-medium text-slate-600">{message}</p>}
    </div>
  );
};
