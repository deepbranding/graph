const elts = {
    text1: document.getElementById("text1"),
    text2: document.getElementById("text2")
};

const svgPaths = [
    "svgs/Sin título-1-01.svg",
    "svgs/Sin título-1-02.svg",
    // ... (tus rutas SVG)
];

const morphTime = 1;
const cooldownTime = 0.25;

let svgIndex = svgPaths.length - 1;
let time = new Date();
let morph = 0;
let cooldown = cooldownTime;

let loadedSVGs = []; // Para almacenar los SVGs ya cargados

function loadSVG(path) {
    if (loadedSVGs[path]) {
        return Promise.resolve(loadedSVGs[path]);
    }

    return fetch(path)
        .then(response => response.text())
        .then(data => {
            loadedSVGs[path] = data;
            return data;
        })
        .catch(error => {
            console.error("Error loading SVG:", error);
            return "";
        });
}

function updateSVG(element, svgContent) {
    element.innerHTML = svgContent;
    element.style.opacity = "1";  // Asegura que el SVG sea visible después de cargar
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
            loadSVG(svgPaths[svgIndex % svgPaths.length]).then(svgContent => {
                updateSVG(elts.text1, svgContent);
            });
            loadSVG(svgPaths[(svgIndex + 1) % svgPaths.length]).then(svgContent => {
                updateSVG(elts.text2, svgContent);
            });
        }
        doMorph();
    } else {
        doCooldown();
    }
}

animate();
