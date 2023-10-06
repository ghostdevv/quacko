import { event } from 'jellycommands';
import { init } from '../lib/voice';
import { log } from '../lib/log';

export default event({
	name: 'ready',
	run: async ({}, client) => {
		await init(client);

		if (process.env['NODE_ENV'] != 'development') {
			await log({
				icon: '💚',
				event: 'online',
				channel: 'general',
				description: `(${client.user.id}) ${client.user.username} is online`,
				tags: {
					client_id: client.user.id,
					node_env: `${process.env['NODE_ENV']}`,
				},
			});

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
