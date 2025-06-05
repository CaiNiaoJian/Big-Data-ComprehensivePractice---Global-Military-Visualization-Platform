// API服务 - 与后端API服务器通信
const API_BASE_URL = 'http://localhost:3001/api';

// 定义类型
export interface CountryData {
  name: string;
  continent: string;
  iso_code: string;
}

export interface ExpenditureData {
  country: string;
  continent: string;
  expenditure: number;
}

export interface YearlyExpenditureData {
  year: number;
  expenditure: number;
}

export interface TimeSeriesData {
  country: string;
  years: { [year: string]: number | null };
}

export interface GrowthRateData {
  country: string;
  expenditure_start: number;
  expenditure_end: number;
  growth_rate: number;
}

// API服务
const apiService = {
  // 测试连接
  async testConnection(): Promise<{ success: boolean; timestamp?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-connection`);
      return await response.json();
    } catch (error) {
      console.error('API连接测试失败:', error);
      return { success: false, error: String(error) };
    }
  },

  // 获取所有大洲
  async getAllContinents(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/continents`);
      return await response.json();
    } catch (error) {
      console.error('获取大洲列表失败:', error);
      return [];
    }
  },

  // 获取所有国家
  async getAllCountries(): Promise<CountryData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/countries`);
      return await response.json();
    } catch (error) {
      console.error('获取国家列表失败:', error);
      return [];
    }
  },

  // 按大洲获取国家
  async getCountriesByContinent(continent: string): Promise<CountryData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/countries/${encodeURIComponent(continent)}`);
      return await response.json();
    } catch (error) {
      console.error(`获取${continent}国家列表失败:`, error);
      return [];
    }
  },

  // 获取指定年份的军费支出数据
  async getMilitaryExpenditureByYear(year: number): Promise<ExpenditureData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/military-expenditure/${year}`);
      return await response.json();
    } catch (error) {
      console.error(`获取${year}年军费支出数据失败:`, error);
      return [];
    }
  },

  // 获取指定年份的前N名军费支出国家
  async getTopMilitaryExpenditureByYear(year: number, limit: number = 10): Promise<ExpenditureData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/top-expenditure/${year}/${limit}`);
      return await response.json();
    } catch (error) {
      console.error(`获取${year}年前${limit}名军费支出国家失败:`, error);
      return [];
    }
  },

  // 获取国家的军费支出时间序列
  async getCountryExpenditureTimeSeries(countryName: string): Promise<TimeSeriesData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/country-expenditure/${encodeURIComponent(countryName)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`获取${countryName}军费支出时间序列失败:`, error);
      return null;
    }
  },

  // 获取国家在指定年份范围内的军费支出数据
  async getCountryExpenditureByYearRange(
    countryName: string, 
    startYear: number, 
    endYear: number
  ): Promise<YearlyExpenditureData[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/country-expenditure/${encodeURIComponent(countryName)}/${startYear}/${endYear}`
      );
      return await response.json();
    } catch (error) {
      console.error(`获取${countryName}在${startYear}-${endYear}年的军费支出数据失败:`, error);
      return [];
    }
  },

  // 获取两个年份之间的军费支出增长率排名
  async getExpenditureGrowthRates(
    startYear: number, 
    endYear: number, 
    limit: number = 10
  ): Promise<GrowthRateData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/growth-rates/${startYear}/${endYear}/${limit}`);
      return await response.json();
    } catch (error) {
      console.error(`获取${startYear}-${endYear}年军费支出增长率排名失败:`, error);
      return [];
    }
  }
};

export default apiService;
