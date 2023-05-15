<script lang=ts>
  import { onMount } from 'svelte';
  import { fetchData, fetchAccessToken } from '../../../API/api';
  
  let qrImage = '';
  let code = '';
  
  onMount(async () => {
    const response = await fetch(`http://localhost:3000/${1}/auth/2fa/setup`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    qrImage = data.image;
  });
  
  async function handleSubmit(event) {
    event.preventDefault(); // Prevent page reload
    const accessToken = await fetchAccessToken();
    const user = await fetchData();
    if (accessToken) {
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${accessToken}`);
      const response = await fetch(`http://localhost:3000/${user.id}/auth/2fa/verify`, {
        method: 'Post',
        headers,
        body: JSON.stringify({code})
      });
      const data = await response.json();
      if (data.true)
        alert('2FA verification successful!');
      else
        alert('2FA verification failed. Please try again.');
    }
  }
  </script>
  
  <h1>Enable Two-Factor Authentication</h1>
  
  {#if qrImage}
    <img src="{qrImage}" alt="QR Code" />
    <p>Please scan this QR code with Google Authenticator.</p>
    <form on:submit="{handleSubmit}">
      <label>
        Verification Code:
        <input type="text" bind:value="{code}" />
      </label>
      <button type="submit">Verify</button>
    </form>
  {:else}
    <p>Loading QR code...</p>
  {/if}
    