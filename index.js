/**
 * File : M_mock.js
 * By : Minglie
 * QQ: 934031452
 * Date :2021.12.01
 * version :2.2.0
 */
(function (window, undefined) {

    const M = {};
    M.cache_req_data_enable=false;
    //全局状态
    M._global_state = {}
    //订阅全局状态的组件
    M._global_state_subscribe_component = {}
    //全局组件
    M.Component={}
    M.init_server_enable = true;
    M.host = "";
    M.map_path = "map_path";
    M.database_path = "database_path";
    //全局缓存map
    M._globle_cacheMap = {}
    //全局对象缓存
    M._globle_lib_cacheMap={}
    //全局插件地址缓存
    M._globle_plugin_url_cacheMap={};
    //全局插件
    M._globle_plugin=new Set();

    M.import=async function (url,callback){
        if(M._globle_lib_cacheMap[url]){
            return M._globle_lib_cacheMap[url];
        }
        if(!callback){
            let r=await  M.require(url)
            r= eval(r)
            M._globle_lib_cacheMap[url]=r;
            return r
        }else {
            let r= callback()
            M._globle_lib_cacheMap[url]=r;
            return r
        }

    }

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
            options.beforeSend();
        }
    }

    const App = {
        reqMap: new Map(),
        resMap: new Map(),

        // 缓存ajax方法
        ajax: $.ajax,
        //key为去除rest参数的url,val为原始url
        _rest: {},
        _get: {},
        _use: {},
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
        use(url,callback){
            if(typeof url === 'function' || typeof url === 'object'  ){
                let plugin=url;
                let args=callback;
                if(plugin.installed){
                    return App;
                }
                if (typeof plugin === 'function') {
                    plugin(App, args);
                } else {
                    plugin.install(App, args);
                }
                plugin.installed = true;
                M._globle_plugin.add(plugin);
            }else {
                if (Array.isArray(url)) {
                    url.forEach(u=>{
                        let regExp=new RegExp(u)
                        App._use[u] = {url,regExp,callback};
                    })
                } else {
                    let regExp=new RegExp(url)
                    App._use[url] = {url,regExp,callback};
                }
            }
            return App;
        },
        async installPlugin(pluginUrl,constructorParams,pluginParams){
            if(M._globle_plugin_url_cacheMap[pluginUrl]){
                return
            }
            M._globle_plugin_url_cacheMap[pluginUrl]=pluginUrl;
            import(pluginUrl).then(async modul=>{
                const Plugin= modul.default;
                const plugin= new Plugin(constructorParams);
                App.use(plugin,pluginParams)
            })
            return App;
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
            //非rest请求在M.IO上注册一个方法
            if (!url.includes(":")) {
                M.IO.reg(url.replace("/", ""), "post");
            }
            url = M.formatUrl(url);
            let realUrl = url;
            if (url.indexOf(":") > 0) {
                url = url.substr(0, url.indexOf(":"));
                App._rest[url] = realUrl;
            }
            App._post[url] = callback;
        },
        async doUse(req, res) {
            for (let key in App._use){
                if(App._use[key].regExp.test(req.url)){
                    await  App._use[key].callback(req,res);
                    return;
                }
            }
        },
        async doGet(pureUrl, options) {
            let req = {};
            let res = {};
            res.alreadySend = false;
            req.params =options.params;
            req.method = "get";
            req.pureUrl = pureUrl;
            req.url = options.url;
            res.send = function (d) {
                res.alreadySend = true;
                if(M.cache_req_data_enable){
                    this.resMap.set("get:" + pureUrl, d);
                }
                let data = d;
                App._end(req, data);
                options.success(data);
            }.bind(this);
            await App._begin(req, res);
            if (!res.alreadySend) await App.doUse(req, res);
            if (!res.alreadySend) await App._get[pureUrl](req, res);
        },
        async doPost(pureUrl, options) {
            let req = {};
            let res = {};
            res.alreadySend = false;
            req.params =options.params;
            req.method = "post";
            req.pureUrl = pureUrl;
            req.url = options.url;
            res.send = function (d) {
                res.alreadySend = true;
                if(M.cache_req_data_enable){
                    this.resMap.set("post:" + pureUrl, d);
                }
                let data = d;
                App._end(req,data);
                options.success(data);
            }.bind(this);
            await App._begin(req, res);
            if (!res.alreadySend) await App.doUse(req, res);
            if (!res.alreadySend) await App._post[pureUrl](req, res);
        }
    };


    /**
     * ----------------------其他工具函数START--------------------------------------------
     */
    M.sleep = function (numberMillis) {
        let now = new Date();
        let exitTime = now.getTime() + numberMillis;
        while (true) {
            now = new Date();
            if (now.getTime() > exitTime) {
                return;
            }
        }
    };

    /**
     * ----------------------服务器端START--------------------------------------------
     */
    M.get = function (url, param) {
        return new Promise(
            function (reslove) {
                M.ajax({
                    url: url,
                    data: param,
                    type: "get",
                    success: function (data) {
                        reslove(data);
                    }
                });
            }
        )
    };


    M.post = function (url, param) {
        return new Promise(
            function (reslove) {
                M.ajax({
                    url: url,
                    data: param,
                    type: "post",
                    success: function (data) {
                        reslove(data);
                    }
                });
            }
        )
    };


    M.result = function (data, success) {
        let r = {};
        if (success == false) {
            r.code = -2;
            r.msg = "操作失败";
        } else {
            r.code = 200;
            r.msg = "success";
        }
        try {
            let obj = JSON.parse(data);
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
        let result = {};
        for (let field in obj) {
            result[field.humpToUnderline()] = obj[field];
        }
        return result;
    };

    /**
     *获取驼峰式的对象
     */
    M.getHumpObj = function (obj) {
        let result = {};
        for (let field in obj) {
            result[field.underlineToHump()] = obj[field];
        }
        return result;
    };

    M.randomStr = function () {
        return (Math.random().toString(36) + new Date().getTime()).slice(2);
    };


    M.urlStringify = function (obj) {
        if (obj !== null && typeof obj === 'object') {
            let keys = Object.keys(obj);
            let len = keys.length;
            let flast = len - 1;
            let fields = '';
            for (let i = 0; i < len; ++i) {
                let k = keys[i];
                let v = obj[k];
                let ks = k + "=";
                fields += ks + v;
                if (i < flast) {
                    fields += "&";
                }
            }
            return fields;
        }
        return '';
    };

    M.urlParse = function (url) {
        url = url.substr(url.indexOf("?") + 1);
        let t, n, r, i = url, s = {};
        t = i.split("&"),
            r = null,
            n = null;
        for (let o in t) {
            let u = t[o].indexOf("=");
            u !== -1 && (r = t[o].substr(0, u),
                n = t[o].substr(u + 1),
                s[r] = n);
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
            ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&';
        }
        return ret
    };

    M.fetchGet = function (url, callback, data) {
        let getData = "";
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
            return res.json();
        }).then((res) => callback(res)).catch((error) => {
            console.error(error);
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
        }).catch((error) => {
            console.error(error);
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
        }).catch((error) => {
            console.error(error);
        });
    };

    M.getFileNameByUrl=function (url){
        let split= url.split("/");
        return split[split.length-1]
    }

    M.require =async function (url) {
        let fileName=M.getFileNameByUrl(url);
        let promise = new Promise(function (reslove, reject) {
            fetch(url, {
                    method: 'GET',
                    mode: 'cors'
                }
            ).then((res) => {
                let url1 = M.formatUrl(url).split("/");
                return res.text();
            }).then(
                d => {
                    let r = "";
                    if(fileName.endsWith(".js")){
                        r= eval(d);
                    }else {
                        r = JSON.parse(d)
                    }
                    reslove(r);
                }).catch((error) => {
                reject(error);
            });
        });
        return promise;
    };



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
                reslove(resonseData);
            }).catch((error) => {
                console.error(error);
                reject(error);
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
                return ret;
            }],
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (response) {
            callback(response.data);
        }).catch(function (error) {
            console.err(error);
        });
    };


    M.getObjByFile = function (file) {
        let data = localStorage.getItem(file) || "[]";
        let obj;
        if (data) obj = JSON.parse(data.toString());
        return obj;
    };
    M.writeObjToFile = function (file, obj) {
        localStorage.setItem(file, JSON.stringify(obj));
    };

    M.addObjToFile = function (file, obj) {
        try {
            let d = M.getObjByFile(file);
            M.writeObjToFile(file, [...d, obj]);
        } catch (e) {
            M.writeObjToFile(file, [obj]);
        }
    };
    M.deleteObjByIdFile = function (file, id) {
        let ids = [];
        if (!Array.isArray(id)) {
            ids.push(id);
        } else {
            ids = id;
        }
        let d = M.getObjByFile(file);
        let d1 = M.getObjByFile(file);
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
        let d = M.getObjByFile(file);
        let d1 = M.getObjByFile(file);
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
        let d = M.getObjByFile(file);
        for (let i = 0; i < d.length; i++) {
            if (d[i].id == obj.id) {
                d.splice(i, 1, obj);
                break;
            }
        }
        M.writeObjToFile(file, d);
    };

    M.getObjByIdFile = function (file, id) {
        let d = M.getObjByFile(file);
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
        let d = M.getObjByFile(file);
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
        let eleLink = document.createElement('a');
        eleLink.download = filename;
        eleLink.style.display = 'none';
        let blob = new Blob([content]);
        eleLink.href = URL.createObjectURL(blob);
        document.body.appendChild(eleLink);
        eleLink.click();
        document.body.removeChild(eleLink);
    };


    //获取地址栏数据
    M.getParameter = function (name) {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        let r = window.location.href.substr(window.location.href.indexOf('?')).substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    };
    //说话函数
    M.speak = function (speakStr) {
        let myAudio = document.createElement("AUDIO");
        myAudio.src = "http://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=9&text=" + speakStr;
        myAudio.type = "audio/mpeg";
        myAudio.play();
    };
    /**
     *改写ajax方法
     */
    M.ajax = function (options) {
        let d = M.urlParse(options.url);
        options.data = Object.assign(d, options.data);
        if (true) {
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
                        s1 = s1.substring(s2.indexOf(":") - 1, s1.length - 1).split("/").slice(1);
                        s2 = s2.substring(s2.indexOf(":") - 1, s2.length - 1).split("/:").slice(1);
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
                if(M.cache_req_data_enable){
                    App.reqMap.set(options.type + ":" + pureUrl, options.data);
                }
                options.params=options.data;
                if (options.type == "get") {
                    App.doGet(pureUrl, options);
                } else {
                    App.doPost(pureUrl, options);
                }
                return false;
            },
            success(data) {
                options.success(data);
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
                            reslove(data);
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
        let Db = {};
        Db.display_sql_enable = false;

        Db = openDatabase(dbname, '1.0', '', 2 * 1024 * 1024);

        Db.getInsertObjSql = function (tableName, obj) {
            let fields = "(";
            let values = "(";
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
            let fields = [];
            for (let field in obj) {
                fields.push(field);
            }
            let sql = `delete from ${tableName} where ${fields.map(u => u + "='" + obj[u] + "'")}`;
            sql = sql.replace(/,/g, " and ");
            return sql;
        };

        Db.getUpdateObjSql = function (tableName, obj, caseObj) {
            let fields = [];
            for (let field in obj) {
                if (field != "id") {
                    fields.push(field);
                }
            }
            let sql = "";
            if (!caseObj) {
                sql = `update ${tableName} set ${fields.map(u => u + "='" + obj[u] + "'")} where id=${obj.id}`;
            } else {
                let caseObjfields = [];
                for (let caseObjfield in caseObj) {
                    caseObjfields.push(caseObjfield);
                }
                sql = `update ${tableName} set ${fields.map(u => u + "='" + obj[u] + "'")} where ${caseObjfields.map(u => u + "='" + caseObj[u] + "'").join(" and ")}`;
            }

            return sql;
        };


        Db.getSelectObjSql = function (tableName, obj) {
            let fields = [];
            for (let field in obj) {
                fields.push(field);
            }
            let sql = `select * from ${tableName} where ${fields.map(u => u + "='" + obj[u] + "'")}`;
            sql = sql.replace(/,/g, " and ");
            return sql;
        };


        Db.doSql = function (sql) {
            let promise = new Promise(function (reslove, reject) {
                Db.transaction(function (context) {
                    context.executeSql(sql, [], function (context, results) {
                        reslove(Array.from(results.rows));
                    });
                }, function (error) {
                    reject(error);
                    console.error(error.message);
                }, function (a) {

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
            let re = /_(\w)/g;
            let str = this.replace(re, function ($0, $1) {
                return $1.toUpperCase();
            });
            return str;
        };

        /***
         * 驼峰命名转下划线
         */
        String.prototype.humpToUnderline = function () {
            let re = /_(\w)/g;
            let str = this.replace(/([A-Z])/g, "_$1").toLowerCase();
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
            let o = {
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
            for (let k in o) {
                if (new RegExp("(" + k + ")").test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                }
            }
            return fmt;
        }
    };
    M.initServer = function () {
        app.post("/add", (req, res) => {
            let r = M.add(req.params);
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
            let r = M.getById(req.params.id);
            res.send(M.result(r));
        });

        app.get("/listAll", (req, res) => {
            let r = M.listAll();
            res.send(M.result(r));
        });

        app.get("/listByParentId", (req, res) => {
            let r = M.listByProp({ parentId: req.params.parentId });
            res.send(M.result(r));
        });

        app.get("/listByPage", (req, res) => {
            let r = M.listByPage(req.params.startPage, req.params.limit);
            res.send(M.result(r));
        });
    };

    M.urlToPath = function (url) {
        return url.replace(/^http(s?):\/\/[^/]+/, "");
    };

    M.beforeSend = function (options) {

        return true;
    };
    M.endResponse = function (data, xhr) {
        return data;
    };

    /**
     * 缓存start
     */
    M.getRelativePath = function (url, level) {
        let urlArray = url.split("/");
        let resultUrl = "";
        for (let i = 0; i < urlArray.length - level; i++) {
            resultUrl += urlArray[i] + "/";
        }
        return resultUrl;
    };
    M.cache = {
        pageVersion: "0.0.1", //页面版本，也由页面输出，用于刷新localStorage缓存
        //动态加载js文件并缓存
        loadJs: function (name, url, callback) {
            if (window.localStorage) {
                let xhr;
                let js = localStorage.getItem(name);
                if (js == null || js.length == 0 || this.pageVersion != localStorage.getItem("version")) {
                    if (window.ActiveXObject) {
                        xhr = new ActiveXObject("Microsoft.XMLHTTP");
                    } else if (window.XMLHttpRequest) {
                        xhr = new XMLHttpRequest();
                    }
                    if (xhr != null) {
                        xhr.open("GET", url);
                        xhr.send(null);
                        xhr.onreadystatechange = function () {
                            if (xhr.readyState == 4 && xhr.status == 200) {
                                js = xhr.responseText;
                                localStorage.setItem(name, js);
                                localStorage.setItem("version", M.cache.pageVersion);
                                js = js == null ? "" : js;
                                M.cache.writeJs(js);
                                if (callback != null) {
                                    callback(); //回调，执行下一个引用
                                }
                            }
                        };
                    }
                } else {
                    M.cache.writeJs(js);
                    if (callback != null) {
                        callback(); //回调，执行下一个引用
                    }
                }
            } else {
                M.cache.linkJs(url);
            }
        },
        loadCss: function (name, url) {
            if (window.localStorage) {
                let xhr;
                let css = localStorage.getItem(name);
                if (css == null || css.length == 0 || this.pageVersion != localStorage.getItem("version")) {
                    if (window.ActiveXObject) {
                        xhr = new ActiveXObject("Microsoft.XMLHTTP");
                    } else if (window.XMLHttpRequest) {
                        xhr = new XMLHttpRequest();
                    }
                    if (xhr != null) {
                        xhr.open("GET", url);
                        xhr.send(null);
                        xhr.onreadystatechange = function () {
                            if (xhr.readyState == 4 && xhr.status == 200) {
                                css = xhr.responseText;
                                localStorage.setItem(name, css);
                                localStorage.setItem("version", M.cache.pageVersion);
                                css = css == null ? "" : css;
                                css = css.replace(/\..\/fonts\//g, M.getRelativePath(url, 2) + "fonts/"); //css里的font路径需单独处理
                                M.cache.writeCss(css);
                            }
                        };
                    }
                } else {
                    css = css.replace(/\..\/fonts\//g, M.getRelativePath(url, 2) + "fonts/"); //css里的font路径需单独处理
                    M.cache.writeCss(css);
                }
            } else {
                M.cache.linkCss(url);
            }
        },
        //往页面写入js脚本
        writeJs: function (text) {
            let head = document.getElementsByTagName('HEAD').item(0);
            let link = document.createElement("script");
            link.type = "text/javascript";
            link.innerHTML = text;
            head.appendChild(link);
        },
        //往页面写入css样式
        writeCss: function (text) {
            let head = document.getElementsByTagName('HEAD').item(0);
            let link = document.createElement("style");
            link.type = "text/css";
            link.innerHTML = text;
            head.appendChild(link);
        },
        //往页面引入js脚本
        linkJs: function (url) {
            let head = document.getElementsByTagName('HEAD').item(0);
            let link = document.createElement("script");
            link.type = "text/javascript";
            link.src = url;
            head.appendChild(link);
        },
        //往页面引入css样式
        linkCss: function (url) {
            let head = document.getElementsByTagName('HEAD').item(0);
            let link = document.createElement("link");
            link.type = "text/css";
            link.rel = "stylesheet";
            link.rev = "stylesheet";
            link.media = "screen";
            link.href = url;
            head.appendChild(link);
        }
    };
    /**
   * 缓存end
   */

    /**
     *  ajax 拦截 start
     */
    M.ajaxInterceptor = function () {
        let Util = {};
        Util.extend = function extend() {
            let target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                options, name, src, copy, clone;

            if (length === 1) {
                target = this;
                i = 0;
            }

            for (; i < length; i++) {
                options = arguments[i];
                if (!options) continue;

                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    if (target === copy) continue;
                    if (copy === undefined) continue;

                    if (Util.isArray(copy) || Util.isObject(copy)) {
                        if (Util.isArray(copy)) clone = src && Util.isArray(src) ? src : [];
                        if (Util.isObject(copy)) clone = src && Util.isObject(src) ? src : {};

                        target[name] = Util.extend(clone, copy);
                    } else {
                        target[name] = copy;
                    }
                }
            }

            return target;
        };

        Util.each = function each(obj, iterator, context) {
            let i, key;
            if (this.type(obj) === 'number') {
                for (i = 0; i < obj; i++) {
                    iterator(i, i);
                }
            } else if (obj.length === +obj.length) {
                for (i = 0; i < obj.length; i++) {
                    if (iterator.call(context, obj[i], i, obj) === false) break;
                }
            } else {
                for (key in obj) {
                    if (iterator.call(context, obj[key], key, obj) === false) break;
                }
            }
        };

        Util.type = function type(obj) {
            return (obj === null || obj === undefined) ? String(obj) : Object.prototype.toString.call(obj).match(/\[object (\w+)\]/)[1].toLowerCase();
        };

        Util.each('String Object Array RegExp Function'.split(' '), function (value) {
            Util['is' + value] = function (obj) {
                return Util.type(obj) === value.toLowerCase();
            }
        });

        Util.isObjectOrArray = function (value) {
            return Util.isObject(value) || Util.isArray(value);
        };

        Util.isNumeric = function (value) {
            return !isNaN(parseFloat(value)) && isFinite(value);
        };

        Util.keys = function (obj) {
            let keys = [];
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) keys.push(key);
            }
            return keys;
        };
        Util.values = function (obj) {
            let values = [];
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) values.push(obj[key]);
            }
            return values;
        };
        Util.heredoc = function heredoc(fn) {
            return fn.toString().replace(/^[^\/]+\/\*!?/, '').replace(/\*\/[^\/]+$/, '').replace(/^[\s\xA0]+/, '').replace(/[\s\xA0]+$/, '');
        };

        Util.noop = function () { };

        window._XMLHttpRequest = window.XMLHttpRequest;
        window._ActiveXObject = window.ActiveXObject;
        try {
            new window.Event('custom');
        } catch (exception) {
            window.Event = function (type, bubbles, cancelable, detail) {
                let event = document.createEvent('CustomEvent');
                event.initCustomEvent(type, bubbles, cancelable, detail);
                return event
            }
        }

        let XHR_STATES = {
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
        };

        let XHR_EVENTS = 'readystatechange loadstart progress abort error load timeout loadend'.split(' ');
        let XHR_REQUEST_PROPERTIES = 'timeout withCredentials'.split(' ');
        let XHR_RESPONSE_PROPERTIES = 'readyState responseURL status statusText responseType response responseText responseXML'.split(' ');

        // https://github.com/trek/FakeXMLHttpRequest/blob/master/fake_xml_http_request.js#L32
        let HTTP_STATUS_CODES = {
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
        };
        function MockXMLHttpRequest() {
            // 初始化 custom 对象，用于存储自定义属性
            this.custom = {
                events: {},
                requestHeaders: {},
                responseHeaders: {}
            }
        };

        MockXMLHttpRequest._settings = {
            timeout: '10-100',
            /*
                timeout: 50,
                timeout: '10-100',
                */
        };

        MockXMLHttpRequest.setup = function (settings) {
            Util.extend(MockXMLHttpRequest._settings, settings);
            return MockXMLHttpRequest._settings;
        };
        Util.extend(MockXMLHttpRequest, XHR_STATES);
        Util.extend(MockXMLHttpRequest.prototype, XHR_STATES);
        // 标记当前对象为 MockXMLHttpRequest
        MockXMLHttpRequest.prototype.mock = true;
        // 是否拦截 Ajax 请求
        MockXMLHttpRequest.prototype.match = true;
        // 初始化 Request 相关的属性和方法
        Util.extend(MockXMLHttpRequest.prototype, {
            open: function (method, url, async, username, password) {
                let that = this;
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
                });
                this.custom.timeout = function (timeout) {
                    if (typeof timeout === 'number') return timeout;
                    if (typeof timeout === 'string' && !~timeout.indexOf('-')) return parseInt(timeout, 10);
                    if (typeof timeout === 'string' && ~timeout.indexOf('-')) {
                        let tmp = timeout.split('-');
                        let min = parseInt(tmp[0], 10);
                        let max = parseInt(tmp[1], 10);
                        return Math.round(Math.random() * (max - min)) + min;
                    }
                }(MockXMLHttpRequest._settings.timeout);

                // 查找与请求参数匹配的数据模板
                let item = find(this.custom.options);
                function handle(event) {
                    // 同步属性 NativeXMLHttpRequest => MockXMLHttpRequest
                    for (let i = 0; i < XHR_RESPONSE_PROPERTIES.length; i++) {
                        try {
                            that[XHR_RESPONSE_PROPERTIES[i]] = xhr[XHR_RESPONSE_PROPERTIES[i]];
                        } catch (e) { }
                    }
                    // 触发 MockXMLHttpRequest 上的同名事件
                    that.dispatchEvent(new Event(event.type /*, false, false, that*/));
                };

                // 如果未找到匹配的数据模板 或者未启用ajax拦截，则采用原生 XHR 发送请求。
                if (!item || M.ajaxInterceptorStatus == false) {
                    this.match = false;
                    // 创建原生 XHR 对象，调用原生 open()，监听所有原生事件
                    let xhr = createNativeXMLHttpRequest();
                    this.custom.xhr = xhr;

                    // 初始化所有事件，用于监听原生 XHR 对象的事件
                    for (let i = 0; i < XHR_EVENTS.length; i++) {
                        xhr.addEventListener(XHR_EVENTS[i], handle);
                    }

                    // xhr.open()
                    if (username) xhr.open(method, url, async, username, password);
                    else xhr.open(method, url, async);

                    // 同步属性 MockXMLHttpRequest => NativeXMLHttpRequest
                    for (let j = 0; j < XHR_REQUEST_PROPERTIES.length; j++) {
                        try {
                            xhr[XHR_REQUEST_PROPERTIES[j]] = that[XHR_REQUEST_PROPERTIES[j]];
                        } catch (e) { }
                    };

                    return
                };

                // 找到了匹配的数据模板，开始拦截 XHR 请求
                this.match = true;
                this.custom.template = item;
                this.readyState = MockXMLHttpRequest.OPENED;
                this.dispatchEvent(new Event('readystatechange' /*, false, false, this*/));
            },
            // https://xhr.spec.whatwg.org/#the-setrequestheader()-method
            // Combines a header in author request headers.
            setRequestHeader: function (name, value) {
                // 原生 XHR
                if (!this.match) {
                    this.custom.xhr.setRequestHeader(name, value);
                    return;
                }

                // 拦截 XHR
                let requestHeaders = this.custom.requestHeaders;
                if (requestHeaders[name]) requestHeaders[name] += ',' + value;
                else requestHeaders[name] = value;
            },
            timeout: 0,
            withCredentials: false,
            upload: {},
            // https://xhr.spec.whatwg.org/#the-send()-method
            // Initiates the request.
            send: function send(data) {
                let that = this;
                this.custom.options.body = data;
                if (M.beforeSend(this.custom.options) == false) {
                    return;
                }
                // 原生 XHR
                if (!this.match) {
                    this.custom.xhr.send(data);
                    let xhr = this.custom.xhr;
                    this.custom.xhr.onreadystatechange = function () {
                        if (xhr.status === 200) {
                            if (xhr.readyState === 4) {
                                xhr.response = M.endResponse(xhr.response, xhr);
                            }
                        }
                    }
                    return;
                };
                // 拦截 XHR
                this.setRequestHeader('X-Requested-With', 'MockXMLHttpRequest');
                // loadstart The fetch initiates.
                this.dispatchEvent(new Event('loadstart' /*, false, false, this*/));

                if (this.custom.async) setTimeout(done, this.custom.timeout);// 异步
                else done();// 同步

                function done() {
                    that.readyState = MockXMLHttpRequest.HEADERS_RECEIVED;
                    that.dispatchEvent(new Event('readystatechange' /*, false, false, that*/));
                    that.readyState = MockXMLHttpRequest.LOADING;
                    that.dispatchEvent(new Event('readystatechange' /*, false, false, that*/));
                    that.status = 200;
                    that.statusText = HTTP_STATUS_CODES[200];
                    // fix #92 #93 by @qddegtya
                    convert(that.custom.template, that.custom.options).then(d => {
                        d = M.endResponse(d, that.custom);
                        that.response = that.responseText = JSON.stringify(d);
                        that.readyState = MockXMLHttpRequest.DONE;
                        that.dispatchEvent(new Event('readystatechange' /*, false, false, that*/));
                        that.dispatchEvent(new Event('load' /*, false, false, that*/));
                        that.dispatchEvent(new Event('loadend' /*, false, false, that*/));
                    });
                }
            },
            // https://xhr.spec.whatwg.org/#the-abort()-method
            // Cancels any network activity.
            abort: function abort() {
                // 原生 XHR
                if (!this.match) {
                    this.custom.xhr.abort();
                    return;
                };

                // 拦截 XHR
                this.readyState = MockXMLHttpRequest.UNSENT;
                this.dispatchEvent(new Event('abort', false, false, this));
                this.dispatchEvent(new Event('error', false, false, this));
            }
        });

        // 初始化 Response 相关的属性和方法
        Util.extend(MockXMLHttpRequest.prototype, {
            responseURL: '',
            status: MockXMLHttpRequest.UNSENT,
            statusText: '',
            // https://xhr.spec.whatwg.org/#the-getresponseheader()-method
            getResponseHeader: function (name) {
                // 原生 XHR
                if (!this.match) {
                    return this.custom.xhr.getResponseHeader(name);
                };
                // 拦截 XHR
                return this.custom.responseHeaders[name.toLowerCase()];
            },
            // https://xhr.spec.whatwg.org/#the-getallresponseheaders()-method
            // http://www.utf8-chartable.de/
            getAllResponseHeaders: function () {
                // 原生 XHR
                if (!this.match) {
                    return this.custom.xhr.getAllResponseHeaders();
                }

                // 拦截 XHR
                let responseHeaders = this.custom.responseHeaders;
                let headers = '';
                for (let h in responseHeaders) {
                    if (!responseHeaders.hasOwnProperty(h)) continue;
                    headers += h + ': ' + responseHeaders[h] + '\r\n';
                }
                return headers;
            },
            overrideMimeType: function ( /*mime*/) { },
            responseType: '', // '', 'text', 'arraybuffer', 'blob', 'document', 'json'
            response: null,
            responseText: '',
            responseXML: null
        });

        // EventTarget
        Util.extend(MockXMLHttpRequest.prototype, {
            addEventListener: function addEventListener(type, handle) {
                let events = this.custom.events;
                if (!events[type]) events[type] = [];
                events[type].push(handle);
            },
            removeEventListener: function removeEventListener(type, handle) {
                let handles = this.custom.events[type] || [];
                for (let i = 0; i < handles.length; i++) {
                    if (handles[i] === handle) {
                        handles.splice(i--, 1);
                    }
                }
            },
            dispatchEvent: function dispatchEvent(event) {
                let handles = this.custom.events[event.type] || [];
                for (let i = 0; i < handles.length; i++) {
                    handles[i].call(this, event);
                };
                let ontype = 'on' + event.type;
                if (this[ontype]) this[ontype](event);
            }
        });

        // Inspired by jQuery
        function createNativeXMLHttpRequest() {
            const isLocal = function () {
                let rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/;
                let rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/;
                let ajaxLocation = location.href;
                let ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];
                return rlocalProtocol.test(ajaxLocParts[1]);
            }();

            return window.ActiveXObject ?
                (!isLocal && createStandardXHR() || createActiveXHR()) : createStandardXHR();

            function createStandardXHR() {
                try {
                    return new window._XMLHttpRequest();
                } catch (e) { }
            }

            function createActiveXHR() {
                try {
                    return new window._ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) { }
            }
        }
        // 查找与请求参数匹配的数据模板：URL，Type
        function find(options) {
            let path = M.urlToPath(options.url);
            let formatUrl = M.formatUrl(path);
            options.path = path;
            options.formatUrl = formatUrl;
            //rest 判断
            for (let i = 0; i < Object.keys(App._rest).length; i++) {
                if (formatUrl.startsWith(Object.keys(App._rest)[i])) {
                    return true;
                }
            }
            if (options.type == "POST") {
                if (Object.keys(app._post).indexOf(formatUrl) > -1) {
                    return true;
                }
            } else {
                if (Object.keys(app._get).indexOf(formatUrl) > -1) {
                    return true;
                }
            }
            return false;
        };
        M.findResPonseTemplate = find;
        // 数据模板 ＝> 响应数据
        function convert(item, options) {
            let data = {};
            if (options.body) {
                try {
                    data = JSON.parse(options.body);
                } catch (e) {
                    data = M.urlParse(options.body);
                }
            };
            options.data = data;
            if (options.type != "GET" && options.type != "POST") {
                options.type = "GET";
            };
            return new Promise(
                function (reslove) {
                    M.ajax({
                        url: options.path,
                        data: data,
                        type: options.type.toLocaleLowerCase(),
                        success: function (data) {
                            reslove(data);
                        }
                    });
                }
            )
        };

        M.convertResPonseTemplate = convert;
        window.XMLHttpRequest = MockXMLHttpRequest;
    };


    M.originalFetch = window.fetch.bind(window);


    M.myFetch = async function (...args) {
        if (M.beforeSend(args) == false) {
            return;
        };
        return M.originalFetch(...args).then(async (response) => {
            let txt = undefined;
            let [reqPath, reqConfig] = args;
            reqConfig.url = response.url;
            reqConfig.type = reqConfig.method;
            let matched = M.findResPonseTemplate(reqConfig);
            if (matched) {
                txt = await M.convertResPonseTemplate(null, reqConfig);
            };
            txt = M.endResponse(txt, response);
            if (txt !== undefined) {
                const stream = new ReadableStream({
                    start(controller) {
                        const bufView = new Uint8Array(new ArrayBuffer(txt.length));
                        for (let i = 0; i < txt.length; i++) {
                            bufView[i] = txt.charCodeAt(i);
                        };
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
                    get: function (target, name) {
                        switch (name) {
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
    };




    M.ajaxInterceptorEnable = function () {
        M.ajaxInterceptorStatus = true;
        M.ajaxInterceptor();
    };

    M.ajaxInterceptorDisable = function () {
        M.ajaxInterceptorStatus = false;
    };

    M.fetchInterceptorEnable = function () {
        M.ajaxInterceptorEnable();
        window.fetch = M.myFetch;
    };

    M.fetchInterceptorDisable = function () {
        window.fetch = M.originalFetch;
    };


    M.jqueryAjaxInterceptorEnable = function () {
        $.ajax = M.ajax;
    };

    M.getComponentName=function(componentName){
        let funStr=componentName._reactInternalFiber.type.toString();
        let re = /function\s*(\w*)/i;
        let matches = re.exec(funStr);
        return matches[1];
    }


    const translateApi=(api)=>{
        let url=M.config?M.config.baseUrl(api):"" ;
        if(!api.startsWith("http")){
            api=url
        }
        return api;
    }

    const request= async function ({methed,api,params,headers}){
        api=translateApi(api)
        // alert(api)
        return new Promise((reslove, reject) => {
            fetch(api, {
                method: methed,
                mode: 'cors',
                headers: headers||{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            }).then(function (response) {
                return response.json();
            }).then((res) => {
                reslove(res)
            }).catch((err) => {
                reject(err)
            });
        })
    }

    const post  = async (api, params = {},headers) => request({methed:"POST",api,params,headers})
    const del  = async (api, params = {},headers) => request({methed:"DELETE",api,params,headers})
    const put  = async (api, params = {},headers) => request({methed:"PUT",api,params,headers})
    const get = async (api, params = {},headers) => {
        api=translateApi(api)
        let getData = "";
        if (params) {
            getData = window.M.urlStringify(params);
            if (api.indexOf("?") > 0) {
                getData = "&" + getData;
            } else {
                getData = "?" + getData;
            }
        }
        api = api + getData;
        return new Promise((reslove, reject) => {
            fetch(api, {
                method: 'GET',
                mode: 'cors',
                headers: headers||{
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                return response.json();
            }).then((res) => {
                reslove(res)
            }).catch((err) => {
                reject(err)
            });
        })
    };


    /**
     *  ajax 拦截 end
     */
    M.initRedux=function(){
        let handler = {
            get (target, key, receiver) {
                return Reflect.get(target, key, receiver)
            },
            set (target, key, value, receiver) {
                if(M._global_state_subscribe_component[key]){
                    let oldValue=M._global_state[key]
                    let newValue=value
                    if(oldValue){
                        newValue=Object.assign(oldValue,value)
                    }
                    M._global_state_subscribe_component[key].forEach(c=>c.setState(newValue))
                }
                return Reflect.set(target, key, value, receiver)
            }
        }
        M.State = new Proxy(M._global_state , handler);

        M.subReg=function (componentName,componentThis,stateName,initState){
            if(typeof(componentName)!="string"){
                initState=stateName;
                stateName=componentThis;
                componentThis=componentName;
                componentName=M.getComponentName(componentName);
            }
            M.Component[componentName]=componentThis;
            if(stateName){
                if( !M._global_state_subscribe_component[stateName]){
                    let  subscribe_component_set=new Set();
                    //初始状态
                    M._global_state[stateName]=initState;
                    if(componentThis){
                        subscribe_component_set.add(componentThis);
                    }
                    M._global_state_subscribe_component[stateName]=subscribe_component_set;
                }else {
                    let  subscribe_component_set= M._global_state_subscribe_component[stateName]
                    if(componentThis){
                        subscribe_component_set.add(componentThis)
                    }
                }
            }
        }
        //取消订阅注册
        M.unSubReg=function (componentName,stateName){
            //取消注册
            if(stateName && M.Component[componentName]){
                if( M._global_state_subscribe_component[stateName]){
                    let  subscribe_component_set= M._global_state_subscribe_component[stateName]
                    subscribe_component_set.delete(M.Component[componentName])
                }
            }
            if(!componentName && stateName ){
                M._global_state_subscribe_component[stateName]=null
            }
            M.Component[componentName]=null;
        }
    }


    M.init();
    M.initRedux();
    window.app = App;
    window.M = M;
    window.MIO = M.IO;
    window.M.request={}
    window.M.request.get=get;
    window.M.request.post=post;
    window.M.request.delete=del;
    window.M.request.put=put;

    //$.ajax = M.ajax;
    if (M.init_server_enable) M.initServer();


    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = { app: App, M, MIO: M.IO }
    }


})(window);