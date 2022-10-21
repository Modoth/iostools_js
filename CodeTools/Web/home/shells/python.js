export const loadShell = async ({ write, toolApp }) => {
    await import('../../pyodide/pyodide.js')
    const pyodide = await loadPyodide({
        stdout: (data) => {
            write(data + '\n')
        },
        stderr: (data) => {
            write(data + '\n')
        }
    })
    const packages = ['micropip']
    await Promise.all(packages.map(p => pyodide.loadPackage(p)))
    pyodide.define = (name, f) => {
        pyodide.globals.set(name, f);
    }
    pyodide.eval = async (source) => {
        const load = '#load '
        if (!source.startsWith(load)) {
            return await pyodide.runPythonAsync(source)
        }
        const packages = source.slice(load.length).split(' ').filter(s => s)
        await pyodide.loadPackage(packages)
        if (packages.find(p => p === 'matplotlib')) {
            await pyodide.eval(`import matplotlib\nmatplotlib.use("module://matplotlib_pyodide.html5_canvas_backend")`)
        }
        return []
    }
    return pyodide
}