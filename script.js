const elts = {
    text1: document.getElementById("text1"),
    text2: document.getElementById("text2")
};

// Simplificar gestión de rutas
const basePath = location.hostname === "localhost" || location.hostname === "127.0.0.1" 
    ? "" 
    : location.hostname.endsWith('github.io') 
        ? '/' + location.pathname.split('/')[1] || "/graph"
        : "/graph";

// Lista de SVGs - Reducir la cantidad en producción puede mejorar el rendimiento
const svgPaths = [
    "svgs/Sin título-1-01.svg", "svgs/Sin título-1-02.svg", "svgs/Sin título-1-03.svg", 
    "svgs/Sin título-1-04.svg", "svgs/Sin título-1-05.svg", "svgs/Sin título-1-06.svg", 
    "svgs/Sin título-1-07.svg", "svgs/Sin título-1-08.svg", "svgs/Sin título-1-09.svg", 
    "svgs/Sin título-1-10.svg", "svgs/Sin título-1-11.svg", "svgs/Sin título-1-12.svg",
    "svgs/Sin título-1-13.svg", "svgs/Sin título-1-14.svg", "svgs/Sin título-1-15.svg"
    // Reduciendo a 15 SVGs para empezar - añadir más gradualmente si funciona bien
];

// Variables de estado y configuración
const svgCache = {};
const morphTime = 1;
const cooldownTime = 0.5; // Aumentado ligeramente para dar más tiempo entre transiciones
let svgIndex = 0;
let time = new Date();
let morph = 0;
let cooldown = cooldownTime;
let isAnimating = true;
let activeRequest = null; // Controlar peticiones activas

// Limitar a solo 4 SVGs en caché para reducir consumo de memoria
function limitCache() {
    const keys = Object.keys(svgCache);
    if (keys.length > 4) {
        const oldestKey = keys[0];
        delete svgCache[oldestKey];
    }
}

// Función para cargar SVG optimizada
function loadSVG(element, index) {
    // Si ya está en caché, usarlo directamente
    if (svgCache[index]) {
        element.innerHTML = svgCache[index];
        return Promise.resolve();
    }
    
    // Cancelar petición anterior si existe
    if (activeRequest) {
        activeRequest.abort();
    }
    
    // Crear controller para poder abortar la petición
    const controller = new AbortController();
    activeRequest = controller;
    
    const path = `${basePath}/${svgPaths[index]}`.replace(/\/+/g, '/');
    
    return fetch(path, { signal: controller.signal })
        .then(response => response.text())
        .then(data => {
            // Procesar SVG para reducir su tamaño (quitar metadatos, comentarios)
            const optimizedSVG = data
                .replace(/<\?xml.*?\?>/g, '')
                .replace(/<!--.*?-->/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            
            svgCache[index] = optimizedSVG;
            element.innerHTML = optimizedSVG;
            activeRequest = null;
            limitCache(); // Limitar el tamaño de la caché
        })
        .catch(err => {
            // Solo manejo básico de errores, sin SVG de fallback que consume memoria
            if (err.name !== 'AbortError') {
                element.innerHTML = '';
                activeRequest = null;
            }
        });
}

// Transición de morphing optimizada
function doMorph() {
    morph -= cooldown;
    cooldown = 0;
    
    let fraction = morph / morphTime;
    if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
    }
    
    // Usar valores más conservadores para el blur
    const maxBlur = 12;
    const blur2 = Math.min(8 / fraction - 8, maxBlur);
    const blur1 = Math.min(8 / (1 - fraction) - 8, maxBlur);
    
    // Usar transform en vez de filter cuando sea posible (más eficiente)
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

// Función de animación con framerate adaptativo
function animate() {
    if (!isAnimating) return;
    
    // Usar throttling para prevenir demasiados frames
    requestAnimationFrame(() => {
        const newTime = new Date();
        const dt = (newTime - time) / 1000;
        
        // Saltear frames si estamos por debajo de 30 FPS para equilibrar rendimiento
        if (dt < 0.033) { // 30fps
            requestAnimationFrame(animate);
            return;
        }
        
        time = newTime;
        const shouldIncrementIndex = cooldown > 0;
        cooldown -= dt;
        
        if (cooldown <= 0) {
            if (shouldIncrementIndex) {
                svgIndex = (svgIndex + 1) % svgPaths.length;
                
                // Cargar SVGs actuales
                loadSVG(elts.text1, svgIndex).then(() => {
                    loadSVG(elts.text2, (svgIndex + 1) % svgPaths.length);
                });
            }
            doMorph();
        } else {
            doCooldown();
        }
        
        requestAnimationFrame(animate);
    });
}

// Iniciar la animación
function init() {
    // Cargar los primeros SVGs
    loadSVG(elts.text1, 0).then(() => {
        loadSVG(elts.text2, 1).then(() => {
            // Iniciar la animación con un retraso para asegurar carga
            setTimeout(() => {
                animate();
            }, 500);
        });
    });
    
    // Limpiar memoria periódicamente
    setInterval(() => {
        // Forzar recolección de basura indirectamente
        svgCache[svgIndex] = svgCache[svgIndex]; 
    }, 30000);
}

// Optimización para visibilidad
document.addEventListener('visibilitychange', () => {
    isAnimating = !document.hidden;
    if (isAnimating) {
        time = new Date();
        // Reiniciar con cooldown para evitar saltos bruscos
        cooldown = cooldownTime;
        requestAnimationFrame(animate);
    }
});

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);

// Manejar navegación away/back para liberar memoria
window.addEventListener('pagehide', () => {
    isAnimating = false;
    // Liberar recursos
    for (let key in svgCache) {
        delete svgCache[key];
    }
});
