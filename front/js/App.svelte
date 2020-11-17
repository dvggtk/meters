<script>
	import {getAccount, putValue} from './utils';
	import Meter from './Meter.svelte';
	
	const meterTypes = ['ЭЛ', 'ГВ', 'ХВ'];
	const meterTypeNames = {
		"ЭЛ": "Электричество",
		"ГВ": "Горячая вода",
		"ХВ": "Холодная вода"		
	}
	let currentMeterType = meterTypes[0];
	let accountToCheck = "";
	let accountPromise;
	let account;
	
	async function transmitHandler ({accountNo, number, value}) {
		await putValue({accountNo, number, value});
	};
	
	$: {
		accountPromise = getAccount(accountToCheck); 
		account = null;
		(async () => {
			account = await accountPromise;
			// console.log(account);
		})().catch(()=>{});
	};

</script>

<style>
	main {
		max-width: 420px;
	}

	.visuallyhidden {
		position: absolute;

		width: 1px;
		height: 1px;
		margin: -1px;
		border: 0;
		padding: 0;

		white-space: nowrap;

		clip-path: inset(100%);
		clip: rect(0 0 0 0);
		overflow: hidden;
	}	
	
	.radio {
		display: inline;
		border-bottom: 1px solid teal;
		cursor: pointer;
		font-weight: bold;
		color: inherit;
	}
	
	.radio input:not(:checked) + span {
		color: #999;
	}
	
	.radio input:checked + span {
		display: block;
		border-bottom: 4px solid teal;
		font-weight: bold;
	}
	
	.tabs {
		display: flex;
		/* outline: 1px solid red; */
		margin: 0.5em 0 0.5em 0;
	}
	
	.tab {
		min-width: 4em;
		text-align: center;
		margin: 0 3px;
	}
</style>

<main>
<hgroup>
<h1>Передача показаний счетчиков</h1>
<p>
	Показания счетчиков передаются в период с 20 по 25 число каждого месяца.
</p>
</hgroup>

<p style="text-align: center; font-style: italic;">
	Демо счета: 5233, 1523, 3223
</p>

<label>Лицевой счет <input type=text bind:value={accountToCheck}>
{#await accountPromise}
	<span>...поиск</span>
{:then account}
	<span style="color: green">✔</span>
{:catch error}
	<span style="color: red">{accountToCheck ? "❌" : " "}</span>
{/await}
</label>

{#if account}
	<form>
		<div class=tabs>
			{#each meterTypes as meterType}
			<label class="radio tab"><input class="visuallyhidden" type=radio bind:group={currentMeterType} value={meterType}> <span>{meterTypeNames[meterType]}</span> </label> 
			{/each}
		</div>
	</form>

	{#each account.meters.filter(meter => meter.meterType === currentMeterType) as meter (meter.number)}
		<Meter meter={{accountNo: account.accountNo, ...meter}} {transmitHandler}></Meter>
	{/each}
{/if}
</main>