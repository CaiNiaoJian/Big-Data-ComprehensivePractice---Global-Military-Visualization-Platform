import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const PageContainer = styled.div`
  min-height: 100vh;
  padding: 6rem 2rem 2rem;
  background-color: #0a192f;
  color: #e6f1ff;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled(motion.h2)`
  font-size: 2rem;
  color: #64ffda;
  margin-bottom: 1.5rem;
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #64ffda;
    opacity: 0.5;
  }
`;

const Card = styled(motion.div)`
  background-color: #112240;
  border-radius: 10px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px -15px rgba(2, 12, 27, 0.7);
`;

const Paragraph = styled.p`
  line-height: 1.8;
  margin-bottom: 1.5rem;
  color: #8892b0;
  font-size: 1.1rem;
`;

const TechStackContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 2rem 0;
`;

const TechItem = styled(motion.div)`
  background-color: #172a45;
  color: #64ffda;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TimelineContainer = styled.div`
  position: relative;
  margin: 2rem 0;
  padding-left: 2rem;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: #64ffda;
    opacity: 0.5;
  }
`;

const TimelineItem = styled.div`
  position: relative;
  margin-bottom: 2rem;
  
  &::before {
    content: '';
    position: absolute;
    left: -2.5rem;
    top: 0.5rem;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background-color: #64ffda;
  }
`;

const TimelineDate = styled.div`
  font-weight: bold;
  color: #64ffda;
  margin-bottom: 0.5rem;
`;

const TimelineContent = styled.div`
  color: #8892b0;
