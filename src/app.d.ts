/// <reference types="jellycommands/ambient" />

// See https://jellycommands.dev/guide/props.html
interface Props {
	db: import('drizzle-orm/mysql2').MySql2Database;
}
