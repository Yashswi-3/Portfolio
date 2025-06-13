// Theme Toggle Functionality
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const body = document.body;

// Check for saved theme preference or use preferred color scheme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    themeIcon.classList.replace('fa-moon', 'fa-sun');
} else if (savedTheme === 'light') {
    body.classList.remove('dark-mode');
    themeIcon.classList.replace('fa-sun', 'fa-moon');
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    body.classList.add('dark-mode');
    themeIcon.classList.replace('fa-moon', 'fa-sun');
}

// Toggle theme when the icon is clicked
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    }
});

// 3D Background with Three.js
function initThreeJSBackground() {
    const canvas = document.getElementById('bg');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Add lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 6);
    scene.add(directionalLight);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        transparent: true,
        color: body.classList.contains('dark-mode') ? 0x6d8dff : 0x4a6cf7
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Geometric shapes
    const shapes = [];
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);

    const addShape = (geometry, color, position) => {
        const material = new THREE.MeshStandardMaterial({ color, wireframe: true });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...position);
        objectsGroup.add(mesh);
        shapes.push(mesh);
    };

    addShape(new THREE.DodecahedronGeometry(0.3), 0x6a11cb, [-2, 1, -1]);
    addShape(new THREE.OctahedronGeometry(0.4), 0x4a6cf7, [2, -1, -2]);
    addShape(new THREE.TorusKnotGeometry(0.3, 0.1, 64, 8), 0xff6b6b, [1.5, 1.5, -3]);
    addShape(new THREE.IcosahedronGeometry(0.35), 0x6a11cb, [-1.5, -1.2, -2.5]);

    camera.position.z = 4;

    // Mouse tracking
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', e => {
        mouseX = e.clientX - window.innerWidth / 2;
        mouseY = e.clientY - window.innerHeight / 2;
    });

    // Resize handling
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Theme color update for particles
    themeToggle.addEventListener('click', () => {
        const newColor = body.classList.contains('dark-mode') ? 0x6d8dff : 0x4a6cf7;
        particlesMaterial.color.set(newColor);
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        particlesMesh.rotation.x += 0.0005;
        particlesMesh.rotation.y += 0.0005;

        shapes.forEach((shape, i) => {
            shape.rotation.x += 0.003 + (i * 0.001);
            shape.rotation.y += 0.004 + (i * 0.001);
            shape.rotation.z += 0.002 + (i * 0.001);
            shape.position.y += Math.sin(Date.now() * 0.001 + i) * 0.002;
        });

        camera.position.x += (mouseX * 0.0005 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 0.0005 - camera.position.y) * 0.05;

        renderer.render(scene, camera);
    }

    animate();
}
window.addEventListener('load', initThreeJSBackground);

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Form submission
(function () {
  emailjs.init("V9FUbVugnWPN5QSsq"); // 🔁 Replace with your actual public key
})();

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      emailjs.sendForm("service_lym9hkq", "template_gobzfaa", this)
        .then(function () {
          alert("✅ Message sent successfully!");
          form.reset();
        }, function (error) {
          alert("❌ Failed to send message: " + error.text);
        });
    });
  }
});


// Scroll reveal effect
function revealOnScroll() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const top = section.getBoundingClientRect().top;
        const height = window.innerHeight;
        if (top < height * 0.75) section.classList.add('revealed');
    });
}
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// Add scroll animation CSS
const style = document.createElement('style');
style.textContent = `
    section {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s ease, transform 0.8s ease;
    }
    section.revealed {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

// Typing effect
function typeEffect() {
    const header = document.querySelector('.header-content h2');
    if (!header) return;
    const text = header.textContent;
    header.textContent = '';
    let i = 0;
    const typing = setInterval(() => {
        if (i < text.length) {
            header.textContent += text.charAt(i++);
        } else {
            clearInterval(typing);
        }
    }, 100);
}
window.addEventListener('load', typeEffect);

// Scroll-activated navbar
window.addEventListener('scroll', function() {
  const navbar = document.getElementById('main-navbar');
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});
