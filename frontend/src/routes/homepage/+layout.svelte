<script>
	import dofus from '$lib/images/dofus.jpg';
	import Header from './Header.svelte';
	import Pong from './pong.svelte'
</script>

<Header />

<style>
	img {
		display: block;
		margin: auto;
		margin-top: 40px; /* Ajuster la valeur en fonction de vos besoins */
	}
</style>

<main>
	<slot name="content"></slot>
</main>

<div class="image-container">
	<img src={dofus} alt="Dofus" />
</div>
<Pong />

