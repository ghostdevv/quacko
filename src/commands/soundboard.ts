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

		const manager = GuildVoiceManager.get(guild.id);

		if (!manager) {
			return await interaction.followUp({
				content: 'Not in a VC',
			});
		}

		const sound = interaction.options.getString(
			'sound',
			true,
		) as keyof typeof SOUNDS;

		const result = manager.play(SOUNDS[sound]);

		interaction.followUp({
			content:
				result == 'busy'
					? 'Already playing a sound'
					: `Playing "${sound}" in <#${manager.channel_id}>`,
		});
	},
});
