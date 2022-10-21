const sleep = (timeout) => new Promise(resolve => setTimeout(resolve, timeout))
export class ToolApp {
    constructor(args) {
        Object.assign(this, args)
    }

    async init({ shell, shellName }) {
        await import("./libs/plotly-2.14.0.min.js")
        const Plotly_ = window.Plotly
        const Plotly = Object.assign({}, Plotly_)
        window.Plotly = Plotly
        let toJs = undefined
        switch (shellName) {
            case 'python':
                toJs = (value) => {
                    if (value?.toJs) {
                        return value.toJs({ dict_converter: Object.fromEntries })
                    }
                    return value
                }
        }
        for (let fn in Plotly_) {
            Plotly[fn] = (...args) => {
                if (toJs) {
                    args = args.map(a => toJs(a))
                }
                if (args[0] instanceof HTMLElement || typeof (args[0]) === 'string') {
                    args = args.slice(1)
                }
                let res = Plotly_[fn](this.container, ...args)
                return res
            }
        }
        shell.define('Plotly', Plotly)
    }
}