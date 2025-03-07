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
    // ... tus otros SVGs
];

const morphTime = 1;
const cooldownTime = 0.25;

let svgIndex = svgPaths.length - 1;
let time = new Date();
let morph = 0;
let cooldown = cooldownTime;

function loadSVG(element, path) {
    // Limpia el contenido antes de cargar el nuevo SVG
    element.innerHTML = '';
    fetch(path)
        .then(response => response.text())
        .then(data => {
            element.innerHTML = data;
        })
        .catch(error => console.error("Error loading SVG:", error));
}

loadSVG(elts.text1, svgPaths[svgIndex % svgPaths.length]);
loadSVG(elts.text2, svgPaths[(svgIndex + 1) % svgPaths.length]);

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
    elts.text2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    elts.text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

    fraction = 1 - fraction;
    elts.text1.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    elts.text1.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
}

function doCooldown() {
    morph = 0;
    elts.text2.style.filter = "";
    elts.text2.style.opacity = "100%";
    elts.text1.style.filter = "";
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
            // Asegúrate de que los SVG se cargan correctamente sin parpadeos
            loadSVG(elts.text1, svgPaths[svgIndex % svgPaths.length]);
            loadSVG(elts.text2, svgPaths[(svgIndex + 1) % svgPaths.length]);
        }
        doMorph();
    } else {
        doCooldown();
    }
}

animate();

