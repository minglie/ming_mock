/**
 * File : M_mock.js
 * By : Minglie
 * QQ: 934031452
 * Date :2020.09.6
 * version :1.9.3
 */
(function (window, undefined) {

    var M = {};

    M.init_server_enable = true;
    M.host = "";
    M.map_path = "map_path";
    M.database_path = "database_path";

    if (typeof module === "object" && typeof module.exports === "object") {
        try {
            $ = require("jquery");
        } catch (e) {
            delete $;
        }
    }
    if (typeof $ == "undefined") {
        window.$ = {};
        window.$.ajax = function (options) {
            options.beforeSend()
        }
    }

    var App = {
        reqMap: new Map(),
        resMap: new Map(),

        // 缓存ajax方法
        ajax: $.ajax,
        //key为去除rest参数的url,val为原始url
        _rest: {},
        _get: {},
        _post: {},
        _begin: function () {
        },
        _end: function () {
        },

        begin(callback) {
            App._begin = callback;
        },
        end(callback) {
            App._end = callback;
        },
        /**
         * 注册get方法
         */
        get(url, callback) {
            //非rest请求在M.IO上注册一个方法
            if (!url.includes(":")) {
                M.IO.reg(url.replace("/", ""), "get");
            }
            url = M.formatUrl(url);
            let realUrl = url;
            if (url.indexOf(":") > 0) {
                url = url.substr(0, url.indexOf(":"));
                App._rest[url] = realUrl;
            }
            App._get[url] = callback;
        },
        /**
         * 注册post方法
         */
        post(url, callback) {
            M.IO.reg(url.replace("/", ""), "post");
            url = M.formatUrl(url);
            App._post[url] = callback;
        },
        doget(pureUrl, options) {
            req = {};
            res = {};
            req.params = App.reqMap.get("get:" + pureUrl);
            req.method = "get";
            req.pureUrl = pureUrl;
            req.url = options.url;
            res.send = function (d) {
                this.resMap.set("get:" + pureUrl, d);
                data = App.resMap.get(options.type + ":" + pureUrl);
                App._end(data);
                options.success(data);
            }.bind(this);
            App._begin(req);
            App._get[pureUrl](req, res);
        },
        dopost(pureUrl, options) {
            req = {};
            res = {};
            req.params = App.reqMap.get("post:" + pureUrl);
            req.method = "post";
            req.pureUrl = pureUrl;
            req.url = options.url;
            res.send = function (d) {
                this.resMap.set("post:" + pureUrl, d);
                data = App.resMap.get(options.type + ":" + pureUrl);
                App._end(data);
                options.success(data);
            }.bind(this);
            App._begin(req, res);
            App._post[pureUrl](req, res);
        }
    };


    /**
     * ----------------------其他工具函数START--------------------------------------------
     */
    M.sleep = function (numberMillis) {
        var now = new Date();
        var exitTime = now.getTime() + numberMillis;
        while (true) {
            now = new Date();
            if (now.getTime() > exitTime)
                return;
        }
    };

    /**
     * ----------------------服务器端START--------------------------------------------
     */
    M.get = function (url, param) {
        let u;
        M.ajax({
            url: url,
            async: false,
            type: 'get',
            data: param,
            dataType: 'json',
            success: function (data) {
                u = data;
            }
        });
        return u;
    };


    M.post = function (url, param) {
        let u;
        M.ajax({
            url: url,
            async: false,
            type: 'post',
            data: param,
            dataType: 'json',
            success: function (data) {
                u = data;
            }
        });
        return u;
    };


    M.result = function (data, success) {
        var r = {};
        if (success == false) {
            r.code = 3003;
            r.message = "操作失败";
            r.success = success;
        } else {
            r.code = 3002;
            r.message = "操作成功";
            r.success = true;
        }
        try {
            var obj = JSON.parse(data);
            if (typeof obj == 'object' && obj) {
                r.data = obj;
            } else {
                r.data = data;
            }
        } catch (e) {
            r.data = data;
        }
        return r;
    };

    /**
     *获取下划线式的对象
     */
    M.getUnderlineObj = function (obj) {
        var result = {};
        for (let field in obj) {
            result[field.humpToUnderline()] = obj[field]
        }
        return result;
    };

    /**
     *获取驼峰式的对象
     */
    M.getHumpObj = function (obj) {
        var result = {};
        for (let field in obj) {
            result[field.underlineToHump()] = obj[field]
        }
        return result;
    };

    M.randomStr = function () {
        return (Math.random().toString(36) + new Date().getTime()).slice(2);
    };


    M.urlStringify = function (obj) {
        if (obj !== null && typeof obj === 'object') {
            var keys = Object.keys(obj);
            var len = keys.length;
            var flast = len - 1;
            var fields = '';
            for (var i = 0; i < len; ++i) {
                var k = keys[i];
                var v = obj[k];
                var ks = k + "=";
                fields += ks + v;
                if (i < flast)
                    fields += "&";
            }
            return fields;
        }
        return '';
    };

    M.urlParse = function (url) {
        url = url.substr(url.indexOf("?") + 1);
        var t, n, r, i = url, s = {};
        t = i.split("&"),
            r = null,
            n = null;
        for (var o in t) {
            var u = t[o].indexOf("=");
            u !== -1 && (r = t[o].substr(0, u),
                n = t[o].substr(u + 1),
                s[r] = n)
        }
        return s
    };

    /**
     * 去掉参数加让斜杠
     */
    M.formatUrl = function (url) {
        if (url.indexOf("?") > 0) {
            url = url.substr(0, url.indexOf("?"));
        } else {
            url = url;
        }
        if (!url.endsWith('/')) {
            url = url + '/';
        }
        if (!url.startsWith('/')) {
            url = '/' + url;
        }
        return url;
    };


    M.encodeURIComponentObj = function (data) {
        let ret = '';
        for (let it in data) {
            ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        return ret
    };

    M.fetchGet = function (url, callback, data) {
        var getData = "";
        if (data) {
            getData = M.urlStringify(data);
            if (url.indexOf("?") > 0) {
                getData = "&" + getData;
            } else {
                getData = "?" + getData;
            }
        }
        url = M.host + url + getData;
        fetch(url, {
            method: 'GET',
            mode: 'cors'
        }
        ).then((res) => {
            return res.json()
        }).then((res) => callback(res)).catch((error) => {
            console.error(error)
        });
    };

    M.fetchPost = function (url, callback, data) {
        fetch(M.host + url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: M.encodeURIComponentObj(data)
        }).then(function (response) {
            return response.json();
        }).then((resonseData) => {
            callback(resonseData);
        })
            .catch((error) => {
                console.error(error)
            });
    };


    M.fetchPostJson = function (url, callback, data) {
        fetch(M.host + url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(function (response) {
            return response.json();
        }).then((resonseData) => {
            callback(resonseData);
        })
            .catch((error) => {
                console.error(error)
            });
    };


    M.require=function(url){
        let promise=new Promise(function (reslove, reject) {
            fetch(url, {
                method: 'GET',
                mode: 'cors'
            }
            ).then((res) => {
                let  url1=M.formatUrl(url).split("/")
                url1=url1[url1.length-2];
             
                return res.text()
                
            }).then(
                d=>{
                    let r=""
                    try{
                        r=JSON.parse(d)
                    }catch(e){
                        try{
                            r=eval(d); 
                        }catch(e1){
                            r=d;
                        } 
                    }
                    reslove(r)
                }).catch((error) => {
                reject(error)
            });
        });
    return promise;
}



    M.doSql = function (sql, callback) {
        return new Promise(function (reslove, reject) {
            fetch(M.host + '/doSql', {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: M.encodeURIComponentObj({ sql })
            }).then(function (response) {
                return response.json();
            }).then((resonseData) => {
                if (callback) {
                    callback(resonseData);
                }
                reslove(resonseData)
            }).catch((error) => {
                console.error(error)
                reject(error)
            });
        });
    };


    M.axiosDoSql = function (sql, callback) {
        axios({
            url: M.host + '/doSql',
            method: 'post',
            data: {
                sql
            },
            transformRequest: [function (data) {
                let ret = '';
                for (let it in data) {
                    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                }
                return ret
            }],
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (response) {
            callback(response.data);
        })
            .catch(function (error) {
                console.err(error);
            });
    };


    M.getObjByFile = function (file) {
        data = localStorage.getItem(file) || "[]";
        var obj;
        if (data) obj = JSON.parse(data.toString());
        return obj;
    };
    M.writeObjToFile = function (file, obj) {
        localStorage.setItem(file, JSON.stringify(obj))
    };

    M.addObjToFile = function (file, obj) {
        try {
            var d = M.getObjByFile(file);
            M.writeObjToFile(file, [...d, obj]);
        } catch (e) {
            M.writeObjToFile(file, [obj]);
        }
    };
    M.deleteObjByIdFile = function (file, id) {
        let ids = [];
        if (!Array.isArray(id)) {
            ids.push(id)
        } else {
            ids = id;
        }
        var d = M.getObjByFile(file);
        var d1 = M.getObjByFile(file);
        let d_num = 0;
        for (let i = 0; i < d1.length; i++) {
            if (ids.indexOf(d1[i].id) >= 0) {
                d.splice(i - d_num, 1);
                d_num++;
                if (ids.length == 1) break;
            }
        }
        M.writeObjToFile(file, d);
    };

    M.deleteObjByPropFile = function (file, o) {
        let o_key = Object.keys(o)[0];
        let o_val = o[o_key];
        var d = M.getObjByFile(file);
        var d1 = M.getObjByFile(file);
        let d_num = 0;
        for (let i = 0; i < d1.length; i++) {
            if (d1[i][o_key] == o_val) {
                d.splice(i - d_num, 1);
                d_num++;
            }
        }
        M.writeObjToFile(file, d);
    };

    M.updateObjByIdFile = function (file, obj) {
        var d = M.getObjByFile(file);
        for (var i = 0; i < d.length; i++) {
            if (d[i].id == obj.id) {
                d.splice(i, 1, obj);
                break;
            }
        }
        M.writeObjToFile(file, d);
    };

    M.getObjByIdFile = function (file, id) {
        var d = M.getObjByFile(file);
        for (let i = 0; i < d.length; i++) {
            if (d[i].id == id) {
                return d[i];
            }
        }
    };

    M.listAllObjByPropFile = function (file, o) {
        let r_list = [];
        let o_key = Object.keys(o)[0];
        let o_val = o[o_key];
        var d = M.getObjByFile(file);
        for (let i = 0; i < d.length; i++) {
            if (d[i][o_key] == o_val) {
                r_list.push(d[i]);
            }
        }
        return r_list;
    };


    /**
     * 文件型数据库第二层封装
     */
    M.add = function (obj) {
        obj.id = M.randomStr();
        M.addObjToFile(M.database_path, obj);
        return obj;
    };
    M.update = function (obj) {
        M.updateObjByIdFile(M.database_path, obj);
    };
    M.deleteById = function (id) {
        M.deleteObjByIdFile(M.database_path, id);
    };
    /**
     * 清空所有
     */
    M.deleteAll = function (o) {
        if (o) {
            M.deleteObjByPropFile(M.database_path, o);
        } else {
            M.writeObjToFile(M.database_path, []);
        }
    };
    /**
     * 根据属性删
     * @param o
     */
    M.deleteByProp = function (o) {
        M.deleteObjByPropFile(M.database_path, o);
    };
    /**
     * 根据id删
     * @param id
     */
    M.getById = function (id) {
        return M.getObjByIdFile(M.database_path, id);
    };
    /**
     * 查寻所有
     */
    M.listAll = function (o) {
        if (o) {
            return M.listAllObjByPropFile(M.database_path, o);
        } else {
            return M.getObjByFile(M.database_path);
        }
    };
    /**
     * 根据属性查询
     * @param o
     */
    M.listByProp = function (o) {
        return M.listAllObjByPropFile(M.database_path, o);
    };
    /**
     *分页查询
     */
    M.listByPage = function (startPage, limit, caseObj) {
        if (startPage <= 0) startPage = 1;
        let rows;
        if (caseObj) {
            rows = M.listByProp(caseObj);
        } else {
            rows = M.listAll();
        }
        let total = rows.length;
        rows = rows.splice((startPage - 1) * limit, limit);
        return { rows, total }
    };


    /**
     * 全局作用域
     * @param k
     * @param v
     */
    M.setAttribute = function (k, v) {
        let a = {};
        a[k] = v;
        a = JSON.stringify(a);
        a = JSON.parse(a);
        let preObj;
        try {
            preObj = M.getObjByFile(M.map_path) || {};
            if (Array.isArray(preObj)) preObj = {};
        } catch (e) {
            preObj = {};
        }

        M.writeObjToFile(M.map_path, Object.assign(preObj, a));
    };

    M.getAttribute = function (k) {
        return M.getObjByFile(M.map_path)[k];
    };




    M.fileDownload = function (content, filename) {
        var eleLink = document.createElement('a');
        eleLink.download = filename;
        eleLink.style.display = 'none';
        var blob = new Blob([content]);
        eleLink.href = URL.createObjectURL(blob);
        document.body.appendChild(eleLink);
        eleLink.click();
        document.body.removeChild(eleLink);
    };


    //获取地址栏数据
    M.getParameter = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.href.substr(window.location.href.indexOf('?')).substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    };
    //说话函数
    M.speak = function (speakStr) {
        var myAudio = document.createElement("AUDIO");
        myAudio.src = "http://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=9&text=" + speakStr;
        myAudio.type = "audio/mpeg";
        myAudio.play();
    };
    /**
     *改写ajax方法
     */
    M.ajax = function (options) {
        d = M.urlParse(options.url);
        options.data = Object.assign(d, options.data);
        if (options.type == "get") {
            if (!Object.keys(App._rest).length == 0) {
                let pathname = M.formatUrl(options.url);
                let realPathName = pathname;
                let mapingPath = "";
                for (let i = 0; i < Object.keys(App._rest).length; i++) {
                    if (M.formatUrl(options.url).startsWith(Object.keys(App._rest)[i])) {
                        for (let i = 0; i < Object.keys(App._rest).length; i++) {
                            if (pathname.startsWith(Object.keys(App._rest)[i])) {
                                pathname = Object.keys(App._rest)[i];
                                mapingPath = App._rest[pathname];
                            }
                        }
                        if (!realPathName.endsWith('/')) {
                            realPathName = realPathName + '/';
                        }
                        let s1 = realPathName;
                        let s2 = mapingPath;
                        s1 = s1.substring(s2.indexOf(":") - 1, s1.length - 1).split("/").slice(1)
                        s2 = s2.substring(s2.indexOf(":") - 1, s2.length - 1).split("/:").slice(1)
                        let params = {};
                        for (let i = 0; i < s2.length; i++) { params[s2[i]] = s1[i]; }
                        options.data = Object.assign(params, options.data);
                        options.restUrl = pathname;
                    }
                }
            }
        }
        App.ajax({
            url: options.url,
            beforeSend(XHR) {
                let pureUrl = options.restUrl || M.formatUrl(options.url);
                App.reqMap.set(options.type + ":" + pureUrl, options.data);
                if (options.type == "get") {
                    App.doget(pureUrl, options);
                } else {
                    App.dopost(pureUrl, options);
                }
                return false;
            },
            success(data) {
                options.success(data)
            }
        })
    };


    //服务方法注册
    M.IO = {};
    M.IO.reg = function (methed, type) {
        M.IO[methed] = (param) => {
            return new Promise(
                function (reslove) {
                    M.ajax({
                        url: "/" + methed,
                        data: param,
                        type: type,
                        success: function (data) {
                            reslove(data)
                        }
                    });
                }
            )
        }
    };


    M.EventSource = function (url, callback) {
        if (window.EventSource) {
            // 创建 EventSource 对象连接服务器
            const source = new EventSource(url);
            // 连接成功后会触发 open 事件
            source.addEventListener('open', () => {
                console.log('Connected');
            }, false);
            // 服务器发送信息到客户端时，如果没有 event 字段，默认会触发 message 事件
            source.addEventListener('message', e => {
                console.log(`data: ${e.data}`);
            }, false);
            // 自定义 EventHandler，在收到 event 字段为 slide 的消息时触发
            source.addEventListener('slide', e => {
                callback(e);
            }, false);
            // 连接异常时会触发 error 事件并自动重连
            source.addEventListener('error', e => {
                if (e.target.readyState === EventSource.CLOSED) {
                    console.log('Disconnected');
                } else if (e.target.readyState === EventSource.CONNECTING) {
                    console.log('ConnectinApp...');
                }
            }, false);
            return source;
        } else {
            console.error('Your browser doesn\'t support SSE');
        }

    };


    M.Db = function (dbname) {
        var Db = {};
        Db.display_sql_enable = false;

        Db = openDatabase(dbname, '1.0', '', 2 * 1024 * 1024);

        Db.getInsertObjSql = function (tableName, obj) {
            var fields = "(";
            var values = "(";
            for (let field in obj) {
                fields += field + ",";
                values += `'${obj[field]}'` + ",";
            }
            fields = fields.substr(0, fields.lastIndexOf(","));
            values = values.substr(0, values.lastIndexOf(","));
            fields += ")";
            values += ")";
            let sql = "insert into " + tableName + fields + " values " + values;
            return sql;
        };

        Db.getDeleteObjSql = function (tableName, obj) {
            var fields = [];
            for (let field in obj) {
                fields.push(field);
            }
            let sql = `delete from ${tableName} where ${fields.map(u => u + "='" + obj[u] + "'")}`;
            sql = sql.replace(/,/g, " and ");
            return sql;
        };

        Db.getUpdateObjSql = function (tableName, obj, caseObj) {
            var fields = [];
            for (let field in obj) {
                if (field != "id")
                    fields.push(field);
            }
            let sql = "";
            if (!caseObj) {
                sql = `update ${tableName} set ${fields.map(u => u + "='" + obj[u] + "'")} where id=${obj.id}`;
            } else {
                var caseObjfields = [];
                for (let caseObjfield in caseObj) {
                    caseObjfields.push(caseObjfield)
                }
                sql = `update ${tableName} set ${fields.map(u => u + "='" + obj[u] + "'")} where ${caseObjfields.map(u => u + "='" + caseObj[u] + "'").join(" and ")}`;
            }

            return sql;
        };


        Db.getSelectObjSql = function (tableName, obj) {
            var fields = [];
            for (let field in obj) {
                fields.push(field);
            }
            let sql = `select * from ${tableName} where ${fields.map(u => u + "='" + obj[u] + "'")}`;
            sql = sql.replace(/,/g, " and ");
            return sql;
        };


        Db.doSql = function (sql) {
            var promise = new Promise(function (reslove, reject) {
                Db.transaction(function (context) {
                    context.executeSql(sql, [], function (context, results) {
                        reslove(Array.from(results.rows));
                    });
                }, function (error) {
                    reject(error);
                    console.error(error.message);
                }, function (a) {
                    //console.log(a)
                });

            });
            return promise;
        };
        return Db;
    };


    M.init = function () {
        /***
         * 下划线命名转为驼峰命名
         */
        String.prototype.underlineToHump = function () {
            var re = /_(\w)/g;
            str = this.replace(re, function ($0, $1) {
                return $1.toUpperCase();
            });
            return str;
        };

        /***
         * 驼峰命名转下划线
         */
        String.prototype.humpToUnderline = function () {
            var re = /_(\w)/g;
            str = this.replace(/([A-Z])/g, "_$1").toLowerCase();
            return str;
        };

        //首字母变大写
        String.prototype.firstChartoUpper = function () {
            return this.replace(/^([a-z])/g, function (word) {
                return word.replace(word.charAt(0), word.charAt(0).toUpperCase());
            });
        };
        //首字母变小写
        String.prototype.firstChartoLower = function () {
            return this.replace(/^([A-Z])/g, function (word) {
                return word.replace(word.charAt(0), word.charAt(0).toLowerCase());
            });
        };
        //格式化日期
        Date.prototype.format = function (fmt) {
            var o = {
                "M+": this.getMonth() + 1,                 //月份
                "d+": this.getDate(),                    //日
                "h+": this.getHours(),                   //小时
                "m+": this.getMinutes(),                 //分
                "s+": this.getSeconds(),                 //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds()             //毫秒
            };
            if (/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                }
            }
            return fmt;
        }
    };
    M.initServer = function () {
        app.post("/add", (req, res) => {
            r = M.add(req.params);
            res.send(M.result(r));
        });

        app.get("/delete", (req, res) => {
            M.deleteById(req.params.id);
            res.send(M.result("ok"));
        });

        app.post("/update", (req, res) => {
            M.update(req.params);
            res.send(M.result("ok"));
        });

        app.get("/getById", (req, res) => {
            r = M.getById(req.params.id);
            res.send(M.result(r));
        });

        app.get("/listAll", (req, res) => {
            r = M.listAll();
            res.send(M.result(r));
        });

        app.get("/listByParentId", (req, res) => {
            r = M.listByProp({ parentId: req.params.parentId });
            res.send(M.result(r));
        });

        app.get("/listByPage", (req, res) => {
            r = M.listByPage(req.params.startPage, req.params.limit);
            res.send(M.result(r));
        })
    };

    M.urlToPath=function(url){
        return  url.replace(/^http(s?):\/\/[^/]+/, "");
    }

    M.beforeSend=function(options){

        return true;
    }
    M.endResponse=function(data,xhr){

        return data;
    }


    M.ajaxInterceptor=function(){
        var Util = {}
        Util.extend = function extend() {
            var target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                options, name, src, copy, clone

            if (length === 1) {
                target = this
                i = 0
            }

            for (; i < length; i++) {
                options = arguments[i]
                if (!options) continue

                for (name in options) {
                    src = target[name]
                    copy = options[name]

                    if (target === copy) continue
                    if (copy === undefined) continue

                    if (Util.isArray(copy) || Util.isObject(copy)) {
                        if (Util.isArray(copy)) clone = src && Util.isArray(src) ? src : []
                        if (Util.isObject(copy)) clone = src && Util.isObject(src) ? src : {}

                        target[name] = Util.extend(clone, copy)
                    } else {
                        target[name] = copy
                    }
                }
            }

            return target
        }

        Util.each = function each(obj, iterator, context) {
            var i, key
            if (this.type(obj) === 'number') {
                for (i = 0; i < obj; i++) {
                    iterator(i, i)
                }
            } else if (obj.length === +obj.length) {
                for (i = 0; i < obj.length; i++) {
                    if (iterator.call(context, obj[i], i, obj) === false) break
                }
            } else {
                for (key in obj) {
                    if (iterator.call(context, obj[key], key, obj) === false) break
                }
            }
        }

        Util.type = function type(obj) {
            return (obj === null || obj === undefined) ? String(obj) : Object.prototype.toString.call(obj).match(/\[object (\w+)\]/)[1].toLowerCase()
        }

        Util.each('String Object Array RegExp Function'.split(' '), function(value) {
            Util['is' + value] = function(obj) {
                return Util.type(obj) === value.toLowerCase()
            }
        })

        Util.isObjectOrArray = function(value) {
            return Util.isObject(value) || Util.isArray(value)
        }

        Util.isNumeric = function(value) {
            return !isNaN(parseFloat(value)) && isFinite(value)
        }

        Util.keys = function(obj) {
            var keys = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) keys.push(key)
            }
            return keys;
        }
        Util.values = function(obj) {
            var values = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) values.push(obj[key])
            }
            return values;
        }
        Util.heredoc = function heredoc(fn) {
            return fn.toString()
                .replace(/^[^\/]+\/\*!?/, '')
                .replace(/\*\/[^\/]+$/, '')
                .replace(/^[\s\xA0]+/, '').replace(/[\s\xA0]+$/, '') // .trim()
        }

        Util.noop = function() {}

        window._XMLHttpRequest = window.XMLHttpRequest
        window._ActiveXObject = window.ActiveXObject
        try {
            new window.Event('custom')
        } catch (exception) {
            window.Event = function(type, bubbles, cancelable, detail) {
                var event = document.createEvent('CustomEvent') // MUST be 'CustomEvent'
                event.initCustomEvent(type, bubbles, cancelable, detail)
                return event
            }
        }

        var XHR_STATES = {
            // The object has been constructed.
            UNSENT: 0,
            // The open() method has been successfully invoked.
            OPENED: 1,
            // All redirects (if any) have been followed and all HTTP headers of the response have been received.
            HEADERS_RECEIVED: 2,
            // The response's body is being received.
            LOADING: 3,
            // The data transfer has been completed or something went wrong during the transfer (e.g. infinite redirects).
            DONE: 4
        }

        var XHR_EVENTS = 'readystatechange loadstart progress abort error load timeout loadend'.split(' ')
        var XHR_REQUEST_PROPERTIES = 'timeout withCredentials'.split(' ')
        var XHR_RESPONSE_PROPERTIES = 'readyState responseURL status statusText responseType response responseText responseXML'.split(' ')

        // https://github.com/trek/FakeXMLHttpRequest/blob/master/fake_xml_http_request.js#L32
        var HTTP_STATUS_CODES = {
            100: "Continue",
            101: "Switching Protocols",
            200: "OK",
            201: "Created",
            202: "Accepted",
            203: "Non-Authoritative Information",
            204: "No Content",
            205: "Reset Content",
            206: "Partial Content",
            300: "Multiple Choice",
            301: "Moved Permanently",
            302: "Found",
            303: "See Other",
            304: "Not Modified",
            305: "Use Proxy",
            307: "Temporary Redirect",
            400: "Bad Request",
            401: "Unauthorized",
            402: "Payment Required",
            403: "Forbidden",
            404: "Not Found",
            405: "Method Not Allowed",
            406: "Not Acceptable",
            407: "Proxy Authentication Required",
            408: "Request Timeout",
            409: "Conflict",
            410: "Gone",
            411: "Length Required",
            412: "Precondition Failed",
            413: "Request Entity Too Large",
            414: "Request-URI Too Long",
            415: "Unsupported Media Type",
            416: "Requested Range Not Satisfiable",
            417: "Expectation Failed",
            422: "Unprocessable Entity",
            500: "Internal Server Error",
            501: "Not Implemented",
            502: "Bad Gateway",
            503: "Service Unavailable",
            504: "Gateway Timeout",
            505: "HTTP Version Not Supported"
        }
        function MockXMLHttpRequest() {
            // 初始化 custom 对象，用于存储自定义属性
            this.custom = {
                events: {},
                requestHeaders: {},
                responseHeaders: {}
            }
        }

        MockXMLHttpRequest._settings = {
            timeout: '10-100',
            /*
                timeout: 50,
                timeout: '10-100',
                */
        }

        MockXMLHttpRequest.setup = function(settings) {
            Util.extend(MockXMLHttpRequest._settings, settings)
            return MockXMLHttpRequest._settings
        }
        Util.extend(MockXMLHttpRequest, XHR_STATES)
        Util.extend(MockXMLHttpRequest.prototype, XHR_STATES)
        // 标记当前对象为 MockXMLHttpRequest
        MockXMLHttpRequest.prototype.mock = true
        // 是否拦截 Ajax 请求
        MockXMLHttpRequest.prototype.match = true
        // 初始化 Request 相关的属性和方法
        Util.extend(MockXMLHttpRequest.prototype, {
            open: function(method, url, async, username, password) {
                var that = this
                Util.extend(this.custom, {
                    method: method,
                    url: url,
                    async: typeof async === 'boolean' ? async : true,
                    username: username,
                    password: password,
                    options: {
                        url: url,
                        type: method
                    }
                })
                this.custom.timeout = function(timeout) {
                    if (typeof timeout === 'number') return timeout
                    if (typeof timeout === 'string' && !~timeout.indexOf('-')) return parseInt(timeout, 10)
                    if (typeof timeout === 'string' && ~timeout.indexOf('-')) {
                        var tmp = timeout.split('-')
                        var min = parseInt(tmp[0], 10)
                        var max = parseInt(tmp[1], 10)
                        return Math.round(Math.random() * (max - min)) + min
                    }
                }(MockXMLHttpRequest._settings.timeout)

                // 查找与请求参数匹配的数据模板
                var item = find(this.custom.options)
                function handle(event) {
                    // 同步属性 NativeXMLHttpRequest => MockXMLHttpRequest
                    for (var i = 0; i < XHR_RESPONSE_PROPERTIES.length; i++) {
                        try {
                            that[XHR_RESPONSE_PROPERTIES[i]] = xhr[XHR_RESPONSE_PROPERTIES[i]]
                        } catch (e) {}
                    }
                    // 触发 MockXMLHttpRequest 上的同名事件
                    that.dispatchEvent(new Event(event.type /*, false, false, that*/ ))
                }

                // 如果未找到匹配的数据模板 或者未启用ajax拦截，则采用原生 XHR 发送请求。
                if (!item || M.ajaxInterceptorStatus==false) {
                    this.match = false;
                    // 创建原生 XHR 对象，调用原生 open()，监听所有原生事件
                    var xhr = createNativeXMLHttpRequest()
                    this.custom.xhr = xhr

                    // 初始化所有事件，用于监听原生 XHR 对象的事件
                    for (var i = 0; i < XHR_EVENTS.length; i++) {
                        xhr.addEventListener(XHR_EVENTS[i], handle)
                    }

                    // xhr.open()
                    if (username) xhr.open(method, url, async, username, password)
                    else xhr.open(method, url, async)

                    // 同步属性 MockXMLHttpRequest => NativeXMLHttpRequest
                    for (var j = 0; j < XHR_REQUEST_PROPERTIES.length; j++) {
                        try {
                            xhr[XHR_REQUEST_PROPERTIES[j]] = that[XHR_REQUEST_PROPERTIES[j]]
                        } catch (e) {}
                    }

                    return
                }

                // 找到了匹配的数据模板，开始拦截 XHR 请求
                this.match = true
                this.custom.template = item
                this.readyState = MockXMLHttpRequest.OPENED
                this.dispatchEvent(new Event('readystatechange' /*, false, false, this*/ ))
            },
            // https://xhr.spec.whatwg.org/#the-setrequestheader()-method
            // Combines a header in author request headers.
            setRequestHeader: function(name, value) {
                // 原生 XHR
                if (!this.match) {
                    this.custom.xhr.setRequestHeader(name, value)
                    return
                }

                // 拦截 XHR
                var requestHeaders = this.custom.requestHeaders
                if (requestHeaders[name]) requestHeaders[name] += ',' + value
                else requestHeaders[name] = value
            },
            timeout: 0,
            withCredentials: false,
            upload: {},
            // https://xhr.spec.whatwg.org/#the-send()-method
            // Initiates the request.
            send: function send(data) {
                var that = this
                this.custom.options.body = data
                if(M.beforeSend(this.custom.options)==false){
                    return;
                }
                // 原生 XHR
                if (!this.match) {
                    this.custom.xhr.send(data)
                    let xhr= this.custom.xhr;
              
                    this.custom.xhr.onreadystatechange=function(){   
                        if(xhr.status === 200){
                            if(xhr.readyState === 4){
                                xhr.response= M.endResponse(xhr.response,xhr)
                            }
                        } 
                    }
                    return
                }
                // 拦截 XHR
                // X-Requested-With header
                this.setRequestHeader('X-Requested-With', 'MockXMLHttpRequest')

                // loadstart The fetch initiates.
                this.dispatchEvent(new Event('loadstart' /*, false, false, this*/ ))

                if (this.custom.async) setTimeout(done, this.custom.timeout) // 异步
                else done() // 同步

                function done() {
                    that.readyState = MockXMLHttpRequest.HEADERS_RECEIVED
                    that.dispatchEvent(new Event('readystatechange' /*, false, false, that*/ ))
                    that.readyState = MockXMLHttpRequest.LOADING
                    that.dispatchEvent(new Event('readystatechange' /*, false, false, that*/ ))
                    that.status = 200
                    that.statusText = HTTP_STATUS_CODES[200]
                    // fix #92 #93 by @qddegtya
                    convert(that.custom.template, that.custom.options).then(d=>{
                        d= M.endResponse(d,that.custom)
                        that.response = that.responseText = JSON.stringify(d);
                        that.readyState = MockXMLHttpRequest.DONE
                        that.dispatchEvent(new Event('readystatechange' /*, false, false, that*/ ))
                        that.dispatchEvent(new Event('load' /*, false, false, that*/ ));
                        that.dispatchEvent(new Event('loadend' /*, false, false, that*/ ));
                    })
                }
            },
            // https://xhr.spec.whatwg.org/#the-abort()-method
            // Cancels any network activity.
            abort: function abort() {
                // 原生 XHR
                if (!this.match) {
                    this.custom.xhr.abort()
                    return
                }

                // 拦截 XHR
                this.readyState = MockXMLHttpRequest.UNSENT
                this.dispatchEvent(new Event('abort', false, false, this))
                this.dispatchEvent(new Event('error', false, false, this))
            }
        })

        // 初始化 Response 相关的属性和方法
        Util.extend(MockXMLHttpRequest.prototype, {
            responseURL: '',
            status: MockXMLHttpRequest.UNSENT,
            statusText: '',
            // https://xhr.spec.whatwg.org/#the-getresponseheader()-method
            getResponseHeader: function(name) {
                // 原生 XHR
                if (!this.match) {
                    return this.custom.xhr.getResponseHeader(name)
                }
                // 拦截 XHR
                return this.custom.responseHeaders[name.toLowerCase()]
            },
            // https://xhr.spec.whatwg.org/#the-getallresponseheaders()-method
            // http://www.utf8-chartable.de/
            getAllResponseHeaders: function() {
                // 原生 XHR
                if (!this.match) {
                    return this.custom.xhr.getAllResponseHeaders()
                }

                // 拦截 XHR
                var responseHeaders = this.custom.responseHeaders
                var headers = ''
                for (var h in responseHeaders) {
                    if (!responseHeaders.hasOwnProperty(h)) continue
                    headers += h + ': ' + responseHeaders[h] + '\r\n'
                }
                return headers
            },
            overrideMimeType: function( /*mime*/ ) {},
            responseType: '', // '', 'text', 'arraybuffer', 'blob', 'document', 'json'
            response: null,
            responseText: '',
            responseXML: null
        })

        // EventTarget
        Util.extend(MockXMLHttpRequest.prototype, {
            addEventListener: function addEventListener(type, handle) {
                var events = this.custom.events
                if (!events[type]) events[type] = []
                events[type].push(handle)
            },
            removeEventListener: function removeEventListener(type, handle) {
                var handles = this.custom.events[type] || []
                for (var i = 0; i < handles.length; i++) {
                    if (handles[i] === handle) {
                        handles.splice(i--, 1)
                    }
                }
            },
            dispatchEvent: function dispatchEvent(event) {
                var handles = this.custom.events[event.type] || []
                for (var i = 0; i < handles.length; i++) {
                    handles[i].call(this, event)
                }

                var ontype = 'on' + event.type
                if (this[ontype]) this[ontype](event)
            }
        })

        // Inspired by jQuery
        function createNativeXMLHttpRequest() {
            var isLocal = function() {
                var rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/
                var rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/
                var ajaxLocation = location.href
                var ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || []
                return rlocalProtocol.test(ajaxLocParts[1])
            }()

            return window.ActiveXObject ?
                (!isLocal && createStandardXHR() || createActiveXHR()) : createStandardXHR()

            function createStandardXHR() {
                try {
                    return new window._XMLHttpRequest();
                } catch (e) {}
            }

            function createActiveXHR() {
                try {
                    return new window._ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) {}
            }
        }
        // 查找与请求参数匹配的数据模板：URL，Type
        function find(options) {
            let path=M.urlToPath(options.url)
            let formatUrl=M.formatUrl(path)
            options.path=path;
            options.formatUrl=formatUrl;
            if(options.type=="POST"){
                if(Object.keys(app._post).indexOf(formatUrl)>-1){
                    return  true
                }
            }else{
                if(Object.keys(app._get).indexOf(formatUrl)>-1){
                    return  true
                }
            }
            return false;
        }
        M.findResPonseTemplate=find;
        // 数据模板 ＝> 响应数据
        function convert(item, options) {
            let data={}
            try{
                data=JSON.parse(options.body)
            }catch(e){
                data=  M.urlParse(options.body)
            }
            options.data=data;
            if(options.type!="GET" && options.type!="POST"){
                options.type="GET";
            }
            return new Promise(
                function (reslove) {
                    M.ajax({
                        url: options.path,
                        data: data,
                        type: options.type.toLocaleLowerCase(),
                        success: function (data) {
                            reslove(data)
                        }
                    });
                }
            )
        }

        M.convertResPonseTemplate=convert;
        window.XMLHttpRequest = MockXMLHttpRequest
    }


    M.originalFetch=window.fetch.bind(window);
   

    M.myFetch=async function(...args) {
        if(M.beforeSend(args)==false){
            return;
        }
        return M.originalFetch(...args).then(async (response) => {
            let txt = undefined;
            let [reqPath,reqConfig]=args;
            reqConfig.url=response.url
            reqConfig.type=reqConfig.method;
            let matched = M.findResPonseTemplate(reqConfig);
            if (matched) {
                txt=await  M.convertResPonseTemplate(null,reqConfig);
            }
          txt= M.endResponse(txt,response)
          if (txt !== undefined) {
            const stream = new ReadableStream({
              start(controller) {
                const bufView = new Uint8Array(new ArrayBuffer(txt.length));
                for (var i = 0; i < txt.length; i++) {
                  bufView[i] = txt.charCodeAt(i);
                }
                controller.enqueue(bufView);
                controller.close();
              }
            });
            const newResponse = new Response(stream, {
              headers: response.headers,
              status: response.status,
              statusText: response.statusText,
            });
            const proxy = new Proxy(newResponse, {
              get: function(target, name){
                switch(name) {
                  case 'ok':
                  case 'redirected':
                  case 'type':
                  case 'url':
                  case 'useFinalURL':
                  case 'body':
                  case 'bodyUsed':
                    return response[name];
                }
                return target[name];
              }
            });
            for (let key in proxy) {
              if (typeof proxy[key] === 'function') {
                proxy[key] = proxy[key].bind(newResponse);
              }
            }
            return proxy;
          } else {
            return response;
          }
        });
   }




    M.ajaxInterceptorEnable=function(){
        M.ajaxInterceptorStatus=true;
        M.ajaxInterceptor();
    }

    M.ajaxInterceptorDisable=function(){
        M.ajaxInterceptorStatus=false;
    }

    M.fetchInterceptorEnable=function(){
        M.ajaxInterceptorEnable();
        window.fetch =M.myFetch;
    }

    M.fetchInterceptorDisable=function(){
        window.fetch = M.originalFetch;
    }


    M.jqueryAjaxInterceptorEnable=function(){
        $.ajax = M.ajax;
    }


    M.init();
    window.app = App;
    window.M = M;
    window.MIO = M.IO;
    //$.ajax = M.ajax;
    if (M.init_server_enable) M.initServer();


    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = { app: App, M, MIO: M.IO }
    }


})(window);