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

<div class="friend-list add-friend">
  <input type="text" bind:value={friendNameAdd} />
  <button on:click={handleAddFriend}>Add Friend</button>
  <ul>
    {#each friends as friendName}
      <li on:click={() => handleFriendClick(friendName)}>
        {friendName}
        {#if clickedFriend === friendName && showButtons}
          <button on:click={() => {if (showButtons) handleMessageFriend(friendName)}}>Send Message</button>
          <button on:click={() => {if (showButtons) handleInviteFriend(friendName)}}>Invite to Play</button>
          <button on:click={() => {if (showButtons) handleProfileFriend(friendName)}}>See Profile</button>
          <button on:click={() => {if (showButtons) handleDeleteFriend(friendName)}}>Delete Friend</button>
        {/if}
      </li>
    {/each}
  </ul>
</div>

<script lang="ts">
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-navigator';
  import { goto } from "$app/navigation";
  import {fetchData, fetchFriend, fetchAccessToken} from "../../API/api";

  let previousFriend: string;
  let showButtons = false;
  let clickedFriend: string;
  let friends = [];
  let friendNameAdd: string;

  let user: User;
    interface User {
        id: number;
        pseudo: string;
        firstName: string;
        lastName: string;
    }

  function handleFriendClick(friendName: string) {
    clickedFriend = friendName;
    setShowButtons(previousFriend !== clickedFriend ? true : !showButtons);
    previousFriend = clickedFriend;
  }

  async function setShowButtons(value: boolean) {
    showButtons = value;
    console.log("showButtons: " + showButtons);
  }

  async function handleMessageFriend(friendName) {
    console.log(`Sending message to ${friendName}`);
  }

  async function handleProfileFriend(friendName) {
  const accessToken = await fetchAccessToken();
    if (accessToken) 
    {
      navigate(`/${friendName}`);
    } 
    else 
      console.log('Error: Could not get profile');
  }

  async function handleDeleteFriend(friendName) {
    const accessToken = await fetchAccessToken();
    if (accessToken)
    {
      const response = await fetch(`http://localhost:3000/users/${user.pseudo}/deletefriend`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({friend: friendName })
        });
        if (response.ok)
            friends = friends.filter(friend => friend !== friendName);
        else
            console.log('Error: Could not delete friend');
      }
      else
        console.log('Error: Could not delete friend');
    }

  function handleInviteFriend(friendName) {
    console.log(`Inviting ${friendName} to play`);
  }

    const  handleAddFriend = async () => {
        await fetchData();
        if (!friendNameAdd)
            return;
        const accessToken = await fetchAccessToken();
        if (accessToken) {
            const response = await fetch(`http://localhost:3000/users/${user.pseudo}/friend`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({friend: friendNameAdd })
        });
        if (response.ok)
        {
            friends = await fetchFriend(user.pseudo);
            friendNameAdd = '';
        }
        else
            console.log('Error: Could not add friend');
        }
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

<button on:click={() => gotoRoute(`/profile/${user.pseudo}`)}> Profil </button>
<button on:click={() => gotoRoute('/game')}> Game </button>
<button on:click={() => gotoRoute('/chat')}> Chat </button>