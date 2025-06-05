require('dotenv').config();
const { Pool } = require('pg');

// 数据库连接配置
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// 测试查询函数
async function runTestQueries() {
  const client = await pool.connect();
  try {
    console.log('===== 数据库导入验证 =====');
    
    // 1. 检查国家数量
    const countryCount = await client.query('SELECT COUNT(*) FROM countries');
    console.log(`数据库中的国家总数: ${countryCount.rows[0].count}`);
    
    // 2. 检查军费支出记录数量
    const expenditureCount = await client.query('SELECT COUNT(*) FROM military_expenditure');
    console.log(`军费支出记录总数: ${expenditureCount.rows[0].count}`);
    
    // 3. 按大洲统计国家数量
    const continentStats = await client.query(`
      SELECT continent, COUNT(*) as country_count 
      FROM countries 
      GROUP BY continent 
      ORDER BY country_count DESC
    `);
    console.log('\n各大洲国家数量:');
    continentStats.rows.forEach(row => {
      console.log(`${row.continent}: ${row.country_count} 个国家`);
    });
    
    // 4. 查询2022年军费支出前10名国家
    const top10Countries2022 = await client.query(`
      SELECT c.name, c.continent, me.expenditure
      FROM military_expenditure me
      JOIN countries c ON me.country_id = c.id
      WHERE me.year = 2022
      ORDER BY me.expenditure DESC
      LIMIT 10
    `);
    console.log('\n2022年军费支出前10名国家:');
    top10Countries2022.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name} (${row.continent}): ${row.expenditure} 百万美元`);
    });
    
    // 5. 查询2022年各大洲军费支出总额
    const continentExpenditures = await client.query(`
      SELECT c.continent, SUM(me.expenditure) as total_expenditure
      FROM military_expenditure me
      JOIN countries c ON me.country_id = c.id
      WHERE me.year = 2022
      GROUP BY c.continent
      ORDER BY total_expenditure DESC
    `);
    console.log('\n2022年各大洲军费支出总额:');
    continentExpenditures.rows.forEach(row => {
      console.log(`${row.continent}: ${row.total_expenditure.toFixed(2)} 百万美元`);
    });
    
    // 6. 查询美国2000-2022年军费支出趋势
    const usExpenditures = await client.query(`
      SELECT me.year, me.expenditure
      FROM military_expenditure me
      JOIN countries c ON me.country_id = c.id
      WHERE c.name = 'United States of America' AND me.year BETWEEN 2000 AND 2022
      ORDER BY me.year
    `);
    console.log('\n美国2000-2022年军费支出趋势:');
    usExpenditures.rows.forEach(row => {
      console.log(`${row.year}: ${row.expenditure.toFixed(2)} 百万美元`);
    });
    
    // 7. 使用视图查询2022年各大洲军费支出汇总
    const continentSummary = await client.query(`
      SELECT *
      FROM continent_expenditure_summary
      WHERE year = 2022
      ORDER BY total_expenditure DESC
    `);
    console.log('\n2022年各大洲军费支出汇总 (使用视图):');
    continentSummary.rows.forEach(row => {
      console.log(`${row.continent}: 总支出 ${row.total_expenditure.toFixed(2)} 百万美元, 平均支出 ${row.avg_expenditure.toFixed(2)} 百万美元, 国家数量: ${row.country_count}`);
    });
    
    // 8. 计算2021-2022年军费支出增长率最高的10个国家
    const growthRates = await client.query(`
      WITH expenditure_2021 AS (
        SELECT c.name, me.expenditure
        FROM military_expenditure me
        JOIN countries c ON me.country_id = c.id
        WHERE me.year = 2021
      ),
      expenditure_2022 AS (
        SELECT c.name, me.expenditure
        FROM military_expenditure me
        JOIN countries c ON me.country_id = c.id
        WHERE me.year = 2022
      )
      SELECT 
        e22.name,
        e21.expenditure as expenditure_2021,
        e22.expenditure as expenditure_2022,
        ((e22.expenditure - e21.expenditure) / e21.expenditure) * 100 as growth_rate
      FROM expenditure_2022 e22
      JOIN expenditure_2021 e21 ON e22.name = e21.name
      WHERE e21.expenditure > 0 AND e22.expenditure > 0
      ORDER BY growth_rate DESC
      LIMIT 10
    `);
    console.log('\n2021-2022年军费支出增长率最高的10个国家:');
    growthRates.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name}: ${row.growth_rate}% (从 ${row.expenditure_2021.toFixed(2)} 到 ${row.expenditure_2022.toFixed(2)} 百万美元)`);
    });
    
  } catch (error) {
    console.error('查询执行失败:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// 执行测试查询
runTestQueries();
