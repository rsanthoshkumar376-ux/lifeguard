import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, showBack = false, rightAction }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm pt-safe">
      <div className="h-14 px-4 flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center gap-3 flex-1">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
        </div>
        
        {rightAction && (
          <div className="flex-shrink-0">
            {rightAction}
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
