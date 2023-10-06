import { ofetch, type FetchError } from 'ofetch';

const logsnag = ofetch.create({
	baseURL: 'https://api.logsnag.com/v1',
	headers: {
		Authorization: `Bearer 8b55b2d45b58f38afc0f745dfe0c6581`,
	},
});

export async function set_insight(title: string, icon: string, value: number) {
	await logsnag('/insight', {
		method: 'POST',
		body: {
			project: 'quacko',
			value,
			title,
			icon,
		},
	});
}

export interface LogOptions {
	event: string;
	channel: string;
	description: string;
	icon: string;
	tags?: Record<string, string>;
}

export async function log(options: LogOptions) {
	console.log(
		`[${options.channel}] [${options.event}] ${options.icon} - ${options.description}`,
	);

	await logsnag('/log', {
		method: 'POST',
		body: {
			...options,
			parser: 'markdown',
			project: 'quacko',
		},
	});
}
