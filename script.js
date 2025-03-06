const elts = {
    text1: document.getElementById("text1"),
    text2: document.getElementById("text2")
};

const svgPaths = [...Array(31).keys()].map(i => `svgs/Sin título-1-${String(i + 1).padStart(2, '0')}.svg`);

const morphTime = 1.5; // Ajustado para mejor sincronización
const cooldownTime = 0.4;
let svgIndex = 0;
let time = new Date();
let morph = 0;
let cooldown = cooldownTime;
let isLoading = false;

function loadSVG(element, path, callback) {
    isLoading = true;
    fetch(path)
        .then(response => response.text())
        .then(data => {
            element.innerHTML = data;
            isLoading = false;
            if (callback) callback();
        })
        .catch(error => {
            console.error("Error loading SVG:", error);
            isLoading = false;
        });
}

// Cargar los dos primeros SVGs
loadSVG(elts.text1, svgPaths[svgIndex], () => {
    loadSVG(elts.text2, svgPaths[(svgIndex + 1) % svgPaths.length]);
});

function doMorph() {
    morph -= cooldown;
    cooldown = 0;
    let fraction = morph / morphTime;
    fraction = Math.min(Math.max(fraction, 0), 1);
    setMorph(fraction);
}

function setMorph(fraction) {
    const ease = fraction ** 0.5;
    elts.text2.style.filter = `blur(${(1 - ease) * 5}px)`;
    elts.text2.style.opacity = `${ease * 100}%`;
    elts.text1.style.filter = `blur(${ease * 5}px)`;
    elts.text1.style.opacity = `${(1 - ease) * 100}%`;
}

function doCooldown() {
    morph = 0;
    elts.text2.style.filter = "";
    elts.text2.style.opacity = "100%";
    elts.text1.style.filter = "";
    elts.text1.style.opacity = "0%";
}

function nextSVG() {
    if (isLoading) return;
    svgIndex = (svgIndex + 1) % svgPaths.length;
    loadSVG(elts.text1, svgPaths[svgIndex], () => {
        elts.text1.style.opacity = "0%";
        loadSVG(elts.text2, svgPaths[(svgIndex + 1) % svgPaths.length]);
    });
}

function animate() {
    requestAnimationFrame(animate);
    let newTime = new Date();
    let dt = (newTime - time) / 1000;
    time = newTime;
    cooldown -= dt;

    if (cooldown <= 0) {
        nextSVG();
        cooldown = cooldownTime;
    }

    doMorph();
}

animate();
