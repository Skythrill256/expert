import { sqliteTable, AnySQLiteColumn, foreignKey, text, real, integer, uniqueIndex } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

export const lifestyleLogs = sqliteTable("lifestyle_logs", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  logDate: text("log_date").notNull(),
  sleepHours: real("sleep_hours"),
  exerciseMinutes: integer("exercise_minutes"),
  dietQuality: text("diet_quality"),
  stressLevel: text("stress_level"),
  smoking: integer(),
  alcoholDrinks: integer("alcohol_drinks"),
  notes: text(),
  healthyEating: integer("healthy_eating"),
  noSmoking: integer("no_smoking"),
  noAlcohol: integer("no_alcohol"),
  exercise: integer(),
  goodSleep: integer("good_sleep"),
  looseUnderwear: integer("loose_underwear"),
  dailyPoints: integer("daily_points"),
  createdAt: text("created_at").notNull(),
});

export const onboardingData = sqliteTable("onboarding_data", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  age: integer(),
  dietQuality: text("diet_quality"),
  sleepHours: real("sleep_hours"),
  exerciseFrequency: text("exercise_frequency"),
  smoking: integer(),
  alcoholConsumption: text("alcohol_consumption"),
  stressLevel: text("stress_level"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const recommendations = sqliteTable("recommendations", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  recommendationType: text("recommendation_type"),
  title: text().notNull(),
  description: text().notNull(),
  priority: text(),
  status: text(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const shareLinks = sqliteTable("share_links", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  token: text().notNull(),
  expiresAt: integer("expires_at"),
  revoked: integer("revoked").default(0).notNull(), // ✅ fixed
  accessCount: integer("access_count").default(0).notNull(),
  createdAt: integer("created_at").notNull(),
  lastAccessedAt: integer("last_accessed_at"),
},
(table) => [
  uniqueIndex("share_links_token_unique").on(table.token),
]);

export const spermReports = sqliteTable("sperm_reports", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  reportDate: text("report_date").notNull(),
  concentration: real(),
  motility: real(),
  progressiveMotility: real("progressive_motility"),
  morphology: real(),
  volume: real(),
  ph: real(),
  dfi: real(),
  baseScore: integer("base_score"),
  adjustedScore: integer("adjusted_score"),
  pdfUrl: text("pdf_url"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const user = sqliteTable("user", {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  email: text().notNull(),
  emailVerified: integer("email_verified").notNull(), // 0/1 for false/true
  image: text(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
},
(table) => [
  uniqueIndex("user_email_unique").on(table.email),
]);

export const userSettings = sqliteTable("user_settings", {
  id: integer().primaryKey({ autoIncrement: true }).notNull(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  timezone: text().default("America/Los_Angeles").notNull(),
  language: text().default("en").notNull(),
  theme: text().default("dark").notNull(),
  emailNotifications: integer("email_notifications").default(1).notNull(), // ✅ fixed
  pushNotifications: integer("push_notifications").default(1).notNull(), // ✅ fixed
  weeklyReports: integer("weekly_reports").default(1).notNull(), // ✅ fixed
  recommendationsNotifications: integer("recommendations_notifications").default(1).notNull(), // ✅ fixed
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const userProfile = sqliteTable("user_profile", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  age: integer(),
  heightFeet: integer("height_feet"),
  heightInches: integer("height_inches"),
  weight: integer(),
  profilePhoto: text("profile_photo"),
  lifestyleData: text("lifestyle_data"),
  fertilityGoal: text("fertility_goal"),
  spermValue: integer("sperm_value"),
  onboardingCompleted: integer("onboarding_completed").default(0).notNull(), // ✅ fixed
  spermLevel: integer("sperm_level").default(1).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  badges: text(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
},
(table) => [
  uniqueIndex("user_profile_user_id_unique").on(table.userId),
]);
