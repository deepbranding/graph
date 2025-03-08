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

// Variables de estado
let svgIndex = svgPaths.length - 1;
let time = new Date();
let morph = 0;
let cooldown = cooldownTime;
let animationFrameId = null;
let nextSvg = null;
let currentSvg = null;

// Función para cargar SVG de manera eficiente
function loadSVG(element, path) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                element.innerHTML = xhr.responseText;
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

// Precarga el siguiente SVG para evitar parpadeos
function preloadNextSVG() {
    const nextIndex = (svgIndex + 2) % svgPaths.length;
    const path = svgPaths[nextIndex];
    
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                nextSvg = xhr.responseText;
            }
            resolve();
        };
        xhr.onerror = function() {
            resolve(); // Continuamos incluso si hay error
        };
        xhr.send();
    });
}

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

// Aplica los efectos visuales de morphing
function setMorph(fraction) {
    // Aplicamos blur y opacidad solo cuando es necesario
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

// Restablece el estado entre transiciones
function doCooldown() {
    morph = 0;
    elts.text2.style.filter = "";
    elts.text2.style.opacity = "100%";
    elts.text1.style.filter = "";
    elts.text1.style.opacity = "0%";
}

// Bucle principal de animación
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
            
            // Si tenemos un SVG precargado, lo usamos inmediatamente
            if (nextSvg && svgIndex % svgPaths.length === (svgIndex - 1) % svgPaths.length + 1) {
                elts.text1.innerHTML = currentSvg || '';
                elts.text2.innerHTML = nextSvg;
                currentSvg = nextSvg;
                nextSvg = null;
                
                // Precargamos el siguiente mientras se muestra la transición
                preloadNextSVG();
            } else {
                // Carga normal si no tenemos precarga
                loadSVG(elts.text1, svgPaths[svgIndex % svgPaths.length])
                    .then(() => {
                        currentSvg = elts.text1.innerHTML;
                    });
                    
                loadSVG(elts.text2, svgPaths[(svgIndex + 1) % svgPaths.length])
                    .then(() => {
                        // Precargamos el siguiente después de cargar el actual
                        preloadNextSVG();
                    });
            }
        }
        
        doMorph();
    } else {
        doCooldown();
    }
}

// Inicializar animación
function init() {
    // Cargar los primeros SVGs
    Promise.all([
        loadSVG(elts.text1, svgPaths[svgIndex % svgPaths.length])
            .then(() => { currentSvg = elts.text1.innerHTML; }),
        loadSVG(elts.text2, svgPaths[(svgIndex + 1) % svgPaths.length])
    ])
    .then(() => {
        // Iniciar la animación después de cargar los primeros SVGs
        animate();
        // Precargar el siguiente para tenerlo listo
        preloadNextSVG();
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
        animate();
    }
});

// Iniciar después de que la página cargue completamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
