<svelte:head>
	<link rel="stylesheet" href="/homepage_style.css" />
	<link rel="stylesheet" href="/navbar.css" />
	<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">
</svelte:head>

<!-- ****************************** -->
<!-- ********** HTML CODE ********* -->
<!-- ****************************** -->

<body>

    <div class="game_navbar">

        <div class="button_box">
            <img class="button_picture" src="/img/home_icone.png">
            <button class="button_nav" on:click={() => goto('/homepage')}>Home</button>
        </div>

        <div class="button_box">
            <img class="button_picture" src="/img/profile_icone.png">
            <button class="button_nav" on:click={() => goto(`/profile/${user.pseudo}`)}>Profile</button>
        </div>

        <div class="button_box">
            <img class="button_picture" src="/img/game_icone.png">
            <button class="button_nav" on:click={() => goto('/game')}>Game</button>
        </div>

        <div class="button_box">
            <img class="button_picture" src="/img/chat_icone.png">
            <button class="button_nav" on:click={() => goto('/chat')}>Chat</button>
        </div>

    </div>

    <h1 class="Ft-Transcendence">Ft-Transcendence</h1>
      
	<div class="welcome_box">
		<h1 class="welcome_h1">
            <span class="Bienvenue">Bienvenue,</span>
            <span class="typewriter">ple-berr</span>
        </h1>
        <img class="boune" src="/img/Bounejump.gif" alt="">
	</div>

    <footer class="footer"><p>Un projet de <span class="footer_name">Ktroude</span>,
        <span class="footer_name">Bleroy</span>,
        <span class="footer_name">Lmaujean</span> et
        <span class="footer_name">Ple-berr</span></p></footer>
</body>



<!-- 
<body>	
	<div class="game_navbar">
		<button class="button_nav" on:click={() => goto('/homepage')}>Home</button>
		<button class="button_nav" on:click={() => goto(`/profile/${user.pseudo}`)}>Profile</button>
		<button class="button_nav" on:click={() => goto('/chat')}>Chat</button>
		<button class="button_nav" on:click={() => goto('/game')}>Game</button>
	</div>
	<div class="container">
		<h1>Ceci est la homepage et tu es {user?.pseudo}</h1>
		<button class="button_nav" on:click={() => goto('/testgame')}>Test_game</button>
	</div>
</body> -->

<!-- ****************************** -->
<!-- **********   SCRIPT  ********* -->
<!-- ****************************** -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from "$app/navigation";
  import {fetchData} from "../../API/api";
  import {io, Socket} from 'socket.io-client';

  let socket: Socket;

  let user: User;
    interface User {
        id: number;
        pseudo: string;
        firstName: string;
        lastName: string;
    }

    onMount(async function() {
		user = await fetchData();
		const socket = io('http://localhost:3000');
		socket.on('connect', async function() {
			console.log('connected');
			
			socket.emit('userConnected', { pseudo: user.pseudo });
		});
	});

</script>