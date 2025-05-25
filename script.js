// Игровые переменные
let energy = 0;
let level = 1;
let currentEnemyHealth = 100;
let maxEnemyHealth = 100;
let clickDamage = 1;
let enemyDefeated = 0;
let criticalChance = 0.1; // 10% шанс крита

// Оружие
const weapons = [
    { id: 1, name: "Лазерный пистолет", damage: 1, cost: 50, img: "🔫", owned: false },
    { id: 2, name: "Плазменная пушка", damage: 5, cost: 200, img: "💥", owned: false },
    { id: 3, name: "Квантовый меч", damage: 10, cost: 500, img: "⚔️", owned: false },
    { id: 4, name: "Гравитационная бомба", damage: 20, cost: 1000, img: "💣", owned: false },
];

// Навыки
const skills = [
    { id: 1, name: "Улучшенные клики", description: "+1 урон за клик", cost: 100, unlocked: false },
    { id: 2, name: "Критический удар", description: "Шанс 10% на 2x урон", cost: 200, unlocked: false },
    { id: 3, name: "Авто-стрельба", description: "1 урон каждую секунду", cost: 300, unlocked: false },
];

// Элементы DOM
const energyElement = document.getElementById('energy');
const levelElement = document.getElementById('level');
const healthElement = document.getElementById('health');
const enemyImg = document.getElementById('enemy-img');
const clickArea = document.getElementById('click-area');
const weaponsContainer = document.getElementById('weapons');
const skillTreeContainer = document.getElementById('skill-tree');

// Клик по врагу
clickArea.addEventListener('click', (e) => {
    // Проверка на крит
    const isCritical = Math.random() < criticalChance;
    let damage = clickDamage;
    
    if (isCritical) {
        damage *= 2;
        showCriticalText(e.clientX, e.clientY);
    }
    
    // Урон врагу
    currentEnemyHealth -= damage;
    updateEnemyHealth();
    
    // Анимация удара
    enemyImg.style.animation = 'none';
    void enemyImg.offsetWidth;
    enemyImg.style.animation = 'hit 0.3s';
    
    // Создание частиц
    createParticles(e.clientX, e.clientY, isCritical);
    
    // Проверка смерти врага
    if (currentEnemyHealth <= 0) {
        defeatEnemy();
    }
});

// Показать текст крита
function showCriticalText(x, y) {
    const critText = document.createElement('div');
    critText.className = 'critical';
    critText.textContent = 'CRIT!';
    critText.style.left = `${x}px`;
    critText.style.top = `${y - 50}px`;
    document.body.appendChild(critText);
    
    setTimeout(() => {
        critText.remove();
    }, 500);
}

// Создание частиц
function createParticles(x, y, isCritical) {
    const colors = isCritical 
        ? ['gold', 'orange', 'red'] 
        : ['#ff5555', '#55ff55', '#5555ff', '#ffff55'];
    
    for (let i = 0; i < (isCritical ? 16 : 8); i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.width = isCritical ? '8px' : '6px';
        particle.style.height = isCritical ? '8px' : '6px';
        document.body.appendChild(particle);
        
        const angle = Math.random() * Math.PI * 2;
        const speed = isCritical ? 4 + Math.random() * 4 : 2 + Math.random() * 3;
        let posX = x;
        let posY = y;
        
        const moveParticle = setInterval(() => {
            posX += Math.cos(angle) * speed;
            posY += Math.sin(angle) * speed;
            particle.style.left = `${posX}px`;
            particle.style.top = `${posY}px`;
            particle.style.opacity -= 0.02;
            
            if (parseFloat(particle.style.opacity) <= 0) {
                clearInterval(moveParticle);
                particle.remove();
            }
        }, 16);
    }
}

// Обновление здоровья врага
function updateEnemyHealth() {
    const healthPercent = (currentEnemyHealth / maxEnemyHealth) * 100;
    healthElement.style.width = `${healthPercent}%`;
    
    // Плавное изменение цвета
    const hue = (healthPercent * 1.2).toString(10);
    healthElement.style.background = `linear-gradient(90deg, hsl(${hue}, 100%, 50%), hsl(${hue}, 100%, 70%)`;
}

