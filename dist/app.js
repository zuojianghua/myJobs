var ComponentLoginCtrl = ['$rootScope', '$scope', '$location', '$window','api','myServiceUtil',
    function ($rootScope, $scope, $location, $window,api,myServiceUtil) {

        $scope.login_data = {'user_code':'','password':'','captcha':''}
        //默认不显示验证码，错误3次才显示出来
        $scope.captcha = {
            captcha_show : ($util.getcookie('captcha')>3),
            url : ($util.getcookie('captcha')>3)?'index.php?app_act=index/login_create_verify_graph&amp;' + Math.random():''
        }
        
        //判断回车键登录
        $scope.key_press = function(e){
        	if (typeof e != 'undefined' && e.keyCode != 13) {
                return;
            }else{
            	$scope.do_login();
            }
        }
        
        //登录动作
        $scope.do_login = function(){
            var post_data = myServiceUtil.clone($scope.login_data);
            //需要将密码事先md5
			post_data.password = $.md5(post_data.password);
            //需要获取当前的浏览器类型
			post_data.browser = browser;
            //发送异步登录请求
            api.request('login',post_data).then(function(ret){
                if(ret.status==1){
                    if($scope.login_data.save_login){
                        $util.setcookie('user_code', ret.data.user_code, 7);
                        $util.setcookie('user_name', ret.data.user_name, 7);
                        $util.setcookie('user_id', ret.data.user_id, 7);
                        $util.setcookie('role_name', ret.data.role_name, 7);
                        $util.setcookie('purview', ret.data.purview, 7);
                        $util.setcookie('is_login','true', 7);
                    }else{
                        $util.setcookie('user_code', ret.data.user_code);
                        $util.setcookie('user_name', ret.data.user_name);
                        $util.setcookie('user_id', ret.data.user_id);
                        $util.setcookie('role_name', ret.data.role_name);
                        $util.setcookie('purview', ret.data.purview);
                        $util.setcookie('is_login','true');
                    }
                    $rootScope.info_user_name = ret.data.user_name;
                    $rootScope.login = true;
                    $scope.login_data.password = '';
                    $scope.captcha.captcha_show = false;
                    $util.setcookie('captcha', 0, 2);

                    //收藏菜单保存在localstorage; 数据比较多
                    $rootScope.sys_menu_fav = ret.data.fave_list || [];
                    $util.setStorage('sys_menu_fav',$rootScope.sys_menu_fav);
                    //处理菜单权限
                    api.request('sys/purview/get_tree_data_by_role_id',{user_id:$util.getcookie('user_id')}).then(function (res) {
                        $rootScope.sys_menu = res.data;
                        //内置超级管理员可以跳过
                        if(ret.data.role_id!=1){
                            $rootScope.sys_menu = myServiceUtil.get_menu_by_purview(ret.data.purview);
                        }
                        //权限保存在localstorage
                        $util.setStorage('sys_menu',$rootScope.sys_menu);
                        return;
                    })
                    //获取用户习惯
                    myServiceUtil.get_config_table_set(ret.data.user_id);
                }else{
                	$scope.login_data.password = '';
                    $util.setcookie('captcha', ret.data, 2);
                }

                //登录失败次数超过2次，出现验证码输入框
                if(ret.status!=1&&ret.data>2){
                    $scope.captcha.captcha_show = true;
                    $scope.captcha.url = 'index.php?app_act=index/login_create_verify_graph&amp;' + Math.random();
                }

                return ret;
            });
        }

        //刷新新验证码动作
        $scope.captcha_refresh = function(){
            $scope.captcha.url = 'index.php?app_act=index/login_create_verify_graph&amp;' + Math.random();
        }
    }];
//左侧垂直菜单栏控制器
var ComponentMenuCtrl = ['$rootScope', '$scope', '$location', '$window',
    function ($rootScope, $scope, $location, $window) {
        //获取二级菜单
        $rootScope.sub_menu = [];
        //二级菜单组的显示状态  下标为purview_id
        $rootScope.sub_menu_show = [];

        //一级菜单点击动作，切换到相应的二级菜单组
        //传入二级菜单组数据和对应的一级菜单下标
        $scope.click_menu1 = function(m, index){
            $rootScope.sub_menu = m.child;
            $rootScope.menu1_id = m.purview_id;
            $rootScope.menu1_name = m.name;
            //$rootScope.menu1_index = index;

            //侧边栏展开
            $rootScope.slideShow();

            //默认展开
            // $rootScope.sub_menu.forEach(function(i){
            //     if($rootScope.sub_menu_show[i.purview_id]==undefined){
            //         $rootScope.sub_menu_show[i.purview_id] = true;
            //     }
            // });
        }

        //首页点击动作, 关闭侧边栏并跳转到首页
        $scope.click_index = function(){
            $rootScope.menu1_id = 0;
            //$rootScope.menu1_index = 0;
            $rootScope.slideHide();
            $scope.goto('/dashboard');
        }

        //收藏按钮点击动作，切换到收藏菜单组
        //收菜数据由登录时，login接口返回
        $scope.click_fav = function(){
            $rootScope.sub_menu = [];
            $rootScope.menu1_id = 'fav';
            //$rootScope.menu1_index = 'fav';
            $rootScope.menu1_name = '收藏夹';
            //侧边栏展开
            $rootScope.slideShow();
        }

        //二级菜单组标题点击，显示或隐藏二级菜单组
        //传入二级菜单组purview_id
        $scope.click_menu2 = function(purview_id){
            if($rootScope.sub_menu_show[purview_id]==undefined){
                $rootScope.sub_menu_show[purview_id] = false;
                return;
            }
            $rootScope.sub_menu_show[purview_id] = !$rootScope.sub_menu_show[purview_id];
        };

        //传入三级菜单数据
        $scope.click_menu3 = function(m){
            $location.path(m.url);
            $rootScope.shrink = true;
            $rootScope.stretch = true;
        }

        //侧边栏收缩展开切换
        $rootScope.shrink = true;
        $rootScope.stretch = true;
        $rootScope.slideToggle = function(){
            if($rootScope.shrink){
                $rootScope.slideShow();
            }else{
                $rootScope.slideHide();
            };
        }

        //侧边栏关闭
        $rootScope.slideHide = function(){
            $rootScope.shrink = true;
            $rootScope.stretch = true;
        }
        //侧边栏开启
        $rootScope.slideShow = function(){
            if($rootScope.menu1_id==0){
                return;
            }
            $rootScope.shrink = false;
            $rootScope.stretch = false;
        }
    }];
//顶端横版导航条的控制器
var ComponentNavCtrl = ['$rootScope', '$scope', '$location', '$window','ngDialog','myServiceUtil','api',
    function ($rootScope, $scope, $location, $window, ngDialog, myServiceUtil, api) {
		$scope.data = {
            'form_data': {},		    //修改密码数据
            'license_data':{}			//授权信息数据
        };
        //用于显示在导航条上的当前用户名
        $rootScope.info_user_name = $util.getcookie('user_name');

        //退出登录，并清空cookie
        $scope.logout = function(){
            $rootScope.login = false;
            $util.removecookie('user_code');
            $util.removecookie('is_login');
            $util.removecookie('user_name');
            $util.removecookie('role_name');
            $util.removecookie('purview');
        }
		
		var change_pass_dialog = '';
        //更换密码
        $scope.change_pass = function(){
            change_pass_dialog = ngDialog.open({
                overlay: true,
                disableAnimation: true,
                showClose: true,
                closeByDocument: false,
                width: 500,
                template: 'html/component/ComponentChangePass.html',
                scope: $scope
            });
        }

        //查看授权消息
        $scope.warrant = function(){
        	api.request('get_icrm_license', {}).then(function (ret) {
        		if(ret.status == 1){
        			$scope.data.license_data = ret.data;
        		}
			});
            var warrant_dialog = ngDialog.open({
                overlay: true,
                disableAnimation: true,
                showClose: true,
                closeByDocument: false,
                width: 750,
                template: 'html/component/ComponentWarrant.html',
                scope: $scope
            });
        }

        //菜单搜索提示框
        $scope.search_prompt_on = false;
        $scope.search_data = {};
        $scope.search_result = [];
        //菜单搜索功能，当菜单搜索内的值发生变化时进行实时搜索
        $scope.search_prompt = function(){
            if($scope.search_data.keywords==''){
                return;
            }
            $scope.search_result = myServiceUtil.get_menu_by_keywords($scope.search_data.keywords, 5);
            if($scope.search_result.length>0){
                $scope.search_prompt_on = true;
            }
        }
        //关闭结果框
        $scope.search_prompt_hide = function(){
            $scope.search_prompt_on = false;
        }
        //开启结果框
        $scope.search_prompt_show = function(){
            if($scope.search_result.length>0){
                $scope.search_prompt_on = true;
            }
        }
        //点击跳转
        $scope.search_result_click = function(m){
            $scope.goto(m.url);
            $scope.search_prompt_hide();
        }
        
        //提交修改密码
        $scope.form_save = function () {
        	if($scope.data.form_data.pass_old == '' || $scope.data.form_data.pass_old == undefined){
        		$scope.notice('原密码不能为空！');
        		return;
        	}
        	if($scope.data.form_data.pass_new == '' || $scope.data.form_data.pass_new == undefined){
        		$scope.notice('新密码！');
        		return;
        	}
        	if($scope.data.form_data.pass_new2 == '' || $scope.data.form_data.pass_new2 == undefined){
        		$scope.notice('新密码确认！');
        		return;
        	}
        	if($scope.data.form_data.pass_new != $scope.data.form_data.pass_new2){
        		$scope.notice('2次新密码不一致！');
        		return;
        	}
        	var post_data = {
        		pass_old:'',
        		pass_new:'',
        		pass_new2:'',
        		user_id:'',
        	};
        	post_data.pass_old = $.md5($scope.data.form_data.pass_old);
        	post_data.pass_new = $.md5($scope.data.form_data.pass_new);
        	post_data.pass_new2 = $.md5($scope.data.form_data.pass_new2);
        	post_data.user_id = $util.getcookie('user_id');
            api.request('sys/user/change_password', post_data).then(function (ret) {
                if(ret.status == 1){
                    $scope.notice('修改成功');
                    ngDialog.close(change_pass_dialog);
                    $scope.logout();
                    $scope.data.form_data = {};
                }
            });
        }


    }];
var ComponentTabCtrl = ['$rootScope', '$scope', '$location', '$window',
    function ($rootScope, $scope, $location, $window) {
        //点击TAB页面
        $rootScope.click_tab = function(url){
            $location.path(url);
        }

        //关闭TAB页面
        $rootScope.close_tab = function (k) {
            if(k=='/dashboard'){
                return;
            }
            delete $rootScope.histroy[k];
            if($rootScope.histroy_url && $rootScope.histroy.hasOwnProperty($rootScope.histroy_url)){
                $location.path($rootScope.histroy_url);
            }else{
                $location.path('/dashboard');
            }
            $location.replace();
        };

        //关闭全部TAB页面
        $rootScope.close_tab_all = function(){
            $scope.confirm('确定要关闭全部页签嘛？',function(){
                for (var key in $rootScope.histroy) {
                    if ($rootScope.histroy.hasOwnProperty(key) && key!='/dashboard') {
                        delete $rootScope.histroy[key];
                    }
                }
                $location.path('/dashboard');
                $location.replace();
            });
        };

        //TAB滚动
        $scope.tab_scroll = function(direction){
            var sl=$("#tab_ul").scrollLeft();
            $("#tab_ul").stop();
            if(direction=='left'){
                $("#tab_ul").animate({
                    scrollLeft: sl+=300
                }, 1000);
            }else if (direction=='right') {
                $("#tab_ul").animate({
                    scrollLeft: sl-=300
                }, 1000);
            };
        }

    }];
var ComponentTitleCtrl = ['$rootScope', '$scope',
    function ($rootScope, $scope ) {
    }
];
/**
 * 新增控制器
 */
var DemoAddCtrl = ['$rootScope', '$scope', '$location', '$window', 'api', 'valid',
    function ($rootScope, $scope, $location, $window, api, valid) {
        //本页面的各种属性数据
        var data = {
            'title': '示例新增',
            'form_data': {
                'address_array': {}
            }
        };
        $scope.data = $scope.construct(data, 'demo/add');
        //标题栏按钮动作 ===============================================
        $scope.title_data = [
            { 'ico': 'glyphicon-th-list', 'name': '列表', 'click': function(){ $location.path('/demo/index') } }
        ];
        //表单按钮动作 =================================================
        $scope.form_save = function () {
            var ret = valid.check([
                { 'key': 'customer_name', 'valid': 'check_required', 'data': $scope.data.form_data.customer_name, 'tip': '顾客名称必填' },
                { 'key': 'customer_tel', 'valid': 'check_required', 'data': $scope.data.form_data.customer_tel, 'tip': '顾客手机号必填' },
                { 'key': 'org_code', 'valid': 'check_required', 'data': $scope.data.form_data.org_code, 'tip': '渠道必填' },
                { 'key': 'shop_code', 'valid': 'check_required', 'data': $scope.data.form_data.shop_code, 'tip': '店铺必填' }
            ]);
            $scope.valid = ret.data;
            if (!ret.status) {
                //alert('表单验证失败');
                return;
            }
            api.request('demo/add', { 'form_data': $scope.data.form_data }).then(function (result) {
                if(false!==result){
                    $location.path('/demo/index');
                }
            });
        }

        $scope.form_cancel = function () {
            $scope.data.form_data = {
                'address_array': {}
            };
        }

    }];

DemoAddCtrl.$injector = ['$rootScope', '$scope', '$location', '$window', 'api', 'valid'];
/**
 * 新增样例页面控制器
 * @author zuojianghua<28842136@qq.com>
 * @date 2016-08-10
 */
