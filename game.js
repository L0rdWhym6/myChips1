
let tg = window.Telegram.WebApp;
let coins = 0;
let level = 1;
let clickValue = 1;
let boostCost = 100;
let lastDailyBonus = null;
let achievements = {
    coinCollector: { name: "Coin Collector", description: "Collect 1,000 coins", achieved: false },
    bigSpender: { name: "Big Spender", description: "Purchase 10 boosts", achieved: false },
    dailyStreak: { name: "Daily Streak", description: "Claim daily bonus 7 days in a row", achieved: false }
};
let dailyBonusStreak = 0;

let canvas, ctx;
let particles = [];

function checkAchievements() {
    let achievementUnlocked = false;
    if (coins >= 1000 && !achievements.coinCollector.achieved) {
        achievements.coinCollector.achieved = true;
        showNotification("Achievement unlocked: Coin Collector!");
        achievementUnlocked = true;
    }
    if (level >= 11 && !achievements.bigSpender.achieved) {
        achievements.bigSpender.achieved = true;
        showNotification("Achievement unlocked: Big Spender!");
        achievementUnlocked = true;
    }
    if (dailyBonusStreak >= 7 && !achievements.dailyStreak.achieved) {
        achievements.dailyStreak.achieved = true;
        showNotification("Achievement unlocked: Daily Streak!");
        achievementUnlocked = true;
    }
    if (achievementUnlocked) {
        updateDisplay();
    }
}

function claimDailyBonus() {
    const now = new Date();
    if (lastDailyBonus === null || now - new Date(lastDailyBonus) >= 24 * 60 * 60 * 1000) {
        const bonusAmount = 100 * level;
        coins += bonusAmount;
        lastDailyBonus = now.toISOString();
        dailyBonusStreak++;
        updateDisplay();
        showNotification(`Claimed daily bonus: ${bonusAmount} coins! Streak: ${dailyBonusStreak}`);
    } else {
        const timeUntilNextBonus = 24 * 60 * 60 * 1000 - (now - new Date(lastDailyBonus));
        const hoursLeft = Math.floor(timeUntilNextBonus / (60 * 60 * 1000));
        const minutesLeft = Math.floor((timeUntilNextBonus % (60 * 60 * 1000)) / (60 * 1000));
        showNotification(`Next bonus available in ${hoursLeft}h ${minutesLeft}m`);
    }
}

function updateDisplay() {
    coinCountElement.textContent = formatNumber(coins);
    levelElement.textContent = level;
    saveProgress();
    checkAchievements();
}

function saveProgress() {
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const userId = tg.initDataUnsafe.user.id;
        const progress = { coins, level, clickValue, boostCost, lastDailyBonus, dailyBonusStreak, achievements };
        localStorage.setItem(`progress_${userId}`, JSON.stringify(progress));
        showSaveNotification();
    }
}

function loadProgress() {
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const userId = tg.initDataUnsafe.user.id;
        const savedProgress = localStorage.getItem(`progress_${userId}`);
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            coins = progress.coins;
            level = progress.level;
            clickValue = progress.clickValue;
            boostCost = progress.boostCost;
            lastDailyBonus = progress.lastDailyBonus;
            dailyBonusStreak = progress.dailyBonusStreak || 0;
            achievements = progress.achievements || achievements;
            updateDisplay();
            boostButton.textContent = `Boost (Cost: ${boostCost} coins)`;
            updateDailyBonusButton();
        }
        updateUserProfile();
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = 'rgba(0, 0, 255, 0.7)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 100);
    
    setTimeout(() => {
        notification.style.opacity = '0';
    }, 3000);
    
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3300);
}

function updateUserProfile() {
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        const profileElement = document.getElementById('user-profile');
        profileElement.innerHTML = `
            <div class="profile-container">
                <img src="${user.photo_url || 'https://telegram.org/img/t_logo.png'}" alt="Profile Photo" class="profile-photo">
                <div class="profile-info">
                    <p class="profile-name">${user.first_name} ${user.last_name || ''}</p>
                    <p class="profile-username">@${user.username || ''}</p>
                </div>
            </div>
        `;
    }
}

