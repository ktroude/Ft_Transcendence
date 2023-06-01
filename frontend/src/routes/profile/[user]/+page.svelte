<svelte:head>
	<title>{user?.username}</title>
	<link rel="preload" href="/img/bg1.jpg" as="image">
	<link rel="preload" href="/homepage_style.css" as="style"/>
	<link rel="stylesheet" href="/profile_style.css" />
	<link rel="stylesheet" href="/homepage_style.css" />
	<link rel="stylesheet" href="/navbar.css" />
	<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">
</svelte:head>

<!-- ****************************** -->
<!-- ********** HTML CODE ********* -->
<!-- ****************************** -->

<body style="margin:0px; padding:0px; background-image:url('/img/bg1.jpg');
background-position: center; background-size: cover ; overflow: hidden; width: 100vw;height: 100vh;">
	{#if loading === true}
    	<div class="game_navbar">
			<div class="button_box">
				<img class="button_picture" src="/img/home_icone.png">
				<button class="button_nav" on:click={() => fade('/homepage')}>Home</button>
			</div>
			{#if user?.username === currentUser}
				<div class="button_box">
					<img class="button_picture" src="/img/profile_icone.png">
					<button class="button_nav">Profile</button>
				</div>
				{:else}
				<div class="button_box">
					<img class="button_picture" src="/img/profile_icone.png">
					<button class="button_nav" on:click={() => fade(`/profile/${realUserId}`)}>Profile</button>
				</div>
			{/if}
			<div class="button_box">
				<img class="button_picture" src="/img/game_icone.png">
				<button class="button_nav" on:click={() => fade('/game')}>Game</button>
			</div>

			<div class="button_box">
				<img class="button_picture" src="/img/chat_icone.png">
				<button class="button_nav" on:click={() => fade('/chat')}>Chat</button>
			</div>
			<div class="button_box">
				<button class="button_nav" on:click={() => fade('/dm')}>✉️ DM</button>
			</div>
		</div>
		<div class="main_profile">
			{#if user?.username == currentUser}
			<div class="friends_bloc">
				<h1 class="profile_h1"><span><img class="friend_profile_icone" src="/img/friend_icone.png"></span>Friends</h1>
				<ul class="ul_friends">
					{#if friends}
					{#each friends as [friendName, connected]}
					  <!-- svelte-ignore a11y-click-events-have-key-events -->
					  <li class="friends_list" on:click={() => handleFriendClick(friendName)}>
						<div class="friendBloc">
							{#if connected == 0}
								<div class="red_dot"></div>
							{/if}
							{#if connected == 1}
								<div class="green_dot"></div>
							{/if}
							{#if connected == 2}
								<div class="blue_dot"></div>
							{/if}
						  	<span class="friendname">{friendName}</span>
						</div>
						{#if clickedFriend === friendName && showButtons && invited === 2}
							<button class="friend_button" on:click={() => {if (showButtons) handleMessageFriend(friendName)}}>💬</button>
							<button class="friend_button" on:click={() => {if (showButtons) handleInviteFriend(friendName)}}>🎮</button>
							<button class="friend_button" on:click={() => {if (showButtons) handleProfileFriend(friendName)}}>🔍</button>
							<button class="friend_button" on:click={() => {if (showButtons) handleDeleteFriend(friendName)}}>❌</button>
						{/if}
					</li>
					{/each}
					{/if}
				</ul>
				<div class="addfriend_bloc"> <input placeholder="Ajouter un ami" class="input_friend" type="text" bind:value={friendNameAdd} on:keydown={(event) => handleEnter(event)}/>
					<button class="addfriend_button" on:click={handleAddFriend}>+</button></div>
			</div>
			{/if}
			<div class="main_box">
				<div class="username_bloc">
					<h1 class="username">{user?.username}
					</h1>
					{#if user?.username != currentUser && is_blocked === false}
					<span class="buttons_other_user">
						<button class="block_user_button" on:click={() => block(realUserPseudo, user.pseudo)}>
							<span class="tooltiptext">Block</span>
						</button>
						{#if isFriend == false}
							<button class="add_friend_button" on:click={() => AddFriendButton(realUserPseudo, user.username)}>
								<span class="tooltiptext">Add to friends</span>
							</button>
						{:else}
							<button class="remove_friend_button" on:click={() => DeleteFriendButton(realUserPseudo, user.username)}>
								<span class="tooltiptext">Remove from friends</span>
							</button>
						{/if}
					</span>
					{/if}
					{#if user?.username != currentUser && is_blocked === true}
					<span>
						<button class="unblock_button" on:click={() => unblock(realUserPseudo, user.pseudo)}>
							<span class="tooltiptext">Unblock</span>
						</button>
					</span>
					{/if}
				</div>
				<h3>{user?.firstname} {user?.lastname}</h3>
				<h3>Level: {user?.level}</h3>
				<h3>Created: {new Date(user?.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
				<!-- svelte-ignore a11y-img-redundant-alt -->
				<img class=".profile_img" src={imageURL} alt="OH Y'A PAS D'IMAGE MON GADJO" />
				{#if user?.username === currentUser} 
					<button class="edit_button" on:click={() => fade('/profile/edit')}>Edit profile<span><img class="edit_icone" src="/img/edit_profile.png"></span></button>
				{:else}
				<button class="send_message" on:click={() => sendMessage()}>
				<img class="button_picture" src="/img/chat_icone.png" alt="Image button"/>
				</button>
			{/if}
		</div>












		<div class="right_bloc">
			<div class="history_bloc" id="history_bloc_id">
				<div class="history_title_bloc">
					<h1 class="profile_h1"><span><img class="profile_icone" src="/img/time_icone.png"></span>History</h1>
				</div>
				{#if history.length == 0}
					<h5 class="history_line">Feels empty...</h5>
					{/if}
				{#each Array.from(history) as hist}
					<h5 class="history_line">{hist.winner} - {hist.loser} <span style="color:greenyellow">[{hist.scoreUser} - {hist.scoreOpponent}]</span></h5>
				{/each}



			</div>
			<div class="achievements_bloc" id="achievements_bloc_id">
				<h1 class="profile_h1"><span><img class="profile_icone" src="/img/level_icone.png"></span>Achievements</h1>
				{#each Array.from(all_achievements) as [key, value]}
					{#if value === false}
							<div class="achievement_div">
								<div class="achievement">
								</div>
								<div class="achievement_title_text_box">
									{#if String(key) === 'FirstWin'}
									<h4 class="achievement_title">First Win</h4>
									<h5 class="achievement_text">Win a game.</h5>
									{/if}
									{#if String(key) === "WinStreak"}
									<h4 class="achievement_title">Win Streak</h4>
									<h5 class="achievement_text">Win three games in a row.</h5>
									{/if}
									{#if String(key) === "ImTheBoss"}
									<h4 class="achievement_title">I'm The Boss</h4>
									<h5 class="achievement_text">Win against a creator.</h5>
									{/if}
									{#if String(key) === "TheDarkSide"}
									<h4 class="achievement_title">The Dark Side</h4>
									<h5 class="achievement_text">Log in as a bocal member.</h5>
									{/if}
									{#if String(key) === "ImCurious"}
									<h4 class="achievement_title">???</h4>
									<h5 class="achievement_text">???</h5>
									{/if}
								</div>
							</div>
						{:else}
							<div class="achievement_div">
								<div class="achievement_true">
								</div>
								<div class="achievement_title_text_box">
									{#if String(key) === 'FirstWin'}
									<h4 class="achievement_title">First Win</h4>
									<h5 class="achievement_text">Win a game.</h5>
									{/if}
									{#if String(key) === "WinStreak"}
									<h4 class="achievement_title">Win Streak</h4>
									<h5 class="achievement_text">Win three games in a row.</h5>
									{/if}
									{#if String(key) === "ImTheBoss"}
									<h4 class="achievement_title">I'm The Boss</h4>
									<h5 class="achievement_text">Win against a creator.</h5>
									{/if}
									{#if String(key) === "TheDarkSide"}
									<h4 class="achievement_title">The Dark Side</h4>
									<h5 class="achievement_text">Log in as a bocal member.</h5>
									{/if}
									{#if String(key) === "ImCurious"}
									<h4 class="achievement_title">I'm Curious</h4>
									<h5 class="achievement_text">Visit one of our GitHubs.</h5>
									{/if}
								</div>
							</div>
	
					{/if}
	
				{/each}
			</div>

		</div>
		<div class="button_switch_div"><button class="history_button" on:click={() => switchToHistory()}>➜</button></div>
				</div> 
	{/if}
</body>

<!-- ****************************** -->
<!-- **********   SCRIPT  ********* -->
<!-- ****************************** -->

<script lang="ts">

	import {io, Socket} from 'socket.io-client';
	import { page } from '$app/stores';
	import { goto } from "$app/navigation";
    import { onMount } from 'svelte';
    import { Buffer } from 'buffer';
    import { fetchAccessToken, fetchData, fetchDataOfUser, fetchFriend, fetchDataOfUsername, fetch2FA} from '../../../API/api';

/********************** FRIENDS ***********************************************/
	
	let socket: Socket;

    let previousFriend: string;
    let showButtons = false;
    let clickedFriend: string;
    let friends = {};
    let friendNameAdd: string = '';
    let searchProfile: string = '';
    let connectedUsers = [];
	let loading = false;
	let isFriend = undefined;

	let all_achievements = {};


	let friendUser: User;
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


	function switchToHistory() {
		const div1 = document.getElementById('achievements_bloc_id');
		const div2 = document.getElementById('history_bloc_id');

		div1.classList.toggle('achievements_bloc');
		div1.classList.toggle('achievements_bloc_switched');

		div2.classList.toggle('history_bloc');
		div2.classList.toggle('history_bloc_switched');
	}








	/*	
		-1 -> no invitation received
		 0 -> invitation denied or accepted
		 1 -> invitation received -> must be actualized when receiving an invitation
		 2 -> prevents buttons from showing up when accepting/denying invitation
	*/

	let invited = -1;

	async function DeleteFriendButton(realUser, friendName) {
        const accessToken = await fetchAccessToken();
        if (accessToken) {
            const response = await fetch(`http://localhost:3000/users/${realUser}/deletefriend`, {
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
        } 
		else
            console.log('Error: Could not delete friend');
		isFriend = checkFrienship(user.id, realUserId)
	}

	async function AddFriendButton(realUser, friendUser)
	{
		const accessToken = await fetchAccessToken();
        if (accessToken) {
            const response = await fetch(`http://localhost:3000/users/${realUser}/friend`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({friend: friendUser})
            });
            if (response.ok) {
                friends = await fetchFriend(user.pseudo);
                friendNameAdd = '';
            } else
                console.log('Error: Could not add friend');
        
		}
		isFriend = checkFrienship(user.id, realUserId);
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
		}
	}

    async function handleMessageFriend(friendName) {
		const accessToken = await fetchAccessToken();
		if (accessToken)
		{
			const url = `http://localhost:3000/users/${friendName}/search`;
				const response = await fetch(url, {
					method: 'GET',
					headers: {
					'Authorization': `Bearer ${accessToken}`,
					},
				});
				const userExists = await response.json(); // Parse response body as JSON
				if (userExists) { // Check if user exists
					await goto(`/dm/${userExists.id}`);
				}
		}
		else 
			console.log('Error: Could not get users');
	}

    async function handleProfileFriend(friendName) {
        const accessToken = await fetchAccessToken();
        if (accessToken)
		{
			friendUser = await fetchDataOfUsername(friendName);
			if (!friendUser)
				console.log('Error: Could not get profile');
			else
			{
				await goto(`/profile/${friendUser.id}`);
				await loadpage();
			}
		}
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
				friends = friends.filter(friend => friend[0] !== friendName);
            else
                console.log('Error: Could not delete friend');
        } 
		else
            console.log('Error: Could not delete friend');
    }

    function handleInviteFriend(friendName) {
        console.log(`Inviting ${friendName} to play`);
		/*If accepted -> goto(`/game/${roomid}`); */
    }

	async function handleEnter(event:any)
	{
		if (event.key === 'Enter') {
			handleAddFriend();
		}
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

/***********************************************************************************/

	async function getImageURL() {
		const buffer = Buffer.from(user.picture, 'base64'); // Convert the base64-encoded string to a buffer
		const blob = new Blob([buffer], { type: 'image/png' }); // Convert the buffer to a blob
		imageURL = URL.createObjectURL(blob); // Create a URL for the blob
		
		//A Blob is typically used to store data that is too large to be stored in a traditional database column or in memory
		//or when the data needs to be streamed or transmitted over a network.
	}
	
  async function sendMessage() // Redirect to chat with user
  {
    const accessToken = await fetchAccessToken();
    if (accessToken)
      goto(`/dm/${user.id}`);
    else
      console.log('Error: Could not send message');
  }

	async function block(realUser, blockerUser) { // block user
		const accessToken = await fetchAccessToken();
		if (accessToken) 
		{
			const response = await fetch(`http://localhost:3000/users/${realUser}/block`, {
				method: 'PUT',
                headers: {
					'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({block: blockerUser})
            });
			if (response.ok)
				is_blocked = true;

        } else
			console.log('Error: Could not block user');
    }
	
	async function checkBlocked(realUser, blockerUser) { // check if user is blocked
    const accessToken = await fetchAccessToken();
	if (accessToken)
	{
		const url = `http://localhost:3000/users/${realUser}/checkBlock?block=${blockerUser}`;
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${accessToken}`,
			},
		});
		const data = await response.json();
		if (data === true)
			is_blocked = true;
		else
			is_blocked = false;
		return is_blocked;
	}
	else
		console.log('Error: Could not check if user is blocked');
}

	async function checkFrienship(id1, id2) { // check if the two users are friends
		const accessToken = await fetchAccessToken();
		if (accessToken)
		{
			const url = `http://localhost:3000/users/existingFriendship?id1=${id1}&id2=${id2}`;
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${accessToken}`,
				},
			});
			const data = await response.json();
			if (data === true)
				isFriend =  true;
			else
				isFriend =  false;
		}
		else
			console.log('Error: Could not check if user is friend');
	}

	async function getAllAchievements() {
		const accessToken = await fetchAccessToken();
		if (accessToken) {
			const url = `http://localhost:3000/users/achievements/${user.id}/getAchievements`;
			const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${accessToken}`,
			},
			});
			const data = await response.json();
			if (data)
				all_achievements = new Map(data);
			}
		else 
			console.log('Error: Could not get achievements');
	}

	async function unblock(realUser, blockerUser) { // unblock user
		const accessToken = await fetchAccessToken();
		if (accessToken) {
            const response = await fetch(`http://localhost:3000/users/${realUser}/deleteBlock`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({block: blockerUser})
            });
			is_blocked = false;
        } else
			console.log('Error: Could not unblock user');
    }

	let realUser: string; 
	let currentUser = ''; 
	let is_blocked: any;
	let realUserId: any;
	let realUserPseudo: any;

	async function loadpage() {
		if (!user)
			goto('/');
		if ($page.params.user == user.id.toString()) // If the user is on his own profile
		{
			user = await fetchData();
			await getImageURL();
			currentUser = user.username;
			friends = await fetchFriend(user.pseudo);
			await getAllAchievements();
		}
		else // If the user is on another profile
		{
			realUserId = user.id;
			realUser = user.username;
			realUserPseudo = user.pseudo;
			user = await fetchDataOfUser($page.params.user);
			if (!user)
			{
				user = await fetchData();
				return await goto(`/homepage`);
			}
			is_blocked = await checkBlocked(realUser, user.username);
			isFriend = await checkFrienship(user.id, realUserId);
			await getImageURL();
			await getAllAchievements();
		}
	}

	async function friendRequest()
	{
		friends = await fetchFriend(user.pseudo);
	}







	let history: any[];
	history = [];

	async function getHistory() {
		const accessToken = await fetchAccessToken();
		if (accessToken)
		{
			const url = `http://localhost:3000/users/history`;
				const response = await fetch(url, {
					method: 'GET',
					headers: {
					'Authorization': `Bearer ${accessToken}`,
					},
				});
				return await response.json(); // Parse response body as JSON
		}
		else 
			console.log('Error: Could not get history');
	}












	async function fade(thisplace:string) {
		document.body.classList.add('fade-out');
		console.log("switching page....");
		setTimeout(() => {
		// window.location.href = href;
			goto(thisplace);
			loadpage();
			document.body.classList.remove('fade-out');
		}, 400);
	}


	onMount(async function() {
		user = await fetchData(); // Catch the user
		if (!user)
			await goto('/'); // If no user redirect
		const FA2 = await fetch2FA(user.id);
		if (FA2 == true)
			await goto('auth/2fa');
		else
		{
			await loadpage();
			const socket = io('http://localhost:3000'); // Connect to the server
			socket.on('connect', async function() {			
				socket.emit('userConnected', { pseudo: user.pseudo }); // Send the user pseudo to the server
			});
		}
		setInterval(friendRequest, 10000);
		history = await getHistory();
		console.log("HISTOTYYYY===", history);
		loading = true;
	});


</script>