var DocMarkdownCtrl = ['$rootScope', '$scope', '$location', '$window', 'api', 'valid', '$routeParams',
    function ($rootScope, $scope, $location, $window, api, valid, $routeParams) {
        //本页面的各种属性数据
        //如果有初始值写在此处
        var data = {
            'title': '',
            'form_data': {},
            'markdown': ''
        };
        $scope.data = $scope.construct(data, '/doc/' + $routeParams.group + '/' + $routeParams.md);
        //标题栏按钮动作 ===============================================
        $scope.data.title = $rootScope.now_menu;
        $scope.title_data = [
            { 'ico': 'glyphicon-backward', 'name': '上一篇', 'click': function(){ $location.path('') } },
            { 'ico': 'glyphicon-forward', 'name': '下一篇', 'click': function(){ $location.path('') } },
            { 'ico': 'glyphicon-refresh', 'name': '刷新', 'click': function (){  } }
        ];
        $scope.data.mdfile = 'html/doc/' + $routeParams.group + '/' + $routeParams.md;
    }];

DocMarkdownCtrl.$injector = ['$rootScope', '$scope', '$location', '$window', 'api', 'valid', '$routeParams'];