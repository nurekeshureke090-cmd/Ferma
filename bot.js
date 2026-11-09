const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); 

const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;

const botConfig = {
  host: 'articraft.uz',
  port: 25565,
  username: 'aziz_bot',
  auth: 'offline'
};

const DOSTLAR = ['0826', 'tbgedh', 'azizferm'];

function startBot() {
  console.log('ArtiCraft serveriga offline rejimda ulanilmoqda...');
  const bot = mineflayer.createBot(botConfig);

  bot.loadPlugin(pathfinder);
  bot.loadPlugin(pvp);

  bot.on('spawn', () => {
    console.log('Bot serverga kirdi! Login qilinmoqda...');
    bot.chat('/login 010101');

    setTimeout(() => {
      bot.chat('/server anarchy');
      setTimeout(() => {
        bot.chat('/home');
        console.log('Bazaga yetib keldim! Qorovullik va dehqonchilik boshlandi.');
      }, 5000);
    }, 3000);
  });

  bot.on('physicsTick', () => {
    if (!bot.entity || bot.pvp.target) return; 

    const playerFilter = (entity) => {
      return entity.type === 'player' &&
             !DOSTLAR.includes(entity.username) &&
             entity.position.distanceTo(bot.entity.position) < 15;
    };

    const dushman = bot.nearestEntity(playerFilter);

    if (dushman) {
      console.log(`⚠️ DIQQAT! Dushman: ${dushman.username}! Hujumga o'tdim!`);
      const qurol = bot.inventory.items().find(item => item.name.includes('sword') || item.name.includes('axe'));
      if (qurol) bot.equip(qurol, 'hand');
      bot.pvp.attack(dushman);
    }
  });

  setInterval(async () => {
    if (!bot.entity || bot.pvp.target) return; 

    try {
      const crop = bot.findBlock({
        matching: (block) => {
          return (block.name === 'wheat' || block.name === 'carrots' || block.name === 'potatoes') && block.metadata === 7;
        },
        maxDistance: 15
      });

      if (crop) {
        console.log(`[Fermer] Pishgan ekin topildi, yig'yapman...`);
        const mcData = require('minecraft-data')(bot.version);
        const defaultMove = new Movements(bot, mcData);
        defaultMove.canDig = false;

        bot.pathfinder.setMovements(defaultMove);
        await bot.pathfinder.goto(new goals.GoalBlock(crop.position.x, crop.position.y, crop.position.z));
        await bot.dig(crop);
        console.log(`[Fermer] Ekin yig'ildi!`);
      }
    } catch (err) {}
  }, 8000);

  setInterval(() => {
    if (bot.entity) {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 1000);
    }
  }, 180000);

  bot.on('end', (reason) => {
    console.log(`Uzilish bo'ldi. Sababi: ${reason}. 10 soniyadan so'ng qayta ulanaman...`);
    setTimeout(startBot, 10000);
  });

  bot.on('error', (err) => {
    console.log(`Tarmoq xatosi: ${err.message}`);
  });
}

startBot();
      
