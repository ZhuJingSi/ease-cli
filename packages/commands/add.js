#!/usr/bin/env node

// node 内置模块
const fs = require('fs')
const exec = require('child_process').exec
const execSync = require('child_process').execSync

// 有颜色的 log
const log = require('../lib/log')
const { link } = require('../lib/common')

// 创建组件 src 目录和 index.js 的软链接
const addSoftLink = (fromPath, tarPath) => {
  if (fs.existsSync(tarPath)) {
    execSync(`rm -rf ${tarPath}`)
  }
  execSync(`mkdir ${tarPath}`)
  link(`${fromPath}/src`, tarPath)
  link(`${fromPath}/index.js`, `${tarPath}/index.js`)
}

const addSubtree = (name) => {
  const addPath = PROJECT_EAZE_CONFIG.componentDir || 'src/components'

  const ssh_url = `git@${EAZE_CONFIG.domain}:ZhuJingSi/${name}.git`
  exec('git remote', (err, stdout, stderr) => {
    /**
     * 添加子项目远程库
     * git remote add --fetch <远程库别名> <远程库仓库地址></远程库仓库地址>
     */
    if (!stdout.includes(name)) {
      execSync(`git remote add -f ${name} ${ssh_url}`)
    }
    /**
     * 拉取子项目到本地文件夹
     * git subtree add --prefix=<本地子项目目录> <远程库仓库地址 | 远程库别名> <分支> --squash
     */
    exec(`git subtree add --prefix=${addPath}/${name} ${name} master --squash`, (err, stdout, stderr) => {
      console.log('\r')
      if (err) {
        log.error(stderr)
      } else {
        log.success(`component added to "${addPath}/${name}" already`)

        // 将组件主要文件目录软连接到 packages 目录
        if (PROJECT_EAZE_CONFIG.softLinkDir) {
          const fromPath = `${addPath}/${name}/src`
          const tarPath = `${PROJECT_EAZE_CONFIG.softLinkDir}/${name}`
          addSoftLink(fromPath, tarPath)
        }
      }
    })
  })
}

module.exports = addSubtree