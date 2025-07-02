import he from 'he'
import { JSDOM } from 'jsdom'

export function sanitizeAndFixHtml(rawHtml: string): string {
    let decoded = he.decode(rawHtml)

    decoded = decoded.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')

    decoded = decoded.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, cssContent) => {
        const fixedCss = fixCssBraces(cssContent)
        return `<style>${fixedCss}</style>`
    })

    const dom = new JSDOM(decoded)
    const document = dom.window.document

    const allElements = document.querySelectorAll('*')
    allElements.forEach(el => {
        ;[...el.attributes].forEach(attr => {
            if (/^on/i.test(attr.name)) {
                el.removeAttribute(attr.name)
            }
        })
    })

    return document.body.innerHTML
}

function fixCssBraces(css: string): string {
    const openBraces = (css.match(/{/g) || []).length
    const closeBraces = (css.match(/}/g) || []).length
    const diff = openBraces - closeBraces
    if (diff > 0) {
        return css + '}'.repeat(diff)
    }
    return css
}
