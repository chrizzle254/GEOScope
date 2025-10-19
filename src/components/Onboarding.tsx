import { useState } from 'react';
import { Step1BrandName } from './onboarding/Step1BrandName';
import { Step2ExamplePrompt } from './onboarding/Step2ExamplePrompt';
import { Step3BrandConfig } from './onboarding/Step3BrandConfig';
import { Step4Email } from './onboarding/Step4Email';
import { Step5Payment } from './onboarding/Step5Payment';

interface OnboardingProps {
  onComplete: (data: any) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    brandName: '',
    examplePrompt: '',
    website: '',
    industry: '',
    targetAudience: '',
    competitors: [] as string[],
    email: '',
    paymentMethod: ''
  });

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleStep1Complete = (brandName: string) => {
    updateFormData({ brandName });
    setStep(2);
  };

  const handleStep2Complete = (examplePrompt: string) => {
    updateFormData({ examplePrompt });
    // Simulate LLM pre-filling data
    simulateAIPrefill(examplePrompt);
    setStep(3);
  };

  const simulateAIPrefill = (prompt: string) => {
    // Simulate AI analyzing the prompt and pre-filling fields
    setTimeout(() => {
      const brandNameLower = formData.brandName.toLowerCase().replace(/\s+/g, '');
      updateFormData({
        website: `${brandNameLower}.com`,
        industry: 'Technology & Software',
        targetAudience: 'B2B SaaS companies',
        competitors: []
      });
    }, 500);
  };

  const handleStep3Complete = (config: any) => {
    updateFormData(config);
    setStep(4);
  };

  const handleStep4Complete = (email: string) => {
    updateFormData({ email });
    setStep(5);
  };

  const handleStep5Complete = (paymentMethod: string) => {
    updateFormData({ paymentMethod });
    onComplete(formData);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const totalSteps = 5;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Progress */}
      <header className="border-b border-[rgba(0,0,0,0.1)] px-[42px] py-[10px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-[40px] leading-[1.5] tracking-[-0.76px]">🤖</span>
            <span className="text-[24px] leading-[1.5] tracking-[-0.456px] font-medium" style={{ fontFamily: 'Roboto Mono, monospace' }}>
              GEO Scope
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-6 py-2 border-2 border-[#1e1e1e] text-[#1e1e1e] rounded tracking-[-0.456px]" style={{ fontFamily: 'Roboto Mono, monospace' }}>
              Login
            </button>
            <div className="w-12 h-12 rounded-full bg-[#757575]" />
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-colors ${
                i < step ? 'bg-[#1e1e1e]' : 'bg-[#d9d9d9]'
              }`}
            />
          ))}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-[275px] border-r border-[rgba(0,0,0,0.1)] p-[35px] pt-[126px]">
          <div className="space-y-8">
            <div>
              <div className="text-[12px] tracking-[-0.132px] text-[#757575] mb-4" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}>
                SETUP STEPS
              </div>
              <nav className="space-y-2">
                {[
                  { num: 1, label: 'Brand Name' },
                  { num: 2, label: 'Example Prompt' },
                  { num: 3, label: 'Brand Config' },
                  { num: 4, label: 'Email' },
                  { num: 5, label: 'Payment' }
                ].map(({ num, label }) => (
                  <div
                    key={num}
                    className={`flex items-center gap-3 py-1 ${
                      num === step ? 'text-[#1e1e1e]' : num < step ? 'text-[#757575]' : 'text-[#d9d9d9]'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] ${
                      num === step ? 'bg-[#1e1e1e] text-white' : 
                      num < step ? 'bg-[#757575] text-white' : 
                      'bg-[#d9d9d9] text-white'
                    }`} style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}>
                      {num < step ? '✓' : num}
                    </div>
                    <span className="text-[18px] tracking-[-0.342px]" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>
                      {label}
                    </span>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {step === 1 && <Step1BrandName onNext={handleStep1Complete} />}
          {step === 2 && <Step2ExamplePrompt onNext={handleStep2Complete} onBack={handleBack} brandName={formData.brandName} />}
          {step === 3 && <Step3BrandConfig onNext={handleStep3Complete} onBack={handleBack} formData={formData} />}
          {step === 4 && <Step4Email onNext={handleStep4Complete} onBack={handleBack} />}
          {step === 5 && <Step5Payment onNext={handleStep5Complete} onBack={handleBack} />}
        </main>
      </div>
    </div>
  );
}
