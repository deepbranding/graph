const elts = {
    text1: document.getElementById("text1"),
    text2: document.getElementById("text2")
};

let svgPaths = [
    "path1.svg",
    "path2.svg",
    "path3.svg",
    "path4.svg"
];

let morphTime = 1;
let cooldownTime = 0.25;
let svgIndex = 0;
let morph = 0;
let cooldown = cooldownTime;
let isAnimating = true;

let lastFrameTime = performance.now();
const minFrameInterval = 1000 / 30; // Limita a 30 FPS

function loadSVG(element, index) {
    return fetch(normalizePath(svgPaths[index]))
        .then(response => response.text())
        .then(data => {
            element.innerHTML = data;
        })
        .catch(error => console.error("Error loading SVG:", error));
}

function normalizePath(path) {
    let basePath = window.location.origin;
    return `${basePath}/${path}`;
}

function animate() {
    if (!isAnimating) return;
    requestAnimationFrame(animate);

    let newTime = performance.now();
    let dt = newTime - lastFrameTime;
    if (dt < minFrameInterval) return;  // Evita cambios muy rápidos

    lastFrameTime = newTime;
    let shouldIncrementIndex = cooldown > 0;
    cooldown -= dt / 1000;
    
    if (cooldown <= 0) {
        if (shouldIncrementIndex) {
            svgIndex = (svgIndex + 1) % svgPaths.length;
            
            const currentIndex = svgIndex % svgPaths.length;
            const nextIndex = (svgIndex + 1) % svgPaths.length;
            
            Promise.all([
                loadSVG(elts.text1, currentIndex),
                loadSVG(elts.text2, nextIndex)
            ]).then(preloadNextSVG);
        }
        doMorph();
    } else {
        doCooldown();
    }
}

function doMorph() {
    morph -= cooldown;
    cooldown = 0;
    let fraction = morph / morphTime;
    if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
    }

    const isMobile = window.innerWidth < 768;
    const maxBlur = isMobile ? 6 : 16;

    const blur1 = Math.min(8 / (1 - fraction) - 8, maxBlur);
    const blur2 = Math.min(8 / fraction - 8, maxBlur);

    elts.text2.style.filter = `blur(${blur2}px)`;
    elts.text2.style.opacity = `${Math.pow(fraction, 0.4)}`;
    elts.text2.style.mixBlendMode = isMobile ? "lighten" : "normal";

    elts.text1.style.filter = `blur(${blur1}px)`;
    elts.text1.style.opacity = `${Math.pow(1 - fraction, 0.4)}`;
}

function doCooldown() {
    elts.text2.style.filter = "";
    elts.text2.style.opacity = "1";
    elts.text1.style.filter = "";
    elts.text1.style.opacity = "0";
}

function preloadNextSVG() {
    let nextIndex = (svgIndex + 2) % svgPaths.length;
    loadSVG(new Image(), nextIndex);
}

// Iniciar animación
animate();
