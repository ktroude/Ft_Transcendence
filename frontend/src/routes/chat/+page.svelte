<script lang="ts">
	import { onMount } from 'svelte';
	import { io, Socket } from 'socket.io-client';
	import { goto } from '$app/navigation';
	import { fetchData, fetch2FA } from '../../API/api';
	import { LOCALHOST } from "../../API/env";
	import "../../../node_modules/normalize.css"

	// VARIABLES

	let redirectUser: UserRedirect;
	interface UserRedirect {
		id: number;
		firstname: string;
		lastname: string;
		pseudo: string;
		username: string;
	}

	let socket: Socket;
	let isFormValid = false;
	let chatRooms: ChatRoom[] = [];
	let loading = false;
	let form: HTMLFormElement;
	let formData: RoomFormData = {
		roomName: '',
		private: false
	};
	let userPseudoInput: any;
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
	let passwordInput = {
		bool: false,
		roomId: 0
	};
	let animation:any;
	let pending_invitation = false;
	let notif:any = {url:'', display:false, invitedBy:''};

	// INTERFACES

	interface ChatRoom {
		name: string;
		private: boolean;
		id: number;
		ownerId: number;
		password: boolean;
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

	function fade(thisplace:string) {
		document.body.classList.add('fade-out');
		setTimeout(() => {
		document.body.classList.remove('fade-out');
		location.href = thisplace;
		}, 400);
	}

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
		isFormValid = formData.roomName.length > 0; // && formData.private !== undefined;
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

	function handlePasswordChange(event:any) {
		if (event.key === 'Enter') {
			const value = event.target.value;
			if (value) {

				socket.emit('changePassword', {
					room: currentRoom,
					newPassword: value,
				});
			}
		}
	}
	
	function handleDelPassword():any {
		socket.emit('deletePassword', {
			room: currentRoom,
		})
		currentRoom.password = false;
	}

	function scrollToBottom() {
		let chatDiv = document.getElementById('chat-messages');
		chatDiv?.addEventListener('DOMSubtreeModified', function () {
			if (chatDiv) {
				const scrollHeight = chatDiv.scrollHeight;
				const clientHeight = chatDiv.clientHeight;
				const maxScrollTop = scrollHeight - clientHeight;
				chatDiv.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
			}
		});
	}

	async function handlePasswordInputKeyDown(event: any, room: ChatRoom) {
		if (event.key === 'Enter') {
			const value = event.target.value;
			await handleRoomButton(room, value);
			passwordInput.bool = false;
			passwordInput.roomId = 0;
		}
	}

	function handleInvitUserInput() {
		socket.emit('addUser', { username: userPseudoInput.toUpperCase(), room: currentRoom });
		userPseudoInput = '';
	}

	function handleInvitKeyPress(event: any) {
		if (event.key === 'Enter') {
			handleInvitUserInput();
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
			if (data.password === undefined) {
				data.password = '';
			}
			socket.emit('createRoom', data);
			formData.roomName = '';
			formData.private = false;
			formData.password = '';
			form.reset();
		}
	}

	function displayInputPassword(id: number) {
		animation = null;
		passwordInput.bool = true;
		passwordInput.roomId = id;
	}

	async function handleRoomButton(room: ChatRoom, pw: any) {
		animation = null;
		if (currentRoom?.id === room.id && currentUser.status >= 0) return;
		socket.emit('joinRoom', { room: room, password: pw });
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
				socket.emit('checkMute', { room: currentRoom, user: currentUser });
			} else {
				socket.emit('sendMessage', data);
			}
			messageInput.value = '';
		}
	}

	const fletchMembres = async () => {
		try {
			const cookies = document.cookie.split(';');
			const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));
			const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
			if (accessToken) {
				const headers = new Headers();
				headers.append('Authorization', `Bearer ${accessToken}`);
				const response = await fetch(
					`http://${LOCALHOST}:3000/chat/getMembers?code=${currentRoom.id}`,
					{
						headers
					}
				);
				const data = await response.json();
				membres = data.membres;
				muted = data.muted;
				banned = data.banned;
			}
		} catch {
			membres = [];
		}
	};

	const fletchChatRoomsData = async (): Promise<ChatRoom[]> => {
		const cookies = document.cookie.split(';');
		const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));
		const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
		if (accessToken) {
			const headers = new Headers();
			headers.append('Authorization', `Bearer ${accessToken}`);
			const response = await fetch(`http://${LOCALHOST}:3000/chat/getRoom`, { headers });
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
				`http://${LOCALHOST}:3000/chat/UserbyRoom?room=${currentRoom?.id}&pseudo=${pseudo}`,
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
			const response = await fetch(`http://${LOCALHOST}:3000/users/userInfo`, { headers });
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

	async function handleInviteGameButton() {
        const id = await fetchRoomGameId();
        const url = `http://${LOCALHOST}:5173/game/pong_game?room_id=${id.response}`;
		const data = {
			invited: selectedUser.pseudo ,
			invitedBy: currentUser.pseudo,
			url: url,
		}
		socket.emit(`InvitedInGame`, data);
    }
	
	function handleDM(){
		location.href = "/dm/" + selectedUser.id;
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

	function createPopupDM(notif:any) {
		const boxito = document.querySelector("body");
		const toast = document.createElement("div");
		toast.innerHTML = `<div class="popup">
			<div class="popup_img">
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
		denyButton?.addEventListener("click", () => removePopup(notif));	}

	function removePopup(notif:any) {
		const data = {
				accepted: false,
    			url: notif.url,
      			target: notif.invitedBy,
			};
		socket.emit('AnswerGame', data);
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

	async function fetchBlockedData() {
		const cookies = document.cookie.split(';');
		const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));
		const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
		if (accessToken) {
			const headers = new Headers();
			headers.append('Authorization', `Bearer ${accessToken}`);
			const response = await fetch(`http://${LOCALHOST}:3000/users/getAllBlockReturnId?id=${currentUser.id}`, { headers });
			const data = await response.json();
			blocked = data;
		}	
	}


	function check_array(num:any) {
		for (let i=0; i<blocked.length; i++) {
			if (blocked[i] === num) {
				return true;
			}
		}
		return false;
	}

	async function displayDropdownMenu(): Promise<string[]> {
		let array:string[] = [];
		if (currentUser && selectedUser) {
			if (currentUser.id === selectedUser.id) {
				array = ['profile'];
			}
			if (currentUser.status === 2 && selectedUser.status === 1) {
				array =  ['profile', 'unAdmin'];
			} else if (currentUser.status === 2 && selectedUser.status === 0) {
				array =  ['profile', 'upAdmin', 'ban', 'mute', 'kick'];
			} else if (currentUser.status === 1 && selectedUser.status === 0) {
				array =  ['profile', 'ban', 'mute', 'kick'];
			} else if (
				(currentUser.status === 1 || currentUser.status === 2) &&
				selectedUser.status === -1
			) {
				array =  ['profile', 'unMute', 'kick', 'ban'];
			} else if (
				(currentUser.status === 1 || currentUser.status === 2) &&
				selectedUser.status === -2
			) {
				array =  ['profile', 'unBan'];
			} else if (currentUser.status === 0 || currentUser.status === -1) {
				array =  ['profile'];
			} else if (currentUser.status === 1 && selectedUser.status === 2) {
				array =  ['profile'];
			} else if (currentUser.status === selectedUser.status || selectedUser.status === -3) {
				array =  ['profile'];
			}
		}
		if (findBlocked(blocked, selectedUser.id) === true) {
			array.push('unblock');
		}
		else if (selectedUser?.id !== currentUser?.id) {
			array.push('block');
		}
		return array;
	}

	async function handleClickPseudo(event: any, user: any) {
		isShown = false;
		selectedUser = await fletchUserByRoom(user);
		await fetchBlockedData();
		showOptionsPseudo = await displayDropdownMenu();
		isShown = true;
	}

	function findBlocked(array: any[], toFind:any) {
		for (let i = 0 ; i < array.length; i++) {
			if (array[i] === toFind)
				return true;
		}
			return false;
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
		if (currentRoom?.id) {
			socket.emit('leaveRoom', currentRoom);
		}
		// currentRoom = null;
		membres = [];
		banned = [];
		muted = [];
		currentRoom.id = -1;
	}

	async function showProfile() {
		location.href = `/profile/${selectedUser.id}`;
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
		if (currentRoom.id === room.id) {
			messages = [
				...messages,
				{ senderPseudo: 'server', content: `${userToKick.pseudo} a été kick de la room` }
			];
			scrollToBottom();
		}
		socket.emit('kick', userToKick);
		isShown = false;
	}

	function upadmin(userToUp: any, room: any) {
		socket.emit('newAdmin', { user: userToUp, room: room });
		isShown = false;
	}

	function deUpadmin(userToDowngrade: any, room: any) {
		socket.emit('unAdminded', { user: userToDowngrade, room: room });
		isShown = false;
	}

	function block(userToBlock:any) {
		socket.emit('newBlock', {
			userToBlock: userToBlock,
			room : currentRoom,
		});
		isShown = false;
	}

	function unblock(userToUnblock:any) {
		socket.emit('newUnblock', {
			userToUnblock: userToUnblock,
			room : currentRoom,
		});
		isShown = false;
	}

	onMount(async () => {
		
		const cookies = document?.cookie?.split(';');
		const accessTokenCookie = cookies?.find((cookie) =>
		cookie?.trim()?.startsWith('access_token=')
		);
		const access_token = accessTokenCookie ? accessTokenCookie?.split('=')[1] : null;
		socket = io(`http://${LOCALHOST}:3000`, {
			extraHeaders: {
				Authorization: 'Bearer ' + access_token
			}
		});
		currentUser = await fetchData();
		if (!currentUser) {
			location.href = '/';
			return ;
		}
		if (!access_token || !socket) {
			window.location.pathname = '/';
		}
		socket.emit('userConnected', { pseudo: currentUser.pseudo });
		const FA2 = await fetch2FA(currentUser.id)
		if (FA2 === true) {
			location.href = 'auth/2fa';
			return ;
		}
		socket.on('roomCreated', async (newRoom: ChatRoom) => {
			chatRooms = await fletchChatRoomsData();
		});
		socket.on('returnMessage', (data: any) => {
			if (currentUser.id === data.to) {
				if (data.banned == true) {
					messages = [
						{
							senderPseudo: 'server',
							content: 'Vous êtes banni de cette room (CHEH)'
						}
					];
					return;
				} else {
						messages = data.msg;
					}
					scrollToBottom();
				}
			}
		);
		socket.on('newMessage', (msg: any) => {
			if (currentRoom && currentRoom?.id === msg?.chatRoomId) {
				if (currentUser?.status != -2 && check_array(msg.senderId) === false) {
					messages = [...messages, msg];
					scrollToBottom();
				}
			}
		});
		socket.on('returnUser', (data: any) => {
			if (data.to === currentUser.id) {
				currentUser = data.user;
			}
		});
		socket.on('banned', async (data) => {
			if (currentUser.id === data.user.id) {
				currentRoom = {
					name: '',
					id: -1
				};
				messages = [
					{
						senderPseudo: 'server',
						content: `Vous avez été banni de la room ${data.room.name} par un administrateur`
					}
				];
				membres = [];
				banned = [];
				muted = [];
			} else if (currentRoom.id === data.room.id) {
				banned = [...banned, data.user];
				await fletchMembres();
			}
			if (data.room.private === true && currentUser.id === data.user.id)
				chatRooms = await fletchChatRoomsData();
		});
		socket.on('newDeban', async (data) => {
			if (currentRoom.id == data.room.id) {
				await fletchMembres();
			}
			if (currentUser.id == data.user.id) {
				if (currentRoom == null) {
					currentRoom = {
						name: '',
						id: -1
					};
				}
				messages = [
					...messages,
					{
						senderPseudo: 'server',
						content: `Vous etes deban de la room ${data.room.name}`
					}
				];
			}
		});
		socket.on('deleteRoom', async (data) => {
			if (currentRoom && currentRoom?.id === data) {
				messages = [];
				// currentRoom = null;
				currentRoom.id = -1;

				membres = [];
				banned = [];
				muted = [];
				scrollToBottom();
			}
			chatRooms = await fletchChatRoomsData();
		});
		socket.on('kicked', async (data) => {
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
						content: 'Vous avez été kick de la room par un administrateur'
					}
				];
				membres = [];
				banned = [];
				muted = [];
			} else if (currentRoom.id === data.room.id) {
				await fletchMembres();
			}
			if (currentUser.id === data.user.id && data.room.private == true) {
				await fletchMembres();
			}
		});
		socket.on('roomLeaved', async (data) => {
			if (currentRoom?.id === data) {
				await fletchMembres();
			}
		});
		socket.on('sucess', async (data) => {
			if (currentUser?.id == data?.user?.id) {
				currentRoom = data.room;
				animation = data.animation;
				socket.emit('getMessage', data.room);
				socket.emit('getUser', data.room);
				await fletchMembres();
			} else if (currentRoom?.id === data?.room?.id) {
				await fletchMembres();
			}
		});
		socket.on('failed', (data) => {
			if (currentUser.id == data.user.id) {
				animation = data.animation;
				currentRoom = {
					name: '',
					id: -1
				};
				messages = [data.message];
				membres = [];
				muted = [];
				banned = [];
			}
		});
		socket.on('adminAdded', async (data) => {
			if (currentUser.id === data.user.id) {
				messages = [
					...messages,
					{
						content: `Vous etes maintenant un administrateur de la room ${data.room.name}`,
						senderPseudo: 'server'
					}
				];
					currentUser.status = 1;
				if (currentRoom.id === data.room.id) {
					await fletchMembres();
				}
				scrollToBottom();
			}
		});
		socket.on('adminRemoved', async (data) => {
			if (currentUser.id === data.user.id) {
				messages = [
					...messages,
					{
						content: `Vous n'etes plus administrateur de la room ${data.room.name}`,
						senderPseudo: 'server'
					}
				];
				currentUser.status = 0;
				if (currentRoom.id === data.room.id) {
					await fletchMembres();
				}
				scrollToBottom();
			}
		});
		socket.on('muted', async (data) => {
			if (currentRoom.id === data.room.id) {
				muted = [...muted, data.user];
			}
			if (currentRoom.id === data.room.id && currentUser.id === data.user.id) {
				messages = [
					...messages,
					{ content: `Vous avez été mute pour 12 sec`, senderPseudo: 'server' }
				];
				currentUser.status = -1;
				scrollToBottom();
			}
		});
		socket.on('unMuted', async (data) => {
			if (currentRoom.id === data.room.id && currentUser.id === data.user.id) {
				messages = [...messages, { content: `Vous n'etes plus mute`, senderPseudo: 'server' }];
				currentUser.status = 0;
				scrollToBottom();
			}
			if (currentRoom.id === data.room.id) {
				await fletchMembres();
			}
		});
		socket.on('stayMute', async (data) => {
			if (currentRoom.id === data.room.id && currentUser.id === data.user.id) {
				messages = [...messages, data.message];
				scrollToBottom();
			}
		});



		socket.on('UserAdded', async (data) => {
			if (data.room.id === currentRoom?.id) {

				if (data?.ban === true && data?.user.id === currentUser.id) {
					animation = data.animation;
					messages = [
						...messages,
						{ senderPseudo: 'server', content: "Cet utilisateur EST BAN, pas de ca chez moi, la racaille c'est dehors" }
					];
					scrollToBottom();
					return
				}

			if (data?.userToAdd === null && data?.user.id === currentUser.id) {
				if (currentUser.id === data.user.id) {
					animation = data.animation;
					messages = [
						...messages,
						{ senderPseudo: 'server', content: "Cet utilisateur n'existe pas" }
					];
					scrollToBottom();
				}
				return ;
			} 
			
			if (data.sucess === false && data?.user.id === currentUser.id) {
					messages = [
						...messages,
						{ senderPseudo: 'server', content: 'Cet utilisateur est deja membre' }
					];
			}
			
			if (data.sucess === true) {
				membres = [... membres, data.userToAdd];
				chatRooms = await fletchChatRoomsData();
			}
		}
		await fletchMembres();
		chatRooms = await fletchChatRoomsData();
		});




		socket.on('wrongPW', async (data) => {
			if (currentUser.id == data.user.id) {
				currentRoom.id = -1;
			}
		});
		socket.on('passwordChanged', async() => {
			chatRooms = await fletchChatRoomsData();
		});
		socket.on('blocked', async (data) => {
			if (currentUser.id === data.user.id) {
				blocked = data.block;
			if (currentRoom?.id)
				socket.emit('getMessage', currentRoom);
			}
		});
		socket.on('unblocked', async (data)=> {
			if (currentUser.id === data.id) {

				await fetchBlockedData();
		if (currentRoom?.id)
				socket.emit('getMessage', currentRoom);
			}
		});
		socket.on('InvitedNotif', async(data) => {
            // if (data.invitedBy === currentUser.pseudo) {
            //     location.href = data.url;
            // }
			if (data.invited.id === currentUser.id) {
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
		if (data?.target?.id == currentUser.id) {
			if (data.accepted == false) {
				return;
			}
			else {
				location.href = data.url;
			}
		}
	  });
		chatRooms = await fletchChatRoomsData();
		currentUser = await fletchCurrentUserData();
		if (currentUser.id < 0) {
			window.location.pathname = '/';
		}
		await fetchBlockedData();
		checkFormValidity();
		loading = true;
	});
</script>

<svelte:head>
	<!-- <link rel="stylesheet" href="/style.css" /> -->
	<title>Chat</title>
	<link rel="preload" href="/img/bg1.jpg" as="image">
	<link rel="preload" href="/homepage_style.css" as="style"/>
	<link rel="stylesheet" href="/homepage_style.css" />
	<link rel="stylesheet" href="/navbar.css" />
	<link rel="stylesheet" href="/chat_style.css" />
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
<!----------------------------------------------->
<!----------------- NAVBAR ---------------------->
<!----------------------------------------------->
	<div class="game_navbar">
		<div class="button_box">
			<img class="button_picture" src="/img/home_icone.png" alt=""/>
			<button class="button_nav" on:click={() => fade('/homepage')}>Home</button>
		</div>

		<div class="button_box">
			<img class="button_picture" src="/img/profile_icone.png" alt="" />
			<button class="button_nav" on:click={() => fade(`/profile/${currentUser.id}`)}>Profile</button
			>
		</div>

		<div class="button_box">
			<img class="button_picture" src="/img/game_icone.png" alt="" />
			<button class="button_nav" on:click={() => fade('/game')}>Game</button>
		</div>

		<div class="button_box">
			<img class="button_picture" src="/img/chat_icone.png" alt="" />
			<button class="button_nav" on:click={() => fade('/dm')}>DM</button>
		</div>
		
	</div>
	<div class="chat_body">
		<!----------------------------------------------->
		<!----------------- LEFT BLOC ------------------->
		<!----------------------------------------------->
			<div class="left_bloc">
				<!----------------- CREATE ROOM ------------------->
				<div class="create-room">
					<h2 class="room-form-title">Créer une room:</h2>
					<form
						class="create_room_form"
						on:submit={(event) => handleSubmit(event, socket)}
						bind:this={form}
					>
						<label for="roomName" />
						<input
							class="form-input"
							type="text"
							id="roomName"
							name="roomName"
							placeholder="Nom de la salle *"
							on:input={handleNameInput}
							required
						/>

						<label for="password" />
						<input
							class="form-input"
							type="password"
							id="password"
							name="password"
							placeholder="Mot de passe"
							on:input={handlePasswordInput}
						/>

						<label class="private_room">
							<input
								class="form-input"
								type="checkbox"
								id="private"
								name="private"
								on:change={handlePrivateOption}
							/>
							Salle privée 🔒
						</label>
						<button class="form_button" type="submit" disabled={!isFormValid}>Créer la salle</button
						>
					</form>
				</div>
				<!----------------- PUBLIC ROOM LIST------------------->
				<div class="public_room_list">
					<h2 class="room-title">Rooms publics</h2>
					{#each chatRooms as chatRoom}
						{#if chatRoom.private === false && chatRoom.password == false}
							{#if currentRoom?.id === chatRoom.id}
								<button class="chatroom-button-connected" on:click={() => handleRoomButton(chatRoom, '')}>
									{chatRoom?.name}
								</button>
							{:else}
								<button class="chatroom-button" on:click={() => handleRoomButton(chatRoom, '')}>
									{chatRoom?.name}
								</button>
							{/if}
						{/if}
						{#if chatRoom.private === false && chatRoom.password == true}
							<div class="wrap_button">
								{#if animation?.id === chatRoom.id && animation?.content === 'wrong'}
								<!-- cvhdevchdbjkc -->
									<button class="chatroom-button-failed" on:click={() => displayInputPassword(chatRoom.id)}>
										<span>🔒 </span>
										{chatRoom.name}
									</button>
								{:else}
									{#if currentRoom?.id === chatRoom.id}
									<button class="chatroom-button-connected" on:click={() => displayInputPassword(chatRoom.id)}>
										<span>🔒 </span>
										{chatRoom.name}
									</button>
									{:else}
										<button class="chatroom-button" on:click={() => displayInputPassword(chatRoom.id)}>
											<span>🔒 </span>
											{chatRoom.name}
										</button>
									{/if}

									<!-- <button class="chatroom-button" on:click={() => displayInputPassword(chatRoom.id)}>
										<span>🔒 </span>
										{chatRoom.name}
									</button> -->
								{/if}
							</div>
							{#if passwordInput.bool == true && passwordInput.roomId == chatRoom?.id}
								<input
									class="password-room-access-input"
									type="password"
									placeholder="Mot de passe"
									on:keydown={(event) => handlePasswordInputKeyDown(event, chatRoom)}
								/>
							{/if}
						{/if}
					{/each}
				</div>
				<!----------------- PRIVATE ROOM LIST------------------->
				<div class="private_room_list">
					<h2 class="room-title">Rooms Privées</h2>
					{#each chatRooms as chatRoom}
					{#if chatRoom.private === true && chatRoom.password == false}
					{#if currentRoom.id === chatRoom.id}
						<button class="chatroom-button-connected" on:click={() => handleRoomButton(chatRoom, '')}>
							{chatRoom.name}
						</button>
					{:else}
						<button class="chatroom-button" on:click={() => handleRoomButton(chatRoom, '')}>
							{chatRoom.name}
						</button>
					{/if}
				{/if}
				{#if chatRoom.private === true && chatRoom.password == true}
					<div class="wrap_button">
						{#if animation?.id === chatRoom.id && animation?.content === 'wrong'}
						<!-- cvhdevchdbjkc -->
							<button class="chatroom-button-failed" on:click={() => displayInputPassword(chatRoom.id)}>
								<span>🔒 </span>
								{chatRoom.name}
							</button>
						{:else}
							{#if currentRoom.id === chatRoom.id}
							<button class="chatroom-button-connected" on:click={() => displayInputPassword(chatRoom.id)}>
								<span>🔒 </span>
								{chatRoom.name}
							</button>
							{:else}
								<button class="chatroom-button" on:click={() => displayInputPassword(chatRoom.id)}>
									<span>🔒 </span>
									{chatRoom.name}
								</button>
							{/if}

							<!-- <button class="chatroom-button" on:click={() => displayInputPassword(chatRoom.id)}>
								<span>🔒 </span>
								{chatRoom.name}
							</button> -->
						{/if}
					</div>
					{#if passwordInput.bool == true && passwordInput.roomId == chatRoom.id}
						<input
							class="password-room-access-input"
							type="password"
							placeholder="Mot de passe"
							on:keydown={(event) => handlePasswordInputKeyDown(event, chatRoom)}
						/>
					{/if}
				{/if}
					{/each}
				</div> 
				<!----------------- ROOM SETTINGS ------------------->
				{#if currentRoom}
				<div class="room_settings">
						<h2 class="room-title">Réglages</h2>
						<div class="input_box_settings">
						{#if currentRoom.name.length}
							<!-- <h3 class="room_name">{currentRoom.name}</h3> -->



								{#if currentUser?.status === 2 && currentRoom?.password === true}
								<div class="password_change_bloc">
									<input 	placeholder="Nouveau mot de passe"
											type="password"
											class="password_change_input" on:keypress={(event) => handlePasswordChange(event)} />
											<button class="delete_password" on:click={handleDelPassword}>Supprimer mot de passe</button>
								</div>
								{/if}

								

								<!-- <div class="useradd_bloc">
									<input
										placeholder="Ajouter un utilisateur"
										class="room-bandeau-form-input"
										on:keypress={handleInvitKeyPress}
										bind:value={userPseudoInput}
									/>
									<button class="settings_button" on:click={handleInvitUserInput}
										>+
									</button>
								</div> -->
								{#if currentUser.status === 2 && currentRoom?.id > 0}
								<button class="leave_chat" on:click={leaveRoom}>Supprimer la room ❌</button>
								{:else if  currentRoom?.id > 0}
								<button class="leave_chat" on:click={leaveRoom}>Quitter la room ❌</button>
								{/if}
								{/if}
							</div>
					</div>
				{/if}
			</div>
		<!----------------------------------------------->
		<!----------------- MIDDLE BLOC ----------------->
		<!----------------------------------------------->
			<div class="message_container">
				{#if currentRoom}
					{#if currentRoom?.id >= 0}
						<div class="chat-messages" id="chat-messages">
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
												on:click={(event) => handleClickPseudo(event, msg.senderId)}
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
						</div>
					{/if}
					{#if currentRoom.name.length && currentRoom.id > 0}
						<div class="message_input_container">
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
									class="send-message-button"
									id="sendMessageButton"
									type="submit"
									disabled
									on:click={(event) => {
										const messageInput = document.getElementById('message');
										if (messageInput instanceof HTMLInputElement) {
											sendMessage(event, messageInput, currentRoom);
											messageInput.value = '';
										}
									}}><img class="sent_icone" src="/img/edit_profile.png" alt="" /></button
								>
							</form>
						</div>
					{/if}

				{/if}
			</div>
		<!----------------------------------------------->
		<!----------------- RIGHT BLOC ----------------->
		<!----------------------------------------------->
			{#if currentRoom?.id >= 0}
				<div class="right_bloc">
					<div class="user_list">
						{#if currentRoom?.id}
							<div class="member_list">
								<h2 class="room-title">Membres</h2>
								{#if membres && membres.length}
								{#each membres as member}
									{#if member?.wins === 2}
										<button
										class="pseudo-button-message_owner"
										on:click={(event) => handleClickPseudo(event, member.id)}
										>
										{member.username}
										</button>
									{/if}
									{#if member?.wins === 1}
										<button
										class="pseudo-button-message_admin"
										on:click={(event) => handleClickPseudo(event, member.id)}
										>
										{member.username}
										</button>
									{/if}
									{#if member?.wins === 0}
										<button
										class="pseudo-button-message"
										on:click={(event) => handleClickPseudo(event, member.id)}
										>
										{member.username}
										</button>
									{/if}
							{/each}
							<div class="useradd_bloc">
								<input
									placeholder="Ajouter un utilisateur"
									class="room-bandeau-form-input"
									on:keypress={handleInvitKeyPress}
									bind:value={userPseudoInput}
								/>
								<!-- <button class="settings_button" on:click={handleInvitUserInput}
									>+
								</button> -->
							</div>
								{/if}
							</div>
						{/if}

						{#if currentRoom?.id}
							<div class="public_room">
								<h2 class="room-title">Banned</h2>
								{#if banned?.length}
									{#each banned as ban}
										<button
											class="pseudo-button-message"
											on:click={(event) => handleClickPseudo(event, ban.id)}
										>
											💀 {ban.username}
										</button>
									{/each}
								{/if}
							</div>

							<div class="public_room">
								{#if currentRoom?.id}
									<h2 class="room-title">Muted</h2>
									{#if muted?.length}
										{#each muted as mute}
											<button
												class="pseudo-button-message"
												on:click={(event) => handleClickPseudo(event, mute.id)}
											>
												🔕 {mute.username}
											</button>
										{/each}
									{/if}
								{/if}
							</div>
						{/if}
					</div>
					<div class="menu">
						{#if isShown === true}
							{#if showOptionsPseudo.length}
								<h1>{selectedUser.pseudo}</h1>
								{#if find(showOptionsPseudo, 'profile') === true}
									<button class="button_show_profile" on:click={showProfile}>Voir le profil</button>
									<button class="button_show_profile" on:click={handleDM}>DM</button>
									<button class="button_show_profile" on:click={handleInviteGameButton}>Invite to play</button>
								{/if}
								{#if find(showOptionsPseudo, 'ban') === true}
									<button
										class="button_show_profile"
										on:click={() => ban(selectedUser, currentRoom)}>Bannir</button
									>
								{/if}
								{#if find(showOptionsPseudo, 'mute') === true}
									<button
										class="button_show_profile"
										on:click={() => mute(selectedUser, currentRoom)}>Mute</button
									>
								{/if}
								{#if find(showOptionsPseudo, 'kick') === true}
									<button
										class="button_show_profile"
										on:click={() => kick(selectedUser, currentRoom)}>Expulser</button
									>
								{/if}
								{#if find(showOptionsPseudo, 'unBan') === true}
									<button
										class="button_show_profile"
										on:click={() => deban(selectedUser, currentRoom)}>Débannir</button
									>
								{/if}
								{#if find(showOptionsPseudo, 'unMute') === true}
									<button
										class="button_show_profile"
										on:click={() => unmute(selectedUser, currentRoom)}>Démute</button
									>
								{/if}
								{#if find(showOptionsPseudo, 'upAdmin') === true}
									<button
										class="button_show_profile"
										on:click={() => upadmin(selectedUser, currentRoom)}>OP</button
									>
								{/if}
								{#if find(showOptionsPseudo, 'unAdmin') === true}
									<button
										class="button_show_profile"
										on:click={() => deUpadmin(selectedUser, currentRoom)}>DE-OP</button
									>
								{/if}
								{#if  find(showOptionsPseudo, 'block')}
								<button
								class="button_show_profile"
								on:click={() => block(selectedUser)}>block</button
								>
								{/if}
								{#if  find(showOptionsPseudo, 'unblock')}
								<button
								class="button_show_profile"
								on:click={() => unblock(selectedUser)}>unblock</button
								>
								{/if}
								<button
								class="button_show_profile"

								 on:click={delMenu}>X</button>
							{/if}
						{/if}
					</div>
				</div>
			{/if}
	
	</div>	
	{/if}
	</body
>
