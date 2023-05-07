<svelte:head>
	<link rel="preload" href="/img/bg1.jpg" as="image">
	<link rel="preload" href="/homepage_style.css" as="style"/>
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

<body style="margin:0px; padding:0px; background-image:url('/img/bg1.jpg');
background-position: center; background-size: cover ; overflow: hidden; width: 100vw;height: 100vh;">
{#if loading === true}

    <div class="game_navbar">

        <div class="button_box">
            <img class="button_picture" src="/img/home_icone.png">
            <button class="button_nav" on:click={() => fade('/homepage')}>Home</button>
        </div>

        <div class="button_box">
            <img class="button_picture" src="/img/profile_icone.png">
            <button class="button_nav" on:click={() => fade(`/profile/${user.id}`)}>Profile</button>
        </div>

        <div class="button_box">
            <img class="button_picture" src="/img/game_icone.png">
            <button class="button_nav" on:click={() => fade('/game')}>Game</button>
        </div>

        <div class="button_box">
            <img class="button_picture" src="/img/chat_icone.png">
            <button class="button_nav" on:click={() => fade('/chat')}>Chat</button>
        </div>

    </div>

    <h1 class="Ft-Transcendence">Ft-Transcendence</h1>
      
	<div class="welcome_box">
		<h1 class="welcome_h1">
            <span class="Bienvenue">Bienvenue,</span>
            <span class="typewriter">{user?.username}</span>
        </h1>
        <img class="boune" src="/img/Bounejump.gif" alt="">
	</div>

    <footer class="footer">
        <p>Un projet de 
          <span class="footer_name homepage_redirect_pointer" on:click={() => redirectToGithub('ktroude')}>Ktroude</span>,
          <span class="footer_name homepage_redirect_pointer" on:click={() => redirectToGithub('Krokmouuu')}>Bleroy</span>,
          <span class="footer_name homepage_redirect_pointer" on:click={() => redirectToGithub('Lmaujean')}>Lmaujean</span>,
          <span class="footer_name homepage_redirect_pointer" on:click={() => redirectToGithub('PKLB')}>Ple-berr</span> et
          <span class="footer_name homepage_redirect_pointer" on:click={() => redirectToGithub('venum78160')}>vl-hotel</span>
        </p>
      </footer>
	  {/if}
	</body>

<!-- ****************************** -->
<!-- **********   SCRIPT  ********* -->
<!-- ****************************** -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from "$app/navigation";
  import {fetchData, fetchAccessToken} from "../../API/api";
	import { redirect } from '@sveltejs/kit';
  import {io, Socket} from 'socket.io-client';

  let socket: Socket;

let loading = false;
  let user: User;
    interface User {
        id: number;
        pseudo: string;
        firstName: string;
        lastName: string;
        username: string;
    }

    async function redirectToGithub(username) {
      const accessToken = await fetchAccessToken();
      const response = await fetch(`http://localhost:3000/users/achievements/${user.id}/updateAchievements`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              },
              body: JSON.stringify({achievement: 'ImCurious' })
            });
          if (!response.ok)
            console.log("Error update achievements <ImCurious>")
    window.open(`https://github.com/${username}`, '_blank');
    }

    onMount(async function() {
		user = await fetchData();
    if (!user)
      await goto('/');
    else
    {
      const socket = io('http://localhost:3000');
      socket.on('connect', async function() {			
        socket.emit('userConnected', { pseudo: user.pseudo });
      });
      if (user.pseudo === 'yoshi' || user.pseudo === 'tac' || user.pseudo === 'mboy' || user.pseudo === 'palmi')
      {
        const accessToken = await fetchAccessToken();
        if (accessToken)
        {
          const response = await fetch(`http://localhost:3000/users/achievements/${user.id}/updateAchievements`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              },
              body: JSON.stringify({achievement: 'TheDarkSide' })
            });
          if (!response.ok)
            console.log("Error update achievements <TheDarkSide>")
        }
      }
    }
	loading = true;
	});

	function fade(thisplace:string) {
		document.body.classList.add('fade-out');
		console.log("switching page....");
		setTimeout(() => {
		// window.location.href = href;
			goto(thisplace);
			document.body.classList.remove('fade-out');
		}, 400);
	}

</script>