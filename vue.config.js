// vue.config.js
module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/aya-draglayout/" : "/"
  // productionGzip: true,
  // productionGzipExtensions: ["js", "css"] failed
  // configureWebpack: config => {
  //   if (process.env.NODE_ENV === "production") {
  //     // 为生产环境修改配置
  //     config.
  //   } else {
  //     // 为开发环境修改配置
  //   }
  // }
};
