import { ReactNode } from 'react';
import { Page } from '../types';

interface LayoutProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  trialDaysRemaining: number | null;
  brandData: any;
}

export function Layout({
  children,
  currentPage,
  onNavigate,
  trialDaysRemaining,
  brandData,
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[rgba(0,0,0,0.1)] px-[42px] py-[10px] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-[40px] leading-[1.5] tracking-[-0.76px]">🤖</span>
          <span
            className="text-[24px] leading-[1.5] tracking-[-0.456px] font-medium"
            style={{ fontFamily: 'Roboto Mono, monospace' }}
          >
            GEO Scope
          </span>
        </div>
        <div className="flex items-center gap-4">
          {trialDaysRemaining !== null && (
            <div className="px-4 py-2 bg-[#757575] text-white rounded text-sm">
              Trial: {trialDaysRemaining} days remaining
            </div>
          )}
          <button
            className="px-6 py-2 border-2 border-[#1e1e1e] text-[#1e1e1e] rounded tracking-[-0.456px]"
            style={{ fontFamily: 'Roboto Mono, monospace' }}
          >
            Login
          </button>
          <div className="w-12 h-12 rounded-full bg-[#757575]" />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-[275px] border-r border-[rgba(0,0,0,0.1)] p-[35px] pt-[126px]">
          <div className="space-y-8">
            <div>
              <div
                className="text-[12px] tracking-[-0.132px] text-[#757575] mb-4"
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
              >
                ANALYSIS
              </div>
              <nav className="space-y-2">
                <button
                  onClick={() => onNavigate('home')}
                  className={`block w-full text-left text-[24px] tracking-[-0.456px] px-0 py-1 ${
                    currentPage === 'home' ? 'text-[#1e1e1e]' : 'text-[#757575]'
                  }`}
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Home
                </button>
                <button
                  onClick={() => onNavigate('llm-comparison')}
                  className={`block w-full text-left text-[24px] tracking-[-0.456px] px-0 py-1 ${
                    currentPage === 'llm-comparison' ? 'text-[#1e1e1e]' : 'text-[#757575]'
                  }`}
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  LLM comparison
                </button>
                <button
                  onClick={() => onNavigate('competitors')}
                  className={`block w-full text-left text-[24px] tracking-[-0.456px] px-0 py-1 ${
                    currentPage === 'competitors' ? 'text-[#1e1e1e]' : 'text-[#757575]'
                  }`}
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Competitors
                </button>
                <button
                  onClick={() => onNavigate('convo-context')}
                  className={`block w-full text-left text-[24px] tracking-[-0.456px] px-0 py-1 ${
                    currentPage === 'convo-context' ? 'text-[#1e1e1e]' : 'text-[#757575]'
                  }`}
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Convo context
                </button>
              </nav>
            </div>

            <div className="pt-64">
              <div
                className="text-[12px] tracking-[-0.132px] text-[#757575] mb-4"
                style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
              >
                CONFIG
              </div>
              <nav className="space-y-2">
                <button
                  onClick={() => onNavigate('settings')}
                  className={`block w-full text-left text-[24px] tracking-[-0.456px] px-0 py-1 ${
                    currentPage === 'settings' ? 'text-[#1e1e1e]' : 'text-[#757575]'
                  }`}
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Settings
                </button>
                <button
                  onClick={() => onNavigate('account')}
                  className={`block w-full text-left text-[24px] tracking-[-0.456px] px-0 py-1 ${
                    currentPage === 'account' ? 'text-[#1e1e1e]' : 'text-[#757575]'
                  }`}
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  Account
                </button>
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
