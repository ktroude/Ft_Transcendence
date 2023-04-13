<script lang="ts">
    import { onMount } from 'svelte';
    import { io, Socket } from 'socket.io-client';
	import { null_to_empty } from 'svelte/internal';
    
// VARIABLES

    let socket: Socket;
    let isFormValid = false;
    let chatRooms:ChatRoom[] = [];
    let loading = false;
    let form: HTMLFormElement;
    let formData: RoomFormData = {
        roomName: '',
        private: false
    };
    let messages:any[];
    let currentRoom:any = null;

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

    interface RoomFormData {
        roomName: string;
        password?: string;
        private: boolean;
    }

// FUNCTIONS

    function handleNameInput(event:any) {
        formData.roomName = (event.target as HTMLInputElement).value;
        checkFormValidity();
    }

    function handlePasswordInput(event:any) {
        formData.password = (event.target as HTMLInputElement).value;
    }
  
    function handlePrivateOption(event:any) {
        formData.private = (event.target as HTMLInputElement).checked;
        checkFormValidity();
    }
  
    function checkFormValidity() {
        isFormValid = formData.roomName.length > 0 && formData.private !== undefined;
    }
  
    async function handleSubmit(event: Event, socket:Socket) {
        event.preventDefault();
        if (isFormValid && formData.roomName.length) {
            let data = {
                name: formData.roomName,
                password: formData.password,
                private: formData.private,
            };
            if (data.password===undefined)
                data.password = '';
            socket.emit("createRoom", data);
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

    function handleRoomButton(room:ChatRoom) {
        currentRoom = room;
        socket.emit('getMessage', room);
    }
    
    function sendMessage(event: Event, messageInput: HTMLInputElement, currentRoom:ChatRoom) {
        event.preventDefault();
        if (messageInput && messageInput.value && messageInput.value.length && currentRoom && currentRoom.id) {
            const messageValue = messageInput.value;
            const data = {
                roomId: currentRoom.id,
                content: messageValue,
            }
            socket.emit("sendMessage", data);
            console.log(messages);
            messageInput.value = "";
        }
}
    const fletchChatRoomsData = async(): Promise<ChatRoom[]> => {
        const cookies = document.cookie.split(';');
        const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
        const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
        if (accessToken) {
            const headers = new Headers();
            headers.append('Authorization', `Bearer ${accessToken}`);
            const response = await fetch('http://localhost:3000/chat/getRoom', { headers });
            const data = await response.json();
            console.log(data);
            return data;
        }
        return [];
    }

    onMount(async () => {
        const cookies = document.cookie.split(';');
        const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
        const access_token = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
        socket = io('http://localhost:3000', {
            extraHeaders: {
                Authorization: 'Bearer ' + access_token,
            }
         });
        socket.on("connect", () => {
        console.log("Connected to server");
        });
        socket.on("roomCreated", (newRoom: ChatRoom) => {
            updateChatRooms(newRoom);
        });
        socket.on('returnMessage', (msg:any[]) => {
            messages = msg;
        } )
        socket.on('newMessage', (msg:any) => {
            messages = [...messages, msg];
        } );
        chatRooms = await fletchChatRoomsData();
        loading = true;
        checkFormValidity();
    });

    </script>

<svelte:head>
  <link rel="stylesheet" href="/style.css">
</svelte:head>


<!-- HTML CODE -->

<h1>Chat</h1>
<h2>Liste des rooms:</h2>
{#if loading===false}
  <p>Chargement...</p>
{:else}
  {#each chatRooms as chatRoom}
    <button class='chatroom-button' on:click={() => handleRoomButton(chatRoom)}>{chatRoom.name}</button>
  {/each}
{/if}

 <h2>Creer une room: </h2>
  <form on:submit={(event) => handleSubmit(event, socket)} bind:this={form}>
    <label for="roomName">Nom de la salle *</label>
    <input class='form-input' type="text" id="roomName" name="roomName" on:input={handleNameInput} required>
  
    <label for="password">Mot de passe</label>
    <input class='form-input' type="password" id="password" name="password" on:input={handlePasswordInput}>
  
    <label>
      <input class = 'form-input' type="checkbox" id="private" name="private" on:change={handlePrivateOption}>
      Salle privée
    </label>
    <button class='form-button' type="submit" disabled={!isFormValid}>Créer la salle</button>
  </form>
  <div class="chat-messages">
    {#if messages && messages.length}
    {#each messages as msg}
        <p> {msg.senderPseudo} : {msg.content} </p>
    {/each}
    {/if}
  </div>  
  <input type="text" id="message" name="message">
  <button type="submit" on:click={(event) => {
        const messageInput = document.getElementById('message');
        if (messageInput instanceof HTMLInputElement) {
            sendMessage(event, messageInput, currentRoom);
        }
    }}>Envoyer</button>

