// @ts-check

import fs from "fs"
import path from "path"
import figma from "../theme/figma.json" with {type: "json"}

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const [{
    color:paletteLight
}, {
    color:paletteDark
}] = figma[0].values

makePalettes(paletteLight, "light", ":root")
makePalettes(paletteDark, "dark", "html.dark")

function getValue(color, colorIndex) {
    if (color.var.startsWith("base-color-palette/")) {
        return `$base-${color.var.split("/").pop()}`
    }

    // if the value of the color has 8 hexadecimal it has an alpha channel
    // we therefore extract the color and compare it with the values in the base palette
    if (color.value.length === 9) {
        const alpha = Math.round(parseInt(color.value.slice(7), 16) / 2.55) / 100
        const baseColor = color.value.slice(0, 7)
        const baseColorName = colorIndex[baseColor]
        if(baseColorName){
            return `rgba($base-${baseColorName}, ${alpha})`
        }
    }
    return color.value
}

/**
 *
 * @param {Array<{name:string, value:string, var:string }>} themeColors
 * @returns
 */
function getVariableScss(themeColors, colorIndex) {
    let prevCategory = null
    const cssVariableNames = {}
    const content = themeColors.map(c => {
        const currentCategory = c.name.replace(/^ks\//, "").split("-")[0]
        const val = getValue(c, colorIndex)
        const categoryTitle = currentCategory !== prevCategory ? `\n\t/* ${currentCategory} */\n` : ""
        cssVariableNames[currentCategory] = cssVariableNames[currentCategory] || []
        const varName = c.name.replace(/\//g, "-")
        cssVariableNames[currentCategory].push(varName)
        prevCategory = currentCategory
        return `${categoryTitle}\t#{--${varName}}: ${val};`
    })

    return {tokenScss: content.join("\n").trim(), cssVariableNames}
}

/**
 *
 * @param {Array<{name:string, value:string, var:string}>} palette
 * @param {string} paletteName
 * @param {string} selector
 */
function makePalettes(palette, paletteName, selector) {
    const baseColorNames = palette.filter(c => c.name.startsWith("base-color-palette/"))
    const colorIndex = baseColorNames.reduce((acc, color) => {
        acc[color.value] = color.name.split("/").pop()
        return acc
    }, {})

    const scss = baseColorNames.map(color => `$base-${color.name.split("/").pop()}: ${color.value};`).join("\n")

    // write the scss file containing colors in the base palette
    fs.writeFileSync(path.resolve(__dirname, "../src/scss/color-palette.scss"), scss, {encoding: "utf-8"})

    const {tokenScss, cssVariableNames} = getVariableScss(palette.filter(c => !c.name.startsWith("base-color-palette/")), colorIndex)

    // write the scss file containing colors in the token palette
    fs.writeFileSync(path.resolve(__dirname, `../src/scss/ks-theme-${paletteName}.scss`), `@import "./color-palette.scss";\n\n${selector}{\n\t${tokenScss}\n}`, {encoding: "utf-8"})

    // write the css variables into an index for theme documentation
    // NOTE: we assume that all themes will have the same variables and write the same file over and over
    fs.writeFileSync(path.resolve(__dirname, "../theme/css-variables.json"), JSON.stringify(cssVariableNames, null, 2), {encoding: "utf-8"})
}