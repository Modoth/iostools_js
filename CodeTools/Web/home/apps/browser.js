const sleep = (timeout) => new Promise(resolve => setTimeout(resolve, timeout))
export class ToolApp {
    constructor(args) {
        Object.assign(this, args)
        this.iframe = document.createElement('iframe')
        this.iframe.classList.add('browser-iframe')
        this.container.appendChild(this.iframe)
        this.setIframeSrc('https://www.bing.com/')
    }

    async setIframeSrc(url) {
        if (!url.match(/\w+:\/\//)) {
            if (url.startsWith('.')) {
                url = new URL(url, window.location.href).href
            } else {
                url = 'https://' + url
            }
        }
        this.url = url
        const task = new Promise(resolve => {
            this.iframe.onload = (e) => {
                resolve(this.iframe.title)
            }
        })
        this.iframe.src = this.url
        return await task
    }

    async $load(desc, apiName, url, ...args) {
        if (desc || url === undefined || url === null || args.length) {
            return [false, `加载网页\n签名 ${apiName}(<url>)\n`]
        }
        return [true, await this.setIframeSrc(url)]
    }

    async $search(desc, apiName, keyword, ...args) {
        if (desc || keyword === undefined || keyword === null || args.length) {
            return [false, `搜索\n签名 ${apiName}(<keyword>)\n`]
        }
        return [true, await this.setIframeSrc(`https://www.bing.com/search?q=${encodeURIComponent(keyword)}`)]
    }

    async $refresh(desc, apiName, ...args) {
        if (desc || args.length) {
            return [false, `刷新网页\n签名 ${apiName}()\n`]
        }
        return [true, await this.setIframeSrc(this.url)]
    }

    async $back(desc, apiName, ...args) {
        if (desc || args.length) {
            return [false, `后退\n签名 ${apiName}()\n`]
        }
        try {
            this.iframe.contentWindow.history.back()
            return [true]
        }
        catch {
            return [false]
        }
    }

    async $forward(desc, apiName, ...args) {
        if (desc || args.length) {
            return [false, `前进\n签名 ${apiName}()\n`]
        }
        try {
            this.iframe.contentWindow.history.forward()
            return [true]
        }
        catch {
            return [false]
        }
    }
}