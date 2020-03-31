#!/usr/bin/env node

// node 内置模块
const exec = require('child_process').exec

// 有颜色的 log
const log = require('../lib/log')

// 各种命令行询问
const prompt = require('../lib/prompt')
const { writeRc } = require('../lib/common')
const logout = require('./logout.js')

// 获取 token
const requestToken = (domain, username = '', password = '', callback = () => {}) => {
  const authProps = `grant_type=password&username=${username}&password=${password}`
  const url = `https://${EAZE_CONFIG.domain || domain}/oauth/token`
  const cmdStr = `curl --data "${authProps}" --request POST ${url}`

  exec(cmdStr, callback)
}

const checkToken = (token = '', callback = () => {}) => {
  const url = `https://${EAZE_CONFIG.domain}/api/v4/user`
  const cmdStr = `curl --header "Authorization: Bearer ${token}" ${url}`
  exec(cmdStr, err => {
    callback(!err)
  })
}

// 获取用户输入的用户名和密码
const getLoginInfo = (callback = () => {}) => {
  prompt.login().then(res => {
    requestToken(res.domain, res.username, res.password, (err, stdout, stderr) => {
      if (!stdout || JSON.parse(stdout).error) {
        log.error(`Login failed! the information entered may be wrong, please login again with "ease login"`)
      } else {
        log.success('Login successfully!')
        const data = {
          domain: res.domain,
          namespace: res.namespace,
          username: res.username,
          password: res.password,
          ...JSON.parse(stdout)
        }
        writeRc(data)
        callback(data['access_token'])
      }
    })
  })
}

const login = (callback = () => {}) => {
  // 从 ～/.easerc 读取配置，没有或 token 失效则提示用户重新登陆
  const token = EAZE_CONFIG['access_token']
  if (token) {
    checkToken(token, isEffective => {
      if (isEffective) {
        callback()
      } else {
        // token 过期了
        log.error('Your access token is out of date!')
        logout()
        getLoginInfo()
      }
    })
  } else {
    getLoginInfo()
  }
}

module.exports = login