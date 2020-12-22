<script>
	import {getAccount, getMeter, putValue} from './utils';
	
	const meterTypes = ['ЭЛ', 'ГВ', 'ХВ'];
	const meterTypeNames = {
		"ЭЛ": "⚡ Электричество",
		"ГВ": "♨ Горячая вода",
		"ХВ": "❄ Холодная вода"
	}
	let currentMeterType = meterTypes[0];
	let accountToCheck = "";
	let accountPromise;

	let meterToCheck = "";
	let meterPromise;
	let meter;

	let reading = "";

	let transmitPromise;
	
	function transmitHandler () {
		transmitPromise = putValue(accountToCheck, meterToCheck, reading);
	};

	$: {
		accountPromise = getAccount(accountToCheck); 
		// meterToCheck = "";
	}

	$: {
		meterPromise = getMeter(accountToCheck, meterToCheck);
		(async () => { meter = null; meter = await meterPromise; })().catch(()=>{});
	}
	
</script>

<style>
	article {
		background-color: beige;
		padding: 5px;
	}

	.control {
		display: flex;
		flex-wrap: wrap;
		position: relative;
		margin: 15px 0;
		width: 100%;
		/* border: 1px solid red; */
	}

	.control__input {
		margin-left: auto;
		padding-right: 2.3ch;
		width: 15ch;
		font-family: 'Courier New', Courier, monospace;
		font-weight: bold;
		font-size: 20px;
	}

	.control__state-icon {
		position: absolute;
		right: 3px;
		top: 5px;
		font-family: 'Courier New', Courier, monospace;
		font-weight: bold;
		font-size: 20px;
	}

	.control__state-text {
		width: 100%;
	}
	
	.control__text {
		margin-left: auto;
		font-family: Arial, Helvetica, sans-serif;
		font-weight: bold;
		font-size: 18px;
		width: 180px;
		border-bottom: 1px solid teal;
	}

	.control__send-button {
		padding: 15px;
		background-color: teal;
		color: white;
		font-weight: bold;
		font-size: 20px;
		cursor: pointer;
	}

</style>

<article>
<hgroup>
<h2 class="title">Передача показаний счетчиков</h2>
<p class="subtitle">
	Показания счетчиков передаются в период с 20 по 25 число каждого месяца.
</p>
</hgroup>

<label class="control">
	<span class="control__title">Лицевой счет</span>
	<input class="control__input" type=text bind:value={accountToCheck}>
	<span class="control__state-icon">
		{#await accountPromise}🔍
		{:then account}✔
		{:catch error}{accountToCheck ? "❌" : " "}
		{/await}
	</span>
</label>


<label class="control">
	<span class="control__title">Номер счетчика</span>
	<input class="control__input" type=text bind:value={meterToCheck}>
	<span class="control__state-icon">
		{#await meterPromise}🔍
		{:then meter}✔
		{:catch error}{meterToCheck ? "❌" : " "}
		{/await}
	</span>
</label>

<div class="control">
	<span class="control__title">Тип счетчика</span>
	<span class="control__text">{meterTypeNames[meter?.type] || ""}</span>
</div>

<div class="control">
	<span class="control__title">Описание</span>
	<span class="control__text">{meter?.memo  || ""}</span>
</div>

<label class="control">
	<span class="control_title">Показания</span>
	<input class="control__input" type=text bind:value={reading}>
</label>

<div class="control">
	<button class="control__send-button" on:click={transmitHandler}>Передать показания</button>
	{#if transmitPromise}
		<div class="control__state-text">
			{#await transmitPromise} отправляю...
			{:then ok} ✔ показания переданы 
			{:catch} ❌ ошибка передачи показаний
			{/await}
		</div>
	{/if}
</div>

</article>
