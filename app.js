const Server = require('./start.js')
const port = (process.env.PORT || 5000)
const app = Server.app()

var session = require("express-session"),
    bodyParser = require("body-parser");
    var passport = require('passport');

if (process.env.NODE_ENV !== 'production') {
  const webpack = require('webpack')
  const webpackDevMiddleware = require('webpack-dev-middleware')
  const webpackHotMiddleware = require('webpack-hot-middleware')
  const config = require('./webpack.config.js')
  const compiler = webpack(config)

  app.use(webpackHotMiddleware(compiler))
  app.use(webpackDevMiddleware(compiler, {
    noInfo: false,
    publicPath: config.output.publicPathdist
  }))
}

app.use(session({ secret: "cats" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());


app.listen(port)
console.log(`Listening at http://localhost:${port}`)
