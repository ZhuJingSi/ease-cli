const path = require('path')
// 命令行交互
const inquirer = require('inquirer')
// autocomplete 插件
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
// 给终端加图标
const logSymbols = require('log-symbols')
// 给终端文字设置颜色
const chalk = require('chalk')
const execSync = require("child_process").execSync
// 有颜色的 log
const log = require('./log')

// 各种询问
module.exports = {
  // 获取用户 GitLab 账号密码
  login: () => {
    log.info('Please log in to your gitlab account')
    return inquirer.prompt([{
      type: 'input',
      message: 'gitlab domain name',
      name: 'domain',
      default: 'gitlab.dxy.net'
    }, {
      type: 'input',
      message: 'gitlab namespace path to store components',
      name: 'namespace',
      default: 'f2e/toh'
    }, {
      type: 'input',
      message: 'username',
      name: 'username',
      default: execSync('git config user.name', {
        encoding: 'utf8'
      }).replace(/[\r\n]/g, '')
    }, {
      type: 'password',
      message: 'password',
      name: 'password'
    }]).then(answer => {
      return answer
    })
  },
  // 创建新组件，输入组件信息
  newComponent: (name) => {
    log.info('Please enter component information')
    return inquirer.prompt([{
      type: 'input',
      message: 'component name',
      name: 'name',
      default: name,
      validate(input) {
        return !!input || 'Name is required!'
      }
    }, {
      type: 'input',
      message: 'component description',
      name: 'description'
    }]).then(answer => {
      return answer
    })
  },
  // 创建新项目，输入项目信息
  newProject: (name) => {
    log.info('Please enter project information')
    return inquirer.prompt([{
      type: 'input',
      message: 'project name',
      name: 'name',
      default: name,
      validate(input) {
        return !!input || 'Name is required!'
      }
    }, {
      type: 'input',
      message: 'project namespace path',
      name: 'namespace',
      default: 'f2e'
    }, {
      type: 'input',
      message: 'project description',
      name: 'description'
    }]).then(answer => {
      return answer
    })
  },
  // 删除项目
  deleteProject: (name) => {
    log.info('Please enter the information of the project to be deleted')
    return inquirer.prompt([{
      type: 'input',
      message: 'project name',
      name: 'name',
      default: name,
      validate(input) {
        return !!input || 'Name is required!'
      }
    }, {
      type: 'input',
      message: 'project namespace path',
      name: 'namespace',
      default: 'f2e'
    }]).then(answer => {
      return answer
    })
  },
  // 是否
  confirm: title => {
    return inquirer.prompt([ { 
      type: 'confirm', 
      name: 'confirm', 
      message: title, 
      default: true 
    }]).then(answer => {
      return answer
    })
  }
}