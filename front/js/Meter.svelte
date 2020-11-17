<script>
	export let meter;
	export let transmitHandler;
	let newValue = meter.currentValue; 
	
	let transmitPromise = null;
	
	function click() {
		const {accountNo, number} = meter;
		transmitPromise = transmitHandler({accountNo, number, value: newValue});
	}	
</script>

<style>
	div {
		border: 1px solid #AAA;
		padding: 5px;
		margin: 5px 0;
	}
	
	.field {
		color: #999;
	}
	
	.value {
		font-weight: bold;
	}
	
</style>

<div>
	<p><span class="field">Номер счетчика:</span> <span class="value">{meter.number}</span></p>
	<p><span class="field">Описание счетчика:</span> <span class="value">{meter.info}</span></p> 
	<p><span class="field">Дата окончания поверки:</span> <span class="value">{meter.nextVerifyDate}</span></p>
	<p><span class="field">Показания счетчика за предыдущий период:</span> <span class="value">{meter.prevValue}</span></p>
	<label><span class="field">Показания счетчика за текущий период:</span> <input type=text bind:value={newValue}></label>

	<button type=button on:click={click}>
		Передать
	</button>
	{#if transmitPromise}
	{#await transmitPromise}
		Передача показаний
	{:then}
	<span style="color: green;">Показания переданы</span>
	{:catch}
	<span style="color: red;">Не удалось передать показания</span>
	{/await}
	{/if}
</div>
