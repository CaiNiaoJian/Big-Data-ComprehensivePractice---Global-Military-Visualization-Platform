const db = require('./database');

async function testConnection() {
  try {
    // 测试数据库连接
    console.log('测试数据库连接...');
    await db.executeQuery('SELECT NOW()');
    console.log('数据库连接成功！');

    // 创建表
    console.log('创建军事数据表...');
    await db.createMilitaryDataTables();

    // 插入一些测试数据
    console.log('插入测试数据...');
    const china = await db.insertCountry('中国', '亚洲', '东亚', 'CN', 1400000000);
    const usa = await db.insertCountry('美国', '北美洲', '北美', 'US', 330000000);
    const russia = await db.insertCountry('俄罗斯', '欧洲', '东欧', 'RU', 145000000);

    // 插入军费支出数据
    await db.insertMilitaryExpenditure(china.id, 2020, 252000000000);
    await db.insertMilitaryExpenditure(china.id, 2021, 270000000000);
    await db.insertMilitaryExpenditure(china.id, 2022, 292000000000);
    
    await db.insertMilitaryExpenditure(usa.id, 2020, 778000000000);
    await db.insertMilitaryExpenditure(usa.id, 2021, 801000000000);
    await db.insertMilitaryExpenditure(usa.id, 2022, 877000000000);
    
    await db.insertMilitaryExpenditure(russia.id, 2020, 61700000000);
    await db.insertMilitaryExpenditure(russia.id, 2021, 65900000000);
    await db.insertMilitaryExpenditure(russia.id, 2022, 86400000000);

    // 查询数据
    console.log('查询所有国家...');
    const countries = await db.getAllCountries();
    console.log('国家列表:', countries);

    console.log('查询2022年军费支出...');
    const expenditure2022 = await db.getMilitaryExpenditureByYear(2022);
    console.log('2022年军费支出:', expenditure2022);

    console.log('查询中国军费支出历史...');
    const chinaExpenditure = await db.getMilitaryExpenditureByCountry(china.id);
    console.log('中国军费支出历史:', chinaExpenditure);

    console.log('测试完成！');
  } catch (error) {
    console.error('测试过程中出错:', error);
  } finally {
    // 关闭连接池
    await db.closePool();
  }
}

// 运行测试
testConnection();
