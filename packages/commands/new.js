#!/usr/bin/env node

// node 内置模块
const path = require('path')
const fs = require('fs')
const exec = require('child_process').exec
const execSync = require('child_process').execSync

// 有颜色的 log
const chalk = require('chalk')
const log = require('../lib/log')
// 各种命令行询问
const prompt = require('../lib/prompt')

const addSubtree = require('./add.js')

// 修改新创建仓库的 package.json
const updatePackageJson = (createStdout, name, description, callback = () => {}) => {
  const getFileUrl = `https://${EAZE_CONFIG.domain}/api/v4/projects/${createStdout.id}/repository/files/package%2Ejson?ref=master`
  const getFileCmdStr = `curl --header "Authorization: Bearer ${EAZE_CONFIG['access_token']}" ${getFileUrl}`
  exec(getFileCmdStr, (err, getJsonStdout, stderr) => {
    if (!err) {
      const packageJson = JSON.parse(Buffer.from(JSON.parse(getJsonStdout).content, 'base64').toString())
      const newJson = {
        ...packageJson,
        name: `@dxy-toh/${name}`,
        description,
        main: `./dist/${name}.umd.min.js`,
        files: [
          `dist/${name}.umd.min.js`
        ],
        author: EAZE_CONFIG.username,
        repository: {
          type: 'git',
          url: createStdout.web_url
        },
        scripts: {
          ...packageJson.scripts,
          build: `vue-cli-service build --target lib --name ${name} index.js`
        }
      }
      const updateFileUrl = `https://${EAZE_CONFIG.domain}/api/v4/projects/${createStdout.id}/repository/files/package%2Ejson`
      const updateFileCmdStr = `curl --header 'Authorization: Bearer ${EAZE_CONFIG['access_token']}' ${updateFileUrl} --request PUT \
      --data "branch=master&content=${encodeURIComponent(JSON.stringify(newJson, null, 2))}&commit_message=update package.json" `
      exec(updateFileCmdStr, (err, updateJsonStdout, stderr) => {
        if (!JSON.parse(updateJsonStdout).branch) {
          log.warning('Failed to update package.json')
        } else {
          callback()
        }
      })
    }
  })
}

const gcomponent = (comName, options) => {
  prompt.newComponent(comName).then(res => {
    const { name, description } = res
    // fork 的仓库：https://gitlab.dxy.net/ZhuJingSi/toh-component-demo
    const forkId = 4444
    const url = `https://${EAZE_CONFIG.domain}/api/v4/projects/${forkId}/fork`
    const cmdStr = `curl --header "Authorization: Bearer ${EAZE_CONFIG['access_token']}" ${url} --request POST --data "name=${name}&path=${name}"`
    exec(cmdStr, (err, stdout, stderr) => {
      console.log('\r')
      if (!err) {
        if (JSON.parse(stdout).message) {
          log.error(`${name} ${JSON.parse(stdout).message.name[0]}`)
        } else {
          log.success(`repo of component: ${name}, created successfully!\n`)
  
          console.log(chalk.hex('#71bef2').bold(`gitlab url: `), JSON.parse(stdout).web_url)
          console.log(chalk.hex('#71bef2').bold(`ssh url: `), JSON.parse(stdout).ssh_url_to_repo, '\n')
  
          const callback = () => {
            if (options.local) {
              addSubtree(name)
            }
          }
          updatePackageJson(JSON.parse(stdout), name, description, callback)
        }
      }
    })
  })
}
module.exports = gcomponent