import 'dotenv/config';
import { IntentsBitField, ActivityType } from 'discord.js';
import { JellyCommands } from 'jellycommands';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const poolConnection = mysql.createPool({
	host: process.env['DB_HOST'],
	user: process.env['DB_USER'],
	database: process.env['DB_NAME'],
	password: process.env['DB_PASSWORD'],
});

const db = drizzle(poolConnection);

const client = new JellyCommands({
	// https://jellycommands.dev/guide/commands/loading
	commands: 'src/commands',

	// https://jellycommands.dev/guide/events/loading
	events: 'src/events',

	// https://jellycommands.dev/guide/buttons/loading
	buttons: 'src/buttons',

	clientOptions: {
		intents: [
			IntentsBitField.Flags.Guilds,
			IntentsBitField.Flags.GuildVoiceStates,
		],

		presence: {
			activities: [{ name: '🦆 Quacking?', type: ActivityType.Custom }],
		},
	},

	props: {
		db,
	},

	dev: {
		// In testing we should enable this, it will make all our commands register in our testing guild
		// https://jellycommands.dev/guide/commands/dev#global-dev-mode
		global: true,

		// Put your testing guild id here
		// https://jellycommands.dev/guide/commands/dev#setup
		guilds: ['663140687591768074', '556344107383914547'],
	},
});

// Automatically reads the DISCORD_TOKEN environment variable
client.login();
