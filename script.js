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

let svgIndex = 0;
let text1SVG = new Image();
let text2SVG = new Image();

// Función para cargar el SVG de manera eficiente
function loadSVG(element, path, isText1 = true) {
    const img = new Image();
    img.onload = function () {
        element.innerHTML = ''; // Limpiar el contenido anterior
        element.appendChild(img);
        element.classList.add("visible");
    };
    img.src = path;
}

// Función para iniciar la animación
function startAnimation() {
    loadSVG(elts.text1, svgPaths[svgIndex % svgPaths.length]);
    loadSVG(elts.text2, svgPaths[(svgIndex + 1) % svgPaths.length]);

    animate();
}

// Función para manejar la animación de transición
function animate() {
    setTimeout(() => {
        elts.text1.classList.remove("visible");
        elts.text2.classList.remove("visible");

        svgIndex++;
        loadSVG(elts.text1, svgPaths[svgIndex % svgPaths.length]);
        loadSVG(elts.text2, svgPaths[(svgIndex + 1) % svgPaths.length]);

        setTimeout(() => {
            elts.text1.classList.add("visible");
            elts.text2.classList.add("visible");
        }, 100);

        animate();
    }, 3000);  // Cambiar el SVG cada 3 segundos
}

startAnimation();  // Comienza la animación
