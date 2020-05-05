#!/usr/bin/env node

// node 内置模块
const path = require('path')
const fs = require('fs')
const exec = require('child_process').exec
const execSync = require('child_process').execSync
const _ = require('lodash/object')

// 有颜色的 log
const chalk = require('chalk')
const log = require('../lib/log')
const ora = require('ora')
const spinner = ora({
  spinner: 'runner'
})
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
          `dist/${name}.umd.min.js`,
          `dist/${name}.css`
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

// 修改新创建仓库的简介
const updateDescription = (createStdout, description, callback = () => {}) => {
  const url = `https://${EAZE_CONFIG.domain}/api/v4/projects/${createStdout.id}`
  const cmdStr = `curl --header 'Authorization: Bearer ${EAZE_CONFIG['access_token']}' \
    ${url} --request PUT --data "description=${description}" `
  exec(cmdStr, (err, stdout, stderr) => {
    if (!err) {
      callback()
    }
  })
}

// 删除 fork 关系
const deleteForkRelationship = (createStdout, callback = () => {}) => {
  const url = `https://${EAZE_CONFIG.domain}/api/v4/projects/${createStdout.id}/fork`
  const cmdStr = `curl --header 'Authorization: Bearer ${EAZE_CONFIG['access_token']}' \
    ${url} --request DELETE`
  exec(cmdStr, (err, stdout, stderr) => {
    if (!err) {
      callback()
    }
  })
}

const newComponent = (comName, options) => {
  prompt.newComponent(comName).then(res => {
    const { name, description } = res
    // fork 的源仓库地址：https://gitlab.dxy.net/f2e/toh/toh-component-demo
    const forkId = 4579
    const url = `https://${EAZE_CONFIG.domain}/api/v4/projects/${forkId}/fork`
    const cmdStr = `curl --header "Authorization: Bearer ${EAZE_CONFIG['access_token']}" ${url} \
      --request POST --data "name=${name}&path=${name}&namespace=${encodeURIComponent(EAZE_CONFIG.namespace)}"`
    
    console.log('\r')
    spinner.start('Creating')

    exec(cmdStr, (err, stdout, stderr) => {
      if (!err) {
        if (JSON.parse(stdout).message) {
          spinner.fail(chalk.bold.red(`${name} ${_.get(JSON.parse(stdout), 'message.name[0]', JSON.parse(stdout).message)}`))
        } else {
          const callback = () => {
            if (options.local) {
              addSubtree(name)
            }
          }
          setTimeout(() => {
            updatePackageJson(JSON.parse(stdout), name, description, () => {
              updateDescription(JSON.parse(stdout), description, () => {
                deleteForkRelationship(JSON.parse(stdout), () => {
                  spinner.succeed(chalk.bold.green(`repo of component: ${name}, created successfully!\n`))
                  console.log(chalk.hex('#71bef2').bold(`gitlab url: `), JSON.parse(stdout).web_url)
                  console.log(chalk.hex('#71bef2').bold(`ssh url: `), JSON.parse(stdout).ssh_url_to_repo, '\n')
                  callback()
                })
              })
            })
          }, 2000)
        }
      }
    })
  })
}

const newProject = (projectName) => {
  prompt.newProject(projectName).then(res => {
    const { name, namespace, description } = res
    // fork 的源仓库地址：https://gitlab.dxy.net/f2e/toh/toh-vue-template
    const forkId = 4636
    const url = `https://${EAZE_CONFIG.domain}/api/v4/projects/${forkId}/fork`
    const cmdStr = `curl --header "Authorization: Bearer ${EAZE_CONFIG['access_token']}" ${url} \
      --request POST --data "name=${name}&path=${name}&namespace=${encodeURIComponent(namespace)}"`
    console.log('\r')
    spinner.start('Creating')

    exec(cmdStr, (err, stdout, stderr) => {
      if (!err) {
        if (JSON.parse(stdout).message) {
          spinner.fail(chalk.bold.red(`${name} ${_.get(JSON.parse(stdout), 'message.name[0]', JSON.parse(stdout).message)}`))
        } else {
          setTimeout(() => {
            updateDescription(JSON.parse(stdout), description, () => {
              deleteForkRelationship(JSON.parse(stdout), () => {
                spinner.succeed(chalk.bold.green(`repo of project: ${name}, created successfully!\n`))
                console.log(chalk.hex('#71bef2').bold(`gitlab url: `), JSON.parse(stdout).web_url)
                console.log(chalk.hex('#71bef2').bold(`ssh url: `), JSON.parse(stdout).ssh_url_to_repo, '\n')
              })
            })
          }, 1000)
        }
      }
    })
  })
}
module.exports = {
  newComponent,
  newProject
}