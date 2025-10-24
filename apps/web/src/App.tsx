import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { LLMComparison } from './components/LLMComparison';
import { Competitors } from './components/Competitors';
import { ConvoContext } from './components/ConvoContext';
import { Settings } from './components/Settings';
import { Account } from './components/Account';
import { Page } from './types';

interface BrandData {
  brandName: string;
  website: string;
  industry: string;
  targetAudience: string;
  competitors: string[];
  examplePrompt: string;
  email: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);

  const handleBrandSetupComplete = (data: BrandData) => {
    setBrandData(data);
    setTrialDaysRemaining(3);
  };

  return (
    <Layout 
      currentPage={currentPage} 
      onNavigate={setCurrentPage}
      trialDaysRemaining={trialDaysRemaining}
      brandData={brandData}
    >
      {currentPage === 'home' && (
        <Dashboard 
          brandData={brandData} 
          onSetupComplete={handleBrandSetupComplete}
        />
      )}
      {currentPage === 'llm-comparison' && <LLMComparison brandData={brandData} />}
      {currentPage === 'competitors' && <Competitors brandData={brandData} />}
      {currentPage === 'convo-context' && <ConvoContext brandData={brandData} />}
      {currentPage === 'settings' && <Settings />}
      {currentPage === 'account' && <Account />}
    </Layout>
  );
}
