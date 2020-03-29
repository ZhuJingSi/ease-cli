#!/usr/bin/env node

const os = require('os')
const fs = require('fs')
const program = require('commander')

// 有颜色的 log
const log = require('../packages/lib/log.js')

// 子命令文件
const config = require('../packages/commands/config.js')
const login = require('../packages/commands/login.js')
const logout = require('../packages/commands/logout.js')
const addSubtree = require('../packages/commands/add.js')
const gcomponent = require('../packages/commands/new.js')
const pushSubtree = require('../packages/commands/push.js')
const pullSubtree = require('../packages/commands/pull.js')
const dcomponent = require('../packages/commands/delete.js')

/**
 * ease 的配置文件分两种
 * 1. ～/.easerc：全局配置文件，保存 ez login 输入的账号密码等敏感信息，所有项目通用
 * 2. 各项目 package.json 中 ease 字段定义的一些项目个性化配置
 */
const { getGlobalConfig, getProjectEaseConfig } = require('../packages/lib/common')
// 1. 全局配置文件如果存在则读取
const globalConfig = getGlobalConfig()
const username = globalConfig.username || ''
// 2. 项目配置文件
getProjectEaseConfig()

program
  .version('0.0.1', '-v, --version')
	.usage('<command> [options]')
  .description('toH 业务组件管理 cli')

/**
 * 当 .command() 带有描述参数时，不能采用 .action(callback) 来处理子命令，否则会出错。
 * 这告诉 commander，你将采用单独的可执行文件作为子命令。
 * Commander 将会尝试在入口脚本（例如 ./bin/ease）的目录中搜索 program-command 形式的可执行文件
 * 例如 ease-new, ease-login
 * 
 * 所以这里所有命令的描述都拎出来用 .description() 定义
 */
program
  .command('config [key] [value]')
  .description('set ease config，or you can also edit ~/.easerc directly')
  .alias('c')
  .action(() => {
    config(process.argv.slice(3))
  })

program
  .command('login')
  .description('login GitLab')
  .action(() => {
    login(() => log.success(`Already logged in as ${username}`))
  })

program
  .command('logout')
  .description('logout GitLab')
  .action(() => {
    logout()
  })

program
  .command('new [component-name]')
  .description('create a component')
  .option('-l, --local', 'Also create local component dir')
  .action((name, options) => {
    login(() => gcomponent(name, options))
  })

program
  .command('add <component-name>')
  .description('pull component from remote to local as subtree')
  .action(name => {
    addSubtree(name)
  })

program
  .command('push <component-name>')
  .description('push subtree component to remote')
  .action(name => {
    pushSubtree(name)
  })

program
  .command('pull <component-name>')
  .description('pull subtree component from remote')
  .action(name => {
    pullSubtree(name)
  })
  
program
  .command('delete <component-name>')
  .description('delete a component')
  .alias('d')
  .option('-r, --remote', 'Also delete remote repository')
  .action((name, options) => {
    login(() => dcomponent(name, options))
  })
  
program.parse(process.argv)

// let commandName = program.args[0]
// if (!commandName) {
//   program.help()
//   return
// }