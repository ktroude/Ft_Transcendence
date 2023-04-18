<style>

	*{
		font-family: 'Roboto', sans-serif;
		margin:0px;
		padding:0px;
	}

	body {
		margin: 0;
		padding:0px;
		height: 100vh;
		width:100vw;
		overflow: hidden;
	}

	button {
		display: block;
		margin: 0 auto;
		padding: 10px 20px;
		background-color: #000000;
		color: #fff;
		width:120px;
		height:40px;
		border-radius: 5px;
		font-size: 16px;
		cursor: pointer;
		margin: auto;
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

	.main_game{
		margin:0px;
		padding:0px;
		height:100vh;
		width:100vw;
		display: flex;
		flex-direction: row;
	}

	.historic_box{
		padding:5px;
		height:100vh;
		width:15%;
		text-align: center;
	}

	.game_box{
		height:100vh;
		background:rgb(56, 56, 56);
		width:70%;
	}

	.friendlist_box{
		padding:5px;
		width:15%;
		height:50vh;
		text-align: center;
	}

	.game_navbar{
		height:50px;
		width:100%;
		background:#201207;
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.friend_button{
		padding:0px;
		width:100px;
		height:30px;
		align-items: center;
		text-align: center;
		font-size: 12px;
	}

	.friend-list{
		padding:5px;
		font-size: 20px;
		display:flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.input_friend{
		background:rgb(174, 174, 174);
		border:none;
		border-radius: 3px;
		height:20px;
		font-size: 20px;
		width:200px;
		margin:auto;
	}

	.ul_friends{
		align-items: center;
		text-align: center;
		list-style: none;
	}
	.ul_friends:hover{
		cursor: pointer;
	}

	.addfriend_button {
		width: 20px;
		height: 20px;
		margin: 5px;
		font-size: 15px;
		color:black;
		align-items: center;
		text-align: center;
		display: flex; 
		justify-content: center;
		align-items: center;
		background:greenyellow;
	}

	.addfriend_button:hover {
		background:rgb(215, 254, 206);
	}

	.addfriend_bloc{
		text-align: center;
		display: flex;
		align-items: center;
	}

	.accept_invite{
		background:black;
		color:rgb(92, 255, 47);
		width: 20px;
		height: 20px;
		margin: 5px;
		font-size: 16px;
		align-items: center;
		text-align: center;
		display: flex; 
		justify-content: center;
		align-items: center;
	}

	.deny_invite{
		color:red;
		width: 20px;
		height: 20px;
		margin: 5px;
		font-size: 16px;
		background-color: rgb(0, 0, 0);
		align-items: center;
		text-align: center;
		display: flex; 
		justify-content: center;
		align-items: center;
	}

	.friendBloc{
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;

	}
	.search_profile{
		background:green;
		padding:5px;
		height:100%;
		text-align: center;
	}
	.friend-list{
		height:100%;
	}
	.search_bloc{
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.search_button{
		width: 20px;
		height: 20px;
		font-size: 15px;
		color:black;
		align-items: center;
		text-align: center;
		display: flex; 
		justify-content: center;
		align-items: center;
		background: transparent;
		border: none;
	}
	.search_button:hover{
		transform: rotate(-10deg)
	}
	
</style>

<body>
	<div class="game_navbar">
		<button class="button_nav" on:click={() => goto('/homepage')}>Home</button>
		<button class="button_nav" on:click={() => goto(`/profile/${user.pseudo}`)}>Profile</button>
		<button class="button_nav" on:click={() => goto('/chat')}>Chat</button>
		<button class="button_nav" on:click={() => goto('/game')}>Game</button>
	</div>
	<div class="main_game">
			<div class="historic_box">
				<h2>History</h2>
			</div>
			<div class="game_box">
			</div>
			<div class="friendlist_box">
				<div class="friend-list add-friend">
					<h2>Friendlist</h2>
					<div class="addfriend_bloc"> <input class="input_friend" type="text" bind:value={friendNameAdd} />
						<button class="addfriend_button" on:click={handleAddFriend}>+</button></div>
					<ul class="ul_friends">
					  {#each friends as friendName}
					  <!-- svelte-ignore a11y-click-events-have-key-events -->
					  <li class="friends_list" on:click={() => handleFriendClick(friendName)}>
						{friendName}
						<div class="friendBloc">
							{#if invited === 1 }
								<button class="accept_invite" on:click={() => acceptInvitation()}>V</button>
								<button class="deny_invite" on:click={() => denyInvitation()}>X</button>
							{/if}
						</div>
							{#if clickedFriend === friendName && showButtons && invited === 2}
								<button class="friend_button" on:click={() => {if (showButtons) handleMessageFriend(friendName)}}>Send Message</button>
								<button class="friend_button" on:click={() => {if (showButtons) handleInviteFriend(friendName)}}>Invite to Play</button>
								<button class="friend_button" on:click={() => {if (showButtons) handleProfileFriend(friendName)}}>See Profile</button>
								<button class="friend_button" on:click={() => {if (showButtons) handleDeleteFriend(friendName)}}>Delete Friend</button>
							{/if}
						</li>
					  {/each}
					</ul>
				  </div>
				  <div class="search_profile">
					<h1>Search profile</h1>
					<div class="search_bloc">
						<input class="input_friend" type="text" bind:value={searchProfile} />
						<button class="search_button" on:click={() => handleSearchProfile(searchProfile)}>🔍</button>
					</div>
				  </div>
			</div>
	</div>
</body>

<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from 'svelte';
    import { Buffer } from 'buffer';
    import { fetchAccessToken, fetchData, fetchFriend } from '../../API/api';

    let previousFriend: string;
    let showButtons = false;
    let clickedFriend: string;
    let friends = [];
    let friendNameAdd: string = '';
    let searchProfile: string = '';

    let user: User = undefined;
    interface User {
        id: number;
        pseudo: string;
        firstName: string;
        lastName: string;
        picture: string;
        username: string;
        createdAt: Date;
    }
	/*	
		-1 -> no invitation received
		 0 -> invitation denied or accepted
		 1 -> invitation received -> must be actualized when receiving an invitation
		 2 -> prevents buttons from showing up when accepting/denying invitation
	*/

	let invited = 1;

	async function handleSearchProfile(searchProfile: string) {
	console.log("handleSearchProfile:", searchProfile);
	if (!searchProfile) {
		return;
	}

	const accessToken = await fetchAccessToken();
	const url = `http://localhost:3000/users/${searchProfile}/search`;
	const response = await fetch(url, {
		method: 'GET',
		headers: {
		'Authorization': `Bearer ${accessToken}`,
		},
	});

	const userExists = await response.json(); // Parse response body as JSON
	if (userExists) { // Check if user exists
		goto(`/profile/${searchProfile}`);
	} else {
		console.log("user", searchProfile, "does not exist");
		return;
	}
	}

	async function acceptInvitation() {
		console.log("Accepted the invitation");
		goto(`/game/${'roomid'}`);
		/*function that sends to the other user that the invitation has been accepted*/
		invited = 0;
	}

	async function denyInvitation() {
		console.log("Denied the invitation");
		/*function that sends to the other user that the invitation has been denied*/
		invited = 0;
	}

    function handleFriendClick(friendName: string) {
		clickedFriend = friendName;
		setShowButtons(previousFriend !== clickedFriend ? true : !showButtons);
		previousFriend = clickedFriend;
	}

	async function setShowButtons(value: boolean) {
		if (invited == 0)
			invited = 2;
		else if (invited == 2 || invited == -1){
			invited = 2;
			showButtons = value;
			console.log("showButtons: " + showButtons);
		}
	}

    async function handleMessageFriend(friendName) {
        console.log(`Sending message to ${friendName}`);
    }

    async function handleProfileFriend(friendName) {
        const accessToken = await fetchAccessToken();
        if (accessToken)
			goto(`/profile/${friendName}`)
        else
            console.log('Error: Could not get profile');
    }

    async function handleDeleteFriend(friendName) {
        const accessToken = await fetchAccessToken();
        if (accessToken) {
            const response = await fetch(`http://localhost:3000/users/${user.pseudo}/deletefriend`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ friend: friendName })
            });
            if (response.ok)
                friends = friends.filter(friend => friend !== friendName);
            else
                console.log('Error: Could not delete friend');
        } else
            console.log('Error: Could not delete friend');
    }

    function handleInviteFriend(friendName) {
        console.log(`Inviting ${friendName} to play`);
		/*If accepted -> goto(`/game/${roomid}`); */
    }

    const handleAddFriend = async () => {
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
                body: JSON.stringify({friend: friendNameAdd})
            });
            if (response.ok) {
                friends = await fetchFriend(user.pseudo);
                friendNameAdd = '';
            } else
                console.log('Error: Could not add friend');
        }
    }

    let imageURL: string = '';
    let newUsername: string = '';

    async function getImageURL() {
        user = await fetchData(); // Get the user's picture
        const buffer = Buffer.from(user.picture, 'base64'); // Convert the base64-encoded string to a buffer
        const blob = new Blob([buffer], { type: 'image/png' }); // Convert the buffer to a blob
        imageURL = URL.createObjectURL(blob); // Create a URL for the blob
    }

    async function handleUpdateUsername() {
        if (!newUsername) {
            console.log('New username not set');
            return;
        }
		const accessToken = await fetchAccessToken();
            if (accessToken) {
                const response = await fetch(`http://localhost:3000/users/${user.pseudo}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ username: newUsername })
                });
                if (response.ok) {
                    user.username = newUsername;
                    newUsername = '';
                } else {
                    console.log('Error: Could not update username');
                }
            } else {
                console.log('Error: Could not update username');
            }
        }

    onMount(async () => {
        await getImageURL();
        friends = await fetchFriend(user.pseudo);
    });

    export { friends, friendNameAdd, handleAddFriend, handleFriendClick, handleMessageFriend, handleProfileFriend, handleDeleteFriend, handleInviteFriend, imageURL, user, newUsername, handleUpdateUsername };
</script>