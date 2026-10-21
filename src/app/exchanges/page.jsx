'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { 
  CheckCircle2, Clock, Calendar, Star, Phone, Sparkles, 
  AlertTriangle, RefreshCw, Flag, ArrowRight, User, PlusCircle, MessageSquare, BookOpen, Code2, Wrench
} from 'lucide-react';
import RatingModal from '@/components/RatingModal';
import ReportModal from '@/components/ReportModal';

export default function MyExchangesPage() {
  const router = useRouter();
  const [exchanges, setExchanges] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [ratingModal, setRatingModal] = useState({ open: false, exchangeId: null, partnerName: '' });
  const [reportModal, setReportModal] = useState({ open: false, targetId: null, targetName: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resEx, resReq] = await Promise.all([
        fetch('/api/exchanges'),
        fetch('/api/requests?filter=mine'),
      ]);

      if (resEx.status === 401) {
        router.push('/login?redirect=/exchanges');
        return;
      }

      const dataEx = await resEx.json();
      const dataReq = await resReq.json();

      setExchanges(dataEx.exchanges || []);
      setMyRequests(dataReq.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleComplete = async (exchange) => {
    setCompletingId(exchange.exchange_id);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/exchanges', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exchange_id: exchange.exchange_id,
          action: 'complete',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete exchange');

      setSuccess('Exchange successfully completed! Karma points updated (+20 for Helper, -10 for Requester).');
      fetchData();

      // Automatically open rating modal for immediate feedback
      const partnerName = exchange.user_role === 'requester' ? exchange.helper_name : exchange.requester_name;
      setRatingModal({
        open: true,
        exchangeId: exchange.exchange_id,
        partnerName,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setCompletingId(null);
    }
  };

  const activeList = exchanges.filter((e) => e.status === 'active');
  const completedList = exchanges.filter((e) => e.status === 'completed');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          My Requests & Campus Exchanges
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your posted requests, manage active peer exchanges, and track completed history.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">
          {success}
        </div>
      )}

      {/* Section 1: My Posted Requests (Open or Waiting for Offers) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <span>My Posted Requests</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {myRequests.length}
            </span>
          </h2>

          <NextLink
            href="/requests/create"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-sky-600 hover:text-sky-800"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Post New Request</span>
          </NextLink>
        </div>

        {loading ? (
          <div className="p-6 text-center text-xs text-slate-400">Loading your requests...</div>
        ) : myRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-2">
            <p className="text-xs text-slate-500">You haven't posted any assistance or lending requests yet.</p>
            <NextLink href="/requests/create" className="text-xs font-semibold text-sky-600 hover:underline inline-block">
              Post your first request (+50 Karma granted on signup) →
            </NextLink>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myRequests.map((req) => (
              <div
                key={req.request_id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                      {req.category === 'Academic' && '📚 Academic Help'}
                      {req.category === 'Project' && '💻 Project Collab'}
                      {req.category === 'Item' && '🔌 Item Lending'}
                    </span>

                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      req.status === 'open' ? 'bg-emerald-100 text-emerald-800' :
                      req.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {req.status === 'open' ? 'Open (Waiting for Offers)' : req.status === 'in_progress' ? 'In Progress' : 'Completed'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {req.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {req.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {req.status === 'open' ? 'Awaiting peer offers' : 'Matched with peer'}
                  </span>

                  <NextLink
                    href={`/requests/${req.request_id}`}
                    className="inline-flex items-center space-x-1 font-semibold text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>View & Review Offers</span>
                    <ArrowRight className="w-3 h-3" />
                  </NextLink>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Active Exchanges (Offers that have been Accepted) */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>Active Matched Exchanges</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                {activeList.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Exchanges in progress where an offer was accepted. Direct contacts are revealed below.
            </p>
          </div>
        </div>

        {activeList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
            <p className="text-xs text-slate-500">
              No active exchanges in progress. Once you accept a peer's offer (or another student accepts your offer), it will appear here!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeList.map((ex) => {
              const isRequester = ex.user_role === 'requester';
              const partnerName = isRequester ? ex.helper_name : ex.requester_name;
              const partnerContact = isRequester ? ex.helper_contact : ex.requester_contact;
              const partnerRoom = isRequester ? ex.helper_room : ex.requester_room;
              const partnerId = isRequester ? ex.helper_id : ex.requester_id;

              return (
                <div
                  key={ex.exchange_id}
                  className="bg-white rounded-3xl p-6 border border-sky-100 ring-1 ring-sky-500/10 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        ⚡ In Progress
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Role: {isRequester ? 'Requester (-10 pts)' : 'Helper (+20 pts)'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">
                      {ex.title}
                    </h3>

                    {/* Due Date & Return Reminder (FR-3.1.5) */}
                    {ex.due_date && (
                      <div className="flex items-center space-x-2 text-xs font-medium text-amber-800 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60">
                        <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>Return / Due Date: <strong>{new Date(ex.due_date).toLocaleDateString()}</strong></span>
                      </div>
                    )}

                    {/* Matched Partner Contact & Room info (Security Measure for Item Lending) */}
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">Partner:</span>
                        <span className="font-bold text-slate-800">{partnerName}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-[11px] text-slate-400 font-medium">Direct Contact:</span>
                        <span className="font-semibold text-sky-700 flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{partnerContact || 'Not provided'}</span>
                        </span>
                      </div>
                      {partnerRoom && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span className="text-[11px] text-slate-400 font-medium">Hostel Room:</span>
                          <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                            📍 {partnerRoom}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Mark Complete & Report */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setReportModal({ open: true, targetId: partnerId, targetName: partnerName })}
                      className="text-xs text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-slate-50 flex items-center space-x-1"
                      title="Report issue or unreturned item"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>Report</span>
                    </button>

                    <button
                      onClick={() => handleComplete(ex)}
                      disabled={completingId === ex.exchange_id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{completingId === ex.exchange_id ? 'Confirming...' : 'Mark as Completed'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: Completed Exchanges */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <span>Completed History</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
            {completedList.length}
          </span>
        </h2>

        {completedList.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No past completed exchanges yet.</p>
        ) : (
          <div className="space-y-3">
            {completedList.map((ex) => {
              const isRequester = ex.user_role === 'requester';
              const partnerName = isRequester ? ex.helper_name : ex.requester_name;

              return (
                <div
                  key={ex.exchange_id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">{ex.title}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        Completed on {ex.completion_date || 'Past'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Partner: <strong className="text-slate-700">{partnerName}</strong> • {isRequester ? '-10 Karma debited' : '+20 Karma credited'}
                    </p>
                  </div>

                  <div>
                    {ex.has_rated ? (
                      <span className="inline-flex items-center space-x-1 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Rating Submitted</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setRatingModal({ open: true, exchangeId: ex.exchange_id, partnerName })}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>Rate Partner</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <RatingModal
        isOpen={ratingModal.open}
        onClose={() => setRatingModal({ open: false, exchangeId: null, partnerName: '' })}
        exchangeId={ratingModal.exchangeId}
        partnerName={ratingModal.partnerName}
        onSuccess={fetchData}
      />

      <ReportModal
        isOpen={reportModal.open}
        onClose={() => setReportModal({ open: false, targetId: null, targetName: '' })}
        targetUserId={reportModal.targetId}
        targetUserName={reportModal.targetName}
      />
    </div>
  );
}
