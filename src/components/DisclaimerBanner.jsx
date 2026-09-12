'use client';
import { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export default function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs px-4 py-2 flex items-center justify-between transition-all">
      <div className="flex items-center space-x-2 max-w-5xl mx-auto">
        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>
          <strong>Campus Community Notice:</strong> Exchanges are goodwill and Karma-point based (strictly no monetary payments). Item lending occurs at students' own discretion; the platform is not liable for loss or damage to lent items.
        </span>
      </div>
      <button 
        onClick={() => setDismissed(true)} 
        className="text-amber-700 hover:text-amber-900 p-1"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
