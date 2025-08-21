<script lang="ts">
	type Tarea = {
		texto: string;
		completada: boolean;
	};

	type Filter = 'todos' | 'completadas' | 'pendientes';

	let tareas = $state<Tarea[]>([]);
	let filter = $state<Filter>('todos');
	let tareasFiltradas = $derived(filtrarTareas());

	$effect(() => {
		// 1. Leer de una fuente externa (no es una variable de Svelte)
		const tareasGuardadas = localStorage.getItem('tareas');
		if (tareasGuardadas) {
			// 2. *ESCRIBIR* un valor a una variable de estado
			tareas = JSON.parse(tareasGuardadas);
		}
	});

	$effect(() => {
		// Aquí SÍ se está *LEYENDO* el valor de la variable reactiva 'tareas' y el efecto depende de "tareas"
		// lo que hace que se ejecute cada vez que "tareas" cambia
		localStorage.setItem('tareas', JSON.stringify(tareas));
	});

	function agregarTarea(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;

		const elemento = event.target as HTMLInputElement;
		const texto = elemento.value;
		const completada = false;

		// tareas = [...tareas, { texto, completada }];
		tareas.push({ texto, completada });

		elemento.value = '';
	}

	function editarTarea(event: Event) {
		const elemento = event.target as HTMLInputElement;
		// el + convierte el dato en un numero, el ! es para decirle que no es nulo
		// const index = +elemento.dataset.index!;
		if (elemento.dataset.index === undefined) return;
		const index = parseInt(elemento.dataset.index);
		tareas[index].texto = elemento.value;
	}

	function activarTarea(event: Event) {
		const elemento = event.target as HTMLInputElement;
		const index = parseInt(elemento.dataset.index!);
		tareas[index].completada = !tareas[index].completada;
	}

	function nuevoFiltro(nuevoFiltro: Filter) {
		filter = nuevoFiltro;
	}

	function filtrarTareas() {
		switch (filter) {
			case 'todos':
				return tareas;

			case 'completadas':
				return tareas.filter((tarea) => tarea.completada === true);

			case 'pendientes':
				return tareas.filter((tarea) => tarea.completada === false);
		}
	}

	function eliminarTarea(index: number) {
		// eliminar del array el index
		tareas.splice(index, 1);
	}

	function tareasRestantes() {
		return tareas.filter((tarea) => tarea.completada === false).length;
	}
</script>

<div
	class="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center space-y-2 rounded-2xl border-2 p-4 px-7"
>
	<div class="my-2 w-72 text-justify">
		<h1 class="text-center text-3xl font-extrabold">TAREAS 1</h1>
		<small class="text-gray-500">
			El código solo se encuentra en el FrontEnd y usa <code>$state</code>, <code>$derived</code> y
			<code>$effect</code>.
		</small>
	</div>
	<input
		type="text"
		onkeydown={agregarTarea}
		placeholder="Nueva tarean (enter para agregar)"
		class="w-full rounded-lg border-2 px-3 py-2"
	/>
	{#each tareasFiltradas as tarea, i}
		<div
			class="flex w-full items-center justify-between rounded-2xl bg-gray-300 px-2 py-2"
			class:opacity-50={tarea.completada}
		>
			<div class="flex items-center gap-2">
				<input
					type="checkbox"
					onchange={activarTarea}
					data-index={i}
					checked={tarea.completada}
					class="ml-4 h-5 w-5"
				/>
				<input
					type="text"
					oninput={editarTarea}
					data-index={i}
					value={tarea.texto}
					class="bg-transparent focus:outline-none"
				/>
			</div>

			<button
				class="rounded-full bg-red-400 px-2 text-white hover:bg-red-300"
				onclick={() => eliminarTarea(i)}
			>
				x
			</button>
		</div>
	{/each}
	<div class="flex justify-between gap-2">
		<button
			class="rounded-lg border-2 border-b-blue-900 bg-blue-500 px-3 py-2 hover:bg-blue-400"
			class:opacity-50={!(filter == 'todos')}
			onclick={() => nuevoFiltro('todos')}
		>
			Todos
		</button>
		<button
			class="rounded-lg border-2 border-b-blue-900 bg-blue-500 px-3 py-2 hover:bg-blue-400"
			class:opacity-50={!(filter == 'completadas')}
			onclick={() => nuevoFiltro('completadas')}
		>
			Completadas
		</button>
		<button
			class="rounded-lg border-2 border-b-blue-900 bg-blue-500 px-3 py-2 hover:bg-blue-400"
			class:opacity-50={!(filter == 'pendientes')}
			onclick={() => nuevoFiltro('pendientes')}
		>
			Pendientes
		</button>
	</div>

	<p>Tareas restantes: {tareasRestantes()}</p>
</div>
