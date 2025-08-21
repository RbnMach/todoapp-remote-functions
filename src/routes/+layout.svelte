<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="mt-8">
	<ul class="flex justify-center gap-4">
		<li>
			<a
				class:bg-blue-400={page.url.pathname === '/'}
				class="flex h-20 w-52 flex-col rounded-2xl border-2 p-2 px-4 text-center"
				href="/"
			>
				Tareas 1<small>FrontEnd <br />($state, $derived, $effect)</small>
			</a>
		</li>
		<li>
			<a
				class:bg-blue-400={page.url.pathname === '/tareas-2'}
				class="flex h-20 w-52 flex-col rounded-2xl border-2 p-2 px-4 text-center"
				href="/tareas-2"
			>
				Tareas 2 <small>FrontEnd + Signals <br />($state, $derived, $effect.root)</small>
			</a>
		</li>
		<li>
			<a
				class:bg-blue-400={page.url.pathname === '/tareas-3'}
				class="flex h-20 w-52 flex-col rounded-2xl border-2 p-2 px-4 text-center"
				href="/tareas-3"
			>
				Tareas 3 <small>FrontEnd - Backend <br />(Load, Action)</small>
			</a>
		</li>
		<li>
			<a
				class:bg-blue-400={page.url.pathname === '/tareas-4'}
				class="flex h-20 w-52 flex-col rounded-2xl border-2 p-2 px-4 text-center"
				href="/tareas-4"
			>
				Tareas 4 <small>FrontEnd - Backend <br />(Remote functions)</small>
			</a>
		</li>
		<li>
			<a
				class:bg-blue-400={page.url.pathname === '/tareas-5'}
				class="flex h-20 w-52 flex-col rounded-2xl border-2 p-2 px-4 text-center"
				href="/tareas-5"
			>
				🌟 Tareas 5 🌟 <small>FrontEnd - Backend <br />(Load + Remote functions)</small>
			</a>
		</li>
	</ul>
</header>

<div class="flex items-center justify-center">
	{@render children?.()}
</div>
