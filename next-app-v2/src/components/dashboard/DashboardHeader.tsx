'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardHeader() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    // In a real app, we would call a server action to clear the session.
    // For now, just redirect to login.
    router.push('/login');
  };

  return (
    <header className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">교사 관리 포털</h1>
          <p className="text-gray-600 mt-1">과제 제출 현황 및 학생 관리</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            <span id="current-time">{currentTime}</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
