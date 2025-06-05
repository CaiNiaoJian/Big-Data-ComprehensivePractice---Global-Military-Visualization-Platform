import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const HeroContainer = styled.div`
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a192f 0%, #112240 100%);
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 25, 47, 0.3);
  z-index: 1;
`;

const ContentContainer = styled.div`
  position: relative;
  z-index: 2;
  max-width: 1200px;
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fff;
  padding: 0 2rem;
`;

const Title = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  background: linear-gradient(to right, #64ffda, #00bcd4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.5rem;
  font-weight: 400;
  margin-bottom: 2rem;
  max-width: 800px;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const Button = styled(motion.button)`
  padding: 1rem 2rem;
  background: transparent;
  border: 2px solid #64ffda;
  color: #64ffda;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(100, 255, 218, 0.1);
  }
`;

const CanvasContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
`;

// Earth component with custom shaders
const Earth = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });
  
  return (
    <Sphere ref={earthRef} args={[2, 64, 64]} position={[0, 0, 0]}>
      <meshStandardMaterial
        color="#0a192f"
        emissive="#112240"
        roughness={1}
        metalness={0}
      />
      <meshBasicMaterial
        color="#64ffda"
        wireframe
        transparent
        opacity={0.15}
        side={THREE.BackSide}
      />
    </Sphere>
  );
};

const Hero: React.FC = () => {
  return (
    <HeroContainer>
      <Overlay />
      <CanvasContainer>
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Earth />
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.3}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </CanvasContainer>
      <ContentContainer>
        <Title
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          世界军事数据可视化平台
        </Title>
        <Subtitle
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          探索全球军事力量分布，了解各国军事实力对比，通过直观的数据可视化方式呈现世界军事格局
        </Subtitle>
        <Button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          开始探索
        </Button>
      </ContentContainer>
    </HeroContainer>
  );
};

export default Hero;
