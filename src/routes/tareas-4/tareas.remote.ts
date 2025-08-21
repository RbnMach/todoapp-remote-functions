import { command, form, query } from '$app/server';

type Tarea = {
	id: string; // <-- AÑADIDO
	texto: string;
	completada: boolean;
};

// base de datos servidor
let tareas: Tarea[] = [
	{ id: crypto.randomUUID(), texto: 'Tarea 1', completada: false },
	{ id: crypto.randomUUID(), texto: 'Tarea 2', completada: false },
	{ id: crypto.randomUUID(), texto: 'Tarea 3', completada: false }
];
// El metodo "query" es para consultas y devolver datos
export const getTareas = query(async () => {   
	return tareas;
});

// El metodo "form" es para crear tareas recibiendo datos a partir de un formulario
export const createTarea = form(async (formData) => {
	const texto = formData.get('tarea') as string;

	// simulamos un proceso lento para esperar 4 segundos
	await new Promise((resolve) => setTimeout(resolve, 4000));

	// Agregamos la nueva tarea a nuestra "base de datos"
	tareas.push({ id: crypto.randomUUID(), texto, completada: false });

	// ✨ LA MAGIA DE LA ACTUALIZACIÓN INSTANTÁNEA ✨
	// Le decimos a SvelteKit que, como resultado de esta acción,
	// debe actualizar la query "getTareas" pero si no definimos nada por defecto
	// se actualizan todas las query
	await getTareas().refresh();

	// Devolvemos un objeto de éxito. Esto limpiará el formulario en el cliente.
	return { satisfactorio: true };
});

export const changeCompleta = command(
	// se recomienda poner el validador de respuesta del servidor usando "zod" o "valibot" pues
	// esto podria ser una puerta abierta al servidor si no existe dicho validador a no ser que confies
	// en los datos que recibimos el servidor
	'unchecked',
	async (valores: { id: string; completada: boolean }) => {
		// desestructuramos el objeto
		const { id, completada } = valores;
		// buscamos la tarea
		const tarea = tareas.find((t) => t.id === id);
		// si tarea existe la actualizamos
		if (tarea) {
			tarea.completada = !tarea.completada;
			await getTareas().refresh();
		}
	}
);

export const updateTextoTarea = command(
	'unchecked',
	async (valores: { id: string; texto: string }) => {
		const { id, texto } = valores;
		const tarea = tareas.find((t) => t.id === id);
		if (tarea) {
			tarea.texto = texto;
			await getTareas().refresh();
		}
	}
);

export const deleteTarea = command('unchecked', async (valores: { id: string }) => {
	const { id } = valores;

	// simulamos un proceso lento para esperar 4 segundos
	await new Promise((resolve) => setTimeout(resolve, 4000));

	// Buscamos el índice por ID para poder usar splice
	const index = tareas.findIndex((t) => t.id === id);

	// Eliminamos la tarea de nuestra "base de datos"
	tareas.splice(index, 1);

	// Refrescamos la query para que cualquier otro cliente que la use se actualice.
	// Esto es clave para la consistencia de los datos.
	await getTareas().refresh();

	return { success: true };
});
