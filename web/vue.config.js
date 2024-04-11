const { defineConfig } = require('@vue/cli-service')
const isPro = process.env.NODE_ENV === 'production';
module.exports = defineConfig(() => {
  return {
    publicPath: isPro ? './' : '/',
    transpileDependencies: true,
    devServer: {
      hot: true,
      port: 8081,
    },
  }
})
