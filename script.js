// Elementos del DOM
const elts = {
    text1: document.getElementById("text1"),
    text2: document.getElementById("text2")
};

// Rutas de SVGs
const svgPaths = [
    "svgs/Sin título-1-01.svg", "svgs/Sin título-1-02.svg",
    "svgs/Sin título-1-03.svg", "svgs/Sin título-1-04.svg",
    "svgs/Sin título-1-05.svg", "svgs/Sin título-1-06.svg",
    "svgs/Sin título-1-07.svg", "svgs/Sin título-1-08.svg",
    "svgs/Sin título-1-09.svg", "svgs/Sin título-1-10.svg",
    "svgs/Sin título-1-11.svg", "svgs/Sin título-1-12.svg",
    "svgs/Sin título-1-13.svg", "svgs/Sin título-1-14.svg",
    "svgs/Sin título-1-15.svg", "svgs/Sin título-1-16.svg",
    "svgs/Sin título-1-17.svg", "svgs/Sin título-1-18.svg",
    "svgs/Sin título-1-19.svg", "svgs/Sin título-1-20.svg",
    "svgs/Sin título-1-21.svg", "svgs/Sin título-1-22.svg",
    "svgs/Sin título-1-23.svg", "svgs/Sin título-1-24.svg",
    "svgs/Sin título-1-25.svg", "svgs/Sin título-1-26.svg",
    "svgs/Sin título-1-27.svg", "svgs/Sin título-1-28.svg",
    "svgs/Sin título-1-29.svg", "svgs/Sin título-1-30.svg",
    "svgs/Sin título-1-31.svg"
];

// Configuración
const morphTime = 1;
const cooldownTime = 0.25;
let svgIndex = svgPaths.length - 1;
let time = new Date();
let morph = 0;
let cooldown = cooldownTime;
let animationFrameId = null;

// Caché simple para SVGs
const svgCache = {};

// Función para cargar SVG
function loadSVG(element, path) {
    if (svgCache[path]) {
        element.innerHTML = svgCache[path];
        return Promise.resolve();
    }
    
    return fetch(path)
        .then(response => response.text())
        .then(data => {
            svgCache[path] = data;
            element.innerHTML = data;
        })
        .catch(error => console.error("Error loading SVG:", error));
}

// Cargar SVGs iniciales
loadSVG(elts.text1, svgPaths[svgIndex % svgPaths.length]);
loadSVG(elts.text2, svgPaths[(svgIndex + 1) % svgPaths.length]);

// Función de morphing
function doMorph() {
    morph -= cooldown;
    cooldown = 0;
    
    let fraction = morph / morphTime;
    if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
    }
    
    setMorph(fraction);
}

// Aplicar el efecto morphing
function setMorph(fraction) {
    // Cálculos para el blur
    const blur2 = Math.min(8 / Math.max(fraction, 0.01) - 8, 100);
    const blur1 = Math.min(8 / Math.max(1 - fraction, 0.01) - 8, 100);
    
    // Aplicar estilos con transición suave
    elts.text2.style.filter = `blur(${blur2}px)`;
    elts.text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
    
    elts.text1.style.filter = `blur(${blur1}px)`;
    elts.text1.style.opacity = `${Math.pow(1 - fraction, 0.4) * 100}%`;
}

// Estado de enfriamiento entre animaciones
function doCooldown() {
    morph = 0;
    
    // Aplicar estados directamente
    elts.text2.style.filter = "";
    elts.text2.style.opacity = "100%";
    elts.text1.style.filter = "";
    elts.text1.style.opacity = "0%";
}

// Precargar el siguiente SVG
function preloadNextSVG() {
    const nextPath = svgPaths[(svgIndex + 2) % svgPaths.length];
    
    if (!svgCache[nextPath]) {
        fetch(nextPath)
            .then(response => response.text())
            .then(data => {
                svgCache[nextPath] = data;
            })
            .catch(error => console.error("Error preloading SVG:", error));
    }
}

// Función principal de animación
function animate() {
    animationFrameId = requestAnimationFrame(animate);
    
    const newTime = new Date();
    const shouldIncrementIndex = cooldown > 0;
    const dt = (newTime - time) / 1000;
    time = newTime;
    
    cooldown -= dt;
    
    if (cooldown <= 0) {
        if (shouldIncrementIndex) {
            // Incrementar índice y actualizar SVGs
            svgIndex++;
            
            // Actualizar el contenido de los SVGs
            loadSVG(elts.text1, svgPaths[svgIndex % svgPaths.length]);
            loadSVG(elts.text2, svgPaths[(svgIndex + 1) % svgPaths.length]);
            
            // Precargar el siguiente SVG
            preloadNextSVG();
        }
        doMorph();
    } else {
        doCooldown();
    }
}

// Iniciar animación
animate();

// Limpieza para evitar memory leaks
function cleanup() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

window.addEventListener('unload', cleanup);
