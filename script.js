const body = document.body;
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const navbar = document.getElementById('main-navbar');
const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

function applyTheme(theme) {
    const isDark = theme === 'dark';
    body.classList.toggle('dark-mode', isDark);

    if (themeIcon) {
        themeIcon.classList.toggle('fa-moon', !isDark);
        themeIcon.classList.toggle('fa-sun', isDark);
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark' || savedTheme === 'light') {
        applyTheme(savedTheme);
        return;
    }

    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
}

function toggleTheme() {
    const nextTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
}

function initThreeJSBackground() {
    const canvas = document.getElementById('bg');

    if (!canvas || typeof THREE === 'undefined') {
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / Math.max(window.innerHeight, 1), 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 6);
    scene.add(directionalLight);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 1) {
        posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        transparent: true,
        opacity: 0.72,
        color: 0x6d8dff
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    const shapes = [];
    const shapeMaterials = [];
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);

    const themePalettes = {
        dark: {
            particleColor: 0x6d8dff,
            particleOpacity: 0.72,
            particleSize: 0.02,
            shapeOpacity: 0.78,
            shapeColors: [0x5f8cff, 0x45b7d8, 0xff8b4b, 0x7c6cff]
        },
        light: {
            particleColor: 0x3f6fa5,
            particleOpacity: 0.42,
            particleSize: 0.016,
            shapeOpacity: 0.38,
            shapeColors: [0x547faf, 0x4f95b7, 0xd98752, 0x6b79a8]
        }
    };

    const addShape = (geometry, color, position) => {
        const material = new THREE.MeshStandardMaterial({
            color,
            wireframe: true,
            transparent: true,
            opacity: 0.78
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...position);
        objectsGroup.add(mesh);
        shapes.push(mesh);
        shapeMaterials.push(material);
    };

    addShape(new THREE.DodecahedronGeometry(0.3), 0x5f8cff, [-2, 1, -1]);
    addShape(new THREE.OctahedronGeometry(0.4), 0x45b7d8, [2, -1, -2]);
    addShape(new THREE.TorusKnotGeometry(0.3, 0.1, 64, 8), 0xff8b4b, [1.5, 1.5, -3]);
    addShape(new THREE.IcosahedronGeometry(0.35), 0x7c6cff, [-1.5, -1.2, -2.5]);

    const updateSceneTheme = () => {
        const mode = body.classList.contains('dark-mode') ? 'dark' : 'light';
        const palette = themePalettes[mode];
        particlesMaterial.color.setHex(palette.particleColor);
        particlesMaterial.opacity = palette.particleOpacity;
        particlesMaterial.size = palette.particleSize;

        shapeMaterials.forEach((material, index) => {
            const nextColor = palette.shapeColors[index % palette.shapeColors.length];
            material.color.setHex(nextColor);
            material.opacity = palette.shapeOpacity;
        });
    };

    updateSceneTheme();

    camera.position.z = 4;

    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener(
        'mousemove',
        (event) => {
            mouseX = event.clientX - window.innerWidth / 2;
            mouseY = event.clientY - window.innerHeight / 2;
        },
        { passive: true }
    );

    const resizeRenderer = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.aspect = width / Math.max(height, 1);
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
    };

    resizeRenderer();
    window.addEventListener('resize', resizeRenderer);

    const updateParticleColor = () => {
        updateSceneTheme();
    };

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            requestAnimationFrame(updateParticleColor);
        });
    }

    const animate = () => {
        requestAnimationFrame(animate);

        particlesMesh.rotation.x += 0.0005;
        particlesMesh.rotation.y += 0.0005;

        shapes.forEach((shape, index) => {
            shape.rotation.x += 0.003 + index * 0.001;
            shape.rotation.y += 0.004 + index * 0.001;
            shape.rotation.z += 0.002 + index * 0.001;
            shape.position.y += Math.sin(Date.now() * 0.001 + index) * 0.002;
        });

        camera.position.x += (mouseX * 0.0005 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 0.0005 - camera.position.y) * 0.05;

        renderer.render(scene, camera);
    };

    animate();
}

function initReveal() {
    const revealElements = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
        revealElements.forEach((el) => el.classList.add('in-view'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.16,
            rootMargin: '0px 0px -35px 0px'
        }
    );

    revealElements.forEach((el) => observer.observe(el));
}

