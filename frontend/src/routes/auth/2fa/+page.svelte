<script lang=ts>
  import { onMount } from 'svelte';
  import { fetchData, fetchAccessToken, fetch2FA } from '../../../API/api';
  import { goto } from '$app/navigation';
  import { LOCALHOST } from '../../../API/env';

  let qrImage = '';
  let code: string;
  let user: User;
    interface User {
        id: number;
        pseudo: string;
        firstName: string;
        lastName: string;
        username: string;
    }
  onMount(async () => {
    user = await fetchData();
    if (!user)
      goto('/');
    const FA2 = await fetch2FA(user.id);
    if (FA2 == false)
      goto('/homepage');
  });
  
  async function handleSubmit(event) {
    event.preventDefault(); // Prevent page reload
    const accessToken = await fetchAccessToken();
    const user = await fetchData();
    if (accessToken) {
      const response = await fetch(`http://${LOCALHOST}:3000/${user.id}/auth/2fa/verify`, {
        method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
          },
			  body: JSON.stringify({code: code})
            });
      const data = await response.json();
      if (data.isVerified)
      {
        const response = fetch(`http://${LOCALHOST}:3000/${user.id}/auth/2fa/lockstatus`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({lockstatus: 'unlock'})
        });
          await alert('2FA verification successful!');
          goto('/homepage');
      }
      }
      else
        alert('2FA verification failed. Please try again.');
    }
  </script>
  
  <h1>Enable Two-Factor Authentication</h1>
  
    <form on:submit="{handleSubmit}">
      <label>
        Verification Code:
        <input type="text" bind:value="{code}" />
      </label>
      <button type="submit">Verify</button>
    </form>
    