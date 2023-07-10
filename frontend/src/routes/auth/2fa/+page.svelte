<svelte:head>
	<!-- <link rel="stylesheet" href="/style_profile.css" /> -->
	<title>Authentication</title>
	<!-- <link rel="preload" href="/img/bg1.jpg" as="image"> -->
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

<script lang=ts>
  import { onMount } from 'svelte';
  import { fetchData, fetchAccessToken, fetch2FA } from '../../../API/api';
  import { goto } from '$app/navigation';
  import { LOCALHOST } from "../../../API/env";

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
    {
      location.href = '/';
      return ;
    }
    const FA2 = await fetch2FA(user.id);
    if (FA2 == false)
    {
      location.href = '/homepage';
      return ;
    }
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
          location.href = '/homepage';
      }
      else
        alert('2FA verification failed. Please try again.');
      }
      else
        alert('2FA verification failed. Please try again.');
    }
  </script>
  
  <h1 class="Ft-Transcendence"> Two-Factor Authentication</h1>
  
    <form on:submit="{handleSubmit}">
        <span class="Bienvenue">Enter Verification Code</span>
        <div class="username_bloc_edit">
        <input type="text" id="username_bloc_edit" bind:value="{code}" />
      </div>
      <div class="username_bloc_edit">
        <button type="submit" class="verify_button">Verify</button>
      </div>
    </form>
    