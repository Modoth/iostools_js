export const loadShell = async () => {
    await import('../../lua/fengari-web.js')
    // console.log(fengari.load('return 1+1')())
    const fengari = window.fengari
    const apiObjName = '____luaApis'
    window[apiObjName] = {}
    fengari.load('js = require "js"')()
    fengari.eval = async (source, noValue) => {
        const showRes = !['end', ';', ',', '}'].some(e => source.endsWith(e))
        if (showRes) {
            const lines = source.split('\n')
            const lastLine = 'return ' + lines.pop()
            lines.push(lastLine)
            source = lines.join('\n')
            return (await fengari.load(source)())
        }
        (await fengari.load(source)())
        return { apiResult: [true, noValue] }
    }
    fengari.define = (name, f) => {
        window[apiObjName][name] = f
        fengari.load(`function ${name} (...) return js.global.${apiObjName}:${name}(...) end`)()
    }
    return fengari
}