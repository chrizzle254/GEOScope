import { useState } from 'react';

interface Step5Props {
  onNext: (paymentMethod: string) => void;
  onBack: () => void;
}

export function Step5Payment({ onNext, onBack }: Step5Props) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [showDialog, setShowDialog] = useState(true);

  const handleSubmit = () => {
    if (cardNumber.length >= 16 && expiryDate.length >= 4 && cvv.length >= 3) {
      onNext('card');
    }
  };

  if (!showDialog) {
    return null;
  }

  return (
    <div className="p-16 flex items-center justify-center min-h-[calc(100vh-80px)] relative">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      {/* Dialog */}
      <div className="relative bg-white border-2 border-[#1e1e1e] rounded-lg p-12 w-full max-w-2xl shadow-2xl">
        <p 
          className="text-[#1e1e1e] text-[32px] tracking-[-0.608px] mb-6" 
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
        >
          Payment Details
        </p>
        
        <div className="space-y-6">
          <div>
            <p 
              className="text-[#757575] text-[16px] tracking-[-0.176px] mb-4" 
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
            >
              ADD PAYMENT METHOD FOR TRIAL ELIGIBILITY
            </p>
            <p 
              className="text-[#757575] text-[14px] mb-6" 
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              You won't be charged during your 3-day trial. This is just to verify your eligibility and can be used to top up your account later.
            </p>
            
            <div className="space-y-4">
              <div>
                <p 
                  className="text-[#757575] text-[12px] tracking-[-0.132px] mb-2" 
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                >
                  CARD NUMBER
                </p>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-6 py-4 border-2 border-[#1e1e1e] rounded text-[20px] tracking-[-0.38px] placeholder:text-[#d9d9d9]"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p 
                    className="text-[#757575] text-[12px] tracking-[-0.132px] mb-2" 
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    EXPIRY DATE
                  </p>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="MM/YY"
                    className="w-full px-6 py-4 border-2 border-[#1e1e1e] rounded text-[20px] tracking-[-0.38px] placeholder:text-[#d9d9d9]"
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                  />
                </div>
                <div>
                  <p 
                    className="text-[#757575] text-[12px] tracking-[-0.132px] mb-2" 
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    CVV
                  </p>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="123"
                    className="w-full px-6 py-4 border-2 border-[#1e1e1e] rounded text-[20px] tracking-[-0.38px] placeholder:text-[#d9d9d9]"
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={onBack}
              className="px-12 py-3 border-2 border-[#757575] text-[#757575] rounded text-[24px] tracking-[-0.456px] hover:bg-[#f5f5f5] transition-colors"
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={cardNumber.length < 16 || expiryDate.length < 4 || cvv.length < 3}
              className="px-12 py-3 bg-[#1e1e1e] text-white rounded text-[24px] tracking-[-0.456px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#000] transition-colors"
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              Start Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
