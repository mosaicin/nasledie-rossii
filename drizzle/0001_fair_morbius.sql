CREATE TABLE `gallery_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`url` varchar(1024) NOT NULL,
	`file_key` varchar(255) NOT NULL,
	`category` varchar(64) NOT NULL DEFAULT 'context',
	`title` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gallery_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `photo_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photo_id` int NOT NULL,
	`user_id` int NOT NULL,
	`content` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `photo_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `photo_comments` ADD CONSTRAINT `photo_comments_photo_id_gallery_photos_id_fk` FOREIGN KEY (`photo_id`) REFERENCES `gallery_photos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `photo_comments` ADD CONSTRAINT `photo_comments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;