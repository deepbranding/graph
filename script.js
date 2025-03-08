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
let isMobile = window.innerWidth < 768;

// Caché de SVGs optimizado
const svgCache = {};
let isAnimationRunning = false;
let isInitialized = false;

// Función para cargar SVGs de manera eficiente
function loadSVG(path) {
    return new Promise((resolve, reject) => {
        if (svgCache[path]) {
            resolve(svgCache[path]);
            return;
        }

        fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                // Optimización: Limpiar el SVG para reducir tamaño
                const cleanedData = optimizeSVG(data);
                svgCache[path] = cleanedData;
                resolve(cleanedData);
            })
            .catch(error => {
                console.error(`Error loading SVG ${path}:`, error);
                reject(error);
            });
    });
}

// Optimizar SVG para reducir peso y mejorar rendimiento
function optimizeSVG(svgData) {
    // Eliminar comentarios y espacios en blanco excesivos
    let cleaned = svgData.replace(/<!--[\s\S]*?-->/g, '')
                         .replace(/\s{2,}/g, ' ')
                         .replace(/>\s+</g, '><');
    
    // Asegurar que viewBox está establecido correctamente para responsividad
    if (!cleaned.includes('viewBox') && (cleaned.includes('width=') || cleaned.includes('height='))) {
        const widthMatch = cleaned.match(/width="([^"]*)"/);
        const heightMatch = cleaned.match(/height="([^"]*)"/);
        
        if (widthMatch && heightMatch) {
            const width = parseFloat(widthMatch[1]);
            const height = parseFloat(heightMatch[1]);
            
            if (!isNaN(width) && !isNaN(height)) {
                cleaned = cleaned.replace(/<svg/, `<svg viewBox="0 0 ${width} ${height}"`);
            }
        }
    }
    
    // Asegurar que preserve aspect ratio está configurado correctamente
    if (!cleaned.includes('preserveAspectRatio')) {
        cleaned = cleaned.replace(/<svg/, '<svg preserveAspectRatio="xMidYMid meet"');
    }
    
    return cleaned;
}

// Cargar SVGs en lotes para reducir la carga de memoria
function preloadSVGBatch(startIndex, batchSize) {
    const endIndex = Math.min(startIndex + batchSize, svgPaths.length);
    const promises = [];
    
    for (let i = startIndex; i < endIndex; i++) {
        promises.push(loadSVG(svgPaths[i]));
    }
    
    return Promise.all(promises).then(() => {
        if (endIndex < svgPaths.length) {
            // Espera un poco antes de cargar el siguiente lote para no bloquear la UI
            return new Promise(resolve => {
                setTimeout(() => {
                    preloadSVGBatch(endIndex, batchSize).then(resolve);
                }, 50);
            });
        }
    });
}

