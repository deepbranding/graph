const elts = {
    text1: document.getElementById("text1"),
    text2: document.getElementById("text2")
};

// Corregir la detección de ruta base para GitHub Pages
const getBasePath = () => {
    // Si está en localhost, no usar prefijo
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") 
        return "";
    
    // Si está en GitHub Pages con el subdominio username.github.io
    if (location.hostname.endsWith('github.io')) {
        const pathSegments = location.pathname.split('/');
        if (pathSegments.length > 1 && pathSegments[1]) {
            return '/' + pathSegments[1]; // Primer segmento después del dominio
        }
    }
    
    // Si no se detecta correctamente, usa el nombre del repositorio como fallback
    return "/graph";
};

const basePath = getBasePath();
console.log("Usando ruta base:", basePath);

// Verificar si las rutas de los SVGs ya incluyen el repositorio
const normalizePath = (path) => {
    // Si la ruta ya comienza con el nombre del repositorio, no añadir basePath
    if (path.startsWith('/graph/') || path.startsWith('graph/')) {
        return path;
    }
    return `${basePath}/${path}`;
};

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

// Caché de SVGs precargados
const svgCache = {};

const morphTime = 1;
const cooldownTime = 0.25;
let svgIndex = svgPaths.length - 1;
let time = new Date();
let morph = 0;
let cooldown = cooldownTime;
let isAnimating = true;
let preloadingComplete = false;
let isMobile = window.innerWidth < 768; // Detectar si es dispositivo móvil

// Función para codificar correctamente las URL con espacios y caracteres especiales
function encodePathURI(path) {
    const segments = path.split('/');
    const encodedSegments = segments.map(segment => encodeURIComponent(segment));
    return encodedSegments.join('/');
}

// Función para precargar los SVGs
function preloadSVGs() {
    console.log("Iniciando precarga de SVGs");
    
    // Ocultar el elemento de carga inmediatamente
    const loadingElement = document.getElementById('loading');
    if (loadingElement) loadingElement.style.display = 'none';
    document.body.classList.add('loaded');
    
    // Precargar los primeros SVGs inmediatamente
    Promise.all([
        preloadSVG(svgIndex % svgPaths.length),
        preloadSVG((svgIndex + 1) % svgPaths.length)
    ]).then(() => {
        // Iniciar la animación cuando los SVGs iniciales estén cargados
        console.log("SVGs iniciales cargados, iniciando animación");
        loadSVG(elts.text1, svgIndex % svgPaths.length);
        loadSVG(elts.text2, (svgIndex + 1) % svgPaths.length);
        animate();
        
        // Luego precargar el resto en segundo plano
        let preloaded = 2;
        const totalSVGs = svgPaths.length;
        
        function preloadNext(index) {
            if (index >= totalSVGs) {
                console.log("Precarga completa");
                preloadingComplete = true;
                return;
            }
            
            if (index !== svgIndex % totalSVGs && index !== (svgIndex + 1) % totalSVGs) {
                preloadSVG(index).then(() => {
                    preloaded++;
                    preloadNext((index + 1) % totalSVGs);
                }).catch(() => {
                    preloadNext((index + 1) % totalSVGs);
                });
            } else {
                preloadNext((index + 1) % totalSVGs);
            }
        }
        
        preloadNext(2 % totalSVGs);
    }).catch(error => {
        console.error("Error en precarga inicial:", error);
        // Intentar iniciar animación de todos modos
        loadSVG(elts.text1, svgIndex % svgPaths.length);
        loadSVG(elts.text2, (svgIndex + 1) % svgPaths.length);
        animate();
    });
}

// Función para precargar un SVG individual
function preloadSVG(index) {
    if (svgCache[index]) return Promise.resolve(svgCache[index]);
    
    const path = normalizePath(svgPaths[index]);
    const encodedPath = encodePathURI(path);
    
    console.log(`Precargando SVG: ${encodedPath}`);
    
    return fetch(encodedPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error cargando SVG (${response.status}): ${path}`);
            }
            return response.text();
        })
        .then(data => {
            console.log(`SVG ${index} precargado correctamente`);
            svgCache[index] = data;
            return data;
        })
        .catch(error => {
            console.error(`Error preloading SVG ${index}:`, error);
            // Proporcionar un SVG vacío en caso de error
            svgCache[index] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"></svg>';
            return svgCache[index];
        });
}

// Función para mostrar un SVG desde la caché o cargarlo si no está
function loadSVG(element, index) {
    if (svgCache[index]) {
        element.innerHTML = svgCache[index];
        return Promise.resolve();
    }
    
    const path = normalizePath(svgPaths[index]);
    const encodedPath = encodePathURI(path);
    
    console.log(`Cargando SVG: ${encodedPath}`);
    
    return fetch(encodedPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error cargando SVG (${response.status}): ${path}`);
            }
            return response.text();
        })
        .then(data => {
            console.log(`SVG ${index} cargado correctamente`);
            svgCache[index] = data;
            element.innerHTML = data;
        })
        .catch(error => {
            console.error(`Error loading SVG ${index}:`, error);
            element.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"></svg>';
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
    // Ajustar el efecto de desenfoque según dispositivo
    const blurFactor = isMobile ? 4 : 8; // Menor desenfoque en móviles
    const maxBlur = isMobile ? 10 : 20; // Menor desenfoque máximo en móviles
    
    // En móviles, ajustar la opacidad para mejorar la transición
    const opacityPower = isMobile ? 0.6 : 0.4; // Mayor cambio de opacidad en móviles
    
    elts.text2.style.filter = `blur(${Math.min(blurFactor / fraction - blurFactor, maxBlur)}px)`;
    elts.text2.style.opacity = `${Math.pow(fraction, opacityPower) * 100}%`;
    
    fraction = 1 - fraction;
    elts.text1.style.filter = `blur(${Math.min(blurFactor / fraction - blurFactor, maxBlur)}px)`;
    elts.text1.style.opacity = `${Math.pow(fraction, opacityPower) * 100}%`;
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
            
            console.log(`Cambiando a SVGs ${currentIndex} y ${nextIndex}`);
            
            // Usar una promesa para asegurar que los SVGs estén cargados
            Promise.all([
                loadSVG(elts.text1, currentIndex),
                loadSVG(elts.text2, nextIndex)
            ]).then(() => {
                // Preparar el siguiente SVG para la próxima transición
                prepareNextSVG();
            }).catch(error => {
                console.error("Error al cambiar SVGs:", error);
                // Continuar de todos modos
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

// Detectar cambios de orientación o tamaño para ajustar parámetros
window.addEventListener('resize', function() {
    isMobile = window.innerWidth < 768;
});

// Iniciar la precarga
console.log("Iniciando script de animación SVG");
preloadSVGs();
