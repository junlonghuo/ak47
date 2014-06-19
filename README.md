## 安装

由于ak47的打包功能包含签名认证，因此暂不允许直接使用npm源来安装，必须先通过gitlab clone源码到本地后手动安装

目前在npm@1.3.11版本通过测试，其他npm可能会出现兼容性问题

```
$ git clone git@gitlab.alibaba-inc.com:h5app/h5app-dev-tools.git
$ cd h5app-dev-tools
$ npm install -g
```

有时候会由于GFW的原因导致报错`npm ERR! registry error parsing json`，这时候请先使用
```
npm config set registry http://registry.cnpmjs.org
```
还有问题的话请google解决办法，GFW你懂的。。



## 初始化一个新H5App项目

### 启动方式：`ak47 init`

```
$ mkdir h5app-demo
$ cd h5app-demo
$ ak47 init

//开始输入初始化项目参数

appid: 20000123                         //应用ID
name:(H5App) demo                       //应用名称
version:(1.0.0.0)                       //应用版本号
url:(/www/index.htm)                    //应用启动页
descriptor: test ak47                   //应用简介

# H5App init success!
```
输入时可直接回车，将会以括号内的值作为默认值。<br/>
通过初始化的项目参数将会在项目根目录自动生成一个Manifest.xml文件，后续可手工修改内容。

www目录下将自动生成一个demo项目，可直接删除或稍作参考。

### 使用一个现有H5App项目

假设有一个H5App标准项目，路径为
`/Users/haibinzhb/Project/alipayProject/h5app-demo`

那么直接cd到项目根目录
```
cd /Users/haibinzhb/Project/alipayProject/h5app-demo
```

## 开启本地静态HTTP服务器

### 启动方式：`ak47 server`

支持通过 --p 参数来自定义HTTP虚拟服务器端口号，默认为3000

````
$ ak47 server --p 3001

# project = /Users/haibinzhb/Project/alipayProject/h5app-demo
# webServer(web页面预览地址) = http://10.15.133.180:3001/
# qrScheme(二维码服务) = http://10.15.133.180:3001/qr
# listening... do not exit!
````
执行后将打印出三个结果:

1. `project`为当前项目绝对路径。

2. `webServer`为本地web服务器地址。

3. `qrScheme`为二维码拍码地址，PC端打开后出现两个二维码，分别可以在移动端拍码后用原生浏览器或支付宝钱包打开。

默认启动页为自动获取自Manifest.xml文件内的url值，一般为index.htm。同时还会获取showTitleBar和showToolBar的值作为启动参数。




## 开启远程调试控制台(集成weinre)

### 启动方式: `ak47 debug`

支持通过 --p 参数来自定义HTTP虚拟服务器端口号，默认为3000

集成weinre功能，原理可参考[传送门](http://people.apache.org/~pmuellr/weinre/docs/latest/Home.html)，ak47的weinre默认端口号为`3119`，一般不用设置

开启远程调试控制台功能后，同时会开启本地静态HTTP服务器。并且url地址将自动识别为当前局域网的IP地址。

#### **请保持移动端设备和PC的网络处于同一环境下**

````
$ ak47 debug --p 3001

# project = /Users/haibinzhb/Project/alipayProject/h5app-demo

# debugPath(远程调试控制台地址) = http://10.15.133.180:3001/debug
# webServer(web页面预览地址) = http://10.15.133.180:3001/
# qrScheme(二维码服务) = http://10.15.133.180:3001/qr
# debugScript(非本地页面需手动插入脚本) = <script src="http://10.15.134.119:3119/target/target-script-min.js#anonymous"></script>

# listening... do not exit!
````
### 调试教程

**如果是调试ak47搭建的本地站点，ak47将会自动为所有被访问的.htm或.html后缀的页面内嵌入远程调试代码，开发者无需手动加入。**

**如果是需要调试在线网站(即非本地服务器网址)的页面，需要手动在被调试页面源码内加入debugScript的内容(即一个script标签)**

1. PC端浏览器打开`debugPath`地址
2. debugPath地址会出现两个二维码，分别可以在移动端拍码后用原生浏览器或支付宝钱包打开。

默认启动页为自动获取自Manifest.xml文件内的url值，一般为index.htm。同时还会获取showTitleBar和showToolBar的值作为启动参数。

qrScheme地址为专门的扫码地址

weinre的调试界面完全类似chrome的调试台

#### 注：如果出现远程调试无反应的情况，一般是由于连接超时或断开，请重新刷新手机端页面或远程控制台页面即可。





### 后续计划
1. 服务端数据mock功能
2. 客户端bridge接口mock功能
3. 真正的watch功能，自动更新调试页面


## 离线项目打包

### 启动方式: `ak47 pkg`
支持两种命令`ak47 pkg`或`ak47 package`
执行后会提示当前版本号并允许输入新版本号，可直接回车跳过；或输入新版本号，将自动更新Manifest.xml内的版本号。
还能通过输入environ参数来增加amr包的运行环境标识，默认为dev

打包工具将会自动获取Manifest.xml文件内的appid和版本号来生成amr包文件名

```
$ ak47 pkg

version:(1.0.0.0) 1.1.0.0
environ:(dev) rc

# archiving...
# packed at /Users/haibinzhb/Project/alipayProject/h5app-demo/package/20000127-1.1.0.0_rc.amr

```

### 后续计划

1. 自动压缩js和css文件
2. 优化加签验签逻辑，不再强绑定为支付宝H5App签名功能，实现一个包可以同时用于其他无线端产品线


## 其他功能功能开发中
```
$ ak47 publish    //发布到指定环境
```
