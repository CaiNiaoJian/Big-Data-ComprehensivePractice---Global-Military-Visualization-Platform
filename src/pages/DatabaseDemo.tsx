import React from 'react';
import styled from 'styled-components';
import DatabaseDemo from '../components/DatabaseDemo';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
  text-align: center;
  line-height: 1.6;
`;

const DatabaseDemoPage: React.FC = () => {
  return (
    <PageContainer>
      <PageTitle>数据库功能展示</PageTitle>
      <Description>
        本页面展示了从PostgreSQL数据库获取军事数据的功能。您可以查看不同年份的军费支出排名、
        特定国家的军费支出历史，以及军费支出增长率排名等数据。这些数据通过数据库查询获取，
        相比JSON文件提供了更高效和灵活的数据访问方式。
      </Description>
      <DatabaseDemo />
    </PageContainer>
  );
};

export default DatabaseDemoPage;
