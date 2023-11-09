import { GuildVoiceManager } from '../lib/voice';
import { SOUNDS } from '../lib/soundboard';
import { event } from 'jellycommands';
import { log } from '../lib/log';

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

		if (
			//? Check if the old channel is not the office
			oldState.channelId != OFFICE_VOICE_CHANNEL_ID &&
			//? Check if the channel is the office
			newState.channel?.id == OFFICE_VOICE_CHANNEL_ID
		) {
			if (
				//? Check if the channel was previously empty
				newState.channel.members.size == 1 &&
				//? Don't do a "The office" if it's just quacko
				newState.channel.members.first()?.id != client.user?.id
			) {
				//? Store the previous channel id Quacko was in, if any
				const quacko_previous_vc_id = GuildVoiceManager.get(
					newState.guild.id,
				)?.channel_id;

				//? Create/get the manager
				const manager = await GuildVoiceManager.create_or_get(
					newState.guild,
					newState.channel.id,
				);

				await log({
					icon: '🏢',
					channel: 'vc',
					event: 'The Office',
					description: 'Doing a "The Office"',
					tags: {
						trigger_user_id: `${newState.member?.id}`,
						size: `${newState.channel.members.size}`,
					},
				});

				//? Play the office
				await manager.play(SOUNDS['the-office']);

				//? If there was a previous vc move back
				if (quacko_previous_vc_id) {
					await manager.move(quacko_previous_vc_id);
				}
			}
		}

		// if (
		// 	//? Check if a channel move/join has occured
		// 	oldState.channelId != newState.channelId &&
		// 	//? Check if it's GHOST
		// 	newState.member?.id == '282839711834177537' &&
		// 	//? Check there is a current channel
		// 	newState.channel?.id
		// ) {
		// 	const manager = GuildVoiceManager.get(newState.guild.id);

		// 	if (manager) {
		// 		const old_channel_id = manager?.channel_id;

		// 		await manager.move(newState.channel.id);

		// 		await log({
		// 			icon: '👻',
		// 			channel: 'vc',
		// 			event: 'Follow GHOST',
		// 			description: 'Moved to follow GHOST',
		// 			tags: {
		// 				channel_id: newState.channel.id,
		// 				guild_id: newState.guild.id,
		// 				old_channel_id,
		// 			},
		// 		});
		// 	}
		// }
	},
});
