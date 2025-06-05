import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import apiClient from '../services/api';

// 样式组件
const Container = styled.div`
  padding: 2rem;
  background-color: #f5f5f5;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 2rem 0;
  color: #0a192f;
`;

const Title = styled.h2`
  color: #0a192f;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  font-weight: 700;
`;

const Section = styled(motion.div)`
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h3`
  color: #112240;
  margin-bottom: 1rem;
  font-size: 1.4rem;
  font-weight: 600;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #ddd;
    color: #0a192f;
  }
  
  th {
    background-color: #e6f1ff;
    font-weight: 600;
    color: #112240;
  }
  
  tr:hover {
    background-color: #f0f8ff;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  min-width: 150px;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  padding: 1rem;
  background-color: #fadbd8;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #112240;
  font-weight: 500;
`;

// 组件定义
const DatabaseDemo: React.FC = () => {
  // 状态
  const [year, setYear] = useState<number>(2022);
  const [startYear, setStartYear] = useState<number>(2020);
  const [endYear, setEndYear] = useState<number>(2022);
  const [country, setCountry] = useState<string>('United States of America');
  const [topCountries, setTopCountries] = useState<any[]>([]);
  const [countryTimeSeries, setCountryTimeSeries] = useState<any[]>([]);
  const [growthRates, setGrowthRates] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 年份选项
  const yearOptions = Array.from({ length: 2023 - 1960 }, (_, i) => 1960 + i);

  // 加载国家列表
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getAllCountries();
        setCountries(data);
        setLoading(false);
      } catch (err) {
        setError('加载国家列表失败');
        setLoading(false);
        console.error(err);
      }
    };

    loadCountries();
  }, []);

  // 加载前10名军费支出国家
  const loadTopCountries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getTopMilitaryExpenditureByYear(year, 10);
      setTopCountries(data);
      setLoading(false);
    } catch (err) {
      setError(`加载${year}年前10名军费支出国家失败`);
      setLoading(false);
      console.error(err);
    }
  }, [year]);

  // 加载国家时间序列数据
  const loadCountryTimeSeries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 获取国家时间序列数据
      const data = await apiClient.getCountryExpenditureByYearRange(
        country, 
        startYear, 
        endYear
      );
      
      setCountryTimeSeries(data);
      setLoading(false);
    } catch (err) {
      setError(`加载${country}的军费支出时间序列数据失败`);
      setLoading(false);
      console.error(err);
    }
  };

  // 加载增长率排名
  const loadGrowthRates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getExpenditureGrowthRates(startYear, endYear, 10);
      setGrowthRates(data);
      setLoading(false);
    } catch (err) {
      setError(`加载${startYear}-${endYear}年军费支出增长率排名失败`);
      setLoading(false);
      console.error(err);
    }
  };

  // 初始加载
  useEffect(() => {
    loadTopCountries();
  }, [year, loadTopCountries]);

  return (
    <Container>
      <Title>数据库功能演示</Title>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {/* 前10名军费支出国家 */}
      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SectionTitle>{year}年前10名军费支出国家</SectionTitle>
        <Controls>
          <Select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
          <Button onClick={loadTopCountries}>刷新数据</Button>
        </Controls>
        
        {loading ? (
          <LoadingIndicator>加载中...</LoadingIndicator>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>排名</th>
                <th>国家</th>
                <th>大洲</th>
                <th>军费支出 (百万美元)</th>
              </tr>
            </thead>
            <tbody>
              {topCountries.map((country, index) => (
                <tr key={country.name}>
                  <td>{index + 1}</td>
                  <td>{country.name}</td>
                  <td>{country.continent}</td>
                  <td>{country.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>
      
      {/* 国家时间序列数据 */}
      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <SectionTitle>{country}的军费支出时间序列</SectionTitle>
        <Controls>
          <Select value={country} onChange={(e) => setCountry(e.target.value)}>
            {countries.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </Select>
          <Select value={startYear} onChange={(e) => setStartYear(parseInt(e.target.value))}>
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
          <Select value={endYear} onChange={(e) => setEndYear(parseInt(e.target.value))}>
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
          <Button onClick={loadCountryTimeSeries}>加载数据</Button>
        </Controls>
        
        {loading ? (
          <LoadingIndicator>加载中...</LoadingIndicator>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>年份</th>
                <th>军费支出 (百万美元)</th>
              </tr>
            </thead>
            <tbody>
              {countryTimeSeries.map(item => (
                <tr key={item.year}>
                  <td>{item.year}</td>
                  <td>{item.expenditure ? item.expenditure.toLocaleString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>
      
      {/* 增长率排名 */}
      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <SectionTitle>{startYear}-{endYear}年军费支出增长率排名</SectionTitle>
        <Controls>
          <Select value={startYear} onChange={(e) => setStartYear(parseInt(e.target.value))}>
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
          <Select value={endYear} onChange={(e) => setEndYear(parseInt(e.target.value))}>
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
          <Button onClick={loadGrowthRates}>加载数据</Button>
        </Controls>
        
        {loading ? (
          <LoadingIndicator>加载中...</LoadingIndicator>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>排名</th>
                <th>国家</th>
                <th>{startYear}年军费支出</th>
                <th>{endYear}年军费支出</th>
                <th>增长率 (%)</th>
              </tr>
            </thead>
            <tbody>
              {growthRates.map((item, index) => (
                <tr key={item.country}>
                  <td>{index + 1}</td>
                  <td>{item.country}</td>
                  <td>{item.expenditure_start.toLocaleString()}</td>
                  <td>{item.expenditure_end.toLocaleString()}</td>
                  <td>{item.growth_rate.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>
    </Container>
  );
};

export default DatabaseDemo;
