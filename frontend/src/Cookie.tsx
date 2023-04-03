import React, { useEffect, useState } from 'react';

const MyCookie = () => {
  const [cookieValue, setCookieValue] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('access_token='));
    const cookieValue = cookie ? cookie.split('=')[1] : '';
    setCookieValue(cookieValue);
  }, []);

  useEffect(() => {
    try {
      const decodedToken = JSON.parse(atob(cookieValue.split('.')[1]));
      const { firstname, lastname, pseudo } = decodedToken;
      setUserInfo({ firstname, lastname, pseudo });
    } catch (error) {
      console.error('Error decoding token', error);
    }
  }, [cookieValue]);

  
  return (null);
};

export default MyCookie;