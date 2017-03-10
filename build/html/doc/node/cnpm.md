淘宝NPM镜像
=========

npm命令在使用时某些资源会被墙, https://npm.taobao.org/ 是一个完整npmjs.org镜像, 可以用此代替官方版本(只读), 同步频率为10分钟一次以保证尽量与官方服务同步

## 安装
安装命令: `$ npm install -g cnpm --registry=https://registry.npm.taobao.org`

## 使用
安装完可以用cnpm代替原来的npm命令，例如`npm install` 可以用`cnpm install`