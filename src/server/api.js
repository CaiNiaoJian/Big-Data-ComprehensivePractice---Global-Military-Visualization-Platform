const express = require('express');
const cors = require('cors');
const db = require('../utils/database');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 路由：获取所有国家
app.get('/api/countries', async (req, res) => {
  try {
    const countries = await db.getAllCountries();
    res.json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: '获取国家数据失败' });
  }
});

// 路由：按大洲获取国家
app.get('/api/countries/continent/:continent', async (req, res) => {
  try {
    const { continent } = req.params;
    const countries = await db.getCountriesByContinent(continent);
    res.json(countries);
  } catch (error) {
    console.error('Error fetching countries by continent:', error);
    res.status(500).json({ error: '获取国家数据失败' });
  }
});

// 路由：获取特定国家的军费支出历史
app.get('/api/military-expenditure/country/:countryId', async (req, res) => {
  try {
    const { countryId } = req.params;
    const expenditure = await db.getMilitaryExpenditureByCountry(parseInt(countryId));
    res.json(expenditure);
  } catch (error) {
    console.error('Error fetching military expenditure by country:', error);
    res.status(500).json({ error: '获取军费支出数据失败' });
  }
});

// 路由：获取特定年份的军费支出数据
app.get('/api/military-expenditure/year/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const expenditure = await db.getMilitaryExpenditureByYear(parseInt(year));
    res.json(expenditure);
  } catch (error) {
    console.error('Error fetching military expenditure by year:', error);
    res.status(500).json({ error: '获取军费支出数据失败' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`API 服务器运行在端口 ${PORT}`);
});

// 处理进程终止信号，确保关闭数据库连接
process.on('SIGINT', async () => {
  console.log('关闭数据库连接并退出...');
  await db.closePool();
  process.exit(0);
});

module.exports = app;
