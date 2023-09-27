ALTER TABLE `voice_channels` MODIFY COLUMN `channel_id` varchar(32) NOT NULL;--> statement-breakpoint
ALTER TABLE `voice_channels` MODIFY COLUMN `guild_id` varchar(32) NOT NULL;--> statement-breakpoint
ALTER TABLE `voice_channels` ADD PRIMARY KEY(`guild_id`);