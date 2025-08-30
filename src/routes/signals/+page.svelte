<script lang="ts">
	import { withPrevSignals } from './signals.svelte';

	// iniciando el valor en green
	const color = withPrevSignals('green');

	let inputVal = $state('');

	function save() {
		color.curr = inputVal;
		inputVal = '';
	}

	/* Escuchar Ctrl+Z y Cmd+Z en macOS */
	$effect(() => {
		function handleKey(e: KeyboardEvent) {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
				e.preventDefault(); // evita el "undo" nativo del navegador
				color.undo();
			}
		}

		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey); // cleanup
	});
</script>

<div class="mt-16 w-fit space-y-2 rounded-2xl border-2 p-4 px-7">
	<div class="my-2 w-96 text-justify">
		<h1 class="text-center text-3xl font-extrabold">SIGNALS</h1>
		<small class="text-gray-500">
			El código es FrontEnd <b>SIGNALS</b> usando
			<code>$state</code> y uso de <code>get</code> con <code>set</code> de signals.
		</small>
	</div>
	<div class="my-2">
		<p class="m-0 ms-5 p-0 font-medium text-gray-500 italic">Dato Previo: {color.prev}</p>
		<p class="m-0 ms-5 p-0 font-medium text-blue-500 italic">Dato Actual: {color.curr}</p>
	</div>
	<input
		type="text"
		bind:value={inputVal}
		onkeydown={(e) => e.key === 'Enter' && save()}
		placeholder="Nuevo Dato Actual"
		class="w-full rounded-lg border-2 px-3 py-2"
	/>
	<div class="flex justify-between gap-2">
		<button
			class="w-full rounded-lg border-2 border-b-red-900 bg-red-400 px-3 py-2 hover:bg-red-400/85"
			onclick={color.undo}
		>
			Deshacer <small>(Ctrl+Z)</small>
		</button>
		<button
			class="w-full rounded-lg border-2 border-b-blue-900 bg-blue-500 px-3 py-2 hover:bg-blue-400"
			onclick={save}
		>
			Guardar <small>(Enter)</small>
		</button>
	</div>
</div>
