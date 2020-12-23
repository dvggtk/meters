async function getAccount (accountNoToCheck) {
	const url = new URL('/api/v1.0/check', window.location.origin);
	const params = {account: accountNoToCheck};
	url.search = new URLSearchParams(params).toString();

	const response = await fetch(url);
	if (!response.ok) throw Error(`Лицевой счет "${accountNoToCheck}" не найден`);
	
	const account = await response.json();

	return account;
}

async function getMeter (accountNoToCheck, meterNoToCheck) {
	const url = new URL('/api/v1.0/check', window.location.origin);
	const params = {account: accountNoToCheck, meter: meterNoToCheck};
	url.search = new URLSearchParams(params).toString();

	const response = await fetch(url);
	if (!response.ok) throw Error(`Счетчик "${meterNoToCheck}" не найден`);
	
	const meter = await response.json();

	return meter;
}

async function putReading (accountNo, meterNo, reading) {
	const meter = await getMeter(accountNo, meterNo);
	if (!meter) throw Error("Не удалось передать показания");

	const url = new URL('/api/v1.0/reading', window.location.origin);
	const params = {account: accountNo, meter: meterNo, reading};
	url.search = new URLSearchParams(params).toString();

	const response = await fetch(url, {method: 'PUT'});
	if (!response.ok) throw Error(`Ошибка при передаче показаний`);
	
	return true;
}

export {getAccount, getMeter, putReading};
