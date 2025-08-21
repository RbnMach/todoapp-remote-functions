<script lang="ts">
	import { debounce } from '$lib/debounce';
	import {
		getTareas,
		createTarea,
		changeCompleta,
		updateTextoTarea,
		deleteTarea
	} from './tareas.remote';
	type Tarea = {
		id: string;
		texto: string;
		completada: boolean;
	};

	let expanded = $state(false);

	let tareasQuery = getTareas();
	let localTareas = $state<Tarea[]>([]);
	$effect(() => {
		const datosRemotos = tareasQuery.current;

		if (datosRemotos) {
			// Sincroniza el estado local con los datos del servidor.
			// `structuredClone` es vital para crear una copia profunda.
			localTareas = structuredClone(datosRemotos);
		}
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

	// Simplemente aplicamos debounce directamente a la remote function.
	// TypeScript inferirá los tipos correctamente.
	const debouncedUpdateTexto = debounce(updateTextoTarea, 700); // 500ms
</script>

<div
	class="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center space-y-2 rounded-2xl border-2 p-4 px-7"
>
	<div class="my-2 w-72 text-justify">
		<h1 class="text-center text-3xl font-extrabold">TAREAS 4</h1>
		<small class="block text-gray-500">
			<p
				class="overflow-hidden transition-all duration-300 ease-in-out"
				class:line-clamp-2={!expanded}
			>
				Esta app usa <b>Remote Functions</b> (archivos <code>.remote.ts</code>) para la comunicación
				entre cliente y servidor.
				<br />
				<strong>Activación:</strong> Se habilitan en <code>svelte.config.js</code>.
				<br />
				<strong>Carga:</strong> Requieren <code>&lt;svelte:boundary&gt;</code> para mostrar un
				estado de "cargando".
				<br />
				<strong>Recomendación:</strong>
				<br />
				- Usa <code>load</code> para los datos esenciales de la página (carga inicial más rápida).
				<br />
				- Usa <b>Remote Functions</b> para acciones dinámicas (ej: dar like, buscar, etc.).
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

	<!--puedes usar solo <form {...createTarea}> -->
	<form
		{...createTarea.enhance(async ({ form, data, submit }) => {
			// Obtenemos el texto de la nueva tarea desde el FormData
			const textoNuevaTarea = data.get('tarea') as string;

			const nuevaTareaOptimista: Tarea = {
				id: crypto.randomUUID(),
				texto: textoNuevaTarea.trim(),
				completada: false
			};

			// ¡Aquí está la magia de una UI optimista!
			await submit().updates(
				getTareas().withOverride((tareasActuales) => {
					// Añadimos la tarea con el ID temporal a la lista que ve el usuario.
					// le damos la versión optimista de los datos para que actulice inmediatamente la UI
					// de manera temporal hasta que la respuesta del servidor llegue
					return [...tareasActuales, nuevaTareaOptimista];
				})
			);

			// Esto se ejecuta después de que todo el proceso (incluida la respuesta del servidor) ha terminado
			if (createTarea.result?.satisfactorio) {
				form.reset();
			}
		})}
		class="flex w-full flex-grow gap-1"
	>
		<!-- todo .pending es el numero de peticiones pendientes, si el numero es 0 no hay peticiones -->
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

	<svelte:boundary>
		<!-- mientras se resuelve getTareas() muestra el mensaje de carga -->
		{#snippet pending()}
			<div class="p-8 text-center">
				<p>Cargando datos...</p>
			</div>
		{/snippet}
		<!-- si getTareas() falla muestra el error -->
		{#snippet failed(error)}
			<div class="p-8 text-center text-red-500">
				<p>Oops, algo salió mal: {error}</p>
			</div>
		{/snippet}

		{#each tareasFiltradas as tarea (tarea.id)}
			<div
				class="flex w-full items-center justify-between rounded-2xl bg-gray-300 px-2 py-2"
				class:opacity-50={tarea.completada}
			>
				<div class="flex items-center gap-2">
					<input
						type="checkbox"
						onchange={async (event) => {
							// Obtenemos el nuevo estado del checkbox
							const completada = (event.target as HTMLInputElement).checked;
							await changeCompleta({ id: tarea.id, completada });
						}}
						checked={tarea.completada}
						class="ml-4 h-5 w-5"
					/>
					<input
						oninput={async (event) => {
							// obtenemos el texto de la nueva tarea
							const texto = (event.target as HTMLInputElement).value;
							// await updateTextoTarea({ index: i, texto });

							debouncedUpdateTexto({ id: tarea.id, texto });
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

						console.log('respuesta del servidor: ', res.success);
					}}
				>
					X
				</button>
			</div>
		{/each}
	</svelte:boundary>
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
