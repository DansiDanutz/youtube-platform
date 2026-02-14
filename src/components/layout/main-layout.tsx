'use client';

import { ReactNode } from 'react';
import Sidebar from './sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Sidebar />
      <div className="md:pl-64">
        <main className="p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}