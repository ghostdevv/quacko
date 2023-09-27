import { mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const voiceChannels = mysqlTable('voice_channels', {
	guildId: varchar('guild_id', { length: 32 }).notNull().primaryKey(),
	channelId: varchar('channel_id', { length: 32 }).notNull(),
});
