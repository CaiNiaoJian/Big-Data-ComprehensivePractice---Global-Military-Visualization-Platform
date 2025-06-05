import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import DataOverview from '../components/DataOverview';

const PageContainer = styled.div`
  padding: 100px 0 50px;
  background-color: #0a192f;
  min-height: 100vh;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const PageTitle = styled(motion.h1)`
  font-size: 2.5rem;
  color: #e6f1ff;
  margin-bottom: 2rem;
  text-align: center;
  
  &::after {
    content: '';
    display: block;
    width: 100px;
    height: 4px;
    background-color: #64ffda;
    margin: 1rem auto 0;
  }
`;

const SectionContainer = styled(motion.section)`
  margin-bottom: 4rem;
  background-color: rgba(10, 25, 47, 0.7);
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 10px 30px -15px rgba(2, 12, 27, 0.7);
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  color: #e6f1ff;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid rgba(100, 255, 218, 0.3);
  padding-bottom: 0.5rem;
`;

const SectionText = styled.p`
  color: #a8b2d1;
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 2rem;
`;

const DatasetInfoContainer = styled(motion.div)`
  background-color: rgba(17, 34, 64, 0.6);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-left: 4px solid #64ffda;
`;

const DatasetInfoTitle = styled.h3`
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

const DatasetInfoText = styled.p`
  color: #a8b2d1;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 0.5rem;
`;

const DatasetInfoList = styled.ul`
  color: #a8b2d1;
  padding-left: 1.5rem;
  margin: 1rem 0;
  
  li {
    margin-bottom: 0.5rem;
  }
`;

const Overview: React.FC = () => {
  return (
    <PageContainer>
      <ContentContainer>
        <PageTitle
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          世界军事数据可视化平台
        </PageTitle>
        
        <SectionContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SectionTitle>平台概述</SectionTitle>
          <SectionText>
            欢迎来到世界军事数据可视化平台。本平台旨在通过直观的数据可视化方式，展示全球各国军事支出的历史变化和当前状况。
            您可以通过本平台了解1960年至2022年间各国军费支出的详细数据，分析军事实力的全球分布和历史演变。
            平台数据来源于权威的国际和平研究所(SIPRI)军费开支数据库，确保数据的准确性和可靠性。
          </SectionText>
          
          <DatasetInfoContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <DatasetInfoTitle>数据集介绍</DatasetInfoTitle>
            <DatasetInfoText>
              本平台使用的是重建数据集（Rebuilt-Data），源文件为 SIPRI-Milex-data-1948-2023.xlsx。
            </DatasetInfoText>
            <DatasetInfoText>
              由于原始文件更像是一个报告类型的数据集，直接导入会不可避免地出现许多错误，因此我们按大洲手动拆分了国家并简化了表格数据。
              1948-2023年的数据将按大洲（甚至按地区，因为源文件特别将中东列为单独的部分）存放在重建文件夹中。
            </DatasetInfoText>
            <DatasetInfoList>
              <li>第一列是国家名称，其余列代表该国从1948-2023年每年的军费支出（$）</li>
              <li>"..."表示位置，表示该国在那一年的军费支出未被记录，即NULL。这可以通过添加数据来处理，将来可以通过使用前几年记录的平均值来近似</li>
              <li>"xx"表示未记录，可以删除并作为NULL处理或记录为0。在未来的实时变更操作中，保持前几列的数据不变，不进行更改或赋值</li>
            </DatasetInfoList>
            <DatasetInfoText>
              未来将继续扩展数据集，包括：
            </DatasetInfoText>
            <DatasetInfoList>
              <li>基于白宫发布的关于美国与其他国家之间贸易的详细信息，您将找到每个国家的相关信息，包括出口、进口和赤字（或盈余）</li>
              <li>第2版包括人口数据（如果有）。数据来自 https://datahub.io/core/population</li>
            </DatasetInfoList>
          </DatasetInfoContainer>
        </SectionContainer>
        
        <SectionContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <SectionTitle>全球军费支出排名</SectionTitle>
          <DataOverview excludeCurrentData={true} />
        </SectionContainer>
      </ContentContainer>
    </PageContainer>
  );
};

export default Overview;
