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

const morphTime = 1;
const cooldownTime = 0.25;

let svgIndex = svgPaths.length - 1;
let time = new Date();
let morph = 0;
let cooldown = cooldownTime;

function loadSVG(element, path) {
    fetch(path)
        .then(response => response.text())
        .then(data => {
            element.innerHTML = data;
        })
        .catch(error => console.error("Error loading SVG:", error));
}

function preloadNextSVG() {
    loadSVG(elts.text2, svgPaths[(svgIndex + 1) % svgPaths.length]);
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
    elts.text2.style.opacity = `${fraction * 100}%`;
    elts.text2.style.transform = `scale(${1 - fraction * 0.2})`; /* Ligera reducción del tamaño para el efecto de fusión */

    fraction = 1 - fraction;
    elts.text1.style.opacity = `${fraction * 100}%`;
    elts.text1.style.transform = `scale(${1 - fraction * 0.2})`; /* Ligera reducción del tamaño para el efecto de fusión */
}

function doCooldown() {
    morph = 0;
    elts.text2.style.opacity = "100%";
    elts.text1.style.opacity = "0%";
}

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
            preloadNextSVG(); // Pre-cargar el siguiente SVG en el fondo antes de cambiarlo
            loadSVG(elts.text1, svgPaths[svgIndex % svgPaths.length]); // Cargar el nuevo SVG en text1
        }
        doMorph();
    } else {
        doCooldown();
    }
}

animate();




