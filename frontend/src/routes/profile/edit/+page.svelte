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
            <img class="button_picture" src="/img/home_icone.png">
            <button class="button_nav" on:click={() => fade('/homepage')}>Home</button>
        </div>

		<div class="button_box">
			<img class="button_picture" src="/img/profile_icone.png">
			<button class="button_nav" on:click={() => fade(`/profile/${user.id}`)}>Profile</button>
		</div>

        <div class="button_box">
            <img class="button_picture" src="/img/game_icone.png">
            <button class="button_nav" on:click={() => fade('/game')}>Game</button>
        </div>

        <div class="button_box">
            <img class="button_picture" src="/img/chat_icone.png">
            <button class="button_nav" on:click={() => fade('/chat')}>Chat</button>
        </div>

    </div>
	<div class="main_profile">
		<div class="edit_box">
			<h1>{displayUsername}</h1>
			<label for="username-input">New Username:</label>
			<input type="text" id="username-input" bind:value={newUsername} />
      {#if FAstatus === false}
        <button  class="edit_button" on:click={enable2fa}>ACTIVATE</button>
      {:else if FAstatus === true}
        <button  class="edit_button" on:click={disable2fa}>DESACTIVATE</button>
      {/if}
			<button  class="edit_button" on:click={handleUpdateUsername}>Update</button>
			<!-- svelte-ignore a11y-img-redundant-alt -->
			<img src={imageURL} alt="OH Y'A PAS D'IMAGE MON GADJO" style={`width: ${300}px; height: ${200}px;`} />
			<input type="file" on:change={handleFileUpload} />
		</div>
	</div>
	{/if}
  {#if qrImage}
  <img src="{qrImage}" alt="QR Code" />
  <p>Please scan this QR code with Google Authenticator and enter the code to activate.</p>
  <form on:submit="{handleSubmit2fa}">
      <label>
        Verification Code:
        <input type="text" bind:value="{code}" />
      </form>
{/if}
</body>

<!-- ****************************** -->
<!-- **********   SCRIPT  ********* -->
<!-- ****************************** -->

<script lang="ts">
	let loading = false;
  	
	import { goto } from "$app/navigation";
    import { onMount } from 'svelte';
    import { Buffer } from 'buffer';
    import { fetchAccessToken, fetchData, fetchFriend, fetch2FA, fetch2FAstatus} from '../../../API/api';
    import * as dotenv from 'dotenv';
    dotenv.config();

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
      const accessToken = await fetchAccessToken();
      if (accessToken)
      {
        const response = await fetch(`http://${process.env.LOCALHOST}:3000/users/${user.id}/enable2fa`, {
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
        else
          console.log('Error: Could not update the 2fa');
      }
      else {
        console.log('Error: Could not update the 2fa');
      }
    }

    async function handleSubmit2fa()
    {
      const accessToken = await fetchAccessToken();
      if (accessToken)
      {
        const response = await fetch(`http://${process.env.LOCALHOST}:3000/users/${user.id}/enable2fa`, {
          method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              },
            body: JSON.stringify({status : 'enable'})
          });
          if (response.ok)
          {
            ;
          }
          else
            console.log('Error: Could not update the 2fa');
      }
    }


    async function enable2fa() // Update the 2fa
    {
      const accessToken = await fetchAccessToken();
      if (accessToken)
      {
        // const response = await fetch(`http://localhost:3000/users/${user.id}/enable2fa`, {
        // method: 'PUT',
        //     headers: {
        //       'Content-Type': 'application/json',
        //       'Authorization': `Bearer ${accessToken}`
        //     },
        //   body: JSON.stringify({status : 'enable'})
        // });
        // if (response.ok)
        // {
          const response = await fetch(`http://${process.env.LOCALHOST}:3000/${user.id}/auth/2fa/setup`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
          const data = await response.json();
          qrImage = data.image;
          FAstatus = true;
        // }
        // else
        //   console.log('Error: Could not update the 2fa');
      }
      else {
        console.log('Error: Could not update the 2fa');
      }
    }

        async function getImageURL() {
        const buffer = Buffer.from(user.picture, 'base64'); // Convert the base64-encoded string to a buffer
        const blob = new Blob([buffer], { type: 'image/png' }); // Convert the buffer to a blob
        imageURL = URL.createObjectURL(blob); // Create a URL for the blob

        // A Blob is typically used to store data that is too large to be stored in a traditional database column or in memory
        // or when the data needs to be streamed or transmitted over a network.
      }
    
      async function handleUpdateUsername() // Update the username
      {
        if (!newUsername) {
          console.log('New username not set');
          return;
        }
        if (newUsername.length > 13) {
          console.log('New username too long');
          return;
        }
        const accessToken = await fetchAccessToken();
        if (accessToken)
        {
          const response = await fetch(`http://${process.env.LOCALHOST}:3000/users/${user.pseudo}/newPseudo`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
          body: JSON.stringify({ user: user, newPseudo: newUsername })
        });
        if (response.ok){
          console.log('Username updated');
          displayUsername = newUsername;
          newUsername = '';
        }
        else
          console.log('Error: Could not update the username');
      }
        newUsername = '';
      }

      async function handleFileUpload(event) { // Upload a new profile picture
      // Get the file from the input
      const file = event.target.files[0];

      // Check if a file was selected
      if (!file) {
          console.log('Error: No file selected');
          return;
        }
        
        // Check if the uploaded file is an image
        if (!file.type.startsWith('image/')) {
        console.log('Error: Only image files can be uploaded');
        return;
        }
    
      // Convert the file contents to a base64-encoded string
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result.replace(/^data:image\/[a-z]+;base64,/, "");
        const accessToken = await fetchAccessToken();
        if (accessToken)
        {
          const response = await fetch(`http://${process.env.LOCALHOST}:3000/users/${user.pseudo}/picture`, { // Send the base64-encoded string to the server
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
        else
          console.log('Error: Could not upload the image');
      }
    };
  }

    onMount(async function() {
        user = await fetchData();
        if (!user)
          await goto('/');
        const FA2 = await fetch2FA(user.id);
        if (FA2 == true)
          await goto('auth/2fa');
        else
        {
          FAstatus = await fetch2FAstatus(user.id);
          getImageURL()
          displayUsername = user.username;
        }
		loading = true;
    });

	function fade(thisplace:string) {
		document.body.classList.add('fade-out');
		console.log("switching page....");
		setTimeout(() => {
		// window.location.href = href;
			goto(thisplace);
			document.body.classList.remove('fade-out');
		}, 400);
	}
</script>
