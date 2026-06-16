import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 3 }) => {
  const cards = Array(count).fill(0);

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {cards.map((_, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-800"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
            </div>
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-pulse space-y-4 w-full">
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
    </div>
  );
};

export default SkeletonLoader;
