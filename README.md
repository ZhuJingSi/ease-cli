# 安装
```
npm i @cisy/ease-cli -g
```

# 组件开发原则

1. **价值**：业务组件不同于第三方通用组件，它是紧密结合了公司业务交互和设计规范的产物，在复用代码节省开发工作量提高开发效率的同时，也是公司产品设计标志性的体现。
2. **渐进增强**：组件开发遵循“渐进增强”的策略，先保证基础功能的支持，避免一开始就过度设计。
3. **粒度把握**：组件需要把握覆盖的功能规模，过大的粒度不利于复用，过小的粒度无法体现业务特点与通用组件无异。
4. **功能累加**：组件的功能原则上只允许增加，不允许随意删减，避免影响现有业务的使用。
5. **无副作用**：组件尽量为展示型组件，即只通过 props 接受数据和触发事件回调，不在组件内部做任何会产生副作用的动作，如：发业务请求、修改父组件数据等。

# 组件使用说明

***注意：目前 ez cli 的 add、delete、pull、push 命令都需要在项目根目录执行，不然可能不能正确执行***

## 组件开发形式有两种：

1. 以 subtree 的形式添加组件到业务项目中，结合真实业务场景做调试和开发，期间可跟随项目 git 流程提交代码方便多人同时使用。开发完毕可执行 ez push <name> 将组件最新代码提交到组件源仓库，再进入组件源仓库执行 npm publish 即可上传到 @dxy-toh 丁香园私有 npm 库（已发布的 npm 包目前不支持撤回，请谨慎操作）。
2. git clone 组件库（记得 npm i 后自己手动装一下 peerDependencies 里的包），在其中执行 npm run doc 可打开组件文档页面，其中可根据 demo 的表现做调试，支持热更新。组件库本身也支持 ez add 其它组件用作联调。发布依然使用 npm publish。

## 命令

### 登陆账号

#### ez login

根据提示填写你的 gitlab 账号和密码（丁香人才同学仓库地址和空间路径用默认的即可），登陆成功才可使用大部分 cli 功能

### 退出登陆

#### ez logout

将本地配置文件清空

### 创建新组件

#### ez new [name] [--local | -l]

根据提示填写组件名称和描述后将会在 gitlab 上使用模版代码创建一个新组件仓库

**--local | -l** ：在当前项目添加该组件，如果项目 package.json 中没有设置 ease.componentDir，组件添加位置默认 src/components

### 当前项目添加新组件

#### ez add <name>

将已存在的组件添加到当前项目，如果项目 package.json 中没有设置 ease.componentDir，组件添加位置默认 src/components

### 拉取组件最新更新

#### ez pull <name>

同一个组件可能有其他人在维护，ez pull 可以拉取源仓库最新代码，提交本地修改前都 pull 一下防止冲突是个好习惯

### 推送组件本地更新

#### ez push <name>

推送指定组件的本地修改到组件源仓库

### 删除指定组件

#### ez delete | d <name> [--remote | -r]

删除所在项目中的指定组件，删除 subtree 关系

**--remote | -r**：同时删除组件远程仓库，请谨慎使用

### 修改 ez cli 本地配置文件

#### ez config [key] [value]

将 key: value 键值对写入 .easerc 配置文件，用于未来可能的配置拓展

#### ez config remove [key1] [key2] … [keyn]

删除指定 key

### 组件库本地安装依赖

#### ez install | i

执行 npm i 之后自动安装 peerDependencies，方便本地调试

## ease 项目配置

在业务项目的 package.json 中可以设置有关 ease cli 的配置，目前支持以下两个

**componentDir**：默认值 'src/components’。组件 subtree 安装目录。
**softLinkDir**：默认空。组件软链接目录，设置之后将会在组件添加成功后在指定目录创建组件 src 目录和 index.js 的软链接。