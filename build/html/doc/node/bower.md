简介
===
Bower 是 twitter 推出的一款包管理工具，基于nodejs的模块化思想，把功能分散到各个模块中，让模块和模块之间存在联系，通过Bower来管理模块间的这种联系。

安装bower命令
===========
安装依赖：NodeJS、NPM、Git。安装时的参数 -g 代表全局安装。

`$ npm install -g bower`

使用
===
## 单独安装需要用到的第三方js库

进入到你的项目文件位置，例如 C:\workspace\myproject。注意：文件路径不要包含特殊字符和大写字母。

用bower安装angular

`$ bower install angular --save`

用bower安装jquery

`$ bower install jquery  --save`

以上安装时的参数 --save 代表将安装的依赖关系保存到当前目录下的 bower.json 文件中。


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
安装完毕后即可在对应的目录下找到安装的文件，默认的保存总路径是 bower_components

## 使用bower.js安装第三方js库
如果已经有一个配置好的bower.js文件，可以直接在bower.js所在目录下使用`bower install`命令安装bower.json中的全部第三方js库

如果安装过程中发生不同的第三方库依赖关系冲突，bower会提示你选择一个版本的库解决冲突，选择选项后加上!保存此次冲突的解决结果。
```
Unable to find a suitable version for angular, please choose one:
    1) angular#~1.3 which resolved to 1.3.20 and is required by angular-echarts#0.3.5
    2) angular#~1.4.x which resolved to 1.4.14 and is required by angular-ui-calendar#1.0.2
    3) angular#1.5.3 which resolved to 1.5.3 and is required by angular-route#1.5.3
    4) angular#1.5.8 which resolved to 1.5.8 and is required by angular-animate#1.5.8, angular-touch#1.5
    5) angular#^1.0.8 which resolved to 1.5.8 and is required by angular-markdown-directive#0.3.1
    6) angular#~1.5 which resolved to 1.5.9 and is required by ng-dialog#0.6.2
    7) angular#1.6.0 which resolved to 1.6.0 and is required by angular-sanitize#1.6.0
    8) angular#>=1.3.0 which resolved to 1.6.0 and is required by angular-bootstrap#0.13.4
    9) angular#>=1.3.x which resolved to 1.6.0 and is required by textAngular#1.5.10
    10) angular#^1.3.0 which resolved to 1.6.0 and is required by angular-color-picker#2.4.8
    11) angular#^1.5.3 which resolved to 1.6.0 and is required by ngExpress
    12) angular#>1.2.0 which resolved to 1.6.0 and is required by ng-file-upload#12.2.12

Prefix the choice with ! to persist it to bower.json

? Answer 7!
```
选完回车，示例输出结果如下：
```
bower angular                            resolution Saved angular#1.6.0 as resolution
bower jquery-ui                    extra-resolution Unnecessary resolution: jquery-ui#^1.12.1
bower angular#1.6.0                         install angular#1.6.0
bower angular-markdown-directive#^0.3.1     install angular-markdown-directive#0.3.1
bower showdown#~0.3.1                       install showdown#0.3.4
bower angular-sanitize#^1.0.8               install angular-sanitize#1.6.0

angular#1.6.0 bower_components/angular

angular-markdown-directive#0.3.1 bower_components/angular-markdown-directive
├── angular#1.6.0
├── angular-sanitize#1.6.0
└── showdown#0.3.4

showdown#0.3.4 bower_components/showdown

angular-sanitize#1.6.0 bower_components/angular-sanitize
└── angular#1.6.0
```

以下为一份示例bower.json, 其中dependencies为依赖的第三方js库, resolutions为发生冲突时的解决版本。
```
{
  "name": "ngExpress",
  "homepage": "https://github.com/zuojianghua/ngExpress",
  "authors": [
    "zuojianghua <28842136@qq.com>"
  ],
  "description": "",
  "main": "index.js",
  "moduleType": [],
  "license": "MIT",
  "ignore": [
    "**/.*",
    "node_modules",
    "bower_components",
    "test",
    "tests"
  ],
  "dependencies": {
    "jquery": "^2.2.2",
    "bootstrap": "^3.3.6",
    "angular": "^1.5.3",
    "angular-route": "^1.5.3",
    "ng-dialog": "^0.6.2",
    "angular-ui-calendar": "^1.0.2",
    "angular-color-picker": "angularjs-color-picker#^2.4.8",
    "textAngular": "^1.5.10",
    "ng-file-upload": "^12.2.12",
    "angular-echarts": "^0.3.5",
    "angular-animate": "^1.5.8",
    "jquery-md5": "*",
    "angular-touch": "^1.5.8",
    "draw2d": "^6.1.66",
    "angular-bootstrap": "~0.13.0",
    "jquery-ui": "^1.12.1",
    "angular-markdown-directive": "^0.3.1"
  },
  "resolutions": {
    "jquery": "~2.1.4",
    "jquery-ui": "^1.12.1",
    "angular": "1.6.0"
  }
}

```