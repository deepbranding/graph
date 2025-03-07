const elts = {
    text1: document.getElementById("text1"),
    text2: document.getElementById("text2")
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

let svgIndex = svgPaths.length - 1;
let morphTime = 1;
let cooldownTime = 0.25;
let morph = 0;
let cooldown = cooldownTime;
let time = new Date();

// Cargar el SVG en un contenedor dado
function loadSVG(element, path) {
    fetch(path)
        .then(response => response.text())
        .then(data => {
            element.innerHTML = data;
            requestAnimationFrame(() => {
                if (path === svgPaths[svgIndex % svgPaths.length]) {
                    // Iniciar la animación de morphing solo después de la carga
                    doMorph();
                }
            });
        })
        .catch(error => console.error("Error loading SVG:", error));
}

// Cargar los dos SVGs inicialmente
loadSVG(elts.text1, svgPaths[svgIndex % svgPaths.length]);
loadSVG(elts.text2, svgPaths[(svgIndex + 1) % svgPaths.length]);

// Animación de morphing entre dos SVGs
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

// Animación de la transición entre los SVGs
function setMorph(fraction) {
    // Obtenemos los paths de los SVGs actuales
    const paths1 = elts.text1.querySelectorAll('path');
    const paths2 = elts.text2.querySelectorAll('path');

    // Realizar morphing de los caminos de un SVG al otro
    paths1.forEach((path, index) => {
        const path2 = paths2[index];
        if (path && path2) {
            const path1D = path.getAttribute('d');
            const path2D = path2.getAttribute('d');
            const morphedPath = morphPaths(path1D, path2D, fraction);
            path.setAttribute('d', morphedPath);
        }
    });

    // Desvanecer la visibilidad de text1 y text2 con opacidad
    elts.text1.style.opacity = `${Math.pow(1 - fraction, 0.4) * 100}%`;
    elts.text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
}

// Interpolación de las rutas para el morphing (simple)
function morphPaths(path1D, path2D, fraction) {
    const p1 = parsePath(path1D);
    const p2 = parsePath(path2D);

    const morphedPath = p1.map((segment, i) => {
        return segment.map((coordinate, j) => {
            return coordinate + (p2[i][j] - coordinate) * fraction;
        });
    });

    return `M ${morphedPath.map(segment => segment.join(' ')).join(' ')} Z`;
}

// Función que interpreta un path SVG como un array de puntos
function parsePath(pathData) {
    const regex = /([MLC])([^MLC]*)/g;
    let result = [];
    let match;

    while (match = regex.exec(pathData)) {
        const type = match[1];
        const points = match[2].split(' ').map(Number);
        result.push(points);
    }
    return result;
}

// Función para manejar el cooldown y las transiciones entre SVGs
function doCooldown() {
    morph = 0;
    elts.text2.style.transition = "none";
    elts.text2.style.opacity = "100%";
    elts.text1.style.transition = "none";
    elts.text1.style.opacity = "0%";
}

// Iniciar la animación
function animate() {
    requestAnimationFrame(animate);

    let newTime = new Date();
    let shouldIncrementIndex = cooldown > 0;
    let dt = (newTime - time) / 1000;
    time = newTime;

    cooldown -= dt;

    if (cooldown <= 0) {
        if (shouldIncrementIndex) {
            svgIndex++;
            loadSVG(elts.text1, svgPaths[svgIndex % svgPaths.length]);
            loadSVG(elts.text2, svgPaths[(svgIndex + 1) % svgPaths.length]);
        }
        doMorph();
    } else {
        doCooldown();
    }
}

// Iniciar la animación
animate();
