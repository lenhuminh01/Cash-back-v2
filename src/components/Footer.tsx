import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-12 py-5 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xs">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
          © 2026 Cashback Link by lenhuminh. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
