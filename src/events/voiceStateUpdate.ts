import { leave_vc, move_channel } from '../lib/voice';
import { event } from 'jellycommands';

export default event({
	name: 'voiceStateUpdate',

	async run({ client }, oldState, newState) {
		//? Check if the user is Quacko
		if (newState.member && newState.member.id == client.user?.id) {
			//? Handle voice state changes

			if (newState.member.voice.channelId) {
				//? Update the channel id to be the new one
				await move_channel(
					newState.guild.id,
					newState.member.voice.channelId,
				);
			} else {
				//? Delete the voice state from the db
				await leave_vc(newState.guild.id);
			}
		}
	},
});
