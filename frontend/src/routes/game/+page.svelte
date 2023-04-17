<style>

*{
	margin:0px;
	padding:0px;
}

body {
    margin: 0;
    height: 100%;
    overflow: hidden;
}

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

.main_game{
	margin:0px;
	padding:0px;
	height:100vh;
	width:100vw;
	display: flex;
	flex-direction: row;
}

.historic_box{
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
	width:15%;
	height:100vh;
	text-align: center;
}

.game_navbar{
	height:50px;
	width:100%;
	background:grey;
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
	background:grey;
	border:none;
	border-radius: 3px;
	height:20px;
	font-size: 20px;
}

.ul_friends{
	align-items: center;
	text-align: center;
	list-style: none;
}
.addfriend_button {
	width: 20px;
	height: 20px;
	margin: 5px;
	font-size: 20px;
	color:black;
	align-items: center;
	text-align: center;
	display: flex; 
	justify-content: center;
	align-items: center;
	background:greenyellow;
}
.addfriend_bloc{
	text-align: center;
	display: flex;
	align-items: center;
}
</style>

<body>
	<div class="game_navbar">
		<button on:click={() => goto('/homepage')}>Home</button>
		<button on:click={() => goto('/profile')}>Profile</button>
		<button on:click={() => goto('/chat')}>Chat</button>
		<button on:click={() => goto('/game')}>Game</button>
	</div>
	<div class="main_game">
			<div class="historic_box">
				<h2>History</h2>
			</div>
			<div class="game_box">
			</div>
			<div class="friendlist_box">
				<h2>Friendlist</h2>
				<div class="friend-list add-friend">
					<div class="addfriend_bloc"> <input class="input_friend" type="text" bind:value={friendNameAdd} />
						<button class="addfriend_button" on:click={handleAddFriend}>+</button></div>
					<ul class="ul_friends">
					  {#each friends as friendName}
						<li on:click={() => handleFriendClick(friendName)}>
						  {friendName}
						  {#if clickedFriend === friendName && showButtons}
							<button class="friend_button" on:click={() => {if (showButtons) handleMessageFriend(friendName)}}>Send Message</button>
							<button class="friend_button" on:click={() => {if (showButtons) handleInviteFriend(friendName)}}>Invite to Play</button>
							<button class="friend_button" on:click={() => {if (showButtons) handleProfileFriend(friendName)}}>See Profile</button>
							<button class="friend_button" on:click={() => {if (showButtons) handleDeleteFriend(friendName)}}>Delete Friend</button>
						  {/if}
						</li>
					  {/each}
					</ul>
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
    let friendNameAdd: string;

    let user: User;
    interface User {
        id: number;
        pseudo: string;
        firstName: string;
        lastName: string;
        picture: string;
        username: string;
        createdAt: Date;
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
    }

    const handleAddFriend = async () => {
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
                body: JSON.stringify({ friend: friendNameAdd })
            });
            if (response.ok) {
                friends = await fetchFriend(user.pseudo);
                friendNameAdd = '';
            } else
                console.log('Error: Could not add friend');
        }
    }

    let imageURL: string;
    let newUsername: string;

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