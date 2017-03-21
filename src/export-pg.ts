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
	pgPool.on('error', e => {
		console.error('PG database error', e);
	});
	let dateFrom = new Date();
	dateFrom.setFullYear(2015);
	let callLogs = await rc.account().callLog().list({ view: 'Simple', dateFrom: dateFrom.toISOString() });
	for (let callLog of callLogs.records) {
		await insertObject(pgPool, 'rc_call_log', {
			id: callLog.id,
			sessionId: callLog.sessionId,
			startTime: callLog.startTime,
			duration: callLog.duration,
			direction: callLog.direction,
			action: callLog.action,
			result: callLog.result,
			toNumber: callLog.to && callLog.to.phoneNumber,
			fromNumber: callLog.from && callLog.from.phoneNumber
		});
	}
	pgPool.end();
	console.log('Done.');
}

async function insertObject(pgPool, tableName, record) {
	let fldNames = [];
	let valueHolders = [];
	let values = [];
	for (let p in record) {
		fldNames.push(p);
		valueHolders.push('$' + fldNames.length);
		values.push(record[p]);
	}
	let sqlText = `insert into ${tableName}(${fldNames.join(',')}) values(${valueHolders.join(',')})`;
	try {
		return await pgPool.query(sqlText, values);
	} catch (e) {
		console.error('Insert error', e);
	}
}