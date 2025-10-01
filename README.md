# 中秋博饼（Vue 3 + Vite）

一个用于线上博饼的小站，支持多人轮流摇骰子、自动判定称号，并提供“什么是博饼”的知识介绍。全站红色喜庆风格，带中秋元素（明月、灯笼）。

## 开发运行

```bash
npm install
npm run dev
```

## 构建发布

```bash
npm run build
npm run preview
```

## 目录结构

- `src/router`：路由
- `src/views`：页面（首页、开始博饼、知识）
- `src/components`：组件（导航）
- `src/utils/bobing.js`：博饼判定逻辑

## 玩法说明（本站版本）

使用 6 枚骰子，按组合从高到低：状元插金花、六杯红、五子登科、状元（四红）、四进、对堂、三红、二举、一秀、无。
