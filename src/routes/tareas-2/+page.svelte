<script lang="ts">
	import { tareasList } from './tareasSignal.svelte';

	const { agregarTarea, editarTarea, activarTarea, nuevoFiltro, eliminarTarea, tareasRestantes } =
		tareasList;
</script>

<div class="mt-16 w-fit space-y-2 rounded-2xl border-2 p-4 px-7">
	<div class="my-2 w-96 text-justify">
		<h1 class="text-center text-3xl font-extrabold">TAREAS 2</h1>
		<small class="text-gray-500">
			El código es FrontEnd pero ahora usa <b>SIGNALS</b> usando
			<code>$state</code>,
			<code>$derived</code>
			y
			<code>$effect.root</code>.
		</small>
	</div>
	<input
		type="text"
		onkeydown={(e) => {
			if (e.key !== 'Enter') return;
			const input = e.target as HTMLInputElement;
			agregarTarea(input.value);
			input.value = '';
		}}
		placeholder="Nueva tarean (enter para agregar)"
		class="w-full rounded-lg border-2 px-3 py-2"
	/>
	{#each tareasList.tareasFiltradas as tarea, i}
		<div
			class="flex w-full items-center justify-between rounded-2xl bg-gray-300 px-2 py-2"
			class:opacity-50={tarea.completada}
		>
			<div class="flex items-center gap-2">
				<input
					type="checkbox"
					onchange={() => {
						activarTarea(i);
					}}
					checked={tarea.completada}
					class="ml-4 h-5 w-5"
				/>
				<input
					type="text"
					oninput={(e) => {
						const input = e.target as HTMLInputElement;
						editarTarea(i, input.value);
					}}
					value={tarea.texto}
					class="bg-transparent focus:outline-none"
				/>
			</div>

			<button
				class="rounded-full bg-red-400 px-2 text-white hover:bg-red-300"
				onclick={() => {
					eliminarTarea(i);
				}}
			>
				X
			</button>
		</div>
	{/each}
	<div class="flex justify-between gap-2">
		<button
			class="rounded-lg border-2 border-b-blue-900 bg-blue-500 px-3 py-2 hover:bg-blue-400"
			class:opacity-50={!(tareasList.filter == 'todos')}
			onclick={() => {
				nuevoFiltro('todos');
			}}
		>
			Todos
		</button>
		<button
			class="rounded-lg border-2 border-b-blue-900 bg-blue-500 px-3 py-2 hover:bg-blue-400"
			class:opacity-50={!(tareasList.filter == 'completadas')}
			onclick={() => {
				nuevoFiltro('completadas');
			}}
		>
			Completadas
		</button>
		<button
			class="rounded-lg border-2 border-b-blue-900 bg-blue-500 px-3 py-2 hover:bg-blue-400"
			class:opacity-50={!(tareasList.filter == 'pendientes')}
			onclick={() => {
				nuevoFiltro('pendientes');
			}}
		>
			Pendientes
		</button>
	</div>

	<p>Tareas restantes: {tareasRestantes()}</p>
</div>
