<svelte:head>
	<link rel="stylesheet" href="/style_profile.css" />
</svelte:head>

<!-- ****************************** -->
<!-- ********** HTML CODE ********* -->
<!-- ****************************** -->

<body>
	<div class="game_navbar">
		<button class="button_nav" on:click={() => goto('/homepage')}>Home</button>
		<!-- <button class="button_nav" on:click={() => goto(`/profile/${user.pseudo}`)}>Profile</button> -->
		<button class="button_nav" on:click={() => gotoprofile()}>Profile</button>
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
				<div class="friend-list">
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
								<button class="friend_button" on:click={() => {if (showButtons) handleSearchProfile(friendName)}}>See Profile</button>
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
					<div class="connected_users_bloc">
						<ul class="ul_friends">
							{#each connectedUsers as connectedUsersName}
							<li class="friends_list">
								{connectedUsersName}
								</li>
							{/each}
						</ul>
					</div>
				  </div>
			</div>
	</div>
</body>

<!-- ****************************** -->
<!-- **********   SCRIPT  ********* -->
<!-- ****************************** -->

<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from 'svelte';
    import { Buffer } from 'buffer';
    import { fetchAccessToken, fetchData, fetchFriend, fetchDataOfUser } from '../../API/api';
	import { page } from '$app/stores';


    let previousFriend: string;
    let showButtons = false;
    let clickedFriend: string;
    let friends = [];
    let friendNameAdd: string = '';
    let searchProfile: string = '';
    let connectedUsers = [];

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

	async function getConnectedUsers() {
	const accessToken = await fetchAccessToken();
	if (accessToken) {
		const response = await fetch(`http://localhost:3000/websocket/getClient`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${accessToken}`
		},
		});
		if (response.ok) {
			connectedUsers =  await response.json();
			console.log("FRONT:", connectedUsers);
		}
		else{
			console.log("FRONT NOT WORKIGN HOHO")
		}
	} else {
		console.log('Error: Could not get users');
	}
	}








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
		console.log("user", searchProfile, "does not exist, reloading.......");
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

    async function handleFriendClick(friendName: string) {
		friends = await fetchFriend(user.pseudo);
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

	async function gotoprofile(friendName)
	{
		user = await fetchData(); // Get the user's picture
		friends = await fetchFriend(user.pseudo);
		console.log("IM GOING TO", `/profile/${user.pseudo}`);
		goto(`/profile/${user.pseudo}`);
	}

    onMount(async () => {
        await getImageURL();
        friends = await fetchFriend(user.pseudo);
		console.log("BEcAUSE EVERYTIME WE TOUCH", friends);
		getConnectedUsers();
    });

	let currentUser = '';
	let realUser = '';
	async function loadpage() {
		user = await fetchData();
		if ($page.params.user == user.pseudo)
		{
			getImageURL();
			currentUser = user.username;
		}
		else
		{
			realUser = user.pseudo;
			user = await fetchDataOfUser($page.params.user);
			getImageURL();
		}
	}

    export { friends, friendNameAdd, handleAddFriend, handleFriendClick, handleMessageFriend, handleProfileFriend, handleDeleteFriend, handleInviteFriend, imageURL, user, newUsername, handleUpdateUsername };
</script>