#!/usr/bin/env node

// node 内置模块
const exec = require('child_process').exec
const execSync = require('child_process').execSync

// 有颜色的 log
const log = require('../lib/log')

const pushSubtree = (name) => {
  const addPath = PROJECT_EAZE_CONFIG.componentDir || 'src/components'
  const ssh_url = `git@${EAZE_CONFIG.domain}:${EAZE_CONFIG.namespace}/${name}.git`
  
  exec('git remote', (err, stdout, stderr) => {
    if (!stdout.includes(name)) {
      execSync(`git remote add -f ${name} ${ssh_url}`)
    }
    /**
     * Subtree 提交到子项目
     * git subtree push --prefix=<本地子项目目录> <远程库仓库地址 | 远程库别名> <分支> --squash
     * 
     * 这时 git 会遍历主项目的 commit 所有记录，从中找出有对子项目修改的相关 commit，
     * 并提取各 commit 更新的内容提交到子项目远程库中；
     * 加 --squash 参数时，如果主项目新增的修改子项目的 commit 有多个时会合并为一个 commit 提交。
     * 未 commit 过的本地修改不会被推到远程子项目
     */
    exec(`git subtree push --prefix=${addPath}/${name} ${name} master --squash`, (err, stdout, stderr) => {
      if (err) {
        log.error(stderr)
      } else {
        log.success(`${name} push succeeded`)
        log.info(`repo url: https://${EAZE_CONFIG.domain}/${EAZE_CONFIG.namespace}/${name}`)
        /**
         * 子项目切出起点
         * git subtree split [--rejoin] --prefix=<本地子项目目录> --branch <主项目中作为放置子项目的分支名>
         * 
         * subtree 可以将子项目当前版本切出为一个分支，作为后面的 push 时遍历的新起点，
         * 这样以后每次遍历都只从上次切出的分支的起点开始，不会再遍历以前的了，时间就省了很多。
         * 
         * 注意：如果 push 时使用了 --squash 参数合并提交，那么 split 时不能使用 --rejoin 参数，反之必须使用。
         */
        exec(`git subtree split --prefix=${addPath}/${name} --branch ${name}`, (err, stdout, stderr) => {
          if (err) {
            log.error(stderr)
          }
        })
      }
    })
  })
}

module.exports = pushSubtree