<style>
	*{
		font-family: 'Roboto', sans-serif;
	}
	body{
		margin:0px;
		padding:0px;
		width: 100vw;
		height: 100vh;
	}
	.main_profile {
		margin: 10px;
		display: flex;
		flex-direction: column;
	}
	.main_box {
		margin: 50px auto;
		max-width: 600px;
		padding: 20px;
		background-color: #f8f8f8;
		border-radius: 5px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		text-align: center;
		align-items: center;
	}
	button {
		display: block;
		margin: 0 auto;
		padding: 10px 20px;
		background-color: #000000;
		color: #fff;
		border: none;
		width:120px;
		height:40px;
		border-radius: 5px;
		font-size: 16px;
		cursor: pointer;
		margin: auto;
	}
	.button_nav {
		display: block;
		margin: 0 auto;
		padding: 10px 20px;
		background-color: transparent;
		border: white;
		color:rgb(146, 146, 146);
		border: none;
		width:120px;
		height:40px;
		border-radius: 5px;
		font-size: 20px;
		cursor: pointer;
		margin: auto;
	}
	.button_nav:hover {
		color:white;
		font-size: 22px;
	}
	img {
		margin-top: 20px;
		max-width: 300px;
		max-height: 200px;
		object-fit: cover;
		border: 1px solid #ccc;
		border-radius: 5px;
		align-items: center;
	}
	.game_navbar {
		height:50px;
		width:100%;
		background:#201207;
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.block_button {
		background: red;
		width:15px;
		height:15px;
		margin:auto;
		color:black;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.username_bloc {
		align-items: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		background:green;
	}
</style>

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
				{#if user?.username != currentUser}
					<button class="block_button" on:click={() => block()}>X</button>
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
	
	async function getImageURL() {
		const buffer = Buffer.from(user.picture, 'base64'); // Convert the base64-encoded string to a buffer
		const blob = new Blob([buffer], { type: 'image/png' }); // Convert the buffer to a blob
		imageURL = URL.createObjectURL(blob); // Create a URL for the blob
	}

	function block() {
		console.log(realUser, 'is blocking', user.pseudo);
	}

	let realUser = ''; 
	let currentUser = ''; 
	
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
			getImageURL();
		}
	}
	onMount(() => {

		loadpage();
	});

</script>
