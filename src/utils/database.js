const { Pool } = require('pg');
require('dotenv').config();

// 创建连接池而不是单个客户端，以便更好地管理连接
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  // 添加额外的连接配置
  max: 20, // 连接池中最大连接数
  idleTimeoutMillis: 30000, // 连接在被释放之前可以闲置的毫秒数
  connectionTimeoutMillis: 2000, // 连接超时时间
});

// 连接事件处理
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * 执行SQL查询
 * @param {string} query - SQL查询语句
 * @param {Array} params - 查询参数
 * @returns {Promise<Array>} - 查询结果
 */
const executeQuery = async (query, params = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error executing query', error.stack);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * 创建军事数据表
 */
const createMilitaryDataTables = async () => {
  // 创建国家表
  const createCountriesTable = `
    CREATE TABLE IF NOT EXISTS countries (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      continent VARCHAR(50) NOT NULL,
      region VARCHAR(50),
      code VARCHAR(10),
      population BIGINT
    );
  `;

  // 创建军费支出表
  const createMilitaryExpenditureTable = `
    CREATE TABLE IF NOT EXISTS military_expenditure (
      id SERIAL PRIMARY KEY,
      country_id INTEGER REFERENCES countries(id),
      year INTEGER NOT NULL,
      amount DECIMAL(15, 2),
      UNIQUE(country_id, year)
    );
  `;

  // 创建贸易数据表
  const createTradeDataTable = `
    CREATE TABLE IF NOT EXISTS trade_data (
      id SERIAL PRIMARY KEY,
      country_id INTEGER REFERENCES countries(id),
      year INTEGER NOT NULL,
      exports DECIMAL(15, 2),
      imports DECIMAL(15, 2),
      balance DECIMAL(15, 2),
      UNIQUE(country_id, year)
    );
  `;

  try {
    await executeQuery(createCountriesTable);
    await executeQuery(createMilitaryExpenditureTable);
    await executeQuery(createTradeDataTable);
    console.log('Military data tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

/**
 * 插入国家数据
 * @param {string} name - 国家名称
 * @param {string} continent - 大洲
 * @param {string} region - 地区
 * @param {string} code - 国家代码
 * @param {number} population - 人口数量
 * @returns {Promise<Object>} - 插入的国家数据
 */
const insertCountry = async (name, continent, region = null, code = null, population = null) => {
  const query = `
    INSERT INTO countries (name, continent, region, code, population)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (name) DO UPDATE
    SET continent = $2, region = $3, code = $4, population = $5
    RETURNING *
  `;
  const values = [name, continent, region, code, population];
  const result = await executeQuery(query, values);
  return result[0];
};

/**
 * 插入军费支出数据
 * @param {number} countryId - 国家ID
 * @param {number} year - 年份
 * @param {number} amount - 金额
 * @returns {Promise<Object>} - 插入的军费支出数据
 */
const insertMilitaryExpenditure = async (countryId, year, amount) => {
  const query = `
    INSERT INTO military_expenditure (country_id, year, amount)
    VALUES ($1, $2, $3)
    ON CONFLICT (country_id, year) DO UPDATE
    SET amount = $3
    RETURNING *
  `;
  const values = [countryId, year, amount];
  const result = await executeQuery(query, values);
  return result[0];
};

/**
 * 获取所有国家
 * @returns {Promise<Array>} - 国家列表
 */
const getAllCountries = async () => {
  const query = 'SELECT * FROM countries ORDER BY name';
  return await executeQuery(query);
};

/**
 * 获取特定大洲的国家
 * @param {string} continent - 大洲名称
 * @returns {Promise<Array>} - 国家列表
 */
const getCountriesByContinent = async (continent) => {
  const query = 'SELECT * FROM countries WHERE continent = $1 ORDER BY name';
  return await executeQuery(query, [continent]);
};

/**
 * 获取国家的军费支出历史
 * @param {number} countryId - 国家ID
 * @returns {Promise<Array>} - 军费支出历史
 */
const getMilitaryExpenditureByCountry = async (countryId) => {
  const query = `
    SELECT me.year, me.amount
    FROM military_expenditure me
    WHERE me.country_id = $1
    ORDER BY me.year
  `;
  return await executeQuery(query, [countryId]);
};

/**
 * 获取特定年份所有国家的军费支出
 * @param {number} year - 年份
 * @returns {Promise<Array>} - 军费支出数据
 */
const getMilitaryExpenditureByYear = async (year) => {
  const query = `
    SELECT c.name, c.continent, c.region, me.amount
    FROM countries c
    JOIN military_expenditure me ON c.id = me.country_id
    WHERE me.year = $1
    ORDER BY me.amount DESC
  `;
  return await executeQuery(query, [year]);
};

/**
 * 关闭数据库连接池
 */
const closePool = async () => {
  await pool.end();
  console.log('Connection pool has been closed');
};

module.exports = {
  executeQuery,
  createMilitaryDataTables,
  insertCountry,
  insertMilitaryExpenditure,
  getAllCountries,
  getCountriesByContinent,
  getMilitaryExpenditureByCountry,
  getMilitaryExpenditureByYear,
  closePool
};
