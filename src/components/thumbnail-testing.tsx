'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbnailScore } from '@/lib/types';
import { 
  Image, 
  Upload, 
  Zap, 
  Trophy, 
  Eye, 
  Heart, 
  Type, 
  Lightbulb,
  Target,
  BarChart3,
  X,
  Download
} from 'lucide-react';

export default function ThumbnailTesting() {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<ThumbnailScore[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      if (selectedFiles.length > 4) {
        alert('Please select maximum 4 thumbnails');
        return;
      }
      setFiles(selectedFiles);
      setResults(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (files.length < 2) {
      alert('Please upload at least 2 thumbnails to compare');
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch('/api/youtube/analyze-thumbnails', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      
      // Find the winner (highest overall_ctr)
      const maxCtr = Math.max(...data.map((item: ThumbnailScore) => item.scores.overall_ctr));
      const resultsWithWinner = data.map((item: ThumbnailScore) => ({
        ...item,
        isWinner: item.scores.overall_ctr === maxCtr
      }));

      setResults(resultsWithWinner);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setFiles([]);
    setResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 8) return 'bg-green-500/20';
    if (score >= 6) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Image className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Thumbnail A/B Testing
          </h1>
        </div>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Upload 2-4 thumbnails and get AI-powered analysis on click-through potential, composition, readability, and emotional impact
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-white">CTR</p>
                <p className="text-sm text-zinc-400">Click-Through Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-white">Impact</p>
                <p className="text-sm text-zinc-400">Emotional Trigger</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Type className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-white">Text</p>
                <p className="text-sm text-zinc-400">Readability Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-white">Focus</p>
                <p className="text-sm text-zinc-400">Visual Contrast</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!results ? (
        /* Upload Section */
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-500" />
              Upload Thumbnails
            </CardTitle>
            <CardDescription>
              Upload 2-4 thumbnail images to compare their click-through potential
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-zinc-800 rounded-lg flex items-center justify-center">
                  <Upload className="h-8 w-8 text-zinc-400" />
                </div>
                <div>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Select Images
                  </Button>
                  <p className="text-sm text-zinc-500 mt-2">
                    JPG, PNG up to 10MB each. Maximum 4 images.
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Selected Thumbnails ({files.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {files.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video bg-zinc-800 rounded-lg overflow-hidden border-2 border-zinc-700">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <p className="text-sm text-zinc-400 mt-2 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={handleAnalyze}
                  disabled={files.length < 2 || isAnalyzing}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Zap className="h-5 w-5 mr-2 animate-spin" />
                      Analyzing Thumbnails...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Analyze Thumbnails
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Results Section */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Analysis Results
            </h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {/* TODO: Export results */}}
                className="border-zinc-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={resetAnalysis} className="bg-blue-600 hover:bg-blue-700">
                Analyze New Set
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {results.map((result, index) => (
              <Card key={index} className={`bg-zinc-900 border-2 ${result.isWinner ? 'border-yellow-500' : 'border-zinc-800'}`}>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Thumbnail */}
                    <div className="space-y-3">
                      <div className="relative">
                        <img
                          src={result.url}
                          alt={result.filename}
                          className="w-full aspect-video object-cover rounded-lg"
                        />
                        {result.isWinner && (
                          <div className="absolute -top-2 -right-2 bg-yellow-500 text-black rounded-full p-2">
                            <Trophy className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-white">{result.filename}</p>
                        {result.isWinner && (
                          <Badge className="bg-yellow-500 text-black mt-1">🏆 Winner</Badge>
                        )}
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-white text-lg">Performance Scores</h3>
                      <div className="space-y-3">
                        {Object.entries(result.scores).map(([key, score]) => {
                          const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                          return (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-zinc-300">{label}</span>
                              <div className="flex items-center gap-2">
                                <div className={`px-2 py-1 rounded text-sm font-bold ${getScoreBg(score)} ${getScoreColor(score)}`}>
                                  {score.toFixed(1)}
                                </div>
                                <div className="w-20 h-2 bg-zinc-700 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all ${score >= 8 ? 'bg-green-500' : score >= 6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${(score / 10) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        AI Analysis
                      </h3>
                      <div className="bg-zinc-800 rounded-lg p-4">
                        <p className="text-zinc-300 text-sm leading-relaxed">
                          {result.reasoning || 'AI analysis will provide detailed insights about this thumbnail\'s strengths and weaknesses, including composition, color theory, text placement, and emotional appeal.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 font-semibold mb-2">✅ Best Performing Thumbnail</p>
                  <p className="text-zinc-300">
                    {results.find(r => r.isWinner)?.filename} scored highest with {results.find(r => r.isWinner)?.scores.overall_ctr.toFixed(1)}/10 CTR potential.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-400 font-semibold mb-2">💡 Key Insights</p>
                    <ul className="text-zinc-300 text-sm space-y-1">
                      <li>• High contrast thumbnails perform better</li>
                      <li>• Clear, readable text increases CTR</li>
                      <li>• Emotional expressions drive clicks</li>
                      <li>• Bright colors stand out in feed</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <p className="text-purple-400 font-semibold mb-2">🎯 Optimization Tips</p>
                    <ul className="text-zinc-300 text-sm space-y-1">
                      <li>• Test variations of your winner</li>
                      <li>• A/B test on actual uploads</li>
                      <li>• Monitor performance over time</li>
                      <li>• Adapt based on audience feedback</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}