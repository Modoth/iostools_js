export class EasyLang {
    constructor() {
        this.context = {}
        this.apis = {}
    }
    get welcome() {
        return `未完成easy脚本
例子：
*. 变量与字面值
    *. 数字      #age=1;
    *. 字符串    $name=Evan
    *. 数组      @friends=1,2,3
    *. 函数      &say=&p #hello[0]
    *. 数值函数  &#f=m0j1
*. 代码块
    *. {&p 123;&p 456;}
`
    }

    async eval(/**@type {String} */source) {
        return source
    }

    define(name, f) {
        this.apis[name] = f
    }
}