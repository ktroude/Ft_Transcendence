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

  .delete-friend button {
    font-size: 12px;
    padding: 5px 10px;
    margin-right: -85px;
  }
  .delete-friend {
    margin-top: 30px;
    margin-left: 20px;
  }
  </style>

<div class="container">
  <div class="friend-list">
    <h2>Friend List</h2>
  </div>
</div>

<div class="friend-list add-friend">
  <input type="text" bind:value={friendName} />
  <button on:click={handleAddFriend}>Add Friend</button>
  <ul>
    {#each friends as friendName}
      <li>{friendName}</li>
    {/each}
</div>
<div class="friend-list delete-friend">
    <input type="text" bind:value={friendName} />
    <button on:click={handleDeleteFriend}>Delete Friend</button>
  </div>

<script lang="ts">

    import { onMount } from 'svelte';
    import { goto } from "$app/navigation";
    import {fetchData, fetchFriend, fetchAccessToken} from "../../API/api";

    let friends = [];
    let friendName: string;
    
    const handleDeleteFriend = async () =>
    {
        console.log("DELETE FUNCTION");
        friendName = '';
    }

    const  handleAddFriend = async () => {
        await fetchData();
        if (!friendName)
            return;
        const accessToken = await fetchAccessToken();
        if (accessToken) {
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
    }
        

    let user: User;
    interface User {
        id: number;
        pseudo: string;
        firstName: string;
        lastName: string;
    }

    const loadpage = async () =>
    {
        user = await fetchData();
        const listFriends = await fetchFriend(user.pseudo);
        if (listFriends)
            friends = listFriends;
        else
            console.log('Error: Could not get friends');
    }

    const gotoRoute = (route: string) => {
        goto("http://localhost:5173" + route);
    }

    onMount(() => {
        loadpage();
    });
</script>

<h1>Ceci est la homepage et tu es {user?.pseudo}</h1>

<button on:click={() => gotoRoute('/profile')}> Profil </button>
<button on:click={() => gotoRoute('/game')}> Game </button>
<button on:click={() => gotoRoute('/chat')}> Chat </button>