function setNavbarState() {
    if (!navbar) {
        return;
    }

    navbar.classList.toggle('scrolled', window.scrollY > 24);
}

function smoothScrollToTarget(event) {
    const href = event.currentTarget.getAttribute('href');
    if (!href || !href.startsWith('#')) {
        return;
    }

    const target = document.querySelector(href);
    if (!target) {
        return;
    }

    event.preventDefault();
    const offset = navbar ? navbar.offsetHeight + 12 : 0;
    const targetTop = target.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
    });

    const collapseMenu = document.querySelector('.navbar-collapse.show');
    if (collapseMenu) {
        collapseMenu.classList.remove('show');
    }
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitBtn = form ? form.querySelector('.submit-btn') : null;
    const honeypotInput = form ? form.querySelector('input[name="company"]') : null;
    const MIN_SUBMIT_INTERVAL_MS = 12000;
    let isSubmitting = false;
    let lastSubmittedAt = 0;

    const setSubmitState = (submitting) => {
        if (!submitBtn) {
            return;
        }

        submitBtn.disabled = submitting;
        submitBtn.setAttribute('aria-disabled', String(submitting));
        submitBtn.textContent = submitting ? 'Sending...' : 'Send Message';
    };

    const explainEmailJsError = (error) => {
        const status = error && (error.status || error.statusCode);
        const text = error && typeof error.text === 'string' ? error.text.trim() : '';

        if (status === 401) {
            return 'Email service auth failed (invalid public key).';
        }

        if (status === 403) {
            return 'This website domain is not allowed in EmailJS settings.';
        }

        if (status === 404) {
            return 'EmailJS service ID or template ID was not found.';
        }

        if (status === 429) {
            return 'Too many requests. Please try again in a minute.';
        }

        if (text) {
            return text;
        }

        return 'Unknown EmailJS error.';
    };

    if (!form) {
        return;
    }

    if (typeof emailjs === 'undefined') {
        if (formStatus) {
            formStatus.classList.remove('is-success');
            formStatus.classList.add('is-error');
            formStatus.textContent = 'Contact service is unavailable right now. Please email me directly.';
        }
        return;
    }

    emailjs.init('V9FUbVugnWPN5QSsq');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        if (honeypotInput && honeypotInput.value.trim() !== '') {
            if (formStatus) {
                formStatus.classList.remove('is-error');
                formStatus.classList.add('is-success');
                formStatus.textContent = 'Message sent successfully. Thank you for reaching out.';
            }
            form.reset();
            return;
        }

        const msSinceLastSubmit = Date.now() - lastSubmittedAt;
        if (lastSubmittedAt !== 0 && msSinceLastSubmit < MIN_SUBMIT_INTERVAL_MS) {
            if (formStatus) {
                const secondsLeft = Math.ceil((MIN_SUBMIT_INTERVAL_MS - msSinceLastSubmit) / 1000);
                formStatus.classList.remove('is-success');
                formStatus.classList.add('is-error');
                formStatus.textContent = `Please wait ${secondsLeft} seconds before sending another message.`;
            }
            return;
        }

        if (formStatus) {
            formStatus.classList.remove('is-success', 'is-error');
            formStatus.textContent = 'Sending message...';
        }

        isSubmitting = true;
        setSubmitState(true);

        try {
            await emailjs.sendForm('service_lym9hkq', 'template_gobzfaa', form);
            form.reset();
            lastSubmittedAt = Date.now();
            if (formStatus) {
                formStatus.classList.remove('is-error');
                formStatus.classList.add('is-success');
                formStatus.textContent = 'Message sent successfully. Thank you for reaching out.';
            }
        } catch (error) {
            const reason = explainEmailJsError(error);
            if (formStatus) {
                formStatus.classList.remove('is-success');
                formStatus.classList.add('is-error');
                formStatus.textContent = `Message failed: ${reason} Please try again or email me directly.`;
            }
            console.error('EmailJS error:', error);
        } finally {
            isSubmitting = false;
            setSubmitState(false);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initThreeJSBackground();
    initReveal();
    initContactForm();
    setNavbarState();

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', smoothScrollToTarget);
    });

    window.addEventListener('scroll', setNavbarState, { passive: true });
});
