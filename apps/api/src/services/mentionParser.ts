import { MentionResult, ParseOptions } from '@geoscope/shared/types';


function escapeRegex(str: string): string {
  // eslint-disable-next-line no-useless-escape
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class MentionParser {
  static parse(options: ParseOptions): MentionResult {
    const { brandName, brandAliases, competitorMap, responseText } = options;

    const brandTerms = [brandName, ...brandAliases].map(escapeRegex);
    const brandRegex = new RegExp(`\\b(${brandTerms.join('|')})\\b`, 'i');
    const brandMatch = responseText.match(brandRegex);

    const brandMentioned = !!brandMatch;
    const excerpts: MentionResult['excerpts'] = { competitors: {} };

    if (brandMentioned && brandMatch?.index !== undefined) {
      excerpts.brand = this.extractExcerpt(responseText, brandMatch.index);
    }

    const competitorsMentioned: string[] = [];
    for (const [competitorName, competitorAliases] of Object.entries(competitorMap)) {
      const competitorTerms = [competitorName, ...competitorAliases].map(escapeRegex);
      const competitorRegex = new RegExp(`\\b(${competitorTerms.join('|')})\\b`, 'i');
      const competitorMatch = responseText.match(competitorRegex);

      if (competitorMatch && competitorMatch.index !== undefined) {
        competitorsMentioned.push(competitorName);
        excerpts.competitors[competitorName] = this.extractExcerpt(
          responseText,
          competitorMatch.index,
        );
      }
    }

    return {
      brandMentioned,
      competitorsMentioned,
      excerpts,
      confidence: brandMentioned ? 'high' : 'low',
    };
  }

  private static extractExcerpt(text: string, index: number): string {
    const contextWindow = 150;
    const halfWindow = Math.floor(contextWindow / 2);
    const startIndex = Math.max(0, index - halfWindow);
    const endIndex = Math.min(text.length, index + halfWindow);
    let excerpt = text.substring(startIndex, endIndex);
    if (startIndex > 0) excerpt = `...${excerpt}`;
    if (endIndex < text.length) excerpt = `${excerpt}...`;
    return excerpt.trim();
  }
}
