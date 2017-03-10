简介
===
Wamp就是Windows Apache Mysql PHP集成安装环境，即在window下的apache、php和mysql的服务器软件。

安装
===

## 方式一:使用xampp
下载xampp，https://www.apachefriends.org/zh_cn/index.html 按照提示进行安装

启动apache和MySQL

在浏览器输入http://localhost/ 若能访问即表示安装成功。

## 方式二:使用wamp

## 方式三:[简单]使用php内置server
前提是已经安装了php
```
//进入某目录
$ php -S localhost:8888
```
http://localhost:8888/ 的请求将会指向到该目录

Apache中配置访问目录
=================
## 方式一:[不推荐]直接拷贝目录
将文件目录直接拷贝到apache的htdoc目录下，然后通过http://localhost/yourpath/ 进行访问

## 方式二:通过虚拟目录
在http.conf中增加
```
<IfModule alias_module>
    # 别名指向到你的项目目录
    Alias /your_alias /path/to/your/project
</IfModule>

<Directory "/path/to/your/project">
    Options Indexes FollowSymLinks
    AllowOverride None
    Order allow,deny
    Allow from all
</Directory>

```
使用http://localhost/your_alias/ 进行访问

## 方式三:通过虚拟站点, 一般用于处理多个域名或多个端口
```
#http.conf中找到以下配置的引用并去掉前面的注释
LoadModule vhost_alias_module modules/mod_vhost_alias.so
Include conf/extra/httpd-vhosts.conf
```

找到相应的httpd-vhosts.conf文件，修改
```
Listen 80 ## <---- 这一行可能在http.conf里面已经设置过了不需要重复设置
Listen 8001

<VirtualHost *:80>
    ServerAdmin webmaster@dummy-host.localhost
    DocumentRoot "D:\wamp\www"
    ServerName localhost
    ServerAlias localhost
    ErrorLog "logs/dummy-host.localhost-error.log"
    CustomLog "logs/dummy-host.localhost-access.log" common
</VirtualHost>

<VirtualHost *:8001>
    ServerAdmin webmaster@dummy-host.localhost
    DocumentRoot "E:\project"
    ServerName localhost
    ServerAlias localhost
    ErrorLog "logs/dummy-host.localhost-error.log"
    CustomLog "logs/dummy-host.localhost-access.log" common
</VirtualHost>
```

这样可以通过以下地址访问不同目录
* http://localhost/
* http://localhost:8001/


## 访问权限问题
在http.conf中将各Directory节点设置为
```
<Directory>
    Options Indexes FollowSymLinks
    AllowOverride None
    Order allow,deny
    Allow from all
</Directory>
```