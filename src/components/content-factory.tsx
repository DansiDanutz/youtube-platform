'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VIDEO_TEMPLATES } from '@/lib/templates';
import { GeneratedContent, VideoTemplate } from '@/lib/types';
import { Lightbulb, Wand2, TrendingUp, Target, Hash, FileText, Zap, Play, Clock, Users } from 'lucide-react';

export default function ContentFactory() {
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null);
  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [trends, setTrends] = useState<string[]>([]);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);

  const categories = Array.from(new Set(VIDEO_TEMPLATES.map(t => t.category)));

  const handleGenerateContent = async () => {
    if (!selectedTemplate || !topic) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/youtube/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          topic,
          niche
        })
      });
      
      if (response.ok) {
        const content = await response.json();
        setGeneratedContent(content);
      }
    } catch (error) {
      console.error('Content generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFindTrends = async () => {
    if (!niche) return;
    
    setIsLoadingTrends(true);
    try {
      const response = await fetch('/api/youtube/find-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche })
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrends(data.trends);
      }
    } catch (error) {
      console.error('Trend detection failed:', error);
    } finally {
      setIsLoadingTrends(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Lightbulb className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Content Factory
          </h1>
        </div>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Transform any idea into viral YouTube content with AI-powered templates, titles, and scripts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Play className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-white">{VIDEO_TEMPLATES.length}</p>
                <p className="text-sm text-zinc-400">Viral Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-white">∞</p>
                <p className="text-sm text-zinc-400">Content Ideas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-white">&lt;30s</p>
                <p className="text-sm text-zinc-400">Generation Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-white">All</p>
                <p className="text-sm text-zinc-400">Niches Covered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-zinc-900">
          <TabsTrigger value="templates" className="data-[state=active]:bg-purple-600">
            <Wand2 className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-blue-600">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trend Detection
          </TabsTrigger>
          <TabsTrigger value="optimizer" className="data-[state=active]:bg-green-600">
            <Target className="h-4 w-4 mr-2" />
            Optimizer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Template Selection */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-purple-500" />
                  Choose Your Format
                </CardTitle>
                <CardDescription>
                  Select a viral template and customize it with your topic
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Category</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {VIDEO_TEMPLATES.map(template => (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-all border ${
                        selectedTemplate?.id === template.id 
                          ? 'border-purple-500 bg-purple-500/10' 
                          : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800'
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white">{template.name}</h4>
                          <Badge variant="secondary">{template.category}</Badge>
                        </div>
                        <p className="text-sm text-zinc-400 mb-2">{template.description}</p>
                        <p className="text-xs text-zinc-500">Example: {template.example_title}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-zinc-300">Your Topic</label>
                    <Input
                      placeholder="e.g., productivity tips, cooking hacks, gaming reviews..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-300">Niche (Optional)</label>
                    <Input
                      placeholder="e.g., tech, fitness, comedy, education..."
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleGenerateContent}
                  disabled={!selectedTemplate || !topic || isGenerating}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isGenerating ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Content */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-500" />
                  Generated Content
                </CardTitle>
                <CardDescription>
                  Your AI-generated title, description, tags, and script
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedContent ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Title</h4>
                      <div className="p-3 bg-zinc-800 rounded-lg">
                        <p className="text-zinc-200">{generatedContent.title}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-white mb-2">Hook</h4>
                      <div className="p-3 bg-zinc-800 rounded-lg">
                        <p className="text-zinc-200">{generatedContent.hook}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-2">Description</h4>
                      <div className="p-3 bg-zinc-800 rounded-lg max-h-32 overflow-y-auto">
                        <p className="text-zinc-200 text-sm">{generatedContent.description}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {generatedContent.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary">#{tag}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-2">Script Preview</h4>
                      <div className="p-3 bg-zinc-800 rounded-lg max-h-40 overflow-y-auto">
                        <p className="text-zinc-200 text-sm whitespace-pre-line">
                          {generatedContent.script.substring(0, 500)}...
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Copy All</Button>
                      <Button size="sm" variant="outline">Export</Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-zinc-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a template and topic to generate content</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Trending Topics
              </CardTitle>
              <CardDescription>
                Discover what's trending in your niche right now
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Enter your niche (e.g., tech, fitness, gaming...)"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                />
                <Button 
                  onClick={handleFindTrends}
                  disabled={!niche || isLoadingTrends}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoadingTrends ? 'Finding...' : 'Find Trends'}
                </Button>
              </div>

              {trends.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Trending Now</h4>
                  <div className="grid gap-3">
                    {trends.map((trend, idx) => (
                      <Card key={idx} className="bg-zinc-800 border-zinc-700">
                        <CardContent className="p-4">
                          <p className="text-zinc-200">{trend}</p>
                          <Button 
                            size="sm" 
                            className="mt-2"
                            onClick={() => setTopic(trend)}
                          >
                            Use This Topic
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimizer" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Title & Description Optimizer
              </CardTitle>
              <CardDescription>
                Optimize your existing content for better performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-300">Current Title</label>
                <Input
                  placeholder="Paste your current title..."
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-300">Current Description</label>
                <Textarea
                  placeholder="Paste your current description..."
                  className="bg-zinc-800 border-zinc-700 min-h-32"
                />
              </div>
              <Button className="bg-green-600 hover:bg-green-700">
                <Target className="h-4 w-4 mr-2" />
                Optimize Content
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}