// Supabase Configuration
const SUPABASE_URL = 'https://cgpejeooxecoyleopamz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncGVqZW9veGVjb3lsZW9wYW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNDEzOTUsImV4cCI6MjA5MTcxNzM5NX0.u5fk5P3I4jMS6EbBKvRoRLs4PLL5SQWm2cZn_U9N5h4';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initLocationCycle();
    initNewsletter();
});

/**
 * Location Cycler - Rotates through specific regions every 3 seconds
 */
function initLocationCycle() {
    const locations = ["Dubai", "Abu Dhabi", "Sharjah", "Fujairah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Saudi Arabia", "Oman", "Bahrain", "Kuwait", "Qatar"];
    const locationEl = document.getElementById('location-text');
    if (!locationEl) return;

    let index = 0;
    setInterval(() => {
        locationEl.classList.add('location-fade');
        setTimeout(() => {
            index = (index + 1) % locations.length;
            locationEl.innerText = locations[index];
            locationEl.classList.remove('location-fade');
        }, 500);
    }, 3000);
}

/**
 * Animated Particle Background - Minimal Edition
 */
function initCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height, particles;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initParticles();
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Smaller particles
            this.size = Math.random() * 1.5 + 0.2;
            // Slower movement
            this.speedX = (Math.random() - 0.5) * 0.15;
            this.speedY = (Math.random() - 0.5) * 0.15;
            this.opacity = Math.random() * 0.3 + 0.05;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > width) this.x = 0;
            if (this.x < 0) this.x = width;
            if (this.y > height) this.y = 0;
            if (this.y < 0) this.y = height;
        }

        draw() {
            // Using a more neutral white with slight variance
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        // Lower density for minimal feel
        const count = Math.floor((width * height) / 20000);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
}

/**
 * Newsletter Form Logic
 */
function initNewsletter() {
    const form = document.getElementById('subscribe-form');
    const btn = document.getElementById('subscribe-btn');

    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // 1. Honeypot check (Instantly ignore if bots fill this hidden field)
        const honeyTrap = form.querySelector('input[name="_honey_trap"]').value;
        if (honeyTrap !== "") {
            console.warn("Spam detected.");
            return;
        }

        const name = document.getElementById('subscriber-name').value.trim();
        const email = document.getElementById('subscriber-email').value.trim();
        
        // 2. Basic Validation
        if (name === "" || email === "") {
            alert("Please fill in all required fields.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        // 3. reCAPTCHA Validation
        const captchaResponse = grecaptcha.getResponse();
        if (captchaResponse.length === 0) {
            alert("Please verify that you are not a robot (reCAPTCHA).");
            return;
        }

        const btnOriginalText = btn.innerHTML;

        btn.innerHTML = 'Subscribing...';
        btn.disabled = true;

        // 4. Save to Supabase (Centralized Database)
        async function saveToSupabase() {
            const { data, error } = await _supabase
                .from('subscribers')
                .insert([
                    { name: name, email: email }
                ]);

            if (error) {
                console.error("Supabase Error:", error);
                // Even if Supabase fails, we proceed to FormSubmit as a backup
            }
        }

        saveToSupabase();

        // 4. Submit to FormSubmit with AJAX
        fetch("https://formsubmit.co/ajax/aravindn210@gmail.com", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                _subject: "New RR2 Global Newsletter Subscriber"
            })
        })
        .then(response => {
            // Success: Redirect to thank you page
            window.location.href = "thank-you.html";
        })
        .catch(error => {
            console.error(error);
            // Fallback: Redirect even on error to ensure user doesn't get stuck
            window.location.href = "thank-you.html";
        });
    });
}
