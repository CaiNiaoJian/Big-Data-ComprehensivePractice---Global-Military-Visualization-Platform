import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
// 不使用图标库，改用Unicode符号

const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: background-color 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Logo = styled(motion.div)`
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const NavLinks = styled.div<{ isOpen: boolean }>`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 70%;
    max-width: 300px;
    background: rgba(13, 23, 42, 0.95);
    backdrop-filter: blur(10px);
    flex-direction: column;
    padding: 5rem 2rem;
    transform: ${({ isOpen }) => isOpen ? 'translateX(0)' : 'translateX(100%)'};
    transition: transform 0.3s ease-in-out;
    z-index: 999;
  }
`;

const StyledLink = styled(Link)`
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background-color: #64ffda;
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: 100%;
  }
  
  @media (max-width: 768px) {
    margin: 1rem 0;
    font-size: 1.2rem;
  }
`;

const NavLink = styled(motion.div)`
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background-color: #64ffda;
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: 100%;
  }
  
  @media (max-width: 768px) {
    margin: 1rem 0;
    font-size: 1.2rem;
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1000;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <NavContainer style={{ 
      backgroundColor: scrolled ? 'rgba(10, 25, 47, 0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(10px)' : 'none',
      boxShadow: scrolled ? '0 10px 30px -10px rgba(2, 12, 27, 0.7)' : 'none'
    }}>
      <Logo
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        as={Link}
        to="/"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        世界军事数据可视化平台
      </Logo>
      
      <MenuButton onClick={toggleMenu}>
        {isOpen ? '✕' : '☰'}
      </MenuButton>
      
      <NavLinks isOpen={isOpen}>
        <NavLink
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <StyledLink to="/overview">
            概述
          </StyledLink>
        </NavLink>
        <NavLink
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <StyledLink to="/countries">
            国家
          </StyledLink>
        </NavLink>
        <NavLink
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <StyledLink to="/visualization">
            可视化
          </StyledLink>
        </NavLink>
        <NavLink
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <StyledLink to="/about">
            关于
          </StyledLink>
        </NavLink>
        <NavLink
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <StyledLink to="/interactive-query">
            交互查询
          </StyledLink>
        </NavLink>
      </NavLinks>
    </NavContainer>
  );
};

export default Navbar;
