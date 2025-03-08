// Cache de elementos DOM
const elts = {
    text1: document.getElementById("text1"),
    text2: document.getElementById("text2")
};

// Lista de SVGs
const svgPaths = [
    "svgs/Sin título-1-01.svg",
    "svgs/Sin título-1-02.svg",
    "svgs/Sin título-1-03.svg",
    "svgs/Sin título-1-04.svg",
    "svgs/Sin título-1-05.svg",
    "svgs/Sin título-1-06.svg",
    "svgs/Sin título-1-07.svg",
    "svgs/Sin título-1-08.svg",
    "svgs/Sin título-1-09.svg",
    "svgs/Sin título-1-10.svg",
    "svgs/Sin título-1-11.svg",
    "svgs/Sin título-1-12.svg",
    "svgs/Sin título-1-13.svg",
    "svgs/Sin título-1-14.svg",
    "svgs/Sin título-1-15.svg",
    "svgs/Sin título-1-16.svg",
    "svgs/Sin título-1-17.svg",
    "svgs/Sin título-1-18.svg",
    "svgs/Sin título-1-19.svg",
    "svgs/Sin título-1-20.svg",
    "svgs/Sin título-1-21.svg",
    "svgs/Sin título-1-22.svg",
    "svgs/Sin título-1-23.svg",
    "svgs/Sin título-1-24.svg",
    "svgs/Sin título-1-25.svg",
    "svgs/Sin título-1-26.svg",
    "svgs/Sin título-1-27.svg",
    "svgs/Sin título-1-28.svg",
    "svgs/Sin título-1-29.svg",
    "svgs/Sin título-1-30.svg",
    "svgs/Sin título-1-31.svg"
];

// Configuración de tiempo
const morphTime = 1;
const cooldownTime = 0.25;

// Detectar si es dispositivo móvil
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Variables de estado
let svgIndex = svgPaths.length - 1;
let time = new Date();
let morph = 0;
let cooldown = cooldownTime;
let animationFrameId = null;
let svgCache = {};
let isTransitioning = false;

// Función para limpiar SVG y prepararlo para una transición más suave
function cleanSVG(svgContent) {
    // Asegurarnos de que el SVG tenga un viewBox si no lo tiene
    if (!svgContent.includes('viewBox') && 
        (svgContent.includes('width=') && svgContent.includes('height='))) {
        
        const widthMatch = svgContent.match(/width=['"]([^'"]+)['"]/);
        const heightMatch = svgContent.match(/height=['"]([^'"]+)['"]/);
        
        if (widthMatch && heightMatch) {
            const width = parseInt(widthMatch[1], 10);
            const height = parseInt(heightMatch[1], 10);
            
            svgContent = svgContent.replace('<svg', `<svg viewBox="0 0 ${width} ${height}"`);
        }
    }
    
    // Asegurarnos de preservar el aspect ratio
    if (!svgContent.includes('preserveAspectRatio')) {
        svgContent = svgContent.replace('<svg', '<svg preserveAspectRatio="xMidYMid meet"');
    }
    
    // Eliminar atributos que puedan causar problemas de tamaño
    svgContent = svgContent
        .replace(/\s(width|height)=["'][^"']*["']/g, '')
        .replace(/\sstyle=["'][^"']*["']/g, '');
    
    return svgContent;
}

// Función para cargar y cachear SVGs
function loadSVG(element, path, immediate = false) {
    // Si ya está en caché, usarlo directamente
    if (svgCache[path]) {
        if (immediate) {
            element.innerHTML = svgCache[path];
            return Promise.resolve();
        }
        
        // Pequeño retraso para asegurar que la transición sea suave
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                element.innerHTML = svgCache[path];
                resolve();
            });
        });
    }
    
    // Si no está en caché, cargarlo
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);
        xhr.setRequestHeader('Cache-Control', 'no-cache');
        xhr.onload = function() {
            if (xhr.status === 200) {
                // Limpiar y optimizar el SVG
                const cleanedSVG = cleanSVG(xhr.responseText);
                svgCache[path] = cleanedSVG;
                
                if (immediate) {
                    element.innerHTML = cleanedSVG;
                } else {
                    // Aplicar con un pequeño retraso para evitar parpadeos
                    requestAnimationFrame(() => {
                        element.innerHTML = cleanedSVG;
                    });
                }
                resolve();
            } else {
                console.error(`Error cargando SVG ${path}: ${xhr.status}`);
                reject(new Error(`Error ${xhr.status}`));
            }
        };
        xhr.onerror = function() {
            console.error(`Error de red al cargar ${path}`);
            reject(new Error('Error de red'));
        };
        xhr.send();
    });
}

// Precargar varios SVGs en segundo plano
function preloadNextSVGs(startIndex, count = 3) {
    const promises = [];
    
    for (let i = 0; i < count; i++) {
        const idx = (startIndex + i) % svgPaths.length;
        const path = svgPaths[idx];
        
        if (!svgCache[path]) {
            const promise = new Promise((resolve) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', path, true);
                xhr.setRequestHeader('Cache-Control', 'no-cache');
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        svgCache[path] = cleanSVG(xhr.responseText);
                    }
                    resolve();
                };
                xhr.onerror = resolve; // Continuar incluso con errores
                xhr.send();
            });
            
            promises.push(promise);
        }
    }
    
    return Promise.all(promises);
}

