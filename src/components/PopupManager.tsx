'use client';

import { useState } from 'react';
import EnquiryFormPopup from './EnquiryFormPopup';
import FirstOrderOfferPopup from './FirstOrderOfferPopup';
import { useAuth } from '@/context/AuthContext';

export default function PopupManager() {
  const { user } = useAuth();
  const [showFirstOrderOffer, setShowFirstOrderOffer] = useState(true);

  return (
    <>
      <EnquiryFormPopup />
      {user && showFirstOrderOffer && (
        <FirstOrderOfferPopup
          hasPlacedOrder={user.hasPlacedOrder || false}
          onClose={() => setShowFirstOrderOffer(false)}
        />
      )}
    </>
  );
}
