import { resolvePlanByIdentifier } from '@/lib/creem/plan-utils';
import { configRepository } from '@/server/db/repositories/config-repository';
import {
  type CreateHistoryData,
  type HistoryFilters,
  contentRepository,
} from '@/server/db/repositories/content-repository';
import { paymentRepository } from '@/server/db/repositories/payment-repository';

export interface GetHistoryParams {
  userId: string;
  contentType?: 'image_to_prompt' | 'image_generation' | 'video_generation';
  status?: 'processing' | 'completed' | 'failed' | 'expired';
  page?: number;
  limit?: number;
}

export interface HistoryListResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class HistoryService {
  async getUserTier(userId: string): Promise<'free' | 'pro' | 'proplus'> {
    const subscription = await paymentRepository.findActiveSubscriptionByUserId(userId);

    if (!subscription) return 'free';

    const resolved = resolvePlanByIdentifier(
      subscription.priceId,
      subscription.interval || undefined
    );
    const plan = resolved?.plan;

    return (plan?.id as 'free' | 'pro' | 'proplus') || 'free';
  }

  async calculateExpirationDate(userId: string): Promise<Date> {
    const tier = await this.getUserTier(userId);
    const retentionDays = await configRepository.getRetentionDays(tier);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + retentionDays);

    return expiresAt;
  }

  async createHistory(data: CreateHistoryData) {
    const expiresAt = await this.calculateExpirationDate(data.userId);

    return await contentRepository.createHistory({
      ...data,
      expiresAt,
    });
  }

  async getHistory(params: GetHistoryParams): Promise<HistoryListResponse> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    const filters: HistoryFilters = {
      userId: params.userId,
      contentType: params.contentType,
      status: params.status,
      limit,
      offset,
    };

    const [data, total] = await Promise.all([
      contentRepository.findHistoryByUserId(filters),
      contentRepository.countHistoryByUserId({
        userId: params.userId,
        contentType: params.contentType,
        status: params.status,
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getHistoryById(id: string, userId: string) {
    const history = await contentRepository.findHistoryById(id);

    if (!history) {
      throw new Error('History not found');
    }

    if (history.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return history;
  }

  async deleteHistory(id: string, userId: string): Promise<boolean> {
    const history = await this.getHistoryById(id, userId);

    if (!history) {
      throw new Error('History not found');
    }

    return await contentRepository.deleteHistory(id);
  }

  async markAsExpired(historyIds: string[]): Promise<void> {
    await contentRepository.markHistoryAsExpired(historyIds);
  }

  async findExpiredHistory(): Promise<any[]> {
    return await contentRepository.findExpiredHistory(new Date());
  }

  async updateHistoryStatus(
    id: string,
    userId: string,
    status: 'processing' | 'completed' | 'failed' | 'expired',
    errorMessage?: string
  ) {
    const history = await this.getHistoryById(id, userId);

    if (!history) {
      throw new Error('History not found');
    }

    return await contentRepository.updateHistory(id, {
      status,
      errorMessage,
    });
  }

  async updateHistoryWithResult(
    id: string,
    userId: string,
    cloudinaryUrl: string,
    cloudinaryPublicId: string,
    thumbnailUrl?: string
  ) {
    const history = await this.getHistoryById(id, userId);

    if (!history) {
      throw new Error('History not found');
    }

    return await contentRepository.updateHistory(id, {
      cloudinaryUrl,
      cloudinaryPublicId,
      thumbnailUrl,
      status: 'completed',
    });
  }

  async isHistoryFeatureEnabled(): Promise<boolean> {
    return await configRepository.isFeatureEnabled('user_history');
  }
}

export const historyService = new HistoryService();
