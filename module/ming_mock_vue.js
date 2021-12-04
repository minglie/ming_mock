/**
 * File : index.js
 * By : Minglie
 * QQ: 934031452
 * Date :2021.09.30
 * version :1.9.0
 */

(function (window) {

    class WebComponent {
        //缓存组件模板
        static _webComponenrCache={}
        static _isClass=true;
        constructor(props) {
            //生成组件唯一name
            this.selfName = `MingRouter.componentMap.${props.className}.${props["key"]}`;
            this.props=props;
        }

        setState(state) {
            this.state = Object.assign(this.state, state);
        }
        render() {
            return `<div>...</div>`;
        }
        async getTemplate(props){
            if(MingRouter.componentMap[props.className].template){
                let templateContent="";
                if(MingRouter.componentMap[props.className].templateContent){
                    templateContent=MingRouter.componentMap[props.className].templateContent;
                }else {
                    templateContent=await  MingRouter.getTemplateByHtmlUrl(MingRouter.componentMap[props.className].template)
                    MingRouter.componentMap[props.className].templateContent=templateContent;
                }
                const CurWebComponent= MingRouter.componentMap[props.className];
                templateContent= eval("`"+templateContent+"`");
                return templateContent;
            }else {
                return this.render(props);
            }
        }
        //获取函数组件模板
        static async staticGetTemplate(props){
            if(MingRouter.componentMap[props.className].template){
                let templateContent="";
                if(MingRouter.componentMap[props.className].templateContent){
                    templateContent=MingRouter.componentMap[props.className].templateContent;
                }else {
                    templateContent=await  MingRouter.getTemplateByHtmlUrl(MingRouter.componentMap[props.className].template)
                    MingRouter.componentMap[props.className].templateContent=templateContent;
                }
                templateContent= eval("`"+templateContent+"`");
                return templateContent;
            }
        }

        static get observedAttributes() {
            return [];
        }

        componentWillUnmount(props){

        }

        componentWillReceiveProps (props){

        }

        componentDidMount() {

        }

        attributeChangedCallback(name, oldValue, newValue){

        }
    }


    class MingRouter {
        //全局html缓存
        static loadHtmlCache={};
        //page级别css缓存
        static loadCssCache={};

        static async loadHtml(htmlUrl){
            if(MingRouter.loadHtmlCache[htmlUrl]){
                return MingRouter.loadHtmlCache[htmlUrl];
            }
            return new Promise((resolve,reject)=>{
                fetch(htmlUrl).then(d=>d.text()).then(d=>{
                    MingRouter.loadHtmlCache[htmlUrl]=d;
                    resolve(d)
                })
            })
        }

        static  html(htmlUrl){
            let r=  MingRouter.loadHtmlCache[htmlUrl]||"<h1>wait...</h1>";
            return r;
        }

        static getTemplateByHtmlUrl(htmlUrl){
            if(htmlUrl.startsWith("#")){
                let temp =  document.querySelector(htmlUrl).innerHTML;
                return temp;
            }
            if(htmlUrl.endsWith(".html")){
                return new Promise((resolve,reject)=>{
                    fetch(htmlUrl).then(d=>d.text()).then(d=>{
                        resolve(d)
                    })
                })
            }
            return htmlUrl;
        }


        static componentMap={}

        //注册全局组件
        static registWebComponent(WrapWebComponent){
            if(!WrapWebComponent._isClass){
                let {className,tagName} = MingRouter.parseFunctionName(WrapWebComponent)
                WrapWebComponent.className=className;
                WrapWebComponent.tagName=tagName;
                //函数组件的模板
                if(MingRouter.componentMap[WrapWebComponent.className]){
                    console.error(`${WrapWebComponent.className} function is registed`);
                    return;
                }
                MingRouter.componentMap[WrapWebComponent.className] = WrapWebComponent;
                customElements.define(WrapWebComponent.tagName,
                    class App extends HTMLElement {
                        constructor() {
                            super();
                            this.attachShadow({ mode: "open" });
                        }
                        setAttribute(qualifiedName, value) {
                            debugger
                            super.setAttribute(qualifiedName,value);
                            this.props[qualifiedName]=value;
                            this._render(this.props);
                        }
                        async connectedCallback() {
                            let objs = {}
                            let propNames = this.getAttributeNames()
                            for (let i = 0; i < propNames.length; i++) {
                                objs[propNames[i]] = this.getAttribute(propNames[i]);
                            }
                            if (!objs.key) {
                                objs["key"] = "key";
                            }
                            objs.className = WrapWebComponent.className;
                            this.props = objs;
                            this.wrapWebComponent = this;
                            await this._render(this.props);
                        }
                        async _render(props) {
                            WrapWebComponent.template=WrapWebComponent(props);
                            let content= await WebComponent.staticGetTemplate(props)
                            this.shadowRoot.innerHTML = content;
                        }
                    });
                return;
            }

            let {className,tagName} = MingRouter.parseClassName(WrapWebComponent)
            WrapWebComponent.className=className;
            WrapWebComponent.tagName=tagName;
            if( MingRouter.componentMap[WrapWebComponent.className]){
                console.error(`${WrapWebComponent.className} is registed`);
                return;
            }
            MingRouter.componentMap[WrapWebComponent.className] = WrapWebComponent
            customElements.define(WrapWebComponent.tagName,
                class App extends HTMLElement {
                    constructor() {
                        super();
                        let shadowroot = this.attachShadow({ mode: "open" });
                        this.shadowroot=shadowroot;
                    }

                    static get observedAttributes() {
                        return WrapWebComponent.observedAttributes;
                    }

                    /**
                     * 移除
                     */
                    disconnectedCallback(){
                        this.wrapWebComponent.componentWillUnmount(this.props)
                    }

                    /**
                     * 移动
                     */
                    adoptedCallback(){
                        this.wrapWebComponent.adoptedCallback(this.props)

                    }

                    setAttribute(qualifiedName, value) {
                        super.setAttribute(qualifiedName,value);
                        this.props=this.props||{};
                        this.props[qualifiedName]=value;
                        if(this.wrapWebComponent){
                            this.wrapWebComponent.componentWillReceiveProps(this.props);
                        }
                    }

                    /**
                     * 属性改变
                     * @param name
                     * @param oldValue
                     * @param newValue
                     */
                    attributeChangedCallback(name, oldValue, newValue){
                        this.wrapWebComponent.attributeChangedCallback(name,oldValue,newValue)
                    }

                    /**
                     * 添加到dom
                     * @returns {Promise<void>}
                     */
                    async connectedCallback() {
                        let objs = {}
                        let propNames = this.getAttributeNames()
                        for (let i = 0; i < propNames.length; i++) {
                            objs[propNames[i]] = this.getAttribute(propNames[i]);
                        }
                        if (!objs.key) {
                            objs["key"] = "key";
                        }
                        objs.className = WrapWebComponent.className;
                        this.props = objs;
                        this.wrapWebComponent = new WrapWebComponent(this.props);
                        this.wrapWebComponent.shadowRoot=this.shadowroot;
                        this.wrapWebComponent.htmlElement=this;
                        WrapWebComponent[this.props["key"]] = this.wrapWebComponent;
                        this.wrapWebComponent.setState = (state,callback) => {
                            let newState = Object.assign(this.wrapWebComponent.state, state);
                            this.wrapWebComponent.state = newState;
                            this._render(this.props).then(()=>{
                                if(callback){
                                    callback(newState);
                                }
                            })
                        };
                        await this._render(this.props);
                        this.wrapWebComponent.componentDidMount(this.props);
                    }

                    async _render() {
                        let self = this.wrapWebComponent;
                        let renderContentPure= await this.wrapWebComponent.getTemplate(this.props)
                        let renderContent = `
           
                  ${this.wrapWebComponent.renderCss? "<style>"+this.wrapWebComponent.renderCss(this.props)+"</style>":"" }
                  ${renderContentPure}`;

                        this.shadowRoot.innerHTML = renderContent

                    }
                });
        }

        static CON_FUN_NAME_RE= /function\s*(\w*)/i;
        static CON_CLASS_NAME_RE= /class\s*(\w*)/i;
        static parseFunctionName(fun){
            let className= MingRouter.CON_FUN_NAME_RE.exec(fun.toString())[1];
            let tagName= className.replace(/([A-Z])/g, "-$1").toLowerCase().substr(1);
            return {className:className,tagName:tagName};
        }
        static parseClassName(clazz){
            let className= MingRouter.CON_CLASS_NAME_RE.exec(clazz.toString())[1];
            let tagName= className.replace(/([A-Z])/g, "-$1").toLowerCase().substr(1);
            return {className,tagName};
        }
    }


    MingRouter.WebComponent=WebComponent;
    window.MingRouter=MingRouter;


})(window);