<style>
	@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@700&family=Signika+Negative:wght@500&display=swap');
	*{
		font-family: 'Roboto', sans-serif;
	}

	body {
		padding:0px;
		margin:0px;
	}

	.button_nav {
		display: block;
		margin: 0 auto;
		padding: 10px 20px;
		background-color: transparent;
		border: white;
		color:rgb(146, 146, 146);
		border: none;
		width:120px;
		height:40px;
		border-radius: 5px;
		font-size: 20px;
		cursor: pointer;
		margin: auto;
	}

	.button_nav:hover {
		color:white;
		font-size: 22px;
	}

	.game_navbar{
		height:50px;
		width:100%;
		background:#201207;
		display: flex;
		flex-direction: row;
		align-items: center;
	}
</style>

<body>	
	<div class="game_navbar">
		<button class="button_nav" on:click={() => goto('/homepage')}>Home</button>
		<button class="button_nav" on:click={() => goto(`/profile/${user.pseudo}`)}>Profile</button>
		<button class="button_nav" on:click={() => goto('/chat')}>Chat</button>
		<button class="button_nav" on:click={() => goto('/game')}>Game</button>
	</div>
	<div class="container">
		<h1>Ceci est la homepage et tu es {user?.pseudo}</h1>
	</div>
</body>

<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from "$app/navigation";
  import {fetchData, fetchFriend} from "../../API/api";

  let friends = [];

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

    onMount(() => {
        loadpage();
    });
</script>