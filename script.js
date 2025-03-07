const elts = {
    text1: document.getElementById("text1"),
    text2: document.getElementById("text2")
};

// Prefijos para rutas relativas en GitHub Pages
// Ajusta esto según la estructura de tu repositorio
const basePath = location.hostname === "localhost" || location.hostname === "127.0.0.1" 
    ? "" 
    : "/graph"; // Reemplaza con el nombre real de tu repositorio

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
    "svgs/Sin título-1-31.svg",
];

// Cache de SVGs precargados
const svgCache = {};

const morphTime = 1;
const cooldownTime = 0.25;
let svgIndex = svgPaths.length - 1;
let time = new Date();
let morph = 0;
let cooldown = cooldownTime;
let isAnimating = true;

// Función para precargar los SVGs
function preloadSVGs() {
    // Precargar los primeros SVGs inmediatamente
    preloadSVG(svgIndex % svgPaths.length);
    preloadSVG((svgIndex + 1) % svgPaths.length);
    
    // Luego precargar el resto en segundo plano
    setTimeout(() => {
        for (let i = 0; i < svgPaths.length; i++) {
            preloadSVG(i);
        }
    }, 100);
}

// Función para precargar un SVG individual
function preloadSVG(index) {
    if (svgCache[index]) return Promise.resolve(svgCache[index]);
    
    const path = `${basePath}/${svgPaths[index]}`;
    
    return fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error cargando SVG (${response.status}): ${path}`);
            }
            return response.text();
        })
        .then(data => {
            svgCache[index] = data;
            return data;
        })
        .catch(error => {
            console.error("Error preloading SVG:", error);
            // Proporcionar un SVG de respaldo en caso de error
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="10" y="50" fill="white">Error</text></svg>';
        });
}

// Función para mostrar un SVG desde la caché o cargarlo si no está
function loadSVG(element, index) {
    if (svgCache[index]) {
        element.innerHTML = svgCache[index];
        return Promise.resolve();
    }
    
    const path = `${basePath}/${svgPaths[index]}`;
    
    return fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error cargando SVG (${response.status}): ${path}`);
            }
            return response.text();
        })
        .then(data => {
            svgCache[index] = data;
            // Solo actualizar el elemento si todavía estamos en el mismo índice
            // para evitar problemas de sincronización
            if (index === svgIndex % svgPaths.length || 
                index === (svgIndex + 1) % svgPaths.length) {
                element.innerHTML = data;
            }
        })
        .catch(error => {
            console.error("Error loading SVG:", error);
            element.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="10" y="50" fill="white">Error</text></svg>';
        });
}

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
    // Limitamos el valor máximo de blur para evitar problemas de rendimiento
    const maxBlur = 20;
    
    elts.text2.style.filter = `blur(${Math.min(8 / fraction - 8, maxBlur)}px)`;
    elts.text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
    
    fraction = 1 - fraction;
    elts.text1.style.filter = `blur(${Math.min(8 / fraction - 8, maxBlur)}px)`;
    elts.text1.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
}

function doCooldown() {
    morph = 0;
    elts.text2.style.filter = "";
    elts.text2.style.opacity = "100%";
    elts.text1.style.filter = "";
    elts.text1.style.opacity = "0%";
}

// Función para preparar el siguiente SVG antes de que se necesite
function prepareNextSVG() {
    const nextIndex = (svgIndex + 2) % svgPaths.length;
    preloadSVG(nextIndex);
}

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
            
            // Cargar los SVGs actuales desde la caché
            const currentIndex = svgIndex % svgPaths.length;
            const nextIndex = (svgIndex + 1) % svgPaths.length;
            
            // Usar una promesa para asegurar que los SVGs estén cargados
            Promise.all([
                loadSVG(elts.text1, currentIndex),
                loadSVG(elts.text2, nextIndex)
            ]).then(() => {
                // Preparar el siguiente SVG para la próxima transición
                prepareNextSVG();
            });
        }
        doMorph();
    } else {
        doCooldown();
    }
}

// Control de visibilidad para pausar la animación cuando no es visible
document.addEventListener('visibilitychange', function() {
    isAnimating = !document.hidden;
    if (isAnimating) {
        time = new Date(); // Resetear el tiempo para evitar saltos
        animate();
    }
});

// Iniciar la precarga y la animación
preloadSVGs();
loadSVG(elts.text1, svgIndex % svgPaths.length);
loadSVG(elts.text2, (svgIndex + 1) % svgPaths.length).then(() => {
    // Comenzar la animación solo cuando los SVGs iniciales estén cargados
    animate();
});
