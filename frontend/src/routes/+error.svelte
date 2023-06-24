<svelte:head>
	<title>404</title>
	<link rel="preload" href="/img/bg1.jpg" as="image">
	<link rel="preload" href="/homepage_style.css" as="style"/>
	<link rel="stylesheet" href="/profile_style.css" />
	<link rel="stylesheet" href="/homepage_style.css" />
	<link rel="stylesheet" href="/navbar.css" />
	<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">
</svelte:head>

<script lang=ts>
  import { page } from '$app/stores';
</script>

<h1 class="Ft-Transcendence"> {$page.status}</h1>
<h2 class="Ft-Transcendence"> Page not found</h2>
<h3 class="glow"> You looking for something that doesn't exist anymore...</h3>

<button class="back_to_lobby" on:click={() => location.href = '/homepage'}>Back to Homepage<span></span></button>