import webpack from 'webpack'
import log from 'fancy-log'
import PluginError from 'plugin-error'
import notify from 'gulp-notify'
import { env } from '../config'

const webpackConfig = require('../../webpack.config').createConfig(env)

const handler = (err, stats, cb) => {
  const { errors } = stats.compilation

  if (err) throw new PluginError('webpack', err)

  if (errors.length > 0) {
    notify
      .onError({
        title: 'Webpack Error',
        message: '<%= error.message %>',
        sound: 'Submarine',
      })
      .call(null, errors[0])
  }

  log(
    '[webpack]',
    stats.toString({
      colors: true,
      chunks: false,
      errors: false,
    })
  )

  if (typeof cb === 'function') cb()
}

const webpackPromise = () =>
  new Promise(resolve => webpack(webpackConfig, (err, stats) => handler(err, stats, resolve)))
const webpackPromiseWatch = () =>
  new Promise(resolve =>
    webpack(webpackConfig).watch(
      {
        aggregateTimeout: 100,
        poll: false,
      },
      handler
    )
  )

const build = gulp => gulp.series(webpackPromise)
const watch = gulp => gulp.series(webpackPromiseWatch)
// const watch = gulp => () => gulp.watch(config.src.js + '/**/*', gulp.parallel('webpack', webpackPromise));

module.exports.build = build
module.exports.watch = watch
