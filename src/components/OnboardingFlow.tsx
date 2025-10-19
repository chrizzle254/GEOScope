import { useState } from 'react';

interface OnboardingFlowProps {
  onComplete: (data: any) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    brandName: '',
    examplePrompt: '',
    website: '',
    industry: '',
    targetAudience: '',
    competitors: [] as string[],
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState('');

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleStep1Submit = () => {
    if (formData.brandName.trim()) {
      setStep(2);
    }
  };

  const handleStep2Submit = () => {
    if (formData.examplePrompt.trim()) {
      setIsLoading(true);
      // Simulate AI pre-filling
      setTimeout(() => {
        const brandNameLower = formData.brandName.toLowerCase().replace(/\s+/g, '');
        updateFormData({
          website: `${brandNameLower}.com`,
          industry: 'Technology & Software',
          targetAudience: 'B2B SaaS companies'
        });
        setIsLoading(false);
        setStep(3);
      }, 1500);
    }
  };

  const handleStep3Submit = () => {
    if (formData.website.trim() && formData.industry.trim()) {
      setStep(4);
    }
  };

  const handleStep4Submit = () => {
    if (formData.email.trim() && formData.email.includes('@')) {
      setStep(5);
    }
  };

  const handleStep5Submit = () => {
    if (formData.cardNumber.length >= 16 && formData.expiryDate.length >= 4 && formData.cvv.length >= 3) {
      setStep(6);
    }
  };

  const handleStep6Submit = () => {
    onComplete(formData);
  };

  const handleAddCompetitor = () => {
    if (newCompetitor.trim() && !formData.competitors.includes(newCompetitor.trim())) {
      updateFormData({ competitors: [...formData.competitors, newCompetitor.trim()] });
      setNewCompetitor('');
    }
  };

