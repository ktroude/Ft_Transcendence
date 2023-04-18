<script lang="ts">
	import { onMount } from 'svelte';
	import { io, Socket } from 'socket.io-client';
	import { goto } from '$app/navigation';

	// VARIABLES

	let socket: Socket;
	let isFormValid = false;
	let chatRooms: ChatRoom[] = [];
	let loading = false;
	let form: HTMLFormElement;
	let formData: RoomFormData = {
		roomName: '',
		private: false
	};
	let messages: any[];
	let currentRoom: any = {
		id: 0,
		name: ''
	};
	let currentUser: User;
	let selectedUser: User = {
		id: -1,
		pseudo: '',
		status: -3,
		room: -1
	};
	let showOptionsPseudo: string[] = [];
	let isShown = false;
	let muted: any = [];
	let banned: any = [];
	let membres: any = [];
	let blocked: any = [];
	// INTERFACES

	interface Message {
		content: string;
		sender: string;
	}

	interface ChatRoom {
		name: string;
		private: boolean;
		id: number;
		ownerId: number;
	}

	interface User {
		id: number;
		pseudo: string;
		status: number; // 2 = owner, 1 = admin, 0 = member, -1 = muted, -2 banned. -3 pas dans la room
		room: number;
	}

	interface RoomFormData {
		roomName: string;
		password?: string;
		private: boolean;
	}

	// FUNCTIONS

	function handleNameInput(event: any) {
		formData.roomName = (event.target as HTMLInputElement).value;
		checkFormValidity();
	}

	function handleInvitInput(event: any) {
		formData.roomName = (event.target as HTMLInputElement).value;
		socket.emit('addUser', {pseudo: formData.roomName, room:currentRoom});
	}

	function handlePasswordInput(event: any) {
		formData.password = (event.target as HTMLInputElement).value;
	}

	function handlePrivateOption(event: any) {
		formData.private = (event.target as HTMLInputElement).checked;
		checkFormValidity();
	}

	function checkFormValidity() {
		isFormValid = formData.roomName.length > 0 && formData.private !== undefined;
	}

	function handleMessageInput(event: any) {
		const message = event.target.value;
    	const sendButton = document.getElementById('sendMessageButton');
    	if (sendButton instanceof HTMLButtonElement) {
    	  	sendButton.disabled = message.trim().length === 0;
    	}
  	}

	function handleMessageKeyPress(event:any) {
		if (event.key === 'Enter') {
    	const sendButton = document.getElementById('sendMessageButton');
    	if (sendButton instanceof HTMLButtonElement && !sendButton.disabled) {
        	sendButton.click();
      	}
    }
	}

	async function checkBan(room: any) {
		const cookies = document.cookie.split(';');
		const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));
		const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
		if (accessToken) {
			const headers = new Headers();
			headers.append('Authorization', `Bearer ${accessToken}`);
			const response = await fetch(`http://localhost:3000/chat/getBan?code=${room.id}`, {
				headers
			});
			const data = await response.json();
			return data;
		}
	}

	async function handleSubmit(event: Event, socket: Socket) {
		event.preventDefault();
		if (isFormValid && formData.roomName.length) {
			let data = {
				name: formData.roomName,
				password: formData.password,
				private: formData.private
			};
			if (data.password === undefined) data.password = '';
			socket.emit('createRoom', data);
			formData.roomName = '';
			form.reset();
		}
	}

	async function updateChatRooms(newRoom: ChatRoom) {
		const isRoomExist = chatRooms.some((room) => room.id === newRoom.id);
		if (!isRoomExist) { //&& await fletchIsPvAndMember(newRoom) === true) {
			chatRooms = [...chatRooms, newRoom];
		}
	}

	async function handleRoomButton(room: ChatRoom) {
		if ((await checkBan(room)) === true) {
			messages = [];
			messages = [
				{
					content: 'Vous avez été banni de cette room.',
					senderPseudo: 'server'
				}
			];
			return;
		}
		if (currentRoom && currentRoom.id === room.id) return;
		currentRoom = room;
		if (room?.id) messages = await fletchMessageOfRoom(room.id);
		else messages = [];
		socket.emit('getMessage', room);
		socket.emit('getUser', room);
		socket.emit('joinRoom', room);
		await fletchUserData();
		await fletchMuteBanData();
		await fletchMembres();
		await fletchBlocked();
		isShown = false;
	}

	function checkPrivate() {
		chatRooms.forEach(elem => {
			
		});
	}

	function sendMessage(event: Event, messageInput: HTMLInputElement, currentRoom: ChatRoom) {
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
			if (currentUser.status === -1) {
				socket.emit('checkMute', {room: currentRoom, user: currentUser});
			}
			else {
				socket.emit('sendMessage', data);
			}
			messageInput.value = '';
		}
	}

	const fletchBlocked = async() => {
		const cookies = document.cookie.split(';');
		const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));
		const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
		if (accessToken) {
			const headers = new Headers();
			headers.append('Authorization', `Bearer ${accessToken}`);
			const response = await fetch(`http://localhost:3000/chat/getBlock?code=${currentRoom.id}`, {
				headers
			});
			const data = await response.json();
			// gerer data
		}		
	};

	const fletchIsPvAndMember = async(room:ChatRoom) => {
		const cookies = document.cookie.split(';');
		const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));
		const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
		if (accessToken) {
			const headers = new Headers();
			headers.append('Authorization', `Bearer ${accessToken}`);
			const response = await fetch(`http://localhost:3000/chat/IsPvAndMember?room=${room.id}`, {
				headers
			});
			return await response.json();
		}
		return false;
	}

	const fletchMuteBanData = async () => {
		const cookies = document.cookie.split(';');
		const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));
		const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
		if (accessToken) {
			const headers = new Headers();
			headers.append('Authorization', `Bearer ${accessToken}`);
			const response = await fetch(`http://localhost:3000/chat/getMuteBan?code=${currentRoom.id}`, {
				headers
			});
			const data = await response.json();
			muted = data.muted;
			banned = data.banned;
		}
	};

	const fletchMembres = async () => {
		const cookies = document.cookie.split(';');
		const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));
		const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
		if (accessToken) {
			const headers = new Headers();
			headers.append('Authorization', `Bearer ${accessToken}`);
			const response = await fetch(`http://localhost:3000/chat/getMembers?code=${currentRoom.id}`, {
				headers
			});
			const data = await response.json();
			membres = await data;
		}
	};

	const fletchMessageOfRoom = async (id: number) => {
		const cookies = document.cookie.split(';');
		const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));
		const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
		if (accessToken) {
			const headers = new Headers();
			headers.append('Authorization', `Bearer ${accessToken}`);
			if (currentRoom?.id > 0) {
				const response = await fetch(`http://localhost:3000/chat/getMessages?code=${id}`, {
					headers
				});
				const data = await response?.json();
				return data;
			}
		}
	};

	const fletchChatRoomsData = async (): Promise<ChatRoom[]> => {
		const cookies = document.cookie.split(';');
		const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));
		const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
		if (accessToken) {
			const headers = new Headers();
			headers.append('Authorization', `Bearer ${accessToken}`);
			const response = await fetch('http://localhost:3000/chat/getRoom', { headers });
			return await response.json();
		}
		return [];
	};

	const fletchUserByRoom = async (pseudo: string) => {
		const cookies = document.cookie.split(';');
		const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));
		const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
		if (accessToken) {
			const headers = new Headers();
			headers.append('Authorization', `Bearer ${accessToken}`);
			const response = await fetch(
				`http://localhost:3000/chat/UserbyRoom?room=${currentRoom?.id}&pseudo=${pseudo}`,
				{ headers }
			);
			const data = await response.json();
			return data;
		}
		return -3;
	};

	const fletchCurrentUserData = async (): Promise<User> => {
		const cookies = document.cookie.split(';');
		const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));
		const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
		if (accessToken) {
			const headers = new Headers();
			headers.append('Authorization', `Bearer ${accessToken}`);
			const response = await fetch('http://localhost:3000/users/userInfo', { headers });
			const data = await response.json();
			const user: User = {
				id: data?.id,
				pseudo: data?.pseudo,
				status: -2,
				room: -1
			};
			return user;
		}
		const user: User = {
			id: -1,
			pseudo: '',
			status: -2,
			room: -1
		};
		return user;
	};

	const fletchUserData = async () => {
		const cookies = document.cookie.split(';');
		const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));
		const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
		if (accessToken) {
			const headers = new Headers();
			headers.append('Authorization', `Bearer ${accessToken}`);
			if (currentRoom?.id > 0) {
				const response = await fetch(`http://localhost:3000/chat/userInfo?code=${currentRoom.id}`, {
					headers
				});
				const data = parseInt(await response.json(), 10);
				currentUser.status = data;
			}
		}
	};

	async function displayDropdownMenu(): Promise<string[]> {
		if (currentUser && selectedUser) {
			// CU = currentUser | SU = selectedUser
			if (currentUser.id === selectedUser.id) {
				return ['profile'];
			}
			if (currentUser.status === 2 && selectedUser.status === 1) {
				return ['profile', 'unAdmin'];
				// CU = owner | SU = admin
			} else if (currentUser.status === 2 && selectedUser.status === 0) {
				return ['profile', 'upAdmin', 'ban', 'mute', 'kick'];
				// CU = owner | SU = membre
			} else if (currentUser.status === 1 && selectedUser.status === 0) {
				return ['profile', 'ban', 'mute', 'kick'];
				// CU = admin | SU = membre
			} else if (
				(currentUser.status === 1 || currentUser.status === 2) &&
				selectedUser.status === -1
			) {
				return ['profile', 'unMute', 'kick', 'ban'];
				// CU = owner ou admin | SU = muted
			} else if (
				(currentUser.status === 1 || currentUser.status === 2) &&
				selectedUser.status === -2
			) {
				return ['profile', 'unBan'];
				// CU = owner ou admin | SU = banned
			} else if (currentUser.status === 0 || currentUser.status === -1) {
				return ['profile'];
				// CU = membre ou muted
			} else if (currentUser.status === 1 && selectedUser.status === 2) {
				return ['profile'];
				// CU = admin | SU = owner
			} else if (currentUser.status === selectedUser.status || selectedUser.status === -3) {
				return ['profile'];
			}
		}
		return [];
	}

	async function handleClickPseudo(event: any, user: any) {
		isShown = false;
		selectedUser = await fletchUserByRoom(user);
		showOptionsPseudo = await displayDropdownMenu();
		isShown = true;
	}

	function find(array: any[], toFind: any): boolean {
		return array.find((element) => element === toFind) !== undefined;
	}

	function delMenu() {
		isShown = false;
		selectedUser = {
			id: -1,
			pseudo: '',
			status: -2,
			room: -1
		};
	}

	function leaveRoom() {
		socket.emit('leaveRoom', currentRoom);
		// if (currentUser.status != 2)
		// 	currentRoom = null;
		messages = [];
		muted = [];
		banned = [];
		membres = [];
		currentRoom = null;
	}

	function handleSelect(event: any) {
		console.log('event ===', event.target.value);
		if (event.target.value === 'kick') {
			kick(selectedUser, currentRoom);
		} else if (event.target.value === 'ban') {
			ban(selectedUser, currentRoom);
		} else if (event.target.value === 'unBan') {
			deban(selectedUser, currentRoom);
		} else if (event.target.value === 'mute') {
			mute(selectedUser, currentRoom);
		} else if (event.target.value === 'unMute') {
			unmute(selectedUser, currentRoom);
		} else if (event.target.value === 'upAdmin') {
			upadmin(selectedUser, currentRoom);
		} else if (event.target.value === 'unAdmin') {
			deUpadmin(selectedUser, currentRoom);	
		} else if (event.target.value === 'profile') {
			showProfile();
		}
	}

	function showProfile() {
		goto(`/profile/${selectedUser.pseudo}`);
	}

	function ban(userToBan: any, room: any) {
		socket.emit('newBan', { user: userToBan, room: room });
		isShown = false;
	}

	function deban(userTodeBan: any, room: any) {
		socket.emit('unBan', { user: userTodeBan, room: room });
		isShown = false;
	}

	function mute(userTodeBan: any, room: any) {
		socket.emit('newMute', { user: userTodeBan, room: room });
		isShown = false;
	}

	function unmute(userTodeBan: any, room: any) {
		socket.emit('unMuted', { user: userTodeBan, room: room });
		isShown = false;
	}

	function kick(userToKick: User, room: any) {
		if (currentRoom.id === room.id)
			messages = [
				...messages,
				{ senderPseudo: 'server', content: `${userToKick.pseudo} a été kick de la room` }
			];
		socket.emit('kick', userToKick);
		isShown = false;
	}

	function upadmin(userToUp: any, room: any) {
		socket.emit('newAdmin', {user: userToUp, room: room});
		isShown = false;
	}

	function deUpadmin(userToDowngrade: any, room: any) {
		socket.emit('unAdminded', {user: userToDowngrade, room: room});
		isShown = false;
	}

	function isMember(){
      const finded = membres?.find((obj:any) => obj?.id === currentUser.id);
      if (finded)
        return true;
      else
      return false;
  }

	onMount(async () => {
		const cookies = document.cookie.split(';');
		const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));
		const access_token = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
		socket = io('http://localhost:3000', {
			extraHeaders: {
				Authorization: 'Bearer ' + access_token
			}
		});
		socket.on('connect', () => {
			console.log('Connected to server');
		});
		socket.on('roomCreated', async(newRoom: ChatRoom) => {
			console.log('newRoom ==', newRoom)
			chatRooms = await fletchChatRoomsData();
		});
		socket.on('returnMessage', (data: any) => {
			if (currentUser.id === data.to) messages = data.msg;
		});
		socket.on('newMessage', (msg: any) => {
			if (currentRoom && currentRoom?.id === msg.chatRoomId) {
				messages = [...messages, msg];
			}
		});
		socket.on('returnUser', (data: any) => {
			if (data.to === currentUser.id) {
				currentUser = data.user;
			}
		});
		socket.on('newBan', async (data) => {
			console.log('data ====', data);
			if (currentUser.id === data.user.id && currentRoom.id === data.room.id) {
				chatRooms = await fletchChatRoomsData();
				currentRoom = {
					name: '',
					id: -1
				};
				messages = [
					...messages,
					{
						senderPseudo: 'server',
						content: 'Vous avez été banni de la room par un administrateur'
					}
				];
			} else if (currentRoom.id === data.room.id) {
				await fletchMuteBanData();
			}
		});
		socket.on('deleteRoom', async (data) => {
			if (currentRoom && currentRoom?.id === data) {
				messages = [
					{
						senderPseudo: 'server',
						content: 'La room a été détruite.'
					}
				];
			}
			chatRooms = await fletchChatRoomsData();
		});
		socket.on('kicked', async (data) => {
			if (currentUser.id === data.user.id && currentRoom.id === data.room.id) {
				chatRooms = await fletchChatRoomsData();
				currentRoom = {
					name: '',
					id: 0
				};
				messages = [
					...messages,
					{
						senderPseudo: 'server',
						content: 'Vous avez été kick de la room par un administrateur'
					}
				];
			} else if (currentRoom.id === data.room.id) {
				membres = await fletchMembres();
			}
		});
		socket.on('newDeban', async (data) => {
			if (data.user.id === currentUser.id) {
				chatRooms = await fletchChatRoomsData();
				messages = [
					...messages,
					{
						senderPseudo: 'server',
						content: `Vous avez été débanni de la room ${data.room.name}`
					}
				];
			} else if (currentRoom.id === data.room.id) {
				await fletchMuteBanData();
			}
		});
		socket.on('roomLeaved', async (data) => {
			if (currentRoom.id === data) {
				membres = await fletchMembres();
			}
		});
		socket.on('adminAdded', async(data) => {
			if (currentUser.id === data.user.id) {
				messages = [...messages, {content: `Vous etes maintenant un administrateur de la room ${data.room.name}`, senderPseudo: 'server'}];
				if (currentRoom.id === data.room.id) {
					currentUser.status = 1;
				}
			}
		});
		socket.on('adminRemoved', async(data) => {
			if (currentUser.id === data.user.id) {
				messages = [...messages, {content: `Vous n'etes plus administrateur de la room ${data.room.name}`, senderPseudo: 'server'}];
				if (currentRoom.id === data.room.id) {
					currentUser.status = 0;
				}
			}
		});
		socket.on('muted', async(data) => {
			if (currentRoom.id === data.room.id) {
				fletchMuteBanData();
			}
			if (currentRoom.id === data.room.id && currentUser.id === data.user.id) {
				messages = [...messages, {content: `Vous avez été mute pour 120 sec'`, senderPseudo: 'server'}]
				currentUser.status = -1;
			}
		});
		socket.on('unMuted', async(data) => {
			console.log('CRI ===',currentRoom.id)
			console.log('DRI ===',data.room.id )
			console.log('CUI ===',currentUser.id)
			console.log('DUI ===',data.user.id)
			if (currentRoom.id === data.room.id) {
				fletchMuteBanData();
			}
			if (currentRoom.id === data.room.id && currentUser.id === data.user.id) {
				messages = [...messages, {content: `Vous n'etes plus mute'`, senderPseudo: 'server'}]
				currentUser.status = 0;
			}
		});
		socket.on('stayMute', async(data) => {
			console.log('CRI ===',currentRoom.id)
			console.log('DRI ===',data.room.id )
			console.log('CUI ===',currentUser.id)
			console.log('DUI ===',data.user.id)
			if (currentRoom.id === data.room.id && currentUser.id === data.user.id) {
				messages = [...messages, data.message];
			}
		});
		socket.on('UserAdded', async(data) => {
			if (data.sucess === false && !data.user) {
				messages = [...messages, {senderPseudo:'server', content:"Cette utilisateur n'existe pas"}]
			}
			else if (data.sucess === false && data.user) {
				messages = [...messages,{senderPseudo:'server', content:"Cette utilisateur est deja membre"} ]
			}
			else if (data.sucess === true && data.user) {
				if (data.user.id === currentUser.id) {
					chatRooms = await fletchChatRoomsData();
				}
				membres = [...membres, data.user];
			}

		});
		chatRooms = await fletchChatRoomsData();
		console.log('CRS == ', chatRooms);
		currentUser = await fletchCurrentUserData();
		if (currentUser.id < 0) {
			window.location.pathname = '/';
		}
		checkFormValidity();
		loading = true;
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="/style.css" />
</svelte:head>

