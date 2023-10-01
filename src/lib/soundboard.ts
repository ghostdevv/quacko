import { join } from 'desm';

export const SOUNDS = Object.freeze({
	'better-off-quacko': join(
		import.meta.url,
		'./sounds/better-off-quacko.mp3',
	),
	'bruhdy-🦆': join(import.meta.url, './sounds/bruhdy-quack.mp3'),
	'🦆': join(import.meta.url, './sounds/quack.mp3'),
});
