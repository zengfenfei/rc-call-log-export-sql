import RingCentral from 'ringcentral-ts';
import FileTokenStore from 'ringcentral-ts/FileTokenStore';
import config from './config';

main();

async function main() {
	let rc = new RingCentral(config.app);
	await rc.restoreToken(config.user, new FileTokenStore(config.tokenCacheFile)).catch(e => {
		return rc.auth(config.user);
	});
	console.log('Logged into rc.');
}