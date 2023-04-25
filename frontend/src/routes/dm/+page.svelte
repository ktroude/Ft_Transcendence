<script lang="ts">
	import { goto } from '$app/navigation';
	import { io, Socket } from 'socket.io-client';

	import { onMount } from 'svelte';

	let socket:Socket;
    let currentUser:any = null;
    let currentRoom:any = null;
    let selectedUser:any;
    let roomList:any[] = [];
    let messages:any[] = [];
    let loading = false;
    let contactList:any[] = [];





    async function handleClickRoomButton(roomId: number) {
        socket.emit('getMessagesOfRoom', roomId);
    }

    function handleCheckProfileButton() {
		goto(`/profile/${selectedUser.id}`);
    }

    function handleBlockButton() {

    }

    function handleInviteGameButton() {

    }

    function handleConnectedUserButton() {

    }

    async function fletchContactList() {
        try{
            const cookies = document.cookie.split(';');
            const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));
		const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
		if (accessToken) {
			const headers = new Headers();
			headers.append('Authorization', `Bearer ${accessToken}`);
                    // remplacer avec l'adresse celle pour fletch les contactes du mec
			//const response = await fetch('http://localhost:3000/', { headers });
			// const data =  await response.json();
            // contactList = data;
        }
    }
    catch {}
    }

    async function fletchDirectMessageRoomData() {
        try{
            const cookies = document.cookie.split(';');
            const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));
		const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
		if (accessToken) {
			const headers = new Headers();
			headers.append('Authorization', `Bearer ${accessToken}`);
			const response = await fetch('http://localhost:3000/dm/getRoomData', { headers });
			const data =  await response.json();
            currentUser = data.user;
            roomList = data.rooms;
            roomList.forEach(elem => {
                if (currentUser.id === elem.ownerOne.id) {
                    elem.name = elem.ownerTwo.username;
                }
                if (currentUser.id == elem.ownerTwo) {
                    elem.name = elem.ownerOne.username;
                }
            });
        }
    }
    catch {
        console.log('Erreur de chargement si tu vois ce message redirige vers /index parce que le fletch de fletchDirectMessageRoomData a echoué');
    }
    }

	onMount(async() => {
		const cookies = document?.cookie?.split(';');
		const accessTokenCookie = cookies?.find((cookie) =>
			cookie?.trim()?.startsWith('access_token=')
		);
		const access_token = accessTokenCookie ? accessTokenCookie?.split('=')[1] : null;
        if (!access_token) {
                window.location.pathname = '/';
            }
		socket = io('http://localhost:3000', {
			extraHeaders: {
				Authorization: 'Bearer ' + access_token
			}
		});

        if (!socket) {
            window.location.pathname = '/'; 
        }
        socket.on('DmRoomCreated', async(data) => {
            if (currentUser.id === data.user1.id || currentUser.id === data.user2.id) {
                roomList = [...roomList, data.room]
            }
        });
        socket.on('newDirectMessage', async(data) => {
            if (currentRoom.id === data.room.id) {
                messages = [...messages, data.message];
            }
        });
        socket.on('DirectMessageRoomData', async(data) => {
            if (data.user.id === currentUser.id) {
                roomList = data.rooms;
            }
        });
        socket.on('returnDirectMessage', async(data) => {
            if (currentUser.id === data.user.id) {
                messages = data.messages;
                currentRoom = data.room;
                selectedUser = data.selectedUser;
            }
        });
        await fletchContactList();
        await fletchDirectMessageRoomData();
        loading = true;
    });









</script>

    <svelte:head>
        <!-- <link rel="stylesheet" href="/style.css" /> -->
        <link rel="preload" href="/img/bg1.jpg" as="image">
        <link rel="preload" href="/homepage_style.css" as="style"/>
        <link rel="stylesheet" href="/homepage_style.css" />
        <link rel="stylesheet" href="/navbar.css" />
        <link rel="stylesheet" href="/dm_style.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@700&display=swap"
            rel="stylesheet"
        />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
    </svelte:head>
    
    <body style="margin:0px; padding:0px; background-image:url('/img/bg1.jpg');
    background-position: center; background-size: cover ; overflow: hidden; width: 100vw;height: 100vh;">
        {#if loading === true}
        <div class="game_navbar">
            <div class="button_box">
                <img class="button_picture" src="/img/home_icone.png" />
                <button class="button_nav" on:click={() => fade('/homepage')}>Home</button>
            </div>
    
            <div class="button_box">
                <img class="button_picture" src="/img/profile_icone.png" />
                <button class="button_nav" on:click={() => fade(`/profile/${currentUser.id}`)}>Profile</button
                >
            </div>
    
            <div class="button_box">
                <img class="button_picture" src="/img/game_icone.png" />
                <button class="button_nav" on:click={() => fade('/game')}>Game</button>
            </div>
    
            <div class="button_box">
                <img class="button_picture" src="/img/chat_icone.png" />
                <button class="button_nav" on:click={() => fade('/chat')}>Chat</button>
            </div>
        </div>
    
        <div class="dm_body">
            <!------------------ LEFT BLOC ----------------------->
            <div class="left_bloc">
                <div class="dm_list_bloc">
                    <h2 class="connected_users_title">Messages privés:</h2>
                        {#each roomList as chatRoom}
                            <button class="user" on:click={() => handleClickRoomButton(chatRoom.id)}>
                                {chatRoom.name}
                            </button>
                        {/each}
                </div>
            </div>
            <!------------------ MIDDLE BLOC -------------------->
            <div class="middle_bloc">
                <div class="chat_messages_bloc" id="chat-messages">
    
                </div>
                <div class="message_input_container">
                    <form class="send_message_form">
                        <input
                            class="message_input"
                            type="text"
                            id="message"
                            name="message"
                        />
                        <button
                            class="send-message-button"
                            id="sendMessageButton"
                            type="submit"
                            disabled>
                            <img class="sent_icone" src="/img/edit_profile.png" /></button
                        >
                    </form>
                </div>
            </div>
            <!----------------- RIGHT BLOC ---------------------->
            <div class="right_bloc">
                <div class="connected_users">
                    <h2 class="connected_users_title">Utilisateurs connectés:</h2>
                    {#each contactList as contact}
                        {#if contact?.connected == true}
                            <button class="connected_contact_button" on:click={handleConnectedUserButton}>{contact.username}</button>
                        {:else}
                            <button class="disconnected_contact_button" on:click={handleConnectedUserButton}>{contact.username}</button>
                        {/if}
                    {/each}
                </div>
            </div>
        </div>
    
    
    
        {/if}
    </body>
