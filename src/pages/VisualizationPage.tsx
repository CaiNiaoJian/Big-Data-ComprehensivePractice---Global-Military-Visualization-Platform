import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart } from 'recharts';
import apiClient from '../services/api';
import { Country, YearlyExpenditure } from '../services/api';
import * as THREE from 'three';

// 定义样式组件
const PageContainer = styled.div`
  padding: 2rem;
  background-color: #0a192f;
  min-height: 100vh;
`;

const Title = styled(motion.h1)`
  font-size: 2.5rem;
  color: #64ffda;
  margin-bottom: 2rem;
  text-align: center;
`;

const SectionTitle = styled(motion.h2)`
  font-size: 1.8rem;
  color: #64ffda;
  margin: 2rem 0 1rem;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const FullWidthSection = styled.div`
  grid-column: 1 / -1;
  margin-bottom: 2rem;
`;

const Card = styled(motion.div)`
  background-color: #112240;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px -15px rgba(2, 12, 27, 0.7);
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const MapContainer = styled.div`
  height: 500px;
  width: 100%;
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  background-color: #112240;
`;

const SelectContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const StyledSelect = styled.select`
  padding: 0.5rem 1rem;
  border-radius: 5px;
  background-color: #172a45;
  color: #e6f1ff;
  border: 1px solid #64ffda;
  outline: none;
  cursor: pointer;
  
  &:focus {
    border-color: #00bcd4;
  }
`;

const CountryComparisonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ComparisonRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #64ffda;
  font-size: 1.2rem;
