import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import api from '../services/api';
import { MilitaryExpenditure } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 引入的Country类型重命名为APICountry避免冲突
import { Country as APICountry } from '../services/api';

// 自定义国家类型
interface LocalCountry {
  id: number;
  name: string;
  continent: string;
  region: string | null;
  population: number;
}

// 国家详情类型
interface LocalCountryDetail extends LocalCountry {
  description?: string;
  governmentType?: string;
  capital?: string;
  area?: number;
  gdp?: number;
  militaryPersonnel?: number;
  flagUrl?: string;
}

// 国家代码映射
const countryCodeMap: Record<string, string> = {
  "United States": "us",
  "China": "cn",
  "Russia": "ru",
  "India": "in",
  "United Kingdom": "gb",
  "France": "fr",
  "Germany": "de",
  "Japan": "jp",
  "Brazil": "br",
  "South Korea": "kr",
  "Australia": "au",
  "Canada": "ca",
  "Italy": "it",
  "Israel": "il",
  "Spain": "es",
  "Taiwan of China": "cn"
};

// 样式组件
const PageContainer = styled.div`
  padding: 120px 2rem 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a192f 0%, #112240 100%);
  color: #e6f1ff;
`;

const SearchContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto 3rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1.5rem;
  font-size: 1.2rem;
  border-radius: 8px;
  border: 2px solid #233554;
  background: rgba(10, 25, 47, 0.7);
  color: #e6f1ff;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #64ffda;
    box-shadow: 0 0 15px rgba(100, 255, 218, 0.3);
  }
`;

const CountryList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const CountryCard = styled(motion.div)`
  background: rgba(17, 34, 64, 0.7);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  border: 1px solid #233554;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #64ffda;
    transform: translateY(-5px);
    box-shadow: 0 10px 30px -15px rgba(2, 12, 27, 0.7);
  }
`;

const CountryName = styled.h3`
  margin: 0 0 1rem;
  color: #e6f1ff;
  font-size: 1.2rem;
`;

const CountryInfo = styled.p`
  margin: 0.5rem 0;
  color: #8892b0;
  font-size: 0.9rem;
`;

const CountryDetailContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(17, 34, 64, 0.7);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px -15px rgba(2, 12, 27, 0.7);
  border: 1px solid #233554;
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const FlagContainer = styled.div`
  width: 200px;
  height: 120px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #233554;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    height: 150px;
  }
`;

const CountryTitle = styled.h1`
  margin: 0 0 1rem;
  color: #e6f1ff;
  font-size: 2.5rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CountryMeta = styled.div`
  flex: 1;
`;

const MetaItem = styled.div`
  margin-bottom: 0.5rem;
  color: #8892b0;
  
  span {
    color: #64ffda;
    margin-right: 0.5rem;
  }
`;

const SectionTitle = styled.h2`
  margin: 2rem 0 1rem;
  color: #e6f1ff;
  font-size: 1.5rem;
  position: relative;
  padding-left: 1rem;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #64ffda;
    border-radius: 4px;
  }
`;

const Description = styled.p`
  line-height: 1.7;
  color: #8892b0;
  margin-bottom: 2rem;
`;

const ChartContainer = styled.div`
  height: 400px;
  margin: 2rem 0;
  background: rgba(10, 25, 47, 0.5);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #233554;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
`;

const StatCard = styled.div`
  background: rgba(10, 25, 47, 0.5);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #233554;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #64ffda;
    transform: translateY(-5px);
    box-shadow: 0 10px 30px -15px rgba(2, 12, 27, 0.7);
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #64ffda;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #8892b0;
  font-size: 0.9rem;
`;

const BackButton = styled(motion.button)`
  background: transparent;
  border: 1px solid #64ffda;
  color: #64ffda;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(100, 255, 218, 0.1);
  }
`;

