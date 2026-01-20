'use client'

import { useState, useEffect } from 'react';
import LoginButton from './LoginButton';

export default function UserMenu() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  };

  if (loading) return <div className="text-[#93a9a9]">Loading...</div>;

  if (!user) return <LoginButton />;

  return (
    <div className="flex items-center gap-3">
      <span className="text-[#2bd5d5] font-semibold">
        {user.attributes?.username || 'User'}
      </span>
      <button
        onClick={handleLogout}
        className="px-3 py-1.5 bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] rounded hover:bg-[#2bd5d5]/20 transition-colors text-sm"
      >
        Logout
      </button>
    </div>
  );
}
