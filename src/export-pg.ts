import RingCentral from 'ringcentral-ts';
import FileTokenStore from 'ringcentral-ts/FileTokenStore';
import * as pg from 'pg';
import config from './config';

main();

async function main() {
	let rc = new RingCentral(config.app);
	await rc.restoreToken(config.user, new FileTokenStore(config.tokenCacheFile)).catch(e => {
		return rc.auth(config.user);
	});

	let pgPool = new pg.Pool(config.pg);
	pgPool.connect((err, pgClient, done) => {
		if (err) {
			return console.error('Error fetching client from conneciton pool', err);
		}
		console.log('Connected to PG');
		done();
	});
	pgPool.on('error', e => {
		console.error('PG database error', e);
	});
}