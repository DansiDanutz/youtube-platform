'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoProject, VideoScene } from '@/lib/types';
import CaptionEditor from '@/components/caption-editor';
import { type CaptionLine, type CaptionStyle } from '@/lib/captions';
import CollabSession from '@/components/collab-session';
import { type CollabEvent } from '@/lib/collab';
import { 
  Video, 
  Wand2, 
  Play, 
  Pause,
  SkipForward,
  Image,
  Mic,
  Music,
  Download,
  Settings,
  Clock,
  CheckCircle,
  Circle,
  Loader2,
  Clapperboard,
  Subtitles
} from 'lucide-react';

export default function VideoGenerator() {
  const [project, setProject] = useState<VideoProject>({
    id: '',
    title: '',
    sceneCount: 5,
    style: 'cinematic',
    aspectRatio: '16:9',
    scenes: [],
    voiceover: true,
    music: false,
    currentSceneIndex: 0,
    status: 'draft'
  });

  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [phase, setPhase] = useState<'setup' | 'scenes' | 'preview' | 'render'>('setup');
  const [captions, setCaptions] = useState<CaptionLine[]>([]);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle | null>(null);

  // Collab
  const [collabRoomId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('room') || `room_${Math.random().toString(36).slice(2, 10)}`;
    }
    return `room_${Math.random().toString(36).slice(2, 10)}`;
  });
  const [collabUserId] = useState<string>(() => `user_${Math.random().toString(36).slice(2, 8)}`);
  const [collabUserName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yt_collab_name');
      if (saved) return saved;
    }
    return `Creator ${Math.floor(Math.random() * 900 + 100)}`;
  });
  const sendCollabEvent = useRef<((type: CollabEvent['type'], payload?: Record<string, unknown>) => void) | null>(null);

  const handleCollabEvent = useCallback((event: CollabEvent) => {
    if (event.type === 'script_update' && event.payload?.script) {
      setScript(event.payload.script as string);
    }
    if (event.type === 'project_update' && event.payload?.title) {
      setProject(prev => ({ ...prev, title: event.payload?.title as string }));
    }
  }, []);

  const handleGenerateScenes = async () => {
    if (!script.trim() || !project.title) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/youtube/generate-scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script,
          title: project.title,
          style: project.style,
          aspectRatio: project.aspectRatio,
          sceneCount: project.sceneCount
        })
      });

      if (response.ok) {
        const scenes = await response.json();
        setProject(prev => ({
          ...prev,
          scenes,
          status: 'generating'
        }));
        setPhase('scenes');
      }
    } catch (error) {
      console.error('Scene generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImages = async () => {
    const updatedScenes = [...project.scenes];
    
    for (let i = 0; i < updatedScenes.length; i++) {
      updatedScenes[i].status = 'generating';
      setProject(prev => ({ ...prev, scenes: updatedScenes }));

      try {
        const response = await fetch('/api/youtube/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: updatedScenes[i].imagePrompt,
            style: project.style
          })
        });

        if (response.ok) {
          const { imageUrl } = await response.json();
          updatedScenes[i].imageUrl = imageUrl;
          updatedScenes[i].status = 'approved';
        } else {
          updatedScenes[i].status = 'rejected';
        }
      } catch (error) {
        console.error(`Image generation failed for scene ${i + 1}:`, error);
        updatedScenes[i].status = 'rejected';
      }

      setProject(prev => ({ ...prev, scenes: updatedScenes }));
    }
  };

  const handleRenderVideo = async () => {
    setProject(prev => ({ ...prev, status: 'rendering' }));
    // TODO: Implement video rendering
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Circle className="h-4 w-4 text-zinc-500" />;
      case 'generating': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <Circle className="h-4 w-4 text-red-500" />;
      default: return <Circle className="h-4 w-4 text-zinc-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
            <Video className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Video Generator
          </h1>
        </div>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Transform your script into a complete video with AI-generated scenes, images, voiceover, and editing
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4">
        {['setup', 'scenes', 'preview', 'render'].map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              phase === step ? 'border-blue-500 bg-blue-500 text-white' : 
              ['setup', 'scenes', 'preview', 'render'].indexOf(phase) > index ? 'border-green-500 bg-green-500 text-white' :
              'border-zinc-700 text-zinc-500'
            }`}>
              {index + 1}
            </div>
            {index < 3 && <div className="w-16 h-0.5 bg-zinc-700 mx-2" />}
          </div>
        ))}
      </div>

      {/* Setup Phase */}
      {phase === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                Project Settings
              </CardTitle>
              <CardDescription>
                Configure your video project settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-300">Video Title</label>
                <Input
                  placeholder="Enter your video title..."
                  value={project.title}
                  onChange={(e) => setProject(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300">Visual Style</label>
                <Select value={project.style} onValueChange={(value: any) => setProject(prev => ({ ...prev, style: value }))}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cinematic">Cinematic</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="vlog">Vlog Style</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300">Aspect Ratio</label>
                <Select value={project.aspectRatio} onValueChange={(value: any) => setProject(prev => ({ ...prev, aspectRatio: value }))}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                    <SelectItem value="9:16">9:16 (Portrait/Shorts)</SelectItem>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300">Number of Scenes</label>
                <Select value={project.sceneCount.toString()} onValueChange={(value) => setProject(prev => ({ ...prev, sceneCount: parseInt(value) }))}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Scenes</SelectItem>
                    <SelectItem value="5">5 Scenes</SelectItem>
                    <SelectItem value="8">8 Scenes</SelectItem>
                    <SelectItem value="10">10 Scenes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={project.voiceover}
                    onChange={(e) => setProject(prev => ({ ...prev, voiceover: e.target.checked }))}
                    className="rounded border-zinc-700 bg-zinc-800"
                  />
                  <Mic className="h-4 w-4" />
                  AI Voiceover
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={project.music}
                    onChange={(e) => setProject(prev => ({ ...prev, music: e.target.checked }))}
                    className="rounded border-zinc-700 bg-zinc-800"
                  />
                  <Music className="h-4 w-4" />
                  Background Music
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clapperboard className="h-5 w-5 text-green-500" />
                Video Script
              </CardTitle>
              <CardDescription>
                Paste your script or generate one with the Content Factory
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your video script here... The AI will break it down into scenes automatically."
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="bg-zinc-800 border-zinc-700 min-h-80 text-sm"
              />
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleGenerateScenes}
                  disabled={!script.trim() || !project.title || isGenerating}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Scenes...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Scenes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scenes Phase */}
      {phase === 'scenes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Generated Scenes</h2>
            <div className="flex gap-2">
              <Button 
                onClick={handleGenerateImages}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Image className="h-4 w-4 mr-2" />
                Generate All Images
              </Button>
              <Button 
                onClick={() => setPhase('preview')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Preview Video
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {project.scenes.map((scene, index) => (
              <Card key={scene.id} className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Scene Info */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Scene {index + 1}</h3>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(scene.status)}
                          <Badge variant={scene.status === 'approved' ? 'default' : 'secondary'}>
                            {scene.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-zinc-400">Duration: {scene.duration}s</p>
                        <p className="text-sm text-zinc-300">{scene.description}</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Image Prompt</label>
                        <Textarea
                          value={scene.imagePrompt}
                          onChange={(e) => {
                            const updatedScenes = [...project.scenes];
                            updatedScenes[index].imagePrompt = e.target.value;
                            setProject(prev => ({ ...prev, scenes: updatedScenes }));
                          }}
                          className="bg-zinc-800 border-zinc-700 text-sm"
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Image Preview */}
                    <div className="lg:col-span-2">
                      <div className="aspect-video bg-zinc-800 rounded-lg border-2 border-zinc-700 flex items-center justify-center overflow-hidden">
                        {scene.imageUrl ? (
                          <img
                            src={scene.imageUrl}
                            alt={`Scene ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : scene.status === 'generating' ? (
                          <div className="text-center">
                            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
                            <p className="text-zinc-400">Generating image...</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Image className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                            <p className="text-zinc-500">No image generated</p>
                            <Button size="sm" className="mt-2" variant="outline">
                              Generate Image
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Preview Phase */}
      {phase === 'preview' && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Video Preview</CardTitle>
            <CardDescription>
              Review your video before final rendering
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="aspect-video bg-zinc-800 rounded-lg border-2 border-zinc-700 flex items-center justify-center">
              <div className="text-center">
                <Play className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400 mb-4">Video preview will appear here</p>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4 mr-2" />
                    Play Preview
                  </Button>
                </div>
              </div>
            </div>

            {/* Auto-Captions */}
            <div className="border-t border-zinc-700 pt-4">
              <CaptionEditor
                script={script}
                duration={project.scenes.reduce((sum, s) => sum + (s.duration || 5), 0) || 60}
                onCaptionsReady={(lines, style) => { setCaptions(lines); setCaptionStyle(style); }}
              />
              {captions.length > 0 && (
                <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                  <Subtitles className="w-3 h-3" />
                  {captions.length} caption lines ready for export
                </p>
              )}
            </div>

            <div className="flex justify-between items-center">
              <Button 
                onClick={() => setPhase('scenes')} 
                variant="outline"
              >
                Back to Scenes
              </Button>
              <Button 
                onClick={handleRenderVideo}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Render Final Video
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}