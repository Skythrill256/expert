PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_profile` (
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
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_user_profile`("id", "user_id", "age", "height_feet", "height_inches", "weight", "profile_photo", "fertility_goal", "smoking", "alcohol", "exercise", "diet_quality", "sleep_hours", "stress_level", "masturbation_frequency", "sexual_activity", "supplements", "career_status", "family_pledge", "tight_clothing", "hot_baths", "onboarding_completed", "created_at", "updated_at") SELECT "id", "user_id", "age", "height_feet", "height_inches", "weight", "profile_photo", "fertility_goal", "smoking", "alcohol", "exercise", "diet_quality", "sleep_hours", "stress_level", "masturbation_frequency", "sexual_activity", "supplements", "career_status", "family_pledge", "tight_clothing", "hot_baths", "onboarding_completed", "created_at", "updated_at" FROM `user_profile`;--> statement-breakpoint
DROP TABLE `user_profile`;--> statement-breakpoint
ALTER TABLE `__new_user_profile` RENAME TO `user_profile`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `user_profile_user_id_unique` ON `user_profile` (`user_id`);