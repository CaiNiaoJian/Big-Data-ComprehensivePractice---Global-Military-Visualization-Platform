import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import App from '../App';
import Overview from '../pages/Overview';
import Navbar from '../components/Navbar';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Roboto', 'Noto Sans SC', sans-serif;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    background-color: #0a192f;
    color: #e6f1ff;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: #0a192f;
  }

  ::-webkit-scrollbar-thumb {
    background: #64ffda;
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #00bcd4;
  }
`;

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <Navbar />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/overview" element={<Overview />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
