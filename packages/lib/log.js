// 给终端文字设置颜色
const chalk = require('chalk')
// 给终端加图标
const logSymbols = require('log-symbols')
const log = console.log

module.exports = {
  success: text => log(logSymbols.success, chalk.bold.green(text)),
  info: text => log(logSymbols.info, chalk.hex('#71bef2').bold(text)),
  warning: text => log(logSymbols.warning, chalk.bold.yellow(text)),
  error: text => log(logSymbols.error, chalk.bold.red(text)),
}