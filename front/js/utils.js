import accounts from './data';

async function getAccount (accountNo) {
	const accountsFiltered = accounts.filter(
		account => {
			return parseInt(account.accountNo) === parseInt(accountNo)
		}
	);
	
	await new Promise( resolve => setTimeout(resolve, 500 + Math.floor(Math.random() * 500)) );
	
	if (accountsFiltered.length !== 1) throw Error("Лицевой счет не найден");
	
	return accountsFiltered[0];
}

async function putValue ({accountNo, number, value}) {
	const account = await getAccount(accountNo);
	const meter = account.meters.find(meter => parseInt(meter.number) === parseInt(number));
	if (!meter) throw Error("Не удалось передать показания");
	meter.currentValue = value;
	return true;
}

export {getAccount, putValue};
