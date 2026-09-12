'use client';
import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { Search, PlusCircle, Sparkles, BookOpen, Code2, Wrench, MapPin, Filter, RefreshCw } from 'lucide-react';
import RequestCard from '@/components/RequestCard';

export default function HomeFeed() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('All');
  const [search, setSearch] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (location !== 'All') params.append('location', location);
      if (search) params.append('search', search);

      const res = await fetch(`/api/requests?${params.toString()}`);
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [category, location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur border border-white/20 px-3 py-1 rounded-full text-xs font-medium text-sky-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Non-Monetary Campus Barter Economy</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Academic Tutoring, Project Help & Equipment Lending on Campus.
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Borrow calculators, Arduino kits, or get help with tricky syllabus topics. Verified VIT students exchange goodwill using Karma Points (earn +20 points when you help a peer, spend 10 when you receive help).
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <NextLink
              href="/requests/create"
              className="inline-flex items-center space-x-2 bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post a Request</span>
            </NextLink>

            <NextLink
              href="/items"
              className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl border border-white/20 backdrop-blur transition-all"
            >
              <Wrench className="w-4 h-4 text-sky-300" />
              <span>List Lendable Item</span>
            </NextLink>
          </div>
        </div>

        {/* Decorative background badges */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block pr-8">
          <div className="text-[140px] font-black tracking-tighter">VIT</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {[
              { id: 'All', label: 'All Requests' },
              { id: 'Academic', label: '📚 Academic Tutoring' },
              { id: 'Project', label: '💻 Project Collab' },
              { id: 'Item', label: '🔌 Item Lending' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  category === tab.id
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-200'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search topics, items, skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>

            {/* Campus location dropdown */}
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 outline-none font-medium"
            >
              <option value="All">All Locations</option>
              <option value="Library">Library</option>
              <option value="Technology Tower">TT (Tech Tower)</option>
              <option value="SJT">SJT</option>
              <option value="Hostel">Hostels</option>
              <option value="Online">Online</option>
            </select>

            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-xl"
            >
              Filter
            </button>
          </form>
        </div>
      </div>

      {/* Requests Feed Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <span>Open Campus Requests</span>
            <span className="text-xs font-normal text-slate-500">
              ({requests.length} available)
            </span>
          </h2>

          <button
            onClick={fetchRequests}
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse h-56"></div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No requests found</h3>
            <p className="text-xs text-slate-500">
              No open requests match your current filters. Be the first to post a new request!
            </p>
            <NextLink
              href="/requests/create"
              className="inline-flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2 rounded-xl"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post Request</span>
            </NextLink>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {requests.map((req) => (
              <RequestCard key={req.request_id} request={req} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
