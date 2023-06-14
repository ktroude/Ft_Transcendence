import { goto } from "$app/navigation";
import { LOCALHOST } from "./env";

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

 const fetch2FAstatus = async (user) => { // USED ONLY FOR ACTIVATION IN PROFILE USER
    try
    {
        const access_token = await fetchAccessToken();
        if (access_token)
        {
            const headers = new Headers();
            headers.append('Authorization', `Bearer ${access_token}`);
            const response = await fetch(`http://${LOCALHOST}:3000/users/${user}/get2fa`, { headers });
            const data = await response.json();
            return data;
        }
    }
    catch
    {
        return null;
    }
 }

 const fetch2FA = async (user) => { // USE THIS ONE FOR CHECKING 2FA STATUS LOCK OR UNLOCKED
    try
    {
        const access_token = await fetchAccessToken();
        if (access_token)
        {
            const headers = new Headers();
            headers.append('Authorization', `Bearer ${access_token}`);
            const response = await fetch(`http://${LOCALHOST}:3000/users/${user}/get2fa/lockstatus`, { headers });
            const data = await response.json();
            return data;
        }
    }
    catch
    {
        return null;
    }
}

 const fetchDataOfUser = async (user) => {
    try 
    {
        const accessToken = await fetchAccessToken();
        if (accessToken) {
            const headers = new Headers();
            headers.append('Authorization', `Bearer ${accessToken}`);
            const response = await fetch(`http://${LOCALHOST}:3000/users/${user}/getUser`, { headers });
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
    if (accessToken) {
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${accessToken}`);
        const response = await fetch(`http://${LOCALHOST}:3000/users/${user}/getUserbyPseudo`, { headers });
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
        const response = await fetch(`http://${LOCALHOST}:3000/users/${user}/search`, { headers });
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
        const response = await fetch(`http://${LOCALHOST}:3000/users/userInfo`, { headers });
        const data = await response.json();
        return data;
    } else {
        console.log('Access token not found');
        location.href = '/';
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
            const response = await fetch(`http://${LOCALHOST}:3000/users/${pseudo}/getallfriends`, {
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

    export {fetchData, fetchFriend, fetchAccessToken, fetchDataOfUser, fetchDataOfUserPseudo, fetchDataOfUsername, fetch2FA, fetch2FAstatus};