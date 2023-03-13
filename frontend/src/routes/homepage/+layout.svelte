<script>
	import dofus from '$lib/images/dofus.jpeg';
	import Header from './Header.svelte'
</script>

<Header />

<style>
	img {
		display: block;
		margin: auto;
		margin-top: 40px; 
	}
</style>

<main>
	<slot name="content"></slot>
</main>

<div class="image-container">
	<img src={dofus} alt="Dofus" />
</div>