  const handleRemoveCompetitor = (competitor: string) => {
    updateFormData({ competitors: formData.competitors.filter(c => c !== competitor) });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border-2 border-[#1e1e1e] rounded-lg p-12 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Step 1: Brand Name */}
        {step === 1 && (
          <>
            <p 
              className="text-[#1e1e1e] text-[32px] tracking-[-0.608px] mb-6" 
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
            >
              What's your brand name?
            </p>
            <p 
              className="text-[#757575] text-[16px] mb-8" 
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              We'll track how this brand appears across LLMs
            </p>
            <input
              type="text"
              value={formData.brandName}
              onChange={(e) => updateFormData({ brandName: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleStep1Submit()}
              placeholder="Enter your brand name"
              className="w-full px-6 py-4 border-2 border-[#1e1e1e] rounded text-[24px] tracking-[-0.456px] placeholder:text-[#d9d9d9] mb-8"
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              autoFocus
            />
            <button
              onClick={handleStep1Submit}
              disabled={!formData.brandName.trim()}
              className="w-full px-12 py-4 bg-[#1e1e1e] text-white rounded text-[24px] tracking-[-0.456px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#000] transition-colors"
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              Continue
            </button>
          </>
        )}

        {/* Step 2: Example Prompt */}
        {step === 2 && (
          <>
            <p 
              className="text-[#1e1e1e] text-[32px] tracking-[-0.608px] mb-6" 
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
            >
              Example prompt
            </p>
            <p 
              className="text-[#757575] text-[16px] mb-8" 
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              Give us an example of when someone might mention {formData.brandName}
            </p>
            <textarea
              value={formData.examplePrompt}
              onChange={(e) => updateFormData({ examplePrompt: e.target.value })}
              placeholder="e.g., What are the best project management tools for remote teams?"
              rows={5}
              className="w-full px-6 py-4 border-2 border-[#1e1e1e] rounded text-[18px] tracking-[-0.342px] placeholder:text-[#d9d9d9] resize-none mb-8"
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-12 py-4 border-2 border-[#757575] text-[#757575] rounded text-[20px] tracking-[-0.38px] hover:bg-[#f5f5f5] transition-colors"
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              >
                Back
              </button>
              <button
                onClick={handleStep2Submit}
                disabled={!formData.examplePrompt.trim()}
                className="flex-1 px-12 py-4 bg-[#1e1e1e] text-white rounded text-[20px] tracking-[-0.38px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#000] transition-colors"
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {/* Step 3: Brand Config */}
        {step === 3 && (
          <>
            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin w-12 h-12 border-4 border-[#d9d9d9] border-t-[#1e1e1e] rounded-full mx-auto mb-4" />
                <p 
                  className="text-[#757575] text-[20px]" 
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Analyzing your brand...
                </p>
              </div>
            ) : (
              <>
                <p 
                  className="text-[#1e1e1e] text-[32px] tracking-[-0.608px] mb-6" 
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                >
                  Verify details
                </p>
                <p 
                  className="text-[#757575] text-[16px] mb-8" 
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  We pre-filled these based on your example. Feel free to edit.
                </p>
                
                <div className="space-y-6 mb-8">
                  <div>
                    <p 
                      className="text-[#757575] text-[12px] tracking-[-0.132px] mb-3" 
                      style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                    >
                      WEBSITE
                    </p>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => updateFormData({ website: e.target.value })}
                      placeholder="brand.com"
                      className="w-full px-6 py-4 border-2 border-[#1e1e1e] rounded text-[18px] tracking-[-0.342px] placeholder:text-[#d9d9d9]"
                      style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                    />
                  </div>
                  <div>
                    <p 
                      className="text-[#757575] text-[12px] tracking-[-0.132px] mb-3" 
                      style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                    >
                      INDUSTRY
                    </p>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => updateFormData({ industry: e.target.value })}
                      placeholder="Your industry"
                      className="w-full px-6 py-4 border-2 border-[#1e1e1e] rounded text-[18px] tracking-[-0.342px] placeholder:text-[#d9d9d9]"
                      style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                    />
                  </div>
                  <div>
                    <p 
                      className="text-[#757575] text-[12px] tracking-[-0.132px] mb-3" 
                      style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                    >
                      TARGET AUDIENCE (OPTIONAL)
                    </p>
                    <input
                      type="text"
                      value={formData.targetAudience}
                      onChange={(e) => updateFormData({ targetAudience: e.target.value })}
                      placeholder="Who is your target audience?"
                      className="w-full px-6 py-4 border-2 border-[#1e1e1e] rounded text-[18px] tracking-[-0.342px] placeholder:text-[#d9d9d9]"
                      style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 px-12 py-4 border-2 border-[#757575] text-[#757575] rounded text-[20px] tracking-[-0.38px] hover:bg-[#f5f5f5] transition-colors"
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleStep3Submit}
                    disabled={!formData.website.trim() || !formData.industry.trim()}
                    className="flex-1 px-12 py-4 bg-[#1e1e1e] text-white rounded text-[20px] tracking-[-0.38px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#000] transition-colors"
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                  >
                    Continue
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Step 4: Email */}
        {step === 4 && (
          <>
            <p 
              className="text-[#1e1e1e] text-[32px] tracking-[-0.608px] mb-6" 
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
            >
              Your email
            </p>
            <p 
              className="text-[#757575] text-[16px] mb-8" 
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              We'll send updates and let you log in later
            </p>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleStep4Submit()}
              placeholder="your@email.com"
              className="w-full px-6 py-4 border-2 border-[#1e1e1e] rounded text-[24px] tracking-[-0.456px] placeholder:text-[#d9d9d9] mb-8"
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 px-12 py-4 border-2 border-[#757575] text-[#757575] rounded text-[20px] tracking-[-0.38px] hover:bg-[#f5f5f5] transition-colors"
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              >
                Back
              </button>
              <button
                onClick={handleStep4Submit}
                disabled={!formData.email.trim() || !formData.email.includes('@')}
                className="flex-1 px-12 py-4 bg-[#1e1e1e] text-white rounded text-[20px] tracking-[-0.38px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#000] transition-colors"
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {/* Step 5: Payment */}
        {step === 5 && (
          <>
            <p 
              className="text-[#1e1e1e] text-[32px] tracking-[-0.608px] mb-6" 
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
            >
              Payment details
            </p>
            <p 
              className="text-[#757575] text-[16px] mb-2" 
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              Required for spam prevention. You won't be charged during your 3-day trial.
            </p>
            <p 
              className="text-[#757575] text-[14px] mb-8" 
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              This helps us keep the platform high-quality by filtering out spam accounts.
            </p>
            
            <div className="space-y-4 mb-8">
              <div>
                <p 
                  className="text-[#757575] text-[12px] tracking-[-0.132px] mb-2" 
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                >
                  CARD NUMBER
                </p>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => updateFormData({ cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
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
                    value={formData.expiryDate}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                      }
                      updateFormData({ expiryDate: value.slice(0, 5) });
                    }}
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
                    value={formData.cvv}
                    onChange={(e) => updateFormData({ cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                    placeholder="123"
                    className="w-full px-6 py-4 border-2 border-[#1e1e1e] rounded text-[20px] tracking-[-0.38px] placeholder:text-[#d9d9d9]"
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(4)}
                className="flex-1 px-12 py-4 border-2 border-[#757575] text-[#757575] rounded text-[20px] tracking-[-0.38px] hover:bg-[#f5f5f5] transition-colors"
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              >
                Back
              </button>
              <button
                onClick={handleStep5Submit}
                disabled={formData.cardNumber.length < 16 || formData.expiryDate.length < 5 || formData.cvv.length < 3}
                className="flex-1 px-12 py-4 bg-[#1e1e1e] text-white rounded text-[20px] tracking-[-0.38px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#000] transition-colors"
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              >
                Start Free Trial
              </button>
            </div>
          </>
        )}

        {/* Step 6: Success */}
        {step === 6 && (
          <>
            <p 
              className="text-[#1e1e1e] text-[32px] tracking-[-0.608px] mb-6" 
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
            >
              All set!
            </p>
            <p 
              className="text-[#757575] text-[16px] mb-8" 
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              Your 3-day trial starts now. We'll begin tracking {formData.brandName} across all major LLMs.
            </p>
            <div className="bg-[#f5f5f5] border-2 border-[#d9d9d9] rounded-lg p-6 mb-8">
              <p 
                className="text-[#1e1e1e] text-[16px] tracking-[-0.304px] mb-4" 
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
              >
                What happens next:
              </p>
              <ul className="space-y-2 text-[#757575] text-[14px]" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>
                <li>✓ We'll generate prompts based on your industry</li>
                <li>✓ Test them across ChatGPT, Claude, Gemini & Perplexity</li>
                <li>✓ Track mentions and analyze sentiment</li>
                <li>✓ Email you when we find your brand</li>
              </ul>
            </div>
            <button
              onClick={handleStep6Submit}
              className="w-full px-12 py-4 bg-[#1e1e1e] text-white rounded text-[24px] tracking-[-0.456px] hover:bg-[#000] transition-colors"
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              View Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
