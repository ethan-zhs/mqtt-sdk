const Koa = require('koa')
const webpack = require('webpack')
const e2k = require('express-to-koa')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const config = require('../build/webpack.config')

const port = 1234
const app = new Koa()
const compiler = webpack(config)

app.use(
    e2k(
        webpackDevMiddleware(compiler, {
            noInfo: true,
            publicPath: config.output.publicPath,
            hot: true,
            headers: { 'Access-Control-Allow-Origin': '*' }
        })
    )
)
app.use(e2k(webpackHotMiddleware(compiler)))

app.listen(port)

console.log('API Server is running on: http://localhost:%s', port)
