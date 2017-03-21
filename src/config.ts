// parse config
import * as path from 'path';

export interface Config {
	app: {
		server: string;
		appKey: string;
		appSecret: string;
	};

	// Resolved absolute path
	tokenCacheFile: string;

	user: {
		username: string;
		extension: string;
		password: string;
	};
}

let config: Config = require('../data/config.json');

config.tokenCacheFile = path.resolve(__dirname, '../data/', config.tokenCacheFile);
export default config;