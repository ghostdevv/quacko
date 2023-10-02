import { GuildVoiceManager } from '../lib/voice';
import { SOUNDS } from '../lib/soundboard';
import { command } from 'jellycommands';

export default command({
	name: 'soundboard',
	description: 'Play a sound through Quacko',

	options: [
		{
			name: 'sound',
			description: 'Sound to play',
			type: 'String',
			required: true,
			choices: Object.keys(SOUNDS).map((sound) => ({
				name: sound,
				value: sound,
			})),
		},
	],

	global: true,
	defer: true,
	dm: false,

	async run({ interaction, client }) {
		const guild = await client.guilds.fetch(interaction.guildId!);

		if (!guild) {
			return await interaction.followUp({
				content: 'Join can be only ran in a guild',
			});
		}

		const member = await guild.members.fetch(interaction.user.id);

		if (!member) {
			return await interaction.followUp({
				content: 'Unable to find you',
			});
		}

		if (!member.voice.channel?.id) {
			return await interaction.followUp({
				content: 'Please join a VC',
			});
		}

		const manager = GuildVoiceManager.get(guild.id);

		if (!manager) {
			return await interaction.followUp({
				content: "I'm not in a VC",
			});
		}

		if (manager.channel_id != member.voice.channelId) {
			return await interaction.followUp({
				content: 'You must be in the same VC as me',
			});
		}

		const sound = interaction.options.getString(
			'sound',
			true,
		) as keyof typeof SOUNDS;

		const result = await manager.play(SOUNDS[sound]);

		interaction.followUp({
			content:
				result == 'busy'
					? 'Already playing a sound'
					: `Playing "${sound}" in <#${manager.channel_id}>`,
		});
	},
});
