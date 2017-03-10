添加路由
======
/src/script/app.js中补充以下部分
```
$routeProvider  
    .when('/dashboard', { templateUrl: 'html/index/IndexDashboard.html', controller: IndexDashboardCtrl })
    .when('/sys/user/index', { templateUrl: 'html/sys/user/SysUserIndex.html', controller: SysUserIndexCtrl })
    .when('/sys/user/add', { templateUrl: 'html/sys/user/SysUserAdd.html', controller: SysUserAddCtrl })
    .when('/sys/user/view/:id', { templateUrl: 'html/sys/user/SysUserView.html', controller: SysUserViewCtrl })
    .when('/sys/user/purview/:id', { templateUrl: 'html/sys/user/SysUserPurview.html', controller: SysUserPurviewCtrl })
```

路由说明
=======

* '/sys/user/index' 为路由地址，浏览器中访问地址为 http://xxx.xxx.xxx.xx/index.html#/sys/user/index 路由地址等于数据库sys_purview表中的菜单地址
* templateUrl: 'html/sys/user/SysUserIndex.html' 为页面模板地址，路径等于菜单路径，文件名包含路径并首字大写
* controller: SysUserIndexCtrl为控制器方法，控制器需要在index.html中加载，文件路径为/src/controller/sys/user/SysUserIndexCtrl.js
* 如果需要页面传参，路由写成'/sys/user/view/:id'。其中:id在控制器中接收为$routeParams.id，目前除主键ID或唯一值code之外其他参数不要直接通过页面传递，可以通过ajax请求