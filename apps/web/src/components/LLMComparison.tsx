import { useState } from 'react';

interface LLMData {
  name: string;
  color: string;
  mentions: number;
  promptsTested: number;
  avgPosition: number;
  mentionRate: number;
  sentiment: { positive: number; neutral: number; negative: number };
}

interface LLMComparisonProps {
  brandData: any;
}

export function LLMComparison({ brandData }: LLMComparisonProps) {
  const [timeRange, setTimeRange] = useState('7d');

  const llmData: LLMData[] = [
    {
      name: 'ChatGPT',
      color: '#10a37f',
      mentions: 0,
      promptsTested: 3,
      avgPosition: 0,
      mentionRate: 0,
      sentiment: { positive: 0, neutral: 0, negative: 0 },
    },
    {
      name: 'Claude',
      color: '#d97757',
      mentions: 0,
      promptsTested: 3,
      avgPosition: 0,
      mentionRate: 0,
      sentiment: { positive: 0, neutral: 0, negative: 0 },
    },
    {
      name: 'Gemini',
      color: '#4285f4',
      mentions: 0,
      promptsTested: 3,
      avgPosition: 0,
      mentionRate: 0,
      sentiment: { positive: 0, neutral: 0, negative: 0 },
    },
    {
      name: 'Perplexity',
      color: '#20808d',
      mentions: 0,
      promptsTested: 3,
      avgPosition: 0,
      mentionRate: 0,
      sentiment: { positive: 0, neutral: 0, negative: 0 },
    },
  ];

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-12">
        <p
          className="text-[#1e1e1e] text-[40px] tracking-[-0.76px] mb-4"
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
        >
          LLM Comparison
        </p>
        <p
          className="text-[#757575] text-[20px] tracking-[-0.38px]"
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
        >
          Compare your brand performance across AI platforms
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-end mb-8">
        <div className="flex gap-2">
          {['24h', '7d', '30d', 'All'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2 text-[14px] rounded transition-colors ${
                timeRange === range
                  ? 'bg-[#1e1e1e] text-white'
                  : 'border-2 border-[#d9d9d9] text-[#757575] hover:border-[#1e1e1e]'
              }`}
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {llmData.map((llm) => (
          <div key={llm.name} className="border-2 border-[#1e1e1e] rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: llm.color }} />
                <p
                  className="text-[#1e1e1e] text-[24px] tracking-[-0.456px]"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                >
                  {llm.name}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p
                  className="text-[#757575] text-[12px] tracking-[-0.132px] mb-2"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                >
                  MENTIONS
                </p>
                <p
                  className="text-[#1e1e1e] text-[36px] tracking-[-0.684px]"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                >
                  {llm.mentions}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p
                    className="text-[#757575] text-[12px] tracking-[-0.132px] mb-2"
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    PROMPTS
                  </p>
                  <p
                    className="text-[#1e1e1e] text-[24px] tracking-[-0.456px]"
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    {llm.promptsTested}
                  </p>
                </div>
                <div>
                  <p
                    className="text-[#757575] text-[12px] tracking-[-0.132px] mb-2"
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    AVG POS
                  </p>
                  <p
                    className="text-[#1e1e1e] text-[24px] tracking-[-0.456px]"
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    {llm.avgPosition || '-'}
                  </p>
                </div>
                <div>
                  <p
                    className="text-[#757575] text-[12px] tracking-[-0.132px] mb-2"
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    RATE
                  </p>
                  <p
                    className="text-[#1e1e1e] text-[24px] tracking-[-0.456px]"
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    {llm.mentionRate}%
                  </p>
                </div>
              </div>

              <div>
                <p
                  className="text-[#757575] text-[12px] tracking-[-0.132px] mb-3"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                >
                  SENTIMENT
                </p>
                <div className="space-y-2">
                  <div
                    className="flex items-center justify-between text-[14px]"
                    style={{ fontFamily: 'Roboto Mono, monospace' }}
                  >
                    <span className="text-[#10a37f]">Positive</span>
                    <span className="text-[#1e1e1e]">{llm.sentiment.positive}%</span>
                  </div>
                  <div
                    className="flex items-center justify-between text-[14px]"
                    style={{ fontFamily: 'Roboto Mono, monospace' }}
                  >
                    <span className="text-[#757575]">Neutral</span>
                    <span className="text-[#1e1e1e]">{llm.sentiment.neutral}%</span>
                  </div>
                  <div
                    className="flex items-center justify-between text-[14px]"
                    style={{ fontFamily: 'Roboto Mono, monospace' }}
                  >
                    <span className="text-[#d97757]">Negative</span>
                    <span className="text-[#1e1e1e]">{llm.sentiment.negative}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Comparison Table */}
      <div className="border-2 border-[#1e1e1e] rounded-lg p-8">
        <p
          className="text-[#1e1e1e] text-[24px] tracking-[-0.456px] mb-6"
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
        >
          Detailed Metrics
        </p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#1e1e1e]">
                <th
                  className="text-left py-4 px-4 text-[#757575] text-[12px]"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                >
                  LLM
                </th>
                <th
                  className="text-right py-4 px-4 text-[#757575] text-[12px]"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                >
                  MENTIONS
                </th>
                <th
                  className="text-right py-4 px-4 text-[#757575] text-[12px]"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                >
                  PROMPTS
                </th>
                <th
                  className="text-right py-4 px-4 text-[#757575] text-[12px]"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                >
                  RATE
                </th>
                <th
                  className="text-right py-4 px-4 text-[#757575] text-[12px]"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                >
                  AVG POS
                </th>
                <th
                  className="text-right py-4 px-4 text-[#757575] text-[12px]"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                >
                  POSITIVE
                </th>
              </tr>
            </thead>
            <tbody>
              {llmData.map((llm) => (
                <tr key={llm.name} className="border-b border-[#d9d9d9]">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: llm.color }}
                      />
                      <span
                        className="text-[#1e1e1e] text-[16px]"
                        style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                      >
                        {llm.name}
                      </span>
                    </div>
                  </td>
                  <td
                    className="text-right py-4 px-4 text-[#1e1e1e] text-[16px]"
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    {llm.mentions}
                  </td>
                  <td
                    className="text-right py-4 px-4 text-[#1e1e1e] text-[16px]"
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                  >
                    {llm.promptsTested}
                  </td>
                  <td
                    className="text-right py-4 px-4 text-[#1e1e1e] text-[16px]"
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                  >
                    {llm.mentionRate}%
                  </td>
                  <td
                    className="text-right py-4 px-4 text-[#1e1e1e] text-[16px]"
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                  >
                    {llm.avgPosition || '-'}
                  </td>
                  <td
                    className="text-right py-4 px-4 text-[#10a37f] text-[16px]"
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                  >
                    {llm.sentiment.positive}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
