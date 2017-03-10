
var DemoMarkdownCtrl = ['$rootScope', '$scope', '$location', '$window', 'api', 'valid', '$routeParams',
    function ($rootScope, $scope, $location, $window, api, valid, $routeParams) {
        //本页面的各种属性数据
        //如果有初始值写在此处
        var data = {
            'title': '入口',
            'form_data': {},
            'markdown': ''
        };
        $scope.data = $scope.construct(data, 'demo/markdown/' + $routeParams.name);
        //标题栏按钮动作 ===============================================
        $scope.title_data = [];
        $scope.data.markdown = 'html/doc/markdown/'+$routeParams.name;
    }];

DemoMarkdownCtrl.$injector = ['$rootScope', '$scope', '$location', '$window', 'api', 'valid', '$routeParams'];