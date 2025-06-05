// 数据类型定义 - 仅用于类型兼容性
// 注意：此文件不包含实际的数据库连接代码，仅用于类型定义

// 类型定义
export interface MilitaryExpenditure {
  country: string;
  continent: string;
  expenditure: number;
}

export interface CountryMetadata {
  name: string;
  iso_code: string;
  latitude: number;
  longitude: number;
  continent: string;
}

export interface ExpenditureTimeSeries {
  country: string;
  years: { [year: string]: number | null };
}

export interface ContinentSummary {
  continent: string;
  year: number;
  total_expenditure: number;
  avg_expenditure: number;
  country_count: number;
}

// 创建空的实现，这些函数实际上应该通过API调用后端服务器
// 这里只是为了类型兼容性而保留的空实现

// 获取指定年份的军费支出数据
export async function getMilitaryExpenditureByYear(_year: number): Promise<MilitaryExpenditure[]> {
  console.warn('警告：此函数仅为类型兼容性而存在，不应直接调用');
  return [];
}

// 获取指定国家的军费支出时间序列数据
export async function getCountryExpenditureTimeSeries(_countryName: string): Promise<ExpenditureTimeSeries | null> {
  console.warn('警告：此函数仅为类型兼容性而存在，不应直接调用');
  return null;
}

// 获取指定大洲的国家列表
export async function getCountriesByContinent(_continent: string): Promise<CountryMetadata[]> {
  console.warn('警告：此函数仅为类型兼容性而存在，不应直接调用');
  return [];
}

// 获取所有大洲列表
export async function getAllContinents(): Promise<string[]> {
  console.warn('警告：此函数仅为类型兼容性而存在，不应直接调用');
  return [];
}

// 获取指定年份的大洲军费支出汇总
export async function getContinentExpenditureSummary(_year: number): Promise<ContinentSummary[]> {
  console.warn('警告：此函数仅为类型兼容性而存在，不应直接调用');
  return [];
}

// 获取指定年份军费支出前N名国家
export async function getTopCountriesByExpenditure(_year: number, _limit: number = 10): Promise<MilitaryExpenditure[]> {
  console.warn('警告：此函数仅为类型兼容性而存在，不应直接调用');
  return [];
}

// 获取两个年份之间的军费支出增长率排名
export async function getExpenditureGrowthRates(_startYear: number, _endYear: number, _limit: number = 10): Promise<any[]> {
  console.warn('警告：此函数仅为类型兼容性而存在，不应直接调用');
  return [];
}

// 获取指定国家在指定年份范围内的军费支出数据
export async function getCountryExpenditureByYearRange(
  _countryName: string, 
  _startYear: number, 
  _endYear: number
): Promise<{ year: number; expenditure: number }[]> {
  console.warn('警告：此函数仅为类型兼容性而存在，不应直接调用');
  return [];
}

// 默认导出所有函数
const dbService = {
  getMilitaryExpenditureByYear,
  getCountryExpenditureTimeSeries,
  getCountriesByContinent,
  getAllContinents,
  getContinentExpenditureSummary,
  getTopCountriesByExpenditure,
  getExpenditureGrowthRates,
  getCountryExpenditureByYearRange
};

export default dbService;
