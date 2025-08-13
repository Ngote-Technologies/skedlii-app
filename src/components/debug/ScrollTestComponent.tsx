import React from 'react';
import { useLocation } from 'react-router-dom';
import { smartScrollToTop } from '../../lib/scrollUtils';

/**
 * Debug component to test scroll-to-top functionality
 * Remove this file after testing
 */
export const ScrollTestComponent: React.FC = () => {
  const location = useLocation();

  const handleTestScroll = () => {
    smartScrollToTop({ behavior: 'smooth', delay: 100 });
  };

  return (
    <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-2">Scroll Test Component</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Current route: {location.pathname}
      </p>
      <button 
        onClick={handleTestScroll}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Test Scroll to Top
      </button>
    </div>
  );
};