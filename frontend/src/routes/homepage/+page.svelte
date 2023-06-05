<svelte:head>
	<title>Homepage</title>
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
            <img class="button_picture" src="/img/home_icone.png" alt=''>
            <button class="button_nav" on:click={() => fade('/homepage')}>Home</button>
        </div>

        <div class="button_box">
            <img class="button_picture" src="/img/profile_icone.png" alt=''>
            <button class="button_nav" on:click={() => fade(`/profile/${user.id}`)}>Profile</button>
        </div>

        <div class="button_box">
            <img class="button_picture" src="/img/game_icone.png" alt=''>
            <button class="button_nav" on:click={() => fade('/game')}>Game</button>
        </div>

        <div class="button_box">
            <img class="button_picture" src="/img/chat_icone.png" alt=''>
            <button class="button_nav" on:click={() => fade('/chat')}>Chat</button>
        </div>
        <div class="button_box">
            <button class="button_nav" on:click={() => fade('/dm')}>✉️ DM</button>
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
          <span class="footer_name homepage_redirect_pointer" on:click={() => redirectToGithub('ktroude')} on:keydown>Ktroude</span>,
          <span class="footer_name homepage_redirect_pointer" on:click={() => redirectToGithub('Krokmouuu')} on:keydown>Bleroy</span>,
          <span class="footer_name homepage_redirect_pointer" on:click={() => redirectToGithub('Lmaujean')} on:keydown>Lmaujean</span>,
          <span class="footer_name homepage_redirect_pointer" on:click={() => redirectToGithub('PKLB')} on:keydown>Ple-berr</span> et
          <span class="footer_name homepage_redirect_pointer" on:click={() => redirectToGithub('venum78160')} on:keydown>vl-hotel</span>
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
    import { fetchAccessToken, fetchData, fetchDataOfUser, fetchFriend, fetchDataOfUsername, fetch2FA} from '../../API/api';
	import { redirect } from '@sveltejs/kit';
	import {io, Socket} from 'socket.io-client';
	import { LOCALHOST } from "../../API/env";

	let socket: Socket;
	let anim:any = false;

	let all_achievements:any = {};


	let loading:boolean = false;
	let user: User;
    interface User {
        id: number;
        pseudo: string;
        firstName: string;
        lastName: string;
        username: string;
    }

    async function redirectToGithub(username:any) {
      	const accessToken = await fetchAccessToken();
      	const response = await fetch(`http://${LOCALHOST}:3000/users/achievements/${user.id}/updateAchievements`, {
			method: 'PUT',
			headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${accessToken}`
			},
			body: JSON.stringify({achievement: 'ImCurious' })
            });
		if (!response.ok)
            console.log("Error update achievements <ImCurious>")
		else if (anim == false){
			for (const [key, value] of Array.from(all_achievements) as Iterable<any>) {
				if (key == "ImCurious" && value == false)
				{
					anim = true;
					const boxito = document.querySelector("body");
					const toast = document.createElement("div");
					toast.innerHTML = `<div class="popup">
												<div class="popup_img">
												</div>
												<div class="popup_title_text_box">
													<h4 class="popup_title">I'm Curious</h4>
													<h5 class="popup_text">Check one of our Githubs.</h5>
												</div>
										</div>`;
					boxito?.appendChild(toast);
					setTimeout(() => removePopup(toast), 3000);
				}
			}
		}
		window.open(`https://github.com/${username}`, '_blank');
}

	const removePopup = (toast:any) => {
    if(toast.timeoutId) clearTimeout(toast.timeoutId); 
    setTimeout(() => toast.remove(), 3000);
	getAllAchievements();
	anim = false;
	}

    onMount(async function() {
	user = await fetchData();
    if (!user)
	{
		await goto('/');
		return;
	}
	const FA2 = await fetch2FA(user.id)
	if (FA2 == true)
	{
		await goto('/auth/2fa');
		return;
	}
    else
    {
      const socket = io(`http://${LOCALHOST}:3000`);
      socket.on('connect', async function() {			
        socket.emit('userConnected', { pseudo: user.pseudo });
      });
    
      if (user.pseudo === 'yoshi' || user.pseudo === 'tac' || user.pseudo === 'mboy' || user.pseudo === 'palmi')
      {
        const accessToken = await fetchAccessToken();
        if (accessToken)
        {
          const response = await fetch(`http://${LOCALHOST}:3000/users/achievements/${user.id}/updateAchievements`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              },
              body: JSON.stringify({achievement: 'TheDarkSide' })
            });
          if (!response.ok)
            console.log("Error update achievements <TheDarkSide>")
		  else
		  {
			anim = true;
					const boxito = document.querySelector("body");
					const toast = document.createElement("div");
					toast.innerHTML = `<div class="popup">
												<div class="popup_img">
												</div>
												<div class="popup_title_text_box">
													<h4 class="popup_title">The Dark Side</h4>
													<h5 class="popup_text">Log in as a bocal member</h5>
												</div>
										</div>`;
					boxito?.appendChild(toast);
					setTimeout(() => removePopup(toast), 3000);
		  }
        }
      }
    }
	await getAllAchievements();
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


	async function getAllAchievements() {
		const accessToken = await fetchAccessToken();
		if (accessToken) {
			const url = `http://${LOCALHOST}:3000/users/achievements/${user.id}/getAchievements`;
			const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${accessToken}`,
			},
			});
			const data = await response.json();
			if (data)
				all_achievements = new Map(data);
			}
		else 
			console.log('Error: Could not get achievements');
	}
</script>