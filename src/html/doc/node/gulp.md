简介
===
gulp是前端开发过程中对代码进行构建的工具，是自动化项目的构建利器。gulp是基于Nodejs的自动任务运行器， 她能自动化地完成 JavaScript/coffee/sass/less/html/image/css 等文件的的测试、检查、合并、压缩、格式化、浏览器自动刷新、部署文件生成，并监听文件在改动后重复指定的这些步骤

安装
===
全局安装gulp命令 `$ cnpm install gulp -g`


使用
===
## 在package.json中添加gulp插件开发依赖
package.json文件请参考node.js文档部分。安装开发用的依赖使用 --save-dev参数，例如：
```
$ cnpm install gulp  --save-dev
$ cnpm install gulp-uglify  --save-dev
```

## 常用gulp插件
* sass的编译（gulp-sass）
* less编译 （gulp-less）
* 重命名（gulp-rename）
* 自动添加css前缀（gulp-autoprefixer）
* 压缩css（gulp-clean-css）
* js代码校验（gulp-jshint）
* 合并js文件（gulp-concat）
* 压缩js代码（gulp-uglify）
* 压缩图片（gulp-imagemin）
* 图片缓存，只有图片替换了才压缩（gulp-cache）

## gulpfile.js脚本
gulpfile.js是gulp项目的配置文件, 是位于项目根目录的普通js文件, gulpfile.js中定义任务(task), 然后通过 `$ gulp your_taskname` 执行gulp任务。
```
//以下为js代码压缩示例
var gulp = require('gulp'),
    uglify = require('gulp-uglify');

gulp.task('jsmin', function () {
    gulp.src(['js/*.js'])              //*为通配符，也可以指定具体文件
        .pipe(uglify({
            mangle: true,              //类型：Boolean 默认：true 是否修改变量名
            compress: true,            //类型：Boolean 默认：true 是否完全压缩
            preserveComments: 'all'    //保留所有注释
        }))
        .pipe(gulp.dest('dist/js'));   //压缩文件的输出路径
});
```
## 执行任务
gulp 任务名称。以上面的压缩js代码任务为例
```$ gulp jsmin```

如果不加任务名，则执行名为default的默认任务。

本框架gulp任务
============
## 默认任务
本框架任务在 ./gulpfile.js中，直接输入gulp命令默认任务会执行以下操作: 

* 清空`./build`目录和`./dist`目录, 清空时排除`./build/index.html`, 此文件会被保留
* 拷贝`./src`中的静态文件html/images/css到`./build`中
* 拷贝`./bower_components`中引入的第三方css文件到`./build/css`目录中, 并合并压缩, 输出文件名为`./build/css/lib.min.css`
* 拷贝`./bower_components`中用到的字体文件到`./build/fonts`目录中
* 静态检查`./src`目录下`controller` `script` `directive`下的全部js文件语法。将检查结果输出到`./logs/check_result.txt`文件中
* 压缩合并混淆`./bower_components`目录下用到的第三方js库文件(draw2d相关除外)到`./build/lib.min.js`文件
* 压缩合并混淆`./bower_components`目录下draw2d相关库文件, 以及`./src/directive/workflow`目录下js文件到`./build/workflow.min.js`
* 压缩合并混淆`./src`目录下的`controller` `script` `directive`下的其他js文件, 输出到`./build/app.min.js`

## 其他任务

* `$ gulp check` 单独执行代码检查任务
* `$ gulp clean` 单独执行./build和./dist目录的清空任务

