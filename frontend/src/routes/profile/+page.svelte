 <style>
    .container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 30vh;
      margin: 0;
      text-align: center;
    }
  
    .upload-button {
      margin-top: 0px;
    }
  </style>
  <main>
    <h1>Update Username</h1>
    <label for="username-input">New Username:</label>
    <input type="text" id="username-input" bind:value={newUsername} />
    <button on:click={handleUpdateUsername}>Update</button>
  </main>
  <div class="container">
  //  <img src={imageURL} alt="OH Y'A PAS D'IMAGE MON GADJO" style={`width: ${200}px; height: ${200}px;`} />
    <input type="file" class="upload-button" on:change={handleFileUpload} />
</div>

<script lang="ts">

    import { onMount } from 'svelte';
    import { Buffer } from 'buffer';
    import { fetchAccessToken, fetchData, fetchFriend } from '../../API/api';

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
  