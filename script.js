// Elementos del DOM
const elts = {
    text1: document.getElementById("text1"),
    text2: document.getElementById("text2")
};

// Rutas de SVGs
const svgPaths = Array.from({ length: 31 }, (_, i) => `svgs/Sin título-1-${(i + 1).toString().padStart(2, '0')}.svg`);

// Configuración de tiempos y variables
const morphTime = 1, cooldownTime = 0.25;
let svgIndex = 0, time = new Date(), morph = 0, cooldown = cooldownTime;
const svgCache = {};

// Precargar SVGs en memoria
async function preloadSVGs() {
    await Promise.all(svgPaths.map(async path => {
        try {
            const response = await fetch(path);
            if (response.ok) svgCache[path] = await response.text();
        } catch (error) {
            console.error(`Error cargando ${path}:`, error);
        }
    }));
    elts.text1.innerHTML = svgCache[svgPaths[0]];
}

// Asignar SVG sin recarga innecesaria
function applySVG(element, path) {
    if (svgCache[path]) element.innerHTML = svgCache[path];
}

// Animación optimizada
function animate() {
    requestAnimationFrame(animate);
    const newTime = new Date(), dt = (newTime - time) / 1000;
    time = newTime;
    
    if (cooldown > 0) {
        cooldown -= dt;
        return;
    }
    
    morph = Math.min(morph + dt / morphTime, 1);
    updateMorph(morph);
    
    if (morph === 1) {
        cooldown = cooldownTime;
        elts.text1.innerHTML = svgCache[svgPaths[svgIndex]];
        svgIndex = (svgIndex + 1) % svgPaths.length;
        elts.text2.innerHTML = svgCache[svgPaths[svgIndex]];
        morph = 0;
    }
}

// Aplicar transición suave
function updateMorph(fraction) {
    const blur1 = Math.min(8 / Math.max(1 - fraction, 0.1) - 8, 100);
    const blur2 = Math.min(8 / Math.max(fraction, 0.1) - 8, 100);
    
    elts.text1.style.filter = `blur(${blur1}px)`;
    elts.text1.style.opacity = `${1 - fraction}`;
    
    elts.text2.style.filter = `blur(${blur2}px)`;
    elts.text2.style.opacity = `${fraction}`;
}

// Iniciar animación cuando los SVGs estén listos
preloadSVGs().then(() => {
    elts.text2.innerHTML = svgCache[svgPaths[1]];
    animate();
});
