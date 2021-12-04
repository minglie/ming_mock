const config={
    appletName："",
    DOMAIN:""
}



function request({url, data = {}, method = 'GET',header}) {
    return new Promise((resolve,reject) => {
        wx.request({
            url:  url,
            method: method,
            data: data,
            header: header,
            success: function(res) {
                if (res.statusCode === 200) {
                    resolve(res.data)
                } else {
                    reject(res.errMsg)
                }
            },
            fail: function(err) {
                reject(err)
            }
        })
    })
}

const get = async (api, params = {}, headers) => {
    const app= getApp();
    let defaultHead={
        'Content-Type':'application/json',
        appletName: config.appletName,
        unionId: app.globalData.unionId,
        openId: app.globalData.openId
    }
    headers=Object.assign(defaultHead,headers)
    let url=config.DOMAIN + api;
    if(api.startsWith("http")){
        url=api;
    }
    const res = await request({
        url: url,
        data: params,
        header: headers ,
        method: "GET"
    });
    return res;
};

const post = async (api, params = {}, headers) => {
    let defaultHead={
        'Content-Type':'application/json',
        appletName: config.appletName,
        unionId: app.globalData.unionId,
        openId: app.globalData.openId
    }
    headers=Object.assign(defaultHead,headers)
    let url=config.DOMAIN + api;
    if(api.startsWith("http")){
        url=api;
    }
    const res = await request({
        url: url,
        data: params,
        header: headers || {},
        method: "POST"
    });
    return res;
};



const mApp = {
    _get: {},
    _begin: function () {
    },
    _end: function () {
    },

    begin(callback) {
        mApp._begin = callback;
    },
    end(callback) {
        mApp._end = callback;
    },
    get (methodName, callback) {
        //在M.IO上注册一个方法
        M.IO.reg(methodName.replace("/", ""));
        mApp._get[methodName] = callback;
    },
    async doget(methodName,params,callback) {
        const req = {};
        const res = {};
        req.params = params||{};
        req.url = methodName;
        res.send = function (d) {
            res.alreadySend = true;
            callback(d);
            mApp._end(req, d);
        }.bind(this);
        await mApp._begin(req, res);
        if (!res.alreadySend) await mApp._get[methodName](req, res);
    }
};

const M={
    config:config,
    app:mApp,
    IO:{
        reg: function (methedName) {
            M.IO[methedName] = (param) => {
                return new Promise(
                    function (reslove) {
                        mApp.doget("/" + methedName,param,(d)=>{
                            reslove(d);
                        })
                    }
                )
            }
        }
    },
    request:{
        get,
        post
    }
}

export default M;



