
import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface Props {
  content: string;
  children?: React.ReactNode;
}

export const InfoTooltip: React.FC<Props> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block group" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children ? (
        children
      ) : (
        <HelpCircle className="w-3.5 h-3.5 text-indigo-300 hover:text-indigo-600 transition-colors cursor-help" />
      )}
      
      {isVisible && (
        <div className="absolute z-[200] bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-gray-900 text-white text-[10px] font-bold leading-snug rounded-xl shadow-2xl animate-fade-in pointer-events-none border border-white/10">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};
