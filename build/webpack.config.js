const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const resolve = (...arg) => path.join(__dirname, '..', ...arg)

module.exports = {
    mode: 'development',
    devtool: 'cheap-module-eval-source-map',
    entry: ['webpack-hot-middleware/client?reload=true', resolve('index.js')],
    output: {
        path: resolve('dist'),
        publicPath: '/',
        filename: 'bundle.js',
        libraryTarget: 'umd',
        library: 'mqttSdk'
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true
                        }
                    }
                ],
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.js']
    },
    plugins: [
        // webpack热更新组件
        new webpack.HotModuleReplacementPlugin(),

        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: resolve('index.html'), // 模板路径
            inject: true, // js插入位置
            chunksSortMode: 'none',
            chunks: ['manifest', 'vendor', 'main'],
            hash: true
        })
    ]
}
