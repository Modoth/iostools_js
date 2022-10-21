export const loadShell = async () => {
    await import('../../ruby/browser.umd.js')
    const { DefaultRubyVM } = window["ruby-wasm-wasi"];
    const response = await fetch(
        "../ruby/ruby+stdlib.wasm"
    );
    const buffer = await response.arrayBuffer();
    const module = await WebAssembly.compile(buffer);
    const ruby = await DefaultRubyVM(module);
    ruby.binding = ruby.vm.eval(`
$__bind=binding
$__vars=Hash.new
class BindingWraper
def run(code)
    return eval(code, $__bind)
end
def set(name, value)
    $__vars[name]=value
end
end
BindingWraper.new
`)
    ruby.eval = (source) => {
        const split = '3a37a8a6a648c6fae10319c248b4601d'
        let res = ruby.binding.call('run', ruby.vm.eval(`query = <<-'${split}'\n${source}\n${split}\nquery`))
        if (res.toJS()) {
            res = res.toJS()
        }
        if (res?.constructor?.name === 'RbValue') {
            res.toText = res.toString
        }
        return res
    }
    ruby.define = (name, f) => {
        ruby.binding.call('set', ruby.vm.eval(`${JSON.stringify(name)}`), ruby.vm.wrap({ run: f }))
        ruby.eval(`def ${name}(*args)
            $__vars["${name}"].run(*args)
        end`)
    }
    return ruby
};