   
 # 简介

    ming_mock是在浏览器端用express风格mock后端接口小工具
 最新版移除了对jQuery的依赖,如果项目中有jQuery,ming_mock就用jQuery,如果没有就使用默认实现的jQuery
 支持get,post,rest风格真实还原express
 简化板的ming_mock是简化理解ming_mock的实现原理
 地址为
 https://minglie.github.io/js/M_mock0.js
 
 
   标准版的ming_mock是ming_node的浏览器版本,大多数方法是通用的可参考ming_node中文件型数据库与web服务等章节
https://minglie.github.io/os/ming_node/

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
# ajax拦截
 1.9版本之后增加了对ajax的拦截,ajax请求会转发到app上注册的方法,需要使用
  M.ajaxInterceptorEnable()开启

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
     //发送前钩子
     M.beforeSend=o=>{console.log("M.beforeSend",o);return true}
     //响应后钩子
     M.beforeResponse=o=>{console.log("M.beforeResponse",o)}
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

# 普通页面用React使用ming_mock的CRUD
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <script src="https://cdn.bootcss.com/react/16.4.0/umd/react.development.js"></script>
    <script src="https://cdn.bootcss.com/react-dom/16.4.0/umd/react-dom.development.js"></script>
    <script src="https://cdn.bootcss.com/babel-standalone/6.26.0/babel.min.js"></script>
    <script src="https://minglie.github.io/js/M_mock.js"></script>
</head>

<script>
    app.get("/test",(req,res)=>{
        document.getElementById("requestDiv").innerHTML=JSON.stringify(req.params)
        res.send(M.result("ok "+req.params.id))
    })
</script>

<body>
<div id="requestDiv" ></div>
<hr/>
<hr/>
<div id="resultDiv" ></div>
<hr/>
<hr/>



<div id="example" class="example"></div>

<script type="text/babel">

    class TodoItem extends React.Component {
        constructor(props){
            super(props);
        }

        handleDelete(id){
            this.props.delete(id)
        }

        render() {
            const {content}= this.props;
            const r= content.map((u,index)=>{
                    return(
                        <li key={u.id}>
                            {u.id} {u.name}   {u.age}
                            <button onClick={this.handleDelete.bind(this,u.id)}>删除</button>
                        </li>
                    )
                }
            );
            return (
                <div>{r}</div>
            )
        }
    }

    var M_this={};
    class TodoList extends React.Component {
        // 初始化数据
        constructor(props){
            super(props);
            this.state={
                list:[],
            };
            M_this=this;
        }

        componentDidMount() {
            this.setState({
                list:M.listAll()
            });
        };
        handleAdd(e) {
            M.add({
                name:this.refs.name.value,
                age:this.refs.age.value,
            });
            this.setState({
                list:M.listAll()
            });
        }

        handleUpdate(e) {
            M.update({
                id:this.refs.id.value,
                name:this.refs.name.value,
                age:this.refs.age.value,
            });
            this.setState({
                list:M.listAll()
            });
        }

        handledelete(e) {
            M.deleteById(e);
            M_this.setState({
                list:M.listAll()
            });
        }


        handleTest1(e) {
          let  r=M.get("/test?id=77");
          document.getElementById("resultDiv").innerHTML=JSON.stringify(r)
        }

        handleTest2(e) {
            M.IO.test({id:78}).then(r=>{
              document.getElementById("resultDiv").innerHTML=JSON.stringify(r)
            })
       
        }

        handleTest3(e) {
            MIO.test({id:79}).then(r=>{
              document.getElementById("resultDiv").innerHTML=JSON.stringify(r)
            })
        }


        render() {
            return (
                <div>
                    <input type="text" ref="id" id="id" placeholder="id" autoComplete="off"/>
                    <input type="text" ref="name" id="name" placeholder="name" autoComplete="off"/>
                    <input type="text" ref="age" id="age" placeholder="age" autoComplete="off"/>
                    <button onClick={this.handleAdd.bind(this)}>添加</button>
                    <button onClick={this.handleUpdate.bind(this)}>修改</button>
                    <button onClick={()=>this.handleTest1("test1")}>测试1</button>
                    <button onClick={()=>this.handleTest2("test2")}>测试2</button>
                    <button onClick={()=>this.handleTest3("test3")}>测试3</button>
                    <TodoItem content={this.state.list} delete={this.handledelete}/>
                </div>
            );
        }
    }
    ReactDOM.render(
        <div>
            <TodoList />
        </div>,
        document.getElementById('example')
    );
</script>



</body>
</html>
```


### ming_mock提供了基本的增,删,改,查,分页,条件查询接口可直接使用比如添加接口MIO.add({name:"zs"}),内部随机生成一个ID，可以把这些方法覆盖掉

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




# 说明

 app.get("/xxx",(req,res)=>{})或app.post("/xxx",(req,res)=>{})会在M.IO上注册xxx方法,
 用M.IO.xxx({})调用xxx方法,方法的参数必须是对象,app.get的回调函数中通过req.params拿到该对象,
 这完全是express风格的写法
 
 M.doSql是前后端传递数据的唯一方法,可通过M.host=http://localhost:8888修改后端地址

 https://github.com/minglie/minglie.github.io/blob/master/Snippets/manager/server.js


### 访问mysql,需要启动一个服务,用ming_node搭建,ming_node也是express风格,是单个文件且无依赖

```sh
$ npm install ming_node
$ npm install mysql
$ node index.js
   ```
 
index.js内容为
```javascript

var M=require("ming_node");
var mysql  = require('mysql');

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


# 在线sql测试 
https://mucfpga.github.io/codeEdit/index.html

#ming_mock的使用详情,请到ming_mock的主页查看

https://minglie.github.io/os/ming_mock/

