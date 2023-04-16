 <style>
	.home_button{
		margin:10px;
	}
	.home_button:hover{
		margin:10px;
		background-color: #014b9a;
	}
	.edit_main {
		margin:10px;
		display:flex;
		flex-direction: column;
		width:100vw;
		height:100vh
	}

	.edit_box {
	  margin: 50px auto;
	  max-width: 600px;
	  padding: 20px;
	  background-color: #f8f8f8;
	  border-radius: 5px;
	  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	  text-align: center;
	}
	
	h1 {
	  font-size: 24px;
	  margin-bottom: 20px;
	}
  
	label {
	  display: block;
	  margin-bottom: 10px;
	  font-weight: bold;
	}
  
	input[type="text"] {
	  width: 100%;
	  padding: 10px;
	  margin-bottom: 20px;
	  border: 1px solid #ccc;
	  border-radius: 5px;
	  font-size: 16px;
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
  
	img {
	  margin-top: 20px;
	  max-width: 300px;
	  max-height: 200px;
	  object-fit: cover;
	  border: 1px solid #ccc;
	  border-radius: 5px;
	}
  
	.upload-button {
	  display: none;
	}
  
	.upload-button{
	  display: block;
	  margin-top: 10px;
	  padding: 10px 20px;
	  background-color: #007bff;
	  color: #fff;
	  border: none;
	  border-radius: 5px;
	  font-size: 16px;
	  cursor: pointer;
	  width: max-content;
	  margin: 0 auto;
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
	<div class="edit_main">
		<div class="edit_box">
		<h1>{user?.pseudo}</h1>
		<label for="username-input">New Username:</label>
		<input type="text" id="username-input" bind:value={newUsername} />
		<button on:click={handleUpdateUsername}>Update</button>
		<img src={imageURL} alt="OH Y'A PAS D'IMAGE MON GADJO" style={`width: ${300}px; height: ${200}px;`} />
		<input type="file" class="upload-button" on:change={handleFileUpload} />
		</div>
	</div>
</main>

<script lang="ts">
  	
	import { goto } from "$app/navigation";
    import { onMount } from 'svelte';
    import { Buffer } from 'buffer';
    import { fetchAccessToken, fetchData, fetchFriend } from '../../../API/api';

    interface User {
        id: number;
        pseudo: string;
        firstName: string;
        lastName: string;
        picture: string;
    }
        
    let imageURL: string;
    let user: User;
    let newUsername: string;
    
        async function getImageURL() {
        user = await fetchData(); // Get the user's picture
        const buffer = Buffer.from(user.picture, 'base64'); // Convert the base64-encoded string to a buffer
        const blob = new Blob([buffer], { type: 'image/png' }); // Convert the buffer to a blob
        imageURL = URL.createObjectURL(blob); // Create a URL for the blob
      }
    
      async function handleUpdateUsername()
      {
        if (!newUsername) {
          console.log('New username not set');
          return;
        }
        const accessToken = await fetchAccessToken();
        if (accessToken)
        {
          const response = await fetch(`http://localhost:3000/users/${user.pseudo}/newPseudo`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
          body: JSON.stringify({ user: user, newPseudo: newUsername })
        });
        if (response.ok){
          console.log('Username updated');
          newUsername = '';
          fetchData();
        }
        else
          console.log('Error: Could not update the username');
      }
        newUsername = '';
      }

      async function handleFileUpload(event) {
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
          const response = await fetch(`http://localhost:3000/users/${user.pseudo}/picture`, { // Send the base64-encoded string to the server
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

    onMount(() => {
        fetchData();
    });
    onMount(() => {
      getImageURL()
    });
</script>
  