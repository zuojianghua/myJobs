目录结构
=======
<pre>
╔═/api_demo/┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈伪api数据返回目录，用于测试
╠═/bower_components/┈┈┈┈┈┈┈开发时使用的第三方插件库
╠═/build/┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈最终打包发布后的目录，里面文件通过脚本自动生成(index.html除外)
╠┄┄┄┄┄┄┄/css/┈┈┈┈┈┈┈┈┈┈┈┈┈┈css存放目录
╠┄┄┄┄┄┄┄┄┄┄┄/lib.min.css┈┈┈合并后的第三方插件库的css文件
╠┄┄┄┄┄┄┄┄┄┄┄/main.css┈┈┈┈┈┈项目的css文件
╠┄┄┄┄┄┄┄/fonts/┈┈┈┈┈┈┈┈┈┈┈┈字体文件存放目录
╠┄┄┄┄┄┄┄/html/┈┈┈┈┈┈┈┈┈┈┈┈┈html模版文件存放目录
╠┄┄┄┄┄┄┄/images/┈┈┈┈┈┈┈┈┈┈┈图片存放目录
╠┄┄┄┄┄┄┄/app.min.js┈┈┈┈┈┈┈┈合并压缩后的主应用js
╠┄┄┄┄┄┄┄/lib.min.js┈┈┈┈┈┈┈┈合并压缩后的第三方库js
╠┄┄┄┄┄┄┄/workflow.min.js┈┈┈合并压缩后的流程图库js(较大单独分出来,可选)
╠┄┄┄┄┄┄┄/index.html┈┈┈┈┈┈┈┈单页面应用主页
╠═/dist/┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈编译时的临时目录
╠═/doc/┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈对外文档目录
╠═/logs/┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈编译时的日志目录
╠═/node_modules/┈┈┈┈┈┈┈┈┈┈┈nodejs库目录
╠═/src/┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈项目开发目录，下一节详细说明此目录
╠═/bower.json┈┈┈┈┈┈┈┈┈┈┈┈┈┈bower依赖关系配置
╠═/gulpfile.js┈┈┈┈┈┈┈┈┈┈┈┈┈编译脚本
╠═/index.js┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈express应用(如开发环境没有apache可以用nodejs的express代替)
╚═/package.json┈┈┈┈┈┈┈┈┈┈┈┈nodejs应用配置
</pre>

