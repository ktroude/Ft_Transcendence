import React, { useEffect, useState, useRef } from 'react';
import backgroundImage from '../../public/bvb.jpg';
import Header from '../Login/Component'
import HeaderLeft from './HeaderLeft';
import { Button } from '@mui/material';
import { PictureService} from '/goinfre/bleroy/Ft_Transcendence/backend/src/picture/picture.service';
import { PrismaService } from '../../../backend/src/prisma/prisma.service';

const HomePage = () => {
  const [user, setUser] = useState({});
  const fileInputRef = useRef();
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
  
  //* TESTING UPLOAD FILE
  const handleClick = () => {
    console.log('TEST');
    fileInputRef.current.click();
  };
  
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    console.log('Selected file:', file);
    const data = new FormData();
    data.append('file', file);
    const response = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: data
    });
    const u = new PictureService(PrismaService);

  
    // try {
    //   const response = await fetch('http://localhost:3000/upload', {
    //     method: 'POST',
    //     body: formData,
    //   });
  
      const datas = await PictureService.uploadPicture(data);
      console.log('Server response:', datas);
    // } catch (error) {
      // console.error(error);
    // }
  };
  //* TESTING UPLOAD FILE
  
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

  const buttonStyle={
    display: 'block',
    margin: 'auto',
  }

  return (
    <div style={{...background, userSelect: 'none'}}>
      <Header title="Ft_transcendence" />
      <HeaderLeft user={user} />
      <Button onClick={handleClick}>TEST Upload file TEST</Button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        position="absolute"
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default HomePage;