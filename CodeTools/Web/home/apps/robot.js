const sleep = (timeout) => new Promise(resolve => setTimeout(resolve, timeout))
export class ToolApp {
    constructor(args) {
        /**@type {HTMLDivElement} */
        this.container
        Object.assign(this, args)
        addEventListener('resize', this.resize.bind(this))
        this.name = '编程机器人'
        this.welcome = `使用loadNext加载关卡，help获取帮助`
        this.levels = {
            "关卡1": [
                "00000000000",
                "011121211_0",
                "01______1_0",
                "021_01111_0",
                "0_1_01__1_0",
                "0_1_01__1_0",
                "0_1_0$__1_0",
                "0_211v121_0",
                "0____1____0",
                "0____1____0",
                "0____111110",
                "00000000000",
            ],
            "关卡2": [
                "00000000000",
                "0>________0",
                "01______1_0",
                "021_11111_0",
                "0_1_1___1_0",
                "0_1_1___1_0",
                "0_1_____1_0",
                "0_2112111_0",
                "0_1__1____0",
                "0_1__1____0",
                "0_1111111<0",
                "00000000000",
            ]
        }
    }

    async loadLevel(name) {
        const diffLevel = name !== this.level?.name
        const levelData = this.levels[name]
        this.container.innerHTML = ''
        const panelWaper = document.createElement('div')
        panelWaper.classList.add('panel-wraper')
        const panel = document.createElement('div')
        panel.classList.add('panel')
        panelWaper.appendChild(panel)
        const width = levelData[0].length
        const height = levelData.length
        const cellSize = this.calculateCellSize({ width, height })
        this.container.style.setProperty('--cell-size', `${cellSize}px`)
        const cells = []
        let start, end, direction
        const directions = ['^', '>', 'v', '<']
        const directionMap = new Map(directions.map((d, i) => [d, i]))
        for (let y = 0; y < height; y++) {
            const row = []
            cells.push(row)
            const rowEle = document.createElement('div')
            rowEle.classList.add('row')
            for (let x = 0; x < width; x++) {
                const cellEle = document.createElement('div')
                cellEle.classList.add('cell')
                const cell = { x, y, cellEle }
                row.push(cell)
                const c = levelData[y]?.[x]
                rowEle.appendChild(cellEle)
                switch (c) {
                    case '0':
                        cellEle.classList.add('wall')
                        cell.wall = true
                        break
                    case '2':
                        cellEle.classList.add('road-block')
                        cell.roadBlock = true
                    case '1':
                    case '>':
                    case '<':
                    case '^':
                    case 'v':
                    case '$':
                        cellEle.classList.add('road')
                        cell.road = true
                        break
                    default:
                        continue
                }
                const bg = document.createElement('div')
                bg.classList.add('bg')
                cellEle.appendChild(bg)
                if (directionMap.has(c)) {
                    start = cell
                    cell.start = true
                    cell.cellEle.classList.add('start')
                    direction = directionMap.get(c)
                }
                if (c === '$') {
                    end = cell
                    cell.end = true
                    cell.cellEle.classList.add('end')
                }

            }
            panel.appendChild(rowEle)
        }
        const robotEle = document.createElement('robot')
        robotEle.classList.add('robot')
        panel.appendChild(robotEle)
        const robot = { robotEle }
        this.level = { cells, width, height, start, end, cellSize, robot, directions, name, panelWaper }
        this.updateRobotPos(start)
        this.updateRobotDirection(direction, direction)
        this.container.appendChild(panelWaper)
        await this.sessionStart?.(diffLevel)
    }

    calculateCellSize({ width, height }) {
        const style = window.getComputedStyle(this.container)
        const cellSize = Math.floor(Math.min(parseInt(style.width) / width, parseInt(style.height) / height))
        return Math.min(cellSize, 30)
    }

    async resize() {
        if (!this.level) {
            return
        }
        this.level.robot.robotEle.classList.add('no-animation')
        const cellSize = this.calculateCellSize(this.level)
        this.container.style.setProperty('--cell-size', `${cellSize}px`)
        this.level.cellSize = cellSize
        this.updateRobotPos(this.level.robot.position)
        await sleep(50)
        this.level.robot.robotEle.classList.remove('no-animation')
    }

    updateRobotPos(position, disableAnimation) {
        const { cells, start, end, cellSize, robot } = this.level
        robot.position = position
        const { x, y } = position
        const top = y * cellSize
        const left = x * cellSize
        this.level.robot.robotEle.style.setProperty('--robot-top', `${top}px`)
        this.level.robot.robotEle.style.setProperty('--robot-left', `${left}px`)
    }

    updateRobotDirection(direction, dir) {
        const { robot } = this.level
        robot.direction = direction
        robot.dir = dir
        robot.robotEle.style.setProperty('transform', `rotate(${direction * 90}deg)`)
    }

