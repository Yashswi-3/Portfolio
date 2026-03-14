/* ============================================================
   Theme Toggle
   ============================================================ */
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon   = document.getElementById('theme-icon');
const body        = document.body;

// Apply saved or system-preferred theme on load
(function applyInitialTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
        body.classList.add('dark-mode');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
})();

// Toggle theme + update Three.js particle colour in one listener
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    themeIcon.classList.replace(isDark ? 'fa-moon' : 'fa-sun', isDark ? 'fa-sun' : 'fa-moon');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    // Notify Three.js to update particle colour (set by initThreeJSBackground)
    if (typeof window.__updateParticleColor === 'function') {
        window.__updateParticleColor(isDark);
    }
});

/* ============================================================
   Three.js Background
   ============================================================ */
function initThreeJSBackground() {
    const canvas   = document.getElementById('bg');
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // cap to avoid GPU overload

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 6);
    scene.add(directionalLight);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount    = 2000;
    const posArray          = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        transparent: true,
        color: body.classList.contains('dark-mode') ? 0x6d8dff : 0x4a6cf7,
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Expose colour updater so the theme toggle can call it
    window.__updateParticleColor = (isDark) => {
        particlesMaterial.color.set(isDark ? 0x6d8dff : 0x4a6cf7);
    };

    // Geometric shapes
    const shapes       = [];
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);

    const addShape = (geometry, color, position) => {
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, wireframe: true }));
        mesh.position.set(...position);
        objectsGroup.add(mesh);
        shapes.push(mesh);
    };

    addShape(new THREE.DodecahedronGeometry(0.3),         0x6a11cb, [-2,    1,   -1]);
    addShape(new THREE.OctahedronGeometry(0.4),           0x4a6cf7, [ 2,   -1,   -2]);
    addShape(new THREE.TorusKnotGeometry(0.3, 0.1, 64, 8), 0xff6b6b, [ 1.5,  1.5, -3]);
    addShape(new THREE.IcosahedronGeometry(0.35),          0x6a11cb, [-1.5, -1.2, -2.5]);

    camera.position.z = 4;

    // Mouse tracking (passive — never calls preventDefault)
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX - window.innerWidth  / 2;
        mouseY = e.clientY - window.innerHeight / 2;
    }, { passive: true });

    // Debounced resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, 150);
    }, { passive: true });

    // Pause rendering when tab is not visible (saves CPU/GPU)
    let animating = true;
    document.addEventListener('visibilitychange', () => {
        animating = !document.hidden;
        if (animating) animate();
    });

    // Animation loop
    function animate() {
        if (!animating) return;
        requestAnimationFrame(animate);

        particlesMesh.rotation.x += 0.0005;
        particlesMesh.rotation.y += 0.0005;

        const now = Date.now(); // cache once per frame
        shapes.forEach((shape, i) => {
            shape.rotation.x += 0.003 + i * 0.001;
            shape.rotation.y += 0.004 + i * 0.001;
            shape.rotation.z += 0.002 + i * 0.001;
            shape.position.y += Math.sin(now * 0.001 + i) * 0.002;
        });

        camera.position.x += (mouseX * 0.0005 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 0.0005 - camera.position.y) * 0.05;

        renderer.render(scene, camera);
    }

    animate();
}

window.addEventListener('load', initThreeJSBackground);

/* ============================================================
   EmailJS Initialisation
   ============================================================ */
(function () {
    emailjs.init("V9FUbVugnWPN5QSsq");
})();

/* ============================================================
   Contact Form Submission
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        emailjs.sendForm('service_lym9hkq', 'template_gobzfaa', this)
            .then(() => {
                alert('✅ Message sent successfully!');
                form.reset();
            }, (error) => {
                alert('❌ Failed to send message: ' + error.text);
            });
    });
});

/* ============================================================
   Scroll-Reveal Effect
   (CSS defines section opacity:0 + .revealed state)
   ============================================================ */
const revealSections = document.querySelectorAll('section'); // cached outside handler

function revealOnScroll() {
    const viewportHeight = window.innerHeight;
    revealSections.forEach((section) => {
        if (section.getBoundingClientRect().top < viewportHeight * 0.75) {
            section.classList.add('revealed');
        }
    });
}

window.addEventListener('scroll', revealOnScroll, { passive: true });
window.addEventListener('load',   revealOnScroll);

/* ============================================================
   Scroll-Activated Navbar
   ============================================================ */
window.addEventListener('scroll', function () {
    const navbar = document.getElementById('main-navbar');
    navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });