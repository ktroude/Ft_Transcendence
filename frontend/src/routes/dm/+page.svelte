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
        await fletchDirectMessageRoomData();
    });









</script>

<body>


</body>
