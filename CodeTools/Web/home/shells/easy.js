export const loadShell = async () => {
    const { EasyLang } = await import('../../easylang/easylang.js')
    return new EasyLang()
}