/* eslint no-console: 0 */
const packager = require('electron-packager')
const del = require('del')
const promisify = require('tiny-promisify')
const webpack = require('webpack')
const cfg = require('../webpack.config.production.js')
const pkg = require('../package.json')
const electronPkg = require('../node_modules/electron/package.json')

const packageP = promisify(packager)
const webpackP = promisify(webpack)

const ignored = [
  '/test($|/)',
  '/bin($|/)',
  '/release*',
  '/mockup*'
]
const devModules = Object.keys(pkg.devDependencies).map((name) => '/node_modules/' + name + '($|/)')
const packOptions = {
  dir: './',
  name: 'HypheBrowser',
  asar: true,
  ignore: ignored.concat(devModules), // include runtime deps
  icon: 'app/icon/icon',
  version: electronPkg.version
}

const targets = [
  {
    name: 'Linux-32bit',
    platform: 'linux',
    arch: 'ia32'
  },
  {
    name: 'Linux-64bit',
    platform: 'linux',
    arch: 'x64'
  },
  {
    name: 'Windows-32bit',
    platform: 'win32',
    arch: 'ia32'
  },
  {
    name: 'Windows-64bit',
    platform: 'win32',
    arch: 'x64'
  },
  {
    name: 'MacOSX',
    platform: 'darwin',
    arch: 'x64'
  }
]

console.log('Building packages…')
webpackP(cfg)
.then(() => del('release'))
.then(() => packageAll())
.then(() => console.log('Packages built successfully!'))
.catch((err) => {
  console.error(err)
  process.exit(1)
})

function packageAll () {
  return Promise.all(targets.map((target) => {
    return packageP(Object.assign({}, packOptions, {
      platform: target.platform,
      arch: target.arch,
      prune: true,
      out: 'release/' + target.name
    }))
  }))
}
