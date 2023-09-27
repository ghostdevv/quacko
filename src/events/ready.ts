import { joinVoiceChannel } from '@discordjs/voice';
import { voiceChannels } from '../schema';
import { event } from 'jellycommands';

export default event({
	name: 'ready',
	run: async ({ props }, client) => {
		const vcConnections = await props.db.select().from(voiceChannels);

		for (const { channelId, guildId } of vcConnections) {
			const guild = await client.guilds.fetch(guildId);

			joinVoiceChannel({
				adapterCreator: guild.voiceAdapterCreator,
				channelId,
				guildId,
			});
		}

		console.log(client.user.tag, 'is online!');
	},
});
