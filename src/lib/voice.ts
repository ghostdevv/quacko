import {
	AudioPlayer,
	joinVoiceChannel,
	createAudioPlayer,
	NoSubscriberBehavior,
	type VoiceConnection,
	createAudioResource,
	AudioPlayerStatus,
	VoiceConnectionStatus,
} from '@discordjs/voice';
import type { Client, Guild } from 'discord.js';
import { voiceChannels } from '../schema';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { SOUNDS } from './soundboard';
import { once } from 'events';
import { log, set_insight } from './log';

const manager_map = new Map<string, GuildVoiceManager>();

export class GuildVoiceManager {
	private player: AudioPlayer;

	constructor(
		private connection: VoiceConnection,
		public readonly guild_id: string,
		public channel_id: string,
	) {
		// this.connection.on(VoiceConnectionStatus.Ready, async () => {
		// 	await this.play(SOUNDS['🦆'], true);
		// });

		this.player = createAudioPlayer({
			behaviors: {
				noSubscriber: NoSubscriberBehavior.Play,
			},
		});

		this.connection.subscribe(this.player);
	}

	get status() {
		return this.player.state.status;
	}

	async play(sound_path: string, is_system = false) {
		const resource = createAudioResource(sound_path);
		this.player.play(resource);

		if (!is_system) {
			await log({
				icon: '🔊',
				channel: 'sounds',
				event: 'Playing Sound',
				description: `Playing sound ${sound_path} in ${this.channel_id}`,
				tags: {
					state: this.player.state.status,
					channel_id: this.channel_id,
					guild_id: this.guild_id,
					sound_path: sound_path,
				},
			});
		}

		await once(this.player, AudioPlayerStatus.Idle);
	}

	async move(new_channel_id: string) {
		this.channel_id = new_channel_id;

		this.connection.rejoin({
			channelId: new_channel_id,
			selfDeaf: true,
			selfMute: false,
		});

		await db
			.update(voiceChannels)
			.set({ channelId: new_channel_id })
			.where(eq(voiceChannels.guildId, this.guild_id));
	}

	async destroy() {
		this.connection.destroy(true);
		manager_map.delete(this.guild_id);

		await log({
			icon: '👋',
			channel: 'vc',
			event: 'Left VC',
			description: `Left VC ${this.channel_id} in ${this.guild_id}`,
			tags: {
				channel_id: this.channel_id,
				guild_id: this.guild_id,
			},
		});

		await GuildVoiceManager.assert_destroyed(this.guild_id);
	}

	static async assert_destroyed(guild_id: string) {
		const manager = manager_map.get(guild_id);

		if (manager) {
			await manager.destroy();
		}

		await db
			.delete(voiceChannels)
			.where(eq(voiceChannels.guildId, guild_id));

		await log_connections();
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
				await existing_manager.move(channel_id);
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

		await log_connections();

		await log({
			icon: '🎤',
			channel: 'vc',
			event: 'Joined VC',
			description: `Joined VC with id ${channel_id} in "${guild.name}" (${guild.id})`,
			tags: {
				guild_id: guild.id,
				channel_id,
			},
		});

		const [saved] = await db
			.select()
			.from(voiceChannels)
			.where(eq(voiceChannels.guildId, guild_id))
			.limit(1);

		//? If the row exists and is not up to date, update it
		if (saved?.channelId != channel_id) {
			await manager.move(channel_id);
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

async function log_connections() {
	await set_insight('VCs', '🎤', manager_map.size);
}

//? Run every hour
setInterval(log_connections, 3_600_000);

export async function init(client: Client) {
	const vcConnections = await db.select().from(voiceChannels);

	for (const { channelId, guildId } of vcConnections) {
		const guild = await client.guilds.fetch(guildId);
		await GuildVoiceManager.create_or_get(guild, channelId);
	}

	await log_connections();
}
