<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { debounce } from '$lib/debounce';
	import { createTarea, changeCompleta, updateTextoTarea, deleteTarea } from './tareas.remote';
	type Tarea = {
		id: string;
		texto: string;
		completada: boolean;
	};

	let { data } = $props();

	let localTareas = $state(structuredClone(data.tareas));
	$effect(() => {
		localTareas = structuredClone(data.tareas);
	});

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

	const debouncedUpdateTexto = debounce(updateTextoTarea, 700); // 700ms
</script>

<div
	class="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center space-y-2 rounded-2xl border-2 p-4 px-7"
>
	<div class="my-2 w-72 text-justify">
		<h1 class="text-center text-3xl font-extrabold">🌟 TAREAS 5 🌟</h1>
		<small class="block text-gray-500">
			<p
				class="overflow-hidden transition-all duration-300 ease-in-out"
				class:line-clamp-2={!expanded}
			>
				Esta app usa <b>Remote Functions + Load</b> para la comunicación entre cliente y servidor.
				Con <code>load</code> cargamos los datos esenciales de la página.
				<br />
				<strong>Recomendación:</strong>
				<br />
				- Usa <code>load</code> para los datos esenciales de la página (carga inicial más rápida).
				<br />
				- Usa <b>Remote Functions</b> para acciones dinámicas (ej: dar like, buscar, etc.).
				<br/>
				En el servidor en load usamos <code>depends('app:tareas')</code> para dar un identificador al load para que cuando necesitemos que se vuelva a cargar los datos usamos <code>invalidate('app:tareas')</code> en el cliente, esto ara que el load se vuelva a ejecutar.
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

	<form
		{...createTarea.enhance(async ({ form, submit }) => {
			await submit();
			// Esto se ejecuta después de que todo el proceso (incluida la respuesta del servidor) ha terminado
			if (createTarea.result?.satisfactorio) {
				invalidate('app:tareas');
				form.reset();
			}
		})}
		class="flex w-full flex-grow gap-1"
	>
		<input
			name="tarea"
			type="text"
			placeholder="Nueva tarea"
			class="w-full rounded-lg border-2 px-3 py-2"
			disabled={createTarea.pending > 0}
		/>
		<button
			type="submit"
			class="rounded-lg border-2 bg-blue-500 px-3 py-2 hover:bg-blue-400"
			disabled={createTarea.pending > 0}
		>
			{createTarea.pending > 0 ? '...' : '+'}
		</button>
	</form>
	<!-- Opcional: Muestra el mensaje de success de validación -->
	{#if createTarea.result?.satisfactorio}
		<p class="text-sm text-green-500">Tarea registrada!</p>
	{/if}

	{#each tareasFiltradas as tarea (tarea.id)}
		<div
			class="flex w-full items-center justify-between rounded-2xl bg-gray-300 px-2 py-2"
			class:opacity-50={tarea.completada}
		>
			<div class="flex items-center gap-2">
				<input
					type="checkbox"
					onchange={async () => {
						await changeCompleta({ id: tarea.id });
						invalidate('app:tareas');
					}}
					checked={tarea.completada}
					class="ml-4 h-5 w-5"
				/>
				<input
					oninput={async (event) => {
						// obtenemos el texto de la nueva tarea
						const texto = (event.target as HTMLInputElement).value;
						const res = await debouncedUpdateTexto({ id: tarea.id, texto });
						if (res.satisfactorio) {
							invalidate('app:tareas');
						}
					}}
					type="text"
					value={tarea.texto}
					class="bg-transparent focus:outline-none"
				/>
			</div>
			<button
				type="submit"
				class="rounded-full bg-red-400 px-2 text-white hover:bg-red-300"
				onclick={async (e) => {
					const elemento = e.target as HTMLButtonElement;
					elemento.disabled = true;
					elemento.innerText = '...';
					const res = await deleteTarea({ id: tarea.id });
					elemento.disabled = false;
					elemento.innerText = 'X';

					if (res.satisfactorio) {						
						invalidate('app:tareas');
					}
				}}
			>
				X
			</button>
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
</div>
