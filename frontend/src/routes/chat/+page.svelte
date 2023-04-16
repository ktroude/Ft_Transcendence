<script lang="ts">
	import { onMount } from 'svelte';
	import { io, Socket } from 'socket.io-client';

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
	let currentRoom: any = null;
	let currentUser: User;
	let selectedUser: User = {
		id: -1,
		pseudo: '',
		status: -2,
		room: -1
	};
	let showOptionsPseudo: string[] = [];
	let isShown = false;
	let muteBan: any = [];
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
		status: number; // 2 = owner, 1 = admin, 0 = member, -1 = muted, -2 banned
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

	function updateChatRooms(newRoom: ChatRoom) {
		const isRoomExist = chatRooms.some((room) => room.id === newRoom.id);
		if (!isRoomExist) {
			chatRooms = [...chatRooms, newRoom];
		}
	}

	async function handleRoomButton(room: ChatRoom) {
		currentRoom = room;
		messages = [];
		socket.emit('getMessage', room);
		socket.emit('getUser', room);
		socket.emit('joinRoom', room);
		muteBan = await fletchMuteBanData();
		console.log('MUTEB ==', muteBan);
		console.log('currentUser ==', currentUser);
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
			socket.emit('sendMessage', data);
			messageInput.value = '';
		}
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
			return data;
		}
		return [];
	};

	const fletchChatRoomsData = async (): Promise<ChatRoom[]> => {
		const cookies = document.cookie.split(';');
		const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));
		const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
		if (accessToken) {
			const headers = new Headers();
			headers.append('Authorization', `Bearer ${accessToken}`);
			const response = await fetch('http://localhost:3000/chat/getRoom', { headers });
			const data = await response.json();
			return data;
		}
		return [];
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

	async function displayDropdownMenu(currentUser: User, user: User): Promise<string[]> {
		if (currentUser && currentUser.status) {
			if (user && !user.status) {
				const data = {
					id: currentRoom.id,
					pseudo: user
				};
				const checkUserPromise = new Promise<User>((resolve) => {
					socket.emit('checkUser', data);
					socket.on('returnCheckUser', (data) => {
						resolve(data);
					});
				});
				selectedUser = await checkUserPromise;
			}
			if (selectedUser && selectedUser.status) {
				// CU = currentUser | SU = selectedUser
				// if (currentUser.id === selectedUser.id) {
				//   return ['profile'];
				// }
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
				} else if (currentUser.status === selectedUser.status) {
					return ['profile'];
				}
			}
		}
		return [];
	}

	async function handleClickPseudo(event: any, user: any) {
		showOptionsPseudo = await displayDropdownMenu(currentUser, user);
		console.log('CU ==', currentUser);
		console.log('SU ==', selectedUser);
		isShown = true;
	}

	function find(array: any[], toFind: any): boolean {
		return array.find((element) => element === toFind) !== undefined;
	}

	function delMenu() {
		isShown = !isShown;
		selectedUser = {
			id: -1,
			pseudo: '',
			status: -2,
			room: -1
		};
	}

	function leaveRoom() {
		socket.emit('leaveRoom', currentRoom);
		currentRoom = null;
		messages = [];
	}

	function showProfile() {
		window.location.pathname = '/profile';
	}

	function ban() {
		const data = {
			user: currentUser,
			room: currentRoom,
			toBan: selectedUser
		};
		socket.emit('newBan', data);
	}

	function deban() {}

	function mute() {}

	function demute() {}

	function kick(userToKick: User) {
		socket.emit('kick', userToKick.id);
	}

	function upadmin() {}

	function deUpadmin() {}

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
		socket.on('roomCreated', (newRoom: ChatRoom) => {
			updateChatRooms(newRoom);
		});
		socket.on('returnMessage', (data: any) => {
			if (currentUser.id === data.to) messages = data.msg;
		});
		socket.on('newMessage', (msg: any) => {
			if (currentRoom && currentRoom.id === msg.chatRoomId) messages = [...messages, msg];
		});
		socket.on('returnUser', (data: any) => {
			if (data.to === currentUser.id) currentUser = data.user;
		});
		socket.on('newBan', (data) => {});
		socket.on('deleteRoom', async (data) => {
			const roomToDel = chatRooms.find((element) => element.id === data);
			if (roomToDel) {
				chatRooms = await fletchChatRoomsData();
				chatRooms.splice(chatRooms.indexOf(roomToDel, 1));
				const message = {
					content: 'La room a été supprimée.',
					senderPseudo: 'server',
					chatRoomId: roomToDel.id
				};
				if (currentRoom.id === roomToDel.id){
					messages = [message];
				}
				isShown = false;
			}
		});
		socket.on('kicked', async (data) => {
			if (currentUser?.id === data) {
				chatRooms = await fletchChatRoomsData();
				currentRoom = null;
				messages = [];
			}
		});
		chatRooms = await fletchChatRoomsData();
		currentUser = await fletchCurrentUserData();
		if (currentUser.id < 0) {
			window.location.pathname = '/';
		}
		loading = true;
		checkFormValidity();
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="/style.css" />
</svelte:head>

<!-- HTML CODE -->

<!-- <h1>Chat</h1> -->
<h2>Liste des rooms:</h2>
{#if loading === false}
	<p>Chargement...</p>
{:else}
	<div class="list-room">
		{#each chatRooms as chatRoom}
			<p>
				<button class="chatroom-button" on:click={() => handleRoomButton(chatRoom)}
					>{chatRoom.name}</button
				>
			</p>{/each}
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
{#if currentRoom && currentRoom.name}
	<div>
		<p />
		<h3>{currentRoom.name}</h3>
		<button on:click={leaveRoom}>Quitter la room</button>
	</div>
	<div class="container">
		<div class="chat-messages">
			{#if messages && messages.length}
				{#each messages as msg}
					<p>
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
		<p />
		<p><input type="text" id="message" name="message" /></p>
		<p>
			<button
				type="submit"
				on:click={(event) => {
					const messageInput = document.getElementById('message');
					if (messageInput instanceof HTMLInputElement) {
						sendMessage(event, messageInput, currentRoom);
					}
				}}>Envoyer</button
			>
		</p>
	</div>

	{#if isShown === true}
		<div class="menu">
			{#if showOptionsPseudo.length}
				<select id="pseudo-menu">
					{#if find(showOptionsPseudo, 'profile') === true}
						<option value="profile" on:click={showProfile}>Voir le profil</option>
					{/if}
					{#if find(showOptionsPseudo, 'ban') === true}
						<option value="ban" on:click={ban}>Bannir</option>
					{/if}
					{#if find(showOptionsPseudo, 'mute') === true}
						<option value="mute">Muter</option>
					{/if}
					{#if find(showOptionsPseudo, 'kick') === true}
						<option value="kick" on:click={() => kick(selectedUser)}>Expulser</option>
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

{#if currentUser?.status > 0 && muteBan?.banned && muteBan?.muted}
<div class="admin-panel">
	<p>Banned :</p>
		{#each muteBan.banned as banned}
			<button class="pseudo-button" on:click={(event) => handleClickPseudo(event, banned.pseudo)}>
				{banned.pseudo}
			</button>
		{/each}
		<p>Muted :</p>
		{#each muteBan.muted as muted}
			<button class="pseudo-button" on:click={(event) => handleClickPseudo(event, muted.pseudo)}>
				{muted.pseudo}
			</button>
		{/each}
</div>
{/if}