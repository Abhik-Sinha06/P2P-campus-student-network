'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NextLink from 'next/link';
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (uEmail, uPass) => {
    setEmail(uEmail);
    setPassword(uPass);
    setError('');
  };

  return (
    <div className="max-w-md w-full mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-md shadow-sky-200">
          P2P
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          VIT Student Login
        </h1>
        <p className="text-xs text-slate-500">
          Sign in using your verified <span className="font-semibold text-sky-600">@vitstudent.ac.in</span> account
        </p>
      </div>

      {/* Quick Test Demo Credentials Bar for Evaluation */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
        <p className="font-bold text-slate-700 flex items-center space-x-1.5">
          <UserCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>Demo Accounts (1-Click Fill)</span>
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => quickFill('abhik@vitstudent.ac.in', 'Student@123')}
            className="p-2 text-left bg-white border border-slate-200 rounded-xl hover:border-sky-500 transition-colors"
          >
            <p className="font-bold text-slate-800 text-[11px]">Abhik Sinha</p>
            <p className="text-[10px] text-slate-500">70 pts • Student</p>
          </button>
          <button
            type="button"
            onClick={() => quickFill('priya.s@vitstudent.ac.in', 'Student@123')}
            className="p-2 text-left bg-white border border-slate-200 rounded-xl hover:border-sky-500 transition-colors"
          >
            <p className="font-bold text-slate-800 text-[11px]">Priya Sharma</p>
            <p className="text-[10px] text-slate-500">90 pts • Student</p>
          </button>
          <button
            type="button"
            onClick={() => quickFill('rahul.k@vitstudent.ac.in', 'Student@123')}
            className="p-2 text-left bg-white border border-slate-200 rounded-xl hover:border-sky-500 transition-colors"
          >
            <p className="font-bold text-slate-800 text-[11px]">Rahul Kumar</p>
            <p className="text-[10px] text-slate-500">50 pts • Student</p>
          </button>
          <button
            type="button"
            onClick={() => quickFill('admin@vitstudent.ac.in', 'Admin@123')}
            className="p-2 text-left bg-purple-50/50 border border-purple-200 rounded-xl hover:border-purple-500 transition-colors"
          >
            <p className="font-bold text-purple-900 text-[11px]">Admin Council</p>
            <p className="text-[10px] text-purple-600">Moderator Role</p>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              VIT Student Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. yourname2024@vitstudent.ac.in"
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          New to the network?{' '}
          <NextLink href="/register" className="font-bold text-sky-600 hover:underline">
            Register with VIT Email (+50 Karma)
          </NextLink>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
