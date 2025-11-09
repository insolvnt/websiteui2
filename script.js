const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.opacity = Math.random() * 0.5;
        this.growing = true;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.growing) {
            this.opacity += 0.01;
            if (this.opacity >= 0.5) this.growing = false;
        } else {
            this.opacity -= 0.01;
            if (this.opacity <= 0) {
                this.reset();
                this.growing = true;
            }
        }

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }

    draw() {
        ctx.fillStyle = `rgba(42, 54, 171, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    requestAnimationFrame(animate);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
init();
animate();

// Intersection Observer for animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('.feature-card, .hero-content, .hero-preview').forEach(el => {
    observer.observe(el);
});

// Add this at the beginning of your script
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelector('.loading-screen').classList.add('fade-out');
    }, 1500); // Adjust time as needed
});

// Add this to your existing script.js
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const answer = button.nextElementSibling;
        const isActive = button.classList.contains('active');
        
        // Close all other FAQs
        document.querySelectorAll('.faq-question').forEach(otherButton => {
            if (otherButton !== button) {
                otherButton.classList.remove('active');
                otherButton.nextElementSibling.classList.remove('active');
            }
        });
        
        // Toggle current FAQ
        button.classList.toggle('active');
        answer.classList.toggle('active');
    });
});

// Add this to your existing script.js
document.querySelector('.btn-secondary').addEventListener('click', () => {
    document.querySelector('.modal-overlay').classList.add('active');
});

document.querySelector('.modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.querySelector('.modal-overlay')) {
        document.querySelector('.modal-overlay').classList.remove('active');
        // Reset step indicator and progress
        document.querySelector('.step-indicator').textContent = '(1/2)';
        document.querySelector('.progress').classList.remove('completed');
    }
});

document.getElementById('generateBtn').addEventListener('click', async () => {
    if (!canGenerateKey()) {
        showToast('Daily key generation limit reached. Please try again tomorrow.');
        return;
    }

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = 'insolvnt-';
    
    for (let i = 0; i < 8; i++) {
        key += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Calculate expiry date (1 day from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1);
    
    // Create key data
    const keyData = {
        key: key,
        'expired-date': expiryDate.toISOString(),
        'is-premium': false
    };
    
    try {
        const response = await fetch('/save-key', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(keyData)
        });
        
        if (response.ok) {
            incrementKeyGenCount();
            const keyDisplay = document.getElementById('keyDisplay');
            keyDisplay.textContent = key;
            keyDisplay.classList.add('active');
            
            // Show the copy button
            document.getElementById('copyBtn').style.display = 'flex';
            
            const toast = document.getElementById('toast');
            toast.classList.add('active');
            
            setTimeout(() => {
                toast.classList.remove('active');
            }, 3000);
        }
    } catch (error) {
        console.error('Error saving key:', error);
    }
});

document.getElementById('joinDiscordBtn').addEventListener('click', () => {
    window.open('https://discord.gg/9sSP3UyjQQ', '_blank');
    
    // Update step indicator and progress
    document.querySelector('.step-indicator').textContent = '(2/2)';
    document.querySelector('.progress').classList.add('completed');
    
    // Change modal content after Discord link is clicked
    document.getElementById('modalText').textContent = 'To further access insolvnt feature more freely, you will need to generate a key.';
    document.getElementById('joinDiscordBtn').style.display = 'none';
    document.getElementById('generateBtn').style.display = 'flex';
});

const copyBtn = document.getElementById('copyBtn');

copyBtn.addEventListener('click', async () => {
    const keyDisplay = document.getElementById('keyDisplay');
    const key = keyDisplay.textContent;
    
    try {
        await navigator.clipboard.writeText(key);
        // Optional: Show success message
        showToast('Key copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy key:', err);
    }
});

// Add this to your existing script.js
// Add this function at the top of your script
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.querySelector('span').textContent = message;
    toast.classList.add('active');
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

function canGenerateKey() {
    const today = new Date().toDateString();
    const keyGenData = JSON.parse(localStorage.getItem('keyGeneration') || '{"date":"", "count":0}');
    
    if (keyGenData.date !== today) {
        // Reset counter for new day
        localStorage.setItem('keyGeneration', JSON.stringify({ date: today, count: 0 }));
        return true;
    }
    
    return keyGenData.count < 2;
}

function incrementKeyGenCount() {
    const today = new Date().toDateString();
    const keyGenData = JSON.parse(localStorage.getItem('keyGeneration') || '{"date":"", "count":0}');
    
    if (keyGenData.date !== today) {
        localStorage.setItem('keyGeneration', JSON.stringify({ date: today, count: 1 }));
    } else {
        localStorage.setItem('keyGeneration', JSON.stringify({ 
            date: today, 
            count: keyGenData.count + 1 
        }));
    }
}

// Update the download modal code
// ... existing code ...

// Update download buttons
document.querySelectorAll('.cta-group .btn-primary, .pricing-card:not(.popular) .btn-primary').forEach(downloadBtn => {
    downloadBtn.addEventListener('click', () => {
        // Open GoFile link in a new tab
        window.open('https://drive.google.com/drive/folders/1HgUhX2jv9r636jAFGGdaIiQMKnbbZERE', 'https://drive.google.com/drive/folders/1HgUhX2jv9r636jAFGGdaIiQMKnbbZERE', 'noopener,noreferrer');
    });
});
