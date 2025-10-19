import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ExternalLink, Search, Calendar, Quote } from 'lucide-react';

const citations = [
  {
    id: 1,
    platform: 'ChatGPT',
    query: 'best AI optimization tools',
    snippet: 'For comprehensive AI optimization, tools like ContentOptimizer and SEO.ai provide excellent features for improving content visibility in generative AI platforms...',
    url: 'https://example.com/ai-optimization',
    date: '2024-10-18',
    position: 1,
    category: 'Technology'
  },
  {
    id: 2,
    platform: 'Perplexity',
    query: 'content strategy for AI search',
    snippet: 'Modern content strategy must account for AI-powered search engines. Key strategies include structured data implementation and semantic optimization...',
    url: 'https://example.com/content-strategy',
    date: '2024-10-18',
    position: 2,
    category: 'Marketing'
  },
  {
    id: 3,
    platform: 'Gemini',
    query: 'generative engine optimization techniques',
    snippet: 'GEO techniques differ from traditional SEO by focusing on answer-worthiness and citation potential rather than keyword density...',
    url: 'https://example.com/geo-techniques',
    date: '2024-10-17',
    position: 1,
    category: 'Technology'
  },
  {
    id: 4,
    platform: 'Claude',
    query: 'digital marketing trends 2024',
    snippet: 'The shift towards AI-driven search represents one of the most significant changes in digital marketing, requiring new optimization approaches...',
    url: 'https://example.com/marketing-trends',
    date: '2024-10-17',
    position: 3,
    category: 'Marketing'
  },
  {
    id: 5,
    platform: 'ChatGPT',
    query: 'how to improve search rankings',
    snippet: 'Improving search rankings in AI platforms requires focus on authoritative content, clear structure, and comprehensive coverage of topics...',
    url: 'https://example.com/search-rankings',
    date: '2024-10-16',
    position: 2,
    category: 'SEO'
  },
  {
    id: 6,
    platform: 'Perplexity',
    query: 'AI content optimization best practices',
    snippet: 'Best practices for AI content optimization include using natural language, providing clear answers, and maintaining factual accuracy...',
    url: 'https://example.com/best-practices',
    date: '2024-10-16',
    position: 1,
    category: 'Technology'
  },
  {
    id: 7,
    platform: 'Gemini',
    query: 'machine learning in SEO',
    snippet: 'Machine learning algorithms are increasingly used in search engines to understand context and user intent, making semantic relevance crucial...',
    url: 'https://example.com/ml-seo',
    date: '2024-10-15',
    position: 4,
    category: 'Technology'
  },
  {
    id: 8,
    platform: 'Claude',
    query: 'natural language processing applications',
    snippet: 'NLP applications in search and content discovery have revolutionized how users find information, emphasizing the importance of well-structured content...',
    url: 'https://example.com/nlp-applications',
    date: '2024-10-15',
    position: 2,
    category: 'Technology'
  }
];

const platformColors: Record<string, string> = {
  'ChatGPT': 'bg-violet-100 text-violet-700 border-violet-200',
  'Perplexity': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Gemini': 'bg-amber-100 text-amber-700 border-amber-200',
  'Claude': 'bg-green-100 text-green-700 border-green-200'
};

export function Citations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredCitations = citations.filter(citation => {
    const matchesSearch = citation.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         citation.snippet.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || citation.platform === platformFilter;
    const matchesCategory = categoryFilter === 'all' || citation.category === categoryFilter;
    return matchesSearch && matchesPlatform && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2>Citations & Mentions</h2>
        <p className="text-slate-500 text-sm mt-1">Track where and how your content is being cited</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Citations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">247</div>
            <p className="text-xs text-slate-500 mt-1">Across all platforms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">42</div>
            <p className="text-xs text-green-600 mt-1">+18% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg. Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">2.1</div>
            <p className="text-xs text-slate-500 mt-1">In citation lists</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">ChatGPT</div>
            <p className="text-xs text-slate-500 mt-1">124 citations</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search citations..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="ChatGPT">ChatGPT</SelectItem>
                <SelectItem value="Perplexity">Perplexity</SelectItem>
                <SelectItem value="Gemini">Gemini</SelectItem>
                <SelectItem value="Claude">Claude</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="SEO">SEO</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Citations List */}
      <div className="space-y-4">
        {filteredCitations.map((citation) => (
          <Card key={citation.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={platformColors[citation.platform]}>
                      {citation.platform}
                    </Badge>
                    <Badge variant="outline">Position #{citation.position}</Badge>
                    <Badge variant="outline">{citation.category}</Badge>
                  </div>
                  <CardTitle className="text-lg">{citation.query}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(citation.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border-l-4 border-violet-600">
                  <Quote className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                  <p className="text-sm text-slate-700">{citation.snippet}</p>
                </div>
                <a 
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700"
                >
                  <span>View source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCitations.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Quote className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No citations found matching your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
