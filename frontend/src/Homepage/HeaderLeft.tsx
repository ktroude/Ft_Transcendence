import { userInfo } from 'os';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const HeaderLeft = ({ user }: { user: any }) => {
    const [randomImage, setRandomImage] = useState<string>('');
    const [imagesList, setImagesList] = useState<string[]>([]);

    useEffect(() => {
        const images = [
          '../../public/pourpre.jpg',
          '../../public/dolmanax.jpg',
          '../../public/ebene.jpg',
          '../../public/emeraude.jpg',
          '../../public/ocre.jpg',
          '../../public/turquoise.jpg',
        ];
        setImagesList(images);

        let randomImage = localStorage.getItem('randomImage');
        if (!randomImage) {
          const randomIndex = Math.floor(Math.random() * images.length);
          randomImage = images[randomIndex];
          localStorage.setItem('randomImage', randomImage);
        }
        setRandomImage(randomImage);
      }, []);
    
    const HeaderStyle={
        backgroundColor: 'black',
        height: '96.8%',
        width: 'auto',
        padding: '1rem',
        margin: 0,
        float: 'left' as 'left',
        position: 'absolute' as 'absolute',
        top: '0',
        left: '0',
    }
    const ImageStyle={
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        overflow: 'hidden',
        backgroundSize: 'cover'
    }
    const ButtonStyle = {
        marginLeft: 'auto',
        background: 'none',
        border: 'none',
        fontSize: '20px',
        fontFamily: 'Lobster',
        color: 'white',
        cursor: 'pointer',
    };
    return (
        <header style={HeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={ImageStyle}>
              <img src={randomImage} alt="Random image" width="50" height="50" />
            </div>
            <button style={ButtonStyle}>{user.pseudo}</button>
          </div>
        </header>
      );
};

export default HeaderLeft;