// Función de morphing optimizada
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

// Aplica los efectos visuales de morphing con mejoras para dispositivos móviles
function setMorph(fraction) {
    // Ajuste específico para dispositivos móviles para intensificar el efecto
    if (isMobile) {
        // Intensificar el efecto en móviles para que sea más visible
        const adjustedFraction = Math.pow(fraction, 0.8); // Hace que la transición sea más pronunciada
        
        if (fraction < 0.99) {
            const blur2 = Math.min(8 / fraction - 8, 60); // Limitamos el blur máximo
            elts.text2.style.filter = `blur(${blur2}px)`;
            elts.text2.style.opacity = `${Math.pow(adjustedFraction, 0.4) * 100}%`;
        } else {
            elts.text2.style.filter = "";
            elts.text2.style.opacity = "100%";
        }
        
        if (fraction > 0.01) {
            const blur1 = Math.min(8 / (1 - fraction) - 8, 60);
            elts.text1.style.filter = `blur(${blur1}px)`;
            elts.text1.style.opacity = `${Math.pow(1 - adjustedFraction, 0.4) * 100}%`;
        } else {
            elts.text1.style.filter = "";
            elts.text1.style.opacity = "0%";
        }
    } else {
        // Comportamiento original para escritorio con ajustes
        if (fraction < 0.99) {
            const blur2 = Math.min(8 / fraction - 8, 100);
            elts.text2.style.filter = `blur(${blur2}px)`;
            elts.text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
        } else {
            elts.text2.style.filter = "";
            elts.text2.style.opacity = "100%";
        }
        
        if (fraction > 0.01) {
            const blur1 = Math.min(8 / (1 - fraction) - 8, 100);
            elts.text1.style.filter = `blur(${blur1}px)`;
            elts.text1.style.opacity = `${Math.pow(1 - fraction, 0.4) * 100}%`;
        } else {
            elts.text1.style.filter = "";
            elts.text1.style.opacity = "0%";
        }
    }
}

// Restablece el estado entre transiciones con antirrebote para evitar parpadeos
function doCooldown() {
    morph = 0;
    
    // Transición más suave para evitar parpadeos
    requestAnimationFrame(() => {
        elts.text2.style.filter = "";
        elts.text2.style.opacity = "100%";
        
        requestAnimationFrame(() => {
            elts.text1.style.filter = "";
            elts.text1.style.opacity = "0%";
        });
    });
}

// Bucle principal de animación mejorado
function animate() {
    animationFrameId = requestAnimationFrame(animate);
    
    const newTime = new Date();
    const shouldIncrementIndex = cooldown > 0;
    const dt = (newTime - time) / 1000;
    time = newTime;
    
    cooldown -= dt;
    
    if (cooldown <= 0) {
        if (shouldIncrementIndex && !isTransitioning) {
            isTransitioning = true;
            svgIndex++;
            
            const currentPath = svgPaths[svgIndex % svgPaths.length];
            const nextPath = svgPaths[(svgIndex + 1) % svgPaths.length];
            
            // Cargar SVGs actuales en secuencia correcta
            Promise.all([
                loadSVG(elts.text1, currentPath),
                loadSVG(elts.text2, nextPath)
            ])
            .then(() => {
                isTransitioning = false;
                
                // Precargar los siguientes SVGs para tenerlos listos
                preloadNextSVGs(svgIndex + 2, 3);
            })
            .catch(error => {
                console.error("Error en transición:", error);
                isTransitioning = false;
            });
        }
        
        doMorph();
    } else {
        doCooldown();
    }
}

// Inicializar animación con precarga
function init() {
    // Cargar los filtros SVG primero para asegurar que estén disponibles
    document.getElementById("filters").style.display = "block";
    
    // Preparar configuración específica para móviles
    if (isMobile) {
        document.documentElement.style.setProperty('--webkit-filter-url', 'url(#threshold)');
    }
    
    // Cargar y mostrar los primeros SVGs
    Promise.all([
        loadSVG(elts.text1, svgPaths[svgIndex % svgPaths.length], true),
        loadSVG(elts.text2, svgPaths[(svgIndex + 1) % svgPaths.length], true)
    ])
    .then(() => {
        // Iniciar la animación después de cargar los primeros SVGs
        setTimeout(() => {
            animate();
            
            // Precargar los siguientes SVGs en segundo plano
            preloadNextSVGs(svgIndex + 2, 4);
        }, 100); // Pequeño retraso para asegurar renderizado inicial
    })
    .catch(error => {
        console.error("Error en la inicialización:", error);
    });
}

// Gestión de pausas cuando la página no está visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    } else if (!animationFrameId) {
        time = new Date(); // Resetear el tiempo
        requestAnimationFrame(animate);
    }
});

// Reiniciar la animación cuando cambie el tamaño de ventana (orientación móvil)
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        time = new Date();
        requestAnimationFrame(animate);
    }, 200);
});

// Iniciar después de que la página cargue completamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
