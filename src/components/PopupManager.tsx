'use client';

import { useState, useEffect } from 'react';
import EnquiryFormPopup from './EnquiryFormPopup';
import FirstOrderOfferPopup from './FirstOrderOfferPopup';
import { useAuth } from '@/context/AuthContext';

export default function PopupManager() {
  const { user } = useAuth();
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [showFirstOrderOffer, setShowFirstOrderOffer] = useState(false);

  // Show first popup after 5 seconds on page load
  useEffect(() => {
    const hasSeenPopups = sessionStorage.getItem('popupsShown');
    if (!hasSeenPopups) {
      const timer = setTimeout(() => {
        setShowEnquiry(true);
        sessionStorage.setItem('popupsShown', 'true');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnquiryClose = () => {
    setShowEnquiry(false);
    // Show the shipping offer popup after closing enquiry (with slight delay)
    setTimeout(() => {
      setShowFirstOrderOffer(true);
    }, 300);
  };

  const handleOfferClose = () => {
    setShowFirstOrderOffer(false);
  };

  return (
    <>
      {showEnquiry && <EnquiryFormPopup onClose={handleEnquiryClose} shouldShow={showEnquiry} />}
      {showFirstOrderOffer && (
        <FirstOrderOfferPopup
          hasPlacedOrder={user?.hasPlacedOrder || false}
          onClose={handleOfferClose}
          isAutomatic={true}
        />
      )}
    </>
  );
}
