

function getName(name: string) {
    return name.replace(/^Heol |^Y |^Y Heol/, '')
}

export function streetNameCompare(left: string, right: string) {
    const a = getName(left)
    const b = getName(right)
    return (a > b) ? 1 : (b > a) ? -1 : 0
}

export function compareStreet(left: string, right: string) {
    if (left > right) {
        return 1
    }
    if (right > left) {
        return -1
    }
    return 0
}


function promoteSort(text: string) {
    if (text === 'Unassigned') {
        return 'A'
    }
    if (text == 'Unknown') {
        return 'AA'
    }

    if (text === 'Out of Scheme') {
        return 'AAA'
    }
    return text
}

export function compareGroup(left: string, right: string) {
    const a = promoteSort(left)
    const b = promoteSort(right)

    return a > b ? 1 : b > a ? -1 : 0
}