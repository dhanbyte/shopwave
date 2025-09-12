'use client';
import { useEffect, useState } from 'react';
import { X, Phone } from 'lucide-react';
import { Button } from './ui/button';

interface BulkOrderPopupProps {
  onClose: () => void;
}

export default function BulkOrderPopup({ onClose }: BulkOrderPopupProps) {
  const handleWhatsAppClick = () => {
    // Replace with your WhatsApp number in international format (without + or 00)
    const phoneNumber = '919876543210'; // Example: 91 for India, followed by your number
    const message = 'Hello! I\'m interested in bulk order/dropshipping.';
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <Phone className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Bulk Order or Dropshipping?</h3>
          <p className="text-sm text-gray-500 mb-6">
            Get special wholesale prices for bulk orders. Contact us now for the best deals!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleWhatsAppClick}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.197.297-.767.963-.94 1.16-.173.199-.347.221-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.795-1.484-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.136-.133.296-.347.445-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.791.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.5.714.306 1.27.489 1.704.625.714.226 1.365.195 1.878.118.571-.085 1.758-.719 2.005-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.36-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.55 4.142 1.595 5.945L0 24l6.335-1.652a11.882 11.882 0 005.723 1.465h.005c6.554 0 11.89-5.335 11.89-11.893 0-3.18-1.255-6.169-3.53-8.419"/>
              </svg>
              Chat on WhatsApp
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-gray-300"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
