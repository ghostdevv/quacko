import { event } from 'jellycommands';
import { init } from '../lib/voice';

export default event({
	name: 'ready',
	run: async ({}, client) => {
		await init(client);

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