var DemoAutoCtrl = ['$rootScope', '$scope', '$location', '$window', 'api', '$http', 'ngDialog',
    function ($rootScope, $scope, $location, $window, api,$http,ngDialog) {
        //本页面的各种属性数据
        var data = {
            'title':'代码自动生成器',
            'form_data':{
                'ctrl_array':[{}]
            },
            'valid_option': {
                'check_eq': '验证是否相等',
                'check_email': '验证邮箱',
                'check_tel': '验证手机号',
                'check_number': '验证数字',
                'check_positive': '验证正整数'
            }
        };

        $scope.data = $scope.construct(data,'demo/auto');

        //配置需要生成的控制器、控制器名称和对应的API接口
        $scope.auto_configs = [
            ['VIP卡档案','crm/vip/index','crm/vip/get_list'],
            ['积分调整单','crm/integral_adjust_record/do_index','crm/integral_adjust_record/get_list'],
            ['新增积分调整单','crm/integral_adjust_record/add','crm/integral_adjust_record/add'],
            ['查看积分调整单','crm/integral_adjust_record/edit','crm/integral_adjust_record/get_detail'],
            ['积分变现单','crm/integral_realize_record/do_index','crm/integral_realize_record/get_list'],
            ['新增积分变现单','crm/integral_realize_record/add','crm/integral_realize_record/add'],
            ['查看积分变现单','crm/integral_realize_record/edit','crm/integral_realize_record/get_detail'],
            ['VIP卡制成投放单','crm/make_card_record/index','crm/make_card_record/get_list'],
            ['新增制成投放单','crm/make_card_record/add','crm/make_card_record/add'],
            ['查看制成投放单','crm/make_card_record/edit','crm/make_card_record/get_detail'],
            ['VIP投放','crm/make_card_record/put','crm/make_card_record/put'],
            ['VIP卡作废','crm/make_card_record/cancel','crm/make_card_record/cancel'],
            ['手机号码变更单','crm/change_tel/index','crm/change_tel/get_list'],
            ['查看手机号码变更','crm/change_tel/edit','crm/change_tel/get_detail'],
            ['VIP等级变更单','crm/move_level/index','crm/move_level/get_list'],
            ['新增VIP等级变更','crm/move_level/add','crm/move_level/add'],
            ['查看VIP等级变更','crm/move_level/edit','crm/move_level/get_detail'],
            ['VIP消费转移单','crm/trans_consume/index','crm/trans_consume/get_list'],
            ['新增VIP消费转移','crm/trans_consume/add','crm/trans_consume/add'],
            ['查看VIP消费转移','crm/trans_consume/edit','crm/trans_consume/get_detail'],

            ['VIP开卡策略','tactic/vip_activate_card_rule/index','tactic/vip_activate_card_rule/get_list'],
            ['新增开卡策略','tactic/vip_activate_card_rule/add','tactic/vip_activate_card_rule/add'],
            ['查看开卡策略','tactic/vip_activate_card_rule/edit','tactic/vip_activate_card_rule/get_detail'],
            ['VIP卡停用策略','tactic/vip_disuse_card_rule/index','tactic/vip_disuse_card_rule/get_list'],
            ['新增停用策略','tactic/vip_disuse_card_rule/add','tactic/vip_disuse_card_rule/add'],
            ['查看停用策略','tactic/vip_disuse_card_rule/edit','tactic/vip_disuse_card_rule/get_detail'],
            ['VIP卡升级策略','tactic/vip_upgrade_rule/index','tactic/vip_upgrade_rule/get_list'],
            ['新增升级策略','tactic/vip_upgrade_rule/add','tactic/vip_upgrade_rule/add'],
            ['查看升级策略','tactic/vip_upgrade_rule/edit','tactic/vip_upgrade_rule/get_detail'],
            ['VIP卡降级策略','tactic/vip_degrade_rule/index','tactic/vip_degrade_rule/get_list'],
            ['新增降级策略','tactic/vip_degrade_rule/add','tactic/vip_degrade_rule/add'],
            ['查看降级策略','tactic/vip_degrade_rule/edit','tactic/vip_degrade_rule/get_detail'],
            ['VIP卡合并策略','tactic/crm_bind/index','tactic/crm_bind/get_list'],
            ['VIP积分抵现策略','tactic/integral_withdrawals/index','tactic/integral_withdrawals/get_list'],
            ['新增抵现策略','tactic/integral_withdrawals/add','tactic/integral_withdrawals/add'],
            ['查看抵现策略','tactic/integral_withdrawals/edit','tactic/integral_withdrawals/get_detail'],
            ['生日优惠策略','tactic/birthday_favour/index','tactic/birthday_favour/get_list'],
            ['新增生日优惠','tactic/birthday_favour/add','tactic/birthday_favour/add'],
            ['查看生日优惠','tactic/birthday_favour/edit','tactic/birthday_favour/get_detail'],
            ['积分兑换策略','tactic/integral_redeem/index','tactic/integral_redeem/get_list'],
            ['新增积分兑换策略','tactic/integral_redeem/add','tactic/integral_redeem/add'],
            ['查看积分兑换策略','tactic/integral_redeem/edit','tactic/integral_redeem/get_detail'],
            ['短信模板','sys/e_message_template/index','sys/e_message_template/get_list'],
            ['新增短信模板','sys/e_message_template/add','sys/e_message_template/add'],
            ['查看短信模板','sys/e_message_template/edit','sys/e_message_template/get_detail'],
            ['短信策略','sys/e_message_strategy/index','sys/e_message_strategy/get_list'],
            ['新增短信策略','sys/e_message_strategy/add','sys/e_message_strategy/add'],
            ['查看短信策略','sys/e_message_strategy/edit','sys/e_message_strategy/get_detail'],
            ['短信业务节点','','sys/e_message_template/get_all_e_message_nodes'],
            
            ['颜色','base/color/index','base/color/get_list'],
            ['新增颜色','base/color/add','base/color/add'],
            ['查看颜色','base/color/edit','base/color/get_detail'],
            ['尺码','base/size/index','base/size/get_list'],
            ['新增尺码','base/size/add','base/size/add'],
            ['查看尺码','base/size/edit','base/size/get_detail'],
            ['品牌','base/brand/index','base/brand/get_list'],
            ['新增品牌','base/brand/add','base/brand/add'],
            ['查看品牌','base/brand/edit','base/brand/get_detail'],
            ['分类','base/category/index','base/category/get_list'],
            ['新增分类','base/category/add','base/category/add'],
            ['查看分类','base/category/edit','base/category/get_detail'],
            ['品类','base/sort/index','base/sort/get_list'],
            ['新增品类','base/sort/add','base/sort/add'],
            ['查看品类','base/sort/view','base/sort/get_detail'],
            ['年度','base/year/index','base/year/get_list'],
            ['新增年度','base/year/add','base/year/add'],
            ['查看年度','base/year/view','base/year/get_detail'],
            ['季节','base/season/index','base/season/get_list'],
            ['新增季节','base/season/add','base/season/add'],
            ['查看季节','base/season/view','base/season/get_detail'],
            ['系列','base/series/index','base/series/get_list'],
            ['新增系列','base/series/add','base/series/add'],
            ['查看系列','base/series/edit','base/series/get_detail'],
            ['单位','base/unit/index','base/unit/get_list'],
            ['新增单位','base/unit/add','base/unit/add'],
            ['查看单位','base/unit/edit','base/unit/get_detail'],
            ['渠道','base/org/index','base/org/get_list'],
            ['新增渠道','base/org/add','base/org/add'],
            ['查看渠道','base/org/view','base/org/get_detail'],
            ['城市','base/city/index','base/city/get_list'],
            ['查看城市','base/city/edit','base/city/get_detail'],
            ['来源','base/source/index','base/source/get_list'],
            ['查看来源','base/source/edit','base/source/get_detail'],
            ['导购','base/guide/index','base/guide/get_list'],
            ['店铺','base/shop/index','base/shop/get_list'],
            ['查看店铺','base/shop/edit','base/shop/get_detail'],
            ['区域','base/area/index','base/area/get_list'],
            ['新增区域','base/area/add','base/area/add'],
            ['查看区域','base/area/edit','base/area/get_detail'],
            ['商品','base/goods/index','base/goods/get_list'],
            ['新增商品','base/goods/add','base/goods/add'],
            ['查看商品','base/goods/edit','base/goods/get_detail'],

            ['充值方式','crm/card_recharge/index','crm/card_recharge/get_list'],
            ['新增充值方式','crm/card_recharge/add','crm/card_recharge/add'],
            ['查看充值方式','crm/card_recharge/edit','crm/card_recharge/get_detail'],
            ['储值卡类别','crm/card_category/index','crm/card_category/get_list'],
            ['新增储值卡类别','crm/card_category/add','crm/card_category/add'],
            ['查看储值卡类别','crm/card_category/edit','crm/card_category/get_detail'],
            ['储值卡资料','crm/prepaid_card/index','crm/prepaid_card/get_list'],
            ['查看储值卡资料','crm/prepaid_card/edit','crm/prepaid_card/get_detail'],
            ['储值卡制成投放单','crm/prepaid_card_make_record/index','crm/prepaid_card_make_record/get_list'],
            ['新增储值卡投放','crm/prepaid_card_make_record/add','crm/prepaid_card_make_record/add'],
            ['查看储值卡投放','crm/prepaid_card_make_record/edit','crm/prepaid_card_make_record/get_detail'],
            ['投放储值卡','crm/prepaid_card_make_record/put','crm/prepaid_card_make_record/put'],
            ['储值卡销售单','crm/prepaid_card_sell_record/index','crm/prepaid_card_sell_record/get_list'],
            ['新增储值卡销售','crm/prepaid_card_sell_record/add','crm/prepaid_card_sell_record/add'],
            ['查看储值卡销售','crm/prepaid_card_sell_record/edit','crm/prepaid_card_sell_record/get_detail'],
            ['储值卡充值单','crm/prepaid_recharge/index','crm/prepaid_recharge/get_list'],
            ['新增储值卡充值','crm/prepaid_recharge/add','crm/prepaid_recharge/add'],
            ['查看储值卡充值','crm/prepaid_recharge/edit','crm/prepaid_recharge/get_detail'],
            ['储值卡退款单','crm/prepaid_refund/index','crm/prepaid_refund/get_list'],
            ['新增储值卡退款','crm/prepaid_refund/add','crm/prepaid_refund/add'],
            ['查看储值卡退款','crm/prepaid_refund/edit','crm/prepaid_refund/get_list'],
            ['储值卡号','crm/prepaid_card_make_record/get_list_detail','crm/prepaid_card_make_record/get_list_detail'],

            ['营销活动','crm/workflow/index','crm/workflow/get_list'],
            ['新增营销活动','crm/workflow/add','crm/workflow/add'],
            ['查看营销活动','crm/workflow/edit','crm/workflow/get_detail'],
            ['活动屏蔽目标组','crm/workflow_remove/index','crm/workflow_remove/get_list'],
            ['新增目标组','crm/workflow_remove/add','crm/workflow_remove/add'],
            ['查看目标组','crm/workflow_remove/edit','crm/workflow_remove/get_detail'],
            ['营销活动类型','crm/workflow_marketing/index','crm/workflow_marketing/get_list'],
            ['新增活动类型','crm/workflow_marketing/add','crm/workflow_marketing/add'],
            ['查看活动类型','crm/workflow_marketing/edit','crm/workflow_marketing/get_detail'],
            ['营销模板','crm/workflow_template/index','crm/workflow_template/get_list'],
            ['新增营销模板','crm/workflow_template/add','crm/workflow_template/add'],
            ['查看营销模板','crm/workflow_template/get_detail','crm/workflow_template/get_detail'],
            ['促销活动','crm/ipos_promotion/get_list','crm/ipos_promotion/get_list'],

            ['优惠券制成单','crm/coupon_made/index','crm/coupon_made/get_list'],
            ['新增优惠券制成','crm/coupon_made/add','crm/coupon_made/add'],
            ['查看优惠券制成','crm/coupon_made/edit','crm/coupon_made/get_detail'],
            ['批量发放优惠券','crm/coupon_made/send_all','crm/coupon_made/send_all'],
            ['优惠券一览','crm/coupon_made/detail_coupon',''],

            ['客服来电记录','crm/tel_information/index','crm/tel_information/get_list'],
            ['新增来电记录','crm/tel_information/add','crm/tel_information/add'],
            ['查看来电记录','crm/tel_information/view','crm/tel_information/get_detail'],
            ['客服回访记录','crm/return_visit_record/index','crm/return_visit_record/get_list'],
            ['新增回访记录','crm/return_visit_record/add','crm/return_visit_record/add'],
            ['查看回访记录','crm/return_visit_record/edit','crm/return_visit_record/get_detail'],

            ['粉丝档案','wechat/vip/index','wechat/vip/get_list'],
            ['微信素材库','wechat/weixin_img/index','wechat/weixin_img/get_list'],
            ['新建单图文素材','wechat/weixin_img/add_single_img','wechat/weixin_img/add_single_img'],
            ['新建多图文素材','wechat/weixin_img/add_multigraph','wechat/weixin_img/add_multigraph'],
            ['微信高级群发','wechat/weixin_senior_group_news/index','wechat/weixin_senior_group_news/get_list'],
            ['新增微信群发','wechat/weixin_senior_group_news/add','wechat/weixin_senior_group_news/add'],
            ['查看微信群发','wechat/weixin_senior_group_news/edit','wechat/weixin_senior_group_news/get_detail'],
            ['微信问卷调查','wechat/survey/index','wechat/survey/get_list'],
            ['微信抽奖活动','wechat/weixin_lottery/index','wechat/weixin_lottery/get_list'],
            ['新增抽奖活动','wechat/weixin_lottery/add','wechat/weixin_lottery/add'],
            ['查看抽奖活动','wechat/weixin_lottery/view','wechat/weixin_lottery/get_detail'],
            ['优惠券分享','wechat/share_coupon/index','wechat/share_coupon/get_list'],
            ['新增优惠券分享','wechat/share_coupon/add','wechat/share_coupon/add'],
            ['查看优惠券分享','wechat/share_coupon/edit','wechat/share_coupon/get_detail'],
            ['优惠券','crm/coupon/get_list','crm/coupon/get_list'],
            ['图文素材','wechat/weixin_img/get_list','wechat/weixin_img/get_list'],

            ['礼品分类','wechat/gift/category/index','wechat/gift/category/get_list'],
            ['新增礼品分类','wechat/gift/category/add','wechat/gift/category/add'],
            ['编辑礼品分类','wechat/gift/category/edit','wechat/gift/category/get_detail'],
            ['礼品列表','wechat/gift/gift/index','wechat/gift/gift/get_list'],
            ['新增礼品列表','wechat/gift/gift/add','wechat/gift/gift/add'],
            ['查看礼品列表','wechat/gift/gift/edit','wechat/gift/gift/get_detail'],
            ['积分区间','wechat/gift/integral/index','wechat/gift/integral/get_list'],
            ['新增积分区间','wechat/gift/integral/add','wechat/gift/integral/add'],
            ['查看积分区间','wechat/gift/integral/edit','wechat/gift/integral/get_detail'],
            ['礼品订单','wechat/gift_record/index','wechat/gift_record/get_list'],
            ['查看礼品订单','wechat/gift_record/edit','wechat/gift_record/get_detail'],
            ['未审核订单','wechat/gift_record_new/index','wechat/gift_record_new/get_list'],
            ['已审核订单','wechat/gift_record_audit/index','wechat/gift_record_audit/get_list'],
            ['已发货订单','wechat/gift_record_ship/index','wechat/gift_record_ship/get_list'],
            ['已完成订单','wechat/gift_record_complete/index','wechat/gift_record_complete/get_list'],
            ['已取消订单','wechat/gift_record_cancel/index','wechat/gift_record_cancel/get_list'],
            ['未审核退单','wechat/gift_record_return/index','wechat/gift_record_return/get_list'],
            ['查看退单','wechat/gift_record_return/edit','wechat/gift_record_return/get_detail'],
            ['已审核退单','wechat/gift_record_return_audit/index','wechat/gift_record_return_audit/get_list'],
            ['已完成退单','wechat/gift_record_return_complete/index','wechat/gift_record_return_complete/get_list'],
            ['商品评价回复','base/evaluate_goods/index','base/evaluate_goods/get_list']
        ];

        //将首字母转换成大写的方法
        var strtoUp = function(str){
            if(typeof str == 'undefined') return '';
            return str.replace(/(\w)/,function(v){
                return v.toUpperCase();
            });
        }
        //将_连接的字符串转换成驼峰大写
        var strtoUp2 = function(str){
            if(typeof str == 'undefined') return '';
            var p = str.split('_');
            var r = '';
            p.forEach(function(o){
                r += strtoUp(o);
            });
            return r;
        }

        //自动生成路径
        $scope.generate_path = function(){
            $scope.data.form_data.ctrl_array.forEach(function(o){
                //o.ctrl_name;
                var p = o.ctrl_name.split('/');
                o.ctrl_class = strtoUp2(p[0])
                            +strtoUp2(p[1])
                            +strtoUp2(p[2])
                            +'Ctrl';
                o.ctrl_path = 'controller/'+p[0]+'/'+p[1]+'/'
                            +strtoUp2(p[0])
                            +strtoUp2(p[1])
                            +strtoUp2(p[2])
                            +'Ctrl.js';
                o.html_path = 'html/'+p[0]+'/'+p[1]+'/'
                            +strtoUp2(p[0])
                            +strtoUp2(p[1])
                            +strtoUp2(p[2])+'.html';
                
                o.html_script = '<script src="'+o.ctrl_path+'"></script>'+"\n";
                o.app_script = ".when('/"+o.ctrl_name+"', { templateUrl: '"+o.html_path+"', controller:  "+o.ctrl_class+"})"+"\n";

                //自动协助判断是否新增列表编辑页面
                if(o.ctrl_name.indexOf('index')!=-1){
                    o.ctrl_type = 'list';
                }
                if(o.ctrl_name.indexOf('edit')!=-1||o.ctrl_name.indexOf('view')!=-1){
                    o.ctrl_type = 'view';
                }
                if(o.ctrl_name.indexOf('add')!=-1){
                    o.ctrl_type = 'add';
                }


            });

            //生成自动引用脚本
            $scope.data.form_data.html_script = "";
            $scope.data.form_data.app_script = "";
            $scope.data.form_data.ctrl_array.forEach(function(o){
                $scope.data.form_data.html_script += o.html_script;
                $scope.data.form_data.app_script += o.app_script;
            });

        }

        //验证API
        $scope.get_api = function(ul){
            ul.table_fields = [];
            api.request(ul.ctrl_api).then(function(ret){
                ul.api_data = ret.data;
                for(i in ret.data.data[0]){
                    ul.table_fields.push({
                        'keyword':i,
                        'label':'',
                        'orders':''
                    });
                }
            });
            //console.log($scope.data);
        }

        //保存动作
        //提交给PHP程序自动生成相应代码
        $scope.form_save = function(){
            $scope.dialog_title = '自动生成相应代码...';
            open_save_window_id = ngDialog.open({
                overlay: true,
                disableAnimation: true,
                showClose: true,
                width: '',
                template: 'html/demo/DemoAutoDialogSave.html',
                scope: $scope
            });
            $http.post('angular.php', $scope.data.form_data).then(function(ret){
                console.log(ret.data);
                $scope.result = ret.data;
            });
        }

        //批量从金智电脑获取API演示数据
        $scope.get_api_data = function(){
            $scope.dialog_title = '获取API演示数据...';
            $scope.result = {'执行中请稍等...':true};
            open_select_window_id = ngDialog.open({
                overlay: true,
                disableAnimation: true,
                showClose: true,
                width: '',
                template: 'html/demo/DemoAutoDialogApi.html',
                scope: $scope
            });
            $http.post('get_api_data.php', {data:$scope.auto_configs}).then(function(ret){
                $scope.result = ret.data;
            });
        }

        //查看全部需要完成的页面
        //可以点击页面内的控制器自动进行下一步操作
        var open_list_window_id;
        $scope.show_all_pages = function(){
            $scope.dialog_title = '查看全部页面';
            $scope.result = $scope.auto_configs;
            open_list_window_id = ngDialog.open({
                overlay: true,
                disableAnimation: true,
                showClose: true,
                width: '',
                template: 'src/html/demo/DemoAutoDialogPage.html',
                scope: $scope
            });
            $http.post('check_file_status.php', {data:$scope.auto_configs}).then(function(ret){
                $scope.result = ret.data;
            });
        }

        //弹框中点击某个控制器
        //自动填入各参数并调用地址生成方法和API数据获取方法
        $scope.click_ctrl = function(p){
            ngDialog.close(open_list_window_id);
            $scope.data.form_data.ctrl_array[0].ctrl_name = p.ctrl;
            $scope.data.form_data.ctrl_array[0].ctrl_title = p.title;
            $scope.data.form_data.ctrl_array[0].ctrl_api = p.api;
            $scope.generate_path();
            $scope.get_api($scope.data.form_data.ctrl_array[0]);
        }

        $scope.title_data = [
            { 'ico': 'glyphicon-refresh', 'name': '获取API演示数据', 'click': function() { $scope.get_api_data() } },
            { 'ico': 'glyphicon-th-list', 'name': '查看全部页面', 'click': function() { $scope.show_all_pages() } }
        ];


    }];

