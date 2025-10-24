import { useState } from 'react';

interface Competitor {
  id: number;
  name: string;
  mentions: number;
  avgPosition: number;
  mentionRate: number;
  trend: 'up' | 'down' | 'stable';
}

interface CompetitorsProps {
  brandData: any;
}

export function Competitors({ brandData }: CompetitorsProps) {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [newCompetitor, setNewCompetitor] = useState('');

  const handleAddCompetitor = () => {
    if (newCompetitor.trim()) {
      setCompetitors([
        ...competitors,
        {
          id: Date.now(),
          name: newCompetitor,
          mentions: 0,
          avgPosition: 0,
          mentionRate: 0,
          trend: 'stable'
        }
      ]);
      setNewCompetitor('');
    }
  };

  const handleRemoveCompetitor = (id: number) => {
    setCompetitors(competitors.filter(c => c.id !== id));
  };

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-12">
        <p 
          className="text-[#1e1e1e] text-[40px] tracking-[-0.76px] mb-4" 
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
        >
          Competitors
        </p>
        <p 
          className="text-[#757575] text-[20px] tracking-[-0.38px]" 
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
        >
          Track how your competitors are mentioned in LLMs
        </p>
      </div>

      {/* Add Competitor */}
      <div className="border-2 border-[#1e1e1e] rounded-lg p-8 mb-8">
        <p 
          className="text-[#1e1e1e] text-[24px] tracking-[-0.456px] mb-6" 
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
        >
          Add Competitor
        </p>
        <div className="flex gap-4">
          <input
            type="text"
            value={newCompetitor}
            onChange={(e) => setNewCompetitor(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCompetitor()}
            placeholder="Competitor brand name"
            className="flex-1 max-w-md px-6 py-4 border-2 border-[#1e1e1e] rounded text-[20px] tracking-[-0.38px] placeholder:text-[#d9d9d9]"
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
          />
          <button
            onClick={handleAddCompetitor}
            disabled={!newCompetitor.trim()}
            className="px-8 py-4 bg-[#1e1e1e] text-white rounded text-[20px] tracking-[-0.38px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#000] transition-colors"
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
          >
            Track Competitor
          </button>
        </div>
      </div>

      {/* Competitors List */}
      {competitors.length === 0 ? (
        <div className="border-2 border-[#d9d9d9] rounded-lg p-16 text-center">
          <p 
            className="text-[#d9d9d9] text-[24px] tracking-[-0.456px]" 
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
          >
            Add competitors to start tracking their LLM mentions
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {competitors.map((competitor) => (
            <div key={competitor.id} className="border-2 border-[#1e1e1e] rounded-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <p 
                  className="text-[#1e1e1e] text-[28px] tracking-[-0.532px]" 
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                >
                  {competitor.name}
                </p>
                <button
                  onClick={() => handleRemoveCompetitor(competitor.id)}
                  className="text-[#757575] hover:text-[#1e1e1e] text-[24px]"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                    {competitor.mentions}
                  </p>
                </div>
                <div>
                  <p 
                    className="text-[#757575] text-[12px] tracking-[-0.132px] mb-2" 
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    AVG POSITION
                  </p>
                  <p 
                    className="text-[#1e1e1e] text-[36px] tracking-[-0.684px]" 
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    {competitor.avgPosition || '-'}
                  </p>
                </div>
                <div>
                  <p 
                    className="text-[#757575] text-[12px] tracking-[-0.132px] mb-2" 
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    MENTION RATE
                  </p>
                  <p 
                    className="text-[#1e1e1e] text-[36px] tracking-[-0.684px]" 
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    {competitor.mentionRate}%
                  </p>
                </div>
                <div>
                  <p 
                    className="text-[#757575] text-[12px] tracking-[-0.132px] mb-2" 
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    TREND
                  </p>
                  <p 
                    className="text-[36px] tracking-[-0.684px]" 
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    {competitor.trend === 'stable' ? '→' : competitor.trend === 'up' ? '↑' : '↓'}
                  </p>
                </div>
              </div>

              <div className="bg-[#f5f5f5] rounded p-4">
                <p 
                  className="text-[#757575] text-[14px]" 
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Tracking started. Data will populate as prompts are tested.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
