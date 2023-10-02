import { join } from 'desm';

function sound(file: string) {
	return join(import.meta.url, `./sounds/${file}`);
}

export const SOUNDS = Object.freeze({
	'better-off-quacko': sound('better-off-quacko.mp3'),
	'bruhdy-🦆': sound('bruhdy-quack.mp3'),
	'the-office': sound('the-office.mp3'),
	'🦆': sound('quack.mp3'),
});
