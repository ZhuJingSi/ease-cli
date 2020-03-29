// node 内置模块
const path = require('path')
const fs = require('fs')
const exec = require('child_process').exec

/**
 * 每个组件的 index.js 内容
 * @param {*} name 组件名称
 */
const componentIndexContent = (dirPath = '', cb = () => {}) => {
  let importFileContent = ''
  let installContent = ''
  let exportContent = ''

  fs.readdir(dirPath, (err, files) => {
    const comFiles = files.filter(res => (/\.vue$/).test(res))

    importFileContent = comFiles.map(fileName => {
      const comName = fileName.replace(/\.vue$/, '')
      return `
import ${comName} from '${dirPath}/${fileName}'`
    }).join('')

    installContent = comFiles.map(fileName => {
      const comName = fileName.replace(/\.vue$/, '')
      return `
${comName}.install = Vue => {
  Vue.component(${comName}.name, ${comName})
}`
    }).join('')

    if (comFiles.length === 1) {
      exportContent = `export default ${comFiles[0].replace(/\.vue$/, '')}`
    } else {
      exportContent =
`export {
  ${comFiles.map(fileName => fileName.replace(/\.vue$/, '')).join(', ')}
}`
    }

    const content = `
/**
 * 该文件首次为脚本自动生成，会将所有 .vue 后缀的文件当作要导出的组件
 * 请检查以下组件是否为你想要导出的
 * 完成检查或修改后请移步 packages/index.js，在其中加上相应组件
 */

// 导入组件，组件必须声明 name
${importFileContent}

// 为组件添加 install 方法，用于按需引入
${installContent}

${exportContent}
`
    cb(content)
  })
}

module.exports = {
  componentIndexContent
}