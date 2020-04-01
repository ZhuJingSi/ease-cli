// node 内置模块
const os = require('os')
const path = require('path')
const fs = require('fs')
const exec = require('child_process').exec
const execSync = require('child_process').execSync
const configFile = `${os.homedir()}/.easerc`

// 有颜色的 log
const log = require('../lib/log')

// 将信息写入 .easerc
const writeRc = (data = {}, deleteKey = [], callback = () => {}) => {
  let oldData = {}
  if (fs.existsSync(configFile)) {
    oldData = fs.readFileSync(configFile, 'utf8') &&
      JSON.parse(fs.readFileSync(configFile, 'utf8')) || {}
  }
  const newData = {
    ...oldData,
    ...data
  }
  for (let key of deleteKey) {
    delete newData[key]
  }

  fs.writeFile(configFile, JSON.stringify(newData, null, 2), error => {
    if (!error) {
      EAZE_CONFIG = newData
      log.info(`Configuration saved in ${configFile}`)
      callback()
    }
  })
}

// 获取全局配置
getGlobalConfig = () => {
  if (fs.existsSync(configFile)) {
    const config = fs.readFileSync(configFile, 'utf8') &&
      JSON.parse(fs.readFileSync(configFile, 'utf8')) || {}
    EAZE_CONFIG = config
    return config
  }
  EAZE_CONFIG = {}
  return EAZE_CONFIG
}

// 获取项目 ease 配置
const getProjectEaseConfig = () => {
  const packageJsonPath = path.resolve('package.json')
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    const easeConfig = packageJson.ease || {}
    PROJECT_EAZE_CONFIG = easeConfig
    return easeConfig
  }
  PROJECT_EAZE_CONFIG = {}
  return PROJECT_EAZE_CONFIG
}

// 软链接目录或文件
const link = (sourcePath, targetPath, cb = () => {}) => {
  exec(`ln -s ${path.resolve(sourcePath)} ${targetPath}`, (err, stdout, stderr) => {
    if (err) {
      console.log(stderr)
    } else {
      log.success(`link ${sourcePath} to ${targetPath}`)
      cb()
    }
  })
}

module.exports = {
  writeRc,
  getGlobalConfig,
  getProjectEaseConfig,
  link
}