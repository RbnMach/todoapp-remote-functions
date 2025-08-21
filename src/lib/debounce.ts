/**
 * Crea una versión "debounced" de una función asíncrona.
 * La función debounced retorna una promesa que se resuelve con el resultado
 * de la última ejecución de la función original.
 *
 * @template T - El tipo de la función a la que se le aplicará el debounce.
 * @param {T} fn - La función a ejecutar después del retardo. Debe devolver una promesa.
 * @param {number} delay - El tiempo de espera en milisegundos.
 * @returns {(...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>} - Una nueva función con debounce.
 */
export function debounce<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
    let timeoutId: number | undefined;

    // Almacena las funciones `resolve` y `reject` de la promesa que retornamos.
    // Usamos `any` aquí porque el tipo exacto se infiere en la promesa de retorno.
    let promiseResolve: (value: any) => void;
    let promiseReject: (reason?: any) => void;
    
    // Almacena la promesa que se retornará en la secuencia de llamadas.
    let currentPromise: Promise<Awaited<ReturnType<T>>> | null = null;

    return function (this: any, ...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
        // Si no hay una promesa activa para esta "ráfaga" de llamadas, crea una nueva.
        if (!currentPromise) {
            currentPromise = new Promise((resolve, reject) => {
                promiseResolve = resolve;
                promiseReject = reject;
            });
        }

        // Limpia cualquier ejecución pendiente anterior.
        clearTimeout(timeoutId);

        // Establece un nuevo temporizador.
        timeoutId = window.setTimeout(async () => {
            try {
                // 👇 ¡AQUÍ ESTÁ LA CORRECCIÓN! 👇
                // Usamos `async` en el callback y `await` en la llamada a `fn`.
                const result = await fn.apply(this, args);
                // Ahora `result` es el valor resuelto, no la promesa.
                promiseResolve(result);
            } catch (error) {
                // Si la función original falla, rechazamos la promesa.
                promiseReject(error);
            } finally {
                // Una vez que se ejecuta (con éxito o error), reseteamos
                // `currentPromise` para la próxima "ráfaga" de llamadas.
                currentPromise = null;
            }
        }, delay);

        // Retornamos la promesa inmediatamente. Esta promesa no se resolverá
        // hasta que el `setTimeout` se complete y la llamada a `fn` termine.
        return currentPromise;
    };
}

// /**
//  * Crea una versión "debounced" de una función. La función debounced se ejecutará
//  * solo después de que haya pasado un `delay` en milisegundos desde la última vez que
//  * fue invocada. Es útil para eventos que se disparan rápidamente, como la entrada
//  * de teclado en un input.
//  *
//  * @template T - El tipo de la función a la que se le aplicará el debounce.
//  * @param {T} fn - La función a ejecutar después del retardo.
//  * @param {number} delay - El tiempo de espera en milisegundos.
//  * @returns {(...args: Parameters<T>) => void} - Una nueva función con el debounce aplicado.
//  */
// export function debounce<T extends (...args: any[]) => any>(
// 	fn: T,
// 	delay: number
// ): (...args: Parameters<T>) => void {
// 	// Esta variable almacenará el identificador del temporizador de setTimeout.
// 	// "Vive" en el closure, por lo que persiste entre llamadas.
// 	let timeoutId: number | undefined;

// 	// Retornamos la nueva función que envuelve a la original.
// 	return function (this: any, ...args: Parameters<T>) {
// 		// `this` captura el contexto (si lo hubiera) desde donde se llama la función.
// 		// `...args` captura todos los argumentos pasados a la función debounced.

// 		// Cada vez que se llama a esta función (ej. en cada `oninput`),
// 		// limpiamos el temporizador anterior. Esto cancela la ejecución pendiente.
// 		clearTimeout(timeoutId);

// 		// Establecemos un nuevo temporizador. Si esta función no se vuelve a llamar
// 		// antes de que `delay` milisegundos pasen, el callback se ejecutará.
// 		timeoutId = window.setTimeout(() => {
// 			// Cuando el temporizador finalmente se completa, ejecutamos la función
// 			// original `fn` con el contexto (`this`) y los argumentos (`args`)
// 			// de la última llamada.
// 			fn.apply(this, args);
// 		}, delay);
// 	};
// }

