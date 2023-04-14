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
    let currentUser:User;
    let selectedUser:User;
    let showOptionsPseudo:string[] = [];
    let isShown = true;
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
        pseudo: string;
        status: number; // 2 = owner, 1 = admin, 0 = member, -1 = muted, -2 banned
        room:number;
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
        socket.emit('getUser', room);
        console.log('handleRoomButton');
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


    async function displayDropdownMenu(currentUser:User, selectedUser:User):Promise<string[]> {
        if (currentUser && currentUser.status) {
            if (selectedUser && !selectedUser.status) {
                const data = {
                    id: currentRoom.id,
                    pseudo: selectedUser.pseudo,
                };
                const checkUserPromise = new Promise<User>((resolve) => {
                socket.emit('checkUser', data);
                socket.on('returnCheckUser', (data) => {
                    resolve(data);
                });
            });
            selectedUser = await checkUserPromise;
            console.log('selcted User === ', selectedUser );
            }
            if (selectedUser && selectedUser.status) {
                // CU = currentUser | SU = selectedUser
                if (currentUser.status === 2 && selectedUser.status === 1) {
                    return ['profile', 'unAdmin'];
                    // CU = owner | SU = admin
                }
                else if (currentUser.status === 2 && selectedUser.status === 0) { 
                    return ['profile', 'upAdmin', 'ban', 'mute', 'kick'];
                    // CU = owner | SU = membre
                }
                else if ((currentUser.status === 1) && selectedUser.status === 0) {
                    return ['profile', 'ban', 'mute', 'kick'];
                    // CU = admin | SU = membre
                }
                else if ((currentUser.status === 1 || currentUser.status === 2) && selectedUser.status === -1) {
                    return ['profile', 'unMute', 'kick', 'ban'];
                    // CU = owner ou admin | SU = muted
                }
                else if ((currentUser.status === 1 || currentUser.status === 2) && selectedUser.status === -2) {
                    return ['profile', 'unBan'];
                    // CU = owner ou admin | SU = banned
                }
                else if (currentUser.status === 0 || currentUser.status === -1) {
                    return ['profile',];
                    // CU = membre ou muted
                }
                else if (currentUser.status === 1 && selectedUser.status === 2) {
                    return ['profile',];
                    // CU = admin | SU = owner
                }
                else if (currentUser.status === selectedUser.status) {
                    return ['profile',];
                }
            }
        }
        return [];
    }

    async function handleClickPseudo(event:any, selectedUser:any) {
        showOptionsPseudo = await displayDropdownMenu(currentUser, selectedUser);
  }


  function find(array:any[], toFind:any):boolean {
    return array.find(element => element === toFind) !== undefined;
  }

  function delMenu() {
    isShown = !isShown;
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
        });
        socket.on('newMessage', (msg:any) => {
            messages = [...messages, msg];
        });
        socket.on('returnUser', (user:User) => {
            console.log('USERR ===', user);
            currentUser = user;
            console.log('CURRENT USER ===', user);
        });
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
        <p>
          <button class="pseudo-button" on:click={(event) => handleClickPseudo(event,msg.senderPseudo)}>{msg.senderPseudo}</button> : {msg.content}
        </p>
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

{#if isShown}
<div>
        {#if showOptionsPseudo.length}
      <select id="pseudo-menu">
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