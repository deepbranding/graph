// Elementos DOM
const text1 = document.getElementById("text1");
const text2 = document.getElementById("text2");

// Configuración simple
const morphTime = 1;
const cooldownTime = 0.4;

// Rutas de SVGs
const svgBasePath = location.hostname === "localhost" || location.hostname === "127.0.0.1" 
    ? "" 
    : (location.hostname.endsWith('github.io') 
        ? '/' + location.pathname.split('/')[1] 
        : "/graph");

// Array de SVGs (reducido a 10 para pruebas iniciales)
const svgs = [
    "svgs/Sin título-1-01.svg",
    "svgs/Sin título-1-02.svg",
    "svgs/Sin título-1-03.svg",
    "svgs/Sin título-1-04.svg",
    "svgs/Sin título-1-05.svg",
    "svgs/Sin título-1-06.svg",
    "svgs/Sin título-1-07.svg",
    "svgs/Sin título-1-08.svg",
    "svgs/Sin título-1-09.svg",
    "svgs/Sin título-1-10.svg"
];

// Variables de estado
let index = 0;
let nextIndex = 1;
let time = new Date();
let morph = 0;
let cooldown = cooldownTime;
let animating = true;

// Solo 2 SVGs en memoria para minimizar uso
let currentSVG = "";
let nextSVG = "";

// Función simple para cargar un SVG
function loadSVG(path) {
    return fetch(`${svgBasePath}/${path}`.replace(/\/+/g, '/'))
        .then(response => response.text())
        .catch(() => "<svg></svg>"); // SVG vacío como fallback
}

// Cargar los primeros SVGs
function loadInitialSVGs() {
    // Cargar el primero
    loadSVG(svgs[0]).then(svg => {
        currentSVG = svg;
        text1.innerHTML = svg;
        
        // Luego cargar el segundo
        return loadSVG(svgs[1]);
    }).then(svg => {
        nextSVG = svg;
        text2.innerHTML = svg;
        
        // Iniciar la animación
        animate();
    });
}

// Hacer la transición
function doMorph() {
    morph -= cooldown;
    cooldown = 0;
    
    let fraction = morph / morphTime;
    if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
    }
    
    // Mantener el efecto blur simple para mejor rendimiento
    const blur = 5; // Valor fijo para evitar cálculos
    
    // Aplicar opacidad y blur
    text2.style.opacity = `${fraction * 100}%`;
    text1.style.opacity = `${(1 - fraction) * 100}%`;
    
    text2.style.filter = fraction < 0.9 ? `blur(${blur}px)` : "";
    text1.style.filter = fraction > 0.1 ? `blur(${blur}px)` : "";
}

// Reset entre transiciones
function doCooldown() {
    morph = 0;
    
    text2.style.filter = "";
    text2.style.opacity = "100%";
    text1.style.filter = "";
    text1.style.opacity = "0%";
}

// Loop de animación optimizado
function animate() {
    if (!animating) return;
    
    requestAnimationFrame(animate);
    
    const newTime = new Date();
    const dt = (newTime - time) / 1000;
    time = newTime;
    
    // Lógica simple de animación
    cooldown -= dt;
    
    if (cooldown <= 0) {
        if (morph === 0) {
            // Cambiar al siguiente par de SVGs
            index = nextIndex;
            nextIndex = (nextIndex + 1) % svgs.length;
            
            // Intercambiar SVGs actual y siguiente
            text1.innerHTML = nextSVG;
            currentSVG = nextSVG;
            
            // Cargar el siguiente SVG en segundo plano
            loadSVG(svgs[nextIndex]).then(svg => {
                nextSVG = svg;
                text2.innerHTML = svg;
            });
        }
        doMorph();
    } else {
        doCooldown();
    }
}

// Control de visibilidad
document.addEventListener('visibilitychange', function() {
    animating = !document.hidden;
    
    if (animating) {
        time = new Date();
        requestAnimationFrame(animate);
    }
});

// Iniciar
document.addEventListener('DOMContentLoaded', loadInitialSVGs);
