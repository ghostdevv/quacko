import { GuildVoiceManager } from '../lib/voice';
import { ChannelType } from 'discord.js';
import { command } from 'jellycommands';

export default command({
	name: 'join',
	description: 'Join the vc',

	options: [
		{
			name: 'channel',
			type: 'Channel',
			description: 'Select the channel to join',
			channelTypes: [ChannelType.GuildVoice],
		},
	],

	global: true,
	defer: true,
	dm: false,

	run: async ({ client, interaction, props }) => {
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

		const channel_id =
			interaction.options.getChannel('channel')?.id ||
			member.voice.channelId;

		if (!channel_id) {
			return await interaction.followUp({
				content: `Please join a VC or provide the "channel" option`,
			});
		}

		await GuildVoiceManager.create_or_get(guild, channel_id);

		await interaction.followUp({
			content: `Joined <#${channel_id}> 🦆`,
		});
	},
});
