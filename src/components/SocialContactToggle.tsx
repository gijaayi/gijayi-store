'use client';

import { Instagram, MessageCircle } from 'lucide-react';

export default function SocialContactToggle() {
  const whatsappUrl = 'https://wa.me/917310580050?text=Hi%20Gijayi%2C%20I%20need%20help%20with%20jewellery.';

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      <a
        href="https://instagram.com/begijayi"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-[#feda75] via-[#d62976] to-[#962fbf] text-white shadow-[0_12px_28px_rgba(214,41,118,0.35)] transition-transform hover:scale-105"
        aria-label="Open Instagram chat"
        title="Instagram"
      >
        <Instagram size={24} strokeWidth={2.2} />
      </a>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_28px_rgba(37,211,102,0.35)] transition-transform hover:scale-105"
        aria-label="Open WhatsApp chat"
        title="WhatsApp"
      >
        <MessageCircle size={24} strokeWidth={2.2} />
      </a>
    </div>
  );
}
