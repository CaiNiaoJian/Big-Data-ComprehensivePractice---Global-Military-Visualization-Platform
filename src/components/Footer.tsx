import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
// 不使用图标库，改用Unicode符号

const FooterContainer = styled.footer`
  background-color: #020c1b;
  color: #a8b2d1;
  padding: 3rem 2rem;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FooterTop = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FooterSection = styled.div`
  flex: 1;
  min-width: 250px;
`;

const FooterTitle = styled.h3`
  color: #e6f1ff;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 2px;
    background: #64ffda;
  }
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const FooterLink = styled(motion.a)`
  color: #8892b0;
  text-decoration: none;
  transition: color 0.3s ease;
  
  &:hover {
    color: #64ffda;
  }
`;

const FooterBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(100, 255, 218, 0.1);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const Copyright = styled.p`
  font-size: 0.9rem;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
`;

const SocialLink = styled(motion.a)`
  color: #8892b0;
  font-size: 1.5rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: #64ffda;
  }
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterTop>
          <FooterSection>
            <FooterTitle>世界军事数据可视化平台</FooterTitle>
            <p>提供全球军事数据的可视化分析，帮助您了解世界军事格局和趋势。</p>
          </FooterSection>
          
          <FooterSection>
            <FooterTitle>快速导航</FooterTitle>
            <FooterLinks>
              <FooterLink 
                href="#overview"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                概述
              </FooterLink>
              <FooterLink 
                href="#countries"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                国家
              </FooterLink>
              <FooterLink 
                href="#visualization"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                可视化
              </FooterLink>
              <FooterLink 
                href="#about"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                关于
              </FooterLink>
            </FooterLinks>
          </FooterSection>
          
          <FooterSection>
            <FooterTitle>联系我</FooterTitle>
            <FooterLinks>
              <FooterLink 
                href="mailto:gaojian1573@goxmail.com"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                gaojian1573@goxmail.com
              </FooterLink>
              <FooterLink 
                href="tel:123123123"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                123123123
              </FooterLink>
            </FooterLinks>
          </FooterSection>
        </FooterTop>
        
        <FooterBottom>
          <Copyright>© 2025 世界军事数据可视化平台. Healthjian保留所有权利.</Copyright>
          <SocialLinks>
            <SocialLink 
              href="https://github.com/CaiNiaoJian" 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              ✱ GitHub
            </SocialLink>
            <SocialLink 
              href="#" 
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              ⚐ 中国
            </SocialLink>
          </SocialLinks>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