// Aplicar SVG a un elemento con optimizaciones
function applySVG(element, path) {
    if (svgCache[path]) {
        element.innerHTML = svgCache[path];
        
        // Optimizaciones para móviles
        if (isMobile) {
            const svgElement = element.querySelector('svg');
            if (svgElement) {
                svgElement.setAttribute('width', '100%');
                svgElement.setAttribute('height', '100%');
            }
        }
        
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

// Aplica el efecto de morphing con optimizaciones
function setMorph(fraction) {
    // Optimizar los valores extremos para prevenir parpadeos
    if (fraction >= 0.99) fraction = 1;
    if (fraction <= 0.01) fraction = 0;
    
    // Valores de desenfoque adaptados a dispositivos
    const blurFactor = isMobile ? 0.6 : 1; // Reducir desenfoque en móviles
    const blur2 = Math.min(8 / Math.max(fraction, 0.1) - 8, 100) * blurFactor;
    const blur1 = Math.min(8 / Math.max(1 - fraction, 0.1) - 8, 100) * blurFactor;
    
    // Aplicar transformaciones con optimizaciones de rendimiento
    const opacity2 = Math.pow(fraction, 0.4) * 100;
    const opacity1 = Math.pow(1 - fraction, 0.4) * 100;
    
    // Usar transform en lugar de filter cuando sea posible para mejor rendimiento
    if (blur2 < 0.5) {
        elts.text2.style.filter = '';
    } else {
        elts.text2.style.filter = `blur(${blur2}px)`;
    }
    elts.text2.style.opacity = `${opacity2}%`;
    
    if (blur1 < 0.5) {
        elts.text1.style.filter = '';
    } else {
        elts.text1.style.filter = `blur(${blur1}px)`;
    }
    elts.text1.style.opacity = `${opacity1}%`;
    
    // Optimización para los extremos
    if (fraction === 1) {
        // Garantizar que el estado final sea limpio
        elts.text2.style.filter = '';
        elts.text1.style.opacity = '0';
        elts.text1.style.filter = '';
    } else if (fraction === 0) {
        elts.text1.style.filter = '';
        elts.text2.style.opacity = '0';
        elts.text2.style.filter = '';
    }
}

// Estado de enfriamiento entre animaciones
function doCooldown() {
    morph = 0;
    
    // Aplicar estados directamente sin transiciones intermedias
    elts.text2.style.filter = '';
    elts.text2.style.opacity = '100%';
    elts.text1.style.filter = '';
    elts.text1.style.opacity = '0%';
}

// Función principal de animación con mejoras de rendimiento
function animate() {
    if (!isAnimationRunning) return;
    
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
                
                // Precarga anticipada del siguiente SVG para evitar saltos
                const preloadIdx = (svgIndex + 2) % svgPaths.length;
                loadSVG(svgPaths[preloadIdx]);
            }
        }
        doMorph();
    } else {
        doCooldown();
    }
}

// Detectar visibilidad de la página para pausar animación cuando no es visible
function handleVisibilityChange() {
    if (document.hidden) {
        pauseAnimation();
    } else if (isInitialized) {
        resumeAnimation();
    }
}

// Pausar la animación para ahorrar recursos
function pauseAnimation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    isAnimationRunning = false;
}

// Reanudar la animación
function resumeAnimation() {
    if (!isAnimationRunning) {
        isAnimationRunning = true;
        time = new Date();
        animate();
    }
}

// Función para manejar cambios de tamaño de pantalla
function handleResize() {
    const wasMobile = isMobile;
    isMobile = window.innerWidth < 768;
    
    // Si cambió entre móvil y escritorio, actualizamos los SVGs
    if (wasMobile !== isMobile && isInitialized) {
        applySVG(elts.text1, svgPaths[svgIndex % svgPaths.length]);
        applySVG(elts.text2, svgPaths[(svgIndex + 1) % svgPaths.length]);
    }
}

// Iniciar el proceso con carga optimizada
function init() {
    if (isInitialized) return;
    
    isInitialized = true;
    isAnimationRunning = true;
    
    // Configurar gestores de eventos
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cargar SVGs iniciales primero
    const initialLoadPromises = [
        loadSVG(svgPaths[svgIndex % svgPaths.length]),
        loadSVG(svgPaths[(svgIndex + 1) % svgPaths.length])
    ];
    
    Promise.all(initialLoadPromises)
        .then(() => {
            // Aplicar los dos primeros SVGs
            applySVG(elts.text1, svgPaths[svgIndex % svgPaths.length]);
            applySVG(elts.text2, svgPaths[(svgIndex + 1) % svgPaths.length]);
            
            // Iniciar la animación
            setTimeout(() => {
                animate();
                
                // Cargar el resto de SVGs en segundo plano en pequeños lotes
                setTimeout(() => {
                    preloadSVGBatch(2, 5); // Cargar 5 SVGs a la vez
                }, 300);
            }, 100);
        });
}

// Función para liberar memoria cuando la página se cierra
function cleanup() {
    pauseAnimation();
    
    // Eliminar listeners
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    
    // Limpiar caches
    for (let key in svgCache) {
        delete svgCache[key];
    }
}

// Gestionar ciclo de vida
window.addEventListener('load', init);
window.addEventListener('unload', cleanup);
