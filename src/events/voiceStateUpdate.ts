import { GuildVoiceManager } from '../lib/voice';
import { SOUNDS } from '../lib/soundboard';
import { event } from 'jellycommands';

const OFFICE_VOICE_CHANNEL_ID =
	process.env['OFFICE_VOICE_CHANNEL_ID'] ?? 'none';

export default event({
	name: 'voiceStateUpdate',

	async run({ client }, oldState, newState) {
		//? Check if the user is Quacko
		if (newState.member && newState.member.id == client.user?.id) {
			//? Handle voice state changes

			if (newState.channel) {
				//? Assert the manager
				await GuildVoiceManager.create_or_get(
					newState.guild,
					newState.channel.id,
				);
			} else {
				//? Delete the voice state from the db
				await GuildVoiceManager.assert_destroyed(newState.guild.id);
			}
		}

		//? Check if the channel is the office
		if (newState.channel?.id == OFFICE_VOICE_CHANNEL_ID) {
			//? Check if the channel was previously empty
			if (newState.channel.members.size == 1) {
				console.log('a', newState.channel.id);

				const quacko_previous_vc_id = GuildVoiceManager.get(
					newState.guild.id,
				)?.channel_id;

				const manager = await GuildVoiceManager.create_or_get(
					newState.guild,
					newState.channel.id,
				);

				await manager.play(SOUNDS['the-office']);

				if (quacko_previous_vc_id) {
					await manager.set_moved(quacko_previous_vc_id);
				}
			}
		}
	},
});
