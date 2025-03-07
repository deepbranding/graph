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

// Cargar SVG en un contenedor dado
function loadSVG(element, path) {
    fetch(path)
        .then(response => response.text())
        .then(data => {
            element.innerHTML = data;
            requestAnimationFrame(() => {
                if (path === svgPaths[svgIndex % svgPaths.length]) {
                    // Inicia la animación de morphing solo después de la carga
                    doMorph();
                }
            });
        })
        .catch(error => console.error("Error loading SVG:", error));
}

// Cargar SVG inicial
loadSVG(elts.text1, svgPaths[svgIndex % svgPaths.length]);
loadSVG(elts.text2, svgPaths[(svgIndex + 1) % svgPaths.length]);

// Función para realizar el morphing de los SVGs
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

// Establecer el morphing entre los dos SVGs
function setMorph(fraction) {
    // Aplica la transición solo a la opacidad
    elts.text2.style.transition = "opacity 1s ease-in-out";
    elts.text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

    fraction = 1 - fraction;
    elts.text1.style.transition = "opacity 1s ease-in-out";
    elts.text1.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
}

// Hacer que el morphing pase sin problemas
function doCooldown() {
    morph = 0;
    elts.text2.style.transition = "none";
    elts.text2.style.opacity = "100%";
    elts.text1.style.transition = "none";
    elts.text1.style.opacity = "0%";
}

// Animar el proceso de SVG
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


