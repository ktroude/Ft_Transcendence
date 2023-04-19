<svelte:head>
	<link rel="stylesheet" href="/style_profile.css" />
</svelte:head>

<!-- ****************************** -->
<!-- ********** HTML CODE ********* -->
<!-- ****************************** -->

<body>	
	<div class="game_navbar">
		<button class="button_nav" on:click={() => goto('/homepage')}>Home</button>
		<button class="button_nav" on:click={() => goto(`/profile/${user.pseudo}`)}>Profile</button>
		<button class="button_nav" on:click={() => goto('/chat')}>Chat</button>
		<button class="button_nav" on:click={() => goto('/game')}>Game</button>
	</div>
	<div class="container">
		<h1>Ceci est la homepage et tu es {user?.pseudo}</h1>
	</div>
</body>

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
			
			socket.emit('userConnected', { userId: user.id });
		});
	});

</script>