简介
====
express是基于 Node.js 平台，快速、开放、极简的 web 开发框架。

安装
====
```
$npm install express --save
```

hello world
===========
进入项目目录，创建一个名为 app.js 的文件，然后将下列代码复制进去：
```
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
```
来源: http://www.expressjs.com.cn/starter/hello-world.html

通过如下命令启动此应用：
```$ node app.js```
然后在浏览器中打开 http://localhost:3000/ 并查看输出结果。

本框架中用到的express
==================
为了方便前端开发人员(没有PHP环境的)查看和调试页面, 本框架有个基本的express, 可以设定虚拟目录和静态资源目录, 方便在浏览器中直接访问。

源文件: ./index.js
```
//其中的app.use将一个静态资源目录指向到特殊的虚拟目录中
app.use('/api_demo', express.static('api_demo'));
```