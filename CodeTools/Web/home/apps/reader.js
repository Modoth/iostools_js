const sleep = (timeout) => new Promise(resolve => setTimeout(resolve, timeout))
export class ToolApp {
    constructor(args) {
        /**@type {HTMLElement}*/
        this.container
        Object.assign(this, args)
        this.booksRoot = '../docs/'
        this.style = document.createElement('style')
        this.hightlightStyle = document.createElement('link')
        this.hightlightStyle.rel = 'stylesheet'
        this.hightlightStyle.href = './apps/libs/highlight.default.min.css'
        this.bookPanel = document.createElement('div')
        this.bookPanel.classList.add('book-panel')
        this.container.appendChild(this.style)
        this.container.appendChild(this.hightlightStyle)
        this.container.appendChild(this.bookPanel)
        this.container.addEventListener('click', (event) => {
            if (event.target.className === 'runBtn' && event.target.nextElementSibling?.innerText) {
                this.executeSnips(event.target.nextElementSibling.innerText)
            }
        })
    }

    getExts(shellName) {
        switch (shellName) {
            case 'ruby':
                return ['ruby', 'rb']
            default:
                return []
        }
    }

    async openChapterByUrl(url) {
        return await this.openChapter({ url, title: '', type: url.match(/\.[^.]*$/)?.[0]?.slice(1) })
    }

    async init({ shellName }) {
        await import("./libs/marked.min.js")
        await import("./libs/highlight.min.js")
        window.openChapter = (chapter) => {
            if (!this.book?.chapter) {
                return
            }
            const url = new URL(chapter, this.book.chapter.url).href
            this.openChapterByUrl(url)
        }
        marked.setOptions({
            renderer: new marked.Renderer(),
            highlight: function (code, lang) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                const h = hljs.highlight(code, { language }).value;
                return `<div class="code"><span class="runBtn">▶️</span><span>${h}</span></div>`
            },
            langPrefix: 'hljs language-', // highlight.js css expects a top-level 'hljs' class.
            pedantic: false,
            gfm: true,
            breaks: false,
            sanitize: false,
            smartypants: false,
            xhtml: false
        });
        marked.use({
            renderer: {
                link: (href, title, text) => {
                    return `<a onclick='window.openChapter(${JSON.stringify(href)})'>${title || text}</a>`
                }
            }
        })
        const exts = this.getExts(shellName)
        this.exts = new Set(exts)
        const cssStr = exts.map(ext => `code.language-${ext} .code .runBtn{
            display: unset;
        }
        `).join('\n')
        this.style.innerHTML = cssStr
    }

    async openChapter(chapter) {
        try {
            const txt = await (await fetch(chapter.url)).text()
            switch (chapter.type) {
                case 'md':
                case 'markdown':
                    await this.openMarkdownFile(txt)
                    break
                default:
                    return [false, `不支持文件类型: ${chapter.type || ''}`]
            }
        }
        catch (e) {
            return [false, '打开失败']
        }
        if (!this.book) {
            this.book = { histories: [], index: [] }
        }
        this.book.chapter = chapter
        if (this.book.histories[this.book.histories.length - 1]?.url !== chapter.url) {
            this.book.histories.push(chapter)
        }
        this.bookPanel.scrollTo({ top: 0, behavior: 'instant' })
        return [true, chapter.title]
    }

    async openChapterById(id) {
        if (!this.book) {
            return [false, '未打开文件']
        }
        const chapter = this.book.index[id] || this.book.index[0]
        if (!chapter) {
            return [true, '内容为空']
        }
        return await this.openChapter(chapter)
    }

    async openMarkdownFile(md) {
        this.bookPanel.innerHTML = marked.parse(md)
    }

    async $githubopen(desc, apiName, path, ...args) {
        if (desc || path === undefined || path === null || args.length) {
            return [false, `打开Github文件\n签名 ${apiName}(<path>)\n`]
        }
        const url = `https://raw.githubusercontent.com/${path}/master/README.md`
        return await this.openChapterByUrl(url)
    }

    async $urlopen(desc, apiName, url, ...args) {
        if (desc || url === undefined || url === null || args.length) {
            return [false, `打开URL\n签名 ${apiName}(<url>)\n`]
        }
        return await this.openChapterByUrl(url)
    }

    async $open(desc, apiName, name, ...args) {
        if (desc || name === undefined || name === null || args.length) {
            return [false, `打开文件\n签名 ${apiName}(<name>)\n`]
        }
        const root = new URL(this.booksRoot + name + '/', window.location.href).href
        const indexUrl = new URL('index.txt', root).href
        let indexStr = undefined
        try {
            indexStr = await (await fetch(indexUrl)).text()
        }
        catch (e) {
            return [false, '打开失败']
        }
        let index = []
        let i = 1
        for (let line of indexStr.split('\n').map(l => l.trim()).filter(l => l)) {
            const tokens = line.split(';')
            const file = tokens.pop()
            const title = tokens.pop()
            const level = tokens.length
            if (file && title) {
                index.push({ i, title, url: new URL(file, root).href, level, type: file.match(/\.[^.]*$/)?.[0]?.slice(1) })
            }
            i++
        }

        this.book = { index, root, histories: [] }

        if (!index.length) {
            return [true, '内容为空']
        }
        return await this.openChapterById(0)
    }

    async $jump(desc, apiName, id, ...args) {
        id = parseInt(id)
        if (desc || !(id > 0) || args.length) {
            return [false, `跳到章节\n签名 ${apiName}(<id>)\n`]
        }
        if (!this.book) {
            return [false, '未打开文件']
        }
        return await this.openChapterById(id - 1)
    }

    async $list(desc, apiName, ...args) {
        if (desc || args.length) {
            return [false, `列出章节\n签名 ${apiName}()\n`]
        }
        if (!this.book) {
            return [false, '未打开文件']
        }
        return [true, this.book.index.map(({ i, title, level }) => `${i.toString().padStart(5)}.  ${'  '.repeat(level)}${title}`).join('\n')]
    }

    async $back(desc, apiName, ...args) {
        if (desc || args.length) {
            return [false, `返回上一章节\n签名 ${apiName}()\n`, [{ icon: '←' }]]
        }
        if (!this.book) {
            return [false, '未打开文件']
        }
        if (this.book.histories.length < 2) {
            return [false]
        }
        this.book.histories.pop()
        return await this.openChapter(this.book.histories[this.book.histories.length - 1])
    }
}