export const loadShell = async () => {
    window['chrome'] = window['chrome'] || {}
    await import('../../sh/fs/boot/kernel.js')
    const kernel = await new Promise(resolve => {
        window.Boot('XmlHttpRequest', ['index.json', '../sh/fs', true], function (err, k) {
            if (err) {
                console.log(err);
                resolve()
            }
            resolve(k)
        }, { readOnly: false });
    })
    const sh = { kernel }
    const apiObjName = '____shApis'
    sh.eval = async (source, noValue) => {
        const bg = source[source.length - 1] === '&';
        if (bg) {
            source = source.slice(0, -1).trim();
        }
        const onInput = async function (pid, out, ...args) {
            if (out?.startsWith(apiObjName + '\n')) {
                try {
                    out = out.slice(apiObjName.length + 1)
                    const { pid, apiName, apiArgs } = JSON.parse(out)
                    const apiResult = await window[apiObjName][apiName]?.(...apiArgs)
                    const task = sh.kernel.tasks[pid]?.worker
                    if (task) {
                        task.postMessage({ apiName, apiResult: apiResult })
                    }
                    return
                } catch (e) {
                    debugger
                }
            }
            console.log(out)
        };
        const task = new Promise(resulve => {
            var completed = function (pid, code) {
                resulve([pid, code])
            };
            // source = `sh -c ${JSON.stringify(source)}`
            kernel.system(source, completed, onInput, onInput);
        })
        if (!bg) {
            const [pid, code] = await task
        }
        return { apiResult: [true, noValue] }
    }

    window[apiObjName] = {}
    sh.define = (name, f) => {
        window[apiObjName][name] = f
        const code = `#!/usr/bin/env node
'use strict';
const fs = require('fs');
const util_1 = require('util');
async function main() {
    'use strict';
    globalThis.addEventListener('message', ({ data }) => {
        if (data?.apiName !== ${JSON.stringify(name)}){
        return
    }
    if(data.apiResult?.apiResult){
        const [success, result]=data.apiResult.apiResult
        if(success){
            process.stdout.write(result + '\\n')
        }else{
            process.stderr.write(result + '\\n')
        }
    }else{
        process.stdout.write(data.apiResult + '\\n')
    }
    process.exit(0);
})
process.stdout.write(${JSON.stringify(apiObjName)} + '\\n' + JSON.stringify({ pid: process.env.PID, apiName: ${JSON.stringify(name)}, apiArgs: process.argv.slice(2)}) + "\\n", 'utf-8')
}
main()
`
        sh.kernel.fs.writeFileSync(`/usr/bin/${name}`, code, 'utf-8', 'w', 755)
    }

    sh.revDefine = (f, args) => {
        let exp = f + ' '
        for (let a of args) {
            exp += JSON.stringify(a)
        }
        return exp
    }
    return sh
}