DemoAutoCtrl.$injector = ['$rootScope', '$scope', '$location', '$window','api','$http','ngDialog'];
/**
 * 列表样例页面控制器
 * @author zuojianghua<28842136@qq.com>
 * @date 2016-08-10
 */
var DemoListCtrl = ['$rootScope', '$scope', '$location', '$window', 'api',
    function ($rootScope, $scope, $location, $window, api) {
        //本页面的各种属性数据
        var data = {
            'title':'标题',
            'list_data': [],
            'page_data': {},
            'search_data': {}
        };
        $scope.data = $scope.construct(data,'demo/list');

        //清空搜索条件
        $scope.form_clear = function () {
            $scope.data.search_data = {};
        }

        //数据查询
        $scope.form_search = function () {
            api.request('demo/get_list', { 'search_data': $scope.data.search_data, 'page_data': $scope.data.page_data }).then(function (result) {
                if(result.status==1){
                    $scope.data.list_data = result.data.data;
                    $scope.data.page_data = result.data.page_data;
                }
                console.log($scope.data.list_data);
            });
        }

        //首次进入先查询一次
        if ($scope.data.list_data == undefined || $scope.data.list_data.length == 0) {
            $scope.form_search();
        }

        $scope.title_data = [
            { 'ico': 'glyphicon-plus', 'name': '新增', 'click': function() { $location.path('/crm/vip_level/add') } }
        ];

    }];

DemoListCtrl.$injector = ['$rootScope', '$scope', '$location', '$window', 'api'];

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
/**
 * 查看样例页面控制器
 * @author zuojianghua<28842136@qq.com>
 * @date 2016-08-10
 */
var DemoViewCtrl = ['$rootScope', '$scope', '$location', '$window',
    function ($rootScope, $scope, $location, $window) {
        $rootScope.nav  = 'n0';           //一级菜单标识
        $rootScope.menu = 'm1';           //二级菜单标识
        $rootScope.subMenu = 's02';        //三级菜单标识
        $rootScope.url  = '/demo/view';     //本页url地址

        if (!$rootScope.histroy.hasOwnProperty('/demo/view')) {
            //Tab标签的顺序
            var order = Object.keys($rootScope.histroy);
            //本页面scope内的属性定义在此
            $scope = {
                title:'测试列表页',
                content:'',
                order:order
            };
            //纳入到tab历史中
            $rootScope.histroy['/demo/view'] = {
                scope:$scope,
                order:order
            };
        }else{
            //Tab标签的顺序
            var order = $rootScope.histroy['/demo/view'].order;
            $scope.order = order;
        }

    }];

DemoViewCtrl.$injector = ['$rootScope', '$scope', '$location', '$window'];
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
/**
 * 首页面板控制器
 */
var IndexDashboardCtrl = ['$rootScope', '$scope', '$location', '$window',
    function ($rootScope, $scope, $location, $window) {
        //本页面的各种属性数据
        var data = {
            'content':'测试数据',
            'title':'首页'
        };
        $scope.data = $scope.construct(data,'dashboard');
        console.log('111');
    }];

IndexDashboardCtrl.$injector = ['$rootScope', '$scope', '$location', '$window'];
var IndexMainCtrl = [
    '$rootScope', '$scope', '$location', '$window', '$timeout','$q', 
    'ngDialog', 'Popup',
    'api', 'myServiceUtil','myConfigSys','myServiceDatabind','myConfigUI','myServiceOptions',
    function (
        $rootScope, $scope, $location, $window, $timeout,$q, 
        ngDialog, Popup,
        api, myServiceUtil,myConfigSys,myServiceDatabind,myConfigUI,myServiceOptions) {
        //用户操作习惯
        $rootScope.config_table_set = {};
        //全局系统参数配置
        $rootScope.config_sys = myConfigSys;
        
        //全局登录验证 --------------------------------------------------------------
        //登录数据保存在ComponentLogin控制器
        //if(1==1){
        if($util.getcookie('user_code')&&$util.getcookie('is_login')=='true'){
            $rootScope.login = true;
            $rootScope.sys_menu = $util.getStorage('sys_menu');
            $rootScope.sys_menu_fav = $util.getStorage('sys_menu_fav');
            //获取用户习惯
            //myServiceUtil.get_config_table_set($util.getcookie('user_id'));
        }else{
            $rootScope.login = false;
            $rootScope.sys_menu = [];
            $rootScope.sys_menu_fav = [];
            //需要在登录的时候获取用户操作习惯数据
        }
        
        //页签历史记录处理  ---------------------------------------------------------
        $rootScope.histroy = {};
        $rootScope.$on('$routeChangeStart', function (evt, next, current) {
            //console.log(current, next);
            //保存上一个访问的url地址，用于关闭TAB页面后的切换
            if (typeof current != 'undefined' && typeof current.$$route != 'undefined') {
                $rootScope.histroy_url = current.$$route.originalPath;
                //console.log($rootScope.histroy_url);
            }

            //打开的TAB数量检测，超过一定数量则不允许再打开
            if (typeof $rootScope.histroy != 'undefined' && Object.keys($rootScope.histroy).length > 30) {
                $scope.alert('你打开了太多的TAB');
                evt.preventDefault();
                return;
            }

            //页面调试信息
            //console.log(next.$$route.originalPath);
            if (typeof next != 'undefined' && typeof next.$$route != 'undefined') {
                $scope.debug_router = next.$$route.originalPath;
            }
            //$scope.debug_router = next.$$route.originalPath;
            $scope.debug_wacth = [{"name":"","value":undefined}];
        });

        //页面调试动作
        $scope.debug_window = 0;
        $scope.add_watch = function(){
            $scope.debug_wacth.push({"name":"","value":""});
        }
        $scope.change_watch = function(v){
            v.value = ($rootScope[v.name])?$rootScope[v.name]:$rootScope.histroy[$scope.debug_router].scope.data[v.name];
        }
        $scope.del_watch = function(index){
            console.log(index);
            if($scope.debug_wacth.length>1){
                $scope.debug_wacth.splice(index,1);
            }else{
                $scope.debug_wacth = [{"name":"","value":undefined}];
            }
        }

        //选择器选项枚举 ---------------------------------------------------------
        $rootScope.search_data_option = $rootScope.form_data_option = myServiceOptions.option;
        //选择器枚举 -------------------------------------------------------------
        $rootScope.search_data_select = myServiceOptions.selector;
        //各类选择器方法 ---------------------------------------------------------
        //均返回promise
        $scope.select_department = myServiceDatabind.select_department;
        $scope.select_user = myServiceDatabind.select_user;

        //通用业务配置
        $scope.config = {};
        //拾色器通用配置
        $scope.config.color_picker_options = myConfigUI.color_picker_options;
        //所见即所得编辑器通用配置
        $scope.config.ta_toolbar_options = myConfigUI.ta_toolbar_options;

        //初始化子控制器，传入页面的data值和url --------------------------------------------
        var pager_conf_local = $util.getStorage('pager_conf_local')?$util.getStorage('pager_conf_local'):{}; 
        $scope.construct = function (data, url) {
            var menu = myServiceUtil.get_menu_by_url(url);
            $rootScope.menu1_id = menu.m1.purview_id||0;         //一级菜单标识
            $rootScope.menu2_id = menu.m2.purview_id;            //二级菜单标识
            $rootScope.menu3_id = menu.m3.purview_id;            //三级菜单标识

            //面包屑和当前菜单名称
            $rootScope.bread_menu = menu.m2.name + ' / ' + menu.m3.name;
            $rootScope.now_menu   = menu.m3.name;

            $rootScope.menu1_name = menu.m1.name;                //一级菜单名称
            $rootScope.sub_menu = menu.m1.child;                 //二级菜单显示

            var abs_url = $rootScope.url = url;                  //本页url地址

            //判断当前页面是否被收藏过
            $rootScope.collection = myServiceUtil.get_fav_status(abs_url);
            
            if (!$rootScope.histroy.hasOwnProperty(abs_url)) {
                //新打开页面
                //判断当前列表页面的表头设置情况, table_setting是否允许设置表头
                if(data.table_setting){
                    if(!$rootScope.config_table_set[url]||$rootScope.config_table_set[url]=='false'){
                        $rootScope.config_table_set[url] = {};
                    }
                    data.config_table_set_route = $rootScope.config_table_set[url];
                }
                //判断当前页面是否有分页设置
                if(data.page_data){
                    data.page_data.num = pager_conf_local[abs_url] ? parseInt(pager_conf_local[abs_url]) : 15;
                }

                //Tab标签的顺序
                var order = Object.keys($rootScope.histroy);
                //本页面scope内的属性定义在此

                //纳入到tab历史中
                $rootScope.histroy[abs_url] = {
                    scope: {data:data},
                    order: order
                };
                $scope.speak(data.title);
                return data;
            } else {
                //Tab标签的顺序
                //var order = $rootScope.histroy[abs_url].order;
                $scope.speak($rootScope.histroy[abs_url].scope.data.title);
                return $rootScope.histroy[abs_url].scope.data;
            }            
        };

        //页面跳转  -------------------------------------------------------------
        $scope.goto = function(url){
            $location.path(url);
            //$location.replace();
        }

        //页面收藏  -------------------------------------------------------------
        $scope.add_to_fave = function(){
            var user_id = $util.getcookie('user_id');
            var url = $rootScope.url;
            var data = {};
            if($rootScope.collection){
                //已收藏则取消收藏
                data = {url:url,user_id:user_id};
                api.request('del_fave',data).then(function(ret){
                    if(ret.status){
                        $rootScope.collection = !$rootScope.collection;
                        myServiceUtil.remove_from_fav(data);
                        $scope.notice(ret.message);
                    }
                });
            }else{
                //否则收藏
                var name = $rootScope.histroy[url].scope.data.title;
                data = {name:name,url:url,user_id:user_id};
                api.request('fave',data).then(function(ret){
                    if(ret.status){
                        $rootScope.collection = !$rootScope.collection;
                        myServiceUtil.add_to_fav(data);
                        $scope.notice(ret.message);
                    }
                });
            }
        }

        //页面刷新  -------------------------------------------------------------
        $scope.refresh = function(){

        }

        //页面额外搜索区域展开和隐藏 -----------------------------------------------
        $scope.toggle_search_field_more = function(i){
            i=!i;
        }

        //语音播报 --------------------------------------------------------------
        if(typeof $rootScope.config_sys.can_speak == 'undefined'){
            $rootScope.config_sys.can_speak = false;
        }
        $scope.speak = function(msg){
            if(!$rootScope.config_sys.can_speak){
                return;
            }
            if(typeof msg=='undefined'||msg==''){
                return;
            }
            $timeout(function(){
                var tts = $("<audio autoplay='autoplay'>语音播报</audio>").attr("src", 'http://tts.baidu.com/text2audio?lan=zh&pid=101&ie=UTF-8&text='+msg+'&spd=6');
                $("body").append(tts);
                tts[0].onended=function(){
                    tts.remove();
                };
            },0);
            
        }
        //提示信息 
        //https://aui.github.io/angular-popups/
        $scope.notice = function (msg, ok) {
            $scope.speak(msg);
            Popup.notice(msg, ok);
        }
        $scope.alert = function (msg, ok) {
            $scope.speak(msg);
            Popup.alert(msg, ok);
        }
        $scope.confirm = function (msg, ok, cancel) {
            $scope.speak(msg);
            Popup.confirm(msg, ok, cancel)
        }
        $scope.bubble = {};
        
        //表头列设置 ------------------------------------------------------------
        //route 要设置的页面地址
        //fields 该页面全部可设置的表头字段列表
        $scope.set_table_list_field = function(route, fields){
            //点击后弹出设置框，将不同的表头设置保存在localstorage
            var gopen_fields_window_id = ngDialog.open({
                overlay: true,
                disableAnimation: true,
                showClose: true,
                width: '400px',
                template: 'src/html/component/ComponentDialogTableSet.html',
                scope: $scope,
                controller : ['$rootScope','$scope',function($rootScope,$scope){
                    //初始化显示数据，弹框中的循环数据
                    $scope.fields_set = [];
                    if(!$rootScope.config_table_set[route]){
                        $rootScope.config_table_set[route] = {};
                    }
                    
                    //用传递进来的参数，生成弹框内的数据，其中value代表是否列头是否需要显示出来
                    fields.forEach(function(o){
                        $scope.fields_set.push({
                            'key':o.key,
                            'value':($rootScope.config_table_set[route][o.key]===false||$rootScope.config_table_set[route][o.key]==='false')?false:true,
                            'name':o.name
                        });
                    });
                    
                    //保存本页面的参数设置到localstorage
                    $scope.save_fields_set = function(){
                        $scope.fields_set.forEach(function(o){
                            if(o.value==false){
                                $rootScope.config_table_set[route][o.key] = false;
                            }else{
                                $rootScope.config_table_set[route][o.key] = true;
                            }
                        });
                        var user_id = $util.getcookie('user_id');
                        $util.setStorage('config_table_set_' + user_id, $rootScope.config_table_set);
                        //同时保存到服务器
                        api.request('sys/user_html_config/add',{user_id:user_id,url:route,context:$rootScope.config_table_set[route]}).then(function(ret){
                            if(ret.status==1){
                                $scope.notice('保存成功');
                            }
                        });
                        ngDialog.close(gopen_fields_window_id);
                    }
                }]
            });
        }

    }];

IndexMainCtrl.$injector = [
    '$rootScope', '$scope', '$location', '$window', '$timeout', '$q',
    'ngDialog', 'Popup',
    'api', 'myServiceUtil', 'myConfigSys', 'myServiceDatabind','myConfigUI','myServiceOptions'
];
/**
 * 
 * @author zuojianghua<28842136@qq.com>
 */
var JobsIndexCtrl = ['$rootScope', '$scope', '$location', '$window', 'api',
    function ($rootScope, $scope, $location, $window, api) {
        //本页面的各种属性数据
        var data = {
            'title':'标题',
            'list_data': [],
            'page_data': {},
            'search_data': {}
        };
        $scope.data = $scope.construct(data,'demo/list');

        //清空搜索条件
        $scope.form_clear = function () {
            $scope.data.search_data = {};
        }

        //数据查询
        $scope.form_search = function () {
            api.request('demo/get_list', { 'search_data': $scope.data.search_data, 'page_data': $scope.data.page_data }).then(function (result) {
                if(result.status==1){
                    $scope.data.list_data = result.data.data;
                    $scope.data.page_data = result.data.page_data;
                }
                console.log($scope.data.list_data);
            });
        }

        //首次进入先查询一次
        if ($scope.data.list_data == undefined || $scope.data.list_data.length == 0) {
            $scope.form_search();
        }

        $scope.title_data = [
            { 'ico': 'glyphicon-plus', 'name': '新增', 'click': function() { $location.path('/crm/vip_level/add') } }
        ];

    }];

JobsIndexCtrl.$injector = ['$rootScope', '$scope', '$location', '$window', 'api'];
/**
 * 入口控制器
 * @date 2016-12-03
 * create by angular.php 1.0
 * 模板变量
 * $date    生成日期
 * $version 生成版本号
 * $class_name 类名
 * $title   页面标题
 * $router  页面路由
 * $api     查询数据API地址
 * $valid   验证配置
 */
var DocRouteEntryCtrl = ['$rootScope', '$scope', '$location', '$window', 'api', 'valid',
    function ($rootScope, $scope, $location, $window, api, valid) {
        //本页面的各种属性数据
        //如果有初始值写在此处
        var data = {
            'title': '入口',
            'form_data': {
                'address_array': {}
            }
        };
        $scope.data = $scope.construct(data, 'doc/route/entry');
        //标题栏按钮动作 ===============================================
        $scope.title_data = [
            { 'ico': 'glyphicon-th-list', 'name': '列表', 'click': function() { $location.path('/doc/route/entry') } }
        ];
        //表单按钮动作 =================================================
        $scope.form_save = function () {
            var ret = valid.check([
                
            ]);
            $scope.valid = ret.data;
            if (!ret.status) {
                //alert('表单验证失败');
                return;
            }
            api.request('', { 'form_data': $scope.data.form_data }).then(function (result) {
                if(false!==result){
                    $location.path('/doc/route/entry');
                }
            });
        }

        $scope.form_cancel = function () {
            $scope.data.form_data = {
                'address_array': {}
            };
        }

    }];

