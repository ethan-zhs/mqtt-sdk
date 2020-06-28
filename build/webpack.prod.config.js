const webpack = require('webpack')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const resolve = (...arg) => path.join(__dirname, '..', ...arg)

module.exports = {
    mode: 'production',
    entry: resolve('index.js'),
    output: {
        path: resolve('dist'),
        publicPath: '/dist/',
        filename: 'mqtt_sdk_[hash:8].js',
        library: 'mqttSdk',
        libraryTarget: 'umd', // 采用通用模块定义
        libraryExport: 'default' // 兼容 ES6 的模块系统、CommonJS 和 AMD 模块规范
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                use: ['babel-loader'],
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.js']
    },
    plugins: [

        // 限制code splitting不分片
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        }),

        new BundleAnalyzerPlugin()
    ],

    optimization: {
        splitChunks: {
            cacheGroups: {
                default: false
            }
        },
        runtimeChunk: false
    }
}
