import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const platformStats = [
  {
    name: 'ChatGPT',
    visibility: 82,
    citations: 124,
    topRanking: 15,
    avgPosition: 2.3,
    change: +12,
    color: '#8b5cf6'
  },
  {
    name: 'Perplexity',
    visibility: 65,
    citations: 78,
    topRanking: 8,
    avgPosition: 3.8,
    change: +8,
    color: '#06b6d4'
  },
  {
    name: 'Gemini',
    visibility: 55,
    citations: 45,
    topRanking: 5,
    avgPosition: 4.2,
    change: +5,
    color: '#f59e0b'
  },
  {
    name: 'Claude',
    visibility: 59,
    citations: 52,
    topRanking: 6,
    avgPosition: 3.9,
    change: +7,
    color: '#10b981'
  }
];

const radarData = [
  { metric: 'Visibility', ChatGPT: 82, Perplexity: 65, Gemini: 55, Claude: 59 },
  { metric: 'Citations', ChatGPT: 85, Perplexity: 70, Gemini: 60, Claude: 65 },
  { metric: 'Consistency', ChatGPT: 78, Perplexity: 72, Gemini: 68, Claude: 75 },
  { metric: 'Accuracy', ChatGPT: 92, Perplexity: 88, Gemini: 82, Claude: 90 },
  { metric: 'Freshness', ChatGPT: 75, Perplexity: 85, Gemini: 70, Claude: 78 },
];

const citationShare = [
  { name: 'ChatGPT', value: 124, color: '#8b5cf6' },
  { name: 'Perplexity', value: 78, color: '#06b6d4' },
  { name: 'Claude', value: 52, color: '#10b981' },
  { name: 'Gemini', value: 45, color: '#f59e0b' },
];

const categoryPerformance = [
  { category: 'Technology', ChatGPT: 88, Perplexity: 72, Gemini: 65, Claude: 70 },
  { category: 'Marketing', ChatGPT: 82, Perplexity: 68, Gemini: 58, Claude: 62 },
  { category: 'Business', ChatGPT: 75, Perplexity: 60, Gemini: 52, Claude: 55 },
  { category: 'Education', ChatGPT: 90, Perplexity: 78, Gemini: 68, Claude: 72 },
  { category: 'Healthcare', ChatGPT: 78, Perplexity: 65, Gemini: 48, Claude: 58 },
];

export function PlatformComparison() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2>Platform Comparison</h2>
        <p className="text-slate-500 text-sm mt-1">Compare your performance across different AI platforms</p>
      </div>

      {/* Platform Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {platformStats.map((platform) => (
          <Card key={platform.name}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>{platform.name}</span>
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: platform.color }}
                />
              </CardTitle>
              <CardDescription>Overall Performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-500">Visibility</span>
                  <span>{platform.visibility}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: `${platform.visibility}%`,
                      backgroundColor: platform.color
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <div>
                  <p className="text-xs text-slate-500">Citations</p>
                  <p className="text-lg">{platform.citations}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Top Ranking</p>
                  <p className="text-lg">{platform.topRanking}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600 pt-2 border-t">
                <TrendingUp className="w-4 h-4" />
                <span>+{platform.change}% this week</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Multi-dimensional comparison across platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" />
                <PolarRadiusAxis stroke="#94a3b8" />
                <Radar name="ChatGPT" dataKey="ChatGPT" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                <Radar name="Perplexity" dataKey="Perplexity" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                <Radar name="Gemini" dataKey="Gemini" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                <Radar name="Claude" dataKey="Claude" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Citation Distribution</CardTitle>
            <CardDescription>Share of total citations by platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={citationShare}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {citationShare.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Category</CardTitle>
          <CardDescription>How your content performs in different categories</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Bar dataKey="ChatGPT" fill="#8b5cf6" />
              <Bar dataKey="Perplexity" fill="#06b6d4" />
              <Bar dataKey="Gemini" fill="#f59e0b" />
              <Bar dataKey="Claude" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Platform Details */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Insights</CardTitle>
          <CardDescription>Detailed analysis and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platformStats.map((platform) => (
              <div key={platform.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: platform.color }}
                    />
                    <h4>{platform.name}</h4>
                  </div>
                  <Badge variant={platform.visibility >= 70 ? 'default' : 'secondary'}>
                    {platform.visibility >= 70 ? 'Strong' : 'Growing'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Avg. Position</p>
                    <p className="text-lg mt-1">{platform.avgPosition}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Citations</p>
                    <p className="text-lg mt-1">{platform.citations}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Top Rankings</p>
                    <p className="text-lg mt-1">{platform.topRanking}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Growth</p>
                    <p className="text-lg mt-1 text-green-600">+{platform.change}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