DocRouteEntryCtrl.$injector = ['$rootScope', '$scope', '$location', '$window', 'api', 'valid'];
var myApp = angular.module('myApp', [
    'ngRoute',
    'ngDialog',
    'ngAnimate',
    'ngTouch',
    'myService',
    'myConfig',
    'myDirective',
    'myFilters',
    'ui.calendar',
    'color.picker',
    'textAngular',
    'ngFileUpload',
    'angular-echarts',
    'angular-popups',
    //'hc.marked'
    //'draw2d'
])
    .controller('IndexMainCtrl', IndexMainCtrl)
    .controller('ComponentNavCtrl', ComponentNavCtrl)
    .controller('ComponentMenuCtrl', ComponentMenuCtrl)
    .controller('ComponentTabCtrl', ComponentTabCtrl)
    .controller('ComponentLoginCtrl', ComponentLoginCtrl)
    .controller('ComponentTitleCtrl', ComponentTitleCtrl)
    .config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        //路由设置 =================================================
        $routeProvider
            
            .when('/dashboard', { templateUrl: 'html/index/IndexDashboard.html', controller: IndexDashboardCtrl })
            .when('/jobs/index', { templateUrl: 'html/jobs/JobsList.html', controller: JobsIndexCtrl })
        	// .when('/demo/list', { templateUrl: 'html/demo/DemoList.html', controller: DemoListCtrl })
            // .when('/demo/add', { templateUrl: 'html/demo/DemoAdd.html', controller: DemoAddCtrl })
            // .when('/demo/view', { templateUrl: 'html/demo/DemoView.html', controller: DemoViewCtrl })
            // .when('/demo/auto', { templateUrl: 'html/demo/DemoAuto.html', controller: DemoAutoCtrl })
            // .when('/demo/markdown/:name', { templateUrl: 'html/demo/DemoMarkdown.html', controller:  DemoMarkdownCtrl})
            // .when('/doc/:group/:md', { templateUrl: 'html/doc/DocMarkdown.html', controller:  DocMarkdownCtrl})
            .otherwise({ redirectTo: '/dashboard' });

        //HTTP异步设置 =============================================
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        /**
         * The workhorse; converts an object to x-www-form-urlencoded serialization.
         * @param {Object} obj
         * @return {String}
         */
        var param = function (obj) {
            var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
            for (name in obj) {
                value = obj[name];
                if (value instanceof Array) {
                    for (i = 0; i < value.length; ++i) {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                }
                else if (value instanceof Object) {
                    for (subName in value) {
                        subValue = value[subName];
                        fullSubName = name + '[' + subName + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                }
                else if (value !== undefined && value !== null)
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
            }
            return query.length ? query.substr(0, query.length - 1) : query;
        };

        // Override $http service's default transformRequest
        $httpProvider.defaults.transformRequest = [function (data) {
            return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
        }];
    }
    ]);
angular.module('myConfig', []).factory('myConfigSys', function () {
    return {
        "can_speak": false, //允许语音提示
        "fake_api": true,   //使用demo的api返回数据替换真实api
        "api_path": "",     //API访问路径
        "api_log": "none",  //none:不记录任何日志; debug:记录每次api请求的日志; error:仅记录错误返回的api日志
        "dump_mode": true,  //在当前页面弹框展示当前rootScope和scope的变量
        "app_path": "src",  //应用存放的路径前缀: 开发中使用src, 压缩混淆后使用build或服务器上具体存放路径，相对于index.html
        "has_fav": false    //是否拥有菜单收藏功能
    }
}).factory('myConfigUI', function () {
    return {
        //拾色器界面默认配置
        //https://github.com/ruhley/angular-color-picker
        color_picker_options: {
            'format': 'hex',
            'alpha': false,
            'close': {'show': false,'label': '关闭','class': ''},
            'clear': {'show': false,'label': '清除','class': ''},
            'reset': {'show': false,'label': '重置','class': ''}
        },
        //可视化编辑器界面默认配置
        //https://github.com/fraywing/textAngular/wiki
        ta_toolbar_options:[
            ['h1', 'h2', 'h3', 'p', 'bold', 'italics', 'strikeThrough', 'ul', 'ol'],
            ['indent', 'outdent', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
            ['insertImage', 'insertLink', 'insertVideo'],
            ['undo', 'redo', 'clear', 'html','charcount']
        ]
    }
});
var myDirective = angular.module("myDirective", []);
angular.module('myFilters', [])
    .filter('orderObjectBy', function () {
        return function (items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function (item) {
                filtered.push(item);
            });
            filtered.sort(function (a, b) {
                return (a[field] > b[field] ? 1 : -1);
            });
            if (reverse)
                filtered.reverse();
            return filtered;
        };
    })
    .filter('checkmark', function () {
        return function (input) {
            return (input===true||input==='true'||input===1||input==='1') ? '\u2713' : '\u2718';
        };
    }) 
    .filter('resolvetypemark', function () {
    	return function (input) {
			if(input=='0' || input==0){
				return '未处理';
			}else if(input=='-1' || input==-1){
				return '问题单';
			}else if(input=='1' || input==1){
				return '处理成功';
			}else{
				return '';
			}
        };
    })
    .filter('cancelmark', function () {
        return function (input) {
            return (input===true||input==='true'||input===1||input==='1') ? '\u2713' : '';
        };
    })
    .filter('transtypemark', function () {
        return function (input) {
            return (input===true||input==='true'||input===1||input==='1') ? '按消费单转移' : '全卡消费数据转移';
        };
    })
    .filter('sysmark', function () {
        return function (input) {
            return (input===true||input==='true'||input===1||input==='1') ? '是' : '否';
        };
    })
    .filter('finalmark', function () {
        return function (input) {
            return (input===true||input==='true'||input===1||input==='1') ? '是' : '否';
        };
    })
    .filter('distributortypemark', function () {
        return function (input) {
            return (input===true||input==='true'||input===1||input==='1') ? '实体店' : '网络店';
        };
    })
    .filter('handlemark', function () {
        return function (input) {
            return (input===true||input==='true'||input===1||input==='1') ? '已处理' : '未处理';
        };
    })
    .filter('imgtypemark', function () {
        return function (input) {
            return (input===true||input==='true'||input===1||input==='1') ? '多图文' : '单图文';
        };
    })
    .filter('logintypemark', function () {
        return function (input) {
            return (input===true||input==='true'||input===1||input==='1') ? '退出' : '登录';
        };
    })
    .filter('vipmark', function () {
        return function (input) {
            return (input===false||input==='false') ? '' : input;
        };
    })
    .filter('giftdistributortypemark', function () {
        return function (input) {
            return (input===true||input==='true'||input===1||input==='1') ? '部分' : '全部';
        };
    })
    .filter('deliverytypemark', function () {
        return function (input) {
            return (input===true||input==='true'||input===1||input==='1') ? '快递' : '自取';
        };
    })
    .filter('apistatusmark', function () {
        return function (input) {
            return (input===true||input==='true'||input===1||input==='1') ? '成功' : '失败';
        };
    })
    .filter('consumetypemark', function () {
        return function (input) {
            return (input===0||input==='0') ? '消费' : '退货';
        };
    })
    .filter('applicationscopemark', function () {
        return function (input) {
            return (input===1||input==='1') ? '全部' : '部分';
        };
    })
    .filter('birthscopemark', function () {
        return function (input) {
            return (input===1||input==='1') ? '全部' : '仅限生日会员';
        };
    })
    .filter('noticetypemark', function () {
        return function (input) {
            return (input===1||input==='1') ? '其他' : '活动公告';
        };
    })
    .filter('inputtypemark', function () {
        return function (input) {
            return (input===1||input==='1') ? '文本框' : '下拉框';
        };
    })
    .filter('noticestatusmark', function () {
        return function (input) {
			if(input=='0' || input==0){
				return '未确认';
			}else if(input=='1' || input==1){
				return '已确认';
			}else if(input=='2' || input==2){
				return '已审批';
			}else if(input=='3' || input==3){
				return '已作废';
			}else{
				return '';
			}
        };
    })
    .filter('favourmark', function () {
        return function (input) {
			if(input=='0' || input==0){
				return '当月';
			}else if(input=='1' || input==1){
				return '当天';
			}else if(input=='2' || input==2){
				return '当年';
			}else if(input=='3' || input==3){
				return '前后n天';
			}else{
				return '';
			}
        };
    })
    .filter('favourtypemark', function () {
        return function (input) {
			if(input=='0' || input==0){
				return '指定金额';
			}else if(input=='1' || input==1){
				return '指定折扣';
			}else if(input=='2' || input==2){
				return '优惠金额';
			}else{
				return '';
			}
        };
    })
    .filter('sexmark', function () {
        return function (input) {
            if (input == 1 || input == '1') {
                return '男';
            } else if (input == 2 || input == '2') {
                return '女';
            } else if (input == 3 || input == '3') {
                return '保密';
            } else {
                return '';
            }
        };
    })
    .filter('citytypemark', function () {
        return function (input) {
            if (input == 0 || input == '0') {
                return '无等级';
            } else if (input == 1 || input == '1') {
                return '一线城市';
            } else if (input == 2 || input == '2') {
                return '二线城市';
            } else {
                return '';
            }
        };
    })
    .filter('sourcetypemark', function () {
        return function (input) {
            if (input == 0 || input == '0') {
                return '无类型';
            } else if (input == 1 || input == '1') {
                return '线上';
            } else if (input == 2 || input == '2') {
                return '线下';
            } else {
                return '';
            }
        };
    })
    .filter('cardstatusmark', function () {
        return function (input) {
            if (input == 0 || input == '0') {
                return '正常';
            } else if (input == 1 || input == '1') {
                return '停用';
            } else if (input == 2 || input == '2') {
                return '挂失';
            } else if (input == 3 || input == '3') {
                return '已使用';
            } else if (input == 4 || input == '4') {
                return '过期';
            } else if (input == 5 || input == '5') {
                return '作废';
            } else {
                return '';
            }
        };
    })
    .filter('workflowstatusmark', function () {
        return function (input) {
            if (input == 0 || input == '0') {
                return '初始';
            } else if (input == 1 || input == '1') {
                return '设计流程';
            } else if (input == 2 || input == '2') {
                return '审批通过';
            } else if (input == 3 || input == '3') {
                return '开始执行';
            } else if (input == 4 || input == '4') {
                return '执行中';
            } else if (input == 5 || input == '5') {
                return '执行完成';
            } else if (input == 6 || input == '6') {
                return '生成报表';
            } else if (input == 7 || input == '7') {
                return '完成';
            } else if (input == 8 || input == '8') {
                return '终止';
            } else {
                return '';
            }
        };
    })
    .filter('recordstatusmark', function () {
        return function (input) {
            if (input == 0 || input == '0') {
                return '审核中';
            } else if (input == 1 || input == '1') {
                return '已审核拣货中';
            } else if (input == 3 || input == '3') {
                return '已发货';
            } else if (input == 5 || input == '5') {
                return '已完成';
            } else if (input == 7 || input == '7') {
                return '已取消';
            } else if (input == 8 || input == '8') {
                return '申请退货';
            } else if (input == 9 || input == '9') {
                return '确认退货';
            } else if (input == 11 || input == '11') {
                return '完成退货';
            } else {
                return '';
            }
        };
    })
    .filter('issendmark', function () {
        return function (input) {
            if (input == 0 || input == '0') {
                return '未发送';
            } else if (input == 1 || input == '1') {
                return '已发送';
            } else if (input == 2 || input == '2') {
                return '发送中';
            } else {
                return '';
            }
        };
    })
    .filter('activitytypemark', function () {
        return function (input) {
			if (input == 1 || input == '1') {
                return '大转盘';
            } else if (input == 2 || input == '2') {
                return '刮刮卡';
            } else if (input == 3 || input == '3') {
                return '竞猜';
            } else if (input == 4 || input == '4') {
                return '投票';
            } else {
                return '';
            }
        };
    })
    .filter('activitystatusmark', function () {
        return function (input) {
			if(input == 0 || input == '0'){
				return '待审核';
			} else if (input == 1 || input == '1') {
                return '待发布';
            } else if (input == 2 || input == '2') {
                return '进行中';
            } else if (input == 3 || input == '3') {
                return '已结束';
            } else if (input == 4 || input == '4') {
                return '已终止';
            } else {
                return '';
            }
        };
    })
    .filter('workflowtypemark', function () {
        return function (input) {
			if(input == 0 || input == '0'){
				return '手机';
			} else {
                return '';
            }
        };
    })
    .filter('sourcemark', function () {
        return function (input) {
			if(input == 1 || input == '1'){
				return 'erp';
			} else if (input == 6 || input == '6') {
                return 'pos';
            } else if (input == 7 || input == '7') {
                return '百胜icrm';
            } else if (input == 8 || input == '8') {
                return 'e3后台';
            } else if (input == 9 || input == '9') {
                return '淘宝';
            } else if (input == 10 || input == '10') {
                return '拍拍';
            } else if (input == 11 || input == '11') {
                return 'openshop';
            } else if (input == 12 || input == '12') {
                return '分销商';
            } else if (input == 13 || input == '13') {
                return '京东';
            } else if (input == 14 || input == '14') {
                return '亚马逊';
            } else if (input == 15 || input == '15') {
                return 'QQ网购';
            } else if (input == 16 || input == '16') {
                return '一号店';
            } else if (input == 17 || input == '17') {
                return 'eBay';
            } else if (input == 18 || input == '18') {
                return '网络分销主站';
            } else if (input == 19 || input == '19') {
                return '淘宝分销';
            } else if (input == 20 || input == '20') {
                return '新浪';
            } else if (input == 21 || input == '21') {
                return 'shopex';
            } else if (input == 22 || input == '22') {
                return 'ecshop';
            } else if (input == 23 || input == '23') {
                return '当当';
            } else if (input == 24 || input == '24') {
                return '邮乐';
            } else if (input == 25 || input == '25') {
                return '乐酷天';
            } else if (input == 26 || input == '26') {
                return 'shopex分销王';
            } else if (input == 27 || input == '27') {
                return 'vjia';
            } else if (input == 28 || input == '28') {
                return '优购';
            } else if (input == 29 || input == '29') {
                return 'efast';
            } else if (input == 30 || input == '30') {
                return '微购物';
            } else if (input == 31 || input == '31') {
                return '微信';
            } else if (input == 32 || input == '32') {
                return '苏宁';
            } else if (input == 33 || input == '33') {
                return '唯品会';
            } else if (input == 34 || input == '34') {
                return '聚美优品';
            } else if (input == 35 || input == '35') {
                return '卖网';
            } else if (input == 36 || input == '36') {
                return '库巴';
            } else if (input == 37 || input == '37') {
                return '名鞋库';
            } else if (input == 38 || input == '38') {
                return '阿里巴巴';
            } else if (input == 39 || input == '39') {
                return '口袋通';
            } else if (input == 40 || input == '40') {
                return '工行';
            } else if (input == 41 || input == '41') {
                return '银泰';
            } else if (input == 42 || input == '42') {
                return '走秀网';
            } else if (input == 43 || input == '43') {
                return '贝贝网';
            } else if (input == 44 || input == '44') {
                return '蘑菇街';
            } else if (input == 45 || input == '45') {
                return '拍鞋网';
            } else if (input == 46 || input == '46') {
                return '好乐买';
            } else if (input == 47 || input == '47') {
                return '乐蜂';
            } else if (input == 48 || input == '48') {
                return '微盟';
            } else if (input == 49 || input == '49') {
                return '折800';
            } else if (input == 50 || input == '50') {
                return 'OS主站';
            } else if (input == 51 || input == '51') {
                return 'API接口';
            } else if (input == 52 || input == '52') {
                return 'ncm';
            } else if (input == 53 || input == '53') {
                return 'BSERP2';
            } else if (input == 54 || input == '54') {
                return 'BS3000+';
            } else if (input == 55 || input == '55') {
                return '第三方仓储物流';
            } else if (input == 56 || input == '56') {
                return '唯品会JIT';
            } else if (input == 57 || input == '57') {
                return 'ISHOP';
            } else if (input == 58 || input == '58') {
                return '飞牛';
            } else if (input == 59 || input == '59') {
                return '蜜芽';
            } else if (input == 60 || input == '60') {
                return '百度mall接口';
            } else if (input == 61 || input == '61') {
                return '三足接口';
            } else if (input == 62 || input == '62') {
                return '移动pos';
            } else if (input == 63 || input == '63') {
                return 'M6';
            } else if (input == 65 || input == '65') {
                return '速卖通';
            } else if (input == 66 || input == '66') {
                return '明星衣橱';
            } else if (input == 67 || input == '67') {
                return '百胜E3';
            } else if (input == 68 || input == '68') {
                return '润和pos';
            } else if (input == 9000 || input == '9000') {
                return '错误来源';
            } else {
                return '';
            }
        };
    })
    .filter('percentageMark', function () {
        //百分比标记
        return function (input) {
			return (parseFloat(input)*100).toFixed(2) + '%';
        };
    })
    .filter('crontabtypemark', function () {
        return function (input) {
			if(input==0 || input=='0'){
                return '指定频率';
			}else if(input==1 || input=='1'){
				return '每月第一天';
			}else{
				return '未知类型';
			}
        };
    })
    .filter('emessagetypemark', function () {
        return function (input) {
			if(input==0 || input=='0'){
                return '其它';
			}else if(input==1 || input=='1'){
				return '营销';
			}else if(input==2 || input=='2'){
				return '订单';
			}else if(input==3 || input=='3'){
				return '激活';
			}else if(input==4 || input=='4'){
				return '注册';
			}else{
				return '';
			}
        };
    })
    //保留2位小数
    .filter('formatmoneymark', function () {
        return function (input) {
			return Number(input).toFixed(2);
        };
    })
    .filter('subscribemark', function () {
        return function (input) {
            if (input == 0 || input == '0') {
                return '否';
            } else if (input == 1 || input == '1') {
                return '是';
            } else {
                return '';
            }
        };
    })
    .filter('default',function(){
        //当要显示的变量为空时，输出一个默认字符串
        return function(input,def){
            if(input==undefined||input==''){
                return def;
            }else{
                return input;
            }
        }
    })
