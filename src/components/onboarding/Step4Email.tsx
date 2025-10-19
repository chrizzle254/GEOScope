import { useState } from 'react';

interface Step4Props {
  onNext: (email: string) => void;
  onBack: () => void;
}

export function Step4Email({ onNext, onBack }: Step4Props) {
  const [email, setEmail] = useState('');
  const [showDialog, setShowDialog] = useState(true);

  const handleSubmit = () => {
    if (email.trim() && email.includes('@')) {
      onNext(email);
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
          Almost there!
        </p>
        
        <div className="space-y-6">
          <div>
            <p 
              className="text-[#757575] text-[16px] tracking-[-0.176px] mb-4" 
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
            >
              ENTER YOUR EMAIL TO START YOUR FREE 3-DAY TRIAL
            </p>
            <p 
              className="text-[#757575] text-[14px] mb-4" 
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              We'll send you a confirmation email to verify your account. You can use this to log in later.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="your@email.com"
              className="w-full px-6 py-4 border-2 border-[#1e1e1e] rounded text-[24px] tracking-[-0.456px] placeholder:text-[#d9d9d9]"
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              autoFocus
            />
          </div>

          <div className="flex justify-between">
            <button
              onClick={onBack}
              className="px-12 py-3 border-2 border-[#757575] text-[#757575] rounded text-[24px] tracking-[-0.456px] hover:bg-[#f5f5f5] transition-colors"
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!email.trim() || !email.includes('@')}
              className="px-12 py-3 bg-[#757575] text-white rounded text-[24px] tracking-[-0.456px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5f5f5f] transition-colors"
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
