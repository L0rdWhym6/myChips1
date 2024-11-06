
let tg = window.Telegram.WebApp;
let coins = 0;
let level = 1;
let clickValue = 1;
let boostCost = 100;

let canvas, ctx;
let particles = [];

document.addEventListener('DOMContentLoaded', () => {
    setupCanvas();
    animate();
    tg.ready();
    
    const coinElement = document.getElementById('coin');
    const coinCountElement = document.getElementById('coinCount');
    const levelElement = document.getElementById('level');
    const boostButton = document.getElementById('boost');

    coinElement.addEventListener('click', () => {
        coins += clickValue;
        updateDisplay();
        animateCoinClick();
        createCoinClickParticles(event.clientX, event.clientY);
    });

    boostButton.addEventListener('click', () => {
        if (coins >= boostCost) {
            coins -= boostCost;
            clickValue *= 2;
            boostCost *= 2;
            level++;
            updateDisplay();
            boostButton.textContent = `Boost (Cost: ${boostCost} coins)`;
            animateBoost();
        } else {
            shakeButton();
        }
    });

    function updateDisplay() {
        coinCountElement.textContent = formatNumber(coins);
        levelElement.textContent = level;
    }

    function animateCoinClick() {
        coinElement.style.transform = 'scale(1.1)';
        setTimeout(() => {
            coinElement.style.transform = 'scale(1)';
        }, 100);
    }

    function animateBoost() {
        boostButton.style.transform = 'scale(1.1)';
        setTimeout(() => {
            boostButton.style.transform = 'scale(1)';
        }, 100);
    }

    function shakeButton() {
        boostButton.style.animation = 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both';
        boostButton.addEventListener('animationend', () => {
            boostButton.style.animation = '';
        });
    }

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Load saved progress
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const userId = tg.initDataUnsafe.user.id;
        const savedProgress = localStorage.getItem(`progress_${userId}`);
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            coins = progress.coins;
            level = progress.level;
            clickValue = progress.clickValue;
            boostCost = progress.boostCost;
            updateDisplay();
            boostButton.textContent = `Boost (Cost: ${boostCost} coins)`;
        }
    }

    // Save progress when closing the game
    window.addEventListener('beforeunload', () => {
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            const userId = tg.initDataUnsafe.user.id;
            const progress = { coins, level, clickValue, boostCost };
            localStorage.setItem(`progress_${userId}`, JSON.stringify(progress));
        }
    });
});

// Add this CSS to your HTML file or create a new style tag
const style = document.createElement('style');
style.textContent = `
@keyframes shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
    40%, 60% { transform: translate3d(4px, 0, 0); }
}`;
document.head.appendChild(style);

function setupCanvas() {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '-1';
    document.body.insertBefore(canvas, document.body.firstChild);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

function createParticle(x, y) {
    return {
        x,
        y,
        size: Math.random() * 5 + 1,
        speedX: Math.random() * 3 - 1.5,
        speedY: Math.random() * 3 - 1.5,
        color: `hsl(${Math.random() * 60 + 30}, 100%, 50%)`,
    };
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create new background particles
    if (particles.length < 50) {
        particles.push(createParticle(Math.random() * canvas.width, Math.random() * canvas.height));
    }

    // Update and draw particles
    particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.size > 0.2) particle.size -= 0.05;

        if (particle.x < 0 || particle.x > canvas.width || particle.y < 0 || particle.y > canvas.height || particle.size <= 0.2) {
            particles.splice(index, 1);
        }

        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(animate);
}

function createCoinClickParticles(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x,
            y,
            size: Math.random() * 8 + 2,
            speedX: Math.random() * 6 - 3,
            speedY: Math.random() * 6 - 3,
            color: `hsl(${Math.random() * 60 + 30}, 100%, 50%)`,
        });
    }
}
