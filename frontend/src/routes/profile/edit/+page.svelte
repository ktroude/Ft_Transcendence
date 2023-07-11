<svelte:head>
	<!-- <link rel="stylesheet" href="/style_profile.css" /> -->
	<title>Edit profile</title>
	<link rel="preload" href="/img/bg1.jpg" as="image">
	<link rel="preload" href="/homepage_style.css" as="style"/>
	<link rel="stylesheet" href="/edit_style.css" />
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
            <img class="button_picture" src="/img/home_icone.png" alt="">
            <button class="button_nav" on:click={() => location.href = '/homepage'}>Home</button>
        </div>

		<div class="button_box">
			<img class="button_picture" src="/img/profile_icone.png" alt="">
			<button class="button_nav" on:click={() => location.href = `/profile/${user.id}`}>Profile</button>
		</div>

        <div class="button_box">
            <img class="button_picture" src="/img/game_icone.png" alt="">
            <button class="button_nav" on:click={() => location.href = '/game'}>Game</button>
        </div>

        <div class="button_box">
            <img class="button_picture" src="/img/chat_icone.png" alt="">
            <button class="button_nav" on:click={() => location.href = '/chat'}>Chat</button>
        </div>
		<div class="button_box">
			<button class="button_nav" on:click={() => location.href = '/dm'}>✉️ DM</button>
		</div>
    </div>
	<div class="main_profile">
		<div class="left_bloc"></div>
		<div class="edit_box">
			<div class="username_bloc_edit">
				<h1 class="username_bloc_username">{user.username}</h1>
				{#if FAstatus === false}
					<span><button  class="twofa_button" on:click={enable2fa}>🔒</button></span>
				{:else if FAstatus === true}
					<span><button  class="twofa_button" on:click={disable2fa}>🔓</button></span>
				{/if}
			</div>
			<label for="username-input">New Username:</label>
			<input type="text" id="username-input" bind:value={newUsername} />
			<button  class="edit_button" on:click={handleUpdateUsername}>Update</button>
			<!-- svelte-ignore a11y-img-redundant-alt -->
			<img src={imageURL} alt="OH Y'A PAS D'IMAGE MON GADJO" style={`width: ${300}px; height: ${200}px;`} />
			<input type="file" on:change={handleFileUpload} />
		</div>
		<div class="right_bloc_twofa">
			<div class="twofa_bloc" id="twofa_bloc_id">
				{#if qrImage}
				<img src="{qrImage}" alt="QR Code" />
				<p>Please scan this QR code with Google Authenticator and enter the code to activate.</p>
				<form on:submit="{handleSubmit2fa}">
					<label>
					  Verification Code:
					  <input type="text" bind:value="{code}" />
					</form>
			  {/if}
			</div>
		</div>
	</div>
	{/if}
</body>

<!-- ****************************** -->
<!-- **********   SCRIPT  ********* -->
<!-- ****************************** -->

<script lang="ts">
	let loading = false;
  	
    import { onMount } from 'svelte';
    import { Buffer } from 'buffer';
    import { fetchAccessToken, fetchData, fetchFriend, fetch2FA, fetch2FAstatus} from '../../../API/api';
    import { LOCALHOST } from "../../../API/env";

    interface User {
        id: number;
        pseudo: string;
        firstName: string;
        lastName: string;
        picture: string;
        username: string;
    }
    
    let code = '';
    let qrImage = '';
    let secret = '';
    let FAstatus: boolean;
    let imageURL: string;
    let user: User;
    let newUsername: string;
    let displayUsername: string;
  

    async function disable2fa()
    {

	const div1 = document.getElementById('twofa_bloc_id');

	div1?.classList.toggle('twofa_bloc');
	div1?.classList.toggle('twofa_bloc_switched');
      const accessToken = await fetchAccessToken();
      if (accessToken)
      {
        const response = await fetch(`http://${LOCALHOST}:3000/users/${user.id}/enable2fa`, {
        method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
          body: JSON.stringify({status : 'disable'})
        });
        if (response.ok)
        {
          qrImage = '';
          FAstatus = false;
        }
      }
    }


    async function handleSubmit2fa()
    {
      const accessToken = await fetchAccessToken();
      if (accessToken)
      {
        const response = await fetch(`http://${LOCALHOST}:3000/users/${user.id}/enable2fa`, {
          method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              },
            body: JSON.stringify({status : 'enable', codestring: code})
          });
          if (!response.ok) {
      return null;
    }

        const responseData = await response.text();

        let data;
        if (responseData) {
          try 
          {
            data = JSON.parse(responseData);
          }
          catch (error) {
            return null;
          }
        } else {
          return null;
        }
        if (data === null)
          return null;
        else
          qrImage = '';
      }
  }


    async function enable2fa() // Update the 2fa
    {

	const div1 = document.getElementById('twofa_bloc_id');

	div1?.classList.toggle('twofa_bloc');
	div1?.classList.toggle('twofa_bloc_switched');
      const accessToken = await fetchAccessToken();
      if (accessToken)
      {
          const response = await fetch(`http://${LOCALHOST}:3000/${user.id}/auth/2fa/setup`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
          const data = await response.json();
          qrImage = data.image;
          FAstatus = true;
        }
      }

        async function getImageURL() {
        user = await fetchData();
        const buffer = Buffer.from(user.picture, 'base64'); // Convert the base64-encoded string to a buffer
        const blob = new Blob([buffer], { type: 'image/png' }); // Convert the buffer to a blob
        imageURL = URL.createObjectURL(blob); // Create a URL for the blob

        // A Blob is typically used to store data that is too large to be stored in a traditional database column or in memory
        // or when the data needs to be streamed or transmitted over a network.
      }
    
      async function handleUpdateUsername() // Update the username
      {
        if (!newUsername) {
          return;
        }
        if (newUsername.length > 13) {
          return;
        }
        newUsername = newUsername.toUpperCase();
        const accessToken = await fetchAccessToken();
        if (accessToken)
        {
          const response = await fetch(`http://${LOCALHOST}:3000/users/${user.pseudo}/newPseudo`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
          body: JSON.stringify({ user: user, newPseudo: newUsername })
        });
        if (response.ok){
          displayUsername = newUsername;
          newUsername = '';
          user = await fetchData();
        }
        else
        {
          ;
        }
      }
        newUsername = '';
      }

      async function handleFileUpload(event:any) { // Upload a new profile picture
      // Get the file from the input
      const file = event.target.files[0];

      // Check if a file was selected
      if (!file) {
          return;
        }
        
        // Check if the uploaded file is an image
        if (!file.type.startsWith('image/')) {
        return;
        }
    
      // Convert the file contents to a base64-encoded string
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).replace(/^data:image\/[a-z]+;base64,/, "");
        const accessToken = await fetchAccessToken();
        if (accessToken)
        {
          const response = await fetch(`http://${LOCALHOST}:3000/users/${user.pseudo}/picture`, { // Send the base64-encoded string to the server
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ picture: base64 })
        });
        if (response.ok){
          getImageURL();
          event.target.value = '';
        }
      }
    };
  }

    onMount(async function() {
        user = await fetchData();
        if (!user)
        {
          location.href = '/';
          return ;
        }
        const FA2 = await fetch2FA(user.id);
        if (FA2 == true)
        {
          location.href = 'auth/2fa';
          return ;
        }
        else
        {
          FAstatus = await fetch2FAstatus(user.id);
          await getImageURL()
          displayUsername = user.username;
        }
		    loading = true;
    });

	function fade(thisplace:string) {
		document.body.classList.add('fade-out');
		setTimeout(() => {
		// window.location.href = href;
    document.body.classList.remove('fade-out');
    location.href = thisplace;
		}, 400);
	}
</script>
