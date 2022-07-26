export function Pixel(REM) {    
    return REM * Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize);
}

export function Polar(Cartesian) {
    const [x, y] = Cartesian;
    const radius = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    return {
        radius,
        angle,
    };
}
