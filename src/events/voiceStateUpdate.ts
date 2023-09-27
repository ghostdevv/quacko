import { voiceChannels } from '../schema';
import { event } from 'jellycommands';
import { eq } from 'drizzle-orm';

export default event({
	name: 'voiceStateUpdate',

	async run({ client, props }, oldState, newState) {
		//? Check if the user is Quacko
		if (newState.member && newState.member.id == client.user?.id) {
			//? Handle voice state changes

			if (newState.member.voice.channelId) {
				//? Update the channel id to be the new one
				await props.db
					.update(voiceChannels)
					.set({ channelId: newState.member.voice.channelId! })
					.where(eq(voiceChannels.guildId, newState.guild.id));
			} else {
				//? Delete the voice state from the db
				await props.db
					.delete(voiceChannels)
					.where(eq(voiceChannels.guildId, newState.guild.id));
			}
		}
	},
});
