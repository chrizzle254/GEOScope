import { useState } from 'react';
import { Switch } from './ui/switch';

interface Prompt {
  id: number;
  text: string;
  category: string;
  llms: string[];
  frequency: string;
  active: boolean;
}

export function Settings() {
  const [activeTab, setActiveTab] = useState('prompts');
  const [prompts, setPrompts] = useState<Prompt[]>([
    {
      id: 1,
      text: 'What are the best AI optimization tools?',
      category: 'General',
      llms: ['ChatGPT', 'Claude', 'Gemini', 'Perplexity'],
      frequency: 'Daily',
      active: true,
    },
    {
      id: 2,
      text: 'How to improve content visibility in AI search?',
      category: 'SEO',
      llms: ['ChatGPT', 'Claude'],
      frequency: 'Daily',
      active: true,
    },
  ]);

  const [newPrompt, setNewPrompt] = useState('');
  const [notifications, setNotifications] = useState({
    mentions: true,
    positionChanges: true,
    weeklyReport: true,
    competitorUpdates: false,
  });

  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    google: '',
    perplexity: '',
  });

  const handleAddPrompt = () => {
    if (newPrompt.trim()) {
      setPrompts([
        ...prompts,
        {
          id: Date.now(),
          text: newPrompt,
          category: 'Custom',
          llms: ['ChatGPT', 'Claude', 'Gemini', 'Perplexity'],
          frequency: 'Daily',
          active: true,
        },
      ]);
      setNewPrompt('');
    }
  };

  const togglePrompt = (id: number) => {
    setPrompts(prompts.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  };

  const deletePrompt = (id: number) => {
    setPrompts(prompts.filter((p) => p.id !== id));
  };

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-12">
        <p
          className="text-[#1e1e1e] text-[40px] tracking-[-0.76px] mb-4"
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
        >
          Settings
        </p>
        <p
          className="text-[#757575] text-[20px] tracking-[-0.38px]"
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
        >
          Configure your GEO tracking preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b-2 border-[#d9d9d9]">
        {['prompts', 'llms', 'notifications', 'api-keys', 'export'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-[18px] tracking-[-0.342px] transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-[#1e1e1e] text-[#1e1e1e]'
                : 'border-transparent text-[#757575] hover:text-[#1e1e1e]'
            }`}
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Prompts Tab */}
      {activeTab === 'prompts' && (
        <div className="space-y-6">
          <div className="border-2 border-[#1e1e1e] rounded-lg p-8">
            <p
              className="text-[#1e1e1e] text-[24px] tracking-[-0.456px] mb-6"
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
            >
              Manage Prompts
            </p>

            {/* Add Prompt */}
            <div className="mb-8">
              <p
                className="text-[#757575] text-[12px] tracking-[-0.132px] mb-4"
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
              >
                ADD NEW PROMPT
              </p>
              <div className="flex gap-3">
                <textarea
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="Enter a prompt to test across LLMs..."
                  rows={3}
                  className="flex-1 px-6 py-4 border-2 border-[#1e1e1e] rounded text-[16px] tracking-[-0.304px] placeholder:text-[#d9d9d9] resize-none"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                />
                <button
                  onClick={handleAddPrompt}
                  disabled={!newPrompt.trim()}
                  className="px-8 py-4 bg-[#1e1e1e] text-white rounded text-[16px] tracking-[-0.304px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#000] transition-colors h-fit"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Add Prompt
                </button>
              </div>
            </div>

            {/* Prompt List */}
            <div>
              <p
                className="text-[#757575] text-[12px] tracking-[-0.132px] mb-4"
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
              >
                ACTIVE PROMPTS ({prompts.filter((p) => p.active).length})
              </p>
              <div className="space-y-4">
                {prompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className={`border-2 rounded-lg p-6 transition-all ${
                      prompt.active ? 'border-[#1e1e1e]' : 'border-[#d9d9d9] opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p
                          className="text-[#1e1e1e] text-[16px] tracking-[-0.304px] mb-2"
                          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                        >
                          {prompt.text}
                        </p>
                        <div
                          className="flex gap-4 text-[12px] text-[#757575]"
                          style={{ fontFamily: 'Roboto Mono, monospace' }}
                        >
                          <span>Category: {prompt.category}</span>
                          <span>•</span>
                          <span>Frequency: {prompt.frequency}</span>
                          <span>•</span>
                          <span>{prompt.llms.length} LLMs</span>
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <Switch
                          checked={prompt.active}
                          onCheckedChange={() => togglePrompt(prompt.id)}
                        />
                        <button
                          onClick={() => deletePrompt(prompt.id)}
                          className="text-[#757575] hover:text-[#1e1e1e] text-[20px]"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {prompt.llms.map((llm) => (
                        <span
                          key={llm}
                          className="px-3 py-1 bg-[#f5f5f5] border border-[#d9d9d9] rounded text-[12px] text-[#1e1e1e]"
                          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                        >
                          {llm}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LLMs Tab */}
      {activeTab === 'llms' && (
        <div className="border-2 border-[#1e1e1e] rounded-lg p-8">
          <p
            className="text-[#1e1e1e] text-[24px] tracking-[-0.456px] mb-6"
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
          >
            LLM Configuration
          </p>
          <div className="space-y-6">
            {[
              { name: 'ChatGPT', provider: 'OpenAI', enabled: true, color: '#10a37f' },
              { name: 'Claude', provider: 'Anthropic', enabled: true, color: '#d97757' },
              { name: 'Gemini', provider: 'Google', enabled: true, color: '#4285f4' },
              { name: 'Perplexity', provider: 'Perplexity AI', enabled: true, color: '#20808d' },
            ].map((llm) => (
              <div
                key={llm.name}
                className="flex items-center justify-between p-6 border-2 border-[#d9d9d9] rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: llm.color }} />
                  <div>
                    <p
                      className="text-[#1e1e1e] text-[18px] tracking-[-0.342px]"
                      style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                    >
                      {llm.name}
                    </p>
                    <p
                      className="text-[#757575] text-[14px]"
                      style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                    >
                      {llm.provider}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span
                    className="text-[#10a37f] text-[14px]"
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    Connected
                  </span>
                  <Switch checked={llm.enabled} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="border-2 border-[#1e1e1e] rounded-lg p-8">
          <p
            className="text-[#1e1e1e] text-[24px] tracking-[-0.456px] mb-6"
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
          >
            Notification Preferences
          </p>
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-[#d9d9d9]">
              <div>
                <p
                  className="text-[#1e1e1e] text-[18px] tracking-[-0.342px] mb-1"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  New Mentions
                </p>
                <p
                  className="text-[#757575] text-[14px]"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Get notified when your brand is mentioned
                </p>
              </div>
              <Switch
                checked={notifications.mentions}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, mentions: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between py-4 border-b border-[#d9d9d9]">
              <div>
                <p
                  className="text-[#1e1e1e] text-[18px] tracking-[-0.342px] mb-1"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Position Changes
                </p>
                <p
                  className="text-[#757575] text-[14px]"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Alert when your position changes significantly
                </p>
              </div>
              <Switch
                checked={notifications.positionChanges}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, positionChanges: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between py-4 border-b border-[#d9d9d9]">
              <div>
                <p
                  className="text-[#1e1e1e] text-[18px] tracking-[-0.342px] mb-1"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Weekly Report
                </p>
                <p
                  className="text-[#757575] text-[14px]"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Receive weekly performance summary
                </p>
              </div>
              <Switch
                checked={notifications.weeklyReport}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, weeklyReport: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between py-4">
              <div>
                <p
                  className="text-[#1e1e1e] text-[18px] tracking-[-0.342px] mb-1"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Competitor Updates
                </p>
                <p
                  className="text-[#757575] text-[14px]"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Track competitor mention changes
                </p>
              </div>
              <Switch
                checked={notifications.competitorUpdates}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, competitorUpdates: checked })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api-keys' && (
        <div className="border-2 border-[#1e1e1e] rounded-lg p-8">
          <p
            className="text-[#1e1e1e] text-[24px] tracking-[-0.456px] mb-6"
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
          >
            API Configuration
          </p>
          <div className="space-y-6">
            <div>
              <p
                className="text-[#757575] text-[12px] tracking-[-0.132px] mb-3"
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
              >
                OPENAI API KEY
              </p>
              <input
                type="password"
                value={apiKeys.openai}
                onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                placeholder="sk-..."
                className="w-full px-6 py-4 border-2 border-[#1e1e1e] rounded text-[16px] tracking-[-0.304px] placeholder:text-[#d9d9d9]"
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              />
              <p
                className="text-[#757575] text-[12px] mt-2"
                style={{ fontFamily: 'Roboto Mono, monospace' }}
              >
                Required for ChatGPT tracking
              </p>
            </div>
            <div>
              <p
                className="text-[#757575] text-[12px] tracking-[-0.132px] mb-3"
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
              >
                ANTHROPIC API KEY
              </p>
              <input
                type="password"
                value={apiKeys.anthropic}
                onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
                placeholder="sk-ant-..."
                className="w-full px-6 py-4 border-2 border-[#1e1e1e] rounded text-[16px] tracking-[-0.304px] placeholder:text-[#d9d9d9]"
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              />
              <p
                className="text-[#757575] text-[12px] mt-2"
                style={{ fontFamily: 'Roboto Mono, monospace' }}
              >
                Required for Claude tracking
              </p>
            </div>
            <div>
              <p
                className="text-[#757575] text-[12px] tracking-[-0.132px] mb-3"
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
              >
                GOOGLE API KEY
              </p>
              <input
                type="password"
                value={apiKeys.google}
                onChange={(e) => setApiKeys({ ...apiKeys, google: e.target.value })}
                placeholder="AIza..."
                className="w-full px-6 py-4 border-2 border-[#1e1e1e] rounded text-[16px] tracking-[-0.304px] placeholder:text-[#d9d9d9]"
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              />
              <p
                className="text-[#757575] text-[12px] mt-2"
                style={{ fontFamily: 'Roboto Mono, monospace' }}
              >
                Required for Gemini tracking
              </p>
            </div>
            <button
              className="px-8 py-3 bg-[#1e1e1e] text-white rounded text-[16px] tracking-[-0.304px] hover:bg-[#000] transition-colors"
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              Save API Keys
            </button>
          </div>
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="border-2 border-[#1e1e1e] rounded-lg p-8">
          <p
            className="text-[#1e1e1e] text-[24px] tracking-[-0.456px] mb-6"
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
          >
            Export Data
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-6 border-2 border-[#d9d9d9] rounded-lg">
              <div>
                <p
                  className="text-[#1e1e1e] text-[18px] tracking-[-0.342px] mb-1"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Export all data as CSV
                </p>
                <p
                  className="text-[#757575] text-[14px]"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Includes mentions, prompts, and metrics
                </p>
              </div>
              <button
                className="px-6 py-3 border-2 border-[#1e1e1e] text-[#1e1e1e] rounded text-[16px] tracking-[-0.304px] hover:bg-[#f5f5f5] transition-colors"
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              >
                Export CSV
              </button>
            </div>
            <div className="flex items-center justify-between p-6 border-2 border-[#d9d9d9] rounded-lg">
              <div>
                <p
                  className="text-[#1e1e1e] text-[18px] tracking-[-0.342px] mb-1"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Export all data as JSON
                </p>
                <p
                  className="text-[#757575] text-[14px]"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Raw data for custom analysis
                </p>
              </div>
              <button
                className="px-6 py-3 border-2 border-[#1e1e1e] text-[#1e1e1e] rounded text-[16px] tracking-[-0.304px] hover:bg-[#f5f5f5] transition-colors"
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
