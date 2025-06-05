require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// 数据库连接配置
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// 数据目录
const DATA_DIR = path.join(__dirname, '../../public/data/data');

// 创建必要的表
async function createTables() {
  const client = await pool.connect();
  try {
    // 开始事务
    await client.query('BEGIN');

    // 创建国家表
    await client.query(`
      CREATE TABLE IF NOT EXISTS countries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        iso_code VARCHAR(3),
        latitude FLOAT,
        longitude FLOAT,
        continent VARCHAR(50)
      )
    `);

    // 创建军费支出表
    await client.query(`
      CREATE TABLE IF NOT EXISTS military_expenditure (
        id SERIAL PRIMARY KEY,
        country_id INTEGER REFERENCES countries(id),
        year INTEGER NOT NULL,
        expenditure FLOAT,
        UNIQUE(country_id, year)
      )
    `);

    // 提交事务
    await client.query('COMMIT');
    console.log('表创建成功');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('创建表失败:', error);
    throw error;
  } finally {
    client.release();
  }
}

// 导入国家元数据
async function importCountryMetadata() {
  const filePath = path.join(DATA_DIR, 'country_metadata.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 获取大洲数据，用于设置国家的大洲信息
    const continentMap = {};
    
    // 处理大洲数据文件
    const continentFiles = ['african.json', 'american.json', 'aisan.json', 'europen.json', 'easternasian.json', 'current_data.json'];
    for (const file of continentFiles) {
      const continentData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
      const continent = file.replace('.json', '');
      
      for (const item of continentData) {
        continentMap[item.Country] = continent;
      }
    }
    
    // 插入国家数据
    for (const [countryName, metadata] of Object.entries(data)) {
      const { iso_code, coordinates } = metadata;
      const continent = continentMap[countryName] || 'unknown';
      
      await client.query(
        'INSERT INTO countries (name, iso_code, latitude, longitude, continent) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (name) DO UPDATE SET iso_code = $2, latitude = $3, longitude = $4, continent = $5',
        [countryName, iso_code, coordinates.lat, coordinates.lon, continent]
      );
    }
    
    await client.query('COMMIT');
    console.log('国家元数据导入成功');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('导入国家元数据失败:', error);
    throw error;
  } finally {
    client.release();
  }
}

// 导入年度军费支出数据
async function importYearlyData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 获取所有国家的ID映射
    const { rows: countries } = await client.query('SELECT id, name FROM countries');
    const countryMap = {};
    countries.forEach(country => {
      countryMap[country.name] = country.id;
    });
    
    // 处理年度数据文件
    const yearFiles = fs.readdirSync(DATA_DIR).filter(file => file.startsWith('year_') && file.endsWith('.json'));
    
    for (const file of yearFiles) {
      const year = parseInt(file.replace('year_', '').replace('.json', ''));
      const yearData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
      
      console.log(`正在导入 ${year} 年数据...`);
      
      for (const item of yearData) {
        const countryId = countryMap[item.Country];
        
        if (countryId) {
          await client.query(
            'INSERT INTO military_expenditure (country_id, year, expenditure) VALUES ($1, $2, $3) ON CONFLICT (country_id, year) DO UPDATE SET expenditure = $3',
            [countryId, year, item.Expenditure]
          );
        } else {
          console.warn(`未找到国家: ${item.Country}`);
        }
      }
    }
    
    await client.query('COMMIT');
    console.log('年度军费支出数据导入成功');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('导入年度军费支出数据失败:', error);
    throw error;
  } finally {
    client.release();
  }
}

// 导入全部军费数据
async function importAllMilitaryData() {
  const filePath = path.join(DATA_DIR, 'all_military_data.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 获取所有国家的ID映射
    const { rows: countries } = await client.query('SELECT id, name FROM countries');
    const countryMap = {};
    countries.forEach(country => {
      countryMap[country.name] = country.id;
    });
    
    console.log('正在导入全部军费数据...');
    
    for (const item of data) {
      const countryId = countryMap[item.Country];
      
      if (countryId) {
        // 遍历每一年的数据
        for (const [yearStr, expenditure] of Object.entries(item)) {
          if (yearStr !== 'Country' && expenditure !== null && !isNaN(yearStr) && !isNaN(expenditure)) {
            const year = parseInt(yearStr);
            
            if (!isNaN(year)) {
              await client.query(
                'INSERT INTO military_expenditure (country_id, year, expenditure) VALUES ($1, $2, $3) ON CONFLICT (country_id, year) DO UPDATE SET expenditure = $3',
                [countryId, year, expenditure]
              );
            }
          }
        }
      } else {
        console.warn(`未找到国家: ${item.Country}`);
      }
    }
    
    await client.query('COMMIT');
    console.log('全部军费数据导入成功');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('导入全部军费数据失败:', error);
    throw error;
  } finally {
    client.release();
  }
}

// 创建索引以优化查询性能
async function createIndexes() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 国家名称索引
    await client.query('CREATE INDEX IF NOT EXISTS idx_countries_name ON countries(name)');
    
    // 国家大洲索引
    await client.query('CREATE INDEX IF NOT EXISTS idx_countries_continent ON countries(continent)');
    
    // 军费支出年份索引
    await client.query('CREATE INDEX IF NOT EXISTS idx_military_expenditure_year ON military_expenditure(year)');
    
    // 军费支出国家ID和年份复合索引
    await client.query('CREATE INDEX IF NOT EXISTS idx_military_expenditure_country_year ON military_expenditure(country_id, year)');
    
    await client.query('COMMIT');
    console.log('索引创建成功');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('创建索引失败:', error);
    throw error;
  } finally {
    client.release();
  }
}

// 创建视图以简化常用查询
async function createViews() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 创建军费支出视图，包含国家名称和大洲
    await client.query(`
      CREATE OR REPLACE VIEW military_expenditure_view AS
      SELECT 
        me.id,
        c.name AS country,
        c.continent,
        me.year,
        me.expenditure
      FROM 
        military_expenditure me
        JOIN countries c ON me.country_id = c.id
    `);
    
    // 创建大洲军费支出汇总视图
    await client.query(`
      CREATE OR REPLACE VIEW continent_expenditure_summary AS
      SELECT 
        c.continent,
        me.year,
        SUM(me.expenditure) AS total_expenditure,
        AVG(me.expenditure) AS avg_expenditure,
        COUNT(c.id) AS country_count
      FROM 
        military_expenditure me
        JOIN countries c ON me.country_id = c.id
      GROUP BY 
        c.continent, me.year
      ORDER BY 
        me.year, total_expenditure DESC
    `);
    
    await client.query('COMMIT');
    console.log('视图创建成功');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('创建视图失败:', error);
    throw error;
  } finally {
    client.release();
  }
}

// 主函数
async function main() {
  try {
    console.log('开始导入数据...');
    
    // 创建表
    await createTables();
    
    // 导入国家元数据
    await importCountryMetadata();
    
    // 导入年度数据
    await importYearlyData();
    
    // 导入全部军费数据
    await importAllMilitaryData();
    
    // 创建索引
    await createIndexes();
    
    // 创建视图
    await createViews();
    
    console.log('数据导入完成！');
    
    // 关闭连接池
    await pool.end();
  } catch (error) {
    console.error('导入过程中出错:', error);
    process.exit(1);
  }
}

// 执行主函数
main();
