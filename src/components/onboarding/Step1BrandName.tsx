import { useState } from 'react';

interface Step1Props {
  onNext: (brandName: string) => void;
}

export function Step1BrandName({ onNext }: Step1Props) {
  const [brandName, setBrandName] = useState('');

  const handleSubmit = () => {
    if (brandName.trim()) {
      onNext(brandName);
    }
  };

  return (
    <div className="p-16 flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-16">
          <p 
            className="text-[#d9d9d9] text-[24px] tracking-[-0.456px] mb-2" 
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
          >
            Setup brand to see mentions of LLM
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <p 
              className="text-[#d9d9d9] text-[24px] tracking-[-0.456px] mb-6" 
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              Your brand
            </p>
            <div className="flex gap-4">
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Brand name"
                className="flex-1 px-6 py-4 border-2 border-[#1e1e1e] rounded text-[24px] tracking-[-0.456px] placeholder:text-[#d9d9d9]"
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                autoFocus
              />
              <button
                onClick={handleSubmit}
                disabled={!brandName.trim()}
                className="px-8 py-4 bg-[#757575] text-white rounded text-[24px] tracking-[-0.456px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5f5f5f] transition-colors"
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              >
                Look up brand
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