`;

const AboutPage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
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
  
  const techStack = [
    { name: "React", icon: "⚛️" },
    { name: "TypeScript", icon: "🔷" },
    { name: "Styled Components", icon: "💅" },
    { name: "Framer Motion", icon: "🔄" },
    { name: "Recharts", icon: "📊" },
    { name: "Three.js", icon: "🌐" },
    { name: "React Router", icon: "🔀" },
    { name: "AMap API", icon: "🗺️" },
    { name: "Firebase", icon: "🔥" }
  ];
  
  return (
    <PageContainer>
      <ContentContainer>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <SectionTitle variants={itemVariants}>关于本项目</SectionTitle>
          <Card variants={itemVariants}>
            <Paragraph>
              <strong>世界军事数据可视化平台</strong>是一个综合性的军事数据分析与可视化系统，旨在通过直观、交互式的方式展示全球军事力量分布、军费支出趋势以及未来军事发展预测。本平台整合了来自多个权威数据源的军事信息，包括各国军费支出、军事人员数量、武器装备情况以及地缘政治影响等维度。
            </Paragraph>
            <Paragraph>
              平台特色在于多维度数据展示与分析，用户可以通过交互式地图、动态图表、3D地球仪等多种可视化方式，全方位了解世界军事格局。特别是在未来军事发展预测板块，我们提供了基线预测、高紧张度情景和和平发展情景三种模拟，并支持按国家、大洲和军事联盟等不同维度查看预测数据，帮助用户深入理解全球军事发展趋势。
            </Paragraph>
            <Paragraph>
              本平台不仅面向军事研究人员、政策制定者，也为对国际关系和军事发展感兴趣的普通用户提供了易于理解的数据可视化界面。通过这一平台，我们希望促进对全球军事格局的客观认识，为相关研究和决策提供数据支持。
            </Paragraph>
          </Card>
          
          <SectionTitle variants={itemVariants}>技术栈</SectionTitle>
          <Card variants={itemVariants}>
            <Paragraph>
              本项目采用现代前端技术栈开发，以下是主要使用的技术和工具：
            </Paragraph>
            <TechStackContainer>
              {techStack.map((tech, index) => (
                <TechItem 
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{tech.icon}</span> {tech.name}
                </TechItem>
              ))}
            </TechStackContainer>
            <Paragraph>
              <strong>核心技术亮点：</strong>
            </Paragraph>
            <ul>
              <li>使用 React 和 TypeScript 构建高性能、类型安全的前端应用</li>
              <li>采用 Styled Components 实现组件级样式隔离和主题管理</li>
              <li>通过 Framer Motion 实现流畅的页面过渡和组件动画效果</li>
              <li>利用 Recharts 创建交互式数据可视化图表，支持平滑曲线和多维度数据展示</li>
              <li>整合 Three.js 实现 3D 地球仪展示全球军事力量分布</li>
              <li>接入高德地图 API 实现中国地区的详细军事数据展示</li>
              <li>使用 Firebase 作为后端服务，提供数据存储和实时更新功能</li>
            </ul>
          </Card>
          
          <SectionTitle variants={itemVariants}>工程路线</SectionTitle>
          <Card variants={itemVariants}>
            <TimelineContainer>
              <TimelineItem>
                <TimelineDate>第一阶段：基础架构搭建（2024年1月 - 2月）</TimelineDate>
                <TimelineContent>
                  <ul>
                    <li>项目初始化与技术选型</li>
                    <li>搭建基础组件库与路由系统</li>
                    <li>设计整体UI风格与交互模式</li>
                    <li>实现导航栏、页面布局等基础组件</li>
                  </ul>
                </TimelineContent>
              </TimelineItem>
              
              <TimelineItem>
                <TimelineDate>第二阶段：核心功能开发（2024年3月 - 4月）</TimelineDate>
                <TimelineContent>
                  <ul>
                    <li>实现军费支出趋势分析图表</li>
                    <li>开发3D地球仪展示全球军事力量分布</li>
                    <li>集成高德地图API，实现区域军事数据展示</li>
                    <li>构建国家详情页面，展示各国军事数据</li>
                  </ul>
                </TimelineContent>
              </TimelineItem>
              
              <TimelineItem>
                <TimelineDate>第三阶段：数据模型与预测（2024年5月）</TimelineDate>
                <TimelineContent>
                  <ul>
                    <li>设计未来军事发展预测模型</li>
                    <li>实现三种预测情景：基线预测、高紧张度、和平发展</li>
                    <li>开发多维度数据视图：国家、大洲、军事联盟</li>
                    <li>添加置信区间显示功能</li>
                  </ul>
                </TimelineContent>
              </TimelineItem>
              
              <TimelineItem>
                <TimelineDate>第四阶段：优化与完善（2024年6月）</TimelineDate>
                <TimelineContent>
                  <ul>
                    <li>优化数据可视化效果，实现平滑曲线时间序列</li>
                    <li>增强用户交互体验，添加动画效果</li>
                    <li>完善项目文档与About页面</li>
                    <li>性能优化与代码重构</li>
                  </ul>
                </TimelineContent>
              </TimelineItem>
              
              <TimelineItem>
                <TimelineDate>未来计划（2024年下半年）</TimelineDate>
                <TimelineContent>
                  <ul>
                    <li>添加用户账户系统，支持个性化设置与数据保存</li>
                    <li>开发更复杂的军事数据分析模型</li>
                    <li>增加更多历史数据与预测维度</li>
                    <li>优化移动端体验，实现全平台适配</li>
                  </ul>
                </TimelineContent>
              </TimelineItem>
            </TimelineContainer>
          </Card>
          
          <SectionTitle variants={itemVariants}>数据来源</SectionTitle>
          <Card variants={itemVariants}>
            <Paragraph>
              本平台使用的数据来源于多个权威机构和研究组织，包括但不限于：
            </Paragraph>
            <ul>
              <li>斯德哥尔摩国际和平研究所（SIPRI）</li>
              <li>国际战略研究所（IISS）</li>
              <li>世界银行（World Bank）</li>
              <li>北约官方统计数据（NATO Official Statistics）</li>
              <li>各国国防部公开数据</li>
              <li>联合国相关机构发布的军事数据</li>
            </ul>
            <Paragraph>
              所有数据均经过严格筛选和处理，确保准确性和时效性。未来军事发展预测基于历史数据趋势分析和专业机构预测模型，提供多种情景以供参考，但不代表官方立场。
            </Paragraph>
          </Card>
          
          <SectionTitle variants={itemVariants}>联系我们</SectionTitle>
          <Card variants={itemVariants}>
            <Paragraph>
              如果您对本项目有任何建议、问题或合作意向，欢迎通过以下方式联系我们：
            </Paragraph>
            <ul>
              <li>邮箱：contact@militaryvisualization.org</li>
              <li>GitHub：github.com/military-data-visualization</li>
              <li>微信公众号：世界军事数据</li>
            </ul>
            <Paragraph>
              我们非常重视您的反馈，将不断完善平台功能和数据质量，为用户提供更好的服务。
            </Paragraph>
          </Card>
        </motion.div>
      </ContentContainer>
    </PageContainer>
  );
};

export default AboutPage;
