import { joinVoiceChannel } from '@discordjs/voice';
import { voiceChannels } from '../schema';
import { command } from 'jellycommands';

export default command({
	name: 'join',
	description: 'Join the vc',

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

		if (!member.voice.channel || !member.voice.channelId) {
			return await interaction.followUp({
				content: 'Please join a VC',
			});
		}

		await props.db.insert(voiceChannels).values({
			guildId: guild.id,
			channelId: member.voice.channelId,
		});

		joinVoiceChannel({
			adapterCreator: guild.voiceAdapterCreator,
			channelId: member.voice.channelId,
			guildId: guild.id,
		});

		await interaction.followUp({
			content: `Joined ${member.voice.channel} 🦆`,
		});
	},
});
