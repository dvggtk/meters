import accounts from './data';
const accountNumbers = Object.keys(accounts);

async function getAccount (accountNoToCheck) {
	const accountsFiltered = accountNumbers.filter(
		accountNumber => {
			return parseInt(accountNumber) === parseInt(accountNoToCheck)
		}
	);
	
	await new Promise( resolve => setTimeout(resolve, 500 + Math.floor(Math.random() * 500)) );
	
	if (accountsFiltered.length !== 1) throw Error("Лицевой счет не найден");
	
	return accountsFiltered[0];
}

async function getMeter (accountNo, meterNoToCheck) {
	const account = accounts[accountNo];
	const meter = account.meters[meterNoToCheck];

	await new Promise( resolve => setTimeout(resolve, 500 + Math.floor(Math.random() * 500)) );
	
	if (!meter) throw Error("Счетчик не найден");
	
	return meter;
}


async function putValue (accountNo, meterNo, reading) {
	const meter = await getMeter(accountNo, meterNo);
	if (!meter) throw Error("Не удалось передать показания");
	meter.currentReading = reading;
	return true;
}

export {getAccount, getMeter, putValue};
