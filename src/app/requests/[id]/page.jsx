'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { 
  ArrowLeft, BookOpen, Code2, Wrench, MapPin, Calendar, 
  Star, Sparkles, User, MessageSquare, CheckCircle, ShieldAlert, Flag, Check 
} from 'lucide-react';
import ReportModal from '@/components/ReportModal';

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id;

  const [data, setData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offerMsg, setOfferMsg] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [acceptingOfferId, setAcceptingOfferId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const [reportModalOpen, setReportModalOpen] = useState(false);

  const fetchDetails = async () => {
    try {
      const [resReq, resMe] = await Promise.all([
        fetch(`/api/requests/${requestId}`),
        fetch('/api/auth/me'),
      ]);

      const reqJson = await resReq.json();
      const meJson = await resMe.json();

      if (reqJson.error) {
        throw new Error(reqJson.error);
      }

      setData(reqJson);
      setCurrentUser(meJson.user || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [requestId]);

  const handleMakeOffer = async (e) => {
    e.preventDefault();
    if (!offerMsg.trim()) return;

    setSubmittingOffer(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: parseInt(requestId, 10),
          message: offerMsg,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to submit offer');

      setActionSuccess('Your offer was sent to the requester!');
      setOfferMsg('');
      fetchDetails();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    setAcceptingOfferId(offerId);
    setActionError('');

    try {
      const res = await fetch('/api/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offerId,
          action: 'accept',
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to accept offer');

      router.push('/exchanges');
    } catch (err) {
      setActionError(err.message);
      setAcceptingOfferId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading request details...
      </div>
    );
  }

  if (!data || !data.request) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Request not found</h2>
        <NextLink href="/" className="text-xs font-semibold text-sky-600 hover:underline">
          Return to home feed
        </NextLink>
      </div>
    );
  }

  const { request, offers, exchange, canSeeContact } = data;
  const isRequester = currentUser && currentUser.user_id === request.requester_id;
  const hasAlreadyOffered = offers.some((o) => currentUser && o.helper_id === currentUser.user_id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <NextLink
        href="/"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Requests Feed</span>
      </NextLink>

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">
          {actionSuccess}
        </div>
      )}

      {/* Main Request Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
            {request.category === 'Academic' && '📚 Academic Help'}
            {request.category === 'Project' && '💻 Project Collab'}
            {request.category === 'Item' && '🔌 Item Lending'}
          </span>

          <div className="flex items-center space-x-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              request.status === 'open' ? 'bg-emerald-100 text-emerald-800' :
              request.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
              'bg-slate-100 text-slate-600'
            }`}>
              Status: {request.status === 'open' ? 'Open' : request.status === 'in_progress' ? 'In Progress' : 'Completed'}
            </span>

            {currentUser && !isRequester && (
              <button
                onClick={() => setReportModalOpen(true)}
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                title="Report inappropriate request"
              >
                <Flag className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {request.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Posted on {new Date(request.created_date).toLocaleDateString()}
          </p>
        </div>

        {/* Detailed Description */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Request Scope & Requirements
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {request.description}
          </p>

          {request.skills_required && (
            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500">Related Skills:</span>
              <span className="text-xs bg-white border border-slate-200 text-slate-700 font-medium px-2.5 py-0.5 rounded-md shadow-2xs">
                🏷️ {request.skills_required}
              </span>
            </div>
          )}
        </div>

        {/* Logistics row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center space-x-3 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Campus Location & Mode</p>
              <p className="font-semibold text-slate-800">
                {request.campus_location || 'Campus'} ({request.preferred_mode})
              </p>
            </div>
          </div>

          {request.return_date ? (
            <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl flex items-center space-x-3 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-amber-700 font-medium">Lending Duration</p>
                <p className="font-bold text-amber-900">
                  Return by: {new Date(request.return_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center space-x-3 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-emerald-700 font-medium">Helper Reward</p>
                <p className="font-bold text-emerald-900">
                  +20 Karma Points upon completion
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Requester Profile Section */}
        <div className="p-5 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
              {request.requester_name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">{request.requester_name}</span>
                <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                  Year {request.requester_year}
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-500">
                <span className="flex items-center space-x-1 text-amber-600 font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{request.requester_avg_rating || '5.0'} Trust Rating</span>
                </span>
                <span>•</span>
                <span>{request.requester_karma} Karma Balance</span>
              </div>
            </div>
          </div>

          {/* Contact Privacy Box */}
          <div className="text-right text-xs">
            <p className="text-[11px] text-slate-400">Direct Contact:</p>
            <p className="font-semibold text-slate-800">
              {request.requester_contact}
            </p>
          </div>
        </div>
      </div>

      {/* Offer Submission Section (For other students) */}
      {!isRequester && request.status === 'open' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-slate-900">
              Offer to Help / Lend
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Submit a message with your availability or details. If accepted, you will coordinate on campus and earn <strong>+20 Karma points</strong> once completed!
          </p>

          {currentUser ? (
            <form onSubmit={handleMakeOffer} className="space-y-3">
              <textarea
                rows={3}
                required
                value={offerMsg}
                onChange={(e) => setOfferMsg(e.target.value)}
                placeholder="e.g. I have a spare calculator and can meet you at the library entrance at 10 AM..."
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none leading-relaxed"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingOffer || hasAlreadyOffered}
                  className="px-5 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow transition-colors disabled:opacity-50"
                >
                  {hasAlreadyOffered
                    ? 'Offer Already Submitted'
                    : submittingOffer
                    ? 'Sending Offer...'
                    : 'Submit Offer'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-2">
              <p className="text-xs text-slate-600">Please log in with your verified VIT email to offer help.</p>
              <NextLink
                href={`/login?redirect=/requests/${requestId}`}
                className="inline-block px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded-xl"
              >
                Log In
              </NextLink>
            </div>
          )}
        </div>
      )}

      {/* Offers Received List (Visible to Requester and participants) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
          <span>Peer Offers ({offers.length})</span>
          {request.status === 'in_progress' && (
            <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Exchange in Progress
            </span>
          )}
        </h2>

        {offers.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No offers received yet. Relevant students have been alerted!
          </p>
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => {
              const isAccepted = offer.status === 'accepted';
              return (
                <div
                  key={offer.offer_id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isAccepted
                      ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-200'
                      : 'bg-slate-50/80 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">
                          {offer.helper_name}
                        </span>
                        <span className="text-[10px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                          Year {offer.helper_year}
                        </span>
                        <span className="text-[10px] text-amber-700 font-semibold">
                          ✨ {offer.helper_karma} Karma
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 pt-1">
                        "{offer.message}"
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Offered on {new Date(offer.offer_date).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div>
                      {isAccepted ? (
                        <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl">
                          <Check className="w-3.5 h-3.5" />
                          <span>Offer Accepted</span>
                        </span>
                      ) : isRequester && request.status === 'open' ? (
                        <button
                          onClick={() => handleAcceptOffer(offer.offer_id)}
                          disabled={acceptingOfferId === offer.offer_id}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50"
                        >
                          {acceptingOfferId === offer.offer_id ? 'Accepting...' : 'Accept Offer'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          {offer.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetUserId={request.requester_id}
        targetUserName={request.requester_name}
      />
    </div>
  );
}
