#!/usr/bin/env node

// 各种命令行询问
const { writeRc } = require('../lib/common')
const login = require('./login.js')

const logout = () => {
  writeRc({}, ['username', 'password', 'access_token', 'token_type', 'refresh_token', 'scope', 'created_at'], () => {
    login()
  })
}


module.exports = logout