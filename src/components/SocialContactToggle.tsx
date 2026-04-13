'use client';

import { useState } from 'react';
import { Instagram, MessageCircle, Share2, X } from 'lucide-react';

export default function SocialContactToggle() {
  const [open, setOpen] = useState(false);
  const whatsappUrl = 'https://wa.me/917310580050?text=Hi%20Gijayi%2C%20I%20need%20help%20with%20jewellery.';

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-2 min-w-[200px] rounded-2xl border border-white/30 bg-white/90 p-2 shadow-xl backdrop-blur">
          <p className="mb-1 text-[8px] tracking-[0.25em] uppercase text-slate-500">Quick Contact</p>
          <div className="flex flex-col gap-1">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-[#25D366] bg-white px-3 py-1 text-[10px] tracking-widest uppercase text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors"
          >
            <MessageCircle size={12} /> WhatsApp
          </a>
          <a
            href="https://instagram.com/gijayi.official"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-[#E1306C] bg-white px-3 py-1 text-[10px] tracking-widest uppercase text-[#E1306C] hover:bg-[#E1306C] hover:text-white transition-colors"
          >
            <Instagram size={12} /> Instagram
          </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-1 rounded-full bg-[#1a1a1a] px-3 py-2 text-white shadow-lg hover:bg-[#b8963e] transition-colors"
        aria-label={open ? 'Close social contact options' : 'Open social contact options'}
      >
        {open ? <X size={14} /> : <Share2 size={14} />}
        <span className="text-[9px] tracking-widest uppercase">Chat</span>
      </button>
    </div>
  );
}
