	<svelte:head>
		<title>Game</title>
		<link rel="preload" href="/img/bg2.jpeg" as="image">
		<link rel="preload" href="/game_style.css" as="style"/>
		<link rel="stylesheet" href="/profile_style.css" />
		<link rel="stylesheet" href="/game_style.css" />
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
	
	<body style="margin:0px; padding:0px; background-image:url('/img/bg2.jpeg');
	background-position: center; background-size: cover ; overflow: hidden; width: 100vw;height: 100vh">
	{#if loading == true}
			<div class="game_navbar">
	
				<div class="button_box">
					<img class="button_picture" src="/img/home_icone.png" alt="">
					<button class="button_nav" on:click={() => location.href = '/homepage'}>Home</button>
				</div>
	
				<div class="button_box">
					<img class="button_picture" src="/img/profile_icone.png" alt="">
					<button class="button_nav" on:click={() => location.href = `/profile/${user.id}`}>Profile</button>
				</div>
	
				<div class="button_box">
					<img class="button_picture" src="/img/game_icone.png" alt="">
					<button class="button_nav" on:click={() => location.href = '/game'}>Game</button>
				</div>
	
				<div class="button_box">
					<img class="button_picture" src="/img/chat_icone.png" alt="">
					<button class="button_nav" on:click={() => location.href = '/chat'}>Chat</button>
			</div>
			<div class="button_box">
				<button class="button_nav" on:click={() => location.href = '/dm'}>✉️ DM</button>
			</div>
			</div>
	
				<div class="full_page">
					<div class="friendlist_box">
						<div class="friend-list">
							<div class="friendlist_title">Friendlist</div>
							<div class="addfriend_bloc"> <input class="input_friend" type="text" bind:value={friendNameAdd} on:keydown={(event) => handleEnter(event)}/>
								<button class="addfriend_button" on:click={handleAddFriend}>+</button></div>
								<ul class="ul_friends">
									{#if friends}
									{#each friends as [friendName, connected]}
									<!-- svelte-ignore a11y-click-events-have-key-events -->
									<li class="friends_list" on:click={() => handleFriendClick(friendName)}>
										<div class="friendBloc">
											{#if connected == 0}
												<div class="red_dot"></div>
											{/if}
											{#if connected == 1}
												<div class="green_dot"></div>
											{/if}
											{#if connected == 2}
												<div class="blue_dot"></div>
											{/if}
											<span class="friendname">{friendName}</span>
										 </div>
										 {#if clickedFriend === friendName && showButtons == true}
											 <button class="friend_button" on:click={() => {if (showButtons == true) handleMessageFriend(friendName)}}>💬</button>
											 <button class="friend_button" on:click={() => {if (showButtons == true) handleInviteGameButton(friendName)}}>🎮</button>
											 <button class="friend_button" on:click={() => {if (showButtons == true) handleSearchProfile(friendName)}}>🔍</button>
											 <button class="friend_button" on:click={() => {if (showButtons == true) handleDeleteFriend(friendName)}}>❌</button>
										 {/if}
									 </li>
									 {/each}
									{/if}
								</ul>
							</div>
					</div>
	
	
					<div class="lobby_box">
						<div class="lobby_title">LOBBY</div>
	
						{#if waiting}
							<button class="connect_button" on:click={connect}><span class="button_text_anim">WAITING...</span></button>
						{:else}
							{#if room_pong_id}
								<button class="connect_button">GAME FOUND</button>
								{:else}
								<button class="connect_button" on:click={connect}><span class="button_text_anim">SEARCH OPPONENT</span></button>
							{/if}
						{/if}
	
					</div>
	
				<div class="connected_box">
					<div class="search_profile">
						<div class="connected_users_bloc">
							<div class="connected_title">Connected</div>
							<ul class="ul_friends">
								{#each connectedUsers as x }
									<li class="friends_list">
										<div class="friend_line">
											{#if x.connected == 2}
												<div class="blue_dot"></div>
											{/if}
											{#if x.connected == 1}
												<div class="green_dot"></div>
											{/if}
											{#if x.connected == 0}
											<div class="red_dot"></div>
											{/if}
											<div class="connectedUsersName">{x.username}</div>
										</div>
									</li>
								{/each}
							</ul>
							</div>
						</div>
					</div>
			</div>
	{/if}
	</body>
	<!-- ****************************** -->
	<!-- **********   SCRIPT  ********* -->
	<!-- ****************************** -->
	
	<script lang="ts">
		import {io, Socket} from 'socket.io-client';
		import { onMount } from 'svelte';
		import { Room } from 'colyseus.js';
		import { Buffer } from 'buffer';
		import { fetchAccessToken, fetchData, fetchFriend, fetchDataOfUser, fetch2FA } from '../../API/api';
		import { page } from '$app/stores';
		import { navigate } from 'svelte-routing';
		import { xlink_attr } from 'svelte/internal';
		import { LOCALHOST } from "../../API/env";
		let socket: Socket;
		let notif:any = {url:'', display:false, invitedBy:''};
		let pending_invitation = false;
		let previousFriend: string;
		let showButtons = false;
		let clickedFriend: string;
		let friends: any[] = [];
		let friendNameAdd: string = '';
		let searchProfile: string = '';
		let connectedUsers:any[] = [];
		let loading = false;
		let friendUser: User;
		let user: User;
		interface User {
			id: number;
			pseudo: string;
			firstName: string;
			lastName: string;
			picture: string;
			username: string;
			createdAt: Date;
		}
	
		let Colyseus;
		let client;
		let room;
		let room_pong_id = null;
		let room_pong;
		let first_connection = true;
		let waiting = false;
		let playerId;
		let mess = null;
	
		async function redirectToGame() {
		  return new Promise((resolve) => {
		if (room_pong_id) {
		  const url = `http://${LOCALHOST}:5173/game/pong_game?room_id=${room_pong_id}`;
		  window.location.href = url;
		  resolve();
		} else {
		  // Si room_pong_id n'est pas encore rempli, attendez 1 seconde et réessayez
		  setTimeout(async () => await redirectToGame().then(resolve), 1000);
		}
	  });
	}
	
	async function handleEnter(event:any)
		{
			if (event.key === 'Enter') {
				handleAddFriend();
			}
		}
	
	async function connect()
	{
	  const accessToken = await fetchAccessToken();
	  if (!accessToken)
	  {
		location.href = '/';
		return ;
	  }
	  if (waiting == false)
	  {
		waiting = true;
		Colyseus = await import("colyseus.js");
		if(!client)
			client = new Colyseus.Client(`ws://${LOCALHOST}:3001`);
		room = await client.joinOrCreate("ranked");
		room.onMessage("connect", (message) => {
			playerId = message.playerId;
			// localStorage.setItem("playerId", playerId);
		});
		room.onMessage('waiting', (message) => { waiting = true; });
		room.onMessage('seat', (message) => {
			room_pong_id = message;
			waiting = false;
		  redirectToGame();
		});
	  }
	  else{
		waiting = false;
		room.send('waiting',  { waiting : false});
	  }
	}
	
		async function getConnectedUsers() {
		const accessToken = await fetchAccessToken();
		if (accessToken) {
			const response = await fetch(`http://${LOCALHOST}:3000/websocket/getClient`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`
			},
			});
			if (response.ok)
				connectedUsers = await response.json();
		}
	}
	
		function fade(thisplace:string) {
			document.body.classList.add('fade-out');
			setTimeout(() => {
			// window.location.href = href;
				location.href = thisplace;
				document.body.classList.remove('fade-out');
			}, 400);
		}
	
		async function handleSearchProfile(searchProfile: string) {
			if (!searchProfile) {
				return;
			}
			const accessToken = await fetchAccessToken();
			if (accessToken) {
				const url = `http://${LOCALHOST}:3000/users/${searchProfile}/search`;
				const response = await fetch(url, {
					method: 'GET',
					headers: {
					'Authorization': `Bearer ${accessToken}`,
					},
				});
				const userExists = await response.json(); // Parse response body as JSON
				if (userExists) { // Check if user exists
					location.href = `/profile/${userExists.id}`;
				} else {
					return;
				}
			} 
		}
	
		async function handleFriendClick(friendName: string) {
			friends = await fetchFriend(user.pseudo);
			clickedFriend = friendName;
			if (showButtons == false)
				showButtons = true;
			else
				showButtons = false;
			previousFriend = clickedFriend;
		}
	
		async function handleMessageFriend(friendName: any) {
			const accessToken = await fetchAccessToken();
			if (accessToken)
			{
				const url = `http://${LOCALHOST}:3000/users/${friendName}/search`;
					const response = await fetch(url, {
						method: 'GET',
						headers: {
						'Authorization': `Bearer ${accessToken}`,
						},
					});
					const userExists = await response.json(); // Parse response body as JSON
					if (userExists) { // Check if user exists
						location.href = `/dm/${userExists.id}`;
					}
			}
		}
	
		async function handleProfileFriend(friendName: any) {
			const accessToken = await fetchAccessToken();
			friendUser = await fetchDataOfUser(friendName);
			if (accessToken)
				location.href = `/profile/${friendUser.id}`;
			else
				location.href = '/';
		}
	
		async function handleDeleteFriend(friendName: any) {
			const accessToken = await fetchAccessToken();
			if (accessToken) {
				const response = await fetch(`http://${LOCALHOST}:3000/users/${user.pseudo}/deletefriend`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${accessToken}`
					},
					body: JSON.stringify({ friend: friendName })
				});
				if (response.ok)
					friends = friends.filter(friend => friend[0] !== friendName);
			} 
			else
				location.href = '/';
		}
	
		const handleAddFriend = async () => {
			if (!friendNameAdd)
				return;
			const accessToken = await fetchAccessToken();
			if (accessToken) {
				const response = await fetch(`http://${LOCALHOST}:3000/users/${user.pseudo}/friend`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${accessToken}`
					},
					body: JSON.stringify({friend: friendNameAdd.toUpperCase()})
				});
				if (response.ok) {
					friends = await fetchFriend(user.pseudo);
					friendNameAdd = '';
				}
			}
		}
	
		let newUsername: string = '';
	
		async function handleUpdateUsername() {
			if (!newUsername)
				return;
			const accessToken = await fetchAccessToken();
				if (accessToken) 
				{
					const response = await fetch(`http://${LOCALHOST}:3000/users/${user.pseudo}`, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${accessToken}`
						},
						body: JSON.stringify({ username: newUsername })
					});
					if (response.ok) {
						user.username = newUsername;
						newUsername = '';
					}
				}
		}
	
		async function friendrequest() 
		{
			friends = await fetchFriend(user.pseudo);	
		}


		async function fetchRoomGameId() {
		const cookies = document.cookie.split(';');
		const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));
		const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
		if (accessToken) {
			const headers = new Headers();
			headers.append('Authorization', `Bearer ${accessToken}`);
			const response = await fetch(
				`http://${LOCALHOST}:3000/users/getRoomId`,
				{
					headers
				}
			);
			const data = await response.json();
			return data;
		}
	}

    async function handleInviteGameButton(selectedUser:string) {
        const id = await fetchRoomGameId();
        const url = `http://${LOCALHOST}:5173/game/pong_game?room_id=${id.response}`;
		const data = {
			invited: selectedUser,
			invitedBy: user.username,
			url: url,
		}
		socket.emit(`InvitedInGame`, data);
    }

	function createPopupDM(notif:any) {
		const boxito = document.querySelector("body");
		const toast = document.createElement("div");
		toast.innerHTML = `<div class="popup">
			<div class="popup_img_2">
			</div>
			<div class="popup_title_text_box">
			<h4 class="popup_title">Invited by: `+notif.invitedBy+`</h4>
			<button class="popup_button" id="acceptButton">Accept</button>
			<button class="popup_button" id="denyButton">Deny</button>
			</div>
		</div>`;
		boxito?.appendChild(toast);
		
		const acceptButton = document.getElementById("acceptButton");
		const denyButton = document.getElementById("denyButton");

		acceptButton?.addEventListener("click", () => acceptInvitation(notif));
		denyButton?.addEventListener("click", () => removePopup(notif));
	}

	function removePopup(notif:any) {
		const data = {
				accepted: false,
    			url: notif.url,
      			target: notif.invitedBy,
			}
		socket.emit('AnswerGame', data);
		pending_invitation = false;
		const boxito = document.querySelector(".popup");
		if (boxito) {
            boxito?.remove();
            pending_invitation = false;
        }
	}

	function acceptInvitation(notif:any) {
		if (pending_invitation == true) {
			const data = {
				accepted: true,
    			url: notif.url,
      			target: notif.invitedBy,
			}
			socket.emit('AnswerGame', data);
			pending_invitation = false;
			location.href = notif.url;
		}
	}

	
		onMount(async () => {
			user = await fetchData();
			if (!user)
			{
				location.href = '/'; 
				return ;
			}
			const FA2 = await fetch2FA(user.id);
			if (FA2 == true)
			{
				location.href = 'auth/2fa';
				return ;
			}
			else
			{
				socket = io(`http://${LOCALHOST}:3000`);
				socket.on('connect', function() {			
					socket.emit('userConnected', { pseudo: user.pseudo });
				});
				await friendrequest();
				await getConnectedUsers();
				setInterval(async () => {
  					await friendrequest();
					}, 5000);
				setInterval(async () => {
  					await getConnectedUsers();
					}, 5000);
		socket.on('InvitedNotif', async(data) => {
                    if (data.invited.id === user.id) {
                        notif.display = true;
                        notif.url = data.url;
                        notif.invitedBy = data.invitedBy;
                        if (pending_invitation == false)
                        {
                    pending_invitation = true;
					createPopupDM(notif);
				}
            }
		});
        socket.on('GameAnswer', async (data) => {
		if (data.target.id == user.id) {
			if (data.accepted == false) {
				return ;
			}
			else {
				location.href = data.url;
			}
		}
	  });
			}
			loading = true;
		});
	
		export { friends, friendNameAdd, handleAddFriend, handleFriendClick, handleMessageFriend, handleProfileFriend, handleDeleteFriend, handleInviteFriend, newUsername, handleUpdateUsername };
	</script>