const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const { pvp } = require('mineflayer-pvp');
const autoeat = require('mineflayer-auto-eat');
const { Vec3 } = require('vec3');
const express = require('express');

const app = express();
const port = 3000;

const usernames = [
  'KenjiVN',
  'NoobBui',
  'MrDat2009',
  'HuyGamerX',
  'DragonBoy99',
  'nghiemtuan123',
  'Anhhacker1',
  'Quang_TNT',
  'MinhHoangMC',
  'proplayervn'
];

let currentUsername = usernames[Math.floor(Math.random() * usernames.length)];

const bot = mineflayer.createBot({
  host: 'BonvaBao123.aternos.me', // 🔁 Thay bằng IP
  port: 34742,                // 🔁 Thay bằng port
  username: currentUsername
});

bot.loadPlugin(pathfinder);
bot.loadPlugin(pvp);
bot.loadPlugin(autoeat);

bot.once('spawn', () => {
  const mcData = require('minecraft-data')(bot.version);
  const movements = new Movements(bot, mcData);
  bot.pathfinder.setMovements(movements);

  bot.autoEat.options = {
    priority: 'foodPoints',
    startAt: 18,
    bannedFood: []
  };
  bot.autoEat.enable();

  const regDelay = getRandomInt(5000, 7000);
  const loginDelay = getRandomInt(1000, 2000);

  setTimeout(() => {
    bot.chat('/reg concacduma concacduma');
    setTimeout(() => {
      bot.chat('/login concacduma');
    }, loginDelay);
  }, regDelay);

  equipBestGear();
  setInterval(equipBestGear, 10000);

  startSmartCombatLoop();
  scheduleNameChange();
});

function equipBestGear() {
  const items = bot.inventory.items();
  const armorSlots = ['head', 'torso', 'legs', 'feet'];
  const bestArmor = {};

  for (const item of items) {
    const slot = getArmorSlot(item);
    if (!slot) continue;
    if (!bestArmor[slot] || itemProtection(item) > itemProtection(bestArmor[slot])) {
      bestArmor[slot] = item;
    }
  }

  for (const slot of armorSlots) {
    if (bestArmor[slot]) {
      bot.equip(bestArmor[slot], slot).catch(() => {});
    }
  }
}

function getArmorSlot(item) {
  if (!item.name) return null;
  if (item.name.includes('helmet')) return 'head';
  if (item.name.includes('chestplate')) return 'torso';
  if (item.name.includes('leggings')) return 'legs';
  if (item.name.includes('boots')) return 'feet';
  return null;
}

function itemProtection(item) {
  if (!item || !item.name) return 0;
  const priorities = {
    netherite: 5,
    diamond: 4,
    iron: 3,
    gold: 2,
    chainmail: 1,
    leather: 0
  };
  for (const [key, val] of Object.entries(priorities)) {
    if (item.name.includes(key)) return val;
  }
  return 0;
}

function startSmartCombatLoop() {
  setInterval(() => {
    const target = bot.nearestEntity(e => e.type === 'mob' && e.mobType !== 'Armor Stand' && e.position.distanceTo(bot.entity.position) < 15);
    if (target) {
      const chance = Math.random();
      if (chance < 0.25) {
        equipAxe();
        tryCritJump();
      } else {
        equipSword();
      }
      bot.pvp.attack(target);
    } else {
      bot.pvp.stop();
    }
  }, 1000);
}

function equipSword() {
  const sword = bot.inventory.items().find(item => item.name.includes('sword'));
  if (sword) bot.equip(sword, 'hand').catch(() => {});
}

function equipAxe() {
  const axe = bot.inventory.items().find(item => item.name.includes('axe'));
  if (axe) bot.equip(axe, 'hand').catch(() => {});
}

function tryCritJump() {
  bot.setControlState('jump', true);
  setTimeout(() => bot.setControlState('jump', false), 300);
}

bot.on('entitySwingArm', (entity) => {
  if (entity.position.distanceTo(bot.entity.position) < 3) {
    bot.setControlState('sneak', true);
    setTimeout(() => bot.setControlState('sneak', false), 500);
  }
});

app.get('/', (req, res) => res.send('Bot online!'));
app.listen(port, () => console.log(`✅ Uptime web đang chạy tại http://localhost:${port}`));

bot.on('error', err => console.log('❌ Error:', err));

bot.on('end', () => {
  const delay = getRandomInt(10000, 20000);
  console.log(`⛔ Bot bị kick/disconnect. Restart sau ${delay / 1000}s...`);
  setTimeout(() => process.exit(), delay);
});

function scheduleNameChange() {
  const min = 60 * 60 * 1000;
  const max = 3 * 60 * 60 * 1000;
  const delay = getRandomInt(min, max);

  console.log(`⏳ Sẽ đổi tên bot sau ${(delay / 60000).toFixed(1)} phút.`);

  setTimeout(() => {
    let newName;
    do {
      newName = usernames[Math.floor(Math.random() * usernames.length)];
    } while (newName === currentUsername);

    currentUsername = newName;
    console.log(`🔁 Đổi tên bot sang: ${currentUsername}`);
    process.exit(); // Render sẽ restart lại với tên mới
  }, delay);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
