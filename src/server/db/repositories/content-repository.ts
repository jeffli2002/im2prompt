import db from '@/server/db';
import { publicContent, userContentHistory } from '@/server/db/schema';
import { and, desc, eq, gte, inArray, lte, or, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface CreateHistoryData {
  userId: string;
  contentType: 'image_to_prompt' | 'image_generation' | 'video_generation';
  promptText: string;
  negativePrompt?: string;
  modelStyle?: string;
  cloudinaryPublicId?: string;
  cloudinaryUrl?: string;
  thumbnailUrl?: string;
  creditsSpent?: number;
  generationParams?: string;
  status?: 'processing' | 'completed' | 'failed' | 'expired';
  errorMessage?: string;
  expiresAt?: Date;
  metadata?: string;
}

export interface UpdateHistoryData {
  status?: 'processing' | 'completed' | 'failed' | 'expired';
  errorMessage?: string;
  cloudinaryPublicId?: string;
  cloudinaryUrl?: string;
  thumbnailUrl?: string;
  generationParams?: string;
  expiresAt?: Date;
  isPublic?: boolean;
  publicContentId?: string;
  metadata?: string;
}

export interface HistoryFilters {
  userId: string;
  contentType?: 'image_to_prompt' | 'image_generation' | 'video_generation';
  status?: 'processing' | 'completed' | 'failed' | 'expired';
  isPublic?: boolean;
  limit?: number;
  offset?: number;
}

export class ContentRepository {
  async createHistory(data: CreateHistoryData) {
    const [result] = await db
      .insert(userContentHistory)
      .values({
        id: uuidv4(),
        userId: data.userId,
        contentType: data.contentType,
        promptText: data.promptText,
        negativePrompt: data.negativePrompt || null,
        modelStyle: data.modelStyle || null,
        cloudinaryPublicId: data.cloudinaryPublicId || null,
        cloudinaryUrl: data.cloudinaryUrl || null,
        thumbnailUrl: data.thumbnailUrl || null,
        creditsSpent: data.creditsSpent || 0,
        generationParams: data.generationParams || null,
        status: data.status || 'completed',
        errorMessage: data.errorMessage || null,
        expiresAt: data.expiresAt || null,
        metadata: data.metadata || null,
      })
      .returning();

    if (!result) {
      throw new Error('Failed to create history record');
    }

    return result;
  }

  async findHistoryById(id: string) {
    const result = await db
      .select()
      .from(userContentHistory)
      .where(eq(userContentHistory.id, id))
      .limit(1);

    return result[0] || null;
  }

  async findHistoryByUserId(filters: HistoryFilters) {
    const conditions = [eq(userContentHistory.userId, filters.userId)];

    if (filters.contentType) {
      conditions.push(eq(userContentHistory.contentType, filters.contentType));
    }

    if (filters.status) {
      conditions.push(eq(userContentHistory.status, filters.status));
    }

    if (filters.isPublic !== undefined) {
      conditions.push(eq(userContentHistory.isPublic, filters.isPublic));
    }

    const query = db
      .select()
      .from(userContentHistory)
      .where(and(...conditions))
      .orderBy(desc(userContentHistory.createdAt));

    if (filters.limit) {
      query.limit(filters.limit);
    }

    if (filters.offset) {
      query.offset(filters.offset);
    }

    return await query;
  }

  async updateHistory(id: string, data: UpdateHistoryData) {
    const [result] = await db
      .update(userContentHistory)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(userContentHistory.id, id))
      .returning();

    return result || null;
  }

  async deleteHistory(id: string): Promise<boolean> {
    const result = await db
      .delete(userContentHistory)
      .where(eq(userContentHistory.id, id))
      .returning();

    return result.length > 0;
  }

  async countHistoryByUserId(filters: Omit<HistoryFilters, 'limit' | 'offset'>): Promise<number> {
    const conditions = [eq(userContentHistory.userId, filters.userId)];

    if (filters.contentType) {
      conditions.push(eq(userContentHistory.contentType, filters.contentType));
    }

    if (filters.status) {
      conditions.push(eq(userContentHistory.status, filters.status));
    }

    if (filters.isPublic !== undefined) {
      conditions.push(eq(userContentHistory.isPublic, filters.isPublic));
    }

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(userContentHistory)
      .where(and(...conditions));

    return Number(result[0]?.count || 0);
  }

  async findExpiredHistory(beforeDate: Date) {
    return await db
      .select()
      .from(userContentHistory)
      .where(
        and(
          lte(userContentHistory.expiresAt, beforeDate),
          eq(userContentHistory.status, 'completed')
        )
      )
      .orderBy(userContentHistory.expiresAt);
  }

  async markHistoryAsExpired(ids: string[]) {
    if (ids.length === 0) return [];

    return await db
      .update(userContentHistory)
      .set({
        status: 'expired',
        updatedAt: new Date(),
      })
      .where(inArray(userContentHistory.id, ids))
      .returning();
  }
}

export const contentRepository = new ContentRepository();
