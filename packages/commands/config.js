#!/usr/bin/env node

// node 内置模块
const { writeRc } = require('../lib/common')

const config = (args) => {
  const [key, ...value] = args
  if (key === 'remove') {
    writeRc({}, value)
  } else {
    writeRc({
      [key]: value[0]
    })
  }
}

module.exports = config