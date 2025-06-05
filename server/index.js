const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.SERVER_PORT || 3001;

// 启用CORS
app.use(cors());
app.use(express.json());

// 创建数据库连接池
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// 测试数据库连接
app.get('/api/test-connection', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.json({ success: true, timestamp: result.rows[0].now });
  } catch (err) {
    console.error('数据库连接测试失败:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 获取所有大洲
app.get('/api/continents', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT continent
      FROM countries
      ORDER BY continent
    `;
    const result = await pool.query(query);
    res.json(result.rows.map(row => row.continent));
  } catch (err) {
    console.error('获取大洲列表失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// 获取特定大洲的国家
app.get('/api/countries/:continent', async (req, res) => {
  try {
    const { continent } = req.params;
    const query = `
      SELECT name, continent, iso_code
      FROM countries
      WHERE continent = $1
      ORDER BY name
    `;
    const result = await pool.query(query, [continent]);
    res.json(result.rows);
  } catch (err) {
    console.error('获取国家列表失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// 获取所有国家
app.get('/api/countries', async (req, res) => {
  try {
    const query = `
      SELECT name, continent, iso_code
      FROM countries
      ORDER BY name
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('获取国家列表失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// 获取指定年份的军费支出数据
app.get('/api/military-expenditure/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const query = `
      SELECT c.name as country, c.continent, me.expenditure
      FROM military_expenditure me
      JOIN countries c ON me.country_id = c.id
      WHERE me.year = $1
      ORDER BY c.name
    `;
    const result = await pool.query(query, [year]);
    res.json(result.rows);
  } catch (err) {
    console.error('获取军费支出数据失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// 获取指定年份的前N名军费支出国家
app.get('/api/top-expenditure/:year/:limit', async (req, res) => {
  try {
    const { year, limit } = req.params;
    const query = `
      SELECT c.name as country, c.continent, me.expenditure
      FROM military_expenditure me
      JOIN countries c ON me.country_id = c.id
      WHERE me.year = $1 AND me.expenditure IS NOT NULL
      ORDER BY me.expenditure DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [year, limit]);
    res.json(result.rows);
  } catch (err) {
    console.error('获取军费支出排名失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// 获取国家的军费支出时间序列
app.get('/api/country-expenditure/:countryName', async (req, res) => {
  try {
    const { countryName } = req.params;
    
    // 获取国家ID
    const countryQuery = `
      SELECT id FROM countries WHERE name = $1
    `;
    const countryResult = await pool.query(countryQuery, [countryName]);
    
    if (countryResult.rows.length === 0) {
      return res.status(404).json({ error: '未找到该国家' });
    }
    
    const countryId = countryResult.rows[0].id;
    
    // 获取军费支出数据
    const expenditureQuery = `
      SELECT year, expenditure
      FROM military_expenditure
      WHERE country_id = $1
      ORDER BY year
    `;
    const expenditureResult = await pool.query(expenditureQuery, [countryId]);
    
    // 构建时间序列数据
    const years = {};
    expenditureResult.rows.forEach(row => {
      years[row.year] = row.expenditure;
    });
    
    res.json({
      country: countryName,
      years
    });
  } catch (err) {
    console.error('获取国家军费支出时间序列失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// 获取国家在指定年份范围内的军费支出
app.get('/api/country-expenditure/:countryName/:startYear/:endYear', async (req, res) => {
  try {
    const { countryName, startYear, endYear } = req.params;
    
    const query = `
      SELECT me.year, me.expenditure
      FROM military_expenditure me
      JOIN countries c ON me.country_id = c.id
      WHERE c.name = $1 AND me.year >= $2 AND me.year <= $3
      ORDER BY me.year
    `;
    
    const result = await pool.query(query, [countryName, startYear, endYear]);
    res.json(result.rows);
  } catch (err) {
    console.error('获取国家年份范围军费支出失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// 获取军费支出增长率
app.get('/api/growth-rates/:startYear/:endYear/:limit', async (req, res) => {
  try {
    const { startYear, endYear, limit } = req.params;
    
    const query = `
      WITH start_year AS (
        SELECT c.id, c.name as country, me.expenditure as expenditure_start
        FROM military_expenditure me
        JOIN countries c ON me.country_id = c.id
        WHERE me.year = $1 AND me.expenditure > 0
      ),
      end_year AS (
        SELECT c.id, c.name as country, me.expenditure as expenditure_end
        FROM military_expenditure me
        JOIN countries c ON me.country_id = c.id
        WHERE me.year = $2 AND me.expenditure > 0
      )
      SELECT 
        s.country, 
        s.expenditure_start, 
        e.expenditure_end,
        ((e.expenditure_end - s.expenditure_start) / s.expenditure_start * 100) as growth_rate
      FROM start_year s
      JOIN end_year e ON s.id = e.id
      ORDER BY growth_rate DESC
      LIMIT $3
    `;
    
    const result = await pool.query(query, [startYear, endYear, limit]);
    res.json(result.rows);
  } catch (err) {
    console.error('获取军费支出增长率失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`API服务器运行在 http://localhost:${port}`);
});