<!-- HTML CODE -->

<!-- <h1>Chat</h1> -->
<h2>Liste des rooms publics:</h2>
{#if loading === false}
	<p>Chargement...</p>
{:else}
<div class="list-room">
	{#each chatRooms as chatRoom}
		{#if chatRoom.private === false}
				<button class="chatroom-button" on:click={() => handleRoomButton(chatRoom)}
					>{chatRoom.name}</button
				>
		{/if}
		{#if chatRoom.private === true}
				<button class="pv-chatroom-button" on:click={() => handleRoomButton(chatRoom)}
					>PV {chatRoom.name}</button
				>
		{/if}
	{/each}
	</div>
{/if}

<h2>Creer une room:</h2>
<form on:submit={(event) => handleSubmit(event, socket)} bind:this={form}>
	<label for="roomName">Nom de la salle *</label>
	<input
		class="form-input"
		type="text"
		id="roomName"
		name="roomName"
		on:input={handleNameInput}
		required
	/>

	<label for="password">Mot de passe</label>
	<input
		class="form-input"
		type="password"
		id="password"
		name="password"
		on:input={handlePasswordInput}
	/>

	<label>
		<input
			class="form-input"
			type="checkbox"
			id="private"
			name="private"
			on:change={handlePrivateOption}
		/>
		Salle privée
	</label>
	<button class="form-button" type="submit" disabled={!isFormValid}>Créer la salle</button>
</form>

{#if currentRoom}
	<div>
		{#if currentRoom.name.length}
			<h3>{currentRoom.name}</h3>
			<button on:click={leaveRoom}>Quitter la room</button>
			
			<button on:click={handleInvitInput}>Ajouter un utilisateur </button>
		{/if}
	</div>
	<div class="container">
		<div class="chat-messages">
			{#if messages && messages.length}
				{#each messages as msg}
					<p class="message">
						{#if msg.senderPseudo == 'server'}
							{msg.senderPseudo}: {msg.content}
						{/if}
						{#if msg.senderPseudo != 'server'}
							<button
								class="pseudo-button"
								on:click={(event) => handleClickPseudo(event, msg.senderPseudo)}
							>
								{msg.senderPseudo}
							</button>
							: {msg.content}
						{/if}
					</p>
				{/each}
			{/if}
		</div>
	</div>
	<div>
		{#if currentRoom.name.length}
			<p><input on:input={handleMessageInput} on:keypress={handleMessageKeyPress} class="message-input" type="text" id="message" name="message" /></p>
			<button id="sendMessageButton"
				type="submit" disabled
				on:click={(event) => {
					const messageInput = document.getElementById('message');
					if (messageInput instanceof HTMLInputElement) {
						sendMessage(event, messageInput, currentRoom);
						messageInput.value = '';
					}
				}}>Envoyer</button
			>
		{/if}
	</div>

	{#if isShown === true}
		<div class="menu">
			{#if showOptionsPseudo.length}
				<select id="pseudo-menu" on:change={handleSelect}>
					<option>Options</option>
					{#if find(showOptionsPseudo, 'profile') === true}
						<option value="profile">Voir le profil</option>
					{/if}
					{#if find(showOptionsPseudo, 'ban') === true}
						<option value="ban">Bannir</option>
					{/if}
					{#if find(showOptionsPseudo, 'mute') === true}
						<option value="mute">Muter</option>
					{/if}
					{#if find(showOptionsPseudo, 'kick') === true}
						<option value="kick">Expulser</option>
					{/if}
					{#if find(showOptionsPseudo, 'unBan') === true}
						<option value="unBan">Débannir</option>
					{/if}
					{#if find(showOptionsPseudo, 'unMute') === true}
						<option value="unMute">Démute</option>
					{/if}
					{#if find(showOptionsPseudo, 'upAdmin') === true}
						<option value="upAdmin">Passer admin</option>
					{/if}
					{#if find(showOptionsPseudo, 'unAdmin') === true}
						<option value="unAdmin">Retirer admin</option>
					{/if}
				</select>
				<button on:click={delMenu}>X</button>
			{/if}
		</div>
	{/if}
{/if}

<div class="admin-panel">
	{#if currentRoom?.id && currentUser.status > 0}
		<p>Banned :</p>
		{#if banned?.length}
			{#each banned as ban}
				<button class="pseudo-button" on:click={(event) => handleClickPseudo(event, ban.pseudo)}>
					{ban.pseudo}
				</button>
			{/each}
		{/if}
		<p>Muted :</p>
		{#if muted?.length}
			{#each muted as mute}
				<button class="pseudo-button" on:click={(event) => handleClickPseudo(event, mute.pseudo)}>
					{mute.pseudo}
				</button>
			{/each}
		{/if}
	{/if}
	{#if currentRoom?.id}
		<p>Membres:</p>
		{#if membres && membres.length}
			{#each membres as member}
				<button class="pseudo-button" on:click={(event) => handleClickPseudo(event, member.pseudo)}>
					{member.pseudo}
				</button>
			{/each}
		{/if}
	{/if}
</div>
