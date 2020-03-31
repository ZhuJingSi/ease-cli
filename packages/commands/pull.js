#!/usr/bin/env node

// node 内置模块
const exec = require('child_process').exec
const execSync = require('child_process').execSync

// 有颜色的 log
const log = require('../lib/log')

const pullSubtree = (name) => {
  const addPath = PROJECT_EAZE_CONFIG.componentDir || 'src/components'
  
  exec('git remote', (err, stdout, stderr) => {
    if (!stdout.includes(name)) {
      const ssh_url = `git@${EAZE_CONFIG.domain}:${encodeURIComponent(EAZE_CONFIG.namespace)}/${name}.git`
      execSync(`git remote add -f ${name} ${ssh_url}`)
    }
    /**
     * 拉取子项目远程更新
     * git subtree pull --prefix=<本地子项目目录> <远程库仓库地址 | 远程库别名> <分支> --squash
     */
    exec(`git subtree pull --prefix=${addPath}/${name} ${name} master --squash`, (err, stdout, stderr) => {
      if (err) {
        console.log(stderr)
      } else {
        log.info(`${name} is up to date`)
      }
    })
  })
}

module.exports = pullSubtree