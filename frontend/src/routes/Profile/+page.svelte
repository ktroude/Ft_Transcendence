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
  
  <div class="container">
    <img src={imageURL} alt="OH Y'A PAS D'IMAGE MON GADJO" style={`width: ${200}px; height: ${200}px;`} />
    <input type="file" class="upload-button" on:change={handleFileUpload} />
</div>

<script lang="ts">

    import { onMount } from 'svelte';
    import { Buffer } from 'buffer';

    interface User {
        pseudo: string;
        firstName: string;
        lastName: string;
        picture: string;
    }
        
    let imageURL;
    let user: User;
    
    const fetchData = async () => {
        const cookies = document.cookie.split(';');
        const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
        const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
        
        if (accessToken) {
            const headers = new Headers();
            headers.append('Authorization', `Bearer ${accessToken}`);
            const response = await fetch('http://localhost:3000/users/userInfo', { headers });
            const data = await response.json();
            user = {
                pseudo: data.pseudo,
                firstName: data.firstname,
                lastName: data.lastname,
                picture: data.picture
            };
        } else {
            console.log('Access token not found');
        }
    }
        async function getImageURL() {
        await fetchData(); // Get the user's picture
        const buffer = Buffer.from(user.picture, 'base64'); // Convert the base64-encoded string to a buffer
        const blob = new Blob([buffer], { type: 'image/png' }); // Convert the buffer to a blob
        imageURL = URL.createObjectURL(blob); // Create a URL for the blob
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
      reader.onload = () => {
        const base64 = reader.result.replace(/^data:image\/[a-z]+;base64,/, "");
      }

    }
    onMount(() => {
        fetchData();
    });
    onMount(() => {
      getImageURL()
    });
</script>
  