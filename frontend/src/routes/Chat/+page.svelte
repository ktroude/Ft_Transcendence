<script lang="ts">
    import { onMount } from 'svelte';
    import { io, Socket } from 'socket.io-client';
	import { dataset_dev } from 'svelte/internal';
    
    let socket: Socket;
    let isFormValid = false;
    let chatRooms:ChatRoom[] = [];
    let loading = false;

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

    let formData: RoomFormData = {
        roomName: '',
        private: false
    };

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
  
    function handleSubmit(event: Event, socket:Socket) {
        event.preventDefault();
        if (isFormValid) {
            let data = {
                name: formData.roomName,
                password: formData.password,
                private: formData.private,
            };
            if (data.password===undefined)
                data.password = '';
            socket.emit("createRoom", data);
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
        chatRooms = await fletchChatRoomsData();
        loading = true;
        checkFormValidity();
    });

  </script>

<h1>Chat</h1>
<h2>Liste des rooms:</h2>
{#if loading===false}
  <p>Chargement...</p>
{:else}
  {#each chatRooms as chatRoom}
    <button>{chatRoom.name}</button>
  {/each}
{/if}

 <h2>Creer une room: </h2>
  <form on:submit={(event) => handleSubmit(event, socket)}>
    <label for="roomName">Nom de la salle *</label>
    <input type="text" id="roomName" name="roomName" on:input={handleNameInput} required>
  
    <label for="password">Mot de passe</label>
    <input type="password" id="password" name="password" on:input={handlePasswordInput}>
  
    <label>
      <input type="checkbox" id="private" name="private" on:change={handlePrivateOption}>
      Salle privée
    </label>

    <button type="submit" disabled={!isFormValid}>Créer la salle</button>
  </form>