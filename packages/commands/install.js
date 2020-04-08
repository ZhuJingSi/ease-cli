#!/usr/bin/env node

// node 内置模块
const fs = require('fs')
const exec = require('child_process').exec
const execSync = require('child_process').execSync

const { getProjectPackageJson } = require('../lib/common')
// 各种命令行询问
const prompt = require('../lib/prompt')
const Table = require('cli-table')
const _ = require('lodash/array')

// 列出对比出来需要安装的依赖
const listDiffTable = (parent, child) => {
  const notHaveD = [] // 主项目没有的 dependencies
  const notHaveP = [] // 主项目没有的 peerDependencies
  const notEqualD = [] // 与主项目版本不一致的 dependencies
  const notEqualP = [] // 与主项目版本不一致的 peerDependencies

  // 只存依赖名和版本
  const notHaveD_simple = {}
  const notHaveP_simple = {}
  const notEqualD_simple = {}
  const notEqualP_simple = {}

  // 如果有多个子组件使用了不同版本的某依赖，只取第一个，不再做复杂判断了，未来有需要再说
  child.forEach(res => {
    Object.keys(res.dependencies).forEach(d => {
      if (!parent.dependencies[d]) {
        if (!notHaveD_simple[d]) {
          notHaveD.push({
            cName: res.name,
            path: res.path,
            name: d,
            range: res.dependencies[d]
          })
          notHaveD_simple[d] = res.dependencies[d]
        }
      } else if (parent.dependencies[d] !== res.dependencies[d]) {
        if (!notEqualD_simple[d]) {
          notEqualD.push({
            cName: res.name,
            path: res.path,
            name: d,
            range: res.dependencies[d],
            parentRange: parent.dependencies[d]
          })
          notEqualD_simple[d] = res.dependencies[d]
        }
      }
    })
    Object.keys(res.peerDependencies).forEach(d => {
      if (!parent.dependencies[d] && !parent.peerDependencies[d]) {
        if (!notHaveP_simple[d]) {
          notHaveP.push({
            cName: res.name,
            path: res.path,
            name: d,
            range: res.peerDependencies[d]
          })
          notHaveP_simple[d] = res.peerDependencies[d]
        }
      } else if ((parent.dependencies[d] || parent.peerDependencies[d]) !== res.peerDependencies[d]) {
        if (!notEqualP_simple[d]) {
          notEqualP.push({
            cName: res.name,
            path: res.path,
            name: d,
            range: res.peerDependencies[d],
            parentRange: parent.dependencies[d] || parent.peerDependencies[d]
          })
          notEqualP_simple[d] = res.peerDependencies[d]
        }
      }
    })
  })

  // dependencies 差异表格
  const tableD = new Table({
    head: ['dependencies', 'version range', 'current version range', 'from']
  })

  notHaveD.forEach(res => {
    tableD.push([res.name, res.range, '-', `${res.cName}: ${res.path}`])
  })
  notEqualD.forEach(res => {
    tableD.push([res.name, res.range, res.parentRange, `${res.cName}: ${res.path}`])
  })

  if (notHaveD.length || notEqualD.length) {
    console.log(tableD.toString())
  }

  // peerDependencies 差异表格
  const tableP = new Table({
    head: ['peerDependencies', 'version range', 'current version range', 'from']
  })
  notHaveP.forEach(res => {
    tableP.push([res.name, res.range, '-', `${res.cName}: ${res.path}`])
  })
  notEqualP.forEach(res => {
    tableP.push([res.name, res.range, res.parentRange, `${res.cName}: ${res.path}`])
  })

  if (notHaveP.length || notEqualP.length) {
    console.log(tableP.toString())
  }
  
  if (notHaveD.length || notEqualD.length || notHaveP.length || notEqualP.length) {
    prompt.confirm('Whether to install the above package, note that they will not rewrite your package.json').then(res => {
      // 确认安装
      if (res.confirm) {
        const notHaveD_simple_List = Object.keys(notHaveD_simple)
          .map(el => `${el}@"${notHaveD_simple[el]}"`)
        const notHaveP_simple_List = Object.keys(notHaveP_simple)
          .map(el => `${el}@"${notHaveP_simple[el]}"`)
        const notEqualD_simple_List = Object.keys(notEqualD_simple)
          .map(el => `${el}@"${notEqualD_simple[el]}"`)
        const notEqualP_simple_List = Object.keys(notEqualP_simple)
          .map(el => `${el}@"${notEqualP_simple[el]}"`)
        const list  = notHaveD_simple_List.concat(notHaveD_simple_List,
          notHaveP_simple_List, notEqualD_simple_List, notEqualP_simple_List)
          execSync(`npm install ${list.join(' ')} --no-save`, { stdio: [0, 1, 2] })
      }
    })
  }
}

const install = () => {
  execSync('npm install', { stdio: [0, 1, 2] })
  const peerDependencies = getProjectPackageJson().peerDependencies
  if (peerDependencies && Object.keys(peerDependencies).length) {
    const peerList = Object.keys(peerDependencies).map(res => `${res}@"${peerDependencies[res]}"`)
    execSync(`npm install ${peerList.join(' ')} --no-save`, { stdio: [0, 1, 2] })
  }

  const parentDependencies = {
    dependencies: getProjectPackageJson().dependencies,
    peerDependencies
  }
  const childDependencies = []
  
  // 遍历项目中的远程仓库
  exec('git remote', (err, stdout, stderr) => {
    const remoteList = stdout.split('\n').filter(res => !!res)
    remoteList.forEach((remoteName, index) => {
      // 远程仓库是指定域名下的视为组件库
      exec(`git remote get-url ${remoteName}`, (err, stdout, stderr) => {
        if (stdout.startsWith(`git@${EAZE_CONFIG.domain}:${EAZE_CONFIG.namespace}/`)) {
          const addPath = PROJECT_EAZE_CONFIG.componentDir || 'src/components'
          // 组件库如果是通过 ez add 添加进来的 subtree 则连同 package.json 也会有
          if (fs.existsSync(`${addPath}/${remoteName}`) && fs.existsSync(`${addPath}/${remoteName}/package.json`)) {
            // 接下来对比组件和项目的 package.json，检查 dependencies 和 peerDependencies 在父项目中是否存在
            const singleDependencies = getProjectPackageJson(`${addPath}/${remoteName}`).dependencies
            const singlePeerDependencies = getProjectPackageJson(`${addPath}/${remoteName}`).peerDependencies
            childDependencies.push({
              name: remoteName,
              path: `${addPath}/${remoteName}`,
              dependencies: singleDependencies,
              peerDependencies: singlePeerDependencies
            })
          }
        }
        // 执行到最后一个组件
        if (index === remoteList.length - 1) {
          listDiffTable(parentDependencies, childDependencies)
        }
      })
    })
  })
}

module.exports = install