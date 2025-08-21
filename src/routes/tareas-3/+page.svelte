<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	// 1. Esta es la copia que el usuario editará.
	// Usamos structuredClone para asegurar que es una copia profunda y no una referencia de data.tareas y se usa como un nuevo state pues usaremos bind para vincular las modificaciones con el array localTareas.
	let localTareas = $state(structuredClone(data.tareas));

	// 2. Usamos $effect para resetear el estado local si los datos del servidor cambian.
	// Esto es crucial para que después de guardar, el nuevo estado "limpio" se cargue.
	$effect(() => {
		localTareas = structuredClone(data.tareas);
	});

	// 3. Usamos $derived para detectar si hay cambios entre el estado original y el local.
	// JSON.stringify es una forma sencilla de hacer una comparación profunda.
	let isDirty = $derived(JSON.stringify(localTareas) !== JSON.stringify(data.tareas));

	// 4. Usamos $derived para obtener SÓLO las tareas que han cambiado.
	// Incluimos el índice original para que el servidor sepa qué tarea actualizar.
	let tareasModificadas = $derived.by(() => {
		if (!isDirty) return []; // Si no hay cambios, no calculamos nada.

		const cambiadas = [];
		for (let i = 0; i < localTareas.length; i++) {
			// Comparamos cada tarea local con su original.
			if (JSON.stringify(localTareas[i]) !== JSON.stringify(data.tareas[i])) {
				cambiadas.push({ ...localTareas[i], index: i });
			}
		}
		return cambiadas;
	});

	// Filtrador de tareas
	type Filter = 'todos' | 'completadas' | 'pendientes';
	let filter = $state<Filter>('todos');
	let tareasFiltradas = $derived.by(() => {
		switch (filter) {
			case 'todos':
				return localTareas;

			case 'completadas':
				return localTareas.filter((tarea) => tarea.completada === true);

			case 'pendientes':
				return localTareas.filter((tarea) => tarea.completada === false);
		}
	});

	let expanded = $state(false);
</script>

<div class="mt-16 w-fit space-y-2 rounded-2xl border-2 p-4 px-7">
	<div class="my-2 w-72 text-justify">
		<h1 class="text-center text-3xl font-extrabold">TAREAS 3</h1>
		<small class="block text-gray-500">
			<p
				class="overflow-hidden transition-all duration-300 ease-in-out"
				class:line-clamp-2={!expanded}
			>
				El código trabaja en el FrontEnd y BackEnd usando
				<code>load</code>, <code>action</code>. Para evitar un tráfico alto de solicitudes al
				servidor usamos botones para guardar una nueva tarea o la modificación de las tareas.
				<span class="text-red-500">
					Si usamos "oninput" para editar las tareas, la página se pondrá lenta y el servidor se
					llenará de peticiones, porque cada vez que escribas una letra se haría una llamada al
					servidor. Eso haría que todo responda más lento.
				</span>
			</p>
			<a
				href={'javascript:void(0)'}
				onclick={() => (expanded = !expanded)}
				class="inline cursor-pointer text-xs text-blue-600 hover:underline"
			>
				{expanded ? 'Leer menos' : 'Leer más'}
			</a>
		</small>
	</div>
	<form action="?/agregarTarea" method="POST" class="flex w-full flex-grow gap-1" use:enhance>
		<input
			name="tarea"
			type="text"
			placeholder="Nueva tarea"
			class="w-full rounded-lg border-2 px-3 py-2"
		/>
		<button type="submit" class="rounded-lg border-2 bg-blue-500 px-3 py-2 hover:bg-blue-400">
			+
		</button>
	</form>

	{#if form?.success}
		<p class="text-sm text-green-500">Tarea registrada!</p>
	{/if}

	<!-- 5. Iteramos sobre la copia local para que los cambios se vean en la UI -->
	{#each tareasFiltradas as tarea, i}
		<div
			class="flex w-full items-center justify-between rounded-2xl bg-gray-300 px-2 py-2"
			class:opacity-50={tarea.completada}
		>
			<div class="flex items-center gap-2">
				<input type="checkbox" bind:checked={tarea.completada} class="ml-4 h-5 w-5" />
				<input type="text" bind:value={tarea.texto} class="bg-transparent focus:outline-none" />
			</div>
			<!-- El formulario de eliminar no necesita cambiar -->
			<form action="?/eliminarTarea" method="POST" use:enhance>
				<input type="hidden" name="index" value={i} class="hidden" />
				<button type="submit" class="rounded-full bg-red-400 px-2 text-white hover:bg-red-300">
					X
				</button>
			</form>
		</div>
	{/each}
	<div class="flex justify-between gap-2">
		<button
			class="rounded-lg border-2 border-b-blue-900 bg-blue-500 px-3 py-2 hover:bg-blue-400"
			class:opacity-50={!(filter == 'todos')}
			onclick={() => {
				filter = 'todos';
			}}
		>
			Todos
		</button>
		<button
			class="rounded-lg border-2 border-b-blue-900 bg-blue-500 px-3 py-2 hover:bg-blue-400"
			class:opacity-50={!(filter == 'completadas')}
			onclick={() => {
				filter = 'completadas';
			}}
		>
			Completadas
		</button>
		<button
			class="rounded-lg border-2 border-b-blue-900 bg-blue-500 px-3 py-2 hover:bg-blue-400"
			class:opacity-50={!(filter == 'pendientes')}
			onclick={() => {
				filter = 'pendientes';
			}}
		>
			Pendientes
		</button>
	</div>
	<!-- 6. El formulario de guardado masivo -->
	{#if isDirty}
		<form action="?/actualizarTareas" method="POST" use:enhance class="w-full">
			<!-- Enviamos solo las tareas modificadas como un string JSON en un campo oculto -->
			<input
				type="hidden"
				class="border-2"
				name="tareasModificadas"
				value={JSON.stringify(tareasModificadas)}
			/>
			<button
				type="submit"
				class="w-full rounded-lg border-2 bg-green-500 px-3 py-2 hover:bg-green-400"
			>
				Guardar Cambios ({tareasModificadas.length})
			</button>
		</form>
	{/if}
</div>
