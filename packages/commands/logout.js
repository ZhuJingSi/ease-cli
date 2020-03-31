#!/usr/bin/env node

// 各种命令行询问
const { writeRc } = require('../lib/common')
// 有颜色的 log
const log = require('../lib/log')

const logout = () => {
  writeRc({}, ['domain', 'namespace', 'username', 'password',
  'access_token', 'token_type', 'refresh_token', 'scope',
  'created_at'], () => {
    log.success('Logout successfully! login again with "ease login"')
  })
}


module.exports = logout