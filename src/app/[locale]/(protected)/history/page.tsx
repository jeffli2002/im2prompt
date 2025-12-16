'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  FileText,
  Image as ImageIcon,
  Layers,
  RefreshCw,
  Trash2,
  Video,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

interface HistoryItem {
  id: string;
  contentType: 'image_to_prompt' | 'image_generation' | 'video_generation';
  promptText: string;
  negativePrompt?: string;
  modelStyle?: string;
  cloudinaryUrl?: string;
  thumbnailUrl?: string;
  creditsSpent: number;
  status: 'processing' | 'completed' | 'failed' | 'expired';
  errorMessage?: string;
  expiresAt?: string;
  createdAt: string;
}

interface HistoryResponse {
  data: HistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const contentTypeConfig = {
  image_to_prompt: {
    label: 'Image to Prompt',
    icon: FileText,
    color: 'bg-blue-500',
  },
  image_generation: {
    label: 'Image Generation',
    icon: ImageIcon,
    color: 'bg-purple-500',
  },
  video_generation: {
    label: 'Video Generation',
    icon: Video,
    color: 'bg-pink-500',
  },
};

const statusConfig = {
  processing: { label: 'Processing', color: 'bg-yellow-500' },
  completed: { label: 'Completed', color: 'bg-green-500' },
  failed: { label: 'Failed', color: 'bg-red-500' },
  expired: { label: 'Expired', color: 'bg-gray-500' },
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchHistory = useCallback(
    async (contentType?: string) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (contentType && contentType !== 'all') {
          params.append('contentType', contentType);
        }

        const response = await fetch(`/api/v1/history?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }

        const data = await response.json();
        setHistory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },
    [page]
  );

  useEffect(() => {
    fetchHistory(activeTab);
  }, [activeTab, fetchHistory]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/history?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      fetchHistory(activeTab);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  const handleRecreate = async (item: HistoryItem) => {
    try {
      const response = await fetch('/api/v1/history/recreate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historyId: item.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to recreate');
      }

      const data = await response.json();

      switch (item.contentType) {
        case 'image_to_prompt':
          window.location.href = '/image-to-prompt';
          break;
        case 'image_generation':
          window.location.href = '/text-to-image';
          break;
        case 'video_generation':
          window.location.href = '/text-to-video';
          break;
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to recreate');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const HistoryCard = ({ item }: { item: HistoryItem }) => {
    const typeConfig = contentTypeConfig[item.contentType];
    const TypeIcon = typeConfig.icon;
    const statusInfo = statusConfig[item.status];

    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            <div className="relative flex h-48 w-full items-center justify-center bg-gray-100 md:w-48 dark:bg-gray-800">
              {item.thumbnailUrl || item.cloudinaryUrl ? (
                <Image
                  src={item.thumbnailUrl || item.cloudinaryUrl || ''}
                  alt="Content preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <TypeIcon className="h-16 w-16 text-gray-400" />
              )}
              <div className="absolute top-2 left-2">
                <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className={statusInfo.color}>
                  {statusInfo.label}
                </Badge>
              </div>
            </div>

            <div className="flex-1 space-y-3 p-4">
              <div>
                <p className="line-clamp-2 font-medium text-sm">{item.promptText}</p>
                {item.negativePrompt && (
                  <p className="mt-1 line-clamp-1 text-gray-500 text-xs">
                    Negative: {item.negativePrompt}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 text-gray-600 text-xs">
                {item.modelStyle && (
                  <div className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    <span>{item.modelStyle}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                <span className="font-medium">{item.creditsSpent} credits</span>
              </div>

              {item.errorMessage && <p className="text-red-500 text-xs">{item.errorMessage}</p>}

              {item.expiresAt && item.status !== 'expired' && (
                <p className="text-gray-500 text-xs">Expires: {formatDate(item.expiresAt)}</p>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRecreate(item)}
                  disabled={item.status === 'expired' || item.status === 'failed'}
                >
                  <RefreshCw className="mr-1 h-4 w-4" />
                  Recreate
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div>
        <h1 className="font-bold text-3xl">Content History</h1>
        <p className="mt-2 text-gray-600">View and manage your generated content</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="image_to_prompt">Image to Prompt</TabsTrigger>
          <TabsTrigger value="image_generation">Image Generation</TabsTrigger>
          <TabsTrigger value="video_generation">Video Generation</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="h-48 w-48" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : history && history.data.length > 0 ? (
            <>
              <div className="space-y-4">
                {history.data.map((item) => (
                  <HistoryCard key={item.id} item={item} />
                ))}
              </div>

              {history.totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {page} of {history.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(history.totalPages, p + 1))}
                    disabled={page === history.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">No history found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
