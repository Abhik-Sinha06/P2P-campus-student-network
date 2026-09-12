'use client';
import NextLink from 'next/link';
import { BookOpen, Code2, Wrench, MapPin, Calendar, Star, Sparkles, Clock, ArrowRight } from 'lucide-react';

export default function RequestCard({ request }) {
  const getCategoryDetails = (category) => {
    switch (category) {
      case 'Academic':
        return {
          icon: BookOpen,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          badge: '📚 Academic Help',
        };
      case 'Project':
        return {
          icon: Code2,
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          badge: '💻 Project Collab',
        };
      case 'Item':
      default:
        return {
          icon: Wrench,
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          badge: '🔌 Item Lending',
        };
    }
  };

  const cat = getCategoryDetails(request.category);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Category & Status Bar */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cat.bg}`}>
            {cat.badge}
          </span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            request.status === 'open' ? 'bg-emerald-100 text-emerald-800' :
            request.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
            'bg-slate-100 text-slate-600'
          }`}>
            {request.status === 'open' ? 'Open' : request.status === 'in_progress' ? 'In Progress' : 'Completed'}
          </span>
        </div>

        {/* Title */}
        <NextLink href={`/requests/${request.request_id}`} className="block">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2">
            {request.title}
          </h3>
        </NextLink>

        {/* Description */}
        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
          {request.description}
        </p>

        {/* Skills / Specifications tag */}
        {request.skills_required && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
              🏷️ {request.skills_required}
            </span>
          </div>
        )}

        {/* Meta details: Campus location & due date */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
          {request.campus_location && (
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{request.campus_location} ({request.preferred_mode})</span>
            </div>
          )}

          {request.return_date && (
            <div className="flex items-center space-x-1.5 text-amber-700 font-medium">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Return by: {new Date(request.return_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Requester info & Action CTA */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
            {request.requester_name ? request.requester_name.charAt(0) : 'S'}
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-800 block leading-tight">
              {request.requester_name}
            </span>
            <span className="text-[10px] text-slate-400 block">
              Year {request.requester_year || 1} • {request.offers_count || 0} offers
            </span>
          </div>
        </div>

        <NextLink
          href={`/requests/${request.request_id}`}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <span>View & Offer</span>
          <ArrowRight className="w-3 h-3" />
        </NextLink>
      </div>
    </div>
  );
}
