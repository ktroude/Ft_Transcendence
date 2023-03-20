import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.js'
import Homepage from './pages/Homepage.js';


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="*" element={<Home />}/>
        <Route path="Homepage" element={<Homepage />}/>
      </Routes>
    </BrowserRouter>
  );
};

export default App;