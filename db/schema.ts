import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// User table - synced with Clerk
export const user = sqliteTable("user", {
  id: text("id").primaryKey(), // Clerk user ID
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const userSettings = sqliteTable('user_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  timezone: text('timezone').notNull().default('America/Los_Angeles'),
  language: text('language').notNull().default('en'),
  theme: text('theme').notNull().default('dark'),
  emailNotifications: integer('email_notifications', { mode: 'boolean' }).notNull().default(true),
  pushNotifications: integer('push_notifications', { mode: 'boolean' }).notNull().default(true),
  weeklyReports: integer('weekly_reports', { mode: 'boolean' }).notNull().default(true),
  recommendationsNotifications: integer('recommendations_notifications', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const shareLinks = sqliteTable('share_links', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').unique().notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  revoked: integer('revoked', { mode: 'boolean' }).notNull().default(false),
  accessCount: integer('access_count').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  lastAccessedAt: integer('last_accessed_at', { mode: 'timestamp' }),
});

// Application tables
export const onboardingData = sqliteTable('onboarding_data', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  age: integer('age'),
  dietQuality: text('diet_quality'),
  sleepHours: real('sleep_hours'),
  exerciseFrequency: text('exercise_frequency'),
  smoking: integer('smoking', { mode: 'boolean' }),
  alcoholConsumption: text('alcohol_consumption'),
  stressLevel: text('stress_level'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const spermReports = sqliteTable('sperm_reports', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  reportDate: text('report_date').notNull(),
  concentration: real('concentration'),
  motility: real('motility'),
  progressiveMotility: real('progressive_motility'),
  morphology: real('morphology'),
  volume: real('volume'),
  ph: real('ph'),
  dfi: real('dfi'),
  baseScore: integer('base_score'),
  adjustedScore: integer('adjusted_score'),
  pdfUrl: text('pdf_url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const lifestyleLogs = sqliteTable('lifestyle_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  logDate: text('log_date').notNull(),
  sleepHours: real('sleep_hours'),
  exerciseMinutes: integer('exercise_minutes'),
  dietQuality: text('diet_quality'),
  stressLevel: text('stress_level'),
  smoking: integer('smoking', { mode: 'boolean' }),
  alcoholDrinks: integer('alcohol_drinks'),
  notes: text('notes'),
  // Simplified quick check fields
  healthyEating: integer('healthy_eating', { mode: 'boolean' }),
  noSmoking: integer('no_smoking', { mode: 'boolean' }),
  noAlcohol: integer('no_alcohol', { mode: 'boolean' }),
  exercise: integer('exercise', { mode: 'boolean' }),
  goodSleep: integer('good_sleep', { mode: 'boolean' }),
  looseUnderwear: integer('loose_underwear', { mode: 'boolean' }),
  dailyPoints: integer('daily_points'),
  createdAt: text('created_at').notNull(),
});

export const recommendations = sqliteTable('recommendations', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  recommendationType: text('recommendation_type'),
  title: text('title').notNull(),
  description: text('description').notNull(),
  priority: text('priority'),
  status: text('status'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});