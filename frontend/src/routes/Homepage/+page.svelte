<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from "$app/navigation";

    interface User {
        pseudo: string;
        firstName: string;
        lastName: string;
    }

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
                lastName: data.lastname
            };
        } else {
            console.log('Access token not found');
        }
    }

    const gotoRoute = (route: string) => {
        goto("http://localhost:5173" + route);
    }

    onMount(() => {
        fetchData();
    });
</script>

<h1>Ceci est la homepage et tu es {user?.firstName}</h1>

<button on:click={() => gotoRoute('/Profile')}> Profil </button>
<button on:click={() => gotoRoute('/Game')}> Game </button>
<button on:click={() => gotoRoute('/Chat')}> Chat </button>