type Tarea = {
	id: string;
	texto: string;
	completada: boolean;
};

export let tareas: Tarea[] = [
	{ id: crypto.randomUUID(), texto: 'Tarea 1 (de load)', completada: false },
	{ id: crypto.randomUUID(), texto: 'Tarea 2 (de load)', completada: false }
];
