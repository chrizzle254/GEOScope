import { useState, useEffect } from 'react';
import { OnboardingFlow } from './OnboardingFlow';

interface DashboardProps {
  brandData: any;
  onSetupComplete: (data: any) => void;
}

interface Mention {
  id: number;
  llm: string;
  prompt: string;
  context: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  position: number;
  timestamp: string;
}

export function Dashboard({ brandData, onSetupComplete }: DashboardProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [stats, setStats] = useState({
    totalMentions: 0,
    promptsTested: 12,
    avgPosition: 0,
    positiveRate: 0
  });

  useEffect(() => {
    if (brandData) {
      // Simulate real-time updates
      const interval = setInterval(() => {
        setStats(prev => ({
          ...prev,
          promptsTested: prev.promptsTested + 1
        }));
      }, 30000); // Every 30 seconds

      return () => clearInterval(interval);
    }
  }, [brandData]);

  const handleStartSetup = () => {
    setShowOnboarding(true);
  };

  const handleSetupComplete = (data: any) => {
    setShowOnboarding(false);
    onSetupComplete(data);
  };

  const llmData = [
    { name: 'ChatGPT', mentions: brandData ? 0 : null, prompts: brandData ? 3 : null, avgPos: brandData ? 0 : null, color: '#10a37f' },
    { name: 'Claude', mentions: brandData ? 0 : null, prompts: brandData ? 3 : null, avgPos: brandData ? 0 : null, color: '#d97757' },
    { name: 'Gemini', mentions: brandData ? 0 : null, prompts: brandData ? 3 : null, avgPos: brandData ? 0 : null, color: '#4285f4' },
    { name: 'Perplexity', mentions: brandData ? 0 : null, prompts: brandData ? 3 : null, avgPos: brandData ? 0 : null, color: '#20808d' }
  ];

  // Empty State - No Brand Setup
  if (!brandData) {
    return (
      <>
        <div className="max-w-6xl">
          {/* Empty State Header */}
          <div className="mb-12 text-center">
            <p 
              className="text-[#d9d9d9] text-[40px] tracking-[-0.76px] mb-4" 
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
            >
              Track Your Brand
            </p>
            <p 
              className="text-[#d9d9d9] text-[20px] tracking-[-0.38px]" 
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              See how your brand appears across major LLMs
            </p>
          </div>

          {/* Empty Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="border-2 border-[#d9d9d9] rounded-lg p-6 bg-[#fafafa]">
              <p 
                className="text-[#d9d9d9] text-[12px] tracking-[-0.132px] mb-2" 
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
              >
                TOTAL MENTIONS
              </p>
              <p 
                className="text-[#d9d9d9] text-[48px] tracking-[-0.912px]" 
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
              >
                -
              </p>
              <p 
                className="text-[#d9d9d9] text-[14px] mt-2" 
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              >
                No data yet
              </p>
            </div>

            <div className="border-2 border-[#d9d9d9] rounded-lg p-6 bg-[#fafafa]">
              <p 
                className="text-[#d9d9d9] text-[12px] tracking-[-0.132px] mb-2" 
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
              >
                PROMPTS TESTED
              </p>
              <p 
                className="text-[#d9d9d9] text-[48px] tracking-[-0.912px]" 
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
              >
                -
              </p>
              <p 
                className="text-[#d9d9d9] text-[14px] mt-2" 
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              >
                No data yet
              </p>
            </div>

            <div className="border-2 border-[#d9d9d9] rounded-lg p-6 bg-[#fafafa]">
              <p 
                className="text-[#d9d9d9] text-[12px] tracking-[-0.132px] mb-2" 
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
              >
                AVG POSITION
              </p>
              <p 
                className="text-[#d9d9d9] text-[48px] tracking-[-0.912px]" 
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
              >
                -
              </p>
              <p 
                className="text-[#d9d9d9] text-[14px] mt-2" 
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              >
                No data yet
              </p>
            </div>

            <div className="border-2 border-[#d9d9d9] rounded-lg p-6 bg-[#fafafa]">
              <p 
                className="text-[#d9d9d9] text-[12px] tracking-[-0.132px] mb-2" 
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
              >
                POSITIVE RATE
              </p>
              <p 
                className="text-[#d9d9d9] text-[48px] tracking-[-0.912px]" 
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
              >
                -
              </p>
              <p 
                className="text-[#d9d9d9] text-[14px] mt-2" 
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              >
                No data yet
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="border-2 border-[#1e1e1e] rounded-lg p-16 text-center bg-white">
            <div className="max-w-2xl mx-auto">
              <p 
                className="text-[#1e1e1e] text-[32px] tracking-[-0.608px] mb-4" 
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
              >
                Start Tracking Your Brand
              </p>
              <p 
                className="text-[#757575] text-[18px] tracking-[-0.342px] mb-8" 
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              >
                Monitor how your brand is mentioned across ChatGPT, Claude, Gemini, and Perplexity. 
                Get insights into your GEO performance and optimize your presence.
              </p>
              <button
                onClick={handleStartSetup}
                className="px-12 py-4 bg-[#1e1e1e] text-white rounded text-[24px] tracking-[-0.456px] hover:bg-[#000] transition-colors"
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              >
                Set Up Your Brand
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="mt-8 border-2 border-[#d9d9d9] rounded-lg p-8 bg-[#fafafa]">
            <p 
              className="text-[#757575] text-[20px] tracking-[-0.38px] mb-6" 
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
            >
              What you'll get:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-[24px]">✓</span>
                <div>
                  <p 
                    className="text-[#1e1e1e] text-[16px] tracking-[-0.304px] mb-1" 
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    Real-time LLM Monitoring
                  </p>
                  <p 
                    className="text-[#757575] text-[14px]" 
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                  >
                    Track mentions across 4 major AI platforms
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[24px]">✓</span>
                <div>
                  <p 
                    className="text-[#1e1e1e] text-[16px] tracking-[-0.304px] mb-1" 
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    Competitor Analysis
                  </p>
                  <p 
                    className="text-[#757575] text-[14px]" 
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                  >
                    Compare your visibility against competitors
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[24px]">✓</span>
                <div>
                  <p 
                    className="text-[#1e1e1e] text-[16px] tracking-[-0.304px] mb-1" 
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    Sentiment Analysis
                  </p>
                  <p 
                    className="text-[#757575] text-[14px]" 
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                  >
                    Understand how your brand is perceived
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[24px]">✓</span>
                <div>
                  <p 
                    className="text-[#1e1e1e] text-[16px] tracking-[-0.304px] mb-1" 
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    Context Insights
                  </p>
                  <p 
                    className="text-[#757575] text-[14px]" 
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                  >
                    See the full context of each mention
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showOnboarding && (
          <OnboardingFlow onComplete={handleSetupComplete} />
        )}
      </>
    );
  }

  // Active Dashboard - Brand is setup
  return (
    <div className="max-w-6xl">
      {/* Welcome Section */}
      <div className="mb-12">
        <p 
          className="text-[#1e1e1e] text-[40px] tracking-[-0.76px] mb-4" 
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
        >
          {brandData?.brandName || 'Your Brand'}
        </p>
        <p 
          className="text-[#757575] text-[20px] tracking-[-0.38px]" 
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
        >
          Monitoring brand mentions across major LLMs
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="border-2 border-[#1e1e1e] rounded-lg p-6 hover:shadow-lg transition-shadow">
          <p 
            className="text-[#757575] text-[12px] tracking-[-0.132px] mb-2" 
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
          >
            TOTAL MENTIONS
          </p>
          <p 
            className="text-[#1e1e1e] text-[48px] tracking-[-0.912px]" 
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
          >
            {stats.totalMentions}
          </p>
          <p 
            className="text-[#757575] text-[14px] mt-2" 
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
          >
            {stats.totalMentions === 0 ? 'Searching...' : 'Last 24 hours'}
          </p>
        </div>

        <div className="border-2 border-[#1e1e1e] rounded-lg p-6 hover:shadow-lg transition-shadow">
          <p 
            className="text-[#757575] text-[12px] tracking-[-0.132px] mb-2" 
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
          >
            PROMPTS TESTED
          </p>
          <p 
            className="text-[#1e1e1e] text-[48px] tracking-[-0.912px]" 
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
          >
            {stats.promptsTested}
          </p>
          <p 
            className="text-[#10a37f] text-[14px] mt-2" 
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
          >
            Auto-generating
          </p>
        </div>

        <div className="border-2 border-[#1e1e1e] rounded-lg p-6 hover:shadow-lg transition-shadow">
          <p 
            className="text-[#757575] text-[12px] tracking-[-0.132px] mb-2" 
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
          >
            AVG POSITION
          </p>
          <p 
            className="text-[#1e1e1e] text-[48px] tracking-[-0.912px]" 
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
          >
            {stats.avgPosition || '-'}
          </p>
          <p 
            className="text-[#757575] text-[14px] mt-2" 
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
          >
            When mentioned
          </p>
        </div>

        <div className="border-2 border-[#1e1e1e] rounded-lg p-6 hover:shadow-lg transition-shadow">
          <p 
            className="text-[#757575] text-[12px] tracking-[-0.132px] mb-2" 
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
          >
            POSITIVE RATE
          </p>
          <p 
            className="text-[#1e1e1e] text-[48px] tracking-[-0.912px]" 
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
          >
            {stats.positiveRate || '-'}%
          </p>
          <p 
            className="text-[#757575] text-[14px] mt-2" 
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
          >
            Sentiment analysis
          </p>
        </div>
      </div>

      {/* LLM Breakdown */}
      <div className="border-2 border-[#1e1e1e] rounded-lg p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <p 
            className="text-[#1e1e1e] text-[24px] tracking-[-0.456px]" 
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
          >
            LLM Performance
          </p>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 text-[14px] bg-[#1e1e1e] text-white rounded"
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              24h
            </button>
            <button 
              className="px-4 py-2 text-[14px] border-2 border-[#d9d9d9] text-[#757575] rounded"
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              7d
            </button>
            <button 
              className="px-4 py-2 text-[14px] border-2 border-[#d9d9d9] text-[#757575] rounded"
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              30d
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {llmData.map((llm) => (
            <div key={llm.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: llm.color }}
                  />
                  <p 
                    className="text-[#1e1e1e] text-[18px] tracking-[-0.342px]" 
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                  >
                    {llm.name}
                  </p>
                </div>
                <div className="flex gap-8 text-right">
                  <div>
                    <p className="text-[#757575] text-[12px]" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}>
                      MENTIONS
                    </p>
                    <p className="text-[#1e1e1e] text-[18px]" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}>
                      {llm.mentions}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#757575] text-[12px]" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}>
                      PROMPTS
                    </p>
                    <p className="text-[#1e1e1e] text-[18px]" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}>
                      {llm.prompts}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#757575] text-[12px]" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}>
                      AVG POS
                    </p>
                    <p className="text-[#1e1e1e] text-[18px]" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}>
                      {llm.avgPos || '-'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full h-2 bg-[#f5f5f5] rounded-full">
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    backgroundColor: llm.color,
                    width: `${(llm.mentions! / (stats.promptsTested || 1)) * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Log */}
      <div className="border-2 border-[#1e1e1e] rounded-lg p-8 mb-8">
        <p 
          className="text-[#1e1e1e] text-[24px] tracking-[-0.456px] mb-6" 
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
        >
          Real-time Activity
        </p>
        <div className="space-y-4">
          <div className="flex items-start gap-4 py-4 border-b border-[#d9d9d9]">
            <div className="w-2 h-2 rounded-full bg-[#10a37f] mt-2 animate-pulse" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p 
                  className="text-[#1e1e1e] text-[16px] tracking-[-0.304px]" 
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Generating prompts for {brandData?.industry || 'your industry'}
                </p>
                <span className="text-[#757575] text-[12px]" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                  Just now
                </span>
              </div>
              <p 
                className="text-[#757575] text-[14px] mt-1" 
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              >
                Creating contextual prompts based on your brand config
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 py-4 border-b border-[#d9d9d9]">
            <div className="w-2 h-2 rounded-full bg-[#4285f4] mt-2" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p 
                  className="text-[#1e1e1e] text-[16px] tracking-[-0.304px]" 
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Testing prompts on Gemini
                </p>
                <span className="text-[#757575] text-[12px]" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                  2 min ago
                </span>
              </div>
              <p 
                className="text-[#757575] text-[14px] mt-1" 
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              >
                Running batch of 3 prompts
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 py-4">
            <div className="w-2 h-2 rounded-full bg-[#d97757] mt-2" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p 
                  className="text-[#1e1e1e] text-[16px] tracking-[-0.304px]" 
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Testing prompts on Claude
                </p>
                <span className="text-[#757575] text-[12px]" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                  5 min ago
                </span>
              </div>
              <p 
                className="text-[#757575] text-[14px] mt-1" 
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              >
                Running batch of 3 prompts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-[#f5f5f5] border-2 border-[#d9d9d9] rounded-lg p-8">
        <div className="flex items-start gap-4">
          <span className="text-[24px]">💡</span>
          <div>
            <p 
              className="text-[#1e1e1e] text-[16px] tracking-[-0.304px] mb-2" 
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
            >
              Trial in Progress
            </p>
            <p 
              className="text-[#757575] text-[16px] tracking-[-0.304px]" 
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              We're continuously testing prompts across all LLMs. Check back in a few hours for your first results. 
              We'll also send you an email when we detect mentions of {brandData?.brandName || 'your brand'}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
