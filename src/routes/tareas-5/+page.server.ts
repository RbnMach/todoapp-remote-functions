import { tareas } from "$lib/db-prueba";

export const load = async ({depends}) => {
	depends('app:tareas');

	console.log("se ejecuta el load", tareas);
	
	return {
		tareas
	};
};
