/**
 * Get the value of a CSS variable
 * @param name - The name of the CSS variable with the -- prefix
 * @returns The value of the CSS variable
 */
export const cssVariable = (name:string) => {
    const root = document.querySelector(":root");
    const rootStyle = root ? getComputedStyle(root) : null;

    return rootStyle?.getPropertyValue(name);
}
