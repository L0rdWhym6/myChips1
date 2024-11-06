
let tg = window.Telegram.WebApp;
let coins = 0;
let level = 1;
let clickValue = 1;
let boostCost = 100;

document.addEventListener('DOMContentLoaded', () => {
    tg.ready();
    
    const coinElement = document.getElementById('coin');
    const coinCountElement = document.getElementById('coinCount');
    const levelElement = document.getElementById('level');
    const boostButton = document.getElementById('boost');

    coinElement.addEventListener('click', () => {
        coins += clickValue;
        updateDisplay();
        animateCoinClick();
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
