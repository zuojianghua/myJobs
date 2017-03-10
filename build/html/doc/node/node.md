Windows篇
========
## 下载
官网地址: http://www.nodejs.org/ | 国内镜像地址: http://www.nodejs.cn/ 下载对应版本的安装程序

## 安装
运行安装程序，安装到默认路径

## 检查
打开命令行窗口，输入`node -v`，显示版本号，即表示安装成功

输入`npm -v`，可以查看npm版本，npm是nodejs的依赖管理工具

## [可选]将node命令加入到系统变量

MAC篇
====
## 下载

## 安装

## 检查

nodejs应用配置
============
首先我们先创建package.json文件。package.json是基于nodejs项目必不可少的配置文件，它是存放在项目根目录的普通json文件。
`$ cnpm init`

依次输入项目名称、描述、作者、关键字等。最后输入yes保存。创建成功后就可以在对应的目录下找到package.json文件了，当然我们也可以用编辑器手动去创建这个文件。