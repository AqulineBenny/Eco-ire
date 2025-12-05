'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      backgroundColor: '#2e7d32',
      color: 'white',
      padding: '15px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' }}>
        EcoĒire
      </Link>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
        <Link href="/report" style={{ color: 'white', textDecoration: 'none' }}>Report</Link>

        {user ? (
          <>
            <Link href="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
            <span>Hello, {user.name}</span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'white',
                color: '#2e7d32',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
            <Link href="/register" style={{
              backgroundColor: 'white',
              color: '#2e7d32',
              padding: '8px 15px',
              borderRadius: '5px',
              textDecoration: 'none'
            }}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}