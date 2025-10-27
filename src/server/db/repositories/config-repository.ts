import db from '@/server/db';
import { systemConfig } from '@/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export type ConfigCategory = 'credits' | 'storage' | 'moderation' | 'features';
export type ConfigValueType = 'string' | 'number' | 'boolean' | 'json';

export interface CreateConfigData {
  category: ConfigCategory;
  key: string;
  value: string;
  valueType: ConfigValueType;
  description?: string;
  isEditable?: boolean;
  updatedBy?: string;
}

export interface UpdateConfigData {
  value?: string;
  description?: string;
  isEditable?: boolean;
  updatedBy?: string;
}

class ConfigRepository {
  private cache = new Map<string, { value: any; expiry: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000;

  private getCacheKey(category: ConfigCategory, key: string): string {
    return `${category}:${key}`;
  }

  private parseValue(value: string, valueType: ConfigValueType): any {
    switch (valueType) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value === 'true';
      case 'json':
        return JSON.parse(value);
      default:
        return value;
    }
  }

  async create(data: CreateConfigData) {
    const [result] = await db
      .insert(systemConfig)
      .values({
        id: uuidv4(),
        category: data.category,
        key: data.key,
        value: data.value,
        valueType: data.valueType,
        description: data.description || null,
        isEditable: data.isEditable ?? true,
        updatedBy: data.updatedBy || null,
      })
      .returning();

    if (!result) {
      throw new Error('Failed to create config');
    }

    this.cache.delete(this.getCacheKey(data.category, data.key));

    return result;
  }

  async get(category: ConfigCategory, key: string, useCache = true): Promise<any> {
    const cacheKey = this.getCacheKey(category, key);

    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        return cached.value;
      }
    }

    const result = await db
      .select()
      .from(systemConfig)
      .where(and(eq(systemConfig.category, category), eq(systemConfig.key, key)))
      .limit(1);

    if (!result[0]) {
      return null;
    }

    const parsedValue = this.parseValue(result[0].value, result[0].valueType as ConfigValueType);

    if (useCache) {
      this.cache.set(cacheKey, {
        value: parsedValue,
        expiry: Date.now() + this.CACHE_TTL,
      });
    }

    return parsedValue;
  }

  async getString(category: ConfigCategory, key: string, defaultValue = ''): Promise<string> {
    const value = await this.get(category, key);
    return value !== null ? String(value) : defaultValue;
  }

  async getNumber(category: ConfigCategory, key: string, defaultValue = 0): Promise<number> {
    const value = await this.get(category, key);
    return value !== null ? Number(value) : defaultValue;
  }

  async getBoolean(category: ConfigCategory, key: string, defaultValue = false): Promise<boolean> {
    const value = await this.get(category, key);
    return value !== null ? Boolean(value) : defaultValue;
  }

  async getJson<T = any>(
    category: ConfigCategory,
    key: string,
    defaultValue: T | null = null
  ): Promise<T | null> {
    const value = await this.get(category, key);
    return value !== null ? (value as T) : defaultValue;
  }

  async update(category: ConfigCategory, key: string, data: UpdateConfigData) {
    const [result] = await db
      .update(systemConfig)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(systemConfig.category, category), eq(systemConfig.key, key)))
      .returning();

    this.cache.delete(this.getCacheKey(category, key));

    return result || null;
  }

  async updateValue(category: ConfigCategory, key: string, value: string, updatedBy?: string) {
    return this.update(category, key, { value, updatedBy });
  }

  async delete(category: ConfigCategory, key: string): Promise<boolean> {
    const result = await db
      .delete(systemConfig)
      .where(and(eq(systemConfig.category, category), eq(systemConfig.key, key)))
      .returning();

    this.cache.delete(this.getCacheKey(category, key));

    return result.length > 0;
  }

  async findByCategory(category: ConfigCategory) {
    return await db
      .select()
      .from(systemConfig)
      .where(eq(systemConfig.category, category))
      .orderBy(systemConfig.key);
  }

  async findAll() {
    return await db.select().from(systemConfig).orderBy(systemConfig.category, systemConfig.key);
  }

  clearCache(): void {
    this.cache.clear();
  }

  async getPublicShareReward(): Promise<number> {
    return this.getNumber('credits', 'public_share_reward', 3);
  }

  async getMaxDailyShareRewards(): Promise<number> {
    return this.getNumber('credits', 'max_daily_share_rewards', 5);
  }

  async getRetentionDays(tier: 'free' | 'pro' | 'proplus'): Promise<number> {
    const key = `${tier}_tier_retention`;
    const defaults = { free: 3, pro: 7, proplus: 30 };
    return this.getNumber('storage', key, defaults[tier]);
  }

  async isFeatureEnabled(
    feature: 'public_gallery' | 'content_sharing' | 'user_history'
  ): Promise<boolean> {
    const key = `${feature}_enabled`;
    return this.getBoolean('features', key, true);
  }
}

export const configRepository = new ConfigRepository();