// Победа над врагом
function defeatEnemy() {
    energy += maxEnemyHealth / 10;
    enemyDefeated++;
    updateStats();
    
    // Эффект взрыва
    createExplosion();
    
    // Новый враг
    spawnNewEnemy();
    
    // Проверка уровня
    if (enemyDefeated >= 5) {
        levelUp();
    }
}

// Создать эффект взрыва
function createExplosion() {
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const rect = enemyImg.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        particle.style.backgroundColor = `hsl(${Math.random() * 60}, 100%, 50%)`;
        particle.style.width = '10px';
        particle.style.height = '10px';
        document.body.appendChild(particle);
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 5;
        let posX = centerX;
        let posY = centerY;
        
        const moveParticle = setInterval(() => {
            posX += Math.cos(angle) * speed;
            posY += Math.sin(angle) * speed;
            particle.style.left = `${posX}px`;
            particle.style.top = `${posY}px`;
            particle.style.opacity -= 0.02;
            
            if (parseFloat(particle.style.opacity) <= 0) {
                clearInterval(moveParticle);
                particle.remove();
            }
        }, 16);
    }
}

// Спавн нового врага
function spawnNewEnemy() {
    currentEnemyHealth = maxEnemyHealth = 100 + (level * 20);
    updateEnemyHealth();
    
    // Анимация появления
    enemyImg.style.transform = 'scale(0)';
    enemyImg.style.opacity = '0';
    setTimeout(() => {
        enemyImg.style.transition = 'all 0.5s';
        enemyImg.style.transform = 'scale(1)';
        enemyImg.style.opacity = '1';
        
        // Случайный враг
        const enemies = [
            'https://i.imgur.com/JqYeYnW.png',
            'https://i.imgur.com/8Q6QyZR.png',
            'https://i.imgur.com/4T3W9jK.png'
        ];
        enemyImg.src = enemies[Math.floor(Math.random() * enemies.length)];
    }, 300);
}

// Увеличение уровня
function levelUp() {
    level++;
    enemyDefeated = 0;
    levelElement.textContent = level;
    
    // Анимация уровня
    levelElement.style.transform = 'scale(1.5)';
    setTimeout(() => {
        levelElement.style.transform = 'scale(1)';
    }, 500);
    
    unlockNewWeapons();
}

// Разблокировка оружия
function unlockNewWeapons() {
    weaponsContainer.innerHTML = '';
    weapons.forEach((weapon, index) => {
        if (weapon.owned || weapon.cost > energy) return;
        const weaponElement = document.createElement('div');
        weaponElement.className = 'weapon';
        weaponElement.style.setProperty('--order', index);
        weaponElement.innerHTML = `
            <div style="font-size: 2rem;">${weapon.img}</div>
            <h3>${weapon.name}</h3>
            <p>Урон: +${weapon.damage}</p>
            <p>Цена: ${weapon.cost} энергии</p>
        `;
        weaponElement.addEventListener('click', () => {
            if (energy >= weapon.cost) {
                energy -= weapon.cost;
                weapon.owned = true;
                clickDamage += weapon.damage;
                updateStats();
                
                // Анимация покупки
                weaponElement.style.borderColor = '#00ff00';
                weaponElement.style.animation = 'none';
                void weaponElement.offsetWidth;
                weaponElement.style.animation = 'fadeIn 0.5s';
            }
        });
        weaponsContainer.appendChild(weaponElement);
    });
}

// Обновление статистики
function updateStats() {
    energyElement.textContent = Math.floor(energy);
    energyElement.style.fontSize = '1.5em';
    setTimeout(() => {
        energyElement.style.fontSize = '1em';
    }, 300);
}

// Авто-кликер
setInterval(() => {
    if (skills[2].unlocked) {
        currentEnemyHealth -= 1;
        updateEnemyHealth();
        
        if (currentEnemyHealth <= 0) {
            defeatEnemy();
        }
    }
}, 1000);

// Инициализация игры
function initGame() {
    updateStats();
    unlockNewWeapons();
    spawnNewEnemy();
}

initGame();
