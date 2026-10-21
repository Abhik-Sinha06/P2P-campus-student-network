'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Code2, Wrench, Sparkles, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import NextLink from 'next/link';

export default function CreateRequestPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState('Academic');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [preferredMode, setPreferredMode] = useState('in-person');
  const [campusLocation, setCampusLocation] = useState('Central Library, 2nd Floor');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push('/login?redirect=/requests/create');
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (category === 'Item' && !returnDate) {
      setError('Please select a return date for borrowed items');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          title,
          description,
          preferred_mode: preferredMode,
          campus_location: campusLocation,
          skills_required: skillsRequired,
          return_date: category === 'Item' ? returnDate : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      router.push(`/requests/${data.request.request_id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center text-xs text-slate-500">
        Checking student verification status...
      </div>
    );
  }

  const hasInsufficientKarma = user && user.karma_balance < 10;
  const isRoomUnverified = user && user.role !== 'admin' && user.room_status !== 'verified';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <NextLink
        href="/"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Feed</span>
      </NextLink>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Post a Peer Assistance Request
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Connect with verified peers for academic tutoring, project collaboration, or short-term item lending.
          </p>
        </div>

        {/* Room Verification Warning */}
        {isRoomUnverified && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Hostel Room Verification Required</p>
              <p className="text-amber-800 leading-relaxed">
                As a campus security measure (to protect students lending items or study equipment), you must enter your hostel room number in your Profile and receive Admin verification before posting requests.
              </p>
              <div className="pt-1">
                <NextLink
                  href="/profile"
                  className="inline-flex items-center space-x-1 font-bold text-sky-700 hover:text-sky-900 underline"
                >
                  <span>Go to Profile to Register Room ({user?.room_status === 'pending' ? 'Pending Admin Approval' : 'Not Registered'}) →</span>
                </NextLink>
              </div>
            </div>
          </div>
        )}

        {/* Karma Points Info Box */}
        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex items-start space-x-3 text-xs text-sky-900">
          <Sparkles className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              Karma Economics: Your Current Balance is {user?.karma_balance} Points
            </p>
            <p className="text-sky-700 leading-relaxed">
              Posting is free. When a peer successfully fulfills your request, <strong>10 Karma points</strong> are deducted from your balance, and <strong>20 Karma points</strong> are awarded to your helper!
            </p>
          </div>
        </div>

        {/* Insufficient Karma Warning */}
        {hasInsufficientKarma && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Minimum Karma Balance Required</p>
              <p className="mt-0.5">
                You have {user?.karma_balance} points. A minimum of 10 points is required to post a request. You can easily earn +20 Karma points by fulfilling an open request or lending an item!
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              1. Select Exchange Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'Academic', label: 'Academic Help', desc: 'Tutoring, syllabus doubts', icon: BookOpen },
                { id: 'Project', label: 'Project Assistance', desc: 'Teammates & tech skills', icon: Code2 },
                { id: 'Item', label: 'Item Lending', desc: 'Calculators, Arduino, tools', icon: Wrench },
              ].map((c) => {
                const Icon = c.icon;
                const isSelected = category === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-sky-600 bg-sky-50/70 ring-2 ring-sky-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                    <p className={`text-xs font-bold ${isSelected ? 'text-sky-900' : 'text-slate-800'}`}>
                      {c.label}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{c.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Request Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                category === 'Academic'
                  ? 'e.g. Need doubt clarification on Bellman-Ford algorithm in DSA'
                  : category === 'Project'
                  ? 'e.g. Looking for a peer with React & Tailwind skills for hackathon'
                  : 'e.g. Need Casio fx-991EX calculator for tomorrow afternoon lab exam'
              }
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact details so potential helpers know what you need and how they can best assist you..."
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none leading-relaxed"
            />
          </div>

          {/* Dynamic Category Specific Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Preferred Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Interaction Mode
              </label>
              <select
                value={preferredMode}
                onChange={(e) => setPreferredMode(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none font-medium"
              >
                <option value="in-person">In-Person (On Campus)</option>
                <option value="online">Online (Google Meet / Discord)</option>
              </select>
            </div>

            {/* Campus Meeting Spot */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campus Location / Meeting Spot
              </label>
              <input
                type="text"
                value={campusLocation}
                onChange={(e) => setCampusLocation(e.target.value)}
                placeholder="e.g. Central Library, SJT 4th floor, TT Canteen"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          {/* Additional category fields */}
          {category === 'Item' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Return-By Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={returnDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full sm:w-1/2 px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Specifying an exact return date helps lenders know when to expect their equipment back.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Relevant Subject / Skill Tag
              </label>
              <input
                type="text"
                value={skillsRequired}
                onChange={(e) => setSkillsRequired(e.target.value)}
                placeholder="e.g. Python, Digital Logic, Machine Learning, Data Structures"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Helps match your request with peers who listed this skill on their profile.
              </p>
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <NextLink
              href="/"
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </NextLink>

            <button
              id="submit-request-btn"
              type="submit"
              disabled={submitting || hasInsufficientKarma || isRoomUnverified}
              className="px-6 py-2.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center space-x-1.5"
            >
              <span>{submitting ? 'Posting...' : 'Publish Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
