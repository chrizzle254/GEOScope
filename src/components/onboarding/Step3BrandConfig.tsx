import { useState, useEffect } from 'react';

interface Step3Props {
  onNext: (config: any) => void;
  onBack: () => void;
  formData: {
    brandName: string;
    examplePrompt: string;
    website: string;
    industry: string;
    targetAudience: string;
    competitors: string[];
  };
}

export function Step3BrandConfig({ onNext, onBack, formData }: Step3Props) {
  const [activeTab, setActiveTab] = useState('brand-config');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate AI pre-filling the data
    setIsLoading(true);
    setTimeout(() => {
      setWebsite(formData.website || `${formData.brandName.toLowerCase().replace(/\s+/g, '')}.com`);
      setIndustry(formData.industry || 'Technology & Software');
      setTargetAudience(formData.targetAudience || 'B2B SaaS companies');
      setCompetitors(formData.competitors || []);
      setIsLoading(false);
    }, 1000);
  }, [formData]);

  const handleSubmit = () => {
    if (website.trim() && industry.trim()) {
      onNext({ website, industry, targetAudience, competitors });
    }
  };

  const handleDiscard = () => {
    setWebsite(formData.website);
    setIndustry(formData.industry);
    setTargetAudience(formData.targetAudience);
    setCompetitors(formData.competitors);
  };

  const handleAddCompetitor = () => {
    if (newCompetitor.trim() && !competitors.includes(newCompetitor.trim())) {
      setCompetitors([...competitors, newCompetitor.trim()]);
      setNewCompetitor('');
    }
  };

  const handleRemoveCompetitor = (competitor: string) => {
    setCompetitors(competitors.filter(c => c !== competitor));
  };

  return (
    <div className="p-16">
      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setActiveTab('brand-config')}
          className={`px-6 py-3 text-[24px] tracking-[-0.456px] rounded-t ${
            activeTab === 'brand-config' 
              ? 'bg-[#757575] text-white' 
              : 'bg-transparent text-[#757575] hover:bg-[#f5f5f5]'
          }`}
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
        >
          Brand config
        </button>
        <button
          onClick={() => setActiveTab('prompts')}
          className={`px-6 py-3 text-[24px] tracking-[-0.456px] rounded-t ${
            activeTab === 'prompts' 
              ? 'bg-[#757575] text-white' 
              : 'bg-transparent text-[#757575] hover:bg-[#f5f5f5]'
          }`}
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
        >
          Prompts
        </button>
        <button
          onClick={() => setActiveTab('competitors')}
          className={`px-6 py-3 text-[24px] tracking-[-0.456px] rounded-t ${
            activeTab === 'competitors' 
              ? 'bg-[#757575] text-white' 
              : 'bg-transparent text-[#757575] hover:bg-[#f5f5f5]'
          }`}
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
        >
          Competitors
        </button>
        <button
          onClick={() => setActiveTab('contents')}
          className={`px-6 py-3 text-[24px] tracking-[-0.456px] rounded-t ${
            activeTab === 'contents' 
              ? 'bg-[#757575] text-white' 
              : 'bg-transparent text-[#757575] hover:bg-[#f5f5f5]'
          }`}
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
        >
          Contents
        </button>
      </div>

      {/* Content */}
      <div className="border-2 border-[#1e1e1e] rounded-lg p-12 mb-8 min-h-[400px]">
        {activeTab === 'brand-config' && (
          <div className="space-y-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-[#757575] text-[24px]" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                  Analyzing your brand...
                </div>
              </div>
            ) : (
              <>
                <div>
                  <p 
                    className="text-[#757575] text-[12px] tracking-[-0.132px] mb-4" 
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    BRAND NAME
                  </p>
                  <input
                    type="text"
                    value={formData.brandName}
                    readOnly
                    className="w-full max-w-md px-6 py-4 border-2 border-[#1e1e1e] rounded text-[24px] tracking-[-0.456px] bg-[#f5f5f5] cursor-not-allowed"
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                  />
                </div>

                <div>
                  <p 
                    className="text-[#757575] text-[12px] tracking-[-0.132px] mb-4" 
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    WEBSITE
                  </p>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="brand.com"
                    className="w-full max-w-md px-6 py-4 border-2 border-[#1e1e1e] rounded text-[24px] tracking-[-0.456px] placeholder:text-[#d9d9d9]"
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                  />
                </div>

                <div>
                  <p 
                    className="text-[#757575] text-[12px] tracking-[-0.132px] mb-4" 
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    INDUSTRY
                  </p>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="Industry"
                    className="w-full max-w-md px-6 py-4 border-2 border-[#1e1e1e] rounded text-[24px] tracking-[-0.456px] placeholder:text-[#d9d9d9]"
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                  />
                </div>

                <div>
                  <p 
                    className="text-[#757575] text-[12px] tracking-[-0.132px] mb-4" 
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    TARGET AUDIENCE
                  </p>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Who is your target audience?"
                    className="w-full max-w-md px-6 py-4 border-2 border-[#1e1e1e] rounded text-[24px] tracking-[-0.456px] placeholder:text-[#d9d9d9]"
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                  />
                </div>
              </>
            )}
          </div>
        )}
        {activeTab === 'prompts' && (
          <div className="text-[#757575] text-center py-16">
            <p style={{ fontFamily: 'Roboto Mono, monospace' }}>Prompts configuration coming next...</p>
          </div>
        )}
        {activeTab === 'competitors' && (
          <div className="space-y-6">
            <div>
              <p 
                className="text-[#757575] text-[12px] tracking-[-0.132px] mb-4" 
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
              >
                ADD COMPETITORS TO TRACK
              </p>
              <div className="flex gap-3 max-w-md">
                <input
                  type="text"
                  value={newCompetitor}
                  onChange={(e) => setNewCompetitor(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCompetitor()}
                  placeholder="Competitor name"
                  className="flex-1 px-6 py-4 border-2 border-[#1e1e1e] rounded text-[20px] tracking-[-0.38px] placeholder:text-[#d9d9d9]"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                />
                <button
                  onClick={handleAddCompetitor}
                  className="px-8 py-4 bg-[#757575] text-white rounded text-[20px] tracking-[-0.38px] hover:bg-[#5f5f5f] transition-colors"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Add
                </button>
              </div>
            </div>
            
            {competitors.length > 0 && (
              <div>
                <p 
                  className="text-[#757575] text-[12px] tracking-[-0.132px] mb-4" 
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                >
                  COMPETITORS
                </p>
                <div className="space-y-2 max-w-md">
                  {competitors.map((competitor, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-6 py-3 border-2 border-[#d9d9d9] rounded"
                    >
                      <span 
                        className="text-[#1e1e1e] text-[18px] tracking-[-0.342px]"
                        style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                      >
                        {competitor}
                      </span>
                      <button
                        onClick={() => handleRemoveCompetitor(competitor)}
                        className="text-[#757575] hover:text-[#1e1e1e] text-[18px]"
                        style={{ fontFamily: 'Roboto Mono, monospace' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'contents' && (
          <div className="text-[#757575] text-center py-16">
            <p style={{ fontFamily: 'Roboto Mono, monospace' }}>Contents configuration coming next...</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-12 py-3 border-2 border-[#757575] text-[#757575] rounded text-[24px] tracking-[-0.456px] hover:bg-[#f5f5f5] transition-colors"
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
          >
            Back
          </button>
          <button
            onClick={handleDiscard}
            className="px-12 py-3 border-2 border-[#d9d9d9] text-[#757575] rounded text-[24px] tracking-[-0.456px] hover:bg-[#f5f5f5] transition-colors"
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
          >
            Reset
          </button>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!website.trim() || !industry.trim() || isLoading}
          className="px-12 py-3 bg-[#757575] text-white rounded text-[24px] tracking-[-0.456px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5f5f5f] transition-colors"
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
