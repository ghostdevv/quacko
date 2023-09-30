import { GuildVoiceManager } from '../lib/voice';
import { event } from 'jellycommands';

export default event({
	name: 'voiceStateUpdate',

	async run({ client }, oldState, newState) {
		//? Check if the user is Quacko
		if (newState.member && newState.member.id == client.user?.id) {
			//? Handle voice state changes

			if (newState.member.voice.channelId) {
				//? Assert the manager
				await GuildVoiceManager.create_or_get(
					newState.guild,
					newState.member.voice.channelId,
				);
			} else {
				//? Delete the voice state from the db
				await GuildVoiceManager.assert_destroyed(newState.guild.id);
			}
		}
	},
});
