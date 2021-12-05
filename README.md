   
 # 简介

    ming_mock是在浏览器端用express风格开发纯前端应用的小工具
 简化板的ming_mock是简化理解ming_mock的实现原理
 地址为
https://github.com/minglie/minglie.github.io/blob/master/js/M_mock0.js
 
   标准版的ming_mock是ming_node的浏览器版本,大多数方法是通用的可参考ming_node中文件型数据库与web服务等章节
https://www.yuque.com/docs/share/e1f16015-0719-4ffd-9464-a35610389153?#


# cdn
https://unpkg.com/ming_mock/index.js

# 压缩cdn
https://unpkg.com/ming_mock@1.9.7/dist/ming_mock.min.js

# React中使用ming_mock
```sh
$ npm install ming_mock
   ```
```javascript
//MIO=M.IO
import  {M, app,MIO} from "ming_mock";

app.get("/listAll",function (req,res) {
    console.log("params--->",req.params)
    let sql=`select ${req.params.id};`;
    M.doSql(sql,(d)=>{
        res.send(d.data[0])
    })
})

MIO.listAll({id:8}).then((u)=>{
    console.log("<----u",u);
})

export  {MIO}
```
# 普通页面使用ming_mock
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="https://unpkg.com/ming_mock@1.9.7/index.js"></script>
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
# ajax拦截
 1.9版本之后增加了对ajax的拦截,ajax请求会转发到app上注册的方法,需要使用
  M.ajaxInterceptorEnable()开启

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="https://unpkg.com/ming_mock@1.9.7/index.js"></script>
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
         console.log(req.params)
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
         console.log(res.data);
     });

     //ajax get请求,app 上未找到注册的方法,使用原生ajax
     axios.request({
         method : 'get',
         url : 'https://cdn.liyanhui.com/data.json?aa=77',

     }).then(res => {
         console.log(res.data);
     });
    </script>
</head>
<body>
</body>
</html>
```

#  localstage静态资源缓存
``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="https://unpkg.com/ming_mock@1.9.7/index.js"></script>
</head>
<body>
<button id="bt1">测试get</button>
<script>
       M.cache.loadJs("jquery", "//cdn.bootcss.com/jquery/1.12.4/jquery.min.js",
         ()=>{
             console.log($)
         }
     );
</script>

    
</body>
</html>
```

# 说明
    app.get("/xxx",(req,res)=>{})或app.post("/xxx",(req,res)=>{})会在M.IO上注册xxx方法,
 用M.IO.xxx({})调用xxx方法,方法的参数必须是对象,app.get的回调函数中通过req.params拿到该对象,
 这完全是express风格的写法
 
 M.doSql是前后端传递数据的唯一方法,可通过M.host=http://localhost:8888修改后端地址

 https://github.com/minglie/minglie.github.io/blob/master/Snippets/manager/server.js



# 插件
https://www.yuque.com/docs/share/90bc5474-2120-4081-9ed7-c7edae5fde36?#tlwhZ
```js
   app.installPlugin("http://localhost:4444/OssWebApi.js",{
        name:"我是插件构造方法参数"
    },{
        name:"我是插件构造方法附加参数"
    });
```

### 访问mysql,需要启动一个服务,用ming_node搭建,ming_node也是express风格,是单个文件且无依赖

```sh
$ npm install ming_node
$ npm install mysql
$ node index.js
   ```
 
index.js内容为
```javascript

M = require("ming_node");
var app=M.server();
app.listen(8888);
myDbconfig={
    //  "host"     : "127.0.0.1",
    //         "user"     : "root",
    //         "password" : "123456",
    //         "port"     : "3306",
       
     "database" : "miapi"
}
Db=M.getMySql(myDbconfig);
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

# 在线sql测试 
https://mucfpga.github.io/codeEdit/index.html

# ming_mock的使用详情
https://www.yuque.com/docs/share/90bc5474-2120-4081-9ed7-c7edae5fde36?# 《ming_mock》

