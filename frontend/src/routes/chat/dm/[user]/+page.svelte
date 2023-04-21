<script lang="ts">
import { page } from '$app/stores';
import { onMount } from 'svelte';
import { fetchAccessToken, fetchData, fetchDataOfUser } from '../../../../API/api';

let userSend: User;
let userRecv: User;

interface User {
		id: number;
		pseudo: string;
		firstName: string;
		lastName: string;
		picture: string;
		username: string;
		createdAt: Date;
		level: any;
    }

	onMount(async function() {
        userSend = await fetchData();
		userRecv = await fetchDataOfUser($page.params.user);
	});
</script>

<h1>Ft Transcendence</h1>
<p>SALUT {userSend?.username} TU ENVOIES UN MGS A {userRecv?.username}</p>
