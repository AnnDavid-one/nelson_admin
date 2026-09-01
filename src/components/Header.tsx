'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function Header() {
  const [userName, setUserName] = useState('Admin');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await api.verify();
        setUserName(data.user?.name || 'Admin');
      } catch {
        // Use default
      }
    };
    loadUser();
  }, []);

  return (
    <header className="bg-white shadow-sm px-4 sm:px-6 py-4">
      <div className="flex justify-between items-center gap-4">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
            Welcome back, {userName}
          </h2>
          <p className="text-sm text-gray-500 hidden sm:block">Manage your store and content</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 font-semibold text-lg">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}