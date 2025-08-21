import { command, form } from '$app/server';
import { tareas } from '$lib/db-prueba';

// El metodo "form" es para crear tareas recibiendo datos a partir de un formulario
export const createTarea = form(async (formData) => {
	const texto = formData.get('tarea') as string;

	// simulamos un proceso lento para esperar 4 segundos
	await new Promise((resolve) => setTimeout(resolve, 4000));

	// Agregamos la nueva tarea a nuestra "base de datos"
	tareas.push({ id: crypto.randomUUID(), texto, completada: false });

	// Devolvemos un objeto de éxito. Esto limpiará el formulario en el cliente.
	return { satisfactorio: true };
});

export const changeCompleta = command('unchecked', async (valores: { id: string }) => {
	// desestructuramos el objeto
	const { id } = valores;
	// buscamos la tarea
	const tarea = tareas.find((t) => t.id === id);
	// si tarea existe la actualizamos
	if (tarea) {
		tarea.completada = !tarea.completada;
	}
});

export const updateTextoTarea = command(
	'unchecked',
	async (valores: { id: string; texto: string }) => {
		const { id, texto } = valores;
		const tarea = tareas.find((t) => t.id === id);
		if (tarea) {
			tarea.texto = texto;
		}

		return { satisfactorio: true };
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

	return { satisfactorio: true };
});
