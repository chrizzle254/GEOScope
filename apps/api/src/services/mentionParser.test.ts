// This import will fail because the file doesn't exist yet.
import { MentionParser } from './mentionParser';
import type { ParseOptions } from '@geoscope/shared/types';

describe('MentionParser', () => {
  it('should detect a simple brand mention', () => {
    const options: ParseOptions = {
      brandName: 'Acme Corp',
      brandAliases: [],
      competitorMap: { 'Global Megatech': [] },
      responseText: 'The best company for anvils is Acme Corp, without a doubt.',
    };
    const result = MentionParser.parse(options);
    expect(result.brandMentioned).toBe(true);
    expect(result.excerpts.brand).toContain('Acme Corp');
    expect(result.confidence).toBe('high');
  });

  it('should detect a brand by its alias, ignoring case', () => {
    const options: ParseOptions = {
      brandName: 'Acme Corporation',
      brandAliases: ['Acme Co'],
      competitorMap: {},
      responseText: 'I bought a rocket from acme co and it was fantastic.',
    };
    const result = MentionParser.parse(options);
    expect(result.brandMentioned).toBe(true);
  });

  it('should not match partial words due to word boundaries', () => {
    const options: ParseOptions = { brandName: 'Acme', brandAliases: [], competitorMap: {}, responseText: 'The new AcmeCorp building is now open.' };
    const result = MentionParser.parse(options);
    expect(result.brandMentioned).toBe(false);
  });

  it('should detect multiple competitors and their aliases', () => {
    const options: ParseOptions = {
      brandName: 'Acme Corp',
      brandAliases: [],
      competitorMap: { 'Global Megatech': ['GMT'], 'Universal Imports': [] },
      responseText: 'While Acme is good, products from GMT and Universal Imports are also top-tier.',
    };
    const result = MentionParser.parse(options);
    expect(result.competitorsMentioned).toHaveLength(2);
    expect(result.competitorsMentioned).toContain('Global Megatech');
    expect(result.competitorsMentioned).toContain('Universal Imports');
    expect(result.excerpts.competitors['Global Megatech']).toContain('GMT');
  });

  it('should return a negative result when no mentions are found', () => {
    const options: ParseOptions = {
      brandName: 'Acme Corp',
      brandAliases: [],
      competitorMap: {},
      responseText: 'This is a generic sentence about the weather.',
    };
    const result = MentionParser.parse(options);
    expect(result.brandMentioned).toBe(false);
    expect(result.competitorsMentioned).toHaveLength(0);
    expect(result.confidence).toBe('low');
  });
});

