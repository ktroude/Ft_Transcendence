<svelte:head>
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
			{#if user?.username === currentUser}
				<div class="button_box">
					<img class="button_picture" src="/img/profile_icone.png">
					<button class="button_nav">Profile</button>
				</div>
				{:else}
				<div class="button_box">
					<img class="button_picture" src="/img/profile_icone.png">
					<button class="button_nav" on:click={() => fade(`/profile/${realUser}`) && loadpage()}>Profile</button>
				</div>
			{/if}
			<div class="button_box">
				<img class="button_picture" src="/img/game_icone.png">
				<button class="button_nav" on:click={() => fade('/game')}>Game</button>
			</div>

			<div class="button_box">
				<img class="button_picture" src="/img/chat_icone.png">
				<button class="button_nav" on:click={() => fade('/chat')}>Chat</button>
			</div>
		</div>
		<div class="main_profile">
			<div class="main_box">
				<div class="username_bloc">
					<h1>{user?.username}</h1>
					{#if user?.username != currentUser && is_blocked === false}
						<button class="block_button" on:click={() => block(realUser, user.pseudo)}>X</button>
					{/if}
					{#if user?.username != currentUser && is_blocked === true}
						<button class="unblock_button" on:click={() => unblock(realUser, user.pseudo)}>O</button>
					{/if}
				</div>
				<h3>{user?.firstname} {user?.lastname}</h3>
				<h3>Level: {user?.level}</h3>
				<h3>Created: {new Date(user?.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
				<!-- svelte-ignore a11y-img-redundant-alt -->
				<img class=".profile_img" src={imageURL} alt="OH Y'A PAS D'IMAGE MON GADJO" />
				{#if user?.username === currentUser} 
					<button class="edit_button" on:click={() => fade('/profile/edit')}>Edit profile</button>
				{:else}
				<button class="send_message" on:click={() => sendMessage()}>
				<img class="button_picture" src="/img/chat_icone.png" alt="Image button"/>
				</button>
			{/if}
		</div>
		</div>
	{/if}
</body>

<!-- ****************************** -->
<!-- **********   SCRIPT  ********* -->
<!-- ****************************** -->

<script lang="ts">
  	
	import {io, Socket} from 'socket.io-client';
	import { page } from '$app/stores';
	import { goto } from "$app/navigation";
    import { onMount } from 'svelte';
    import { Buffer } from 'buffer';
    import { fetchAccessToken, fetchData, fetchDataOfUser } from '../../../API/api';
	
	let socket: Socket;
    interface User {
		id: number;
		pseudo: string;
		firstName: string;
		lastName: string;
		picture: string;
		username: string;
		createdAt: Date;
		level: any;
    }
	let loading = false;
	let imageURL: string;
	let user: User;
	let blockedusers: any[] = [];

	async function getImageURL() {
		const buffer = Buffer.from(user.picture, 'base64'); // Convert the base64-encoded string to a buffer
		const blob = new Blob([buffer], { type: 'image/png' }); // Convert the buffer to a blob
		imageURL = URL.createObjectURL(blob); // Create a URL for the blob
		
		//A Blob is typically used to store data that is too large to be stored in a traditional database column or in memory
		//or when the data needs to be streamed or transmitted over a network.
	}
	
  async function sendMessage() // Redirect to chat with user
  {
    const accessToken = await fetchAccessToken();
    if (accessToken)
      goto(`/chat/dm/${user.id}`);
    else
      console.log('Error: Could not send message');
  }

	async function block(realUser, blockerUser) { // block user
		await fetchData();
		const accessToken = await fetchAccessToken();
		if (accessToken) {
			const response = await fetch(`http://localhost:3000/users/${realUser}/block`, {
				method: 'PUT',
                headers: {
					'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({block: blockerUser})
            });
			is_blocked = true;
        } else
			console.log('Error: Could not delete friend');
    }
	
	async function checkBlocked(realUser, blockerUser) { // check if user is blocked
    const accessToken = await fetchAccessToken();
    const url = `http://localhost:3000/users/${realUser}/checkBlock?block=${blockerUser}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    if (response.ok) {
        is_blocked = true;
    } else {
        is_blocked = false;
    }
    return is_blocked;
}

	async function unblock(realUser, blockerUser) { // unblock user
		await fetchData();
		const accessToken = await fetchAccessToken();
		if (accessToken) {
            const response = await fetch(`http://localhost:3000/users/${realUser}/deleteBlock`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({block: blockerUser})
            });
			is_blocked = false;
        } else
			console.log('Error: Could not delete friend');
    }

	let realUser: string; 
	let currentUser = ''; 
	let is_blocked: any;
	
	async function loadpage() {
		if (!user)
			goto('/');
		if ($page.params.user == user.id.toString()) // If the user is on his own profile
		{
			user = await fetchData();
			currentUser = user.username;
			await getImageURL();
		}
		else // If the user is on another profile
		{
			realUser = user.username;
			user = await fetchDataOfUser($page.params.user);
			if (!user)
			{
				user = await fetchData();
				return await goto(`/homepage`);
			}
			is_blocked = checkBlocked(realUser, user.username);
			getImageURL();
		}
	}
	onMount(async function() {
		user = await fetchData(); // Catch the user
		if (!user)
			await goto('/'); // If no user redirect
		else
		{
			await loadpage();
			const socket = io('http://localhost:3000'); // Connect to the server
			socket.on('connect', async function() {			
				socket.emit('userConnected', { pseudo: user.pseudo }); // Send the user pseudo to the server
			});
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