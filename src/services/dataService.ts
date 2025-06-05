import { Country, MilitaryExpenditure, YearlyExpenditure } from './api';

// 定义更详细的接口
export interface CountryMetadata {
  iso_code: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}

export interface CountryMilitaryData {
  Country: string;
  Continent?: string;
  [year: string]: string | number | null | undefined;
}

export interface YearData {
  Country: string;
  Continent: string;
  Expenditure: number;
}

// 数据服务类
class DataService {
  // 加载国家元数据
  async getCountryMetadata(): Promise<Record<string, CountryMetadata>> {
    try {
      const response = await fetch('/data/data/country_metadata.json');
      return await response.json();
    } catch (error) {
      console.error('获取国家元数据失败:', error);
      return {};
    }
  }

  // 加载所有军事数据
  async getAllMilitaryData(): Promise<CountryMilitaryData[]> {
    try {
      const response = await fetch('/data/data/all_military_data.json');
      return await response.json();
    } catch (error) {
      console.error('获取所有军事数据失败:', error);
      return [];
    }
  }

  // 加载特定大洲的军事数据
  async getContinentMilitaryData(continent: string): Promise<CountryMilitaryData[]> {
    try {
      const response = await fetch(`/data/data/${continent.toLowerCase()}.json`);
      return await response.json();
    } catch (error) {
      console.error(`获取${continent}军事数据失败:`, error);
      return [];
    }
  }

  // 加载特定年份的军事数据
  async getYearMilitaryData(year: number): Promise<YearData[]> {
    try {
      const response = await fetch(`/data/data/year_${year}.json`);
      return await response.json();
    } catch (error) {
      console.error(`获取${year}年军事数据失败:`, error);
      return [];
    }
  }

  // 获取所有国家列表
  async getAllCountries(): Promise<Country[]> {
    try {
      const militaryData = await this.getAllMilitaryData();
      const metadata = await this.getCountryMetadata();
      
      return militaryData.map((country, index) => {
        const countryName = country.Country;
        const countryMeta = metadata[countryName] || { iso_code: '', coordinates: { lat: 0, lon: 0 } };
        
        return {
          id: index + 1,
          name: countryName,
          continent: this.getContinentForCountry(country),
          region: null, // 数据中没有区域信息
          code: countryMeta.iso_code,
          population: null // 数据中没有人口信息
        };
      });
    } catch (error) {
      console.error('获取国家列表失败:', error);
      return [];
    }
  }

  // 按大洲获取国家列表
  async getCountriesByContinent(continent: string): Promise<Country[]> {
    try {
      const continentData = await this.getContinentMilitaryData(continent);
      const metadata = await this.getCountryMetadata();
      
      return continentData.map((country, index) => {
        const countryName = country.Country;
        const countryMeta = metadata[countryName] || { iso_code: '', coordinates: { lat: 0, lon: 0 } };
        
        return {
          id: index + 1,
          name: countryName,
          continent: continent,
          region: null,
          code: countryMeta.iso_code,
          population: null
        };
      });
    } catch (error) {
      console.error(`获取${continent}国家列表失败:`, error);
      return [];
    }
  }

  // 获取特定国家的军费支出历史
  async getMilitaryExpenditureByCountry(countryId: number): Promise<MilitaryExpenditure[]> {
    try {
      const countries = await this.getAllCountries();
      const country = countries.find(c => c.id === countryId);
      
      if (!country) {
        throw new Error(`未找到ID为${countryId}的国家`);
      }
      
      const allData = await this.getAllMilitaryData();
      const countryData = allData.find(c => c.Country === country.name);
      
      if (!countryData) {
        return [];
      }
      
      const expenditures: MilitaryExpenditure[] = [];
      
      // 遍历所有年份的数据
      for (let year = 1960; year <= 2022; year++) {
        const yearKey = year.toString();
        const amount = countryData[yearKey];
        
        if (amount !== null && amount !== undefined) {
          expenditures.push({
            year,
            amount: typeof amount === 'number' ? amount : 0
          });
        }
      }
      
      return expenditures;
    } catch (error) {
      console.error('获取国家军费支出历史失败:', error);
      return [];
    }
  }

  // 获取特定年份的军费支出数据
  async getMilitaryExpenditureByYear(year: number): Promise<YearlyExpenditure[]> {
    try {
      const yearData = await this.getYearMilitaryData(year);
      
      return yearData.map(item => ({
        name: item.Country,
        continent: item.Continent,
        region: null,
        amount: item.Expenditure
      }));
    } catch (error) {
      console.error(`获取${year}年军费支出数据失败:`, error);
      return [];
    }
  }

  // 辅助方法：确定国家所属的大洲
  private getContinentForCountry(countryData: CountryMilitaryData): string {
    if (countryData.Continent) {
      return countryData.Continent;
    }
    
    // 如果没有明确指定大洲，尝试从其他数据推断
    return 'unknown';
  }
}

const dataService = new DataService();
export default dataService;
