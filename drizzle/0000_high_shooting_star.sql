CREATE TABLE `lifestyle_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`log_date` text NOT NULL,
	`sleep_hours` real,
	`exercise_minutes` integer,
	`diet_quality` text,
	`stress_level` text,
	`smoking` integer,
	`alcohol_drinks` integer,
	`notes` text,
	`healthy_eating` integer,
	`no_smoking` integer,
	`no_alcohol` integer,
	`exercise` integer,
	`good_sleep` integer,
	`loose_underwear` integer,
	`daily_points` integer,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `onboarding_data` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`age` integer,
	`diet_quality` text,
	`sleep_hours` real,
	`exercise_frequency` text,
	`smoking` integer,
	`alcohol_consumption` text,
	`stress_level` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`recommendation_type` text,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`priority` text,
	`status` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `share_links` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer,
	`revoked` integer DEFAULT false NOT NULL,
	`access_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`last_accessed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `share_links_token_unique` ON `share_links` (`token`);--> statement-breakpoint
CREATE TABLE `sperm_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`report_date` text NOT NULL,
	`concentration` real,
	`motility` real,
	`progressive_motility` real,
	`morphology` real,
	`volume` real,
	`ph` real,
	`dfi` real,
	`base_score` integer,
	`adjusted_score` integer,
	`pdf_url` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `user_profile` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`age` integer,
	`height_feet` integer,
	`height_inches` integer,
	`weight` integer,
	`profile_photo` text,
	`lifestyle_data` text,
	`fertility_goal` text,
	`sperm_value` integer,
	`onboarding_completed` integer DEFAULT false NOT NULL,
	`sperm_level` integer DEFAULT 1 NOT NULL,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`longest_streak` integer DEFAULT 0 NOT NULL,
	`badges` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_profile_user_id_unique` ON `user_profile` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`timezone` text DEFAULT 'America/Los_Angeles' NOT NULL,
	`language` text DEFAULT 'en' NOT NULL,
	`theme` text DEFAULT 'dark' NOT NULL,
	`email_notifications` integer DEFAULT true NOT NULL,
	`push_notifications` integer DEFAULT true NOT NULL,
	`weekly_reports` integer DEFAULT true NOT NULL,
	`recommendations_notifications` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
