import React from 'react';
import MonComposant from '../components/Cookie';

const Homepage = () => {
    const Log = false;
    if (!Log)
    {
        return (
            <div>    
                <h1>Connecte toi pour avoir acces a cette page</h1>
            </div>
        );
    } 
    else
    {
        return (
            <div>
                <h1>Welcome to Ft_transcendence</h1>
                <MonComposant />
            </div>
        );
    } 
};

export default Homepage;