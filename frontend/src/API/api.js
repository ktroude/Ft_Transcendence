 const fetchAccessToken = async () => {
    const cookies = document.cookie.split(';');
    const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
    const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
    return accessToken;
 }

//  const setSocketId = async (userId) => {
//     const accessToken = await fetchAccessToken();
//     if (accessToken) {
//         const response = await fetch(`http://localhost:3000/websocket/setSocket/${userId}`, {
//     }
//     }

 const fetchDataOfUser = async (user) => {
    const accessToken = await fetchAccessToken();
    console.log(user);
    if (accessToken) {
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${accessToken}`);
        const response = await fetch(`http://localhost:3000/users/${user}/getUser`, { headers });
        const data = await response.json();
        if (!data)
            return null;
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

    export {fetchData, fetchFriend, fetchAccessToken, fetchDataOfUser};