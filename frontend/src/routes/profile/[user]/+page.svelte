<svelte:head>
	<link rel="stylesheet" href="/style_profile.css" />
</svelte:head>

<!-- ****************************** -->
<!-- ********** HTML CODE ********* -->
<!-- ****************************** -->

<body>
	<div class="game_navbar">
		<button class="button_nav" on:click={() => goto('/homepage')}>Home</button>
		<!-- <button on:click={() => goto('/profile/edit')}>Edit profile</button> -->
		{#if user?.username === currentUser}
			<button class="button_nav">Profile</button>
		{:else}
			<button class="button_nav" on:click={() => goto(`/profile/${realUser}`) && loadpage()}>Profile</button>
		{/if}
		<button class="button_nav" on:click={() => goto('/chat')}>Chat</button>
		<button class="button_nav" on:click={() => goto('/game')}>Game</button>
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
		<img src={imageURL} alt="OH Y'A PAS D'IMAGE MON GADJO" />
		 {#if user?.username === currentUser} 
		 <button on:click={() => goto('/profile/edit')}>Edit profile</button>
		 {/if}
	</div>
</body>

<!-- ****************************** -->
<!-- **********   SCRIPT  ********* -->
<!-- ****************************** -->

<script lang="ts">
  	
	import { page } from '$app/stores';
	import { goto } from "$app/navigation";
    import { onMount } from 'svelte';
    import { Buffer } from 'buffer';
    import { fetchAccessToken, fetchData, fetchDataOfUser } from '../../../API/api';

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
	
	let imageURL: string;
	let user: User;
	let blockedusers: any[] = [];

	async function getImageURL() {
		const buffer = Buffer.from(user.picture, 'base64'); // Convert the base64-encoded string to a buffer
		const blob = new Blob([buffer], { type: 'image/png' }); // Convert the buffer to a blob
		imageURL = URL.createObjectURL(blob); // Create a URL for the blob
	}
	
	async function block(realUser, blockerUser) {
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
	
	async function checkBlocked(realUser, blockerUser) {
	console.log("zeubi", realUser, blockerUser);
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

	async function unblock(realUser, blockerUser) {
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

		// console.log(realUser, 'is blocking', user.pseudo);
    }

	let realUser = ''; 
	let currentUser = ''; 
	let is_blocked: any;
	
	async function loadpage() {
		user = await fetchData();
		if ($page.params.user == user.pseudo)
		{
			getImageURL();
			currentUser = user.username;
		}
		else
		{
			realUser = user.pseudo;
			user = await fetchDataOfUser($page.params.user);
			is_blocked = checkBlocked(realUser, user.pseudo);
			getImageURL();
		}
	}
	onMount(() => {
		loadpage();
	});

</script>
