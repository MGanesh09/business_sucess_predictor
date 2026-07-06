'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingUp, Menu, X, User } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const checkUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener('scroll', handleScroll);
    checkUser();

    // Listen for storage events to update Navbar immediately on auth change
    window.addEventListener('storage', checkUser);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', checkUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass-panel bg-opacity-80 py-3 shadow-lg' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                Predictor AI
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/#features" className="text-gray-300 hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</Link>
              <Link href="/#demo" className="text-gray-300 hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Demo</Link>
              <Link href="/#pricing" className="text-gray-300 hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Pricing</Link>
              <Link href="/#faq" className="text-gray-300 hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">FAQ</Link>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/dashboard" className="glass-button-secondary py-2 text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white transition-colors">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-gray-300 hover:text-white text-sm font-medium px-3 py-2">
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="glass-button-primary py-2 text-sm">
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden glass-panel bg-opacity-95 border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/#features" onClick={() => setIsOpen(false)} className="text-gray-300 hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium">Features</Link>
            <Link href="/#demo" onClick={() => setIsOpen(false)} className="text-gray-300 hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium">Demo</Link>
            <Link href="/#pricing" onClick={() => setIsOpen(false)} className="text-gray-300 hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium">Pricing</Link>
            <Link href="/#faq" onClick={() => setIsOpen(false)} className="text-gray-300 hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium">FAQ</Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-800 px-4">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="text-sm font-medium text-white px-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-400" />
                  Hi, {user.name}
                </div>
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="glass-button-primary text-center py-2 text-sm w-full">
                  Dashboard
                </Link>
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="glass-button-secondary text-center py-2 text-sm w-full">
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/auth/login" onClick={() => setIsOpen(false)} className="glass-button-secondary text-center py-2 text-sm w-full">
                  Sign In
                </Link>
                <Link href="/auth/signup" onClick={() => setIsOpen(false)} className="glass-button-primary text-center py-2 text-sm w-full">
                  Get Started Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
