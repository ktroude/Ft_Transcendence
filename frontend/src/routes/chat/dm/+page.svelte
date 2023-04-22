<script lang="ts">
	import { io, Socket } from 'socket.io-client';

	import { onMount } from 'svelte';

	let socket:Socket;
    let currentUser:any;
    let currentRoom:any;
    let selectedUser:any;
    let roomList:any[];
    let messages:any[];

	onMount(() => {
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
        socket.emit('getDirectMessageRoom')
        socket.on('DmRoomCreated', (data) => {
            if (currentUser.id === data.user1.id || currentUser.id === data.user2.id) {
                roomList = [...roomList, data.room]
            }
        });
        // socket.on('returnDmMessages', (data) => {
        //     if (currentRoom?.id === data.room.id){
        //         messages = data.room.message
        //     }
        // });
        socket.on('newDirectMessage', (data) => {
            if (currentRoom.id === data.room.id) {
                messages = [...messages, data.message];
            }
        });
        socket.on('DirectMessageRoomData', (data) => {
            if (data.user.id === currentUser.id) {
                roomList = data.rooms;
            }
        });
        socket.on('returnDirectMessage', (data) => {
            if (currentUser.id === data.user.id) {
                messages = data.messages;
            }
        });











    });
</script>

<body>


</body>
