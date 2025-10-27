import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface VideoResult {
  taskId: string;
  videoUrl?: string;
  status: 'pending' | 'generating' | 'success' | 'failed';
  error?: string;
  timestamp: number;
}

interface VideoState {
  videos: Record<string, VideoResult>;

  setVideo: (taskId: string, result: Omit<VideoResult, 'timestamp'>) => void;
  getVideo: (taskId: string) => VideoResult | null;
  clearVideo: (taskId: string) => void;
  clearAll: () => void;
  getLatestVideo: () => VideoResult | null;
}

export const useVideoStore = create<VideoState>()(
  persist(
    (set, get): VideoState => ({
      videos: {},

      setVideo: (taskId, result) => {
        set((state) => ({
          videos: {
            ...state.videos,
            [taskId]: {
              ...result,
              taskId,
              timestamp: Date.now(),
            },
          },
        }));
      },

      getVideo: (taskId) => {
        return get().videos[taskId] || null;
      },

      clearVideo: (taskId) => {
        set((state) => {
          const { [taskId]: _, ...rest } = state.videos;
          return { videos: rest };
        });
      },

      clearAll: () => {
        set({ videos: {} });
      },

      getLatestVideo: () => {
        const videos = Object.values(get().videos);
        if (videos.length === 0) return null;

        return videos.reduce((latest, current) =>
          current.timestamp > latest.timestamp ? current : latest
        );
      },
    }),
    {
      name: 'im2prompt-videos',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

export const useLatestVideo = () => useVideoStore((state) => state.getLatestVideo());
