import React from 'react';
import styled from 'styled-components';
import { motion, useInView } from 'framer-motion';
import DataOverview from './DataOverview';

const SectionContainer = styled.section`
  padding: 6rem 2rem;
  background-color: #0a192f;
  color: #ccd6f6;
  
  &:nth-child(even) {
    background-color: #112240;
  }
`;

const SectionContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const SectionTitle = styled(motion.h2)`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #e6f1ff;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 80px;
    height: 4px;
    background: linear-gradient(to right, #64ffda, #00bcd4);
  }
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionText = styled(motion.p)`
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
  opacity: 0.9;
`;

const DatasetInfoContainer = styled(motion.div)`
  background: rgba(17, 34, 64, 0.6);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  border-left: 4px solid #64ffda;
`;

const DatasetTitle = styled.h3`
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

const DatasetDescription = styled.div`
  font-size: 1rem;
  line-height: 1.7;
  color: #a8b2d1;
  
  h2 {
    font-size: 1.2rem;
    color: #64ffda;
    margin: 1rem 0 0.5rem 0;
  }
  
  ul {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
`;

const ImageContainer = styled(motion.div)`
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px -15px rgba(2, 12, 27, 0.7);
  height: 300px;
  position: relative;
  
  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const Image = styled.div`
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const TextContainer = styled.div`
  flex: 1;
`;

const StatContainer = styled(motion.div)`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  margin-top: 2rem;
`;

const StatItem = styled(motion.div)`
  background: rgba(100, 255, 218, 0.1);
  border: 1px solid rgba(100, 255, 218, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
  flex: 1;
  min-width: 200px;
  text-align: center;
`;

const StatNumber = styled.h3`
  font-size: 2.5rem;
  font-weight: 700;
  color: #64ffda;
  margin-bottom: 0.5rem;
`;

const StatTitle = styled.p`
  font-size: 1rem;
  color: #a8b2d1;
`;

// 定义统计项的接口
interface StatItemType {
  number: string;
  title: string;
}

interface SectionProps {
  id: string;
  title: string;
  text: string;
  imageBg?: string;
  stats?: StatItemType[];
  reversed?: boolean;
  datasetInfo?: React.ReactNode;
}

// Custom hook for animations when element is in view
const Section: React.FC<SectionProps> = ({ id, title, text, imageBg = '', stats, reversed = false, datasetInfo }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <SectionContainer id={id} ref={ref}>
      <SectionContent style={{ flexDirection: reversed ? 'row-reverse' : 'row', justifyContent: !imageBg ? 'center' : 'space-between' }}>
        {imageBg && (
          <ImageContainer
            initial={{ opacity: 0, x: reversed ? 50 : -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: reversed ? 50 : -50 }}
            transition={{ duration: 0.8 }}
          >
            <Image style={{ backgroundImage: `url(${imageBg})` }} />
          </ImageContainer>
        )}
        
        <TextContainer>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </SectionTitle>
          
          <SectionText
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {text}
          </SectionText>
          
          {datasetInfo && (
            <DatasetInfoContainer
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {datasetInfo}
            </DatasetInfoContainer>
          )}
          
          {id === 'overview' && <DataOverview />}
          
          {stats && (
            <StatContainer
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {stats.map((stat, index) => (
                <StatItem key={index} variants={itemVariants}>
                  <StatNumber>{stat.number}</StatNumber>
                  <StatTitle>{stat.title}</StatTitle>
                </StatItem>
              ))}
            </StatContainer>
          )}
        </TextContainer>
      </SectionContent>
    </SectionContainer>
  );
};

const DatasetInfo: React.FC = () => {
  return (
    <>
      <DatasetTitle>数据集介绍</DatasetTitle>
      <DatasetDescription>
        <p>这是一个重建的数据集（Rebuilt-Data），源文件为 SIPRI-Milex-data-1948-2023.xlsx。</p>
        <p>这个大型文件更像是一个报告类型的数据集。直接导入使用会不可避免地出现许多错误，因此我们手动按大洲分割国家并简化了表格数据。1948-2023年的数据将放置在rebuild文件夹中，按大洲存储（甚至按地区，因为源文件特别将中东列为单独的部分）。</p>
        
        <h2>数据说明</h2>
        <ul>
          <li>第一列是国家名称，其余列代表该国从1948-2023年每年的军费支出（$）</li>
          <li>"..."表示位置，表示该国在那一年的军费支出未被记录，即NULL。这可以通过添加数据来处理，将来可以通过使用前几年记录的平均值来近似</li>
          <li>"xx"表示未记录，可以删除并处理为NULL或记录为0。在未来的实时变更操作中，保持前几列的数据不变，不进行更改或赋值</li>
        </ul>
        
        <h2>未来扩展</h2>
        <p>基于白宫发布的关于美国与其他国家之间贸易的详细信息：</p>
        <ul>
          <li>您将找到每个国家的相关信息，包括出口、进口和赤字（或盈余）</li>
          <li>版本2包括人口数据（如果有）。数据来源于 https://datahub.io/core/population</li>
        </ul>
      </DatasetDescription>
    </>
  );
};

const Sections: React.FC = () => {
  return (
    <>
      <Section
        id="overview"
        title="全球军事概述"
        text="我们的平台提供了全球军事力量的全面概述，包括各国军费支出、军事人员数量、武器装备等关键数据。通过我们的可视化工具，您可以直观地了解全球军事格局，比较不同国家和地区的军事实力，追踪军事发展趋势。"
        stats={[
          { number: "190+", title: "国家数据" },
          { number: "50+", title: "数据指标" },
          { number: "70年", title: "历史数据" }
        ]}
        datasetInfo={<DatasetInfo />}
      />
      
      <Section
        id="countries"
        title="国家军事数据"
        text="探索各个国家的详细军事数据，包括军事预算、兵力部署、武器系统和国防政策。我们的平台提供了超过190个国家的军事信息，让您能够深入了解每个国家的军事能力和战略重点。"
        imageBg="https://images.unsplash.com/photo-1521295121783-8a321d551ad2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
        reversed={true}
        stats={[
          { number: "20+", title: "军事指标" },
          { number: "实时", title: "数据更新" },
          { number: "详细", title: "国家分析" }
        ]}
      />
      
      <Section
        id="visualization"
        title="交互式数据可视化"
        text="我们的平台提供了先进的交互式数据可视化工具，让复杂的军事数据变得易于理解。通过动态图表、地图和比较工具，您可以自定义视图，探索数据关系，发现隐藏的趋势和模式。"
        imageBg="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
        stats={[
          { number: "10+", title: "可视化类型" },
          { number: "自定义", title: "数据筛选" },
          { number: "高清", title: "导出选项" }
        ]}
      />
      
      <Section
        id="about"
        title="关于我们"
        text="世界军事数据可视化平台致力于提供准确、全面、客观的军事数据。我们的团队由数据科学家、军事分析师和可视化专家组成，确保平台上的每一项数据都经过严格验证。我们的使命是通过数据透明度促进对全球安全环境的理解。"
        imageBg="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
        reversed={true}
        stats={[
          { number: "专业", title: "分析团队" },
          { number: "权威", title: "数据来源" },
          { number: "客观", title: "数据呈现" }
        ]}
      />
    </>
  );
};

export default Sections;
