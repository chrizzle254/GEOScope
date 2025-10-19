import { useState } from 'react';

interface Step2Props {
  onNext: (prompt: string) => void;
  onBack: () => void;
  brandName: string;
}

export function Step2ExamplePrompt({ onNext, onBack, brandName }: Step2Props) {
  const [prompt, setPrompt] = useState('');
  const [showDialog, setShowDialog] = useState(true);

  const handleSubmit = () => {
    if (prompt.trim()) {
      onNext(prompt);
    }
  };

  if (!showDialog) {
    return (
      <div className="p-16 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center">
          <p 
            className="text-[#d9d9d9] text-[24px] tracking-[-0.456px]" 
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
          >
            Setup brand to see mentions of LLM
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-16 flex items-center justify-center min-h-[calc(100vh-80px)] relative">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      {/* Dialog */}
      <div className="relative bg-white border-2 border-[#1e1e1e] rounded-lg p-12 w-full max-w-3xl shadow-2xl">
        <p 
          className="text-[#757575] text-[24px] tracking-[-0.456px] mb-8" 
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
        >
          EXAMPLE PROMPT
        </p>
        
        <div className="space-y-6">
          <div>
            <p 
              className="text-[#757575] text-[16px] tracking-[-0.176px] mb-4" 
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
            >
              ENTER A PROMPT THAT YOU WOULD EXPECT YOUR BRAND TO BE MENTIONED FOR
            </p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Your example prompt..."
              rows={6}
              className="w-full px-6 py-4 border-2 border-[#1e1e1e] rounded text-[24px] tracking-[-0.456px] placeholder:text-[#d9d9d9] resize-none"
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
              disabled={!prompt.trim()}
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
