const sleep = (timeout) => new Promise(resolve => setTimeout(resolve, timeout))
export class ToolApp {
    constructor(args) {
        Object.assign(this, args)
        addEventListener('resize', this.resize.bind(this))
        this.ledsPanel = document.createElement('div')
        this.ledsPanel.classList.add('leds-panel')
        this.container.appendChild(this.ledsPanel)
    }

    async installLeds(width, height, lightRemain) {
        const leds = []
        this.level = { width, height, leds, lightRemain }
        this.updateCellSize()
        this.ledsPanel.innerHTML = ''
        const ledsEle = document.createElement('div')
        ledsEle.classList.add('leds')
        for (let y = 0; y < height; y++) {
            const lineEle = document.createElement('div')
            lineEle.classList.add('line')
            ledsEle.appendChild(lineEle)
            const line = []
            leds.push(line)
            for (let x = 0; x < width; x++) {
                const ele = document.createElement('div')
                ele.classList.add('led')
                const lightEle = document.createElement('div')
                lightEle.classList.add('light')
                ele.appendChild(lightEle)
                lineEle.appendChild(ele)
                const led = { x, y, color: 0, ele }
                line.push(led)
            }
        }
        this.ledsPanel.appendChild(ledsEle)
    }

    updateCellSize() {
        const { width, height } = this.level
        const style = window.getComputedStyle(this.container)
        let cellSize = Math.floor(Math.min(parseInt(style.width) / width, parseInt(style.height) / height))
        cellSize = Math.min(cellSize, 30)
        this.container.style.setProperty('--cell-size', `${cellSize}px`)
    }

    async resize() {
        if (!this.level) {
            return
        }
        this.container.classList.add('no-animation')
        this.updateCellSize()
        await sleep(50)
        this.container.classList.remove('no-animation')
        this.ledsPanel
    }

    updateLed(led, color) {
        led.color = color
        led.ele.className = `led led-${led.color}`
        if (!color || !(this.level.lightRemain > 0)) {
            return
        }
        let offToken = {}
        led.offToken = offToken
        if (led.timeout !== undefined) {
            window.clearTimeout(led.timeout)
        }
        led.timeout = setTimeout(() => {
            led.timeout = undefined
            if (offToken === led.offToken) {
                this.updateLed(led, 0)
            }
        }, this.level.lightRemain);
    }

    async turnLed(x, y, color) {
        let led = this.level.leds[y]?.[x]
        if (!led) {
            return
        }
        this.updateLed(led, color)
        return led
    }

    getCharBitmap(char, width, height) {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const fontSize = Math.floor(canvas.width * 1)
        const ctx = canvas.getContext('2d')
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        ctx.font = ` ${fontSize}px sans-serif`
        ctx.fillStyle = "#ff0000";
        ctx.fillText(char, canvas.width / 2, canvas.height / 2)
        const bitmap = []
        const images = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        for (let j = 0; j < width; j++) {
            bitmap[j] = []
            for (let i = 0; i < width; i++) {
                bitmap[j][i] = images[4 * (j * canvas.width + i)] === 255
            }
        }
        return bitmap
    }

    async printChar(char, color, x, y, width, height) {
        let range = { char, x, y, width, height }
        const bitmap = this.getCharBitmap(char, width, height)
        for (let j = 0; j < height; j++) {
            const cy = y + j
            if (cy >= this.level.height) {
                break
            }
            for (let i = 0; i < width; i++) {
                const cx = x + i
                if (cx >= this.level.width) {
                    break
                }
                const led = this.level.leds[cy][cx]
                this.updateLed(led, bitmap[j][i] ? color : 0)
            }
        }
        return range
    }

    async fill(color, x, y, width, height) {
        for (let j = 0; j < height; j++) {
            const cy = y + j
            if (cy >= this.level.height) {
                break
            }
            for (let i = 0; i < width; i++) {
                const cx = x + i
                if (cx >= this.level.width) {
                    break
                }
                const led = this.level.leds[cy][cx]
                this.updateLed(led, color)
            }
        }
    }

    async $install(desc, apiName, width, height, lightRemain, ...args) {
        const def = { lightRemain: 0, width: 20, height: 20 }
        width = width === undefined ? def.width : parseInt(width)
        height = height === undefined ? def.height : parseInt(height)
        lightRemain = lightRemain === undefined ? def.lightRemain : parseInt(lightRemain)
        if (desc || !(width > 0 && height > 0 && lightRemain >= 0) || args.length) {
            return [false, `安装\n签名 ${apiName}(<width=${def.width}>,<height${def.height}>,<lightRemain=${def.lightRemain}>)\n`]
        }
        await this.installLeds(width, height, lightRemain)
        return [true, [this.level.width, this.level.height, this.level.lightRemain]]
    }

    async $turn(desc, apiName, x, y, color, ...args) {
        x = parseInt(x)
        y = parseInt(y)
        color = color !== undefined ? parseInt(color) : 1
        if (desc || !(x >= 0 && y >= 0 && color >= 0) || args.length) {
            return [false, `（临时）开关\n签名 ${apiName}(<x>,<y>,<color=0...4>)\n`]
        }
        if (!this.level) {
            return [false, '未安装']
        }
        let led = await this.turnLed(x, y, color)
        if (!led) {
            return [false, '无此灯或颜色']
        }
        return [true, [led.x, led.y, led.color]]
    }

    async $print(desc, apiName, char, color, x, y, width, height, ...args) {
        x = x !== undefined ? parseInt(x) : 0
        y = y !== undefined ? parseInt(y) : 0
        color = color !== undefined ? parseInt(color) : 1
        width = width !== undefined ? parseInt(width) : this.level?.width
        height = height !== undefined ? parseInt(height) : this.level?.height
        if (desc || !(x >= 0 && y >= 0 && color >= 0 && width > 0 && height > 0 && (char?.length === 1)) || args.length) {
            return [false, `打印字符\n签名 ${apiName}(<char>,<color=1><x=0>,<y=0>,<width=WIDTH>,<height=HEIGHT>)\n`]
        }
        if (!this.level) {
            return [false, '未安装']
        }
        let range = await this.printChar(char, color, x, y, width, height)
        if (!range) {
            return [false, '颜色或位置或大小非法']
        }
        return [true, [range.x, range.y]]
    }

    async $fill(desc, apiName, color, x, y, width, height, ...args) {
        x = x !== undefined ? parseInt(x) : 0
        y = y !== undefined ? parseInt(y) : 0
        color = color !== undefined ? parseInt(color) : 1
        width = width !== undefined ? parseInt(width) : this.level?.width
        height = height !== undefined ? parseInt(height) : this.level?.height
        if (desc || !(x >= 0 && y >= 0 && color >= 0 && width > 0 && height > 0) || args.length) {
            return [false, `填充\n签名 ${apiName}(<color=1><x=0>,<y=0>,<width=WIDTH>,<height=HEIGHT>)\n`]
        }
        if (!this.level) {
            return [false, '未安装']
        }
        await this.fill(color, x, y, width, height)
        return [true]
    }
}