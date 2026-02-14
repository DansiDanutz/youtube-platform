import { VideoTemplate } from './types';

export const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    id: 'top-10-list',
    name: 'Top 10 List',
    category: 'listicle',
    description: 'Countdown format with engaging reveals',
    structure: ['Hook', 'Intro', 'Item 10-6', 'Mid-roll tease', 'Item 5-2', 'Final reveal', 'CTA'],
    hooks: ['You won\'t believe #3...', 'Wait until you see what\'s coming at #1', 'This list will shock you'],
    example_title: '10 Secrets That Will Change Your Life Forever'
  },
  {
    id: 'storytime',
    name: 'Storytime',
    category: 'storytime',
    description: 'Personal narrative with dramatic arc',
    structure: ['Hook', 'Setup', 'Rising action', 'Climax', 'Resolution', 'Lesson learned', 'CTA'],
    hooks: ['This almost ruined my life...', 'I can\'t believe this happened to me', 'You need to hear this story'],
    example_title: 'The Day Everything Changed: My Crazy Story'
  },
  {
    id: 'reaction-video',
    name: 'Reaction Video',
    category: 'reaction',
    description: 'React to trending content with commentary',
    structure: ['Hook', 'Original content intro', 'Live reactions', 'Analysis', 'Personal take', 'CTA'],
    hooks: ['I had to pause this video...', 'This is insane!', 'Wait, what just happened?'],
    example_title: 'Reacting to the Most Viral Video Ever'
  },
  {
    id: 'tutorial-guide',
    name: 'Step-by-Step Tutorial',
    category: 'tutorial',
    description: 'Educational content with clear steps',
    structure: ['Hook', 'What you\'ll learn', 'Materials needed', 'Step 1-3', 'Pro tips', 'Results', 'CTA'],
    hooks: ['Learn this in 10 minutes', 'The secret method nobody talks about', 'This changed everything for me'],
    example_title: 'Master This Skill in Just 10 Minutes'
  },
  {
    id: 'vs-comparison',
    name: 'VS Comparison',
    category: 'comparison',
    description: 'Head-to-head comparison format',
    structure: ['Hook', 'Setup comparison', 'Round 1', 'Round 2', 'Round 3', 'Final verdict', 'CTA'],
    hooks: ['The results will surprise you', 'This wasn\'t even close', 'I didn\'t expect this outcome'],
    example_title: 'iPhone vs Android: The Ultimate Test'
  },
  {
    id: 'review-breakdown',
    name: 'Honest Review',
    category: 'review',
    description: 'In-depth product or service review',
    structure: ['Hook', 'First impressions', 'Pros', 'Cons', 'Real-world testing', 'Final verdict', 'CTA'],
    hooks: ['Don\'t buy this until you watch this', 'I tested this for 30 days', 'Here\'s what they don\'t tell you'],
    example_title: 'I Tested This for 30 Days: Here\'s the Truth'
  },
  {
    id: 'challenge',
    name: '24-Hour Challenge',
    category: 'challenge',
    description: 'Time-based challenge format',
    structure: ['Hook', 'Rules setup', 'Hour 1-6', 'Midpoint crisis', 'Hour 18-24', 'Results', 'CTA'],
    hooks: ['This was harder than expected', 'I almost quit halfway through', 'The results shocked me'],
    example_title: '24 Hours of Only Eating Yellow Food'
  },
  {
    id: 'before-after',
    name: 'Transformation',
    category: 'tutorial',
    description: 'Before and after transformation content',
    structure: ['Hook', 'Starting point', 'The process', 'Challenges faced', 'Final reveal', 'Tips for you', 'CTA'],
    hooks: ['You won\'t recognize me', 'This transformation took months', 'The before and after is crazy'],
    example_title: 'My 90-Day Transformation: Shocking Results'
  },
  {
    id: 'myth-busting',
    name: 'Myth Busters',
    category: 'tutorial',
    description: 'Testing popular myths and beliefs',
    structure: ['Hook', 'Myth introduction', 'Testing setup', 'Experiment', 'Results analysis', 'Verdict', 'CTA'],
    hooks: ['This myth is everywhere but...', 'I had to test this myself', 'The truth might shock you'],
    example_title: 'Testing 5 Popular Myths: What\'s Actually True?'
  },
  {
    id: 'day-in-life',
    name: 'Day in My Life',
    category: 'storytime',
    description: 'Follow along through a typical day',
    structure: ['Hook', 'Morning routine', 'Work/activities', 'Challenges', 'Evening routine', 'Reflections', 'CTA'],
    hooks: ['My days are crazier than you think', 'You asked to see my routine', 'This is what my life really looks like'],
    example_title: 'A Day in My Chaotic Life: Behind the Scenes'
  },
  {
    id: 'mistakes-learned',
    name: 'Biggest Mistakes',
    category: 'storytime',
    description: 'Learning from failures and mistakes',
    structure: ['Hook', 'Mistake reveal', 'How it happened', 'Consequences', 'Lessons learned', 'Advice', 'CTA'],
    hooks: ['I lost everything because of this', 'This mistake cost me thousands', 'Learn from my failures'],
    example_title: '5 Mistakes That Nearly Destroyed My Career'
  },
  {
    id: 'exposed-truth',
    name: 'Industry Exposed',
    category: 'review',
    description: 'Behind-the-scenes industry revelations',
    structure: ['Hook', 'Industry overview', 'Hidden truth 1', 'Hidden truth 2', 'Personal experience', 'What this means', 'CTA'],
    hooks: ['The industry doesn\'t want you to know this', 'I\'m breaking my silence', 'This will change how you see everything'],
    example_title: 'What the Industry Doesn\'t Want You to Know'
  },
  {
    id: 'prediction-future',
    name: 'Future Predictions',
    category: 'tutorial',
    description: 'Forecasting trends and future developments',
    structure: ['Hook', 'Current state', 'Trend analysis', 'Prediction 1-3', 'Timeline', 'How to prepare', 'CTA'],
    hooks: ['This will happen by 2025', 'Mark my words on this', 'The future is closer than you think'],
    example_title: '5 Predictions That Will Come True by 2025'
  },
  {
    id: 'budget-challenge',
    name: 'Budget Challenge',
    category: 'challenge',
    description: 'Accomplishing something on a tight budget',
    structure: ['Hook', 'Budget reveal', 'Planning', 'Shopping/sourcing', 'Execution', 'Final results', 'CTA'],
    hooks: ['Can I do this for under $50?', 'This budget seemed impossible', 'You won\'t believe what I created'],
    example_title: 'Building My Dream Setup for Under $100'
  },
  {
    id: 'first-time',
    name: 'First Time Trying',
    category: 'storytime',
    description: 'Experiencing something new for the first time',
    structure: ['Hook', 'Why now?', 'Preparation', 'The experience', 'Unexpected moments', 'Final thoughts', 'CTA'],
    hooks: ['I\'ve never done this before', 'This was scarier than expected', 'I wish I tried this sooner'],
    example_title: 'My First Time Skydiving: Terrifying Experience'
  },
  {
    id: 'tier-ranking',
    name: 'Tier List Ranking',
    category: 'review',
    description: 'Ranking items from best to worst in tiers',
    structure: ['Hook', 'Tier explanation', 'S-tier items', 'A-B tier items', 'C-D tier items', 'Controversial picks', 'CTA'],
    hooks: ['This ranking will make you mad', 'I know you\'ll disagree with this', 'Some of these choices are spicy'],
    example_title: 'Ranking Every Marvel Movie: The Ultimate Tier List'
  },
  {
    id: 'conspiracy-theory',
    name: 'Deep Dive Investigation',
    category: 'tutorial',
    description: 'Researching and investigating mysterious topics',
    structure: ['Hook', 'Mystery introduction', 'Evidence gathering', 'Theory analysis', 'Counter-arguments', 'Conclusion', 'CTA'],
    hooks: ['Something doesn\'t add up here', 'I went down a rabbit hole', 'The evidence is shocking'],
    example_title: 'I Investigated This Mystery for 6 Months'
  },
  {
    id: 'life-hack',
    name: 'Life Hack Collection',
    category: 'tutorial',
    description: 'Multiple useful tips and tricks',
    structure: ['Hook', 'Hack preview', 'Hack 1-3', 'Bonus hacks', 'Which ones work best', 'Your turn', 'CTA'],
    hooks: ['These will save you hours', 'I wish I knew these sooner', '#3 changed my life'],
    example_title: '10 Life Hacks That Actually Work'
  },
  {
    id: 'glow-up',
    name: 'Ultimate Glow Up',
    category: 'tutorial',
    description: 'Complete transformation guide',
    structure: ['Hook', 'Starting point', 'Phase 1 changes', 'Phase 2 changes', 'Phase 3 changes', 'Final reveal', 'CTA'],
    hooks: ['This took 6 months', 'The transformation is insane', 'You can do this too'],
    example_title: 'My 6-Month Glow Up: Complete Transformation'
  },
  {
    id: 'speed-run',
    name: 'Speed Challenge',
    category: 'challenge',
    description: 'Completing tasks as quickly as possible',
    structure: ['Hook', 'Challenge rules', 'Strategy planning', 'Attempt 1', 'Attempt 2', 'Final time', 'CTA'],
    hooks: ['Can I beat the world record?', 'This is harder than it looks', 'The clock is ticking'],
    example_title: 'Speed Running Every McDonald\'s Menu Item'
  }
];