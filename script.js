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

const svgPaths = [
    "svgs/Sin título-1-01.svg", "svgs/Sin título-1-02.svg", "svgs/Sin título-1-03.svg", 
    "svgs/Sin título-1-04.svg", "svgs/Sin título-1-05.svg", "svgs/Sin título-1-06.svg", 
    "svgs/Sin título-1-07.svg", "svgs/Sin título-1-08.svg", "svgs/Sin título-1-09.svg", 
    "svgs/Sin título-1-10.svg", "svgs/Sin título-1-11.svg", "svgs/Sin título-1-12.svg", 
    "svgs/Sin título-1-13.svg", "svgs/Sin título-1-14.svg", "svgs/Sin título-1-15.svg", 
    "svgs/Sin título-1-16.svg", "svgs/Sin título-1-17.svg", "svgs/Sin título-1-18.svg", 
    "svgs/Sin título-1-19.svg", "svgs/Sin título-1-20.svg", "svgs/Sin título-1-21.svg", 
    "svgs/Sin título-1-22.svg", "svgs/Sin título-1-23.svg", "svgs/Sin título-1-24.svg", 
    "svgs/Sin título-1-25.svg", "svgs/Sin título-1-26.svg", "svgs/Sin título-1-27.svg", 
    "svgs/Sin título-1-28.svg", "svgs/Sin título-1-29.svg", "svgs/Sin título-1-30.svg", 
    "svgs/Sin título-1-31.svg"
];

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

// Simplificar la codificación de URI para evitar procesamiento excesivo
function encodePathURI(path) {
    return path.split('/').map(encodeURIComponent).join('/');
}

// Carga de SVG optimizada
function loadSVG(element, index) {
    if (svgCache[index]) {
        element.innerHTML = svgCache[index];
        return Promise.resolve();
    }
    
    const path = normalizePath(svgPaths[index]);
    const encodedPath = encodePathURI(path);
    
    return fetch(encodedPath)
        .then(response => response.text())
        .then(data => {
            svgCache[index] = data;
            element.innerHTML = data;
        })
        .catch(() => {
            // SVG de respaldo simple sin texto
            const fallbackSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
                <rect width="200" height="100" fill="none" stroke="white" stroke-width="2"/>
            </svg>`;
            element.innerHTML = fallbackSVG;
            svgCache[index] = fallbackSVG;
        });
}

// Optimizar la transición morph para móviles
function doMorph() {
    morph -= cooldown;
    cooldown = 0;
    let fraction = morph / morphTime;
    if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
    }
    
    // Usar valores más bajos de blur para mejor rendimiento en móviles
    const isMobile = window.innerWidth < 768;
    const maxBlur = isMobile ? 8 : 16;
    
    // Aplicar el efecto de morphing con valores adaptados a dispositivos
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

// Pre-carga mínima para mejorar la fluidez
function preloadNextSVG() {
    const nextIndex = (svgIndex + 2) % svgPaths.length;
    if (!svgCache[nextIndex]) {
        const path = normalizePath(svgPaths[nextIndex]);
        fetch(encodePathURI(path))
            .then(response => response.text())
            .then(data => { svgCache[nextIndex] = data; });
    }
}

// Función de animación optimizada
function animate() {
    if (!isAnimating) return;
    
    requestAnimationFrame(animate);
    
    let newTime = new Date();
    let shouldIncrementIndex = cooldown > 0;
    let dt = (newTime - time) / 1000;
    time = newTime;
    
    cooldown -= dt;
    
    if (cooldown <= 0) {
        if (shouldIncrementIndex) {
            svgIndex++;
            
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

// Inicialización simplificada
function init() {
    // Ocultar indicador de carga si existe
    const loadingElement = document.getElementById('loading');
    if (loadingElement) loadingElement.style.display = 'none';
    
    // Agregar clase loaded al body
    document.body.classList.add('loaded');
    
    // Cargar los primeros dos SVGs
    const firstIndex = svgIndex % svgPaths.length;
    const secondIndex = (svgIndex + 1) % svgPaths.length;
    
    Promise.all([
        loadSVG(elts.text1, firstIndex),
        loadSVG(elts.text2, secondIndex)
    ]).then(() => {
        // Iniciar animación
        animate();
        // Precargar el siguiente
        preloadNextSVG();
    });
}

// Control de visibilidad para pausar cuando no es visible
document.addEventListener('visibilitychange', function() {
    isAnimating = !document.hidden;
    if (isAnimating) {
        time = new Date();
        animate();
    }
});

// Iniciar todo
window.addEventListener('load', init);

// Optimización para dispositivos móviles
window.addEventListener('resize', function() {
    // Reiniciar la animación si cambia el tamaño de la ventana
    time = new Date();
});
