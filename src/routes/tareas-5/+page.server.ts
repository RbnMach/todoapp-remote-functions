import { tareas } from "$lib/db-prueba";

export const load = async ({depends}) => {
	depends('app:tareas');
	return {
		tareas
	};
};
