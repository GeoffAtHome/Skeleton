
export function getTextColor(h: string) {
    let r = '0', g = '0', b = '0';

    // 3 digits
    if (h.length == 4) {
        r = "0x" + h[1] + h[1];
        g = "0x" + h[2] + h[2];
        b = "0x" + h[3] + h[3];

        // 6 digits
    } else if (h.length == 7) {
        r = "0x" + h[1] + h[2];
        g = "0x" + h[3] + h[4];
        b = "0x" + h[5] + h[6];
    }
    const rv = Number(r) * 0.2126
    const gv = Number(g) * 0.7152
    const bv = Number(b) * 0.0722
    const pl = (rv + gv + bv) / 255

    if (pl > 0.5) {
        return '#000000'
    }
    return '#ffffff'
}