    async updateStatus(finished) {
        this.level.finished = finished
        this.level.robot.robotEle.classList.add('died')
        this.level.panelWaper.classList.add('finished')
        await this.sessionStop?.(finished === '成功')
        return this.level.finished
    }

    checkStatus() {
        if (!this.level) {
            return [false, '未开始']
        }
        if (this.level.finished) {
            return [false, '已结束']
        }
    }

    getDxy() {
        return [[0, -1], [1, 0], [0, 1], [-1, 0]][this.level.robot.dir]
    }

    $levels(desc, apiName, ...args) {
        if (desc || args.length) {
            return [false, `列出所有关卡\n签名: ${apiName}()\n`]
        }
        return Object.keys(this.levels).map((name, idx) => `${idx.toString().padStart(4)}\t${name}`).join('\n')
    }

    async $loadNext(desc, apiName, ...args) {
        if (desc || args.length) {
            return [false, `加载下一关卡\n签名 ${apiName}()\n`]
        }
        const levelNames = Object.keys(this.levels)
        const idx = (levelNames.findIndex(n => n === this.level?.name) + 1) % levelNames.length
        const name = levelNames[idx]
        await this.loadLevel(name)
        return [true, this.level.name]
    }

    async $load(desc, apiName, nameOrIdx, ...args) {
        if (desc || nameOrIdx === undefined || nameOrIdx === null || args.length) {
            return [false, `加载关卡\n签名 ${apiName}(<levelName|levelIdx>)\n`]
        }
        const idx = nameOrIdx * 1
        const name = isNaN(idx) ? nameOrIdx : Object.keys(this.levels)[idx]
        if (!this.levels[name]) {
            return [false, `无此关卡\n`]
        }
        await this.loadLevel(name)
        return [true, this.level.name]
    }

    async $restart(desc, apiName, ...args) {
        if (desc || args.length) {
            return [false, `重新启动关卡\n签名 ${apiName}()\n`]
        }
        if (!this.level) {
            return await this.$loadNext()
        }
        await this.loadLevel(this.level.name)
        return [true, this.level.name]
    }

    async $move(desc, apiName, ...args) {
        if (desc || args.length) {
            return [false, `移动\n签名 ${apiName}()\n`, [{ icon: '↑' }]]
        }
        const error = this.checkStatus()
        if (error) {
            return error
        }
        const { robot, cells } = this.level
        let { x, y } = robot.position
        const [dx, dy] = this.getDxy()
        const target = cells[y + dy]?.[x + dx]
        if (!target) {
            return [false, await this.updateStatus('失败')]
        }
        if (target.wall) {
            return [true, [robot.position.x, robot.position.y]]
        }
        if (!target.road || target.roadBlock) {
            return [false, await this.updateStatus('失败')]
        }
        this.updateRobotPos(target)
        await sleep(500)
        return [true, [robot.position.x, robot.position.y]]
    }

    async $jump(desc, apiName, ...args) {
        if (desc || args.length) {
            return [false, `跳跃\n签名 ${apiName}()\n`, [{ icon: '⌢' }]]
        }
        const error = this.checkStatus()
        if (error) {
            return error
        }
        const { robot, cells } = this.level
        let { x, y } = robot.position
        const [dx, dy] = this.getDxy()
        const middle = cells[y + dy]?.[x + dx]
        if (middle?.wall) {
            return [true, [robot.position.x, robot.position.y]]
        }
        if (!middle?.roadBlock) {
            return [false, await this.updateStatus('失败')]
        }
        const target = cells[y + 2 * dy]?.[x + 2 * dx]
        if (target?.wall) {
            return [true, [robot.position.x, robot.position.y]]
        }
        if (!target.road || target.roadBlock) {
            return [false, await this.updateStatus('失败')]
        }
        this.updateRobotPos(target)
        await sleep(500)
        return [true, [robot.position.x, robot.position.y]]
    }

    async $turn(desc, apiName, d, ...args) {
        d = parseInt(d)
        const ds = [-1, 1, 2]
        const dSet = new Set(ds)
        if (desc || !dSet.has(d) || args.length) {
            return [false, `转向\n签名 ${apiName}(<dir=${ds.join('|')})\n`, [{ icon: '←', args: [-1] }, { icon: '→', args: [1] }]]
        }
        const error = this.checkStatus()
        if (error) {
            return error
        }
        const { robot, directions } = this.level
        const dirCount = directions.length
        const direction = robot.direction + d
        const dir = (robot.dir + d + dirCount) % dirCount
        this.updateRobotDirection(direction, dir)
        await sleep(500)
        return [true, robot.dir]
    }

    async $action(desc, apiName, ...args) {
        if (desc || args.length) {
            return [false, `行动\n签名 ${apiName}()\n`, [{ icon: '◎' }]]
        }
        const error = this.checkStatus()
        if (error) {
            return error
        }
        const { robot, end } = this.level
        if (robot.position === end) {
            return [true, await this.updateStatus('成功')]
        } else {
            return [false, await this.updateStatus('失败')]
        }
    }
}
