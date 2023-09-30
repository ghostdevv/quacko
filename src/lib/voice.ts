import {
	AudioPlayer,
	joinVoiceChannel,
	createAudioPlayer,
	NoSubscriberBehavior,
	type AudioResource,
	type VoiceConnection,
	createAudioResource,
} from '@discordjs/voice';
import type { Client, Guild } from 'discord.js';
import { voiceChannels } from '../schema';
import { eq } from 'drizzle-orm';
import { db } from './db';

const manager_map = new Map<string, GuildVoiceManager>();

export class GuildVoiceManager {
	private player: AudioPlayer;

	constructor(
		private connection: VoiceConnection,
		public readonly guild_id: string,
		public channel_id: string,
	) {
		this.player = createAudioPlayer({
			behaviors: {
				noSubscriber: NoSubscriberBehavior.Play,
			},
		});

		this.connection.subscribe(this.player);
	}

	async play(sound_path: string) {
		const resource = createAudioResource(sound_path);
		this.player.play(resource);
	}

	async set_moved(new_channel_id: string) {
		this.channel_id = new_channel_id;

		await db
			.update(voiceChannels)
			.set({ channelId: new_channel_id })
			.where(eq(voiceChannels.guildId, this.guild_id));
	}

	async destroy() {
		this.connection.destroy(true);
		manager_map.delete(this.guild_id);

		await db
			.delete(voiceChannels)
			.where(eq(voiceChannels.guildId, this.guild_id));
	}

	static async assert_destroyed(guild_id: string) {
		const manager = manager_map.get(guild_id);

		if (manager) {
			await manager.destroy();
		} else {
			await db
				.delete(voiceChannels)
				.where(eq(voiceChannels.guildId, guild_id));
		}
	}

	static get(guild_id: string) {
		return manager_map.get(guild_id);
	}

	static async create_or_get(guild: Guild, channel_id: string) {
		const guild_id = guild.id;

		const existing_manager = manager_map.get(guild_id);

		//? If there is an existing connection return it
		if (existing_manager) {
			//? If the state is out of sync, sync it
			if (existing_manager.channel_id != channel_id) {
				await existing_manager.set_moved(channel_id);
			}

			return existing_manager;
		}

		//? Join the voice channel
		const connection = joinVoiceChannel({
			adapterCreator: guild.voiceAdapterCreator,
			channelId: channel_id,
			guildId: guild_id,
			selfDeaf: true,
		});

		const manager = new GuildVoiceManager(connection, guild_id, channel_id);

		manager_map.set(guild_id, manager);

		const [saved] = await db
			.select()
			.from(voiceChannels)
			.where(eq(voiceChannels.guildId, guild_id))
			.limit(1);

		//? If the row exists and is not up to date, update it
		if (saved?.channelId != channel_id) {
			await manager.set_moved(channel_id);
		}

		//? If row doesn't exist add it
		if (!saved) {
			await db.insert(voiceChannels).values({
				channelId: channel_id,
				guildId: guild_id,
			});
		}

		return manager;
	}
}

export async function init(client: Client) {
	const vcConnections = await db.select().from(voiceChannels);

	for (const { channelId, guildId } of vcConnections) {
		const guild = await client.guilds.fetch(guildId);
		await GuildVoiceManager.create_or_get(guild, channelId);
	}
}