`;

// 颜色配置
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];
const CONTINENT_COLORS: Record<string, string> = {
  'Africa': '#FF8042',
  'Asia': '#0088FE',
  'Europe': '#00C49F',
  'North America': '#FFBB28',
  'South America': '#8884d8',
  'Oceania': '#82ca9d',
  'Antarctica': '#ffc658',
  'Eastern Asia': '#ff7300'
};

// 3D地球仪组件
const Globe = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const starsRef = useRef<THREE.Points>(null);
  const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null);
  const [isTextureLoaded, setIsTextureLoaded] = useState(false);
  
  // 加载地球贴图
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/earth.jpeg',
      (texture) => {
        console.log('地球贴图加载成功');
        setEarthTexture(texture);
        setIsTextureLoaded(true);
      },
      undefined,
      (error) => {
        console.error('地球贴图加载失败:', error);
      }
    );
  }, []);
  
  // 创建星空粒子
  const createStars = useCallback(() => {
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2000;
    const positions = new Float32Array(starsCount * 3);
    const sizes = new Float32Array(starsCount);
    
    for (let i = 0; i < starsCount; i++) {
      const i3 = i * 3;
      // 随机分布在球体上
      const radius = 20 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      sizes[i] = Math.random() * 2;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return starsGeometry;
  }, []);
  
  // 旋转动画
  useEffect(() => {
    const animate = () => {
      if (earthRef.current) {
        earthRef.current.rotation.y += 0.001;
      }
      if (atmosphereRef.current) {
        atmosphereRef.current.rotation.y += 0.0008; // 稍慢一点
      }
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);
  
  return (
    <>
      {/* 环境光和光源 */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 5, 10]} intensity={1.5} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} />
      
      {/* 地球 - 使用贴图 */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        {isTextureLoaded ? (
          <meshStandardMaterial 
            map={earthTexture}
            roughness={0.6}
            metalness={0.1}
          />
        ) : (
          <meshPhongMaterial 
            color="#0077be" 
            shininess={25}
            specular={new THREE.Color('#006994')}
          />
        )}
      </mesh>
      
      {/* 大气层 - 半透明光晕效果 */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[2.1, 32, 32]} />
        <meshPhongMaterial 
          color="#88b2d9" 
          transparent={true} 
          opacity={0.2} 
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* 星空背景 - 使用点材质 */}
      <points ref={starsRef} geometry={createStars()}>
        <pointsMaterial 
          size={0.1} 
          color="#ffffff" 
          transparent={true}
          opacity={0.8}
          sizeAttenuation={true}
        />
      </points>
      
      {/* 星空背景球 */}
      <mesh>
        <sphereGeometry args={[30, 32, 32]} />
        <meshBasicMaterial 
          color="#000020" 
          side={THREE.BackSide} 
        />
      </mesh>
      
      {/* 控制器 */}
      <OrbitControls 
        enableZoom={true} 
        enablePan={false} 
        enableRotate={true} 
        minDistance={3} 
        maxDistance={15}
        rotateSpeed={0.5}
        autoRotate={false}
      />
    </>
  );
};

// 主要可视化页面组件
const VisualizationPage: React.FC = () => {
  // 状态管理
  const [countries, setCountries] = useState<Country[]>([]);
  const [continents, setContinents] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2022);
  const [selectedContinent, setSelectedContinent] = useState<string>('All');
  const [topCountries, setTopCountries] = useState<YearlyExpenditure[]>([]);
  const [continentData, setContinentData] = useState<any[]>([]);
  const [selectedCountry1, setSelectedCountry1] = useState<number | null>(null);
  const [selectedCountry2, setSelectedCountry2] = useState<number | null>(null);
  const [countryComparison, setCountryComparison] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any | null>(null); // Using any for AMap type for now
  const [years] = useState<number[]>(Array.from({ length: 2023 - 1960 }, (_, i) => 1960 + i));
  const [chartView, setChartView] = useState<string>('area');
  const [displayCountryCount, setDisplayCountryCount] = useState<number>(5);
  const [showPerCapita, setShowPerCapita] = useState<boolean>(false);
  const [futureScenario, setFutureScenario] = useState<string>('baseline');
  const [futureFocus, setFutureFocus] = useState<string>('expenditure');
  const [showConfidenceInterval, setShowConfidenceInterval] = useState<boolean>(false);
  const [futureViewMode, setFutureViewMode] = useState<string>('countries');
  const [selectedAlliance, setSelectedAlliance] = useState<string>('nato');
  
  // 获取未来军费支出数据 - 国家维度
  const getFutureData = () => {
    // 基础数据
    const baseData = [
      { year: 2022, global: 2113, usa: 877, china: 292, russia: 86, india: 76, uk: 68, france: 56, germany: 52, japan: 46, future: 0 },
      { year: 2023, global: 2200, usa: 900, china: 310, russia: 90, india: 81, uk: 70, france: 58, germany: 54, japan: 48, future: 0 },
      { year: 2024, global: 2290, usa: 920, china: 330, russia: 95, india: 87, uk: 72, france: 60, germany: 56, japan: 50, future: 0 },
      { year: 2025, global: 2380, usa: 940, china: 350, russia: 100, india: 93, uk: 74, france: 62, germany: 58, japan: 52, future: 0 },
      { year: 2026, global: 2470, usa: 960, china: 370, russia: 105, india: 99, uk: 76, france: 64, germany: 60, japan: 54, future: 2470 },
      { year: 2027, global: 2560, usa: 980, china: 390, russia: 110, india: 106, uk: 78, france: 66, germany: 62, japan: 56, future: 2560 },
      { year: 2028, global: 2650, usa: 1000, china: 410, russia: 115, india: 113, uk: 80, france: 68, germany: 64, japan: 58, future: 2650 },
      { year: 2029, global: 2740, usa: 1020, china: 430, russia: 120, india: 121, uk: 82, france: 70, germany: 66, japan: 60, future: 2740 },
      { year: 2030, global: 2830, usa: 1040, china: 450, russia: 125, india: 129, uk: 84, france: 72, germany: 68, japan: 62, future: 2830 }
    ];
    
    // 高紧张度情景数据
    const highTensionData = baseData.map(item => ({
      ...item,
      global: Math.round(item.global * 1.2),
      usa: Math.round(item.usa * 1.25),
      china: Math.round(item.china * 1.3),
      russia: Math.round(item.russia * 1.35),
      india: Math.round(item.india * 1.2),
      uk: Math.round(item.uk * 1.22),
      france: Math.round(item.france * 1.18),
      germany: Math.round(item.germany * 1.3),
      japan: Math.round(item.japan * 1.25),
      future: item.future ? Math.round(item.future * 1.2) : 0,
      upperBound: Math.round(item.global * 1.3),
      lowerBound: Math.round(item.global * 1.1)
    }));
    
    // 和平发展情景数据
    const peacefulData = baseData.map(item => ({
      ...item,
      global: Math.round(item.global * 0.9),
      usa: Math.round(item.usa * 0.85),
      china: Math.round(item.china * 0.95),
      russia: Math.round(item.russia * 0.8),
      india: Math.round(item.india * 0.9),
      uk: Math.round(item.uk * 0.88),
      france: Math.round(item.france * 0.85),
      germany: Math.round(item.germany * 0.82),
      japan: Math.round(item.japan * 0.8),
      future: item.future ? Math.round(item.future * 0.9) : 0,
      upperBound: Math.round(item.global * 0.95),
      lowerBound: Math.round(item.global * 0.85)
    }));
    
    // 基线预测数据（添加置信区间）
    const baselineWithInterval = baseData.map(item => ({
      ...item,
      upperBound: Math.round(item.global * 1.15),
      lowerBound: Math.round(item.global * 0.85)
    }));
    
    // 根据选择的情景返回相应数据
    switch (futureScenario) {
      case 'highTension':
        return highTensionData;
      case 'peacefulDevelopment':
        return peacefulData;
      default:
        return baselineWithInterval;
    }
  };
  
  // 获取各大洲军事预测数据
  const getContinentFutureData = () => {
    // 基础数据
    const baseData = [
      { year: 2022, global: 2113, asia: 620, europe: 480, northAmerica: 910, southAmerica: 60, africa: 40, oceania: 30 },
      { year: 2023, global: 2200, asia: 650, europe: 490, northAmerica: 930, southAmerica: 65, africa: 42, oceania: 32 },
      { year: 2024, global: 2290, asia: 680, europe: 500, northAmerica: 950, southAmerica: 70, africa: 44, oceania: 34 },
      { year: 2025, global: 2380, asia: 710, europe: 510, northAmerica: 970, southAmerica: 75, africa: 46, oceania: 36 },
      { year: 2026, global: 2470, asia: 740, europe: 520, northAmerica: 990, southAmerica: 80, africa: 48, oceania: 38 },
      { year: 2027, global: 2560, asia: 770, europe: 530, northAmerica: 1010, southAmerica: 85, africa: 50, oceania: 40 },
      { year: 2028, global: 2650, asia: 800, europe: 540, northAmerica: 1030, southAmerica: 90, africa: 52, oceania: 42 },
      { year: 2029, global: 2740, asia: 830, europe: 550, northAmerica: 1050, southAmerica: 95, africa: 54, oceania: 44 },
      { year: 2030, global: 2830, asia: 860, europe: 560, northAmerica: 1070, southAmerica: 100, africa: 56, oceania: 46 }
    ];
    
    // 高紧张度情景数据
    const highTensionData = baseData.map(item => ({
      ...item,
      global: Math.round(item.global * 1.2),
      asia: Math.round(item.asia * 1.25),
      europe: Math.round(item.europe * 1.3),
      northAmerica: Math.round(item.northAmerica * 1.15),
      southAmerica: Math.round(item.southAmerica * 1.2),
      africa: Math.round(item.africa * 1.3),
      oceania: Math.round(item.oceania * 1.1),
      upperBound: Math.round(item.global * 1.3),
      lowerBound: Math.round(item.global * 1.1)
    }));
    
    // 和平发展情景数据
    const peacefulData = baseData.map(item => ({
      ...item,
      global: Math.round(item.global * 0.9),
      asia: Math.round(item.asia * 0.85),
      europe: Math.round(item.europe * 0.8),
      northAmerica: Math.round(item.northAmerica * 0.85),
      southAmerica: Math.round(item.southAmerica * 0.9),
      africa: Math.round(item.africa * 0.95),
      oceania: Math.round(item.oceania * 0.9),
      upperBound: Math.round(item.global * 0.95),
      lowerBound: Math.round(item.global * 0.85)
    }));
    
    // 基线预测数据（添加置信区间）
    const baselineWithInterval = baseData.map(item => ({
      ...item,
      upperBound: Math.round(item.global * 1.15),
      lowerBound: Math.round(item.global * 0.85)
    }));
    
    // 根据选择的情景返回相应数据
    switch (futureScenario) {
      case 'highTension':
        return highTensionData;
      case 'peacefulDevelopment':
        return peacefulData;
      default:
        return baselineWithInterval;
    }
  };
  
  // 获取军事联盟预测数据
  const getAllianceFutureData = () => {
    // 基础数据
    const baseData = [
      { year: 2022, nato: 1250, sco: 380, csto: 95, nonAligned: 388 },
      { year: 2023, nato: 1280, sco: 400, csto: 100, nonAligned: 420 },
      { year: 2024, nato: 1310, sco: 420, csto: 105, nonAligned: 455 },
      { year: 2025, nato: 1340, sco: 440, csto: 110, nonAligned: 490 },
      { year: 2026, nato: 1370, sco: 460, csto: 115, nonAligned: 525 },
      { year: 2027, nato: 1400, sco: 480, csto: 120, nonAligned: 560 },
      { year: 2028, nato: 1430, sco: 500, csto: 125, nonAligned: 595 },
      { year: 2029, nato: 1460, sco: 520, csto: 130, nonAligned: 630 },
      { year: 2030, nato: 1490, sco: 540, csto: 135, nonAligned: 665 }
    ];
    
    // 高紧张度情景数据
    const highTensionData = baseData.map(item => ({
      ...item,
      nato: Math.round(item.nato * 1.25),
      sco: Math.round(item.sco * 1.3),
      csto: Math.round(item.csto * 1.35),
      nonAligned: Math.round(item.nonAligned * 1.15)
    }));
    
    // 和平发展情景数据
    const peacefulData = baseData.map(item => ({
      ...item,
      nato: Math.round(item.nato * 0.85),
      sco: Math.round(item.sco * 0.9),
      csto: Math.round(item.csto * 0.8),
      nonAligned: Math.round(item.nonAligned * 0.95)
    }));
    
    // 根据选择的情景返回相应数据
    switch (futureScenario) {
      case 'highTension':
        return highTensionData;
      case 'peacefulDevelopment':
        return peacefulData;
      default:
        return baseData;
    }
  };
  
  
  // 获取GDP占比数据
  const getGdpRatioData = () => {
    // 基础数据
    const baseData = [
      { year: 2022, global: 2.2, usa: 3.5, china: 1.7, russia: 4.1, india: 2.9 },
      { year: 2023, global: 2.2, usa: 3.5, china: 1.7, russia: 4.2, india: 2.9 },
      { year: 2024, global: 2.3, usa: 3.6, china: 1.8, russia: 4.3, india: 3.0 },
      { year: 2025, global: 2.3, usa: 3.6, china: 1.8, russia: 4.4, india: 3.0 },
      { year: 2026, global: 2.3, usa: 3.7, china: 1.9, russia: 4.5, india: 3.1 },
      { year: 2027, global: 2.4, usa: 3.7, china: 1.9, russia: 4.6, india: 3.1 },
      { year: 2028, global: 2.4, usa: 3.8, china: 2.0, russia: 4.7, india: 3.2 },
      { year: 2029, global: 2.4, usa: 3.8, china: 2.0, russia: 4.8, india: 3.2 },
      { year: 2030, global: 2.5, usa: 3.9, china: 2.1, russia: 4.9, india: 3.3 }
    ];
    
    // 高紧张度情景数据
    const highTensionData = baseData.map(item => ({
      ...item,
      global: parseFloat((item.global * 1.3).toFixed(1)),
      usa: parseFloat((item.usa * 1.2).toFixed(1)),
      china: parseFloat((item.china * 1.4).toFixed(1)),
      russia: parseFloat((item.russia * 1.5).toFixed(1)),
      india: parseFloat((item.india * 1.3).toFixed(1))
    }));
    
    // 和平发展情景数据
    const peacefulData = baseData.map(item => ({
      ...item,
      global: parseFloat((item.global * 0.8).toFixed(1)),
      usa: parseFloat((item.usa * 0.75).toFixed(1)),
      china: parseFloat((item.china * 0.85).toFixed(1)),
      russia: parseFloat((item.russia * 0.7).toFixed(1)),
      india: parseFloat((item.india * 0.8).toFixed(1))
    }));
    
    // 根据选择的情景返回相应数据
    switch (futureScenario) {
      case 'highTension':
        return highTensionData;
      case 'peacefulDevelopment':
        return peacefulData;
      default:
        return baseData;
    }
  };
  
  // 获取军事人员数据
  const getPersonnelData = () => {
    // 基础数据（单位：千人）
    const baseData = [
      { year: 2022, usa: 1390, china: 2035, russia: 850, india: 1450 },
      { year: 2023, usa: 1400, china: 2050, russia: 860, india: 1470 },
      { year: 2024, usa: 1410, china: 2065, russia: 870, india: 1490 },
      { year: 2025, usa: 1420, china: 2080, russia: 880, india: 1510 },
      { year: 2026, usa: 1430, china: 2095, russia: 890, india: 1530 },
      { year: 2027, usa: 1440, china: 2110, russia: 900, india: 1550 },
      { year: 2028, usa: 1450, china: 2125, russia: 910, india: 1570 },
      { year: 2029, usa: 1460, china: 2140, russia: 920, india: 1590 },
      { year: 2030, usa: 1470, china: 2155, russia: 930, india: 1610 }
    ];
    
    // 高紧张度情景数据
    const highTensionData = baseData.map(item => ({
      ...item,
      usa: Math.round(item.usa * 1.15),
      china: Math.round(item.china * 1.2),
      russia: Math.round(item.russia * 1.25),
      india: Math.round(item.india * 1.15)
    }));
    
    // 和平发展情景数据
    const peacefulData = baseData.map(item => ({
      ...item,
      usa: Math.round(item.usa * 0.9),
      china: Math.round(item.china * 0.85),
      russia: Math.round(item.russia * 0.8),
      india: Math.round(item.india * 0.9)
    }));
    
    // 根据选择的情景返回相应数据
    switch (futureScenario) {
      case 'highTension':
        return highTensionData;
      case 'peacefulDevelopment':
        return peacefulData;
      default:
        return baseData;
    }
  };
  
  // 初始化数据
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // 获取所有国家
        const countriesData = await apiClient.getAllCountries();
        setCountries(countriesData);
        
        // 提取不同的大洲
        const uniqueContinents = Array.from(new Set(countriesData.map(country => country.continent)));
        setContinents(uniqueContinents);
        
        // 获取默认年份的顶级国家
        await fetchTopCountries(selectedYear);
        
        // 获取大洲数据
        await fetchContinentData();
        
        // 获取趋势数据
        await fetchTrendData();
        
        setLoading(false);
      } catch (error) {
        console.error('初始化数据失败:', error);
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // 获取顶级国家数据
  const fetchTopCountries = async (year: number) => {
    try {
      const data = await apiClient.getTopMilitaryExpenditureByYear(year, 30);
      setTopCountries(data);
    } catch (error) {
      console.error(`获取${year}年顶级国家数据失败:`, error);
    }
  };
  
  // 获取大洲数据
  const fetchContinentData = async () => {
    try {
      const allData = await apiClient.getMilitaryExpenditureByYear(selectedYear);
      
      // 按大洲分组并计算总和
      const continentMap: Record<string, number> = {};
      
      allData.forEach(item => {
        if (item.continent && item.continent !== 'current_data') {
          if (!continentMap[item.continent]) {
            continentMap[item.continent] = 0;
          }
          continentMap[item.continent] += item.amount;
        }
      });
      
      // 转换为图表数据格式
      const formattedData = Object.entries(continentMap).map(([continent, amount]) => ({
        continent,
        amount,
      }));
      
      setContinentData(formattedData);
    } catch (error) {
      console.error('获取大洲数据失败:', error);
    }
  };
  
  // 获取趋势数据
  const fetchTrendData = async () => {
    try {
      // 选取几个关键年份
      const keyYears = [1970, 1980, 1990, 2000, 2010, 2022];
      
      interface TrendDataItem {
        year: number;
        data: {
          country: string;
          amount: number;
        }[];
      }
      
      const trendDataArray: TrendDataItem[] = [];
      
      for (const year of keyYears) {
        const data = await apiClient.getTopMilitaryExpenditureByYear(year, 5);
        trendDataArray.push({
          year,
          data: data.map(item => ({
            country: item.name,
            amount: item.amount
          }))
        });
      }
      
      // 转换为趋势图所需格式
      const countries = Array.from(
        new Set(
          trendDataArray.flatMap(yearData => 
            yearData.data.map((item: { country: string; amount: number }) => item.country)
          )
        )
      );
      
      const formattedTrendData = keyYears.map(year => {
        const yearData = trendDataArray.find(data => data.year === year);
        const result: Record<string, any> = { year };
        
        countries.forEach(country => {
          const countryData = yearData?.data.find(item => item.country === country);
          result[country] = countryData ? countryData.amount : 0;
        });
        
        return result;
      });
      
      setTrendData(formattedTrendData);
    } catch (error) {
      console.error('获取趋势数据失败:', error);
    }
  };
  
  // 比较国家
  const compareCountries = async () => {
    if (selectedCountry1 && selectedCountry2) {
      try {
        const data1 = await apiClient.getMilitaryExpenditureByCountry(selectedCountry1);
        const data2 = await apiClient.getMilitaryExpenditureByCountry(selectedCountry2);
        
        const country1 = countries.find(c => c.id === selectedCountry1);
        const country2 = countries.find(c => c.id === selectedCountry2);
        
        // 合并数据用于比较
        const comparisonData = [];
        
        for (let i = 2010; i <= 2022; i++) {
          const year = i;
          const country1Data = data1.find(d => d.year === year);
          const country2Data = data2.find(d => d.year === year);
          
          comparisonData.push({
            year,
            [country1?.name || 'Country 1']: country1Data ? country1Data.amount : 0,
            [country2?.name || 'Country 2']: country2Data ? country2Data.amount : 0,
          });
        }
        
        setCountryComparison(comparisonData);
      } catch (error) {
        console.error('比较国家数据失败:', error);
      }
    }
  };
  
  // 处理年份变化
  const handleYearChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    await fetchTopCountries(year);
    await fetchContinentData();
  };
  
  // 处理大洲变化
  const handleContinentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedContinent(e.target.value);
  };
  
  // 处理国家选择变化
  const handleCountry1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry1(parseInt(e.target.value));
  };
  
  const handleCountry2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry2(parseInt(e.target.value));
  };
  
  // 过滤数据
  const filteredTopCountries = selectedContinent === 'All' 
    ? topCountries 
    : topCountries.filter(country => country.continent === selectedContinent);
  
  // 动画配置
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  // 确保地图在组件挂载后加载
  useEffect(() => {
    // 添加延迟确保DOM已完全渲染
    const timer = setTimeout(() => {
      // 检查高德地图API是否已加载
      if (!(window as any).AMap) {
        console.error('高德地图API未加载，请检查网络连接和API密钥配置');
        return;
      }
      
      const AMapInstance = (window as any).AMap;
      
      // 确保容器元素存在且地图实例尚未创建
      if (mapContainerRef.current && !mapInstanceRef.current) {
        try {
          console.log('正在初始化高德地图...');
          mapInstanceRef.current = new AMapInstance.Map(mapContainerRef.current, {
            zoom: 3,                // 初始缩放级别
            center: [116.397428, 39.90923], // 初始中心点（北京）
            viewMode: '3D',         // 3D视图
            labelzIndex: 130,
            pitch: 30,              // 俯仰角度
          });
          
          // 添加控件
          mapInstanceRef.current.plugin(['AMap.ToolBar', 'AMap.Scale'], function() {
            mapInstanceRef.current.addControl(new AMapInstance.ToolBar());
            mapInstanceRef.current.addControl(new AMapInstance.Scale());
          });
          
          console.log('高德地图初始化成功');
        } catch (error) {
          console.error('高德地图初始化失败:', error);
        }
      }
    }, 1000); // 延迟1秒初始化地图
    
    // 清理函数
    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array to run once on mount and clean up on unmount
  
  return (
    <PageContainer>
      <Title
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        世界军事力量可视化分析
      </Title>
      
      {loading ? (
        <LoadingIndicator>加载数据中...</LoadingIndicator>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 世界地图 */}
          <FullWidthSection>
            <SectionTitle variants={itemVariants}>世界军事力量分布</SectionTitle>
            <Card variants={itemVariants}>
              <MapContainer>
                <Canvas>
                  <Globe />
                </Canvas>
              </MapContainer>
            </Card>
          </FullWidthSection>
          
          {/* 筛选器 */}
          <SelectContainer>
            <StyledSelect value={selectedYear} onChange={handleYearChange}>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </StyledSelect>
            
            <StyledSelect value={selectedContinent} onChange={handleContinentChange}>
              <option value="All">所有大洲</option>
              {continents.map(continent => (
                <option key={continent} value={continent}>{continent}</option>
              ))}
            </StyledSelect>
          </SelectContainer>
          
          <GridContainer>
            {/* 各大洲军事力量比较 */}
            <Card variants={itemVariants}>
              <SectionTitle variants={itemVariants}>各大洲军事力量比较 ({selectedYear})</SectionTitle>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={continentData}
                    dataKey="amount"
                    nameKey="continent"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={(entry) => `${entry.continent}: ${(entry.percent * 100).toFixed(1)}%`}
                  >
                    {continentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CONTINENT_COLORS[entry.continent] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()} 百万`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
            
            {/* Top 30 国家军事力量 */}
            <Card variants={itemVariants}>
              <SectionTitle variants={itemVariants}>Top 30 国家军事力量 ({selectedYear})</SectionTitle>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={filteredTopCountries.slice(0, 10)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={90}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()} 百万`} />
                  <Legend />
                  <Bar dataKey="amount" name="军费支出 (百万美元)" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            
            {/* 国家军事力量比较 */}
            <Card variants={itemVariants}>
              <SectionTitle variants={itemVariants}>国家军事力量比较</SectionTitle>
              <CountryComparisonContainer>
                <ComparisonRow>
                  <StyledSelect value={selectedCountry1 || ''} onChange={handleCountry1Change}>
                    <option value="">选择国家 1</option>
                    {countries.map(country => (
                      <option key={`country1-${country.id}`} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </StyledSelect>
                  
                  <StyledSelect value={selectedCountry2 || ''} onChange={handleCountry2Change}>
                    <option value="">选择国家 2</option>
                    {countries.map(country => (
                      <option key={`country2-${country.id}`} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </StyledSelect>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#64ffda',
                      color: '#0a192f',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                    onClick={compareCountries}
                  >
                    比较
                  </motion.button>
                </ComparisonRow>
                
                {countryComparison.length > 0 && (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={countryComparison}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()} 百万`} />
                      <Legend />
                      {Object.keys(countryComparison[0] || {}).filter(key => key !== 'year').map((country, index) => (
                        <Line
                          key={country}
                          type="monotone"
                          dataKey={country}
                          stroke={COLORS[index % COLORS.length]}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CountryComparisonContainer>
            </Card>
            
            {/* 军事力量发展趋势 - 增强版 */}
            <Card variants={itemVariants}>
              <SectionTitle variants={itemVariants}>世界军事力量发展趋势</SectionTitle>
              
              <div style={{ marginBottom: '1rem' }}>
                <StyledSelect 
                  onChange={(e) => {
                    const view = e.target.value;
                    if (view === 'area') {
                      setChartView('area');
                    } else if (view === 'line') {
                      setChartView('line');
                    } else if (view === 'bar') {
                      setChartView('bar');
                    } else {
                      setChartView('radar');
                    }
                  }}
                  defaultValue="area"
                >
                  <option value="area">区域图</option>
                  <option value="line">折线图</option>
                  <option value="bar">柱状图</option>
                  <option value="radar">雷达图</option>
                </StyledSelect>
                
                <StyledSelect 
                  onChange={(e) => {
                    const count = parseInt(e.target.value);
                    setDisplayCountryCount(count);
                  }}
                  defaultValue="5"
                  style={{ marginLeft: '1rem' }}
                >
                  <option value="5">Top 5 国家</option>
                  <option value="10">Top 10 国家</option>
                  <option value="15">Top 15 国家</option>
                </StyledSelect>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: showPerCapita ? '#64ffda' : '#172a45',
                    color: showPerCapita ? '#0a192f' : '#e6f1ff',
                    border: '1px solid #64ffda',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginLeft: '1rem',
                    fontWeight: 'bold'
                  }}
                  onClick={() => setShowPerCapita(!showPerCapita)}
                >
                  {showPerCapita ? '总额' : '人均'}
                </motion.button>
              </div>
              
              {chartView === 'area' && (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={trendData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()} ${showPerCapita ? '美元' : '百万美元'}`} />
                    <Legend />
                    {Object.keys(trendData[0] || {}).filter(key => key !== 'year').slice(0, displayCountryCount).map((country, index) => (
                      <Area
                        key={country}
                        type="monotone"
                        dataKey={country}
                        stackId="1"
                        stroke={COLORS[index % COLORS.length]}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              )}
              
              {chartView === 'line' && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={trendData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()} ${showPerCapita ? '美元' : '百万美元'}`} />
                    <Legend />
                    {Object.keys(trendData[0] || {}).filter(key => key !== 'year').slice(0, displayCountryCount).map((country, index) => (
                      <Line
                        key={country}
                        type="monotone"
                        dataKey={country}
                        stroke={COLORS[index % COLORS.length]}
                        activeDot={{ r: 8 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
              
              {chartView === 'bar' && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={trendData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()} ${showPerCapita ? '美元' : '百万美元'}`} />
                    <Legend />
                    {Object.keys(trendData[0] || {}).filter(key => key !== 'year').slice(0, displayCountryCount).map((country, index) => (
                      <Bar
                        key={country}
                        dataKey={country}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
              
              {chartView === 'radar' && (
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                    { category: '总额', USA: 877, China: 292, Russia: 86, India: 76, UK: 68 },
                    { category: 'GDP占比', USA: 3.5, China: 1.7, Russia: 4.1, India: 2.9, UK: 2.2 },
                    { category: '增长率', USA: 2.4, China: 7.1, Russia: 3.7, India: 5.5, UK: 1.8 },
                    { category: '人均', USA: 2200, China: 210, Russia: 580, India: 55, UK: 990 },
                    { category: '技术水平', USA: 95, China: 80, Russia: 85, India: 70, UK: 90 }
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                    <Radar name="美国" dataKey="USA" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Radar name="中国" dataKey="China" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    <Radar name="俄罗斯" dataKey="Russia" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                    <Radar name="印度" dataKey="India" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} />
                    <Radar name="英国" dataKey="UK" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              )}
              
              <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#8892b0', lineHeight: '1.5' }}>
                <p>分析观点：从1970年至2022年，全球军费支出总额呈现持续上升趋势，其中美国一直保持绝对领先地位。中国的军费增长速度自2000年以来尤为显著，已成为世界第二大军费支出国。</p>
              </div>
            </Card>
          </GridContainer>
          
          {/* 未来军事发展预测 - 增强版 */}
          <FullWidthSection>
            <SectionTitle variants={itemVariants}>未来军事发展预测 (2023-2030)</SectionTitle>
            <Card variants={itemVariants}>
              <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <StyledSelect 
                  onChange={(e) => {
                    const scenario = e.target.value;
                    setFutureScenario(scenario);
                  }}
                  defaultValue="baseline"
                >
                  <option value="baseline">基线预测</option>
                  <option value="highTension">高紧张度情景</option>
                  <option value="peacefulDevelopment">和平发展情景</option>
                </StyledSelect>
                
                <StyledSelect 
                  onChange={(e) => {
                    const focus = e.target.value;
                    setFutureFocus(focus);
                  }}
                  defaultValue="expenditure"
                >
                  <option value="expenditure">军费支出</option>
                  <option value="gdpRatio">GDP占比</option>
                  <option value="personnel">军事人员</option>
                </StyledSelect>
                
                <StyledSelect 
                  onChange={(e) => {
                    const viewMode = e.target.value;
                    setFutureViewMode(viewMode);
                  }}
                  defaultValue="countries"
                >
                  <option value="countries">主要国家</option>
                  <option value="continents">各大洲</option>
                  <option value="alliances">军事联盟</option>
                </StyledSelect>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: showConfidenceInterval ? '#64ffda' : '#172a45',
                    color: showConfidenceInterval ? '#0a192f' : '#e6f1ff',
                    border: '1px solid #64ffda',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                  onClick={() => setShowConfidenceInterval(!showConfidenceInterval)}
                >
                  {showConfidenceInterval ? '隐藏置信区间' : '显示置信区间'}
                </motion.button>
              </div>
              
              {futureFocus === 'expenditure' && futureViewMode === 'countries' && (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart
                    data={getFutureData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()} 十亿`} />
                    <Legend />
                    <Line type="natural" dataKey="global" name="全球军费" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} />
                    <Line type="natural" dataKey="usa" name="美国" stroke="#82ca9d" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="china" name="中国" stroke="#ffc658" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="russia" name="俄罗斯" stroke="#ff7300" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="india" name="印度" stroke="#00C49F" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="uk" name="英国" stroke="#0088FE" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="france" name="法国" stroke="#FFBB28" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="germany" name="德国" stroke="#FF8042" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="japan" name="日本" stroke="#00C49F" activeDot={{ r: 6 }} />
                    {showConfidenceInterval && (
                      <Area type="natural" dataKey="upperBound" name="上限" stroke="none" fill="#8884d8" fillOpacity={0.2} />
                    )}
                    {showConfidenceInterval && (
                      <Area type="natural" dataKey="lowerBound" name="下限" stroke="none" fill="#8884d8" fillOpacity={0.2} />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              )}
              
              {futureFocus === 'expenditure' && futureViewMode === 'continents' && (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart
                    data={getContinentFutureData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()} 十亿`} />
                    <Legend />
                    <Line type="natural" dataKey="global" name="全球军费" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} />
                    <Line type="natural" dataKey="asia" name="亚洲" stroke="#82ca9d" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="europe" name="欧洲" stroke="#ffc658" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="northAmerica" name="北美洲" stroke="#ff7300" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="southAmerica" name="南美洲" stroke="#00C49F" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="africa" name="非洲" stroke="#0088FE" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="oceania" name="大洋洲" stroke="#FFBB28" activeDot={{ r: 6 }} />
                    {showConfidenceInterval && (
                      <Area type="natural" dataKey="upperBound" name="上限" stroke="none" fill="#8884d8" fillOpacity={0.2} />
                    )}
                    {showConfidenceInterval && (
                      <Area type="natural" dataKey="lowerBound" name="下限" stroke="none" fill="#8884d8" fillOpacity={0.2} />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              )}
              
              {futureFocus === 'expenditure' && futureViewMode === 'alliances' && (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart
                    data={getAllianceFutureData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()} 十亿`} />
                    <Legend />
                    <Line type="natural" dataKey="nato" name="北约" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} />
                    <Line type="natural" dataKey="sco" name="上合组织" stroke="#82ca9d" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="csto" name="集体安全条约组织" stroke="#ffc658" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="nonAligned" name="不结盟国家" stroke="#ff7300" activeDot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
              
              {futureFocus === 'gdpRatio' && futureViewMode === 'countries' && (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={getGdpRatioData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                    <Legend />
                    <Line type="natural" dataKey="global" name="全球平均" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} />
                    <Line type="natural" dataKey="usa" name="美国" stroke="#82ca9d" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="china" name="中国" stroke="#ffc658" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="russia" name="俄罗斯" stroke="#ff7300" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="india" name="印度" stroke="#00C49F" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="uk" name="英国" stroke="#0088FE" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="france" name="法国" stroke="#FFBB28" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="germany" name="德国" stroke="#FF8042" activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
              
              {futureFocus === 'gdpRatio' && futureViewMode === 'continents' && (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={[
                      { year: 2022, asia: 2.4, europe: 1.8, northAmerica: 3.2, southAmerica: 1.5, africa: 1.7, oceania: 2.0 },
                      { year: 2023, asia: 2.5, europe: 1.9, northAmerica: 3.3, southAmerica: 1.6, africa: 1.8, oceania: 2.1 },
                      { year: 2024, asia: 2.6, europe: 2.0, northAmerica: 3.4, southAmerica: 1.7, africa: 1.9, oceania: 2.2 },
                      { year: 2025, asia: 2.7, europe: 2.1, northAmerica: 3.5, southAmerica: 1.8, africa: 2.0, oceania: 2.3 },
                      { year: 2026, asia: 2.8, europe: 2.2, northAmerica: 3.6, southAmerica: 1.9, africa: 2.1, oceania: 2.4 },
                      { year: 2027, asia: 2.9, europe: 2.3, northAmerica: 3.7, southAmerica: 2.0, africa: 2.2, oceania: 2.5 },
                      { year: 2028, asia: 3.0, europe: 2.4, northAmerica: 3.8, southAmerica: 2.1, africa: 2.3, oceania: 2.6 },
                      { year: 2029, asia: 3.1, europe: 2.5, northAmerica: 3.9, southAmerica: 2.2, africa: 2.4, oceania: 2.7 },
                      { year: 2030, asia: 3.2, europe: 2.6, northAmerica: 4.0, southAmerica: 2.3, africa: 2.5, oceania: 2.8 }
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                    <Legend />
                    <Line type="natural" dataKey="asia" name="亚洲" stroke="#82ca9d" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="europe" name="欧洲" stroke="#ffc658" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="northAmerica" name="北美洲" stroke="#ff7300" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="southAmerica" name="南美洲" stroke="#00C49F" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="africa" name="非洲" stroke="#0088FE" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="oceania" name="大洋洲" stroke="#FFBB28" activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
              
              {futureFocus === 'gdpRatio' && futureViewMode === 'alliances' && (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={[
                      { year: 2022, nato: 2.5, sco: 2.1, csto: 3.8, nonAligned: 1.9 },
                      { year: 2023, nato: 2.6, sco: 2.2, csto: 3.9, nonAligned: 2.0 },
                      { year: 2024, nato: 2.7, sco: 2.3, csto: 4.0, nonAligned: 2.1 },
                      { year: 2025, nato: 2.8, sco: 2.4, csto: 4.1, nonAligned: 2.2 },
                      { year: 2026, nato: 2.9, sco: 2.5, csto: 4.2, nonAligned: 2.3 },
                      { year: 2027, nato: 3.0, sco: 2.6, csto: 4.3, nonAligned: 2.4 },
                      { year: 2028, nato: 3.1, sco: 2.7, csto: 4.4, nonAligned: 2.5 },
                      { year: 2029, nato: 3.2, sco: 2.8, csto: 4.5, nonAligned: 2.6 },
                      { year: 2030, nato: 3.3, sco: 2.9, csto: 4.6, nonAligned: 2.7 }
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                    <Legend />
                    <Line type="natural" dataKey="nato" name="北约" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} />
                    <Line type="natural" dataKey="sco" name="上合组织" stroke="#82ca9d" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="csto" name="集体安全条约组织" stroke="#ffc658" activeDot={{ r: 6 }} />
                    <Line type="natural" dataKey="nonAligned" name="不结盟国家" stroke="#ff7300" activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
              
              {futureFocus === 'personnel' && futureViewMode === 'countries' && (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart
                    data={getPersonnelData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toLocaleString()} 人`} />
                    <Legend />
                    <Bar dataKey="usa" name="美国" fill="#82ca9d" />
                    <Bar dataKey="china" name="中国" fill="#ffc658" />
                    <Bar dataKey="russia" name="俄罗斯" fill="#ff7300" />
                    <Bar dataKey="india" name="印度" fill="#00C49F" />
                    <Line type="natural" dataKey="usa" stroke="#82ca9d" dot={false} activeDot={false} />
                    <Line type="natural" dataKey="china" stroke="#ffc658" dot={false} activeDot={false} />
                    <Line type="natural" dataKey="russia" stroke="#ff7300" dot={false} activeDot={false} />
                    <Line type="natural" dataKey="india" stroke="#00C49F" dot={false} activeDot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
              
              {futureFocus === 'personnel' && futureViewMode === 'continents' && (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart
                    data={[
                      { year: 2022, asia: 5200, europe: 2100, northAmerica: 1500, southAmerica: 900, africa: 1200, oceania: 80 },
                      { year: 2023, asia: 5250, europe: 2120, northAmerica: 1510, southAmerica: 910, africa: 1220, oceania: 82 },
                      { year: 2024, asia: 5300, europe: 2140, northAmerica: 1520, southAmerica: 920, africa: 1240, oceania: 84 },
                      { year: 2025, asia: 5350, europe: 2160, northAmerica: 1530, southAmerica: 930, africa: 1260, oceania: 86 },
                      { year: 2026, asia: 5400, europe: 2180, northAmerica: 1540, southAmerica: 940, africa: 1280, oceania: 88 },
                      { year: 2027, asia: 5450, europe: 2200, northAmerica: 1550, southAmerica: 950, africa: 1300, oceania: 90 },
                      { year: 2028, asia: 5500, europe: 2220, northAmerica: 1560, southAmerica: 960, africa: 1320, oceania: 92 },
                      { year: 2029, asia: 5550, europe: 2240, northAmerica: 1570, southAmerica: 970, africa: 1340, oceania: 94 },
                      { year: 2030, asia: 5600, europe: 2260, northAmerica: 1580, southAmerica: 980, africa: 1360, oceania: 96 }
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toLocaleString()} 人`} />
                    <Legend />
                    <Bar dataKey="asia" name="亚洲" fill="#82ca9d" stackId="a" />
                    <Bar dataKey="europe" name="欧洲" fill="#ffc658" stackId="a" />
                    <Bar dataKey="northAmerica" name="北美洲" fill="#ff7300" stackId="a" />
                    <Bar dataKey="southAmerica" name="南美洲" fill="#00C49F" stackId="a" />
                    <Bar dataKey="africa" name="非洲" fill="#0088FE" stackId="a" />
                    <Bar dataKey="oceania" name="大洋洲" fill="#FFBB28" stackId="a" />
                    <Line type="natural" dataKey="asia" stroke="#82ca9d" dot={false} activeDot={false} />
                    <Line type="natural" dataKey="europe" stroke="#ffc658" dot={false} activeDot={false} />
                    <Line type="natural" dataKey="northAmerica" stroke="#ff7300" dot={false} activeDot={false} />
                    <Line type="natural" dataKey="southAmerica" stroke="#00C49F" dot={false} activeDot={false} />
                    <Line type="natural" dataKey="africa" stroke="#0088FE" dot={false} activeDot={false} />
                    <Line type="natural" dataKey="oceania" stroke="#FFBB28" dot={false} activeDot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
              
              {futureFocus === 'personnel' && futureViewMode === 'alliances' && (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart
                    data={[
                      { year: 2022, nato: 3200, sco: 2800, csto: 1100, nonAligned: 3900 },
                      { year: 2023, nato: 3220, sco: 2830, csto: 1110, nonAligned: 3950 },
                      { year: 2024, nato: 3240, sco: 2860, csto: 1120, nonAligned: 4000 },
                      { year: 2025, nato: 3260, sco: 2890, csto: 1130, nonAligned: 4050 },
                      { year: 2026, nato: 3280, sco: 2920, csto: 1140, nonAligned: 4100 },
                      { year: 2027, nato: 3300, sco: 2950, csto: 1150, nonAligned: 4150 },
                      { year: 2028, nato: 3320, sco: 2980, csto: 1160, nonAligned: 4200 },
                      { year: 2029, nato: 3340, sco: 3010, csto: 1170, nonAligned: 4250 },
                      { year: 2030, nato: 3360, sco: 3040, csto: 1180, nonAligned: 4300 }
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toLocaleString()} 人`} />
                    <Legend />
                    <Bar dataKey="nato" name="北约" fill="#8884d8" />
                    <Bar dataKey="sco" name="上合组织" fill="#82ca9d" />
                    <Bar dataKey="csto" name="集体安全条约组织" fill="#ffc658" />
                    <Bar dataKey="nonAligned" name="不结盟国家" fill="#ff7300" />
                    <Line type="natural" dataKey="nato" stroke="#8884d8" dot={false} activeDot={false} />
                    <Line type="natural" dataKey="sco" stroke="#82ca9d" dot={false} activeDot={false} />
                    <Line type="natural" dataKey="csto" stroke="#ffc658" dot={false} activeDot={false} />
                    <Line type="natural" dataKey="nonAligned" stroke="#ff7300" dot={false} activeDot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
              
              <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#8892b0', lineHeight: '1.5' }}>
                <h4 style={{ color: '#64ffda', marginBottom: '0.5rem' }}>预测分析：</h4>
                {futureScenario === 'baseline' && futureViewMode === 'countries' && (
                  <p>基线预测情景下，全球军费将以平均每年约 3.5% 的速度增长。美国将维持其全球军费领先地位，但中国的军费增长速度预计将高于全球平均水平，到 2030 年可能达到美国的一半。英国、法国、德国和日本等发达国家的军费支出增长相对稳定，但在GDP占比方面呈现上升趋势，反映出全球安全形势的变化。</p>
                )}
                {futureScenario === 'highTension' && futureViewMode === 'countries' && (
                  <p>高紧张度情景下，全球军费预计将以平均每年约 5.8% 的速度增长，显著高于基线预测。各主要军事大国将增加其军费占 GDP 的比例，特别是在地缘政治冲突区域。美国、中国、俄罗斯和印度等主要国家的军费支出将大幅增加，军事技术竞争将更加激烈。欧洲国家如英国、法国和德国也将显著提高国防预算，以应对区域安全挑战。</p>
                )}
                {futureScenario === 'peacefulDevelopment' && futureViewMode === 'countries' && (
                  <p>和平发展情景下，全球军费预计将以较低的速度增长（平均每年约 2.1%），部分国家可能会减少其军费占 GDP 的比例。美国和中国等主要军事大国的军费增长将放缓，更多资源将被分配给民用技术和可持续发展项目。日本和德国等国家可能会保持相对稳定的军费水平，专注于防御性和维和能力建设。</p>
                )}
                
                {futureScenario === 'baseline' && futureViewMode === 'continents' && (
                  <p>按大洲划分，亚洲的军事力量增长最为显著，预计到2030年将占全球军费总支出的近40%。欧洲受地缘政治影响，军费支出增速加快，北美洲则保持相对稳定的增长。非洲和南美洲的军费支出虽然基数较小，但增长率较高，反映出区域安全需求的提升。大洋洲军费支出占比最小，但增速稳定。</p>
                )}
                {futureScenario === 'highTension' && futureViewMode === 'continents' && (
                  <p>高紧张度情景下，各大洲军费支出将全面提升。亚洲军费增长最为迅猛，欧洲紧随其后，反映出这两个地区地缘政治紧张局势的加剧。北美洲军费支出将保持高位并稳步增长，非洲和南美洲的军费增速将显著提高，以应对区域冲突和安全威胁。大洋洲虽然体量小，但增速将高于基线预测。</p>
                )}
                {futureScenario === 'peacefulDevelopment' && futureViewMode === 'continents' && (
                  <p>和平发展情景下，各大洲军费支出增长将趋于平缓。亚洲军费增速将明显放缓，欧洲和北美洲的军费支出可能出现小幅下降。非洲和南美洲将把更多资源投入到经济发展和社会建设中，军费增长将低于基线预测。大洋洲将保持相对稳定的军费水平，主要用于维护地区和平与安全。</p>
                )}
                
                {futureScenario === 'baseline' && futureViewMode === 'alliances' && (
                  <p>从军事联盟角度看，北约仍将是全球最强大的军事联盟，军费总支出远超其他组织。上合组织（主要由中国和俄罗斯主导）的军费增长速度最快，预计到2030年将缩小与北约的差距。集体安全条约组织的军费支出相对稳定，而不结盟国家的军费支出总和呈现稳步上升趋势，反映出多极化世界的形成。</p>
                )}
                {futureScenario === 'highTension' && futureViewMode === 'alliances' && (
                  <p>高紧张度情景下，各军事联盟间的军备竞赛将加剧。北约将大幅增加军费支出，以应对来自东方的挑战。上合组织的军费增长将更为迅猛，集体安全条约组织也将显著提高军费投入。不结盟国家面对复杂的国际环境，也将增加军事投入以保障国家安全，军费支出增速将高于基线预测。</p>
                )}
                {futureScenario === 'peacefulDevelopment' && futureViewMode === 'alliances' && (
                  <p>和平发展情景下，军事联盟间的合作将增强，军备竞赛将减弱。北约和上合组织的军费增长将放缓，更多资源将投入到联合维和、反恐和人道主义救援等领域。集体安全条约组织的军费支出可能略有下降，不结盟国家将把更多资源用于经济发展和民生改善，军费支出增速将低于基线预测。</p>
                )}
              </div>
            </Card>
          </FullWidthSection>

          <FullWidthSection>
            <Card>
              <SectionTitle>世界军事力量分布 (高德地图)</SectionTitle>
              <div ref={mapContainerRef} style={{ height: '500px', width: '100%', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#112240' }} />
            </Card>
          </FullWidthSection>
        </motion.div>
      )}
    </PageContainer>
  );
};

export default VisualizationPage;
