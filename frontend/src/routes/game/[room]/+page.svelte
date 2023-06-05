<style>
	@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@700&family=Signika+Negative:wght@500&display=swap');

	*{
		font-family: 'Roboto', sans-serif;
		margin:0px;
		padding:0px;
	}

	body {
		margin: 0;
		padding:0px;
		height: 100vh;
		width:100vw;
		overflow: hidden;
	}

	button {
		display: block;
		margin: 0 auto;
		padding: 10px 20px;
		background-color: #000000;
		color: #fff;
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

	.game_navbar{
		height:50px;
		width:100%;
		background:#201207;
		display: flex;
		flex-direction: row;
		align-items: center;
	}

</style>

<body>
	<div class="game_navbar">
		<button class="button_nav" on:click={() => goto('/homepage')}>Home</button>
	</div>
</body>


<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
    import { fetchAccessToken, fetchData, fetchDataOfUser, fetch2FA } from '../../../API/api';
	
	/*
	Room ID = id of user1 + id of user2?
	Only accepts the 2 selected users (checks ID or username with cookie)
	*/

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

	let realUser = ''; 
	let currentUser = ''; 
	import {io, Socket} from 'socket.io-client';

	async function loadpage() {
		user = await fetchData();
		if (!user)
		{
			goto('/');
			return;
		}
		const FA2 = await fetch2FA(user.id);
		if (FA2 == true)
		{
			goto('auth/2fa');
			return ;
		}
		const socket = io(`http://${LOCALHOST}:3000`); // Connect to the server
			socket.on('connect', async function() {			
				socket.emit('userConnected', { pseudo: user.pseudo }); // Send the user pseudo to the server
			});
	}

	onMount(() => {
		loadpage();
	});
</script>