angular.module('myService', [])
.factory('api', ['$rootScope', '$http', '$location','$q','Popup','myConfigSys',
    function ($rootScope, $http, $location,$q,Popup,myConfigSys) {
        // var datetime = new Date();
        // var year = datetime.getFullYear();
        // var month = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
        // var date = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
        // var date_str = year + "-" + month + "-" + date;
        // var get_sign = function () {
        //     //var configData = $api.getStorage('configData');
        //     var api_key = 'MY_KEY';
        //     var api_pass = 'MY_PASS';
        //     var str = api_key + api_pass + date_str;
        //     //var sign = $.md5(str);
        //     //return sign;
        //     return str;
        // };
		
		//本地文件配置
        var request_demo = function(api_name, api_parm){
            var post_url = "../api_demo/" + api_name + ".json";
            return $http.get(post_url, api_parm).then(function(ret){
                if(ret.data.status==1){
                    return ret.data;
                }else{
                    Popup.notice(ret.data.message);
                    return false;  //ret.data;
                }
            }).catch(function(ret){
                Popup.notice('网络访问失败');
                return false;
            });
        };
        
        //线上配置
        //请求接口方法
        /**
         * api_name 接口名称 例如 base/customer/get_list
         * api_parm 请求参数 例如 {'search_data': {'code': '001', 'status': 1}}
         * http_parm http参数 例如 {'responseType': 'arraybuffer'}
         */
        var request = function(api_name, api_parm, http_parm){
            var post_url = "index.php?app_act=" + api_name;

            //提交请求时附加上当前操作人信息
            if(api_parm){
                api_parm.user_info = {
                    user_id : $util.getcookie('user_id'),
                    user_code : $util.getcookie('user_code')
                } 
            }

            return $http.post(post_url, api_parm, http_parm).then(function(ret){
                if(ret.data.status==1){
                    return ret.data;
                }else{
                    Popup.notice(ret.data.message);
                    return ret.data;  //ret.data;
                }
            }).catch(function(ret){
                Popup.notice('网络访问失败');
                return false;
            });
        };

        var request_route = function(api_name, api_parm, http_parm){
            if($rootScope.config_sys.fake_api===true){
                return request_demo(api_name, api_parm, http_parm);
            }else{
                return request(api_name, api_parm, http_parm);
            }
        }

        //获取URL请求的地址
        var get_api_url = function(api_name){
            var post_url = "index.php?app_act=" + api_name;
            return post_url;
        };
        var get_api_url_demo = function(api_name){
            var post_url = "api_demo/" + api_name + '.json';
            return post_url;
        };
        if(!$rootScope.config_sys){
            $rootScope.config_sys = myConfigSys;
        };
        return {
            "get_api_url": get_api_url,   //获取请求的地址
            "request": request_route, //API请求：根据配置是访问正式环境还是静态数据
            "request_demo": request_demo
        };

}])
.factory('myServiceUtil',['$rootScope','api',function($rootScope,api){

    //根据URL获取菜单数据中的123级ID
    //传入当前的URL和菜单$rootScope.sys_menu对象
    var get_menu_by_url = function(url){
        var r = {
            m1:'',m2:'',m3:''
        };
        $rootScope.sys_menu.forEach(function(m1){
            m1.child.forEach(function(m2){
                m2.child.forEach(function(m3){
                    if(url == m3.url){
                        r.m1 = m1;
                        r.m2 = m2;
                        r.m3 = m3;
                        return;
                    }
                });
                if(r.m3 != '') return;
            });
            if(r.m3 != '') return;
        });
        return r;
    }

    //根据关键词搜索菜单, 参数为输入的关键词, 最多返回max条
    var get_menu_by_keywords = function(keywords,max){
        var reg = new RegExp(keywords,'ig');
        var ret = [];

        $rootScope.sys_menu.forEach(function(m1){
            m1.child.forEach(function(m2){
                m2.child.forEach(function(m3){
                    if(reg.test(m3.name)){
                        ret.push(m3);
                    }
                });
            });
        });
        if(max && max>0){
            ret.splice(max);
        }
        return ret;
    }

    //根据逗号分隔的菜单id，去处无权限的菜单
    //返回权限数组本身
    var get_menu_by_purview = function(purview_id_str){
        var purview_id_arr = purview_id_str.split(',');
        $rootScope.sys_menu.forEach(function(m1,i1){
            if(-1==purview_id_arr.indexOf(m1.purview_id)){
                $rootScope.sys_menu.splice(i1,1);
            }else{
                m1.child.forEach(function(m2,i2){
                    if(-1==purview_id_arr.indexOf(m2.purview_id)){
                        m1.child.splice(i2,1);
                    }else{
                        m2.child.forEach(function(m3,i3){
                            if(-1==purview_id_arr.indexOf(m3.purview_id)){
                                m2.child.splice(i3,1);
                            }
                        });
                    }
                });
            }
        });
        return $rootScope.sys_menu;
    }


    //将首字母转换成大写的方法
    var strtoUp = function(str){
        if(typeof str == 'undefined') return '';
        return str.replace(/(\w)/,function(v){
            return v.toUpperCase();
        });
    }
    //将_连接的字符串转换成驼峰大写
    var strtoUp2 = function(str){
        if(typeof str == 'undefined') return '';
        var p = str.split('_');
        var r = '';
        p.forEach(function(o){
            r += strtoUp(o);
        });
        return r;
    }

    //根据url地址判断当前的收藏状态
    var get_fav_status = function(url){
        var sys_menu_fav = $rootScope.sys_menu_fav;
        var status = false;
        sys_menu_fav.forEach(function(o){
            if(o.url == url){
                status = true;
            }
        });
        return status;
    }


    //将菜单添加到收藏后刷新本地状态，data对象同api请求时的参数
    var add_to_fav = function(data){
        $rootScope.sys_menu_fav.push(data);
        $util.setStorage('sys_menu_fav',$rootScope.sys_menu_fav);
    }
	
    //删除菜单收藏后刷新本地状态，data对象同api请求时的参数
    var remove_from_fav = function(data){
        var i = false;
        $rootScope.sys_menu_fav.forEach(function(o,index){
            if(o.url == data.url){
                i = index;
            }
        });
        if(i!==false){
            $rootScope.sys_menu_fav.splice(i,1);
        }
        $util.setStorage('sys_menu_fav',$rootScope.sys_menu_fav);
    }

    //获取某用户表头设置全部参数，并写入localstorage
    var get_config_table_set = function (user_id) {
        //服务器和localstorage保存的单条配置样例为:
        //{th1:true,th2:false,th3:true}
        return api.request('sys/user_html_config/get_by_user_id', { user_id: user_id }).then(function (ret) {
            if (ret.status == 1) {
                var conf_data_obj = {};
                ret.data.forEach(function(o){
                    conf_data_obj[o.url] = o.context;
                });
//              console.log(conf_data_obj);
                $util.setStorage('config_table_set_' + user_id, conf_data_obj);
                $rootScope.config_table_set = conf_data_obj;
            } else {
                $rootScope.config_table_set = $util.getStorage('config_table_set_' + user_id) ? $util.getStorage('config_table_set_' + user_id) : {};
            }
        });
    }



    //克隆一个对象，防止对象地址引用造成错误
    var clone = function (obj){
		return JSON.parse(JSON.stringify(obj));
	}

    
    //=======================================================================
    return {
        "get_menu_by_url":get_menu_by_url,
        "get_menu_by_keywords":get_menu_by_keywords,
        "get_menu_by_purview":get_menu_by_purview,
        "get_fav_status":get_fav_status,
        "add_to_fav":add_to_fav,
        "remove_from_fav":remove_from_fav,
        "get_config_table_set":get_config_table_set,
        "strtoUp":strtoUp,
        "strtoUp2":strtoUp2,
        "clone":clone
    }
}])
.factory('valid',['$rootScope',function($rootScope){
    //验证是否必填
    var check_required = function (input) {
        //console.log(input);
        if (typeof input == 'undefined' || input == undefined || input == '' || input == null) {
            return false;
        } else {
            return true;
        }
    }
    
    //验证正整数(不包含0)
    var check_positive_integer = function (input) {
        if ((/^(\+|-)?\d+$/.test(input)) && input>0) {
            return true;
        } else {
            return false;
        }
    }
    
    //验证(包含0)的正整数
    var check_integer = function (input) {
        if ((/^(\+|-)?\d+$/.test(input)) && input>=0) {
            return true;
        } else {
            return false;
        }
    }
    
    //验证手机号码
    var check_mobile = function (input) {
        if ((/^(1(([35][0-9])|(47)|[8][0-9]))\d{8}$/.test(input))) {
            return true;
        } else {
            return false;
        }
    }
    
    //验证0~1之间的数
    var check_zero_one = function(input){
        if(input>=0 && input<=1){
        	return true;
        }else{
        	return false;
        }
    }
        //验证1~100之间的数
        var check_one_hundred = function(input){
            if(input>=1 && input<=100){
                return true;
            }else{
                return false;
            }
        }
    //包含0的正数
    var check_zero_positive = function(input){
        if((/^[0-9]+.?[0-9]*$/.test(input)) && input>=0){
        	return true;
        }else{
        	return false;
        }
    }
    
    //正数(不包含0)
    var check_positive = function(input){
        if((/^[0-9]+.?[0-9]*$/.test(input)) && input>0){
        	return true;
        }else{
        	return false;
        }
    }
    
    //验证是否相等 input为有两个元素的数组
    var check_eq = function(input){
        if(input[0]!==input[1]){
            return false;
        }else{
            return true;
        }
    }
    
    //只能输入2位小数或正数(金额)
    var check_money_format = function(input){
        if((/^\d+(\.\d{2})*$/.test(input))){
            return true;
        }else{
            return false;
        }
    }

    //验证选择
    var check_switch = function(func, dat){
        switch(func){
            case 'check_required':return check_required(dat);//验证是否必填
            case 'check_positive_integer':return check_positive_integer(dat);//验证正整数(不包含0)
            case 'check_integer':return check_integer(dat);//验证(包含0)的正整数
            case 'check_mobile':return check_mobile(dat);//验证手机号
            case 'check_zero_one':return check_zero_one(dat);//验证0~1之间的数
            case 'check_one_hundred':return check_one_hundred(dat);//验证1~100之间的数
            case 'check_zero_positive':return check_zero_positive(dat);//包含0的正数
            case 'check_positive':return check_positive(dat);//正数(不包含0)
            case 'check_money_format':return check_money_format(dat);//只能输入2位小数或正数(金额)
            case 'check_eq':return check_eq(dat);//验证是否相等 input为有两个元素的数组
        }
        return true;
    }

    //各种验证: TODO 可以根据需要改造成promise返回
    var check = function (check_list) {
        var ret = {
            'status': true,
            'data': {}
        };

        check_list.forEach(function(o){
                if(!check_switch(o.valid,o.data)){
                ret.status = false;
                ret.data[o.key] = 'error';
                ret.data[o.key+'_ico'] = 'glyphicon-warning-sign';
                ret.data[o.key+'_tip'] = o.tip;
            }else{
                ret.data[o.key] = 'success';
                ret.data[o.key+'_ico'] = 'glyphicon-ok';
                ret.data[o.key+'_tip'] = '';
            }
        });
        return ret;
    }

    return {
        "check": check,
        "check_required": check_required,//验证是否必填
        "check_positive_integer": check_positive_integer,//验证正整数(不包含0)
        "check_integer": check_integer,//验证(包含0)的正整数
        "check_mobile": check_mobile,//验证手机号
        "check_zero_one": check_zero_one,//验证0~1之间的数
        "check_one_hundred": check_one_hundred,//验证1~100之间的数
        "check_zero_positive": check_zero_positive,//包含0的正数
        "check_positive": check_positive,//正数(不包含0)
        "check_money_format": check_money_format,//只能输入2位小数或正数(金额)
        "check_eq": check_eq//验证是否相等 input为有两个元素的数组
    }
}])
.factory('myServiceDatabind',['$rootScope','api',function($rootScope,api){
    //控件数据源
    //选择部门
    var select_department = function(param){
        //console.log(param);
        return api.request('sys/department/get_list',param).then(function(ret){
            var deferred = $q.defer();
            var return_data = {
                filter_data:ret.data.search_data,
                data:[],
                page_data:ret.data.page_data
            };
            ret.data.data.forEach(function(o){
                return_data.data.push({ "code": o.department_code, "name": o.department_name });
            });

            deferred.resolve(return_data);
            return deferred.promise;
        });
    }

    //选择员工
    var select_user = function(param){
        return api.request('sys/user/get_list',param).then(function(ret){
            var deferred = $q.defer();
            var return_data = {
                filter_data:ret.data.search_data,
                data:[],
                page_data:ret.data.page_data
            };
            ret.data.data.forEach(function(o){
                return_data.data.push({ "code": o.user_code, "name": o.user_name });
            });

            deferred.resolve(return_data);
            return deferred.promise;
        });
    }

    return {
        select_department:select_department,
        select_user:select_user
    }
}])
.factory('myServiceOptions',['$rootScope','api',function($rootScope,api){
    //选择器枚举
    return {
        option:{
            'customer_sex_options': { '0': '保密', '1': '男', '2': '女' },
            'weixin_type_options':{'0':'认证服务号'},
            '_options':{}
        },
        selector:{
            'select_department':'选择部门',
            'select_user':'选择用户/店员'
        }
    }
}])
;
(function(window){
    var u = {};
    var isAndroid = (/android/gi).test(navigator.appVersion);
    var uzStorage = function(){
        var ls = window.localStorage;
        if(isAndroid){
           ls = os.localStorage();
        }
        return ls;
    };
    function parseArguments(url, data, fnSuc, dataType) {
        if (typeof(data) == 'function') {
            dataType = fnSuc;
            fnSuc = data;
            data = undefined;
        }
        if (typeof(fnSuc) != 'function') {
            dataType = fnSuc;
            fnSuc = undefined;
        }
        return {
            url: url,
            data: data,
            fnSuc: fnSuc,
            dataType: dataType
        };
    }
    u.trim = function(str){
        if(String.prototype.trim){
            return str == null ? "" : String.prototype.trim.call(str);
        }else{
            return str.replace(/(^\s*)|(\s*$)/g, "");
        }
    };
    u.trimAll = function(str){
        return str.replace(/\s*/g,'');
    };
    u.isElement = function(obj){
        return !!(obj && obj.nodeType == 1);
    };
    u.isArray = function(obj){
        if(Array.isArray){
            return Array.isArray(obj);
        }else{
            return obj instanceof Array;
        }
    };
    u.isEmptyObject = function(obj){
        if(JSON.stringify(obj) === '{}'){
            return true;
        }
        return false;
    };
    u.addEvt = function(el, name, fn, useCapture){
        if(!u.isElement(el)){
            console.warn('$api.addEvt Function need el param, el param must be DOM Element');
            return;
        }
        useCapture = useCapture || false;
        if(el.addEventListener) {
            el.addEventListener(name, fn, useCapture);
        }
    };
    u.rmEvt = function(el, name, fn, useCapture){
        if(!u.isElement(el)){
            console.warn('$api.rmEvt Function need el param, el param must be DOM Element');
            return;
        }
        useCapture = useCapture || false;
        if (el.removeEventListener) {
            el.removeEventListener(name, fn, useCapture);
        }
    };
    u.one = function(el, name, fn, useCapture){
        if(!u.isElement(el)){
            console.warn('$api.one Function need el param, el param must be DOM Element');
            return;
        }
        useCapture = useCapture || false;
        var that = this;
        var cb = function(){
            fn && fn();
            that.rmEvt(el, name, cb, useCapture);
        };
        that.addEvt(el, name, cb, useCapture);
    };
    u.dom = function(el, selector){
        if(arguments.length === 1 && typeof arguments[0] == 'string'){
            if(document.querySelector){
                return document.querySelector(arguments[0]);
            }
        }else if(arguments.length === 2){
            if(el.querySelector){
                return el.querySelector(selector);
            }
        }
    };
    u.domAll = function(el, selector){
        if(arguments.length === 1 && typeof arguments[0] == 'string'){
            if(document.querySelectorAll){
                return document.querySelectorAll(arguments[0]);
            }
        }else if(arguments.length === 2){
            if(el.querySelectorAll){
                return el.querySelectorAll(selector);
            }
        }
    };
    u.byId = function(id){
        return document.getElementById(id);
    };
    u.first = function(el, selector){
        if(arguments.length === 1){
            if(!u.isElement(el)){
                console.warn('$api.first Function need el param, el param must be DOM Element');
                return;
            }
            return el.children[0];
        }
        if(arguments.length === 2){
            return this.dom(el, selector+':first-child');
        }
    };
    u.last = function(el, selector){
        if(arguments.length === 1){
            if(!u.isElement(el)){
                console.warn('$api.last Function need el param, el param must be DOM Element');
                return;
            }
            var children = el.children;
            return children[children.length - 1];
        }
        if(arguments.length === 2){
            return this.dom(el, selector+':last-child');
        }
    };
    u.eq = function(el, index){
        return this.dom(el, ':nth-child('+ index +')');
    };
    u.not = function(el, selector){
        return this.domAll(el, ':not('+ selector +')');
    };
    u.prev = function(el){
        if(!u.isElement(el)){
            console.warn('$api.prev Function need el param, el param must be DOM Element');
            return;
        }
        var node = el.previousSibling;
        if(node.nodeType && node.nodeType === 3){
            node = node.previousSibling;
            return node;
        }
    };
    u.next = function(el){
        if(!u.isElement(el)){
            console.warn('$api.next Function need el param, el param must be DOM Element');
            return;
        }
        var node = el.nextSibling;
        if(node.nodeType && node.nodeType === 3){
            node = node.nextSibling;
            return node;
        }
    };
    u.closest = function(el, selector){
        if(!u.isElement(el)){
            console.warn('$api.closest Function need el param, el param must be DOM Element');
            return;
        }
        var doms, targetDom;
        var isSame = function(doms, el){
            var i = 0, len = doms.length;
            for(i; i<len; i++){
                if(doms[i].isEqualNode(el)){
                    return doms[i];
                }
            }
            return false;
        };
        var traversal = function(el, selector){
            doms = u.domAll(el.parentNode, selector);
            targetDom = isSame(doms, el);
            while(!targetDom){
                el = el.parentNode;
                if(el != null && el.nodeType == el.DOCUMENT_NODE){
                    return false;
                }
                traversal(el, selector);
            }

            return targetDom;
        };

        return traversal(el, selector);
    };
    u.contains = function(parent,el){
        var mark = false;
        if(el === parent){
            mark = true;
            return mark;
        }else{
            do{
                el = el.parentNode;
                if(el === parent){
                    mark = true;
                    return mark;
                }
            }while(el === document.body || el === document.documentElement);

            return mark;
        }
        
    };
    u.remove = function(el){
        if(el && el.parentNode){
            el.parentNode.removeChild(el);
        }
    };
    u.attr = function(el, name, value){
        if(!u.isElement(el)){
            console.warn('$api.attr Function need el param, el param must be DOM Element');
            return;
        }
        if(arguments.length == 2){
            return el.getAttribute(name);
        }else if(arguments.length == 3){
            el.setAttribute(name, value);
            return el;
        }
    };
    u.removeAttr = function(el, name){
        if(!u.isElement(el)){
            console.warn('$api.removeAttr Function need el param, el param must be DOM Element');
            return;
        }
        if(arguments.length === 2){
            el.removeAttribute(name);
        }
    };
    u.hasCls = function(el, cls){
        if(!u.isElement(el)){
            console.warn('$api.hasCls Function need el param, el param must be DOM Element');
            return;
        }
        if(el.className.indexOf(cls) > -1){
            return true;
        }else{
            return false;
        }
    };
    u.addCls = function(el, cls){
        if(!u.isElement(el)){
            console.warn('$api.addCls Function need el param, el param must be DOM Element');
            return;
        }
        if('classList' in el){
            el.classList.add(cls);
        }else{
            var preCls = el.className;
            var newCls = preCls +' '+ cls;
            el.className = newCls;
        }
        return el;
    };
    u.removeCls = function(el, cls){
        if(!u.isElement(el)){
            console.warn('$api.removeCls Function need el param, el param must be DOM Element');
            return;
        }
        if('classList' in el){
            el.classList.remove(cls);
        }else{
            var preCls = el.className;
            var newCls = preCls.replace(cls, '');
            el.className = newCls;
        }
        return el;
    };
    u.toggleCls = function(el, cls){
        if(!u.isElement(el)){
            console.warn('$api.toggleCls Function need el param, el param must be DOM Element');
            return;
        }
       if('classList' in el){
            el.classList.toggle(cls);
        }else{
            if(u.hasCls(el, cls)){
                u.addCls(el, cls);
            }else{
                u.removeCls(el, cls);
            }
        }
        return el;
    };
    u.val = function(el, val){
        if(!u.isElement(el)){
            console.warn('$api.val Function need el param, el param must be DOM Element');
            return;
        }
        if(arguments.length === 1){
            switch(el.tagName){
                case 'SELECT':
                    var value = el.options[el.selectedIndex].value;
                    return value;
                    break;
                case 'INPUT':
                    return el.value;
                    break;
                case 'TEXTAREA':
                    return el.value;
                    break;
            }
        }
        if(arguments.length === 2){
            switch(el.tagName){
                case 'SELECT':
                    el.options[el.selectedIndex].value = val;
                    return el;
                    break;
                case 'INPUT':
                    el.value = val;
                    return el;
                    break;
                case 'TEXTAREA':
                    el.value = val;
                    return el;
                    break;
            }
        }
        
    };
    u.prepend = function(el, html){
        if(!u.isElement(el)){
            console.warn('$api.prepend Function need el param, el param must be DOM Element');
            return;
        }
        el.insertAdjacentHTML('afterbegin', html);
        return el;
    };
    u.append = function(el, html){
        if(!u.isElement(el)){
            console.warn('$api.append Function need el param, el param must be DOM Element');
            return;
        }
        el.insertAdjacentHTML('beforeend', html);
        return el;
    };
    u.before = function(el, html){
        if(!u.isElement(el)){
            console.warn('$api.before Function need el param, el param must be DOM Element');
            return;
        }
        el.insertAdjacentHTML('beforebegin', html);
        return el;
    };
    u.after = function(el, html){
        if(!u.isElement(el)){
            console.warn('$api.after Function need el param, el param must be DOM Element');
            return;
        }
        el.insertAdjacentHTML('afterend', html);
        return el;
    };
    u.html = function(el, html){
        if(!u.isElement(el)){
            console.warn('$api.html Function need el param, el param must be DOM Element');
            return;
        }
        if(arguments.length === 1){
            return el.innerHTML;
        }else if(arguments.length === 2){
            el.innerHTML = html;
            return el;
        }
    };
    u.text = function(el, txt){
        if(!u.isElement(el)){
            console.warn('$api.text Function need el param, el param must be DOM Element');
            return;
        }
        if(arguments.length === 1){
            return el.textContent;
        }else if(arguments.length === 2){
            el.textContent = txt;
            return el;
        }
    };
    u.offset = function(el){
        if(!u.isElement(el)){
            console.warn('$api.offset Function need el param, el param must be DOM Element');
            return;
        }
        var sl = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
        var st = Math.max(document.documentElement.scrollTop, document.body.scrollTop);

        var rect = el.getBoundingClientRect();
        return {
            l: rect.left + sl,
            t: rect.top + st,
            w: el.offsetWidth,
            h: el.offsetHeight
        };
    };
    u.css = function(el, css){
        if(!u.isElement(el)){
            console.warn('$api.css Function need el param, el param must be DOM Element');
            return;
        }
        if(typeof css == 'string' && css.indexOf(':') > 0){
            el.style && (el.style.cssText += ';' + css);
        }
    };
    u.cssVal = function(el, prop){
        if(!u.isElement(el)){
            console.warn('$api.cssVal Function need el param, el param must be DOM Element');
            return;
        }
        if(arguments.length === 2){
            var computedStyle = window.getComputedStyle(el, null);
            return computedStyle.getPropertyValue(prop);
        }
    };
    u.jsonToStr = function(json){
        if(typeof json === 'object'){
            return JSON && JSON.stringify(json);
        }
    };
    u.strToJson = function(str){
        if(typeof str === 'string'){
            return JSON && JSON.parse(str);
        }
    };
    u.setStorage = function(key, value){
        if(arguments.length === 2){
            var v = value;
            if(typeof v == 'object'){
                v = JSON.stringify(v);
                v = 'obj-'+ v;
            }else{
                v = 'str-'+ v;
            }
            var ls = uzStorage();
            if(ls){
                ls.setItem(key, v);
            }
        }
    };
    u.getStorage = function(key){
        var ls = uzStorage();
        if(ls){
            var v = ls.getItem(key);
            if(!v){return;}
            if(v.indexOf('obj-') === 0){
                v = v.slice(4);
                return JSON.parse(v);
            }else if(v.indexOf('str-') === 0){
                return v.slice(4);
            }
        }
    };
    u.rmStorage = function(key){
        var ls = uzStorage();
        if(ls && key){
            ls.removeItem(key);
        }
    };
    u.clearStorage = function(){
        var ls = uzStorage();
        if(ls){
            ls.clear();
        }
    };

   
    /*by king*/
    u.fixIos7Bar = function(el){
        if(!u.isElement(el)){
            console.warn('$api.fixIos7Bar Function need el param, el param must be DOM Element');
            return;
        }
        var strDM = api.systemType;
        if (strDM == 'ios') {
            var strSV = api.systemVersion;
            var numSV = parseInt(strSV,10);
            var fullScreen = api.fullScreen;
            var iOS7StatusBarAppearance = api.iOS7StatusBarAppearance;
            if (numSV >= 7 && !fullScreen && iOS7StatusBarAppearance) {
                el.style.paddingTop = '20px';
            }
        }
    };
    u.fixStatusBar = function(el){
        if(!u.isElement(el)){
            console.warn('$api.fixStatusBar Function need el param, el param must be DOM Element');
            return;
        }
        var sysType = api.systemType;
        if(sysType == 'ios'){
            u.fixIos7Bar(el);
        }else if(sysType == 'android'){
            var ver = api.systemVersion;
            ver = parseFloat(ver);
            if(ver >= 4.4){
                el.style.paddingTop = '25px';
            }
        }
    };
    u.toast = function(title, text, time){
        var opts = {};
        var show = function(opts, time){
            api.showProgress(opts);
            setTimeout(function(){
                api.hideProgress();
            },time);
        };
        if(arguments.length === 1){
            var time = time || 500;
            if(typeof title === 'number'){
                time = title;
            }else{
                opts.title = title+'';
            }
            show(opts, time);
        }else if(arguments.length === 2){
            var time = time || 500;
            var text = text;
            if(typeof text === "number"){
                var tmp = text;
                time = tmp;
                text = null;
            }
            if(title){
                opts.title = title;
            }
            if(text){
                opts.text = text;
            }
            show(opts, time);
        }
        if(title){
            opts.title = title;
        }
        if(text){
            opts.text = text;
        }
        time = time || 500;
        show(opts, time);
    };
    u.post = function(/*url,data,fnSuc,dataType*/){
        var argsToJson = parseArguments.apply(null, arguments);
        var json = {};
        var fnSuc = argsToJson.fnSuc;
        argsToJson.url && (json.url = argsToJson.url);
        argsToJson.data && (json.data = argsToJson.data);
        if(argsToJson.dataType){
            var type = argsToJson.dataType.toLowerCase();
            if (type == 'text'||type == 'json') {
                json.dataType = type;
            }
        }else{
            json.dataType = 'json';
        }
        json.method = 'post';
        api.ajax(json,
            function(ret,err){
                if (ret) {
                    fnSuc && fnSuc(ret);
                }
            }
        );
    };
    u.get = function(/*url,fnSuc,dataType*/){
        var argsToJson = parseArguments.apply(null, arguments);
        var json = {};
        var fnSuc = argsToJson.fnSuc;
        argsToJson.url && (json.url = argsToJson.url);
        //argsToJson.data && (json.data = argsToJson.data);
        if(argsToJson.dataType){
            var type = argsToJson.dataType.toLowerCase();
            if (type == 'text'||type == 'json') {
                json.dataType = type;
            }
        }else{
            json.dataType = 'text';
        }
        json.method = 'get';
        api.ajax(json,
            function(ret,err){
                if (ret) {
                    fnSuc && fnSuc(ret);
                }
            }
        );
    };
    u.setcookie = function(name, value, expiredays) {
        var exdate=new Date();
        exdate.setDate(exdate.getDate()+expiredays);
        document.cookie=name+ "=" +encodeURI(value)+ ((expiredays==null) ? "" : ";expires="+exdate.toGMTString());
    };
    u.getcookie = function (name) {
        var arr=document.cookie.split('; ');
        for(var i=0;i<arr.length;i++){
            var temp=arr[i].split('=');
            if(temp[0]==name){
                return decodeURI(temp[1]);
            }
        }
        return null;
    };
    u.removecookie = function(name) {
        u.setcookie(name,'',-1);
    };
/*end*/
    

    window.$util = u;

})(window);



