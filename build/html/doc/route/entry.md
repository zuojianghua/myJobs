入口文件
=======
```
/src/index.html
/src/script/app.js
```

资源文件加载
==========
如果有新引入的js/css在index.html统一加载，第三方模块及依赖关系通过bower管理，`gulpfile.js`脚本中需要补充新引入第三方库
```
<link rel="stylesheet" href="../bower_components/bootstrap/dist/css/bootstrap.min.css">
<!--<link rel="stylesheet" href="../bower_components/bootstrap/dist/css/bootstrap-theme.min.css">-->
<link rel="stylesheet" href="../bower_components/ng-dialog/css/ngDialog.min.css">
<link rel="stylesheet" href="../bower_components/ng-dialog/css/ngDialog-theme-default.min.css">
<link rel="stylesheet" href="../bower_components/ng-dialog/css/ngDialog-theme-plain.min.css">
<link rel="stylesheet" href="../bower_components/fullcalendar/dist/fullcalendar.css" />
<link rel="stylesheet" type="text/css" href="css/main.css">
<script type="text/javascript" src="../bower_components/jquery/dist/jquery.min.js"></script>
<script type="text/javascript" src="../bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
<script type="text/javascript" src="../bower_components/angular/angular.min.js"></script>
<script type="text/javascript" src="../bower_components/angular-route/angular-route.min.js"></script>
<script type="text/javascript" src="../bower_components/ng-dialog/js/ngDialog.min.js"></script>
<script type="text/javascript" src="../bower_components/moment/min/moment.min.js"></script>
<script type="text/javascript" src="../bower_components/angular-ui-calendar/src/calendar.js"></script>
<script type="text/javascript" src="../bower_components/fullcalendar/dist/fullcalendar.min.js"></script>
<script type="text/javascript" src="../bower_components/fullcalendar/dist/gcal.js"></script>
```

angular模块依赖注入
=================

/src/script/app.js中进行，说明：模块需要预先通过index.html引用，其中myService，myFilters等为自己开发的模块

```
var myApp = angular.module('myApp', [
    'ngRoute',
    'ngDialog',
    'myService',
    'myDirective',
    'myFilters',
    'ui.calendar'
])
```