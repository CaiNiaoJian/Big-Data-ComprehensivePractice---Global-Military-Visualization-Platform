import dataService from './dataService';
import apiService from './apiService';

// 配置标志，决定是使用API服务还是 JSON 文件服务
const USE_DATABASE = false; // 设置为 true 使用API服务，false 使用 JSON 文件

// 定义接口
export interface Country {
  id: number;
  name: string;
  continent: string;
  region: string | null;
  code: string | null;
  population: number | null;
}

export interface MilitaryExpenditure {
  year: number;
  amount: number;
}

export interface YearlyExpenditure {
  name: string;
  continent: string;
  region: string | null;
  amount: number;
}

// API 客户端 - 可以使用API服务或本地JSON数据服务
const apiClient = {
  // 获取所有国家
  async getAllCountries(): Promise<Country[]> {
    try {
      if (USE_DATABASE) {
        // 使用API服务
        const apiCountries = await apiService.getAllCountries();
        return apiCountries.map((country: any) => ({
          id: 0, // API中没有直接暴露ID
          name: country.name,
          continent: country.continent,
          region: null,
          code: country.iso_code,
          population: null
        }));
      } else {
        // 使用JSON文件数据服务
        const countries = await dataService.getAllCountries();
        // 过滤掉continent为current_data的国家
        return countries.filter(country => country.continent !== 'current_data');
      }
    } catch (error) {
      console.error('获取国家列表失败:', error);
      throw error;
    }
  },

  // 按大洲获取国家
  async getCountriesByContinent(continent: string): Promise<Country[]> {
    try {
      if (USE_DATABASE) {
        // 使用API服务
        const continentCountries = await apiService.getCountriesByContinent(continent);
        return continentCountries.map((country: any) => ({
          id: 0, // API中没有直接暴露ID
          name: country.name,
          continent: country.continent,
          region: null,
          code: country.iso_code,
          population: null
        }));
      } else {
        // 使用JSON文件数据服务
        // 如果请求的就是current_data大洲，则返回空数组
        if (continent === 'current_data') {
          return [];
        }
        return await dataService.getCountriesByContinent(continent);
      }
    } catch (error) {
      console.error(`获取${continent}国家列表失败:`, error);
      throw error;
    }
  },

  // 获取特定国家的军费支出历史
  async getMilitaryExpenditureByCountry(countryId: number): Promise<MilitaryExpenditure[]> {
    try {
      if (USE_DATABASE) {
        // 首先需要从 ID 获取国家名称
        const countries = await this.getAllCountries();
        const country = countries.find(c => c.id === countryId);
        
        if (!country) {
          throw new Error(`未找到ID为${countryId}的国家`);
        }
        
        // 使用API服务获取该国家的时间序列数据
        const timeSeries = await apiService.getCountryExpenditureTimeSeries(country.name);
        if (!timeSeries) {
          return [];
        }
        
        // 转换为所需的格式
        return Object.entries(timeSeries.years)
          .filter(([_, value]) => value !== null)
          .map(([year, amount]) => ({
            year: parseInt(year),
            amount: amount as number
          }));
      } else {
        // 使用JSON文件数据服务
        return await dataService.getMilitaryExpenditureByCountry(countryId);
      }
    } catch (error) {
      console.error(`获取国家ID为${countryId}的军费支出历史失败:`, error);
      throw error;
    }
  },

  // 获取年度军费支出数据
  async getMilitaryExpenditureByYear(year: number): Promise<YearlyExpenditure[]> {
    try {
      if (USE_DATABASE) {
        // 使用API服务
        const expenditures = await apiService.getMilitaryExpenditureByYear(year);
        return expenditures.map((item: any) => ({
          name: item.country,
          continent: item.continent,
          region: null,
          amount: item.expenditure
        }));
      } else {
        // 使用JSON文件数据服务
        const data = await dataService.getMilitaryExpenditureByYear(year);
        // 过滤掉continent为current_data的数据
        return data.filter(item => item.continent !== 'current_data');
      }
    } catch (error) {
      console.error(`获取${year}年军费支出数据失败:`, error);
      throw error;
    }
  },

  // 获取指定年份的前 N 名军费支出国家
  async getTopMilitaryExpenditureByYear(year: number, limit: number = 10): Promise<YearlyExpenditure[]> {
    try {
      if (USE_DATABASE) {
        // 使用API服务
        const expenditures = await apiService.getTopMilitaryExpenditureByYear(year, limit);
        return expenditures.map((item: any) => ({
          name: item.country,
          continent: item.continent,
          region: null,
          amount: item.expenditure
        }));
      } else {
        // 使用JSON文件数据服务
        const allData = await dataService.getMilitaryExpenditureByYear(year);
        // 过滤掉continent为current_data的数据
        return allData
          .filter(item => item.continent !== 'current_data')
          .sort((a, b) => b.amount - a.amount)
          .slice(0, limit);
      }
    } catch (error) {
      console.error(`获取${year}年前${limit}名军费支出国家失败:`, error);
      throw error;
    }
  },

  // 获取指定国家在指定年份范围内的军费支出数据
  async getCountryExpenditureByYearRange(
    countryName: string, 
    startYear: number, 
    endYear: number
  ): Promise<{ year: number; expenditure: number }[]> {
    try {
      if (USE_DATABASE) {
        // 使用API服务
        return await apiService.getCountryExpenditureByYearRange(countryName, startYear, endYear);
      } else {
        // 使用JSON文件数据服务
        // 需要先获取国家ID
        const countries = await this.getAllCountries();
        const country = countries.find(c => c.name === countryName);
        
        if (!country) {
          throw new Error(`未找到名称为${countryName}的国家`);
        }
        
        const expenditures = await dataService.getMilitaryExpenditureByCountry(country.id);
        return expenditures
          .filter(item => item.year >= startYear && item.year <= endYear)
          .map(item => ({
            year: item.year,
            expenditure: item.amount
          }));
      }
    } catch (error) {
      console.error(`获取${countryName}在${startYear}-${endYear}年的军费支出数据失败:`, error);
      throw error;
    }
  },

  // 获取两个年份之间的军费支出增长率排名
  async getExpenditureGrowthRates(
    startYear: number, 
    endYear: number, 
    limit: number = 10
  ): Promise<{ country: string; expenditure_start: number; expenditure_end: number; growth_rate: number }[]> {
    try {
      if (USE_DATABASE) {
        // 使用API服务
        return await apiService.getExpenditureGrowthRates(startYear, endYear, limit);
      } else {
        // 使用JSON文件数据服务
        // 这个功能在JSON文件数据服务中比较复杂，这里简化实现
        const startYearData = await dataService.getMilitaryExpenditureByYear(startYear);
        const endYearData = await dataService.getMilitaryExpenditureByYear(endYear);
        
        // 过滤掉continent为current_data的数据
        const filteredStartYearData = startYearData.filter(item => item.continent !== 'current_data');
        const filteredEndYearData = endYearData.filter(item => item.continent !== 'current_data');
        
        const growthRates: { country: string; expenditure_start: number; expenditure_end: number; growth_rate: number }[] = [];
        
        // 计算增长率
        filteredStartYearData.forEach(startItem => {
          const endItem = filteredEndYearData.find(item => item.name === startItem.name);
          
          if (endItem && startItem.amount > 0) {
            const growthRate = ((endItem.amount - startItem.amount) / startItem.amount) * 100;
            growthRates.push({
              country: startItem.name,
              expenditure_start: startItem.amount,
              expenditure_end: endItem.amount,
              growth_rate: growthRate
            });
          }
        });
        
        // 排序并限制数量
        return growthRates
          .sort((a, b) => b.growth_rate - a.growth_rate)
          .slice(0, limit);
      }
    } catch (error) {
      console.error(`获取${startYear}-${endYear}年军费支出增长率排名失败:`, error);
      throw error;
    }
  }
};

export default apiClient;
