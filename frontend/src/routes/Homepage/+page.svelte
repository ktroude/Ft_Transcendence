<style>
    .friend-list {
      float: right;
      margin-right: 800px;
      margin-top: 25px;
    }

    .add-friend {
    margin-top: -20px;
    margin-left: 20px;
  }

  .add-friend button {
    font-size: 12px;
    padding: 5px 10px;
    margin-right: -70px;
  }
  </style>

  
<div class="container">
    <div class="friend-list">
      <h2>Friend List</h2>
    </div>
  </div>
  <div class = "friend-list add-friend">
    <input type="text" bind:value={friendName} />
    <button on:click={handleAddFriend}>Add Friend</button>
  </div>

<script lang="ts">

    import { onMount } from 'svelte';
    import { goto } from "$app/navigation";

    let friendName: string;
    
    const  handleAddFriend = async () => {
        await fetchData();
        console.log(friendName);
        console.log(user.pseudo);
        if (!friendName)
            return;
        const cookies = document.cookie.split(';');
        const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
        const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
        const response = await fetch(`http://localhost:3000/users/${user.pseudo}/friend`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
        body: JSON.stringify({friend: friendName })
      });
      if (response.ok)
        friendName = '';
      else
        console.log('Error: Could not add friend');
      }
        

    let user: User;
    interface User {
        pseudo: string;
        firstName: string;
        lastName: string;
    }


    const fetchData = async () => {
        const cookies = document.cookie.split(';');
        const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
        const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;

        if (accessToken) {
            const headers = new Headers();
            headers.append('Authorization', `Bearer ${accessToken}`);
            const response = await fetch('http://localhost:3000/users/userInfo', { headers });
            const data = await response.json();
            user = {
                pseudo: data.pseudo,
                firstName: data.firstname,
                lastName: data.lastname,
            };
        } else {
            console.log('Access token not found');
        }
    }

    const gotoRoute = (route: string) => {
        goto("http://localhost:5173" + route);
    }

    onMount(() => {
        fetchData();
    });
</script>

<h1>Ceci est la homepage et tu es {user?.firstName}</h1>

<button on:click={() => gotoRoute('/profile')}> Profil </button>
<button on:click={() => gotoRoute('/game')}> Game </button>
<button on:click={() => gotoRoute('/chat')}> Chat </button>