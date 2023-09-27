import type { Config } from 'drizzle-kit';
import 'dotenv/config';

export default <Config>{
	schema: './src/schema.ts',
	out: './drizzle',
	driver: 'mysql2',
	dbCredentials: {
		host: process.env['DB_HOST'],
		user: process.env['DB_USER'],
		database: process.env['DB_NAME'],
		password: process.env['DB_PASSWORD'],
	},
};
