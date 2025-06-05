import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import Hero from './components/Hero';
import Sections from './components/Sections';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Overview from './pages/Overview';
import DatabaseDemoPage from './pages/DatabaseDemo';
import CountryPage from './pages/CountryPage';
import VisualizationPage from './pages/VisualizationPage';
import AboutPage from './pages/AboutPage';

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



// 主页组件
const Home = () => {
  return (
    <>
      <Hero />
      <Sections />
      <Footer />
    </>
  );
};

// 主应用组件
function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/countries" element={<CountryPage />} />
        <Route path="/database-demo" element={<DatabaseDemoPage />} />
        <Route path="/interactive-query" element={<DatabaseDemoPage />} />
        <Route path="/visualization" element={<VisualizationPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
