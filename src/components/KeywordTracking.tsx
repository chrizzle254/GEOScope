import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, TrendingUp, TrendingDown, Minus, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';

const keywords = [
  {
    id: 1,
    keyword: 'AI optimization',
    visibility: 92,
    change: +8,
    citations: 45,
    platforms: { chatgpt: 95, perplexity: 88, gemini: 90, claude: 92 },
    trend: 'up'
  },
  {
    id: 2,
    keyword: 'content strategy',
    visibility: 78,
    change: +5,
    citations: 32,
    platforms: { chatgpt: 82, perplexity: 75, gemini: 76, claude: 79 },
    trend: 'up'
  },
  {
    id: 3,
    keyword: 'SEO tools',
    visibility: 85,
    change: -2,
    citations: 38,
    platforms: { chatgpt: 88, perplexity: 84, gemini: 82, claude: 86 },
    trend: 'down'
  },
  {
    id: 4,
    keyword: 'digital marketing',
    visibility: 71,
    change: 0,
    citations: 28,
    platforms: { chatgpt: 75, perplexity: 68, gemini: 70, claude: 71 },
    trend: 'stable'
  },
  {
    id: 5,
    keyword: 'search ranking',
    visibility: 88,
    change: +12,
    citations: 42,
    platforms: { chatgpt: 92, perplexity: 85, gemini: 87, claude: 88 },
    trend: 'up'
  },
  {
    id: 6,
    keyword: 'generative AI',
    visibility: 94,
    change: +15,
    citations: 51,
    platforms: { chatgpt: 98, perplexity: 92, gemini: 93, claude: 94 },
    trend: 'up'
  },
  {
    id: 7,
    keyword: 'machine learning',
    visibility: 76,
    change: -3,
    citations: 35,
    platforms: { chatgpt: 79, perplexity: 74, gemini: 75, claude: 76 },
    trend: 'down'
  },
  {
    id: 8,
    keyword: 'natural language processing',
    visibility: 82,
    change: +6,
    citations: 40,
    platforms: { chatgpt: 85, perplexity: 80, gemini: 81, claude: 82 },
    trend: 'up'
  },
];

export function KeywordTracking() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredKeywords = keywords.filter(k => 
    k.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2>Keyword Tracking</h2>
          <p className="text-slate-500 text-sm mt-1">Monitor keyword performance across AI platforms</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Keyword
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Keyword</DialogTitle>
              <DialogDescription>
                Track a new keyword across all AI platforms
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="keyword">Keyword</Label>
                <Input id="keyword" placeholder="Enter keyword to track" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="category">Category (Optional)</Label>
                <Input id="category" placeholder="e.g., SEO, Marketing" className="mt-2" />
              </div>
              <Button className="w-full" onClick={() => setIsDialogOpen(false)}>Add Keyword</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search keywords..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Keywords Table */}
      <Card>
        <CardHeader>
          <CardTitle>Keywords Overview</CardTitle>
          <CardDescription>All tracked keywords and their performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Visibility Score</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Citations</TableHead>
                  <TableHead>ChatGPT</TableHead>
                  <TableHead>Perplexity</TableHead>
                  <TableHead>Gemini</TableHead>
                  <TableHead>Claude</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKeywords.map((keyword) => (
                  <TableRow key={keyword.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{keyword.keyword}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{keyword.visibility}</span>
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-violet-600 h-2 rounded-full" 
                            style={{ width: `${keyword.visibility}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {keyword.trend === 'up' && (
                          <>
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">+{keyword.change}</span>
                          </>
                        )}
                        {keyword.trend === 'down' && (
                          <>
                            <TrendingDown className="w-4 h-4 text-red-600" />
                            <span className="text-red-600">{keyword.change}</span>
                          </>
                        )}
                        {keyword.trend === 'stable' && (
                          <>
                            <Minus className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-400">{keyword.change}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{keyword.citations}</TableCell>
                    <TableCell>
                      <Badge variant={keyword.platforms.chatgpt >= 90 ? 'default' : 'secondary'}>
                        {keyword.platforms.chatgpt}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={keyword.platforms.perplexity >= 90 ? 'default' : 'secondary'}>
                        {keyword.platforms.perplexity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={keyword.platforms.gemini >= 90 ? 'default' : 'secondary'}>
                        {keyword.platforms.gemini}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={keyword.platforms.claude >= 90 ? 'default' : 'secondary'}>
                        {keyword.platforms.claude}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
