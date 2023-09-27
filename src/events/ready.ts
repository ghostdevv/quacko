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

		if (process.env['NODE_ENV'] != 'development') {
			await fetch('https://webhook.willow.sh', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify({
					$colour: '#fbe153',
					$title: 'Quacko Online',
					time: `\`${new Date().toUTCString()}\``,
				}),
			});
		}

		console.log(client.user.tag, 'is online!');
	},
});
