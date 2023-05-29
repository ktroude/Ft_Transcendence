<script lang="ts">
	import { goto } from '$app/navigation';
	import { io, Socket } from 'socket.io-client';
	import { page } from '$app/stores';
    import { onMount } from 'svelte';

	let socket:Socket;
    let currentUser:any = null;
    let currentRoom:any = null;
    let selectedUser:any;
    let roomList:any[] = [];
    let messages:any[] = [];
    let loading = false;
    let contactList = [];
	let notif:any = null;
	let anim = false;

    async function handleClickRoomButton(roomId: number) {
        socket.emit('getMessagesOfRoom', roomId);
    }

    function handleCheckProfileButton() {
        goto(`/profile/${selectedUser.id}`);
    }


    function handleBlockButton() {

    }

    function handleInviteGameButton() {
		const url = '' // get url de val pour le jeu ici meme
		const data = {
			invited: selectedUser,
			invitedBy: currentUser.username,
			url: url,
		}
		socket.emit(`InvitedInGame`, data)
    }

    function handleConnectedUserButton() {

    }

    function sendMessage(event: Event, messageInput: HTMLInputElement, currentRoom:any) {
		event.preventDefault();
		if (
			messageInput &&
			messageInput.value &&
			messageInput.value.length &&
			currentRoom &&
			currentRoom.id
		) {
			const messageValue = messageInput.value;
			const data = {
				roomId: currentRoom.id,
				content: messageValue
			};
				socket.emit('sendDirectMessage', data);
			messageInput.value = '';
		}
	}

    function handleMessageInput(event: any) {
		const message = event.target.value;
		const sendButton = document.getElementById('sendMessageButton');
		if (sendButton instanceof HTMLButtonElement) {
			sendButton.disabled = message.trim().length === 0;
		}
	}

	function handleMessageKeyPress(event: any) {
		if (event.key === 'Enter') {
			const sendButton = document.getElementById('sendMessageButton');
			if (sendButton instanceof HTMLButtonElement && !sendButton.disabled) {
				sendButton.click();
			}
		}
	}

    async function isExist() {
        try {

            const cookies = document.cookie.split(';');
            const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));
		    const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
		    if (accessToken) {
                const headers = new Headers();
                headers.append('Authorization', `Bearer ${accessToken}`);
                const response = await fetch(`http://localhost:3000/dm/who?id=${$page.params.user}`, { headers });
                const data =  await response.json();
                console.log('data ====', data);
                if (!data) {
                    goto('/dm');
                    return ;
                }
                selectedUser = data.who;
                messages = data.msg;
                currentRoom = data.room;
            }
        }
        catch {
            goto('/dm');
        }
    }


    async function fetchContactList() {
        try{
                const cookies = document.cookie.split(';');
                const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));
            const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
		if (accessToken) {
			const headers = new Headers();
			headers.append('Authorization', `Bearer ${accessToken}`);
                    // remplacer avec l'adresse celle pour fetch les contactes du mec
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
            for (let i = 0; i < roomList.length; i++) {
                if (currentUser.id === roomList[i].ownerOne.id) {
                    roomList[i].name = roomList[i].ownerTwo.username;
                }
                else if (currentUser.id == roomList[i].ownerTwo) {
                    roomList[i].name = roomList[i].ownerOne.username;
                }            
            }
        }
            console.log('RL ==', roomList);
    }
    catch {
        console.log('Erreur de chargement si tu vois ce message redirige vers /index parce que le fletch de fletchDirectMessageRoomData a echoué');
    }
    }

	function createPopup()
	{
		const boxito = document.querySelector("body");
		const toast = document.createElement("div");
		toast.innerHTML = `<div class="popup">
									<div class="popup_img">
									</div>
									<div class="popup_title_text_box">
										<h4 class="popup_title">Invited by:</h4>
										<button class="popup_button" on:click=>Accept</button>
										<button class="popup_button" on:click=>Deny</button>
									</div>
							</div>`
		boxito.appendChild(toast);
	}

	function removePopup() {
		const boxito = document.querySelector("popup");
		toast.remove();
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
            console.log('CU ==', currentRoom);
            console.log('data ==', data)
            if (currentRoom.id === data.message.directMessageRoomId && data.blocked === false) {
                	messages = [...messages, data.message];
            }
            else if (data.blocked === true && data.user.id === currentUser.id) {
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
		socket.on('InvitedNotif', async(data) => {
			if (data.invited.id === currentUser.id)
				notif.display = true;
                notif.url = data.url;
                notif.invitedBy = data.invitedBy;
				createPopup(true);
		});

        await isExist();
        await fetchContactList();
        await fletchDirectMessageRoomData();
        
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
                    {#if messages && messages.length}
								{#each messages as msg}
									<p class="message_text">
										{#if msg.senderPseudo == 'server'}
											<button class="server_message">
												{msg.senderPseudo}
											</button>
										{/if}
										{#if msg.senderPseudo != 'server'}
											<button
												class="pseudo-button-message"
											>
												{msg.senderPseudo}
											</button>
										{/if}
										<span class="message">
											: {msg.content}
										</span>
									</p>
								{/each}
							{/if}
                    <form class="send_message_form">
                        <input
                            on:input={handleMessageInput}
							on:keypress={handleMessageKeyPress}
                            class="message_input"
                            type="text"
                            id="message"
                            name="message"
                        />
                        <button
                        on:click={(event) => {
                            const messageInput = document.getElementById('message');
                            if (messageInput instanceof HTMLInputElement) {
                                sendMessage(event, messageInput, currentRoom);
                                messageInput.value = '';
                            }
                        }}
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
                    <!-- {#each contactList as contact}
                        {#if contact?.connected == true}
                            <button class="connected_contact_button" on:click={handleConnectedUserButton}>{contact.username}</button>
                        {:else}
                            <button class="disconnected_contact_button" on:click={handleConnectedUserButton}>{contact.username}</button>
                        {/if}
                    {/each} -->
                </div>
                <div class="selctedUser_button_settings">
                    <buton on:click={handleCheckProfileButton}>Voir le profil</buton>
                    <button on:click={createPopup}>Proposer une partie</button>
                </div>
            </div>
        </div>
    
    
    
        {/if}
    </body>