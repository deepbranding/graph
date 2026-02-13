// ======= MORPHING SVG SETUP =======
const elts = {
    text1: document.getElementById("text1"),
    text2: document.getElementById("text2")
};

const svgPaths = Array.from({ length: 34 }, (_, i) =>
    `svgs/Sin título-1-${(i + 1).toString().padStart(2, '0')}.svg`
);

let svgIndex = 0;
let morph = 0;
let cooldown = 0.25;
const morphTime = 1;
const cooldownTime = 0.25;
let time = new Date();
let svgCache = {};

function preloadSVGs() {
    svgPaths.forEach(path =>
        fetch(path)
            .then(res => res.text())
            .then(data => svgCache[path] = data)
            .catch(console.error)
    );
}

function loadSVG(el, path) {
    if (svgCache[path]) {
        el.innerHTML = svgCache[path];
    } else {
        fetch(path)
            .then(res => res.text())
            .then(data => {
                svgCache[path] = data;
                el.innerHTML = data;
            });
    }
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
    const newTime = new Date();
    const shouldIncrementIndex = cooldown > 0;
    const dt = (newTime - time) / 1000;
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

preloadSVGs();
loadSVG(elts.text1, svgPaths[svgIndex % svgPaths.length]);
loadSVG(elts.text2, svgPaths[(svgIndex + 1) % svgPaths.length]);
animate();

// ======= SCRAMBLE TEXT EFFECT =======

// Función para hacer el efecto de scramble en el texto
function scrambleText(element, options = {}) {
    const {
        stepTime = 25,
        stepsPerChar = 5,
        characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:',.<>?/`~"
    } = options;

    const originalHTML = element.innerHTML;
    const tempSpan = document.createElement('span');
    tempSpan.innerHTML = originalHTML;
    const finalText = tempSpan.textContent;

    const finalChars = finalText.split('');
    const charStates = finalChars.map(c => ({
        finalChar: c,
        stepsLeft: Math.floor(Math.random() * stepsPerChar) + 1,
        isSpace: c === ' '
    }));

    let frame = 0;
    const interval = setInterval(() => {
        let result = '';
        let allDone = true;

        for (let state of charStates) {
            if (state.isSpace) {
                result += ' ';
                continue;
            }

            if (state.stepsLeft > 0) {
                state.stepsLeft--;
                result += characters[Math.floor(Math.random() * characters.length)];
                allDone = false;
            } else {
                result += state.finalChar;
            }
        }

      // Reinsertar HTML con tags originales sin romper etiquetas
const wrapper = document.createElement('div');
wrapper.innerHTML = originalHTML;

let charIndex = 0;

function replaceTextNodes(node) {
    for (let child of node.childNodes) {
        if (child.nodeType === 3) { // Text node
            const text = child.textContent;
            const scrambledPart = result.slice(charIndex, charIndex + text.length);
            child.textContent = scrambledPart;
            charIndex += text.length;
        } else {
            replaceTextNodes(child);
        }
    }
}

replaceTextNodes(wrapper);
element.innerHTML = wrapper.innerHTML;


        if (allDone) clearInterval(interval);
        frame++;
    }, stepTime);
}

window.addEventListener("load", () => {
    const textElement = document.getElementById("dynamic-text");
    scrambleText(textElement, {
        stepTime: 90,
        stepsPerChar: 10,
        characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|:;,<>./?~"
    });
});

