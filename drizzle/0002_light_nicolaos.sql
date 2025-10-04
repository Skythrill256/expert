CREATE TABLE `user_profile` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`age` integer,
	`height_feet` integer,
	`height_inches` integer,
	`weight` integer,
	`profile_photo` text,
	`fertility_goal` text,
	`smoking` text,
	`alcohol` text,
	`exercise` text,
	`diet_quality` text,
	`sleep_hours` real,
	`stress_level` text,
	`masturbation_frequency` text,
	`sexual_activity` text,
	`supplements` text,
	`career_status` text,
	`family_pledge` text,
	`tight_clothing` integer DEFAULT false,
	`hot_baths` integer DEFAULT false,
	`onboarding_completed` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_profile_user_id_unique` ON `user_profile` (`user_id`);--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `onboarding_completed`;