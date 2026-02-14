'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUpIcon, 
  TrendingDownIcon,
  EyeIcon,
  ThumbsUpIcon,
  ClockIcon,
  BarChart3Icon,
  LineChartIcon,
  PieChartIcon
} from 'lucide-react';

interface AnalyticsData {
  totalViews: number;
  totalSubscribers: number;
  avgWatchTime: number;
  avgClickRate: number;
  avgRetentionRate: number;
  revenue: number;
  recentTrend: 'up' | 'down' | 'stable';
  topPerforming: {
    contentType: string;
    views: number;
    change: number;
  }[];
  growthProjections: {
    week: number;
    projectedSubscribers: number;
    projectedViews: number;
  }[];
}

interface AnalyticsDashboardProps {
  data?: AnalyticsData;
  isLoading?: boolean;
}

export default function AnalyticsDashboard({ data, isLoading = false }: AnalyticsDashboardProps) {
  const mockData: AnalyticsData = {
    totalViews: 1245000,
    totalSubscribers: 89420,
    avgWatchTime: 8.5,
    avgClickRate: 12.3,
    avgRetentionRate: 58.7,
    revenue: 8934.50,
    recentTrend: 'up',
    topPerforming: [
      { contentType: 'Listicle', views: 245000, change: 23 },
      { contentType: 'Reaction', views: 198000, change: 18 },
      { contentType: 'Tutorial', views: 167000, change: 15 },
      { contentType: 'Storytime', views: 143000, change: 12 },
      { contentType: 'Comparison', views: 126000, change: -3 }
    ],
    growthProjections: [
      { week: 1, projectedSubscribers: 92000, projectedViews: 280000 },
      { week: 2, projectedSubscribers: 95000, projectedViews: 295000 },
      { week: 3, projectedSubscribers: 98000, projectedViews: 310000 },
      { week: 4, projectedSubscribers: 102000, projectedViews: 325000 },
      { week: 5, projectedSubscribers: 106000, projectedViews: 340000 },
      { week: 6, projectedSubscribers: 110000, projectedViews: 355000 },
      { week: 7, projectedSubscribers: 114000, projectedViews: 370000 },
      { week: 8, projectedSubscribers: 118000, projectedViews: 385000 }
    ]
  };

  const displayData = data || mockData;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUpIcon className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDownIcon className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getChangeBadge = (change: number) => {
    const isPositive = change >= 0;
    return (
      <Badge className={isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
        {isPositive ? '+' : ''}{change}%
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold mt-1">{formatNumber(displayData.totalViews)}</p>
              </div>
              <EyeIcon className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm">
              {getTrendIcon(displayData.recentTrend)}
              <span className={displayData.recentTrend === 'up' ? 'text-green-600' : 'text-red-600'}>
                {displayData.recentTrend === 'up' ? '+12%' : '-5%'} vs last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Subscribers</p>
                <p className="text-2xl font-bold mt-1">{formatNumber(displayData.totalSubscribers)}</p>
              </div>
              <BarChart3Icon className="w-8 h-8 text-purple-500" />
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm">
              <TrendingUpIcon className="w-4 h-4 text-green-500" />
              <span className="text-green-600">+8% vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Watch Time</p>
                <p className="text-2xl font-bold mt-1">{displayData.avgWatchTime} min</p>
              </div>
              <ClockIcon className="w-8 h-8 text-orange-500" />
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm">
              <TrendingUpIcon className="w-4 h-4 text-green-500" />
              <span className="text-green-600">+15% vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(displayData.revenue)}</p>
              </div>
              <TrendingUpIcon className="w-8 h-8 text-green-500" />
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm">
              <TrendingUpIcon className="w-4 h-4 text-green-500" />
              <span className="text-green-600">+23% vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ThumbsUpIcon className="w-5 h-5" />
              Engagement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Click-Through Rate</span>
                <span className="text-xl font-semibold">{displayData.avgClickRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${displayData.avgClickRate}%` }}></div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <span className="text-gray-600">Retention Rate</span>
                <span className="text-xl font-semibold">{displayData.avgRetentionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${displayData.avgRetentionRate}%` }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Content Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displayData.topPerforming.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        backgroundColor: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'][idx] 
                      }}
                    />
                    <span className="text-sm">{item.contentType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{formatNumber(item.views)} views</span>
                    {getChangeBadge(item.change)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LineChartIcon className="w-5 h-5" />
            Top Performing Content Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {displayData.topPerforming.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="font-medium">{item.contentType}</p>
                    <p className="text-sm text-gray-600">{formatNumber(item.views)} views</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={item.change >= 0 ? 'border-green-200 text-green-700' : 'border-red-200 text-red-700'}
                  >
                    {item.change >= 0 ? '↑' : '↓'} {Math.abs(item.change)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Growth Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3Icon className="w-5 h-5" />
            Growth Projections (8 Weeks)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {displayData.growthProjections.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-1">Week {item.week}</p>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{formatNumber(item.projectedSubscribers)}</p>
                  <p className="text-xs text-gray-500">subs</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{formatNumber(item.projectedViews)}</p>
                  <p className="text-xs text-gray-500">views</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                ✓
              </div>
              <p className="text-sm">
                <strong>Listicle content</strong> is performing best — increase production frequency to 3x per week for maximum growth.
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                !
              </div>
              <p className="text-sm">
                <strong>Comparison videos</strong> are underperforming — consider adjusting thumbnail style or titles.
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                →
              </div>
              <p className="text-sm">
                <strong>Trend reaction format</strong> shows strong momentum — capitalize on trending topics within 24-48 hours.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
