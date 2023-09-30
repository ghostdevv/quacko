import { joinVoiceChannel, type VoiceConnection } from '@discordjs/voice';
import type { Client, Guild } from 'discord.js';
import { voiceChannels } from '../schema';
import { eq } from 'drizzle-orm';
import { db } from './db';

const connection_map = new Map<string, VoiceConnection>();

export async function join_vc(guild: Guild, channelId: string, save = true) {
	const guildId = guild.id;

	const connection = joinVoiceChannel({
		adapterCreator: guild.voiceAdapterCreator,
		selfDeaf: true,
		channelId,
		guildId,
	});

	connection_map.set(guildId, connection);

	if (save) {
		await db.insert(voiceChannels).values({
			channelId,
			guildId,
		});
	}
}

export async function leave_vc(guildId: string) {
	const connection = connection_map.get(guildId);

	if (connection) {
		connection.destroy(true);
		connection_map.delete(guildId);
	}

	await db.delete(voiceChannels).where(eq(voiceChannels.guildId, guildId));
}

export async function move_channel(guildId: string, newChannelId: string) {
	await db
		.update(voiceChannels)
		.set({ channelId: newChannelId })
		.where(eq(voiceChannels.guildId, guildId));
}

export async function init(client: Client) {
	const vcConnections = await db.select().from(voiceChannels);

	for (const { channelId, guildId } of vcConnections) {
		const guild = await client.guilds.fetch(guildId);
		await join_vc(guild, channelId, false);
	}
}
