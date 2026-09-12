'use client';
import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, PlusCircle, ShieldCheck, UserCircle, LogOut, BookOpen, Layers, Package, Shield } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user || null);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <NextLink href="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-200">
                P2P
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                  VIT Micro-Lending
                </span>
                <span className="text-[10px] font-medium tracking-wider text-sky-600 uppercase block">
                  Peer Exchange Network
                </span>
              </div>
            </NextLink>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 pl-6">
              <NextLink
                href="/"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/' ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Requests Feed
              </NextLink>

              {user && (
                <>
                  <NextLink
                    href="/exchanges"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/exchanges' ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    My Exchanges
                  </NextLink>

                  <NextLink
                    href="/items"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/items' ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Lendable Items
                  </NextLink>

                  <NextLink
                    href="/profile"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/profile' ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Karma & Trust
                  </NextLink>

                  {user.role === 'admin' && (
                    <NextLink
                      href="/admin"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                        pathname === '/admin' ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-purple-600 hover:text-purple-900 hover:bg-purple-50'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin</span>
                    </NextLink>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Live Karma points counter badge */}
                <NextLink
                  href="/profile"
                  className="flex items-center space-x-1.5 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-full text-amber-900 text-xs font-semibold shadow-sm hover:bg-amber-100 transition-colors"
                  title="Your Karma Points balance. Earn +20 for helping peers, spend 10 to get help."
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{user.karma_balance} Karma</span>
                </NextLink>

                {/* Post request button */}
                <NextLink
                  href="/requests/create"
                  className="hidden sm:inline-flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Request</span>
                </NextLink>

                {/* User chip & logout */}
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                  <NextLink
                    href="/profile"
                    className="flex items-center space-x-1.5 text-xs font-medium text-slate-700 hover:text-sky-600 transition-colors"
                  >
                    <UserCircle className="w-5 h-5 text-slate-500" />
                    <span className="hidden lg:inline">{user.name.split(' ')[0]}</span>
                  </NextLink>

                  <button
                    onClick={handleLogout}
                    title="Log out"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              !loading && (
                <div className="flex items-center space-x-2">
                  <NextLink
                    href="/login"
                    className="text-xs font-medium text-slate-700 hover:text-sky-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Log In
                  </NextLink>
                  <NextLink
                    href="/register"
                    className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors"
                  >
                    Join with VIT Email
                  </NextLink>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