// 国家详细数据
const countryDetails: Record<string, Partial<LocalCountryDetail>> = {
  "United States": {
    description: "美国是世界上军费支出最高的国家，拥有世界上最强大的军事力量。美国军队由陆军、海军、空军、海军陆战队和太空军组成。美国的国防预算约占其GDP的3.7%。",
    governmentType: "联邦共和制",
    capital: "华盛顿特区",
    area: 9833517,
    gdp: 22675271,
    militaryPersonnel: 1388100
  },
  "China": {
    description: "中国拥有世界上最大的常备军，中国人民解放军由陆军、海军、空军、火箭军和战略支援部队组成。中国的国防预算约占其GDP的1.7%，但近年来一直在稳步增长。",
    governmentType: "社会主义共和制",
    capital: "北京",
    area: 9596961,
    gdp: 17963170,
    militaryPersonnel: 2035000
  },
  "Russia": {
    description: "俄罗斯继承了苏联的大部分军事能力，拥有世界上最大的核武器库。俄罗斯军队由陆军、海军、空军和战略火箭部队组成。俄罗斯的国防预算约占其GDP的4.3%。",
    governmentType: "联邦半总统制",
    capital: "莫斯科",
    area: 17098246,
    gdp: 1829050,
    militaryPersonnel: 900000
  },
  "India": {
    description: "印度拥有世界上第二大常备军，印度军队由陆军、海军和空军组成。印度是世界上最大的武器进口国之一，其国防预算约占GDP的2.4%。",
    governmentType: "联邦议会共和制",
    capital: "新德里",
    area: 3287263,
    gdp: 3534740,
    militaryPersonnel: 1455550
  },
  "United Kingdom": {
    description: "英国拥有全球部署能力的军事力量，英国军队由陆军、皇家海军和皇家空军组成。英国是北约的创始成员国，其国防预算约占GDP的2.2%。",
    governmentType: "君主立宪制",
    capital: "伦敦",
    area: 242495,
    gdp: 3198470,
    militaryPersonnel: 153290
  },
  "France": {
    description: "法国拥有强大的军事力量，包括核打击能力。法国军队由陆军、海军、空军和国家宪兵队组成。法国是北约的创始成员国，其国防预算约占GDP的2.1%。",
    governmentType: "半总统制共和国",
    capital: "巴黎",
    area: 551695,
    gdp: 2936700,
    militaryPersonnel: 203250
  },
  "Germany": {
    description: "德国联邦国防军由陆军、海军和空军组成。二战后，德国军队主要参与防御和国际维和任务。德国的国防预算约占GDP的1.4%，但近年来有所增加。",
    governmentType: "联邦议会共和制",
    capital: "柏林",
    area: 357022,
    gdp: 4256540,
    militaryPersonnel: 183500
  },
  "Japan": {
    description: "日本自卫队由陆上自卫队、海上自卫队和航空自卫队组成。根据日本宪法第9条，日本放弃了发动战争的权利，但保留了自卫权。日本的国防预算约占GDP的1%。",
    governmentType: "君主立宪制",
    capital: "东京",
    area: 377915,
    gdp: 5378136,
    militaryPersonnel: 247150
  },
  "Taiwan of China": {
    description: "中国台湾省",
    governmentType: "中国省级行政区",
    capital: "台北",
    area: 36193,
    gdp: 668200,
    militaryPersonnel: 163000
  }
};

