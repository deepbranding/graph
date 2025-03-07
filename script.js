const elts = {
    text1: document.getElementById("text1"),
    text2: document.getElementById("text2")
};

// Configuración básica de rutas para GitHub Pages
const getBasePath = () => {
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") return "";
    if (location.hostname.endsWith('github.io')) {
        const pathSegments = location.pathname.split('/');
        if (pathSegments.length > 1 && pathSegments[1]) {
            return '/' + pathSegments[1];
        }
    }
    return "/graph";
};

const basePath = getBasePath();

// Normalización simple de rutas
const normalizePath = (path) => {
    if (path.startsWith('/graph/') || path.startsWith('graph/')) return path;
    return `${basePath}/${path}`;
};

const svgPaths = Array.from({ length: 31 }, (_, i) => `svgs/Sin título-1-${String(i + 1).padStart(2, '0')}.svg`);

// Cache optimizada
const svgCache = {};

// Tiempos de animación
const morphTime = 1;
const cooldownTime = 0.25;

// Variables de estado
let svgIndex = svgPaths.length - 1;
let time = new Date();
let morph = 0;
let cooldown = cooldownTime;
let isAnimating = true;

// Función para codificar rutas de forma segura
const encodePathURI = (path) => path.split('/').map(encodeURIComponent).join('/');

// Carga de SVG optimizada
async function loadSVG(element, index) {
    if (svgCache[index]) {
        element.innerHTML = svgCache[index];
        return;
    }

    const path = normalizePath(svgPaths[index]);
    const encodedPath = encodePathURI(path);

    try {
        const response = await fetch(encodedPath);
        const data = await response.text();
        svgCache[index] = data;
        element.innerHTML = data;
    } catch {
        // SVG de respaldo en caso de error
        const fallbackSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
            <rect width="200" height="100" fill="none" stroke="white" stroke-width="2"/>
        </svg>`;
        element.innerHTML = fallbackSVG;
        svgCache[index] = fallbackSVG;
    }
}

// Animación del morphing
function doMorph() {
    morph -= cooldown;
    cooldown = 0;
    let fraction = morph / morphTime;
    if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
    }

    const isMobile = window.innerWidth < 768;
    const maxBlur = isMobile ? 8 : 16;
    
    const blur1 = Math.min(8 / (1 - fraction) - 8, maxBlur);
    const blur2 = Math.min(8 / fraction - 8, maxBlur);

    elts.text2.style.filter = `blur(${blur2}px)`;
    elts.text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

    elts.text1.style.filter = `blur(${blur1}px)`;
    elts.text1.style.opacity = `${Math.pow(1 - fraction, 0.4) * 100}%`;
}

function doCooldown() {
    morph = 0;
    elts.text2.style.filter = "";
    elts.text2.style.opacity = "100%";
    elts.text1.style.filter = "";
    elts.text1.style.opacity = "0%";
}

// Precarga de SVGs
function preloadNextSVG() {
    const nextIndex = (svgIndex + 2) % svgPaths.length;
    if (!svgCache[nextIndex]) {
        const path = normalizePath(svgPaths[nextIndex]);
        fetch(encodePathURI(path))
            .then(response => response.text())
            .then(data => { svgCache[nextIndex] = data; });
    }
}

// Animación optimizada
function animate() {
    if (!isAnimating) return;
    requestAnimationFrame(animate);

    let newTime = new Date();
    let dt = (newTime - time) / 1000;
    time = newTime;

    cooldown -= dt;

    if (cooldown <= 0) {
        svgIndex++;
        const currentIndex = svgIndex % svgPaths.length;
        const nextIndex = (svgIndex + 1) % svgPaths.length;

        Promise.all([
            loadSVG(elts.text1, currentIndex),
            loadSVG(elts.text2, nextIndex)
        ]).then(preloadNextSVG);

        doMorph();
    } else {
        doCooldown();
    }
}

// Inicialización
function init() {
    document.body.classList.add('loaded');

    const firstIndex = svgIndex % svgPaths.length;
    const secondIndex = (svgIndex + 1) % svgPaths.length;

    Promise.all([
        loadSVG(elts.text1, firstIndex),
        loadSVG(elts.text2, secondIndex)
    ]).then(() => {
        animate();
        preloadNextSVG();
    });
}

// Control de visibilidad
document.addEventListener('visibilitychange', () => {
    isAnimating = !document.hidden;
    if (isAnimating) {
        time = new Date();
        animate();
    }
});

// Iniciar animación
window.addEventListener('load', init);

// Reiniciar en cambio de tamaño
window.addEventListener('resize', () => {
    time = new Date();
});
