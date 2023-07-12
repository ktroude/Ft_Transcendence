<svelte:head>
	<title>Home</title>
	<link rel="preload" href="/img/bg1.jpg" as="image">
	<link rel="preload" href="/homepage_style.css" as="style"/>
	<link rel="stylesheet" href="/homepage_style.css" />
	<link rel="stylesheet" href="/navbar.css" />
	<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">
</svelte:head>

<script>
    function redirectToAuth() {
      window.location.href = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-3c0128a2fdd31dcd10f5ffcafccc016da6b9a35d909368b56286b2c0331dd29c&redirect_uri=http%3A%2F%2F10.11.7.3%3A3000%2Ftoken&response_type=code";
    }
</script>

<h1 class="Ft-Transcendence">Ft-Transcendence</h1>
<!-- <h2>
    clique <a href="https://api.intra.41.fr/oauth/authorize?client_id=u-s4t2ud-3c0128a2fdd31dcd10f5ffcafccc016da6b9a35d909368b56286b2c0331dd29c&redirect_uri=http%3A%2F%2F10.12.7.9%3A3000%2Ftoken&response_type=code">
        ici </a>
    pour te connecter breeeeeeeeeeeef
</h2> -->

<h2>
    Pour te connecter...
</h2>

<button class="btn" type="button" on:click={redirectToAuth}>
    <strong>Clique ici</strong>
    <div id="container-stars">
      <div id="stars"></div>
    </div>
  
    <div id="glow">
      <div class="circle"></div>
      <div class="circle"></div>
    </div>
</button>
  
