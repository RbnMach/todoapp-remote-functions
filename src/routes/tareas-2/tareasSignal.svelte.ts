export type Tarea = {
	texto: string;
	completada: boolean;
};
export type Filter = 'todos' | 'completadas' | 'pendientes';

export function tareasSignal() {
	// --- ESTADO ---
	// El estado principal vive aquí. Es privado para el módulo.
	let tareas = $state<Tarea[]>([]);
	let filter = $state<Filter>('todos');

	// el tener root toma el componente de raiz
	$effect.root(() => {
		$effect(() => {
			const tareasGuardadas = localStorage.getItem('tareas2');
			if (tareasGuardadas) {
				tareas = JSON.parse(tareasGuardadas);
			}
		});

		$effect(() => {
			// Aquí SÍ se está *LEYENDO* el valor de la variable reactiva 'tareas' y el efecto depende de "tareas"
			// lo que hace que se ejecute cada vez que "tareas" cambia
			localStorage.setItem('tareas2', JSON.stringify(tareas));
		});
	});

	function agregarTarea(texto: string) {
		tareas.push({ texto, completada: false });
	}

	function editarTarea(index: number, texto: string) {
		tareas[index].texto = texto;
	}

	function activarTarea(index: number) {
		tareas[index].completada = !tareas[index].completada;
	}

	function nuevoFiltro(nuevofiltro: Filter) {
		filter = nuevofiltro;
	}

	let tareasFiltradas = $derived(filtrarTareas());

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

	return {
		// Hacemos el estado reactivo accesible a través de getters
		get tareas() {
			return tareas;
		},
		get tareasFiltradas() {
			return tareasFiltradas;
		},
		get filter() {
			return filter;
		},
		get tareasRestantes() {
			return tareasRestantes;
		},
		agregarTarea,
		editarTarea,
		activarTarea,
		nuevoFiltro,
		eliminarTarea
	};
}

export const tareasList = tareasSignal();
