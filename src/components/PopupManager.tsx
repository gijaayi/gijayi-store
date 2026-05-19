'use client';

import { useState, useEffect } from 'react';
import EnquiryFormPopup from './EnquiryFormPopup';

export default function PopupManager() {
  const [showFlashPopup, setShowFlashPopup] = useState(false);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('welcomeFlashPopupShown');
    if (hasSeenPopup) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowFlashPopup(true);
      sessionStorage.setItem('welcomeFlashPopupShown', 'true');
    }, 180000);

    return () => window.clearTimeout(timer);
  }, []);

  const handleFlashClose = () => {
    setShowFlashPopup(false);
  };

  return (
    <>
      {showFlashPopup && <EnquiryFormPopup onClose={handleFlashClose} shouldShow={showFlashPopup} />}
    </>
  );
}
