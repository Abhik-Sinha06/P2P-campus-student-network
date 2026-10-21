'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserCheck, Star, Sparkles, Award, ShieldCheck, 
  ArrowUpRight, ArrowDownLeft, Phone, Calendar, RefreshCw,
  Home, CheckCircle2, Clock, AlertTriangle, Send
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [karmaData, setKarmaData] = useState({ balance: 0, transactions: [] });
  const [ratingsData, setRatingsData] = useState({ average_rating: 5, total_reviews: 0, completed_exchanges: 0, ratings: [] });
  const [loading, setLoading] = useState(true);

  // Room verification state
  const [block, setBlock] = useState('A');
  const [roomNum, setRoomNum] = useState('');
  const [roomSubmitting, setRoomSubmitting] = useState(false);
  const [roomError, setRoomError] = useState('');
  const [roomSuccess, setRoomSuccess] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const resMe = await fetch('/api/auth/me');
      const dataMe = await resMe.json();
      if (!dataMe.user) {
        router.push('/login?redirect=/profile');
        return;
      }
      setUser(dataMe.user);

      const [resKarma, resRatings] = await Promise.all([
        fetch('/api/karma'),
        fetch(`/api/ratings?userId=${dataMe.user.user_id}`),
      ]);

      const dataKarma = await resKarma.json();
      const dataRatings = await resRatings.json();

      setKarmaData(dataKarma);
      setRatingsData(dataRatings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    setRoomError('');
    setRoomSuccess('');
    setRoomSubmitting(true);

    try {
      const formatted = `${block}-${roomNum.trim()}`;
      const res = await fetch('/api/profile/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_number: formatted }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit room');

      setRoomSuccess('Hostel room submitted successfully! A verification request was sent to Admin.');
      setUser(prev => ({ ...prev, room_number: data.room_number, room_status: 'pending' }));
    } catch (err) {
      setRoomError(err.message);
    } finally {
      setRoomSubmitting(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading profile and karma ledger...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-sky-100">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
                <span className="inline-flex items-center space-x-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified VIT Student</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {user.email} • Year {user.year}
              </p>
              <div className="flex items-center space-x-2 mt-1.5 flex-wrap gap-y-1">
                {user.contact_info && (
                  <p className="text-xs text-slate-600 flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>Contact: {user.contact_info}</span>
                  </p>
                )}
                {user.role !== 'admin' && (
                  <>
                    <span className="text-slate-300">•</span>
                    {user.room_status === 'verified' ? (
                      <span id="profile-room-badge" className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Room: {user.room_number} (Verified)</span>
                      </span>
                    ) : user.room_status === 'pending' ? (
                      <span id="profile-room-badge" className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Room: {user.room_number} (Pending Admin Verification)</span>
                      </span>
                    ) : (
                      <span id="profile-room-badge" className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Room: Unverified</span>
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div id="profile-karma-balance" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-center min-w-[100px]">
              <span className="text-lg font-black text-amber-900 block leading-tight">
                {user.karma_balance}
              </span>
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">
                Karma Points
              </span>
            </div>

            <div id="profile-trust-score" className="bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3 text-center min-w-[100px]">
              <div className="flex items-center justify-center space-x-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-lg font-black text-sky-900 leading-tight">
                  {ratingsData.average_rating}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-sky-700 uppercase tracking-wide">
                Trust Score
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hostel Room Security Registration Card for Students */}
      {user.role !== 'admin' && user.room_status !== 'verified' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center space-x-1.5 bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 mb-2">
                <Home className="w-3.5 h-3.5" />
                <span>Campus Security Requirement</span>
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Hostel Room Number Verification
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                As a security measure to prevent unreturned items, students must register and verify their hostel room number before posting requests or offering help. Your room number is masked and only revealed to your matched partner during an active exchange.
              </p>
            </div>
          </div>

          {roomError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {roomError}
            </div>
          )}

          {roomSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">
              {roomSuccess}
            </div>
          )}

          {user.room_status === 'pending' ? (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center space-x-3 text-xs text-amber-900">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Verification Request Pending: {user.room_number}</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Your hostel room number has been submitted to the platform Admin. Once the Admin verifies your room, you will be able to post requests and submit offers!
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRoomSubmit} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hostel Block
                  </label>
                  <select
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none font-bold"
                  >
                    <option value="A">Block A</option>
                    <option value="B">Block B</option>
                    <option value="C">Block C</option>
                    <option value="D">Block D</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Room Number (100 to 1650)
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    max={1650}
                    value={roomNum}
                    onChange={(e) => setRoomNum(e.target.value)}
                    placeholder="e.g. 325 (Floor 3, Room 25)"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Floors 1 to 16, 50 rooms per floor (100–150, 200–250, ..., 1600–1650). Saved as {block}-{roomNum || '325'}.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={roomSubmitting || !roomNum}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow transition-colors disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{roomSubmitting ? 'Submitting...' : 'Confirm & Send to Admin for Verification'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Karma Wallet & Ledger Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Karma Points Balance & Ledger</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Non-monetary community credit keeping exchanges fair and discouraging free-riding (FR-3.2).
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            Rules: +20 for helping • -10 for receiving help
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Type / Description</th>
                <th className="py-3 px-4">Exchange Ref</th>
                <th className="py-3 px-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {karmaData.transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                karmaData.transactions.map((txn) => {
                  const isPositive = txn.amount > 0;
                  return (
                    <tr key={txn.txn_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500">#{txn.txn_id}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 capitalize">
                          {txn.type === 'signup_bonus' && '🎉 Verified Student Signup Grant'}
                          {txn.type === 'help_provided' && '🤝 Peer Help / Equipment Lent'}
                          {txn.type === 'request_fulfilled' && '📖 Peer Assistance Received'}
                          {txn.type === 'admin_adjustment' && '⚖️ Admin Balance Adjustment'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {txn.exchange_id ? `Exchange #${txn.exchange_id}` : 'Platform Grant'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex items-center space-x-1 font-bold ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isPositive ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                          <span>{isPositive ? `+${txn.amount}` : txn.amount} pts</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ratings & Reviews Received */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span>Peer Reviews & Trust History ({ratingsData.total_reviews})</span>
        </h2>

        {ratingsData.ratings.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No reviews received yet. Complete exchanges to build your campus reputation!
          </p>
        ) : (
          <div className="space-y-3">
            {ratingsData.ratings.map((r) => (
              <div key={r.rating_id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < r.score ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Reviewed by <strong className="text-slate-700">{r.rater_name}</strong>
                  </span>
                </div>
                {r.comment && (
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{r.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
