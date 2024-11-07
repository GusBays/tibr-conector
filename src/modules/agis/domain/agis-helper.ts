export function toFloat(value: any): number {
    const number = +value

    if (Number.isNaN(number)) return parseFloat(value.replace(',', '.'))
    else return parseFloat(value)
}
