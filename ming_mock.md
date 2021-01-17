# ming_mock

# 介绍
## ming_mock是什么
       ming_mock是[ming_node](https://www.npmjs.com/package/ming_node)的浏览器版本,在浏览器端体验express的开发方式，专注纯前端应用，在前端与后端之间加一层ming_mock,配上丰富的web存储 与 第三方云函数,云数据库更方便的开发纯前端应用,ming_mock是[ming_node](https://www.npmjs.com/package/ming_node)的姐妹篇,强烈建议先学习使用 [ming_node](https://www.npmjs.com/package/ming_node).
#### mockjs对比
        ming_mock中的mock是指mock服务,而不是mock数据,如果需要mock数据,建议使用[easyMock](https://www.easy-mock.com/) 或 [网易nei](https://nei.netease.com/)或者直接使用mockjs.  ming_mock 相比 mockjs 体积更小(未压缩大约为mockjs 体积的六分之一,40kb,压缩后仅20kb), 支持rest风格, 拥有express相同的开放体验 , 方便的 webSql, json数据库工具等, ming_mock不擅长造假数据,但对 增 删 改 服务的mock要优于mockjs,  ming_mock是专注弱化服务, 纯前端应用类型的开发,而不是用来造假数据。
因为解决查询类的mock方案很多,增删改却很少,ming_mock的[内置服务](#KtVMx)很优雅的解决了增删改类的mock问题。

# 安装
最新稳定版 v1.9.3
项目主页 [GitHub](https://minglie.github.io/os/ming_mock/)
项目地址 [GitHub](https://github.com/minglie/ming_mock)
npm地址[ ]()[NPM](https://www.npmjs.com/package/ming_mock)
更新日志 [更新日志](https://github.com/minglie/ming_mock/releases)
在线测试 [https://minglie.github.io](https://minglie.github.io)
## NPM安装
ming_mock无任何第三方依赖,只是一个比较大的js文件.
```bash
# 最新稳定版
npm i ming_mock
```


## script引入
 实际应用我更多的是用script标签引入
```bash
<script src="https://minglie.github.io/js/M_mock.js"></script> 
<script src="https://minglie.gitee.io/mingpage/static/js/M_mock.js"></script> 
#压缩后
<script src="https://minglie.gitee.io/mingpage/static/js/M_mock-min.js"></script> 
```


## ming_mock原理
      ming_mock对jquery进行动态加载判断 内部的极简jquery实现了ming_mock的0依赖，ming_mock结合easyUI是绝配,此时easyUI组件的ajax请求将会被ming_mock拦截,后面介绍如何在ming_mock不影响jquery的ajax的使用, 为了 简化调用 与 异步调用ming_mock会将app注册的所有方法都在MIO对象上再注册一遍, ming_mock同[ming_node](https://www.npmjs.com/package/ming_node)有丰富的过滤器方便公共代码抽取,公共参数的处理或拦截,为了方便调试,ming_mock将所有接口的参数用map存储,从app.reqMap 与app.resMap可以查看某一时刻每个接口最新的请求与响应数据,
![image.png](https://ming-bucket-01.oss-cn-beijing.aliyuncs.com/yuque/ming_mock1592043930063-2dde8e9b-812e-4821-b015-c4e8d163952b.png#align=left&display=inline&height=76&margin=%5Bobject%20Object%5D&name=image.png&originHeight=76&originWidth=650&size=7081&status=done&style=none&width=650)
ming_mock的原理很简单,但无关代码太多可能会影响理解, 为便于理解ming_mock这里有一个简化可用的例子
[https://minglie.github.io/js/M_mock0.js](https://minglie.github.io/js/M_mock0.js)
   ming_mock对外暴露3个对象

app:    用于服务端方法注册
M:       很多静态方法全部挂在M上
MIO:   实际等于M.IO 用于简化请求 

# 快速体验
下面是ming_mock的最简单例子,后面所有例子可以直接打开浏览器控制台进行测试
[https://minglie.github.io](https://minglie.github.io)
```bash
<!DOCTYPE html>
<html lang="en">
<head>
    <script src="https://minglie.github.io/js/M_mock.js"></script> 
</head>
<script>
    app.get("/test",(req,res)=>{
        console.log("req->",req.params)
        res.send("hello Word")
    })
    console.log("res->",M.get("/test?id=zs&name=ls"));  
</script> 
</html>
```
![image.png](https://ming-bucket-01.oss-cn-beijing.aliyuncs.com/yuque/ming_mock1592044498559-dc2a82b2-7483-4b1d-baec-045fee0baa1c.png#align=left&display=inline&height=104&margin=%5Bobject%20Object%5D&name=image.png&originHeight=104&originWidth=739&size=9132&status=done&style=none&width=739)
# 文件型JSON数据库
大家都知道浏览器端是无法直接操作文件的,这里使用localStorage文件模拟,下面的方法中的file实际是localStorage的一个key
```bash
读取json文件file对应的对象
M.getObjByFile(file)
将对象obj写入file
M.writeObjToFile(file,obj)
将file中追加一个对象obj,file存的是对象数组
M.addObjToFile(file,obj)
删除file中指定id的对象,file存的是对象数组,对象都有id
M.deleteObjByIdFile(file,id)
删除file中包含o的对象,o形如{k,v}
M.deleteObjByPropFile(file,o)
修改file中的obj对象,file存的是对象数组,对象都有id
M.updateObjByIdFile(file,obj)
```
# 二次封装文件型数据库的方法
内部有一个M.database_path="database_path" 作为下列方法的操作文件(localStorage的一个key)
```javascript
//将obj写入M.database_path,会自动生成一个id,返回新增的对象
M.add(obj)
//修改M.database_path中的obj, obj必有id属性
M.update(obj)
//根据id或id数组 删除M.database_path中的obj
M.deleteById(id)
//清空M.database_path
M.deleteAll({k,v})
//删除M.database_path中属性k值为v的对象
M.deleteByProp({k,v})
//根据id查询M.database_path中的obj
M.getById(id)
//查询M.database_path的所有对象
M.listAll({k,v})
//查询M.database_path中属性k值为v的对象
M.listByProp({k:v})
//分页查询M.database_path,startPage为起始页，limit是每页条数，caseObj为条件,可省略,
//返回形如{total:4,rows:[]}
M.listByPage(startPage,limit,caseObj)

```


![image.png](https://ming-bucket-01.oss-cn-beijing.aliyuncs.com/yuque/ming_mock1592045087797-a8b2ffe2-ac22-421c-a5e1-4c0a8652f96e.png#align=left&display=inline&height=513&margin=%5Bobject%20Object%5D&name=image.png&originHeight=513&originWidth=921&size=57521&status=done&style=none&width=921)
# WebSQL的封装
web SQL可以让我们在完全不依赖后端的情况下也可以开发出功能丰富的纯前端应用
核心只有一个方法 M.Db().doSql 参数为一个sql返回一个Promise对象
使用捕获异常的方式进行表的单次初始化


一个例子
[https://minglie.github.io/Snippets/managerbrower/index.html](https://minglie.github.io/Snippets/managerbrower/index.html)
```javascript
M.Db().doSql("select count(1) c from resource").catch(d=>{
    M.Db().doSql("CREATE TABLE resource (id INTEGER NOT NULL, name varchar(200) 
                 DEFAULT NULL, res_url varchar (200) DEFAULT NULL, 
                 parent_id INTEGER NOT NULL,description varchar(200), 
                 PRIMARY KEY (id))")
});
```
![image.png](https://ming-bucket-01.oss-cn-beijing.aliyuncs.com/yuque/ming_mock1592045440168-8093b517-e716-495c-a52b-3a425fe7f516.png#align=left&display=inline&height=460&margin=%5Bobject%20Object%5D&name=image.png&originHeight=460&originWidth=1322&size=94962&status=done&style=none&width=1322)
# 全局作用域
这个全局作用域方法也是基于localStorage实现, 其对应的key由M.map_path = "map_path"; 配置
#### 向全局作用域 加入 或 修改 键为K对应的值为V,K必须为字符串,V则没有要求
```javascript
M.setAttribute(k,V)
```
#### 从全局作用域取得键为K的对应的值
```javascript
M.getAttribute(K)
```




# SQL生成器
    ming_mock也带了些基本的CRUD  sql生成
```javascript
//根据表名与对象obj生成添加sql
M.Db().DbgetInsertObjSql(tableName,obj)
//根据表名与对象obj生成删除sql,删除条件是obj
M.Db().getDeleteObjSql(tableName,obj)
//根据表名与对象obj生成修改sql,修改条件为caseObj对象
M.Db().getUpdateObjSql(tableName,obj,caseObj)
//根据表名与对象obj生成查询sql,查询条件是obj
M.Db().getSelectObjSql(tableName,obj)

```
# 百度语音
ming_mock封装了百度文字转语音函数
[https://minglie.github.io/Snippets/#/-1](https://minglie.github.io/Snippets/#/-1)
```javascript
M.speak("hello word")
```
# 服务注册
    服务注册同express一样使用app.get 或 app.post 注册 ,请求的参数全部已封装在req.params中, req也包含一些其他信息,使用res.send方法进行响应
```javascript
app.get("/test",function (req,res) {
    console.log("params--->",req.params)
    let sql=`select ${req.params.id};`;
    M.doSql(sql,(d)=>{
        res.send(d.data[0])
    })
})
```
## GET接口服务
```bash
app.get("/test",(req,res)=>{
        console.log("req->",req.params)
        res.send("hello Word")
    })
console.log("res->",M.get("/test?id=zs&name=ls"));  
```
![image.png](https://ming-bucket-01.oss-cn-beijing.aliyuncs.com/yuque/ming_mock1592047819760-6b6eafc0-df03-4803-83b9-ebf38a31ef0e.png#align=left&display=inline&height=268&margin=%5Bobject%20Object%5D&name=image.png&originHeight=268&originWidth=968&size=26427&status=done&style=none&width=968)
## Rest风格服务
```bash
app.get("/test/:id",(req,res)=>{
        console.log("req->",req.params)
        res.send("hello Word")
    })
console.log("res->",M.get("/test/55"));  
```
![image.png](https://ming-bucket-01.oss-cn-beijing.aliyuncs.com/yuque/ming_mock1592047941926-a79e2b32-5fe6-4bdb-81bb-68b7ec24a3a5.png#align=left&display=inline&height=224&margin=%5Bobject%20Object%5D&name=image.png&originHeight=252&originWidth=758&size=23854&status=done&style=none&width=675)


## POST接口服务
```bash
app.post("/test",(req,res)=>{
        console.log("req->",req.params)
        res.send("hello Word")
    })
console.log("res->",M.post("/test?id=4",{name:"zs"}));  
```
![image.png](https://ming-bucket-01.oss-cn-beijing.aliyuncs.com/yuque/ming_mock1592048066055-10f83046-bb53-404c-8f6d-1342605ae75b.png#align=left&display=inline&height=257&margin=%5Bobject%20Object%5D&name=image.png&originHeight=257&originWidth=780&size=25263&status=done&style=none&width=780)
# 服务调用
     服务调用的方式非常多可以使用 M.get, M.post  , M.ajax  ,MIO.pathName , $.ajax 等 ,easyUI 组件是使用$.ajax,
要用M.ajax覆盖掉$.ajax,开启ajax拦截后还可以使用 axios进行服务调用
下面是服务调用的5种方式
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="https://minglie.github.io/js/M_mock.js"></script>
    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    <script>
        //开启ajax拦截
        M.ajaxInterceptorEnable()
        //开启jquery ajax拦截
        M.jqueryAjaxInterceptorEnable()
        //服务注册
        app.get("/data", (req, res) => {
            console.log("请求参数", req.params)
            res.send(555)
        })
        //方式1
        console.log("M.get调用", M.get("/data?id=1"))
        //方式2
        MIO.data({ id: 2 }).then(d => console.log("MIO调用", d))
        //方式3
        M.ajax({
            url: "/data",
            async: false,
            type: 'get',
            data: {id:3},
            dataType: 'json',
            success: function (data) {
                console.log("M.ajax调用", data);
            }
        })
          //方式4
          $.ajax({
            url: "/data",
            async: false,
            type: 'get',
            data: {id:4},
            dataType: 'json',
            success: function (data) {
                console.log("$.ajax调用", data);
            }
        })
        //方式5
        //开启 M.ajaxInterceptorEnable()才能用
        axios.request({
            method: 'get',
            url: 'https://cdn.liyanhui.com/data?id=5',
        }).then(res => {
            console.log("axios调用", res.data);
        });
    </script>
</head>
<body>
</body>
</html>
```
# ![image.png](https://ming-bucket-01.oss-cn-beijing.aliyuncs.com/yuque/ming_mock1592118447951-449b8d88-c903-43f1-8bc4-7e3a638f2ffa.png#align=left&display=inline&height=966&margin=%5Bobject%20Object%5D&name=image.png&originHeight=966&originWidth=1762&size=316936&status=done&style=none&width=1762)


# ajax拦截
    app对象上注册了大量服务,第三方ajax库如果也能调到将非常方便,因此1.9版本后新增了ajax拦截功能.   
    ajax拦截是重写 window.XMLHttpRequest 实现的,为了防止影响其他接口,默认是不开启的,
使用 M.ajaxInterceptorEnable() 开启后,所有的ajax调用会先在app上找，找不到才会去发送真正的http请求,
开启ajax拦截后可以使用 
发送前 M.beforeSend,  响应后 M.endResponse 两个钩子函数,
即时不使用ajax拦截app 上也有
app.begin((req,res)=>{ console.log("begin:",req)})
app.end((data)=>{  console.log("end:",data)})
两个钩子函数可用
```javascript
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="https://minglie.github.io/js/M_mock.js"></script> 
    <script src="https://unpkg.com/axios/dist/axios.min.js"></script> 
    <script>
     //开启ajax拦截
     M.ajaxInterceptorEnable()
     
    //关闭ajax拦截
    //ajaxInterceptorDisable()
   
    //开启fetch拦截
    //M.fetchInterceptorEnable()
    //关闭fetch拦截
    //M.fetchInterceptorDisable()

     //发送前钩子
     M.beforeSend=o=>{console.log("M.beforeSend",o);return true}
     //响应后钩子
      M.endResponse=(d,xhr)=>{console.log("QQ",d,xhr);return "QQQQQQQQQQ"}
     //app上方法注册
     app.post("/data.json",(req,res)=>{
         console.log("请求参数",req.params)
         setTimeout(()=>{res.send({"nzme":88})},100)
     })
     //ajax post请求 ,app已注册改方法,使用M.ajax 转到 app上
     axios.request({
         method : 'post',
         url : 'https://cdn.liyanhui.com/data.json?id=77',
         params: {
             "age":44
         },
         data:{
             "hobby":"goo"
         }
     }).then(res => {
         console.log("mock返回",res.data);
     });
     //ajax get请求,app 上未找到注册的方法,使用原生ajax
     axios.request({
         method : 'get',
         url : 'https://cdn.liyanhui.com/data.json?aa=77',
 
     }).then(res => {
         console.log("http请求返回",res.data);
     });
    </script> 
</head>
<body>
</body>
</html>
 
```
# ![image.png](https://ming-bucket-01.oss-cn-beijing.aliyuncs.com/yuque/ming_mock1592115759438-7a1f8742-2d34-4064-b739-a108e9796a1b.png#align=left&display=inline&height=999&margin=%5Bobject%20Object%5D&name=image.png&originHeight=999&originWidth=1890&size=335334&status=done&style=none&width=1890)

# 过滤器
请求之前或响应之后做一些额外处理
```bash
app.get("/test",(req,res)=>{
        console.log("req->",req.params)
        res.send("hello Word")
    })
app.begin((req,res)=>console.log("begin",req.url))
app.end((d)=>console.log("end",d))
console.log("res->",M.get("/test?id=4"));  
```
![image.png](https://ming-bucket-01.oss-cn-beijing.aliyuncs.com/yuque/ming_mock1592048265508-2317e9d1-c29d-4899-8cf3-e2dddae7c976.png#align=left&display=inline&height=332&margin=%5Bobject%20Object%5D&name=image.png&originHeight=332&originWidth=803&size=34840&status=done&style=none&width=803)
# MIO方式请求
MIO方式是除了M.get , M.post 之外的另一种请求方式，其目的是为了进行异步请求, M.get也可以进行异步请求,但 app注册时 res.send 必须返回 Promise对象, MIO统一使用Promise接收
调用格式为 MIO.urlPath(prrams).then(d=>console.log(d))
```bash
app.post("/test",(req,res)=>{
        console.log("req->",req.params)
        res.send("hello Word")
    })
MIO.test({name:"zs"}).then(d=>{console.log("res",d)})  
```
![image.png](https://ming-bucket-01.oss-cn-beijing.aliyuncs.com/yuque/ming_mock1592048895344-e3fbc8f2-d72e-44c1-aa41-7df3d04a7bdb.png#align=left&display=inline&height=256&margin=%5Bobject%20Object%5D&name=image.png&originHeight=256&originWidth=738&size=28355&status=done&style=none&width=738)

# SSE服务端推送消息到浏览器
ming_mock对SSE进行了封装,以[ming_node](https://minglie.github.io/os/ming_node/)作为后端
## 后端
```bash
var M=require("ming_node");
var app=M.server();
app.listen(8888);
sseApp=M.sseServer()
//sseApp.listen(2000)
app.get("/sseServer",sseApp)
app.get("/getById",(req,res)=>{ 
    console.log(req.params);
    sseApp.send(JSON.stringify(req.params));
    res.send("ok");
})
```
## 前端
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>xxx</title>
<script src="https://cdn.bootcss.com/jquery/3.3.1/jquery.js"></script>
<script src="https://minglie.github.io/js/M_mock.js"></script>
</head>
<body>
<h1>获取服务端更新数据</h1>
<div id="result"></div>
<script>

         M.EventSource('http:/localhost:8888',function(e){
            result.innerText+=e.data;
         })

</script>

</body>
</html>
```
![](https://cdn.nlark.com/yuque/0/2019/png/278997/1565410382362-395577f6-6779-462f-9e1d-ee08c20b1318.png?x-oss-process=image%2Fresize%2Cw_660#align=left&display=inline&height=391&margin=%5Bobject%20Object%5D&originHeight=391&originWidth=660&status=done&style=none&width=660)

# http请求
ming_mock内部封装了最常用的http请求方法,无需引入其他第三方库
```javascript
# url 为接口地址,callback 为回调函数, data为请求参数
# get 请求 
M.fetchGet(url, callback, data); 
# post请求
M.fetchPost(url, callback, data);
# post json请求
M.fetchPostJson(url, callback, data);
```
# ![image.png](https://ming-bucket-01.oss-cn-beijing.aliyuncs.com/yuque/ming_mock1592050488996-3499581a-aabc-41d3-85c5-9d11e0f6bb03.png#align=left&display=inline&height=200&margin=%5Bobject%20Object%5D&name=image.png&originHeight=200&originWidth=1161&size=22594&status=done&style=none&width=1161)
# M.require方法
     M.require是一个简易发出http get请求的方法,内部会自动识别返回的是json,文本还是,js
```javascript
# 返回json
M.require("https://minglie.github.io/json/minglie.json").then(d=>console.log(d))
# 执行返回的js文件
M.require("https://minglie.github.io/json/minglie.js").then(d=>console.log(d))
# 返回文本
M.require("https://minglie.github.io/json/minglie.txt").then(d=>console.log(d))
```
![image.png](https://ming-bucket-01.oss-cn-beijing.aliyuncs.com/yuque/ming_mock1592049933310-a3ea71d5-4623-4f0f-ac79-89597b9119af.png#align=left&display=inline&height=182&margin=%5Bobject%20Object%5D&name=image.png&originHeight=182&originWidth=1164&size=23719&status=done&style=none&width=1164)
# M.doSql方法


```javascript
M.doSql("select * from t_resource").then(d=>console.log(d))
或者
M.doSql("select * from t_resource",(d=>console.log(d)))
```
M.doSql是直接远程调用后端的app.post("/doSql"),需要后端支持,用ming_node+mysql实现
对应的服务主机地址由M.host配置,默认为空
也可以用M.doSql=M.DB().doSql覆盖
用webSql写页面
```javascript
var M=require("ming_node");
var mysql  = require('mysql')
 
myDbconfig={
    "host"     : "127.0.0.1",
        "user"     : "root",
        "password" : "123456",
        "port"     : "3306",
        "database" : "guns"
}
var app=M.server();
app.listen(8888);
var Db = {};
var pool = mysql.createPool(myDbconfig);
Db.doSql=function(sql){
    var promise = new Promise(function(reslove,reject){      
        pool.getConnection(function(err, connection){
            connection.query( sql, function(err, rows){
                if(err) {
                    console.error(err);
                    reject(err);
                }else{
                    reslove(rows);
                }
            });
            
            connection.release();
          });
    })
    return promise;
}
 
app.get("/",async function (req,res) {
    app.redirect("/index.html",req,res);
});
 
app.post("/doSql",async function (req,res) {
    try{      
        var rows= await Db.doSql(req.params.sql);
        res.send(M.result(rows));
      
    }catch (e){
        res.send(M.result(e,false));
    }
})
 
```
# M.getParameter
    M.getParameter可以方便的获取当前url上的参数,用于页面传参非常方便
```javascript
M.getParameter("name")
```
# ![image.png](https://ming-bucket-01.oss-cn-beijing.aliyuncs.com/yuque/ming_mock1592056794868-f867319a-7a87-40a5-a44c-1139f733717c.png#align=left&display=inline&height=542&margin=%5Bobject%20Object%5D&name=image.png&originHeight=542&originWidth=919&size=65299&status=done&style=none&width=919)
# M.urlParse
M.urlParse 实际是内部解析url参数用的,也可用于外部使用
![image.png](https://ming-bucket-01.oss-cn-beijing.aliyuncs.com/yuque/ming_mock1592056958835-de081a18-f3d1-4c1e-82f4-a5191c884425.png#align=left&display=inline&height=89&margin=%5Bobject%20Object%5D&name=image.png&originHeight=89&originWidth=711&size=9250&status=done&style=none&width=711)


# M.fileDownload
M.fileDownload(content, filename) 用于文本文件下载
![image.png](https://ming-bucket-01.oss-cn-beijing.aliyuncs.com/yuque/ming_mock1592057131403-6583c3fe-5916-470f-b660-14152b5f33ea.png#align=left&display=inline&height=270&margin=%5Bobject%20Object%5D&name=image.png&originHeight=270&originWidth=887&size=32772&status=done&style=none&width=887)
# 其他方法
```javascript
//延时指定毫秒
M.sleep(numberMillis)
//下划线转驼峰,打印"userId"
console.log("user_id".underlineToHump())
//驼峰转下划线,打印"user_id"
console.log("userId".humpToUnderline())
//首字母变大写,打印"User"
console.log("user".firstChartoUpper())
//首字母变小写,打印"uSER"
console.log("USER".firstChartoLower())
//打印当前日期,2019-03-24
console.log(new Date().format("yyyy-MM-dd"))
//随机字符串生成
 M.randomStr()
//对象转form
M.encodeURIComponentObj()
```


# 如何在ming_mock中使用$.ajax
最新版的ming_mock,我并没有强行重写 $.ajax, 但在easyUI 与 ming_mock 结合时要加一句  $.ajax=M.ajax;
既想用ming_mock也想用$.ajax 可以用起别名的方式解决
```javascript
//给apicloud用
window.$1={}
$1.ajax= $.ajax;
//给easyui用
$.ajax=M.ajax;
```
# webpack环境中使用ming_mock
## 方式1(不建议)
因为这种方式需要npm 安装ming_mock 对原有项目有侵入,故不建议使用
MIO.js 用于写服务
```javascript
// $ npm install ming_mock
//MIO=M.IO
import  {M, app,MIO} from "ming_mock";
 
app.get("/listAll",function (req,res) {
    console.log("params--->",req.params)
    res.send("AAAAAAAA")
})
export default MIO;
```
index.js 引入MIO 使用
```javascript
import React from 'react'
import  MIO from "./MIO.js";

export default class Mockt extends React.Component {
    listAll(id){
        MIO.listAll({id:id}).then((u)=>{
            console.log("<----u",u);
        })
    }
   render(){
        return(
         <div>
            <h1>ming</h1>
            <button onClick={this.listAll.bind(this,77)}>点击</button>
        </div>)
   }
}
```
## 方式2(推荐)
#### index.html模版引入
为了无侵入的使用ming_mock，建议用script方式引入
#### 模版index.html
```jsx
<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="https://minglie.github.io/js/M_mock.js"></script> 
     <script>
        M.ajaxInterceptorEnable()
        app.get("/listAll",function (req,res) {
                res.send("ww")
        })
     </script>
    <title>React App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>

```
关闭eslink检查或者使用 /* global MIO */
```javascript
import React from 'react'
/* global MIO */
export default class Mockt extends React.Component {
    listAll(id){
         MIO.listAll({id:44}).then(d=>console.log(d))
    }
   render(){
        return(
         <div>
            <h1>ming</h1>
            <button onClick={this.listAll.bind(this,77)}>点击</button>
        </div>)
   }
}
```
或使用axios, ming_mock只会拦截app上注册的,也省去了全局变量问题，这种方式完全感知不到ming_mock的存在
```jsx
import React from 'react'
import axios from 'axios'
/* global MIO */
export default class Mockt extends React.Component {
    listAll(id){
        axios.request({
            method: 'get',
            url: 'https://cdn.liyanhui.com/listAll?id='+id,
        }).then(res => {
            console.log("axios调用", res.data);
        });
    }

    listAll1(id){
        axios.request({
            method: 'get',
            url: 'https://www.fastmock.site/mock/489c97aee272f4fedc398579052ef5eb/ming/api/listAll1?id='+id,
        }).then(res => {
            console.log("axios调用", res.data);
        });
    }
   render(){
        return(
         <div>
            <h1>ming</h1>
            <button onClick={this.listAll.bind(this,77)}>listAll1</button>
            <button onClick={this.listAll1.bind(this,77)}>listAll2</button>
        </div>)
   }
}
```
# 普通页面使用ming_mock
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="https://minglie.github.io/js/M_mock.js"></script>
</head>
<body>
 
<button id="bt1">测试get</button>
<button id="bt2">测试rest</button>
 
<button id="bt3">添加</button>
<button id="bt4">查看</button>
 
<script>
      app.get("/t1",async (req,res)=>{
            console.log(req.params)
            res.send(Promise.resolve(5))
      })
 
      app.get("/t2/:id/:name",async (req,res)=>{
            console.log(req.params)
            res.send(Promise.resolve(req.params.id))
      })
 
      app.post("addUser",async (req,res)=>{
            console.log(req.params)
            M.add({name:req.params.name})
            res.send("add success")
      })
 
      app.get("listByPage",async (req,res)=>{
            console.log(req.params)
            res.send(M.listAll())
      })
 
 
      bt1.onclick=function(){
         a=M.get("/t1?ss=77").then(d=>console.log(" bt1.onclick",d+1))
          console.log(a)
      }
 
      bt2.onclick=function(){
        M.get("/t2/5/zs?ss=7").then(d=>console.log("bt2.onclick",d+1))
      }
 
      a=0;
      bt3.onclick=function(){
        a++;
        MIO.addUser({name:"zs"+a}).then(d=>console.log("bt3.onclick",d+1))
      }
 
      bt4.onclick=function(){
        MIO.listByPage({}).then(d=>console.log("bt4.onclick",d))
      }
 
</script>
 
    
</body>
</html>
```


# 内置服务
ming_mock提供了基本的增,删,改,查,分页,条件查询接口可直接使用比如添加接口MIO.add({name:"zs"}),内部随机生成一个ID，可以把这些方法覆盖掉
说明:
app.get("/xxx",(req,res)=>{})或app.post("/xxx",(req,res)=>{})会在M.IO上注册xxx方法, 用M.IO.xxx({})调用xxx方法,方法的参数必须是对象,app.get的回调函数中通过req.params拿到该对象, 这完全是express风格的写法
```javascript
   app.post("/add",(req,res)=>{
            r=M.add(req.params);
            res.send(M.result(r));
        });
 
        app.get("/delete",(req,res)=>{
            M.deleteById(req.params.id);
            res.send(M.result("ok"));
        });
 
        app.post("/update",(req,res)=>{
            M.update(req.params);
            res.send(M.result("ok"));
        });
 
        app.get("/getById",(req,res)=>{
            r=M.getById(req.params.id);
            res.send(M.result(r));
        });
 
        app.get("/listAll",(req,res)=>{
            r=M.listAll();
            res.send(M.result(r));
        });
 
        app.get("/listByParentId",(req,res)=>{
            r=M.listByProp({parentId:req.params.parentId});
            res.send(M.result(r));
        });
 
        app.get("/listByPage",(req,res)=>{
            r=M.listByPage(req.params.startPage,req.params.limit);
            res.send(M.result(r));
        })
```
# 使用ming_mock分析网站接口
来个好玩的,使用ming_mock强大的ajax拦截,可以分析一些单页应用的接口调用信息,以fastMock为例,控制台输入下面脚本,
可以将接口信息发送到自己的服务器;
### ajax拦截
拦截ajax请求,将请求信息发送到自己服务端
```bash
////////////////////////注入ming_mock脚本//////////////////////////////////////////
var script = document.createElement('script');
script.src = "https://minglie.gitee.io/mingpage/static/js/M_mock.js";
document.getElementsByTagName('head')[0].appendChild(script); 

///////////////开启ajax拦截//////////////////////////////
M.ajaxInterceptorEnable();
//////////////发到自己服务器里///////////////////////////////
M.beforeSend=(options)=>{
   M.fetchGet("http://127.0.0.1:8888/a",()=>{},options);
   return true;
}

/////////////////////服务端/////////////////////////////////////////
app.get("/a", (req, res) => {
    console.log(req.params)
    res.send("https://c-t.work/s/7b10cb04d2754c");
})
```
### ![image.png](https://ming-bucket-01.oss-cn-beijing.aliyuncs.com/yuque/ming_mock1592142307527-f7d2a8db-6aa0-49f6-9a93-aaef96ec3eba.png#align=left&display=inline&height=837&margin=%5Bobject%20Object%5D&name=image.png&originHeight=837&originWidth=1746&size=230433&status=done&style=none&width=1746)
### SSE反控
浏览器开启SSE监听,服务端反控浏览器,浏览器注入axios就可以控制浏览器发送ajax了
```bash
////////////////////////注入ming_mock脚本//////////////////////////////////////////
var script = document.createElement('script');
script.src = "https://minglie.gitee.io/mingpage/static/js/M_mock.js";
document.getElementsByTagName('head')[0].appendChild(script); 

////////////启动本地服务脚本接收拦截的数据///////////////////////////
curl https://gitee.com/minglie/codes/gqruda7entx53y82f6vw077/raw?blob_name=doSql.html >doSql.html 
curl https://minglie.gitee.io/mi/i2.js > index.js && node index.js  

app.get("/a", (req, res) => {
    console.log(req.params)
    res.send("https://c-t.work/s/7b10cb04d2754c");
})

if(Object.keys(M._get).indexOf("/sseServer/")==-1){
   M.sseApp=M.sseServer();
   app.get("/sseServer",M.sseApp)
}

app.get("/p",(req,res)=>{ 
    console.log(req.params);
     M.sseApp.send(JSON.stringify(req.params));
    res.send("ok");
})

app.post("/doSql",(req,res)=>{ 
     console.log(req.params.sql);
     M.sseApp.send(req.params.sql);
     res.send(M.result("ok"));
})

///////////////浏览器端SSE方式反控浏览器//////////////////////////
M.EventSource('http://localhost:8888/sseServer',function(e){
      eval(e.data)
}) 
```
![image.png](https://ming-bucket-01.oss-cn-beijing.aliyuncs.com/yuque/ming_mock1592150435316-0d65a624-decf-4551-8bce-12c2e098fa8c.png#align=left&display=inline&height=834&margin=%5Bobject%20Object%5D&name=image.png&originHeight=834&originWidth=1845&size=360310&status=done&style=none&width=1845)


# 需要改进点
要改的问题多了以后,一起改
```
1. app.end() //钩子返回请求的req,否则异步调用无法将请求响应对应上
```




