#!/usr/bin/env node

// node 内置模块
const fs = require('fs')
const exec = require('child_process').exec
const execSync = require('child_process').execSync

// 有颜色的 log
const log = require('../lib/log')

const dcomponent = (name, options) => {
  const addPath = PROJECT_EAZE_CONFIG.componentDir || 'src/components'
  const cpath = `${addPath}/${name}`

  // 删除子项目远程库
  exec('git remote', (err, stdout, stderr) => {
    if (stdout.includes(name)) {
      execSync(`git remote remove ${name}`)
    }
  })
  // 删除本地目录并提交 commit
  if (fs.existsSync(cpath)) {
    execSync(`rm -rf ${cpath}`)
    execSync(`git add ${cpath}/`)
    exec(`git commit -m "remove ${name}"`, err => {
      if (!err) {
        log.success(`local directory of component ${name} deleted successfully!`)
      }
    })
    // 删除软链
    if (PROJECT_EAZE_CONFIG.softLinkDir) {
      const tarPath = `${PROJECT_EAZE_CONFIG.softLinkDir}/${name}`
      exec(`rm -rf ${tarPath}`)
    }
  }
  if (name && options.remote) {
    const url = ` https://${EAZE_CONFIG.domain}/api/v4/projects/ZhuJingSi%2F${name}`
    const cmdStr = `curl --header "Authorization: Bearer ${EAZE_CONFIG['access_token']}" ${url} --request DELETE`
    exec(cmdStr, (err, stdout, stderr) => {
      // console.log(err, stdout, stderr)
      const message = JSON.parse(stdout).message
      if (message && !message.includes('202')) {
        log.error(JSON.parse(stdout).message)
      } else if (message) {
        log.success(`component ${name} deleted successfully!`)
      }
    })
  }
}
module.exports = dcomponent