myDirective.directive("addList", function () {
    return {
        restrict: 'E',
        scope: {
            inputName: '=',     //��������������ʾ��ֵ
            inputShow: '=',     //�Ƿ���ʾ
            inputSelect: '=',   //ѡ�����е�����Դ
            inputTitle: '@',    //�����ı���
            inputTpl: '@',       //������ģ��
            inputFmt: '@',        //�������еĸ�ʽ 0ΪӢ�İ��Ƕ��ŷָ����ַ���, 1Ϊjson��ʽ����, Ĭ��0
            inputChange: '=',    //����ѡ�к����¼�
            inputClear: '='       //������������
        },
        templateUrl: 'html/directive/addlist/DirectiveAddList.html',
        controller: ['$scope', '$element', 'ngDialog', 'myServiceUtil', 'api', function ($scope, $element, ngDialog, myServiceUtil, api) {
            //���ڸ�ѡ����ģ��
            $scope.checkbox_value = {};
            //������ʾ����������code��name��ʱ����
            $scope.check_code_arr = [];
            $scope.check_name_arr = [];
            $scope.check_name_obj = [];

            //����ѡ��ֵ�������е���ȷ�����Ļص�
            $scope.set_value = function () {
                console.log($scope.check_name_obj);
                ngDialog.close(open_add_window_id);

                //ѡ��ȷ���Ժ��Ļص�����
                if(typeof $scope.inputChange == 'function'){
                    var v = $scope.check_name_obj;
                    //console.log(v);
                    $scope.inputChange(v);
                }
                //������������
                $scope.checkbox_value = {};
                $scope.check_code_arr = [];
                $scope.check_name_arr = [];
                $scope.check_name_obj = [];
            }

            //��ѡ����������
            $scope.update_check = function (li) {
                console.log(li);
                //console.log($scope.checkbox_value);
                if ($scope.checkbox_value[li.code] == true) {
                    var new_li = {};
                    new_li.form_code = li.code;
                    new_li.form_name = li.name;
                    new_li.form_id = li.id;
                    //ѡ�У�����ֵpush����ʱ����
                    $scope.check_code_arr.push(li.code);
                    $scope.check_name_arr.push(li.name);
                    $scope.check_name_obj.push(new_li);
                    //console.log($scope.check_name_obj);
                } else {
                    //ȡ��ѡ��
                    if (-1 != $scope.check_code_arr.indexOf(li.code)) {
                        $scope.check_code_arr.splice($scope.check_code_arr.indexOf(li.code), 1);
                    }
                    if (-1 != $scope.check_name_arr.indexOf(li.name)) {
                        $scope.check_name_arr.splice($scope.check_name_arr.indexOf(li.name), 1);
                    }
                }
            }

            //����ѡ��ֵ
            $scope.clear_input_data = function () {
                $scope.inputValue = [];
                $scope.inputName = '';
                $scope.check_code_arr = [];
                $scope.check_name_arr = [];
                $scope.checkbox_value = {};
                if(typeof $scope.inputClear == 'function'){
                    $scope.inputClear();
                }
            }
            //ȫѡ������ҳ��ѡ�򶼼��뵽$scope.checkbox_value
            $scope.check_all = function () {
                $scope.list_data.forEach(function (o) {
                    $scope.checkbox_value[o.code] = true;
                    if (-1 == $scope.check_code_arr.indexOf(o.code)) {
                        $scope.check_code_arr.push(o.code);
                    }
                    if (-1 == $scope.check_name_arr.indexOf(o.name)) {
                        $scope.check_name_arr.push(o.name);
                    }

                });
            }
            //ȡ��ȫѡ
            $scope.check_cancel_all = function () {
                $scope.list_data.forEach(function (o) {
                    $scope.checkbox_value = {};
                    $scope.check_code_arr = [];
                    $scope.check_name_arr = [];

                });
            }

            //ҳ����ѯ���б����� -------------------------------------------------------
            $scope.search_data = {};
            $scope.page_data = {};
            $scope.list_data = [];

            //���в�ѯ
            $scope.form_search = function () {
                $scope.inputSelect({ search_data: $scope.search_data, page_data: $scope.page_data }).then(function (ret) {
                    $scope.list_data = ret.data;
                    $scope.page_data = ret.page_data;
                    //$scope.search_data = ret.search_data;
                });
            }

            //�򿪲�ѯҳ��
            var open_add_window_id = 0;
            $scope.open_select_window = function () {
                //�ӽ����д��뷽������ѯ����
                $scope.form_search();
                open_add_window_id = ngDialog.open({
                    overlay: true,
                    disableAnimation: true,
                    showClose: true,
                    width: 500,
                    template: 'html/directive/addlist/DirectiveAddListWindow.html',
                    scope: $scope
                });
            }

        }]
    }
});
myDirective.directive("addTemplate", function () {
     return {
        restrict: 'E',
        scope: {
        	inputTitle: '@',		//弹出框标题
            inputFunc: '=',         //选择后的回调方法         
            inputText: '@',			//显示文字
            inputTpl: '@',			//模版名称
            inputFilter: '='		//额外的参数
        },
        template: '<button class="button" title="{{inputTitle}}" ng-click="open_select_window()">{{inputText}}</button>',
        controller: ['$rootScope', '$scope', '$element', 'ngDialog', function ($rootScope, $scope, $element, ngDialog) {
            //用于复选框的模型
            $scope.from_data = {};
            //下拉列表数据
            $scope.search_data_option = $rootScope.search_data_option;
            //点击保存按钮
            $scope.form_save = function(){
            	if(typeof $scope.inputFilter == 'object'){
            		for(k in $scope.inputFilter){
            			$scope.from_data[k] = $scope.inputFilter[k];
            		}
            	}
            	$scope.inputFunc($scope.from_data);
            	$scope.from_data = {};
                ngDialog.close(open_select_window_id);
            }
            
            //打开查询页面
            var open_select_window_id = 0;
            var template = 'html/directive/addtemplate/Directive'+$scope.inputTpl+'Window.html';
            $scope.open_select_window = function () {
                //从界面中传入方法，查询数据
                open_select_window_id = ngDialog.open({
                    overlay: true,
                    disableAnimation: true,
                    showClose: true,
                    width: '',
                    template: template,
                    scope: $scope
                });
            }
        }]
    }
});
myDirective.directive("apiList", function () {
    return {
        restrict: 'E',
        scope: {
            listTitle: '@',     //�����б��ı���
            listValue: '=',    //�󶨵�����
            listDefaultShow: '=', //Ĭ��չ�����߹رգ�Ĭ����չ��
            itemClick: '='     //�б������������¼�
        },
        templateUrl: 'html/directive/apilist/DirectiveApidetaillist.html',
        controller: ['$scope', '$element', function ($scope, $element) {
//          console.log($scope);
            $scope.click = function(v){
                if(typeof $scope.itemClick=='function'){
                    $scope.itemClick(v);
                }
                //console.log(v);
            }
        }]
    }
});
myDirective.directive("categoryList", function () {
    return {
        restrict: 'E',
        scope: {
            listTitle: '@',     //分类列表的标题
            listValue: '=',    //绑定的数据
            listDefaultShow: '=', //默认展开或者关闭，默认是展开
            itemClick: '='     //列表项点击后的事件
        },
        templateUrl: 'html/directive/categorylist/DirectiveCategorylist.html',
        controller: ['$scope', '$element', function ($scope, $element) {
            $scope.click = function(v){
                if(typeof $scope.itemClick=='function'){
                    $scope.itemClick(v);
                }
//                console.log(v);
            }
            
        }]
    }
});
myDirective.directive("categorygoodsList", function () {
    return {
        restrict: 'E',
        scope: {
            listTitle: '@',     //分类列表的标题
            listValue: '=',    //绑定的数据
            listDefaultShow: '=', //默认展开或者关闭，默认是展开
            itemClick: '='     //列表项点击后的事件
        },
        templateUrl: 'html/directive/categorylist/DirectiveCategorygoodslist.html',
        controller: ['$scope', '$element', function ($scope, $element) {
//          console.log($scope);
            $scope.click = function(v){
                if(typeof $scope.itemClick=='function'){
                    $scope.itemClick(v);
                }
                //console.log(v);
            }
            
        }]
    }
});
/**
 * excel导入导出控件。不同类型的导入和导入后的处理接口在本控件中配置
 * @author jhua.zuo@baisonmail.com
 * @date 2016-11-21
 * 
 * @example 
 * <button excel-import="true" excel-code="vip">导入按钮</button> 
 * <button excel-export="true" excel-code="vip">导出按钮</button> 导出条件继承当前控制器的$scope.data.search_data; 不分页不排序
 */
