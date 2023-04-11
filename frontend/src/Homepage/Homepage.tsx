import React, { useEffect, useState } from 'react';
import backgroundImage from '../../public/bvb.jpg';
import Header from '../Login/Component'
import HeaderLeft from './HeaderLeft';

const HomePage = () => {
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

  const background ={
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh',
  }
  interface HeaderLeftProps {
    user: {
    }
  }

  return (
    <div style={{...background, userSelect: 'none'}}>
      <Header title="Ft_transcendence" />
      <HeaderLeft user={user}/>
    </div>
  );
};

export default HomePage;