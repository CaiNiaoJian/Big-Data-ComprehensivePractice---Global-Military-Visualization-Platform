import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import apiClient, { YearlyExpenditure } from '../services/api';

const DataOverviewContainer = styled(motion.div)`
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(17, 34, 64, 0.6);
  border-radius: 8px;
  border-left: 4px solid #64ffda;
`;

const DataTitle = styled.h3`
  font-size: 1.3rem;
  color: #e6f1ff;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  
  &::before {
    content: '📊';
    margin-right: 10px;
  }
`;

const YearSelector = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const YearButton = styled.button<{ isActive: boolean }>`
  padding: 0.5rem 1rem;
  background: ${props => props.isActive ? '#64ffda' : 'rgba(100, 255, 218, 0.1)'};
  color: ${props => props.isActive ? '#0a192f' : '#e6f1ff'};
  border: 1px solid #64ffda;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.isActive ? '#64ffda' : 'rgba(100, 255, 218, 0.2)'};
  }
`;

const DataTable = styled.div`
  overflow-x: auto;
  margin-top: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid rgba(100, 255, 218, 0.2);
  }
  
  th {
    background-color: rgba(10, 25, 47, 0.7);
    color: #64ffda;
    font-weight: 500;
  }
  
  tr:hover {
    background-color: rgba(100, 255, 218, 0.05);
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #a8b2d1;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 4px;
  margin-top: 1rem;
`;

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(amount);
};

interface DataOverviewProps {
  excludeCurrentData?: boolean;
}

const DataOverview: React.FC<DataOverviewProps> = ({ excludeCurrentData = false }) => {
  const [selectedYear, setSelectedYear] = useState<number>(2022);
  const [expenditureData, setExpenditureData] = useState<YearlyExpenditure[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 根据数据集可用的年份
  const years = [2019, 2020, 2021, 2022];
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 使用实际的API调用获取数据
        const data = await apiClient.getMilitaryExpenditureByYear(selectedYear);
        
        // 如果需要排除 current_data 数据
        let filteredData = data;
        if (excludeCurrentData) {
          filteredData = data.filter(item => item.continent.toLowerCase() !== 'current_data');
        }
        
        // 按军费支出金额排序（从高到低）
        const sortedData = [...filteredData].sort((a, b) => b.amount - a.amount);
        
        // 只显示前10个国家
        const top10Data = sortedData.slice(0, 10);
        
        setExpenditureData(top10Data);
        setLoading(false);
      } catch (err) {
        console.error('获取军费支出数据失败:', err);
        setError('获取数据失败，请稍后再试');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedYear, excludeCurrentData]);
  
  return (
    <DataOverviewContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <DataTitle>全球军费支出数据</DataTitle>
      
      <YearSelector>
        {years.map(year => (
          <YearButton
            key={year}
            isActive={year === selectedYear}
            onClick={() => setSelectedYear(year)}
          >
            {year}年
          </YearButton>
        ))}
      </YearSelector>
      
      {loading ? (
        <LoadingMessage>加载数据中...</LoadingMessage>
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : (
        <DataTable>
          <Table>
            <thead>
              <tr>
                <th>排名</th>
                <th>国家</th>
                <th>地区</th>
                <th>军费支出</th>
              </tr>
            </thead>
            <tbody>
              {expenditureData.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.region || item.continent}</td>
                  <td>{formatAmount(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </DataTable>
      )}
    </DataOverviewContainer>
  );
};

export default DataOverview;