myDirective.directive("excelImport", ['$parse', 'ngDialog',function($parse, ngDialog) {

    /**
     * 配置说明
     * code : 导入的excel处理类型
     * title : 弹出框的标题显示用
     * tpl : 下载导入模版的请求地址
     */
    var config = {
        'vip': { 'code': 'vip', 'title': '会员', 'tpl': 'index.php?app_act=common/excel_template/get_template_by_code&code=vip' },
        'customer': { 'code': 'customer', 'title': '顾客', 'tpl': 'index.php?app_act=common/excel_template/get_template_by_code&code=customer' },
        'area': { 'code': 'area', 'title': '顾客', 'tpl': 'index.php?app_act=common/excel_template/get_template_by_code&code=area' },
        'brand': { 'code': 'brand', 'title': '顾客', 'tpl': 'index.php?app_act=common/excel_template/get_template_by_code&code=brand' },
        'shop': { 'code': 'shop', 'title': '顾客', 'tpl': 'index.php?app_act=common/excel_template/get_template_by_code&code=shop' }
    };
    var api_route = 'common/excel_import/import';

    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {
            if (!$parse(attrs['excelImport'])(scope)) {
                return;
            }
            //操作的是哪种excel
            var code = $parse(attrs['excelCode'])(scope);
            //单独一个excel对象，用于显示弹框信息
            scope.data.excel_data = config[code];

            //点击事件绑定，所以外面的页面不需要再绑定ng-click事件
            elem.on('click', function() {
                scope.excelImportOpen();
            });

            //打开导入窗口
            var excelWindow = 0;
            scope.excelImportOpen = function() {
                excelWindow = ngDialog.open({
                    overlay: true,
                    disableAnimation: true,
                    showClose: true,
                    width: '350px',
                    template: 'html/directive/excel/ExcelImportWindow.html',
                    scope: scope,
                    controller: ['$scope', 'api', function($scope, api) {
                        $scope.import_excel = function() {
                            api.request(api_route, { 'path': $scope.data.excel_data.value, 'code': $scope.data.excel_data.code }).then(function(ret) {
                                if (ret.status == 1) {
                                    ngDialog.close(excelWindow);
                                    //导入成功后清空上次的导入文档值
                                    $scope.data.excel_data.value = '';
                                    $scope.data.excel_data.name = '';
                                    $scope.alert('导入成功');
                                } else {
                                    $scope.alert(ret.message);
                                }
                            });
                        }
                    }]
                });
            }
            /////////////////////////////////////
        }
    }
}]).directive("excelExport", ['$parse', 'ngDialog', 'api',function($parse, ngDialog, api) {

    var api_route = 'common/excel_export/export';

    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {
            if (!$parse(attrs['excelExport'])(scope)) {
                return;
            }
            //要导出的是什么数据
            var code = $parse(attrs['excelCode'])(scope);

            //导出数据的查询条件，不分页
            var search_data = scope.data.search_data;

            //点击事件绑定，所以外面的页面不需要再绑定ng-click事件
            elem.on('click', function() {
                //console.log(search_data);
                scope.excelExportDownload();
            });

            scope.excelExportDownload = function() {
                scope.notice('下载已经启动，请注意不要反复点击重复提交请求');
                api.request(api_route, { "code": code, "search_data": search_data }, { 'responseType': 'arraybuffer' }).then(function(data) {
                    var blob = new Blob([data], { type: "application/vnd.ms-excel" });
                    var objectUrl = URL.createObjectURL(blob);
                    var aForExcel = $("<a><span class='forExcel'>下载excel</span></a>").attr("href", objectUrl);
                    $("body").append(aForExcel);
                    $(".forExcel").click();
                    aForExcel.remove();
                });
            }

        }
    }
}]);
myDirective.directive(  "pager", function () {
    return {
        restrict: 'E',
        scope: {
            pageData: '=',    //分页数据
            pageFunc: '='     //点击页码触发的事件
        },
        templateUrl: 'html/directive/pager/PagerList.html',
        controller: ['$scope', '$element', '$route', 'ngDialog', function ($scope, $element, $route, ngDialog) {
            //默认路由
            var curr_route = 'default';
            try{
                //当前分页器所在页面的路由
                curr_route = $route.current.$$route.originalPath;
            }catch(e){
                //TODO路由有问题
            }

            var pager_conf_local = $util.getStorage('pager_conf_local')?$util.getStorage('pager_conf_local'):{};
            if(pager_conf_local[curr_route]!=undefined){
                //从本地localstorage取出当前路由设定的分页数
                $scope.pageData.num = parseInt(pager_conf_local[curr_route]);
            }else{
                //否则默认每页15条数据
                $scope.pageData.num = 15;
            }

            //跳转到上一页
            $scope.goto_prev = function(){
                if($scope.pageData.pageNum>1){$scope.pageData.pageNum--};
                $scope.goto_page($scope.pageData.pageNum);
            };

            //跳转到下一页
            $scope.goto_next = function(){
                if($scope.pageData.pageNum<$scope.pageData.countPage){$scope.pageData.pageNum++};
                $scope.goto_page($scope.pageData.pageNum);
            };

            //跳转到首页
            $scope.goto_first = function(){
                $scope.goto_page(1);
            };

            //跳转到尾页
            $scope.goto_last = function(){
                $scope.goto_page($scope.pageData.countPage);
            };

            //直接跳转到某页
            $scope.goto_page = function(i){
                //console.log($scope.pageData);
                $scope.pageData.num = parseInt($scope.pageData.num);
                $scope.pageData.pageNum = i;
                $scope.pageFunc();
            };

            //切换每页显示的数据量，并立刻刷新页面
            $scope.change_page_size = function(){
                //保存当前配置到本地存储
                pager_conf_local[curr_route] = $scope.pageData.num;
                $util.setStorage('pager_conf_local',pager_conf_local);
                //重新获取分页数据
                $scope.goto_page(1);
            };
        
        }]
    }
});
myDirective.directive("selectArea", function () {
    return {
        restrict: 'E',
        scope: {
            inputValue: '=',    //输入框中的地址
            inputReadonly: '='  //是否只读:true只读,false可以编辑
        },
        templateUrl: 'html/directive/selectarea/DirectiveSelectArea.html',
        controller: ['$scope', '$element', 'api', function ($scope, $element, api) {
            //省市区地址数组获取
            api.request('base/region/get_all_tree').then(function (ret) {
                $scope.area_data = ret.data[0].child;
                //默认值设置
                if (typeof $scope.inputValue == 'undefined') {
                    return;
                }
                $scope.area_data.forEach(function (o) {
                    if (typeof $scope.inputValue.province != 'undefined' && o.region_id == $scope.inputValue.province) {
                        $scope.select1 = o;
                        $scope.select1.child.forEach(function (o2) {
                            if (typeof $scope.inputValue.city != 'undefined' && o2.region_id == $scope.inputValue.city) {
                                $scope.select2 = o2;
                                $scope.select2.child.forEach(function (o3) {
                                    if (typeof $scope.inputValue.district != 'undefined' && o3.region_id == $scope.inputValue.district) {
                                        $scope.select3 = o3;
                                    }
                                });
                            }
                        });
                    }
                });
            });

            //选中省
            $scope.change1 = function () {
                $scope.inputValue.province = $scope.select1.region_id;
            };

            //选中市
            $scope.change2 = function () {
                $scope.inputValue.city = ($scope.select2 == null) ? '' : $scope.select2.region_id;
            };

            //选中区县
            $scope.change3 = function () {
                $scope.inputValue.district = ($scope.select3 == null) ? '' : $scope.select3.region_id;
            };

        }]
    }
});
myDirective.directive("selectDate", function () {
    return {
        restrict: 'E',
        scope: {
            inputValue: '=',    //输入框中的日期
            inputTitle: '@',    //弹框的标题
            inputReadonly: '=', //只读开关:true只读, false可编辑
            inputFormat: '@'    //输入的日期格式
        },
        templateUrl: 'html/directive/selectdate/DirectiveSelectDate.html',
        controller: ['$scope', '$element', 'ngDialog', function ($scope, $element, ngDialog) {            
            //日历控件点击事件
            $scope.alertOnEventClick = function (date, jsEvent, view) {
                //console.log(date.format());
                $scope.inputValue = date.format();
                ngDialog.close(open_select_window_id);
            }
            //日历设置
            $scope.eventSources = [];
            $scope.uiConfig = {
                calendar: {
                    height: 520,
                    editable: true,
                    header: {
                        left: 'title',
                        center: '',
                        right: 'today prevYear,prev,next,nextYear'
                    },
                    dayClick: $scope.alertOnEventClick,
                    //eventDrop: $scope.alertOnDrop,
                    //eventResize: $scope.alertOnResize,
                    //eventRender: $scope.eventRender,
                    dayNames: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
                    dayNamesShort: ["日", "一", "二", "三", "四", "五", "六"],
                    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                    monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                    buttonText: { today: '今日', month: '月', week: '周', day: '日' },
                    nowIndicator: true,
                    eventBackgroundColor: '#378006'
                }
            };

            //打开日历选择器窗口
            var open_select_window_id = 0;
            $scope.open_select_window = function () {
                if($scope.inputReadonly){
                    return;
                }

                if ($scope.inputValue != undefined && $scope.inputValue != '' && $scope.inputValue!='0000-00-00 00:00:00' && $scope.inputValue!='0000-00-00') {
                    $scope.uiConfig.calendar.defaultDate = $scope.inputValue;
                    $scope.uiConfig.calendar.events = [{
                        'title': '已选',
                        'start': $scope.inputValue,
                        'allDay': true
                    }];
                }

                open_select_window_id = ngDialog.open({
                    overlay: true,
                    disableAnimation: '',
                    showClose: true,
                    width: 500,
                    height: '',
                    template: 'html/directive/selectdate/DirectiveSelectDateWindow.html',
                    scope: $scope
                });
            }
        }]
    }
});
myDirective.directive("selectMulti", function () {
    return {
        restrict: 'E',
        scope: {
            inputValue: '=',    //输入框中的值
            inputName: '=',     //输入框中用于显示的值
            inputSelect: '=',   //选择框中的数据源
            inputTitle: '@',    //弹框的标题
            inputPlaceholder: '@',  //默认值
            inputReadonly: '=',  //是否只读
            inputTpl: '@',       //弹出框模板
            inputFmt: '@',        //输入框中的格式 0为英文半角逗号分隔的字符串, 1为json格式数组, 默认0
            inputChange: '=',    //最终选中后的事件
            inputClear: '='       //清楚关联数据
        },
        templateUrl: 'html/directive/selectmulti/DirectiveSelectMulti.html',
        controller: ['$scope', '$element', 'ngDialog', 'myServiceUtil', 'api', function ($scope, $element, ngDialog, myServiceUtil, api) {
            //用于复选框的模型
            $scope.checkbox_value = {};
            //用于显示在输入框的code和name临时数组
            $scope.check_code_arr = [];
            $scope.check_name_arr = [];

            //设置选中值，弹框中点击确定后的回调
            $scope.set_value = function () {
                $scope.inputValue = $scope.check_code_arr;

                //将数组转化为逗号分隔字符串
                if(!$scope.inputFmt){
                    $scope.inputValue = '';
                    $scope.check_code_arr.forEach(function (o,i) {
                        $scope.inputValue = $scope.inputValue + o;
                        if(i!==$scope.check_code_arr.length-1){
                            $scope.inputValue = $scope.inputValue + ',';
                        }
                    });
                }
                $scope.inputName = '';
                if ($scope.check_name_arr[0] != '' && $scope.check_name_arr[0] != null) {
                    $scope.inputName = $scope.inputName + $scope.check_name_arr[0];
                }
                if ($scope.check_name_arr[1] != '' && $scope.check_name_arr[1] != null) {
                    $scope.inputName = $scope.inputName + ',' + $scope.check_name_arr[1];
                }
                if ($scope.check_name_arr[2] != '' && $scope.check_name_arr[2] != null) {
                    $scope.inputName = $scope.inputName + ',' + $scope.check_name_arr[2];
                }
                if ($scope.check_name_arr[3] != '' && $scope.check_name_arr[3] != null) {
                    $scope.inputName = $scope.inputName + '...';
                }
                //console.log($scope.inputValue);
                ngDialog.close(open_select_window_id);

                //选择确认以后的回调方法
                if(typeof $scope.inputChange == 'function'){
                    var v = $scope.inputValue
                    //console.log(v);
                    $scope.inputChange(v);
                }
            }

            //复选框点击操作
            $scope.update_check = function (li) {
                //console.log(li);
                //console.log($scope.checkbox_value);
                if ($scope.checkbox_value[li.code] == true) {
                    //选中，将此值push进临时数组
                    $scope.check_code_arr.push(li.code);
                    $scope.check_name_arr.push(li.name);
                } else {
                    //取消选中
                    if (-1 != $scope.check_code_arr.indexOf(li.code)) {
                        $scope.check_code_arr.splice($scope.check_code_arr.indexOf(li.code), 1);
                    }
                    if (-1 != $scope.check_name_arr.indexOf(li.name)) {
                        $scope.check_name_arr.splice($scope.check_name_arr.indexOf(li.name), 1);
                    }
                }
            }

            //清空选中值
            $scope.clear_input_data = function () {
                $scope.inputValue = [];
                $scope.inputName = '';
                $scope.check_code_arr = [];
                $scope.check_name_arr = [];
                $scope.checkbox_value = {};
                if(typeof $scope.inputClear == 'function'){
                    $scope.inputClear();
                }
            }
            //全选：将本页复选框都加入到$scope.checkbox_value
            $scope.check_all = function () {
                $scope.list_data.forEach(function (o) {
                    $scope.checkbox_value[o.code] = true;
                    if (-1 == $scope.check_code_arr.indexOf(o.code)) {
                        $scope.check_code_arr.push(o.code);
                    }
                    if (-1 == $scope.check_name_arr.indexOf(o.name)) {
                        $scope.check_name_arr.push(o.name);
                    }

                });
            }
            //取消全选
            $scope.check_cancel_all = function () {
                $scope.list_data.forEach(function (o) {
                    $scope.checkbox_value = {};
                    $scope.check_code_arr = [];
                    $scope.check_name_arr = [];

                });
            }

            //页面查询和列表数据 -------------------------------------------------------
            $scope.search_data = {};
            $scope.page_data = {};
            $scope.list_data = [];

            //进行查询
            $scope.form_search = function () {
                $scope.inputSelect({ search_data: $scope.search_data, page_data: $scope.page_data }).then(function (ret) {
                    $scope.list_data = ret.data;
                    $scope.page_data = ret.page_data;
                    //$scope.search_data = ret.search_data;
                });
            }

            //打开查询页面
            var open_select_window_id = 0;
            $scope.open_select_window = function () {
                if ($scope.inputReadonly) {
                    return;
                }
                //根据输入的数组，设置弹框内的默认选中状态
                $scope.checkbox_value = {};
                if (typeof $scope.inputValue == 'undefined') {
                    $scope.inputValue = (!$scope.inputFmt)?'':[];
                }
                //逗号组成的字符串还原成数组
                if(!$scope.inputFmt && typeof $scope.inputValue == 'string'){
                    $scope.inputValue = $scope.inputValue.split(',');
                }

                $scope.inputValue.forEach(function (o) {
                    $scope.checkbox_value[o] = true;
                });
                
                //从界面中传入方法，查询数据
                var templateUrl = 'html/directive/selectmulti/DirectiveSelectMultiWindow.html';
                var sw = myServiceUtil.strtoUp2($scope.inputTpl);
                switch (sw) {
                    //渠道选择器设置
                    case 'SelectOrg':
                        templateUrl = 'html/directive/selectmulti/DirectiveSelectMultiWindow' + sw + '.html';
                        $scope.mutile = {};
                        $scope.mutile.category_data_show = true;
                        $scope.mutile.category_data = [];
                        $scope.mutile.category_click = function (v) {
                            //上级渠道Code
                            $scope.search_data.p_code = v.code;
                            $scope.page_data.num = 1;
                            $scope.form_search();
                        }
                        api.request('base/org/get_tree_data_by_code', { 'deep_num': 3 }).then(function (result) {
                            $scope.mutile.category_data = result.data;
                        });
                        break;
                }

                $scope.form_search();
                open_select_window_id = ngDialog.open({
                    overlay: true,
                    disableAnimation: true,
                    showClose: true,
                    width: '',
                    template: templateUrl,
                    scope: $scope
                });
            }
        }]
    }
});
myDirective.directive("selectMultiBtn", function () {
    return {
        restrict: 'E',
        scope: {
            inputSelect: '=',      //选择框中的数据源
            inputTitle: '@',       //弹框的标题
            inputReadonly: '=',    //是否只读
            inputFunc: '='         //选择后的回调方法         
        },
        template: '<button class="button" title="{{inputTitle}}" ng-click="open_select_window()"><span class="glyphicon glyphicon-plus" ng-class="btn.ico">{{inputTitle}}</span></button>',
        controller: ['$scope', '$element', 'ngDialog', function ($scope, $element, ngDialog) {
            
            //用于复选框的模型
            $scope.checkbox_value = {};
            //用于显示在输入框的code和name临时数组
            $scope.check_code_arr = [];
            $scope.check_name_arr = [];
            //设置选中值
            $scope.set_value = function () {
                $scope.inputFunc($scope.check_code_arr);
                ngDialog.close(open_select_window_id);
            }
            
            
            //复选框点击操作
            $scope.update_check = function (li) {
                //console.log(li);
                //console.log($scope.checkbox_value);
                if ($scope.checkbox_value[li.code] == true) {
                    //选中，将此值push进临时数组
                    $scope.check_code_arr.push(li.code);
                    $scope.check_name_arr.push(li.name);
                } else {
                    //取消选中
                    if (-1 != $scope.check_code_arr.indexOf(li.code)) {
                        $scope.check_code_arr.splice($scope.check_code_arr.indexOf(li.code), 1);
                    }
                    if (-1 != $scope.check_name_arr.indexOf(li.name)) {
                        $scope.check_name_arr.splice($scope.check_name_arr.indexOf(li.name), 1);
                    }
                }
            }
            
            //清空选中值
            $scope.clear_input_data = function () {
                $scope.inputValue = [];
                $scope.inputName = '';
                $scope.check_code_arr = [];
                $scope.check_name_arr = [];
                $scope.checkbox_value = {};
            }
            //全选：将本页复选框都加入到$scope.checkbox_value
            $scope.check_all = function () {
                $scope.list_data.forEach(function (o) {
                    $scope.checkbox_value[o.code] = true;
                    if (-1 == $scope.check_code_arr.indexOf(o.code)) {
                        $scope.check_code_arr.push(o.code);
                    }
                    if (-1 == $scope.check_name_arr.indexOf(o.name)) {
                        $scope.check_name_arr.push(o.name);
                    }

                });
            }
            //取消全选
            $scope.check_cancel_all = function () {
                $scope.list_data.forEach(function (o) {
                    $scope.checkbox_value = {};
                    $scope.check_code_arr = [];
                    $scope.check_name_arr = [];

                });
            }
            
            //搜索，分页，列表数据
            $scope.search_data = {};
            $scope.page_data = {};
            $scope.list_data = [];
            
            //进行查询
            $scope.form_search = function(){
                $scope.inputSelect({ search_data: $scope.search_data, page_data: $scope.page_data }).then(function (ret) {
                    $scope.list_data = ret.data;
                    $scope.page_data = ret.page_data;
                });
            }

            //打开查询页面
            var open_select_window_id = 0;
            $scope.open_select_window = function () {
                if($scope.inputReadonly){
                    return;
                }
                //从界面中传入方法，查询数据
                $scope.form_search();
                open_select_window_id = ngDialog.open({
                    overlay: true,
                    disableAnimation: true,
                    showClose: true,
                    width: '',
                    template: 'html/directive/selectmulti/DirectiveSelectMultiWindow.html',
                    scope: $scope
                });
            }
        }]
    }
});
myDirective.directive("selectSimple", function () {
    return {
        restrict: 'E',
        scope: {
            inputValue: '=',    //输入框中的值
            inputName: '=',    //输入框中的值
            inputSelect: '=',   //选择框中的数据源
            inputReadonly: '=',  //是否只读
            inputFilter : '=',   //额外过滤条件，从页面传入
            inputSelectData :'=',
            inputChange: '='
        },
        templateUrl: 'html/directive/selectsimple/DirectiveSelectSimple.html',
        controller: ['$scope', '$element', 'ngDialog', function ($scope, $element, ngDialog) {

            $scope.select_data = {}
            //获取数据
            $scope.form_search = function() {
                if ($scope.inputSelect != undefined) {
                    //console.log($scope.search_data);
                    $scope.inputSelect({
                        search_data: $scope.search_data,
                        page_data: $scope.page_data
                    }).then(function (ret) {
                        //console.log(ret.data);
                        $scope.select_data = ret.data;
                        //默认值设置
                        if (typeof $scope.inputValue == 'undefined') {
                            return;
                        }
                        $scope.select_data.forEach(function (o) {
                            if (typeof $scope.inputValue != 'undefined' && o.code == $scope.inputValue) {
                                $scope.select = o;
                            }
                        });
                    });
                } else {
                    //console.log($scope.inputSelectData);
                    for(i in $scope.inputSelectData){
                        //console.log($scope.inputSelectData[i].level_name);
                        $scope.inputSelectData[i].name = $scope.inputSelectData[i].level_name
                        $scope.select_data[i] = $scope.inputSelectData[i];
                        console.log($scope.select_data[i]);
                    }
                }
            };
            $scope.form_search();
            //选中
            $scope.change = function () {
                $scope.inputValue = $scope.select.code;
                $scope.inputName = $scope.select.name;
                if($scope.inputChange!=undefined){
                	$scope.inputChange($scope.inputValue);
                }

                console.log($scope.select);
                $scope.select = '';
                console.log($scope.inputValue);
                console.log($scope.inputName);
            };
        }]
    }
});
myDirective.directive(  "selectSingle", function () {
    return {
        restrict: 'E',
        scope: {
            inputValue: '=',    //输入框中的值
            inputName: '=',     //输入框中用于显示的值
            inputSelect: '=',   //选择框中的数据源
            inputTitle: '@',    //弹框的标题
            inputPlaceholder: '@',  //默认值
            inputReadonly: '=',  //是否只读
            inputFilter : '=',   //额外过滤条件，从页面传入
            inputChange: '=',     //最终选中后的事件
            inputWidth: '@',     //弹框宽度
            inputClear: '='       //清楚关联数据
        },
        templateUrl: 'html/directive/selectsingle/DirectiveSelectSingle.html',
        controller: ['$scope', '$element', 'ngDialog', function ($scope, $element, ngDialog) {
            var width = ($scope.inputWidth) ? $scope.inputWidth :'50%';

            //设置选中值
            $scope.set_value = function (v) {
                $scope.inputValue = v.code;
                $scope.inputName = v.name;
                //console.log($scope.inputName);
                //console.log($scope.inputValue);
                ngDialog.close(open_select_window_id.id);

                //选择确认以后的回调方法
                //console.log(typeof $scope.inputChange);
                if(typeof $scope.inputChange == 'function'){
                    $scope.inputChange(v);
                }
            }
            //清空选中值
            $scope.clear_input_data = function () {
                $scope.inputValue = '';
                $scope.inputName = '';
                if(typeof $scope.inputClear == 'function'){
                    $scope.inputClear();
                }
            }
            $scope.search_data = {};
            $scope.page_data = {};
            $scope.list_data = [];

            //进行查询
            $scope.form_search = function(){
                var filter = { search_data: $scope.search_data, page_data: $scope.page_data };
                if($scope.inputFilter){
                    //console.log($scope.inputFilter);
                    for(i in $scope.inputFilter){
                        //传的值为空，不应该搜索出结果
                        //if($scope.inputFilter[i]!=undefined&&$scope.inputFilter[i]!=''){
                        filter.search_data[i] = $scope.inputFilter[i];
                        //}
                    }
                }
                $scope.inputSelect(filter).then(function (ret) {
                    $scope.list_data = ret.data;
                    $scope.page_data = ret.page_data;
                    //$scope.search_data = ret.search_data;
                    //console.log($scope.list_data);
                });
            }

            //打开查询页面
            var open_select_window_id = 0;
            $scope.open_select_window = function () {
                if($scope.inputReadonly){
                    return;
                }
                //从界面中传入方法，查询数据
                $scope.form_search();
                open_select_window_id = ngDialog.open({
                    overlay: true,
                    disableAnimation: true,
                    showClose: true,
                    width: width,
                    template: 'html/directive/selectsingle/DirectiveSelectSingleWindow.html',
                    scope: $scope
                });
            }
        }]
    }
});
//视图文件共享 selectSingle 的
myDirective.directive("selectSingleBtn", function () {
    return {
        restrict: 'E',
        scope: {
            inputSelect: '=',      //选择框中的数据源
            inputTitle: '@',       //弹框的标题
            inputReadonly: '=',    //是否只读
            inputFunc: '='         //选择后的回调方法         
        },
        template: '<button ng-click="open_select_window();">{{inputTitle}}</button>',
        controller: ['$scope', '$element', 'ngDialog', function ($scope, $element, ngDialog) {
            //设置选中值
            $scope.set_value = function (v) {
                $scope.inputFunc(v);
                ngDialog.close(open_select_window_id);
            }
            $scope.search_data = {};
            $scope.page_data = {};
            $scope.list_data = [];
            
            //进行查询
            $scope.form_search = function(){
                $scope.inputSelect({ search_data: $scope.search_data, page_data: $scope.page_data }).then(function (ret) {
                    $scope.list_data = ret.data;
                    $scope.page_data = ret.page_data;
                });
            }

            //打开查询页面
            var open_select_window_id = 0;
            $scope.open_select_window = function () {
                if($scope.inputReadonly){
                    return;
                }
                //从界面中传入方法，查询数据
                $scope.form_search();
                open_select_window_id = ngDialog.open({
                    overlay: true,
                    disableAnimation: true,
                    showClose: true,
                    width: '',
                    template: 'html/directive/selectsingle/DirectiveSelectSingleWindow.html',
                    scope: $scope
                });
            }
        }]
    }
});
myDirective.directive("tableSimple", function () {
    return {
        restrict: 'E',
        scope: {
            tableHead: '=',     //表头数据映射
            tableBody: '='      //表格数据
        },
        templateUrl: 'html/directive/tableSimple/DirectiveTableSimple.html',
        controller: ['$scope', '$element', 'ngDialog', function ($scope, $element, ngDialog) {
              console.log($scope.tableBody);
        }]
    }
});
myDirective.directive("uploadExcel", function () {
    return {
        restrict: 'E',
        scope: {
            inputValue: '=',        //输入框中的值, 要保存到数据库的上传后的图片路径
            inputName: '=',         //输入框中用于显示的值
            inputReadonly: '=',     //是否只读，是否允许修改
            inputChange: '=',       //最终选中后的事件，如果需要联动给其他组件
            inputPath: '@'          //上传的子目录, 如不填写则上传到base目录
        },
        templateUrl: 'html/directive/uploadexcel/DirectiveUploadExcel.html',
        controller: ['$scope', '$element', 'ngDialog', 'api', 'Upload', 'Popup', function ($scope, $element, ngDialog, api, Upload, Popup) {
            //false为未选择图片状态：可以选择图片，可以查看已有图片
            //true为选择了本地图片状态：可以点击上传按钮
            $scope.switch = false;
            //用于重置
            var old_url = $scope.inputValue;
            var old_name = $scope.inputName;
            
            //默认上传到base子目录
            if(typeof $scope.inputPath == 'undefined' || $scope.inputPath == ''){
                $scope.inputPath = 'base';
            }

            //选择文件
            $scope.file_select = function (file) {
                if ($scope.inputReadonly) {
                    return;
                }

                if (file != undefined) {
                    $scope.switch = true;
                    $scope.inputTempfile = file;
                    $scope.inputName = file.name;
//                  console.log($scope.inputTempfile);
                }

            }

            //上传临时文件
            $scope.upload_file = function () {
                if ($scope.inputReadonly) {
                    return;
                }
                var url = api.get_api_url('common/fileupload/excel');
                //TODO: 上传文件时，需要session校验
                Upload.upload({
                    url: url,
                    data: { file: $scope.inputTempfile, 'sid': 'sid', path: $scope.inputPath }
                }).then(function (resp) {
                    $scope.switch = false;
                    //上传成功后，修改inputValue
                    //console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
                    if (resp.data.status==1) {
                        Popup.notice('上传成功');
                        $scope.inputValue = resp.data.data.url;
                        $scope.inputName = resp.data.data.name;
                    } else {
                        $scope.inputValue = '';
                        $scope.inputName = '';
                        alert(resp.data.message);
                    }
                }, function (resp) {
                    $scope.switch = false;
                    //上传失败
                    //console.log('Error status: ' + resp.status);
                    alert('上传失败!' + resp.status);
                }, function (evt) {
                    //上传百分比
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    $scope.inputName = progressPercentage + '%';
                    //console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                });
            }

            //清空输入框的值
            $scope.clear_input_data = function () {
                $scope.switch = false;
                $scope.inputValue = '';
                $scope.inputName = '';
            }
        }]
    }
});
myDirective.directive("uploadPicture", function () {
    return {
        restrict: 'E',
        scope: {
            inputValue: '=',        //输入框中的值, 要保存到数据库的上传后的图片路径
            inputName: '=',         //输入框中用于显示的值
            inputReadonly: '=',     //是否只读，是否允许修改
            inputChange: '=',       //最终选中后的事件，如果需要联动给其他组件
            inputPath: '@'          //上传的子目录, 如不填写则上传到base目录
        },
        templateUrl: 'html/directive/uploadpicture/DirectiveUploadPicture.html',
        controller: ['$scope', '$element', 'ngDialog', 'api', 'Upload', function ($scope, $element, ngDialog, api, Upload) {
            //false为未选择图片状态：可以选择图片，可以查看已有图片
            //true为选择了本地图片状态：可以点击上传按钮
            $scope.switch = false;
            //用于重置
            var old_url = $scope.inputValue;
            var old_name = $scope.inputName;
            
            //默认上传到base子目录
            if(typeof $scope.inputPath == 'undefined' || $scope.inputPath == ''){
                $scope.inputPath = 'base';
            }

            //选择文件
            $scope.file_select = function (file) {
                if ($scope.inputReadonly) {
                    return;
                }

                if (file != undefined) {
                    $scope.switch = true;
                    $scope.inputTempfile = file;
                    $scope.inputName = file.name;
//                  console.log($scope.inputTempfile);
                }

            }

            //上传临时文件
            $scope.upload_file = function () {
                if ($scope.inputReadonly) {
                    return;
                }
                var url = api.get_api_url('common/fileupload/picture');
                //TODO: 上传文件时，需要session校验
                Upload.upload({
                    url: url,
                    data: { file: $scope.inputTempfile, 'sid': 'sid', path: $scope.inputPath }
                }).then(function (resp) {
                    $scope.switch = false;
                    //上传成功后，修改inputValue
                    //console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
                    if (resp.data.status) {
                        //alert("上传成功!");
                        $scope.inputValue = resp.data.data.url;
                        $scope.inputName = resp.data.data.name;
                        $scope.preview_pic();
                    } else {
                        alert(resp.data.message);
                    }
                }, function (resp) {
                    $scope.switch = false;
                    //上传失败
                    //console.log('Error status: ' + resp.status);
                    alert('上传失败!' + resp.status);
                }, function (evt) {
                    //上传百分比
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    $scope.inputName = progressPercentage + '%';
                    //console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                });
            }

            //打开预览页面
            var preview_pic_id = 0;
            $scope.preview_pic = function () {
                if (!$scope.inputValue || $scope.inputValue == '') {
                    alert('暂无图片');
                    return false;
                }
                preview_pic_id = ngDialog.open({
                    overlay: true,
                    disableAnimation: true,
                    showClose: true,
                    width: 340,
                    template: 'html/directive/uploadpicture/DirectiveUploadPicturePreview.html',
                    scope: $scope
                });
            }

            //还原原始值
            $scope.refresh_input_data = function () {
                $scope.switch = false;
                $scope.inputValue = old_url;
                $scope.inputName = old_name;
            }

            //清空输入框的值
            $scope.clear_input_data = function () {
                $scope.switch = false;
                $scope.inputValue = '';
                $scope.inputName = '';
            }
        }]
    }
});