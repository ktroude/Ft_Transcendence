import React, { useEffect, useState } from 'react';

const MyCookie = () => {
  const [user, setUser] = useState({});
  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1] ?? '';
    fetch('http://localhost:3000/users/userInfo', {
      headers: { Authorization: `Bearer ${token}` }})
      .then(response => response.json()).then(data => { setUser(data); })
      .catch(error => console.log(error));
  }, []);

  useEffect(() => {
    if (Object.keys(user).length !== 0) {
      console.log(user);
    }
  }, [user]);

  return null;
};

export default MyCookie;