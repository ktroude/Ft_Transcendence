import { goto } from "$app/navigation";

 const fetchAccessToken = async () => {
    const cookies = document.cookie.split(';');
    if (cookies.length === 0)
        return null;
    const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
    if (!accessTokenCookie)
        return null;
    const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
    if (!accessToken)
        return null;
    return accessToken;
 }

 const fetchDataOfUser = async (user) => {
    try 
    {
        const accessToken = await fetchAccessToken();
        if (accessToken) {
            const headers = new Headers();
            headers.append('Authorization', `Bearer ${accessToken}`);
            const response = await fetch(`http://localhost:3000/users/${user}/getUser`, { headers });
            if (response.status === 404)
                return null;
            const data = await response.json();
            if (!data)
                return null;
            return data;
        } else
            console.log('Access token not found');
    }
    catch
    {
        return null;
    }
}

const fetchDataOfUserPseudo = async (user) => {
    const accessToken = await fetchAccessToken();
    console.log("hahahahahah", user);
    if (accessToken) {
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${accessToken}`);
        const response = await fetch(`http://localhost:3000/users/${user}/getUserbyPseudo`, { headers });
        const data = await response.json();
        return data;
    } else {
        console.log('Access token not found');
    }
}

const fetchDataOfUsername = async (user) => {
    const accessToken = await fetchAccessToken();
    if (accessToken) {
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${accessToken}`);
        const response = await fetch(`http://localhost:3000/users/${user}/search`, { headers });
        const data = await response.json();
        return data;
    } else {
        console.log('Access token not found');
    }
}

 const fetchData = async () => {
    const accessToken = await fetchAccessToken();
    if (accessToken) {
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${accessToken}`);
        const response = await fetch('http://localhost:3000/users/userInfo', { headers });
        const data = await response.json();
        return data;
    } else {
        console.log('Access token not found');
        goto('/');
        return null;
    }
}

const fetchFriend = async (pseudo) =>
    {
        const cookies = document.cookie.split(';');
        const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
        const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
        if (accessToken)
        {
            const response = await fetch(`http://localhost:3000/users/${pseudo}/getallfriends`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                },
            });
            if (response.ok)
            {
                const data = await response.json();
                return data;
            }
            else
                console.log('Error: Could not get friends');
        }
    }

    export {fetchData, fetchFriend, fetchAccessToken, fetchDataOfUser, fetchDataOfUserPseudo, fetchDataOfUsername};