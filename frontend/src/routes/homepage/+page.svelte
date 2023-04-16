<style>
	button {
		display: block;
		margin: 0 auto;
		padding: 10px 20px;
		background-color: #007bff;
		color: #fff;
		border: none;
		width:120px;
		height:40px;
		border-radius: 5px;
		font-size: 16px;
		cursor: pointer;
		margin: auto;
	}
	button:hover {
		background-color: #014b9a;
	}
	.game_navbar{
		height:50px;
		width:100%;
		background:grey;
		display: flex;
		flex-direction: row;
		align-items: center;
	}
</style>

<main>	
	<div class="game_navbar">
		<button on:click={() => goto('/homepage')}>Home</button>
		<button on:click={() => goto('/profile')}>Profile</button>
		<button on:click={() => goto('/chat')}>Chat</button>
		<button on:click={() => goto('/game')}>Game</button>
	</div>
	<div class="container">
		<h1>Ceci est la homepage et tu es {user?.pseudo}</h1>
	</div>
</main>

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
      console.log(`Showing profile of ${friendName}`);
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