// Add this CSS to your HTML file or create a new style tag
const style = document.createElement('style');
style.textContent = `
    .profile-container {
        display: flex;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 10px;
        margin-bottom: 15px;
    }
    .profile-photo {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 10px;
    }
    .profile-info {
        display: flex;
        flex-direction: column;
    }
    .profile-name {
        font-weight: bold;
        margin: 0;
    }
    .profile-username {
        color: #a0a0a0;
        margin: 0;
        font-size: 0.9em;
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    setupCanvas();
    animate();
    tg.ready();
    
    const coinElement = document.getElementById('coin');
    const coinCountElement = document.getElementById('coinCount');
    const levelElement = document.getElementById('level');
    const boostButton = document.getElementById('boost');
    const dailyBonusButton = document.createElement('button');
    dailyBonusButton.id = 'dailyBonus';
    dailyBonusButton.textContent = 'Claim Daily Bonus';
    document.getElementById('game-container').appendChild(dailyBonusButton);

    const achievementsContainer = document.createElement('div');
    achievementsContainer.id = 'achievements';
    document.getElementById('game-container').appendChild(achievementsContainer);

    const streakElement = document.createElement('div');
    streakElement.id = 'streak';
    document.getElementById('game-container').appendChild(streakElement);

    const userProfileElement = document.createElement('div');
    userProfileElement.id = 'user-profile';
    document.getElementById('game-container').insertBefore(userProfileElement, document.getElementById('game-container').firstChild);

    dailyBonusButton.addEventListener('click', claimDailyBonus);

    updateUserProfile();

    function updateAchievementsDisplay() {
        achievementsContainer.innerHTML = '<h3>Achievements</h3>';
        for (const key in achievements) {
            const achievement = achievements[key];
            const achievementElement = document.createElement('div');
            achievementElement.textContent = `${achievement.name}: ${achievement.achieved ? '✅' : '❌'}`;
            achievementElement.title = achievement.description;
            achievementsContainer.appendChild(achievementElement);
        }
    }

    function updateStreakDisplay() {
        streakElement.textContent = `Daily Bonus Streak: ${dailyBonusStreak}`;
    }

    function updateDisplay() {
        coinCountElement.textContent = formatNumber(coins);
        levelElement.textContent = level;
        updateAchievementsDisplay();
        updateStreakDisplay();
        saveProgress();
        checkAchievements();
    }

    updateDisplay();

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
        saveProgress();
    }

    function saveProgress() {
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            const userId = tg.initDataUnsafe.user.id;
            const progress = { coins, level, clickValue, boostCost, lastDailyBonus };
            localStorage.setItem(`progress_${userId}`, JSON.stringify(progress));
            showSaveNotification();
        }
    }

    function loadProgress() {
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            const userId = tg.initDataUnsafe.user.id;
            const savedProgress = localStorage.getItem(`progress_${userId}`);
            if (savedProgress) {
                const progress = JSON.parse(savedProgress);
                coins = progress.coins;
                level = progress.level;
                clickValue = progress.clickValue;
                boostCost = progress.boostCost;
                lastDailyBonus = progress.lastDailyBonus;
                updateDisplay();
                boostButton.textContent = `Boost (Cost: ${boostCost} coins)`;
                updateDailyBonusButton();
            }
        }
    }

    function updateDailyBonusButton() {
        const now = new Date();
        if (lastDailyBonus === null || now - new Date(lastDailyBonus) >= 24 * 60 * 60 * 1000) {
            dailyBonusButton.textContent = 'Claim Daily Bonus';
            dailyBonusButton.disabled = false;
        } else {
            const timeUntilNextBonus = 24 * 60 * 60 * 1000 - (now - new Date(lastDailyBonus));
            const hoursLeft = Math.floor(timeUntilNextBonus / (60 * 60 * 1000));
            const minutesLeft = Math.floor((timeUntilNextBonus % (60 * 60 * 1000)) / (60 * 1000));
            dailyBonusButton.textContent = `Next bonus in ${hoursLeft}h ${minutesLeft}m`;
            dailyBonusButton.disabled = true;
        }
    }

    loadProgress();
    setInterval(updateDailyBonusButton, 60000); // Update daily bonus button every minute

    function showSaveNotification() {
        const notification = document.createElement('div');
        notification.textContent = 'Progress Saved';
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(0, 255, 0, 0.7)';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 100);
        
        setTimeout(() => {
            notification.style.opacity = '0';
        }, 2000);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 2300);
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
