
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
    });

    boostButton.addEventListener('click', () => {
        if (coins >= boostCost) {
            coins -= boostCost;
            clickValue *= 2;
            boostCost *= 2;
            level++;
            updateDisplay();
            boostButton.textContent = `Boost (Cost: ${boostCost} coins)`;
        }
    });

    function updateDisplay() {
        coinCountElement.textContent = coins;
        levelElement.textContent = level;
    }

    // Попытка загрузить сохраненный прогресс
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

    // Сохранение прогресса при закрытии игры
    window.addEventListener('beforeunload', () => {
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            const userId = tg.initDataUnsafe.user.id;
            const progress = { coins, level, clickValue, boostCost };
            localStorage.setItem(`progress_${userId}`, JSON.stringify(progress));
        }
    });
});
