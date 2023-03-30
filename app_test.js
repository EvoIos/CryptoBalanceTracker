const express = require('express');
const app = express();
const balanceRoutes = require('./balanceRoutes');

// 其他代码

// 在 app.js 中使用 balanceRoutes 模块
app.use(balanceRoutes);

// 其他代码
const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
