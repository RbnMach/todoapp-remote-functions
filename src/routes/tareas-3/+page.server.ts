type Tarea = {
	texto: string;
	completada: boolean;
};
// base de datos servidor
let tareas: Tarea[] = [
	{ texto: 'Tarea 1', completada: false },
	{ texto: 'Tarea 2', completada: false }
];

export const load = async () => {
	return {
		tareas
	};
};

// tomar en cuenta que despues de cada ejecucion de una "accion"
// se ejecuta el "load" para mandar datos actualizados
export const actions = {
	agregarTarea: async ({ request }) => {
		const data = await request.formData();
		const nuevaTarea = data.get('tarea') as string;
		tareas.push({ texto: nuevaTarea, completada: false });

		return {
			success: true
		};
	},
	actualizarTareas: async ({ request, cookies }) => {
		const data = await request.formData();
		const tareasModificadasStr = data.get('tareasModificadas') as string;

		// parseamos las tareas modificadas que vienen del cliente
		const tareasModificadas: (Tarea & { index: number })[] = JSON.parse(tareasModificadasStr);

		// Aplicamos los cambios
		for (const tareaModificada of tareasModificadas) {
			// desestructuramos de tareaModificada los valores index, texto y completada
			const { index, texto, completada } = tareaModificada;
			if (tareas[index]) {
				tareas[index] = { texto, completada };
			}
		}
	},
	eliminarTarea: async ({ request }) => {
		const data = await request.formData();
		const index = Number(data.get('index'));
		tareas.splice(index, 1);
	}
};
