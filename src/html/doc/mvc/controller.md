全局控制器
========

app.js中需要对控制器进行定义
```
var myApp = angular.module('myApp', ['ngRoute','ngDialog',...])
    .controller('IndexMainCtrl', IndexMainCtrl)
    .controller('ComponentNavCtrl', ComponentNavCtrl)
    .controller('ComponentMenuCtrl', ComponentMenuCtrl)
    .controller('ComponentTabCtrl', ComponentTabCtrl)
```
其中src/controller/index/IndexMainCtrl.js为主控制器，应用在index.html中，其他控制器均为此控制器的子控制器，可以继承使用主控制器$scope对象的方法
```
<body ng-controller="IndexMainCtrl">
    ...
</body>
```

* ComponentNavCtrl为顶部导航
* ComponentMenuCtrl为左侧菜单
* ComponentTabCtrl为多页页签

控制器中的模块引用（依赖注入）
========================
```
var IndexMainCtrl = ['$rootScope', '$scope', '$location', '$window', '$q', 'api', 'util',
    function ($rootScope, $scope, $location, $window, $q, api, util) {
    ...
    }];
IndexMainCtrl.$injector = ['$rootScope', '$scope', '$location', '$window', '$q', 'api', 'util'];
```

说明：
* 控制器文件命名需要包含src/controller/路径以下的全部路径，首字大写，并以Ctrl.js结尾
* 数组内和参数列表内的$rootScope, $scope, $location等以$开头的对象为angular内置对象
* 数组内核参数列表内的'api'、'utrl'、'ngDialog'等为自己开发或第三方模块，需要事先在app.js里载入
* 依赖关系引用后，控制体内即可使用$scope、$location..等等
* 使用IndexMainCtrl.$injector方法防止代码发布时，压缩和加密后依赖关系丢失

$rootScope
==========
$rootScope为全局对象，对象内的属性和方法可以在不同的控制器中共享。本系统因为需要用到多个页签，所以每个页签的页面数据都存在$rootScope.history中。以下为数据格式示例
```
$rootScope.histroy= {
    '/sys/user/index': { scope: {data:data}, order: order},
    '/crm/customer/index': { scope: {data:data}, order: order},
    ...
};
```
其中键名为路由的地址，键值对象的scope.data为具体页面控制器的$scope.data，order为页签的排序值。页面首次加载时，将路由信息和scope.data的初始信息记录到history中，当路由地址切换开始时，从histroy中取出对应页面的数据实现多页签切换效果。

IndexMainCtrl控制器中的$scope.construct()方法中完成了以上事情，需要在每个具体的页面控制器中继承使用。如CrmCustomerIndexCtrl中的使用示例：
```
var CrmCustomerIndexCtrl = ['$rootScope', '$scope', '$location', '$window', 'api',
    function ($rootScope, $scope, $location, $window, api) {
        //本页面的各种属性数据
        var data = {
            'title':'顾客列表',
            'list_data':[],
            'page_data':{},
            'search_data':{}
        };
        $scope.data = $scope.construct(data,'crm/customer/index');
        
        ...
    }];
CrmCustomerIndexCtrl.$injector = ['$rootScope', '$scope', '$location', '$window', 'api'];
```

页面控制器
========
命名规则参见全局控制器。属性，请勿直接用$scope.xxx 定义页面需要用到数据，数据请丢到$scope.data（因为需要传入到$rootScope.history）。常用示例如下
```
var data = {
    'title':'页面标题',  //页面标题
    'list_data':[],     //列表页数据
    'page_data':{},     //分页数据
    'search_data':{},   //查询条件数据
    'order_data':{},    //列表排序条件数据
    'form_data':{},     //表单提交数据或展示数据
    'tree_data':{},     //选择树数据
    'tab_data':{        //多个tab内的数据
       1:{},
       2:[]
     },
    'title_data':[],    //标题栏按钮数据
    ...         
             
};
```

页面简单的下拉选框，单选框，多选框用到的可枚举的固定选项数据（非指令的，非从API获取的），在IndexMainCtrl中定义，各页面控制器继承使用
```
$rootScope.search_data_option = $rootScope.form_data_option = {
    'customer_sex_options': { '0': '保密', '1': '男', '2': '女' },
    'marriage_options': { '0': '保密', '1': '未婚', '2': '已婚' },
    'education_options': { '0': '保密', '1': '小学或以下', '2': '初中' ... },
    'skin_type_options': { '0': '保密', '1': '干性皮肤', '2': '油性皮肤' ... },
    'sex_options': { '0': '保密', '1': '男', '2': '女' },
    'is_manage_options': { '0': '否', '1': '是' },
    'is_login_options': { '0': '否', '1': '是' },
    'is_work_options': { '0': '否', '1': '是' }
}
```

动作方法。在控制器内直接定义，html模板文件中使用。注意方法尽量不要传参，而使用本页面数据对象。示例如下：
```
//清空搜索条件
$scope.form_clear = function () {
   $scope.data.search_data = {};
}
//数据查询
$scope.form_search = function () {
   ...
}
```