// 主组件
const CountryPage: React.FC = () => {
  const [countries, setCountries] = useState<LocalCountry[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<LocalCountry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<LocalCountry | null>(null);
  const [countryExpenditures, setCountryExpenditures] = useState<MilitaryExpenditure[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 获取所有国家数据
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const allCountries = await api.getAllCountries();
        // 过滤掉大洲为 current_data 的国家
        const filteredData = allCountries.filter(country => country.continent !== 'current_data');
        // 将APICountry转换为LocalCountry
        const localCountries: LocalCountry[] = filteredData.map(country => ({
          id: country.id,
          name: country.name,
          continent: country.continent,
          region: country.region,
          population: country.population || 0 // 确保population不为null
        }));
        setCountries(localCountries);
        setFilteredCountries(localCountries);
        setLoading(false);
      } catch (error) {
        console.error('获取国家数据失败:', error);
        setLoading(false);
      }
    };
    
    fetchCountries();
  }, []);
  
  // 搜索过滤
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    
    if (!term.trim()) {
      // 确保在重置搜索时也不显示 current_data 的国家
      setFilteredCountries(countries.filter(country => country.continent !== 'current_data'));
      return;
    }
    
    const results = countries.filter(country => 
      (country.name.toLowerCase().includes(term.toLowerCase()) ||
      country.continent.toLowerCase().includes(term.toLowerCase())) &&
      country.continent !== 'current_data'
    );
    
    setFilteredCountries(results);
  };

  // 获取国家军费支出数据
  const fetchCountryExpenditures = async (countryId: number) => {
    try {
      const data = await api.getMilitaryExpenditureByCountry(countryId);
      setCountryExpenditures(data);
    } catch (error) {
      console.error(`获取国家ID ${countryId} 的军费支出数据失败:`, error);
      setCountryExpenditures([]);
    }
  };
  
  // 选择国家
  const handleSelectCountry = (country: LocalCountry) => {
    setSelectedCountry(country);
    fetchCountryExpenditures(country.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // 返回国家列表
  const handleBackToList = () => {
    setSelectedCountry(null);
    setCountryExpenditures([]);
  };
  
  // 格式化数字
  const formatNumber = (num: number | undefined, suffix: string = '') => {
    if (num === undefined) return 'N/A';
    return new Intl.NumberFormat('zh-CN').format(num) + suffix;
  };
  
  // 获取国家详情
  const getCountryDetail = (name: string): LocalCountryDetail | undefined => {
    // 尝试匹配精确名称
    if (countryDetails[name]) {
      return { ...selectedCountry!, ...countryDetails[name] };
    }
    
    // 尝试模糊匹配
    const keys = Object.keys(countryDetails);
    for (const key of keys) {
      if (name.includes(key) || key.includes(name)) {
        return { ...selectedCountry!, ...countryDetails[key] };
      }
    }
    
    // 返回默认值
    return selectedCountry ? {
      ...selectedCountry,
      description: `${name}是世界上的一个国家，拥有自己的军事力量和国防政策。`,
      flagUrl: "/data/flags/default.png"
    } : undefined;
  };
  
  // 渲染国家详情
  const renderCountryDetail = () => {
    if (!selectedCountry) return null;
    
    const detail = getCountryDetail(selectedCountry.name);
    if (!detail) return null;
    
    // 准备图表数据
    const chartData = countryExpenditures.map(item => ({
      year: item.year,
      expenditure: item.amount
    })).sort((a, b) => a.year - b.year);
    
    // 计算军费增长率
    let growthRate = 0;
    if (chartData.length >= 2) {
      const firstYear = chartData[0];
      const lastYear = chartData[chartData.length - 1];
      const years = lastYear.year - firstYear.year;
      if (years > 0) {
        growthRate = ((lastYear.expenditure / firstYear.expenditure) ** (1/years) - 1) * 100;
      }
    }
    
    // 获取最新军费数据
    const latestExpenditure = chartData.length > 0 ? 
      chartData[chartData.length - 1].expenditure : 0;
    
    return (
      <CountryDetailContainer
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <BackButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBackToList}
        >
          ← 返回国家列表
        </BackButton>
        
        <DetailHeader>
          <FlagContainer>
            <img 
              src={`https://flagcdn.com/w320/${countryCodeMap[detail.name]?.toLowerCase() || 'xx'}.png`} 
              alt={`${detail.name}国旗`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://flagcdn.com/w320/xx.png";
              }}
            />
          </FlagContainer>
          
          <CountryMeta>
            <CountryTitle>{detail.name}</CountryTitle>
            <MetaItem><span>大洲:</span> {detail.continent}</MetaItem>
            {detail.capital && <MetaItem><span>首都:</span> {detail.capital}</MetaItem>}
            {detail.governmentType && <MetaItem><span>政体:</span> {detail.governmentType}</MetaItem>}
            {detail.area && <MetaItem><span>面积:</span> {formatNumber(detail.area, ' km²')}</MetaItem>}
            {detail.population && <MetaItem><span>人口:</span> {formatNumber(detail.population)}</MetaItem>}
          </CountryMeta>
        </DetailHeader>
        
        <SectionTitle>国家概况</SectionTitle>
        <Description>{detail.description}</Description>
        
        <SectionTitle>军事数据</SectionTitle>
        
        <StatsContainer>
          <StatCard>
            <StatValue>{formatNumber(latestExpenditure, ' 百万美元')}</StatValue>
            <StatLabel>最新年度军费支出</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue>{growthRate.toFixed(2)}%</StatValue>
            <StatLabel>军费年均增长率</StatLabel>
          </StatCard>
          
          {detail.gdp && (
            <StatCard>
              <StatValue>{(latestExpenditure / detail.gdp * 100).toFixed(2)}%</StatValue>
              <StatLabel>军费占GDP比例</StatLabel>
            </StatCard>
          )}
          
          {detail.militaryPersonnel && (
            <StatCard>
              <StatValue>{formatNumber(detail.militaryPersonnel)}</StatValue>
              <StatLabel>军事人员数量</StatLabel>
            </StatCard>
          )}
        </StatsContainer>
        
        <SectionTitle>军费支出趋势 (百万美元)</SectionTitle>
        <ChartContainer>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#233554" />
                <XAxis 
                  dataKey="year" 
                  tick={{ fill: '#8892b0' }}
                  axisLine={{ stroke: '#233554' }}
                />
                <YAxis 
                  tick={{ fill: '#8892b0' }}
                  axisLine={{ stroke: '#233554' }}
                  tickFormatter={(value) => `${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${Number(value).toLocaleString()} 百万美元`, '军费支出']}
                  labelFormatter={(label: number) => `${label}年`}
                  contentStyle={{ 
                    background: 'rgba(10, 25, 47, 0.9)', 
                    border: '1px solid #233554',
                    color: '#e6f1ff'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenditure" 
                  stroke="#64ffda" 
                  strokeWidth={2}
                  dot={{ fill: '#64ffda', r: 4 }}
                  activeDot={{ fill: '#64ffda', r: 6, stroke: '#0a192f', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#8892b0'
            }}>
              暂无军费支出数据
            </div>
          )}
        </ChartContainer>
      </CountryDetailContainer>
    );
  };
  
  // 渲染国家列表
  const renderCountryList = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{ 
              width: '50px', 
              height: '50px', 
              border: '3px solid #233554', 
              borderTop: '3px solid #64ffda', 
              borderRadius: '50%',
              margin: '0 auto'
            }}
          />
          <p style={{ marginTop: '1rem', color: '#8892b0' }}>加载中...</p>
        </div>
      );
    }
    
    if (filteredCountries.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#8892b0' }}>
          没有找到匹配的国家
        </div>
      );
    }
    
    return (
      <CountryList>
        {filteredCountries.map((country) => (
          <CountryCard
            key={country.id}
            onClick={() => handleSelectCountry(country)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CountryName>{country.name}</CountryName>
            <CountryInfo><strong>大洲:</strong> {country.continent}</CountryInfo>
            {country.region && <CountryInfo><strong>地区:</strong> {country.region}</CountryInfo>}
            {country.population && <CountryInfo><strong>人口:</strong> {formatNumber(country.population)}</CountryInfo>}
          </CountryCard>
        ))}
      </CountryList>
    );
  };
  
  return (
    <PageContainer>
      {!selectedCountry ? (
        <SearchContainer>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ 
              textAlign: 'center', 
              marginBottom: '2rem',
              fontSize: '2.5rem',
              color: '#e6f1ff'
            }}
          >
            世界国家军事数据库
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SearchInput
              type="text"
              placeholder="搜索国家或大洲..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </motion.div>
          
          {renderCountryList()}
        </SearchContainer>
      ) : (
        renderCountryDetail()
      )}
    </PageContainer>
  );
};

export default CountryPage;
