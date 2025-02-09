import React from 'react';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout = ({ children, className }: MainLayoutProps) => {
  return (
    <div className="flex h-screen bg-[#f0f0f0]">
      <Sidebar />
      <main className={cn("flex-1 overflow-auto p-4", className)}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout; 