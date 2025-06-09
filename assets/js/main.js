document.addEventListener("DOMContentLoaded", function() {
    var colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3", "#54a0ff"];
    var randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    new SweetScroll({});
    
    particlesJS("particles-js", {
        particles: {
            number: { value: 160, density: { enable: true, value_area: 500 } },
            color: { value: randomColor },
            shape: {
                type: "circle",
                stroke: { width: 0, color: "#000000" },
                polygon: { nb_sides: 5 },
                image: { src: "img/github.svg", width: 100, height: 100 }
            },
            opacity: {
                value: 1,
                random: true,
                anim: { enable: true, speed: 1, opacity_min: 0, sync: false }
            },
            size: {
                value: 3,
                random: true,
                anim: { enable: false, speed: 4, size_min: 0.3, sync: false }
            },
            line_linked: {
                enable: false,
                distance: 150,
                color: "#ffffff",
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 1,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: { enable: false, rotateX: 600, rotateY: 600 }
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: false, mode: "bubble" },
                onclick: { enable: false, mode: "repulse" },
                resize: true
            },
            modes: {
                grab: { distance: 400, line_linked: { opacity: 1 } },
                b