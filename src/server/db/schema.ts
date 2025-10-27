import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified')
    .$defaultFn(() => false)
    .notNull(),
  image: text('image'),
  createdAt: timestamp('created_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text('role'),
  banned: boolean('banned'),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  impersonatedBy: text('impersonated_by'),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()),
});

export const file = pgTable('file', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  width: integer('width'),
  height: integer('height'),
  r2Key: text('r2_key').notNull(),
  thumbnailKey: text('thumbnail_key'),
  uploadUserId: text('upload_user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const payment = pgTable('payment', {
  id: text('id').primaryKey(),
  provider: text('provider', { enum: ['stripe', 'creem'] })
    .notNull()
    .default('stripe'),
  priceId: text('price_id').notNull(),
  productId: text('product_id'),
  type: text('type').notNull(),
  interval: text('interval'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  customerId: text('customer_id').notNull(),
  subscriptionId: text('subscription_id'),
  status: text('status').notNull(),
  periodStart: timestamp('period_start'),
  periodEnd: timestamp('period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end'),
  trialStart: timestamp('trial_start'),
  trialEnd: timestamp('trial_end'),
  createdAt: timestamp('created_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const paymentEvent = pgTable('payment_event', {
  id: text('id').primaryKey(),
  paymentId: text('payment_id')
    .notNull()
    .references(() => payment.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(),
  stripeEventId: text('stripe_event_id').unique(),
  creemEventId: text('creem_event_id').unique(),
  eventData: text('event_data'), // JSON string
  createdAt: timestamp('created_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Credit system tables
export const userCredits = pgTable('user_credits', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  balance: integer('balance').notNull().default(0),
  totalEarned: integer('total_earned').notNull().default(0),
  totalSpent: integer('total_spent').notNull().default(0),
  frozenBalance: integer('frozen_balance').notNull().default(0),
  createdAt: timestamp('created_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const creditTransactions = pgTable(
  'credit_transactions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: text('type', {
      enum: ['earn', 'spend', 'refund', 'admin_adjust', 'freeze', 'unfreeze'],
    }).notNull(),
    amount: integer('amount').notNull(),
    balanceAfter: integer('balance_after').notNull(),
    source: text('source', {
      enum: ['subscription', 'api_call', 'admin', 'storage', 'bonus'],
    }).notNull(),
    description: text('description'),
    referenceId: text('reference_id'),
    metadata: text('metadata'), // JSON string
    createdAt: timestamp('created_at')
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => ({
    // Ensure idempotency: prevent duplicate non-null referenceId per user
    userReferenceUnique: {
      name: 'credit_user_reference_unique',
      columns: [table.userId, table.referenceId],
      unique: true,
    },
  })
);

export const userQuotaUsage = pgTable(
  'user_quota_usage',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    service: text('service', {
      enum: [
        'api_call',
        'storage',
        'custom',
        'image_generation',
        'video_generation',
        'image_extraction',
      ],
    }).notNull(),
    period: text('period').notNull(), // Format: YYYY-MM
    usedAmount: integer('used_amount').notNull().default(0),
    createdAt: timestamp('created_at')
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: timestamp('updated_at')
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => ({
    // Composite unique index for user, service, and period
    userServicePeriodIdx: {
      name: 'user_service_period_idx',
      columns: [table.userId, table.service, table.period],
      unique: true,
    },
  })
);

export const apiKey = pgTable('api_key', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  hashedKey: text('hashed_key').notNull().unique(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at'),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Prompts table for image-to-prompt feature
export const prompts = pgTable('prompts', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  promptText: text('prompt_text').notNull(),
  negativePrompt: text('negative_prompt'),
  modelStyle: text('model_style', {
    enum: ['general', 'midjourney', 'nanoBanana', 'flux', 'sora2', 'veo3'],
  }).notNull(),
  s3KeyOriginal: text('s3_key_original'), // Original uploaded image
  s3KeyRender: text('s3_key_render'), // Generated render if any
  creditsSpent: integer('credits_spent').notNull().default(0),
  metadata: text('metadata'), // JSON string for additional data
  tags: text('tags').array(), // Array of tags for search
  createdAt: timestamp('created_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Usage tracking for free tier limits (daily tracking)
export const usageTracking = pgTable(
  'usage_tracking',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    date: text('date').notNull(), // Format: YYYY-MM-DD
    imageToTextCount: integer('image_to_text_count').notNull().default(0),
    imageGenerationCount: integer('image_generation_count').notNull().default(0),
    videoGenerationCount: integer('video_generation_count').notNull().default(0),
    creditsUsedDaily: integer('credits_used_daily').notNull().default(0), // Credits used today
    creditsUsedMonthly: integer('credits_used_monthly').notNull().default(0), // Credits used this month (cumulative)
    createdAt: timestamp('created_at')
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: timestamp('updated_at')
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => ({
    userDateIdx: {
      name: 'usage_user_date_idx',
      columns: [table.userId, table.date],
      unique: true,
    },
  })
);

// Monthly usage tracking for free tier limits
export const monthlyUsageTracking = pgTable(
  'monthly_usage_tracking',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    month: text('month').notNull(), // Format: YYYY-MM
    imageToTextCount: integer('image_to_text_count').notNull().default(0),
    imageGenerationCount: integer('image_generation_count').notNull().default(0),
    videoGenerationCount: integer('video_generation_count').notNull().default(0),
    createdAt: timestamp('created_at')
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: timestamp('updated_at')
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => ({
    userMonthIdx: {
      name: 'monthly_usage_user_month_idx',
      columns: [table.userId, table.month],
      unique: true,
    },
  })
);

export const publicContent = pgTable(
  'public_content',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    contentType: text('content_type', {
      enum: ['image', 'video'],
    }).notNull(),
    promptText: text('prompt_text').notNull(),
    negativePrompt: text('negative_prompt'),
    modelStyle: text('model_style', {
      enum: ['general', 'midjourney', 'nanoBanana', 'flux', 'sora2', 'veo3'],
    }).notNull(),
    cloudinaryPublicId: text('cloudinary_public_id').notNull(),
    cloudinaryUrl: text('cloudinary_url').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    visibilityStatus: text('visibility_status', {
      enum: ['pending', 'approved', 'rejected', 'flagged', 'removed'],
    })
      .notNull()
      .default('pending'),
    creditAwarded: boolean('credit_awarded').notNull().default(false),
    creditTransactionId: text('credit_transaction_id').references(() => creditTransactions.id),
    moderationNotes: text('moderation_notes'),
    moderatedBy: text('moderated_by').references(() => user.id),
    moderatedAt: timestamp('moderated_at'),
    flagCount: integer('flag_count').notNull().default(0),
    viewCount: integer('view_count').notNull().default(0),
    likeCount: integer('like_count').notNull().default(0),
    metadata: text('metadata'),
    tags: text('tags').array(),
    createdAt: timestamp('created_at')
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp('updated_at')
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: { name: 'public_content_user_id_idx', columns: [table.userId] },
    statusIdx: { name: 'public_content_status_idx', columns: [table.visibilityStatus] },
    createdAtIdx: { name: 'public_content_created_at_idx', columns: [table.createdAt] },
  })
);

export const userContentHistory = pgTable(
  'user_content_history',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    contentType: text('content_type', {
      enum: ['image_to_prompt', 'image_generation', 'video_generation'],
    }).notNull(),
    promptText: text('prompt_text').notNull(),
    negativePrompt: text('negative_prompt'),
    modelStyle: text('model_style'),
    cloudinaryPublicId: text('cloudinary_public_id'),
    cloudinaryUrl: text('cloudinary_url'),
    thumbnailUrl: text('thumbnail_url'),
    creditsSpent: integer('credits_spent').notNull().default(0),
    generationParams: text('generation_params'),
    status: text('status', {
      enum: ['processing', 'completed', 'failed', 'expired'],
    })
      .notNull()
      .default('completed'),
    errorMessage: text('error_message'),
    expiresAt: timestamp('expires_at'),
    isPublic: boolean('is_public').notNull().default(false),
    publicContentId: text('public_content_id').references(() => publicContent.id),
    metadata: text('metadata'),
    createdAt: timestamp('created_at')
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp('updated_at')
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: { name: 'history_user_id_idx', columns: [table.userId] },
    expiresAtIdx: { name: 'history_expires_at_idx', columns: [table.expiresAt] },
    createdAtIdx: { name: 'history_created_at_idx', columns: [table.createdAt] },
    statusIdx: { name: 'history_status_idx', columns: [table.status] },
  })
);

export const contentFlags = pgTable(
  'content_flags',
  {
    id: text('id').primaryKey(),
    contentId: text('content_id')
      .notNull()
      .references(() => publicContent.id, { onDelete: 'cascade' }),
    reportedBy: text('reported_by')
      .notNull()
      .references(() => user.id),
    reason: text('reason', {
      enum: ['inappropriate', 'copyright', 'spam', 'misleading', 'other'],
    }).notNull(),
    description: text('description'),
    status: text('status', {
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    })
      .notNull()
      .default('pending'),
    reviewedBy: text('reviewed_by').references(() => user.id),
    reviewedAt: timestamp('reviewed_at'),
    reviewNotes: text('review_notes'),
    createdAt: timestamp('created_at')
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    contentIdIdx: { name: 'flags_content_id_idx', columns: [table.contentId] },
    statusIdx: { name: 'flags_status_idx', columns: [table.status] },
    reportedByIdx: { name: 'flags_reported_by_idx', columns: [table.reportedBy] },
  })
);

export const systemConfig = pgTable(
  'system_config',
  {
    id: text('id').primaryKey(),
    category: text('category', {
      enum: ['credits', 'storage', 'moderation', 'features'],
    }).notNull(),
    key: text('key').notNull(),
    value: text('value').notNull(),
    valueType: text('value_type', {
      enum: ['string', 'number', 'boolean', 'json'],
    }).notNull(),
    description: text('description'),
    isEditable: boolean('is_editable').notNull().default(true),
    updatedBy: text('updated_by').references(() => user.id),
    createdAt: timestamp('created_at')
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp('updated_at')
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    categoryKeyIdx: {
      name: 'config_category_key_idx',
      columns: [table.category, table.key],
      unique: true,
    },
  })
);

export const moderationLogs = pgTable(
  'moderation_logs',
  {
    id: text('id').primaryKey(),
    contentId: text('content_id').references(() => publicContent.id),
    moderatorId: text('moderator_id')
      .notNull()
      .references(() => user.id),
    action: text('action', {
      enum: ['approve', 'reject', 'flag', 'unflag', 'remove'],
    }).notNull(),
    previousStatus: text('previous_status'),
    newStatus: text('new_status'),
    reason: text('reason'),
    notes: text('notes'),
    metadata: text('metadata'),
    createdAt: timestamp('created_at')
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    contentIdIdx: { name: 'moderation_content_id_idx', columns: [table.contentId] },
    moderatorIdIdx: { name: 'moderation_moderator_id_idx', columns: [table.moderatorId] },
    createdAtIdx: { name: 'moderation_created_at_idx', columns: [table.createdAt] },
  })
);
// Force rebuild
