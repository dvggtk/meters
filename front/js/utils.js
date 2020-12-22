async function getAccount (accountNoToCheck) {
	const url = new URL('/api/v1.0/check', window.location.origin);
	const params = {account: accountNoToCheck};
	url.search = new URLSearchParams(params).toString();

	const response = await fetch(url);
	if (!response.ok) throw Error("Лицевой счет не найден");
	
	const account = await response.json();

	return account;
}

async function getMeter (accountNoToCheck, meterNoToCheck) {
	const url = new URL('/api/v1.0/check', window.location.origin);
	console.log(url);
	const params = {account: accountNoToCheck, meter: meterNoToCheck};
	url.search = new URLSearchParams(params).toString();

	const response = await fetch(url);
	if (!response.ok) throw Error("Счетчик не найден");
	
	const meter = await response.json();

	return meter;
}


async function putValue (accountNo, meterNo, reading) {
	const meter = await getMeter(accountNo, meterNo);
	if (!meter) throw Error("Не удалось передать показания");
	meter.currentReading = reading;
	return true;
}

export {getAccount, getMeter, putValue};
