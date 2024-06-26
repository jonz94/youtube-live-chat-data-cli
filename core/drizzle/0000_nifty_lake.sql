CREATE TABLE `raw_live_chat_sponsorships_gift_purchase_announcement` (
	`id` text PRIMARY KEY NOT NULL,
	`video_id` text NOT NULL,
	`user_id` text NOT NULL,
	`timestamp_usec` text NOT NULL,
	`video_offset_time_msec` text NOT NULL,
	`header_primary_text` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `raw_live_chat_sponsorships_gift_redemption_announcement` (
	`id` text PRIMARY KEY NOT NULL,
	`video_id` text NOT NULL,
	`user_id` text NOT NULL,
	`timestamp_usec` text NOT NULL,
	`video_offset_time_msec` text NOT NULL,
	`json_message` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `raw_membership_item` (
	`id` text PRIMARY KEY NOT NULL,
	`video_id` text NOT NULL,
	`user_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`video_offset_time_msec` text NOT NULL,
	`header_primary_text` text NOT NULL,
	`header_subtext` text NOT NULL,
	`json_message` blob NOT NULL
);
--> statement-breakpoint
CREATE TABLE `raw_paid_message` (
	`id` text PRIMARY KEY NOT NULL,
	`video_id` text NOT NULL,
	`user_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`video_offset_time_msec` text NOT NULL,
	`header_background_color` integer NOT NULL,
	`header_text_color` integer NOT NULL,
	`body_background_color` integer NOT NULL,
	`body_text_color` integer NOT NULL,
	`purchase_amount` text NOT NULL,
	`json_message` blob NOT NULL
);
--> statement-breakpoint
CREATE TABLE `raw_paid_sticker` (
	`id` text PRIMARY KEY NOT NULL,
	`video_id` text NOT NULL,
	`user_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`video_offset_time_msec` text NOT NULL,
	`money_chip_background_color` integer NOT NULL,
	`money_chip_text_color` integer NOT NULL,
	`background_color` integer NOT NULL,
	`author_name_text_color` integer NOT NULL,
	`purchase_amount` text NOT NULL,
	`json_sticker` blob NOT NULL
);
--> statement-breakpoint
CREATE TABLE `raw_text_message` (
	`id` text PRIMARY KEY NOT NULL,
	`video_id` text NOT NULL,
	`user_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`video_offset_time_msec` text NOT NULL,
	`json_message` blob NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`start_timestamp` text,
	`end_timestamp` text,
	`duration` integer
);
