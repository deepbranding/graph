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
let isMobile = window.innerWidth < 768; // Detección de dispositivo móvil

// Caché de SVGs - Precargar todos los SVGs al inicio
const svgCache = {};
const preloadPromises = [];

// Función para precargar todos los SVGs
function preloadAllSVGs() {
    svgPaths.forEach(path => {
        const promise = fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                svgCache[path] = data;
                return data;
            })
            .catch(error => {
                console.error(`Error preloading SVG ${path}:`, error);
            });
        
        preloadPromises.push(promise);
    });
    
    return Promise.all(preloadPromises);
}

// Carga un SVG en un elemento
function applySVG(element, path) {
    if (svgCache[path]) {
        element.innerHTML = svgCache[path];
        return true;
    }
    return false;
}

// Función optimizada de morphing
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

// Aplica el efecto de morphing
function setMorph(fraction) {
    // Valores ajustados para evitar parpadeos
    if (fraction >= 0.99) fraction = 1;
    if (fraction <= 0.01) fraction = 0;
    
    // Cálculos para el filtro de desenfoque
    const blur2 = Math.min(8 / Math.max(fraction, 0.1) - 8, 100);
    const blur1 = Math.min(8 / Math.max(1 - fraction, 0.1) - 8, 100);
    
    // Ajustes específicos para dispositivos móviles
    const mobileScaleFactor = isMobile ? 0.7 : 1;
    
    // Aplicar estilos con transición suave
    elts.text2.style.filter = `blur(${blur2 * mobileScaleFactor}px)`;
    elts.text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
    
    elts.text1.style.filter = `blur(${blur1 * mobileScaleFactor}px)`;
    elts.text1.style.opacity = `${Math.pow(1 - fraction, 0.4) * 100}%`;
    
    // Prevenir parpadeo en los extremos de la animación
    if (fraction === 1) {
        elts.text2.style.filter = "";
        elts.text1.style.opacity = "0";
        elts.text1.style.filter = "";
    } else if (fraction === 0) {
        elts.text1.style.filter = "";
        elts.text2.style.opacity = "0";
        elts.text2.style.filter = "";
    }
}

// Estado de enfriamiento entre animaciones
function doCooldown() {
    morph = 0;
    
    // Aplicar estados directamente para evitar transiciones intermedias
    requestAnimationFrame(() => {
        elts.text2.style.filter = "";
        elts.text2.style.opacity = "100%";
        elts.text1.style.filter = "";
        elts.text1.style.opacity = "0%";
    });
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
            svgIndex++;
            
            // Aplicar SVGs desde el caché
            const currentIdx = svgIndex % svgPaths.length;
            const nextIdx = (svgIndex + 1) % svgPaths.length;
            
            const currentPath = svgPaths[currentIdx];
            const nextPath = svgPaths[nextIdx];
            
            // Asegurar que los SVGs estén en caché antes de aplicarlos
            if (svgCache[currentPath] && svgCache[nextPath]) {
                applySVG(elts.text1, currentPath);
                applySVG(elts.text2, nextPath);
            }
        }
        doMorph();
    } else {
        doCooldown();
    }
}

// Iniciar el proceso
function init() {
    // Detectar cambios en el tamaño de pantalla
    window.addEventListener('resize', () => {
        isMobile = window.innerWidth < 768;
    });
    
    // Precargar todos los SVGs primero
    preloadAllSVGs().then(() => {
        // Aplicar los dos primeros SVGs
        applySVG(elts.text1, svgPaths[svgIndex % svgPaths.length]);
        applySVG(elts.text2, svgPaths[(svgIndex + 1) % svgPaths.length]);
        
        // Iniciar la animación cuando todo esté cargado
        setTimeout(() => {
            animate();
        }, 100);
    });
}

// Limpiar recursos al cerrar
function cleanup() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

// Gestionar ciclo de vida
window.addEventListener('load', init);
window.addEventListener('unload', cleanup);
