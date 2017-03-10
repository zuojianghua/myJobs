ngExpress
=========
# 环境
* [马] nodejs
 1. 到官网下载node(http://www.nodejs.cn/)安装程序
 2. 安装node
 3. 打开命令行窗口，输入node -v，显示版本号，即表示安装成功
* [马] bower
1. 简介
   Bower 是 twitter 推出的一款包管理工具，基于nodejs的模块化思想，把功能分散到各个模块中，让模块和模块之间存在联系，通过        Bower 来管理模块间的这种联系。
2. 安装
安装依赖：NodeJS、NPM、Git
   ```$    npm install -g bower```
3. 使用
进入到你的项目文件位置，例如 C:\workspace\myproject> 。注意：文件路径不要包含特殊字符和大写字母。
    用bower安装angular
```$    bower install angular```
   用bower安装jquery
```$    bower install jquery```
```
C:\workspace\myproject>bower install jquery
bower not-cached    https://github.com/jquery/jquery-dist.git#*
bower resolve       https://github.com/jquery/jquery-dist.git#*
bower download      https://github.com/jquery/jquery-dist/archive/3.1.1.tar.gz
bower extract       jquery#* archive.tar.gz
bower resolved      https://github.com/jquery/jquery-dist.git#3.1.1
bower install       jquery#3.1.1

jquery#3.1.1 bower_components\jquery
```
安装完毕后即可在对应的目录下找到安装的文件

 

 

* [马] gulp
1. 简介
gulp是前端开发过程中对代码进行构建的工具，是自动化项目的构建利器。gulp是基于Nodejs的自动任务运行器， 她能自动化地完成 JavaScript/coffee/sass/less/html/image/css 等文件的的测试、检查、合并、压缩、格式化、浏览器自动刷新、部署文件生成，并监听文件在改动后重复指定的这些步骤
2. 安装
```$    cnpm install gulp -g```
3. 使用
3.1 首先我们先创建package.json文件。package.json是基于nodejs项目必不可少的配置文件，它是存放在项目根目录的普通json文件；
```$   cnpm init```
依次输入项目名称、描述、作者、关键字等。最后输入yes保存。

 创建成功后就可以在对应的目录下找到package.json文件了，当然我们也可以用编辑器手动去创建这个文件。
3.2 本地安装gulp插件
 * 常用插件
sass的编译（gulp-sass）
less编译 （gulp-less）
重命名（gulp-rename）
自动添加css前缀（gulp-autoprefixer）
压缩css（gulp-clean-css）
js代码校验（gulp-jshint）
合并js文件（gulp-concat）
压缩js代码（gulp-uglify）
压缩图片（gulp-imagemin）
图片缓存，只有图片替换了才压缩（gulp-cache）

以uglify插件为例
安装gulp 和 gulp-uglify到本地
```$   cnpm install gulp  --save-dev```
```$    cnpm install gulp-uglify  --save-dev```
    * 新建gulpfile.js文件
gulpfile.js是gulp项目的配置文件，是位于项目根目录的普通js文件
```
var gulp = require('gulp'),
    uglify= require('gulp-uglify');
gulp.task('jsmin', function () {
    gulp.src(['js/*.js'])      //  * 为通配符，也可以指定具体文件
        .pipe(uglify({
            mangle: true,//类型：Boolean 默认：true 是否修改变量名
            compress: true,//类型：Boolean 默认：true 是否完全压缩
            preserveComments: 'all' //保留所有注释
        }))
        .pipe(gulp.dest('dist/js'));     //压缩文件的保存路径
});
```
* 执行命令
gulp 任务名称
```$   gulp jsmin```
* [马] cnpm
 * cnpm是npm的一个镜像，由于npm的服务器在国外，访问速度很慢，可以通过安装cnpm来解决这个问题。安装cnpm后，绝大部分npm命令都可以替换成cnpm。
npm是nodejs官方未nodejs定制的一个工具，是Node.js的包管理器，是Node Packaged Modules的简称，通过npm可以下载安装nodejs的模块包。
```$    npm install -g cnpm --registry=https://registry.npm.taobao.org```
* 后台服务
** [马] wamp
1. 简介
Wamp就是Windows Apache Mysql PHP集成安装环境，即在window下的apache、php和mysql的服务器软件。
2. 安装
2.1 下载xampp https://www.apachefriends.org/zh_cn/index.html
2.2 按照提示进行安装

 

 2.3 启动apache和MySQL
在浏览器输入http://localhost/，若能访问即表示安装成功。

** [马]express
1. 简介
express是基于 Node.js 平台，快速、开放、极简的 web 开发框架。
2. 安装
```$    npm install express --save```
3. hello world
进入项目目录，创建一个名为 app.js 的文件，然后将下列代码复制进去：
var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
来源： http://www.expressjs.com.cn/starter/hello-world.html
通过如下命令启动此应用：
```$    node app.js```
然后在浏览器中打开 http://localhost:3000/ 并查看输出结果。
# 安装
* git方式
* 完整压缩包下载

# 目录结构
* 框架目录
* 项目代码目录

# 系统配置
* 站点访问目录
* 配置文件说明

# [孙] 入口

# [孙] 路由

# [孙] 控制器

# [孙] 页面模版

# [孙] 模型

# [孙] 服务

# [孙] 过滤器

# 指令

# 语言包

# API规范

# 本地数据

# 调试

# 脚手架(代码自助生成)
* 列表页
* 新增页
* 查看编辑页

# 自定义控件
* 第三方库依赖管理
* 弹框控件
* 警告提示确认控件
* 拾色器控件
* 可视化编辑器控件
* [腾飞] 分页控件
* [腾飞] 单选选择器
* [腾飞] 多选选择器
* [腾飞] 省市区联动
* [腾飞] 日历选择器
* [腾飞] 上传图片
* 导入导出excel
* 流程图编辑器

# 发布
* 静态检查
* 压缩合并混淆

# 端打包工具
* 桌面
** electron
** NW.js
* 移动
** ApiCloud
** Cordova

# 样例

# 参考文档


-----------------------------
内网测试服务器：192.168.158.165
SSH信息：root ／ sq365@sqzw
/usr/local/apache/htdocs/ngExpress
http://192.168.158.165/ngExpress

https://github.com/zuojianghua/ngExpress

