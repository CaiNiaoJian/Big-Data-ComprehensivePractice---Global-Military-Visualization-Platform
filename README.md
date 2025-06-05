# 世界军事数据可视化平台

## 项目介绍

世界军事数据可视化平台是一个综合性的军事数据分析与可视化系统，旨在通过直观、交互式的方式展示全球军事力量分布、军费支出趋势以及未来军事发展预测。本平台整合了来自多个权威数据源的军事信息，包括各国军费支出、军事人员数量、武器装备情况以及地缘政治影响等维度。

平台特色在于多维度数据展示与分析，用户可以通过交互式地图、动态图表、3D地球仪等多种可视化方式，全方位了解世界军事格局。特别是在未来军事发展预测板块，我们提供了基线预测、高紧张度情景和和平发展情景三种模拟，并支持按国家、大洲和军事联盟等不同维度查看预测数据，帮助用户深入理解全球军事发展趋势。

## 技术栈

本项目采用现代前端技术栈开发，主要使用的技术和工具包括：

- **React** ⚛️ - 用于构建用户界面的 JavaScript 库
- **TypeScript** 🔷 - 添加静态类型定义的 JavaScript 超集
- **Styled Components** 💅 - 组件级样式隔离和主题管理
- **Framer Motion** 🔄 - 实现流畅的页面过渡和组件动画效果
- **Recharts** 📊 - 创建交互式数据可视化图表
- **Three.js** 🌐 - 实现 3D 地球仪展示全球军事力量分布
- **React Router** 🔀 - 前端路由管理
- **AMap API** 🗺️ - 高德地图 API，实现中国地区的详细军事数据展示
- **Firebase** 🔥 - 后端服务，提供数据存储和实时更新功能

## 功能特点

- **全球军事力量分布** - 通过 3D 地球仪和交互式地图展示全球军事力量分布
- **军费支出趋势分析** - 动态图表展示各国军费支出历史数据和趋势
- **未来军事发展预测** - 提供三种预测情景：基线预测、高紧张度情景和和平发展情景
- **多维度数据视图** - 支持按国家、大洲和军事联盟等不同维度查看数据
- **详细国家军事数据** - 展示各国详细的军事数据，包括军费支出、军事人员数量、武器装备情况等

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
```

构建文件将生成在 `build` 目录中。

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
