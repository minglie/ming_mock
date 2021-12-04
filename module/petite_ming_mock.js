(function (window) {
    var M = {};
    var App = {
        _get: {},
        _begin: function () {
        },
        begin(callback) {
            App._begin = callback;
        },
        get (methodName, callback) {
            //在M.IO上注册一个方法
            M.IO.reg(methodName.replace("/", ""));
            App._get[methodName] = callback;
        },
        async doget(methodName,params,callback) {
            const req = {};
            const res = {};
            req.url = methodName;
            req.params = params;
            await App._begin(req, res);
            res.send = function (d) {
                callback(d);
            }.bind(this);
            App._get[methodName](req, res);
        }
    };
    //服务方法注册
    M.IO = {};
    M.IO.reg = function (methedName) {
        M.IO[methedName] = (param) => {
            return new Promise(
                function (reslove) {
                    App.doget("/" + methedName,param,(d)=>{
                        reslove(d);
                    })
                }
            )
        }
    };
    window.M = M;
    window.MIO = M.IO;
    window.app = App;
})(window);