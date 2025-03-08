const elts = {
    text1: document.getElementById("text1"),
    text2: document.getElementById("text2")
};

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

// Cache de SVGs para evitar solicitudes repetidas
const svgCache = {};

const morphTime = 1;
const cooldownTime = 0.25;
let svgIndex = svgPaths.length - 1;
let time = new Date();
let morph = 0;
let cooldown = cooldownTime;
let animationFrameId = null;

// Precarga los SVGs en caché
function preloadSVGs() {
    svgPaths.forEach(path => {
        if (!svgCache[path]) {
            fetch(path)
                .then(response => response.text())
                .then(data => {
                    svgCache[path] = data;
                })
                .catch(error => console.error("Error preloading SVG:", error));
        }
    });
}

// Carga SVG desde caché o fetch
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
        .catch(error => {
            console.error("Error loading SVG:", error);
        });
}

// Inicia la precarga
preloadSVGs();

// Carga inicial de SVGs
Promise.all([
    loadSVG(elts.text1, svgPaths[svgIndex % svgPaths.length]),
    loadSVG(elts.text2, svgPaths[(svgIndex + 1) % svgPaths.length])
]).then(() => {
    // Iniciar animación una vez que los SVGs iniciales estén cargados
    animate();
});

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

function setMorph(fraction) {
    // Ajuste de valores para evitar parpadeo
    const blur1 = Math.min(8 / (1 - fraction) - 8, 100);
    const blur2 = Math.min(8 / fraction - 8, 100);
    
    // Aplicar transiciones más suaves
    elts.text2.style.filter = `blur(${blur2}px)`;
    elts.text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
    
    elts.text1.style.filter = `blur(${blur1}px)`;
    elts.text1.style.opacity = `${Math.pow(1 - fraction, 0.4) * 100}%`;
    
    // Prevenir parpadeo al final de la transición
    if (fraction === 1) {
        elts.text2.style.filter = "blur(0px)";
    }
    if (fraction === 0) {
        elts.text1.style.filter = "blur(0px)";
    }
}

function doCooldown() {
    morph = 0;
    
    // Establecer los estilos directamente sin transición para evitar parpadeo
    elts.text2.style.filter = "blur(0px)";
    elts.text2.style.opacity = "100%";
    elts.text1.style.filter = "blur(0px)";
    elts.text1.style.opacity = "0%";
}

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
            
            // Pre-carga el siguiente SVG antes de la transición
            const currentPath = svgPaths[svgIndex % svgPaths.length];
            const nextPath = svgPaths[(svgIndex + 1) % svgPaths.length];
            
            // Cargar SVGs en secuencia para evitar parpadeos
            Promise.resolve()
                .then(() => loadSVG(elts.text1, currentPath))
                .then(() => loadSVG(elts.text2, nextPath));
        }
        doMorph();
    } else {
        doCooldown();
    }
}

// Limpieza para evitar memory leaks
function cleanup() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

// Añadir limpieza al cerrar/cambiar página
window.addEventListener('unload', cleanup);
