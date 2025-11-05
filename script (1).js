
// === Runtime error overlay ===
(function(){
  if (window.__errorOverlayInstalled__) return;
  window.__errorOverlayInstalled__ = true;
  function showError(msg, src, line, col, err){
    try{
      const box = document.createElement('div');
      box.style.position = 'fixed';
      box.style.top = '10px';
      box.style.left = '10px';
      box.style.right = '10px';
      box.style.zIndex = '999999';
      box.style.background = 'rgba(220,38,38,0.95)';
      box.style.color = '#fff';
      box.style.padding = '12px 16px';
      box.style.borderRadius = '8px';
      box.style.font = '14px/1.4 system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Arial';
      box.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
      box.textContent = '⚠️ ' + msg + (src ? ('  (' + src + ':' + line + ':' + col + ')') : '');
      document.body.appendChild(box);
      setTimeout(()=>{ try{ box.remove(); }catch(e){} }, 8000);
      if (err && err.stack) console.error(err.stack);
    }catch(e){}
  }
  window.addEventListener('error', function(e){
    showError(e.message, e.filename, e.lineno, e.colno, e.error);
  });
  window.addEventListener('unhandledrejection', function(e){
    const reason = (e && e.reason) ? (e.reason.message || String(e.reason)) : 'Unhandled Promise rejection';
    showError(reason);
  });
})();

/* ==================== EASTER EGG: WOLF CLICKS ==================== */
let wolfClickCount = 0;
let editionClickCount = 0;

document.addEventListener('DOMContentLoaded', () => {
  const wolfIcon = document.getElementById('wolf-icon');
  if (wolfIcon) {
    wolfIcon.addEventListener('click', () => {
      wolfClickCount++;
      if (wolfClickCount === 5 && window.S && S.stage === 'intro') {
        S.wolfClicks = 5;
        alert('🎉 SECRET UNLOCKED! Mr. Kitchen is now available!');
        render();
      }
    });
  }
  
  const editionWord = document.getElementById('edition-click');
  if (editionWord) {
    editionWord.addEventListener('click', () => {
      editionClickCount++;
      if (editionClickCount === 20) {
        alert('🐍 SNAKE GAME UNLOCKED! Use arrow keys to play. Press ESC to exit.');
        startSnakeGame();
      } else if (editionClickCount === 10) {
        console.log('Keep clicking... (' + editionClickCount + '/20)');
      } else if (editionClickCount >= 15) {
        console.log('Almost there! (' + editionClickCount + '/20)');
      }
    });
  }
});

/* ==================== SNAKE GAME ==================== */
function startSnakeGame() {
  
  // --- Patch: ensure keydown handler is cleaned up on close ---
  let __snakeKeyHandler = null;
  let __snakeInterval = null;
  const __snakeCleanup = () => {
    try { if (__snakeInterval) clearInterval(__snakeInterval); } catch(e) {}
    try { if (__snakeKeyHandler) document.removeEventListener('keydown', __snakeKeyHandler); } catch(e) {}
  };
const overlay = el('div', {class:'snake-game'});
  const scoreDisplay = el('div', {class:'snake-score'}, 'Score: 0');
  const canvas = el('canvas', {class:'snake-canvas', width:400, height:400});
  const controls = el('div', {class:'snake-controls'}, '🎮 Use Arrow Keys | ESC to Exit');
  
  overlay.append(scoreDisplay, canvas, controls);
  document.body.appendChild(overlay);
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    alert('Graphics context unavailable on this device/browser.');
    __snakeCleanup();
    if (overlay && overlay.parentNode) document.body.removeChild(overlay);
    return;
  }
  const gridSize = 20;
  const tileCount = 20;
  
  let snake = [{x: 10, y: 10}];
  let direction = {x: 1, y: 0};
  let food = {x: 15, y: 15};
  let score = 0;
  // let gameLoop = null; // replaced by __snakeInterval
  
  function drawGame() {
    // Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid
    ctx.strokeStyle = '#333';
    for (let i = 0; i <= tileCount; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize, 0);
      ctx.lineTo(i * gridSize, canvas.height);
      ctx.moveTo(0, i * gridSize);
      ctx.lineTo(canvas.width, i * gridSize);
      ctx.stroke();
    }
    
    // Snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#b8860b' : '#7a3b00';
      ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
    
    // Food
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
  }
  
  function moveSnake() {
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    
    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      endGame();
      return;
    }
    
    // Self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      endGame();
      return;
    }
    
    snake.unshift(head);
    
    // Food collision
    if (head.x === food.x && head.y === food.y) {
      score++;
      scoreDisplay.textContent = 'Score: ' + score;
      food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
      };
    } else {
      snake.pop();
    }
  }
  
  function gameUpdate() {
    moveSnake();
    drawGame();
  }
  
  function endGame() {
    clearInterval(__snakeInterval);
    __snakeCleanup(); alert(`🐍 Game Over!\n\nFinal Score: ${score}\n\nClick OK to close.`);
    document.body.removeChild(overlay);
  }
  
  function handleKeyPress(e) {
    if (e.key === 'Escape') {
      __snakeCleanup();
      if (overlay && overlay.parentNode) document.body.removeChild(overlay);
      return;
    }
// Prevent opposite direction
    if (e.key === 'ArrowUp' && direction.y === 0) direction = {x: 0, y: -1};
    if (e.key === 'ArrowDown' && direction.y === 0) direction = {x: 0, y: 1};
    if (e.key === 'ArrowLeft' && direction.x === 0) direction = {x: -1, y: 0};
    if (e.key === 'ArrowRight' && direction.x === 0) direction = {x: 1, y: 0};
  }
  
  __snakeKeyHandler = handleKeyPress;
document.addEventListener('keydown', __snakeKeyHandler);
  
  drawGame();
  __snakeInterval = setInterval(gameUpdate, 150);
}

/* ==================== GAME DATA ==================== */

// Latin name generator
function generateLatinName(type = 'building') {
  const prefixes = ['Magna', 'Novus', 'Antiqua', 'Prima', 'Maxima', 'Alta', 'Fortis', 'Clara', 'Sancta', 'Regia'];
  const middles = ['Via', 'Domus', 'Templum', 'Forum', 'Porticus', 'Basilica', 'Thermae', 'Atrium', 'Villa', 'Insula'];
  const suffixes = ['Romana', 'Imperialis', 'Victrix', 'Augusta', 'Nobilis', 'Vetusta', 'Pulchra', 'Firma', 'Aeterna', 'Gloria'];
  
  if (type === 'territory') {
    const territoryPrefixes = ['Ager', 'Campus', 'Collis', 'Mons', 'Silva', 'Vallis', 'Regio', 'Locus'];
    const territorySuffixes = ['Fertilis', 'Sacer', 'Magnus', 'Antiquus', 'Novus', 'Remotus', 'Ultimus', 'Proximus'];
    return rpick(territoryPrefixes) + ' ' + rpick(territorySuffixes);
  }
  
  if (Math.random() > 0.5) {
    return rpick(prefixes) + ' ' + rpick(middles);
  } else {
    return rpick(middles) + ' ' + rpick(suffixes);
  }
}

// Rarity system
function rollRarity() {
  const roll = Math.random() * 100;
  
  if (roll < 0.05) return {name: 'Imperial', bonus: 3.0, class: 'rarity-imperial'}; // 0.05%
  if (roll < 0.55) return {name: 'Legendary', bonus: 2.0, class: 'rarity-legendary'}; // 0.5%
  if (roll < 3.05) return {name: 'Epic', bonus: 1.5, class: 'rarity-epic'}; // 2.5%
  if (roll < 8.05) return {name: 'Rare', bonus: 1.25, class: 'rarity-rare'}; // 5%
  if (roll < 20.05) return {name: 'Uncommon', bonus: 1.1, class: 'rarity-uncommon'}; // 12%
  if (roll < 45.05) return {name: 'Common', bonus: 1.0, class: 'rarity-common'}; // 25%
  return {name: 'Common', bonus: 0.85, class: 'rarity-common'}; // 55% (below average)
}

function getRarityBadge(rarity) {
  if (!rarity) return '';
  return `<span class="rarity ${rarity.class}">${rarity.name}</span>`;
}

// Territories with RARITY and LATIN NAMES!
const TERRITORIES = [
  {id:'palatine', latinName:'Collis Palatinus', name:'Palatine Hill', status:'owned', str:0, value:0, 
   img:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Palatino_general_view.jpg/320px-Palatino_general_view.jpg',
   produces:{grain:2, livestock:1}, desc:'Your starting settlement', rarity:rollRarity()},
  {id:'aventine', latinName:'Collis Aventinus', name:'Aventine Hill', status:'contested', str:25, value:180, 
   img:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Santa_Sabina_%28Rome%29_-_Apse.jpg/320px-Santa_Sabina_%28Rome%29_-_Apse.jpg',
   produces:{timber:2, clay:1}, desc:'Forested hill, good for building materials', req:0, rarity:rollRarity()},
  {id:'quirinal', latinName:'Collis Quirinalis', name:'Quirinal Hill', status:'contested', str:30, value:220, 
   img:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Palazzo_del_Quirinale.jpg/320px-Palazzo_del_Quirinale.jpg',
   produces:{grain:2, wool:1}, desc:'Pastoral highlands', req:0, rarity:rollRarity()},
  {id:'tiber', latinName:'Ripa Tiberis', name:'Tiber Riverside', status:'contested', str:35, value:250, 
   img:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Tevere_-_Roma.jpg/320px-Tevere_-_Roma.jpg',
   produces:{salt:2, grain:1}, desc:'River trade and fishing', req:0, rarity:rollRarity()},
  
  {id:'esquiline', latinName:'Collis Esquilinus', name:'Esquiline Hill', status:'hostile', str:45, value:300, 
   img:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Santa_Maria_Maggiore_%28Rome%29_-_Front.jpg/320px-Santa_Maria_Maggiore_%28Rome%29_-_Front.jpg',
   produces:{grain:3, livestock:1}, desc:'Fertile farmland', req:1, rarity:rollRarity()},
  {id:'caelian', latinName:'Collis Caelius', name:'Caelian Hill', status:'hostile', str:40, value:280, 
   img:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Santi_Giovanni_e_Paolo_%28Rome%29_-_Facade.jpg/320px-Santi_Giovanni_e_Paolo_%28Rome%29_-_Facade.jpg',
   produces:{timber:2, grain:2}, desc:'Mixed resources', req:1, rarity:rollRarity()},
  {id:'viminal', latinName:'Collis Viminalis', name:'Viminal Hill', status:'hostile', str:38, value:260, 
   img:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Teatro_dell%27Opera.jpg/320px-Teatro_dell%27Opera.jpg',
   produces:{clay:2, wool:1}, desc:'Artisan quarter potential', req:1, rarity:rollRarity()},
  {id:'capitoline', latinName:'Capitolium', name:'Capitoline Hill', status:'hostile', str:55, value:400, 
   img:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Piazza_del_Campidoglio.jpg/320px-Piazza_del_Campidoglio.jpg',
   produces:{grain:2, iron:1, wine:1}, desc:'Strategic citadel position', req:2, rarity:rollRarity()},
  
  {id:'ostia', latinName:'Ostia Portus', name:'Ostia Port', status:'hostile', str:65, value:500, 
   img:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Ostia_Antica_-_Teatro.jpg/320px-Ostia_Antica_-_Teatro.jpg',
   produces:{salt:4, grain:2}, desc:'Coastal trade hub', req:3, rarity:rollRarity()},
  {id:'albalonga', latinName:'Alba Longa', name:'Alba Longa', status:'hostile', str:80, value:650, 
   img:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Castel_Gandolfo_-_view.jpg/320px-Castel_Gandolfo_-_view.jpg',
   produces:{wine:3, grain:2, livestock:1}, desc:'Ancient Latin city', req:4, rarity:rollRarity()},
  {id:'veii', latinName:'Veii Etrusca', name:'Veii', status:'hostile', str:100, value:850, 
   img:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Veio_Santuario.jpg/320px-Veio_Santuario.jpg',
   produces:{iron:3, timber:2, grain:1}, desc:'Etruscan stronghold', req:5, rarity:rollRarity()},
  {id:'latium', latinName:'Ager Latinus', name:'Latium Plains', status:'hostile', str:90, value:750, 
   img:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Campagna_Romana.jpg/320px-Campagna_Romana.jpg',
   produces:{grain:5, livestock:2}, desc:'Breadbasket of Italy', req:5, rarity:rollRarity()},
];

// Resource production buildings with RARITY and LATIN NAMES!
const PRODUCTION_BUILDINGS = [
  {id:'farm', latinName:'Fundus Agricola', name:'Farm', emoji:'🌾', cost:150, produces:'grain', rate:5, desc:'Produces grain each season', rarity:rollRarity()},
  {id:'pasture', latinName:'Ager Pastoralis', name:'Pasture', emoji:'🐑', cost:180, produces:'livestock', rate:4, desc:'Raises livestock for food and trade', rarity:rollRarity()},
  {id:'fishery', latinName:'Piscina Marina', name:'Fishery', emoji:'🎣', cost:140, produces:'salt', rate:3, desc:'Catches fish and produces salt', rarity:rollRarity()},
  {id:'timbercamp', latinName:'Silva Lignum', name:'Timber Camp', emoji:'🪵', cost:160, produces:'timber', rate:3, desc:'Harvests timber from forests', rarity:rollRarity()},
  {id:'claypit', latinName:'Fossa Argilla', name:'Clay Pit', emoji:'🧱', cost:130, produces:'clay', rate:3, desc:'Extracts clay for building', rarity:rollRarity()},
  {id:'mine', latinName:'Fodina Ferrum', name:'Mine', emoji:'⚒️', cost:250, produces:'iron', rate:2, desc:'Mines iron ore for weapons', rarity:rollRarity()},
  {id:'vineyard', latinName:'Vinea Vitis', name:'Vineyard', emoji:'🍷', cost:220, produces:'wine', rate:2, desc:'Produces wine for trade and morale', rarity:rollRarity()},
];

// Trading goods with expanded properties
const GOODS = [
  {id:'livestock', name:'Livestock', base:90,  vol:0.9, emoji:'🐑', foodValue:3, militaryValue:1},
  {id:'timber',    name:'Timber',    base:110, vol:1.1, emoji:'🪵', foodValue:0, buildingValue:3},
  {id:'clay',      name:'Clay',      base:70,  vol:0.9, emoji:'🧱', foodValue:0, buildingValue:2},
  {id:'salt',      name:'Salt',      base:140, vol:1.1, emoji:'🧂', foodValue:2, preserveValue:2},
  {id:'wool',      name:'Wool',      base:120, vol:1.0, emoji:'🧶', foodValue:0, comfortValue:2},
  {id:'grain',     name:'Grain',     base:80,  vol:0.8, emoji:'🌾', foodValue:5, militaryValue:2},
  {id:'iron',      name:'Iron',      base:200, vol:1.3, emoji:'⚔️', militaryValue:5, buildingValue:1},
  {id:'wine',      name:'Wine',      base:160, vol:1.2, emoji:'🍷', happinessValue:3, tradeValue:2},
];

// Cities with expanded attributes
const CITIES = [
  {id:'alba',  name:'Alba Longa',  tariff:0.04, risk:0.06, distance:2, 
   bias:{livestock:+6,timber:+4,clay:+8,salt:+1,wool:+6,grain:+5,iron:+0,wine:+8},
   specialty:'wine', relation:0},
  {id:'tiber', name:'Tiber Ford',  tariff:0.05, risk:0.05, distance:1,
   bias:{livestock:+5,timber:+6,clay:+2,salt:+8,wool:+5,grain:+4,iron:+2,wine:+4},
   specialty:'salt', relation:0},
  {id:'sabine',name:'Sabine Hills',tariff:0.04, risk:0.07, distance:3,
   bias:{livestock:+8,timber:+6,clay:+0,salt:+0,wool:+10,grain:+3,iron:+4,wine:+2},
   specialty:'wool', relation:0},
  {id:'veii',  name:'Veii',        tariff:0.06, risk:0.08, distance:4,
   bias:{livestock:+2,timber:+10,clay:+6,salt:+4,wool:+0,grain:+2,iron:+8,wine:+0},
   specialty:'iron', relation:-5},
  {id:'ostia', name:'Ostia Marsh', tariff:0.05, risk:0.07, distance:2,
   bias:{livestock:+0,timber:+4,clay:+4,salt:+12,wool:+0,grain:+6,iron:+0,wine:+4},
   specialty:'salt', relation:0},
  {id:'latium',name:'Latin Village',tariff:0.03, risk:0.06, distance:2,
   bias:{livestock:+6,timber:+4,clay:+6,salt:+2,wool:+8,grain:+7,iron:+1,wine:+6},
   specialty:'grain', relation:5},
];

// Founders with enhanced modifiers - MR. KITCHEN IS NOW TRULY OVERPOWERED!
const FOUNDERS = {
  romulus: { 
    id:'romulus', name:'Romulus', icon:'🗡️',
    desc:'The warrior. Military conquest and aggressive expansion.',
    mods:{ 
      sellMul:0.98, tariffMul:0.97, riskMul:0.88, troopsMul:1.15, attackBonus:+5,
      recruitCost:0.9, moraleDecay:0.95, territoryBonus:1.2
    } 
  },
  remus: { 
    id:'remus', name:'Remus', icon:'🛡️',
    desc:'The diplomat. Trade prosperity and peaceful growth.',
    mods:{ 
      sellMul:1.06, tariffMul:1.00, riskMul:1.12, relationBonus:+8, favorGain:1.25,
      buildCost:0.85, happinessMul:1.15, productionBonus:1.15
    } 
  },
  kitchen: {
    id:'kitchen', name:'Mr. Kitchen', icon:'👨🍳',
    desc:'The ultimate founder. Unleash unlimited power! SUPER OVERPOWERED MODE!',
    mods:{
      sellMul:999, tariffMul:0.0001, riskMul:0.0001, troopsMul:999, attackBonus:+99999,
      recruitCost:0.0001, moraleDecay:0, territoryBonus:999, buildCost:0.0001,
      happinessMul:999, productionBonus:999, favorGain:999, relationBonus:+99999
    }
  }
};

// Technologies
const TECHNOLOGIES = [
  {id:'market',name:'Forum Market',cost:280,req:{favor:10},effect:'tradePrices',
   desc:'+5% trade prices, +10 capacity',unlocked:false},
  {id:'roads',name:'Stone Roads',cost:350,req:{forts:2},effect:'tradeRisk',
   desc:'-15% trade risk, +20 capacity',unlocked:false},
  {id:'granaries',name:'Advanced Granaries',cost:400,req:{food:250},effect:'food',
   desc:'Food decay 50% slower, +100 max food storage',unlocked:false},
  {id:'legion',name:'Legion Training',cost:520,req:{troops:100},effect:'military',
   desc:'+20% attack power, -10% recruit cost',unlocked:false},
  {id:'aqueduct',name:'Aqueduct',cost:580,req:{sanitation:55,pop:200},effect:'population',
   desc:'+2 population growth per turn, +20 max sanitation',unlocked:false},
  {id:'forge',name:'Military Forge',cost:480,req:{troops:100,supplies:40},effect:'equipment',
   desc:'Supplies last 50% longer, forge costs -20%',unlocked:false},
  {id:'walls',name:'Stone Walls',cost:720,req:{forts:4},effect:'defense',
   desc:'Forts provide +50% defense, reduce all risks -10%',unlocked:false},
  {id:'senate',name:'Senate House',cost:850,req:{favor:18,pop:280,reputation:20},effect:'governance',
   desc:'+2 favor per turn, +1% sell prices permanently',unlocked:false},
  {id:'irrigation',name:'Irrigation',cost:380,req:{territories:3},effect:'farming',
   desc:'+50% production from farms and pastures',unlocked:false},
  {id:'mining',name:'Advanced Mining',cost:520,req:{territories:4},effect:'mining',
   desc:'+100% production from mines, unlock iron weapons',unlocked:false},
];

// === Apply tech perk (supports procedural techs) ===
function applyTechPerk(tech){
  if (!tech) return;
  // Built-in effects already handled elsewhere; only handle procedural or extra perks here.
  if (typeof tech._apply === 'function') {
    try { tech._apply(S); } catch(e){ console.warn('Perk apply error', e); }
  } else {
    // Map some known textual effects to state deltas for robustness
    switch (tech.effect) {
      case 'tradePrices': S.questTradeBuff = (S.questTradeBuff||1) * 1.05; break;
      case 'tradeRisk': S.proc_perk_risk = (S.proc_perk_risk||1) * 0.85; break;
      case 'food': S.maxFood += 50; break;
      case 'military': S.attackBonus = (S.attackBonus||0) + 5; break;
      case 'population': S.proc_perk_pop_growth = (S.proc_perk_pop_growth||0) + 1; break;
      case 'equipment': S.supplies = (S.supplies||0) + 10; break;
      case 'defense': S.forts += 1; break;
      case 'governance': S.favor += 2; break;
      case 'farming': S.proc_perk_prod_all = (S.proc_perk_prod_all||0) + 0.15; break;
      case 'mining': S.proc_perk_prod_all = (S.proc_perk_prod_all||0) + 0.20; break;
    }
  }
}


// === Seeded RNG for procedural techs ===
if (typeof window !== "undefined" && window.S && !window.S.seed) { S.seed = 1337; } // default classroom seed; can be changed per save
function _srand(n){ S.seed = (S.seed ^ n) >>> 0; }
function _srand_str(str){ let h=2166136261>>>0; for(let i=0;i<str.length;i++){h^=str.charCodeAt(i); h=(h*16777619)>>>0;} S.seed^=h; }
function _rand(){
  // xorshift32
  let x = (S.seed||123456789)>>>0;
  x ^= x << 13; x >>>= 0;
  x ^= x >> 17; x >>>= 0;
  x ^= x << 5;  x >>>= 0;
  S.seed = x>>>0;
  return (x>>>0) / 4294967296;
}
function _rpick(arr){ return arr[Math.floor(_rand()*arr.length)]; }

// === Procedural (seeded) technologies ===
function generateSeededTechs(count=4){
  const nouns = ['Agraria','Mercatura','Militaris','Civitas','Aqua','Ferraria','Textilis','Cultura','Viaria','Sanitas'];
  const kinds = [
    {effect:'prod_all', desc:'+10–25% all production', apply:s=>{ s.proc_perk_prod_all=(s.proc_perk_prod_all||0)+ (_rand()*0.15+0.10);} },
    {effect:'sell_bonus', desc:'+1–3% sell prices', apply:s=>{ s.proc_perk_sell=(s.proc_perk_sell||0)+ (_rand()*0.02+0.01);} },
    {effect:'capacity', desc:'+10–40 capacity', apply:s=>{ s.capacity += Math.floor(_rand()*30)+10; } },
    {effect:'happiness', desc:'+4–12 happiness', apply:s=>{ s.happiness = Math.min(100, s.happiness + Math.floor(_rand()*8)+4); } },
    {effect:'tariff', desc:'-5–15% tariffs', apply:s=>{ s.proc_perk_tariff=(s.proc_perk_tariff||1)*(1-(_rand()*0.10+0.05)); } },
    {effect:'risk', desc:'-5–15% trade risk', apply:s=>{ s.proc_perk_risk=(s.proc_perk_risk||1)*(1-(_rand()*0.10+0.05)); } },
    {effect:'food_decay', desc:'Food decay -25–50%', apply:s=>{ s.proc_perk_food_decay=(s.proc_perk_food_decay||1)*(1-(_rand()*0.25+0.25)); } },
    {effect:'morale', desc:'+5–15 morale', apply:s=>{ s.morale = Math.min(100, s.morale + Math.floor(_rand()*10)+5); } },
    {effect:'pop_growth', desc:'+1–3 pop growth per round', apply:s=>{ s.proc_perk_pop_growth=(s.proc_perk_pop_growth||0)+ Math.floor(_rand()*3)+1; } },
  ];

  const newly = [];
  for (let i=0;i<count;i++){
    const n = Math.floor(_rand()*900)+200; // cost 200–1100
    const k = _rpick(kinds);
    const name = _rpick(nouns) + ' ' + (['I','II','III','IV','V','VI','VII'][Math.floor(_rand()*7)]);
    const id = 'proc_' + name.replace(/\s+/g,'_').toLowerCase() + '_' + i;
    newly.push({id, name, cost:n, req:{}, effect:k.effect, desc:k.desc, unlocked:false, _apply:k.apply});
  }
  return newly;
}


// Events - EXPANDED!
const EVENTS = [
  { id:'wolf', name:'She-Wolf Omen', icon:'🐺', prob:0.15,
    text:'Hearts lift; roads feel safer. The divine favor shines upon you.',
    effect:s=>{ s.riskMul=0.85; s.moraleAdd=+8; s.favorAdd=+2; s.happinessAdd=+5; } },
  { id:'harvest', name:'Bountiful Harvest', icon:'🌾', prob:0.12,
    text:'Fields overflow with grain. All farms produce double this season.',
    effect:s=>{ s.farmBonus=2.0; s.happinessAdd=+6; } },
  { id:'drought', name:'Summer Drought', icon:'☀️', prob:0.10,
    text:'Pastures dry; grain fails. Farm production halved.',
    effect:s=>{ s.farmBonus=0.5; s.foodDelta=-30; s.popAdd=-5; } },
  { id:'migration', name:'Refugee Migration', icon:'👨👩👧👦', prob:0.09,
    text:'Families seek safety in your settlement.',
    effect:s=>{ s.popAdd=+18; s.foodDelta=-25; } },
  { id:'trade_boom', name:'Trade Festival', icon:'🎪', prob:0.11,
    text:'Merchants flock to your forum. +10% sell prices this season.',
    effect:s=>{ s.sellBonus=1.1; } },
  { id:'plague', name:'Plague Outbreak', icon:'💀', prob:0.08,
    text:'Disease spreads through the settlement. Sanitation drops.',
    effect:s=>{ s.popAdd=-15; s.sanitationDelta=-20; s.happinessAdd=-10; } },
  { id:'festival_mars', name:'Festival of Mars', icon:'⚔️', prob:0.10,
    text:'A grand celebration honors the god of war. Morale soars but costs mount.',
    effect:s=>{ s.moraleAdd=+15; s.denariDelta=-100; s.happinessAdd=+8; } },
  { id:'merchant_guild', name:'Merchant Guild Forms', icon:'🏛️', prob:0.06,
    text:'Traders organize, establishing permanent trade routes.',
    effect:s=>{ s.permanentTradeBuff=true; } },
  { id:'scouts', name:'Barbarian Scouts', icon:'👁️', prob:0.08,
    text:'Enemy scouts spotted near the borders. A raid approaches soon!',
    effect:s=>{ s.raidWarning=true; } },
  { id:'abundant_wildlife', name:'Abundant Wildlife', icon:'🦌', prob:0.09,
    text:'Hunters return with plentiful game. Livestock production increases.',
    effect:s=>{ s.livestockBonus=2.0; } },
  { id:'political_intrigue', name:'Political Intrigue', icon:'🎭', prob:0.07,
    text:'Senate politics work in your favor. Gain influence or lose respect.',
    effect:s=>{ Math.random() > 0.5 ? s.favorAdd=+5 : s.reputationAdd=-3; } },
  { id:'construction_boom', name:'Construction Boom', icon:'🏗️', prob:0.08,
    text:'Skilled builders arrive. Construction costs reduced this season.',
    effect:s=>{ s.buildCostMul=0.7; } },
  { id:'bandits', name:'Bandit Activity', icon:'🗡️', prob:0.09,
    text:'Bandits raid trade routes. Risk increases, some goods stolen.',
    effect:s=>{ s.riskMul=1.3; s.foodDelta=-20; } },
  { id:'good_weather', name:'Perfect Weather', icon:'☀️🌧️', prob:0.10,
    text:'Ideal conditions for growth. Population and food increase.',
    effect:s=>{ s.popAdd=+8; s.foodDelta=+40; s.happinessAdd=+5; } },
  { id:'iron_discovery', name:'Iron Deposit Found', icon:'⚒️', prob:0.05,
    text:'Prospectors discover rich iron veins near your territory.',
    effect:s=>{ s.ironBonus=3.0; } },
  { id:'religious_ceremony', name:'Sacred Ceremony', icon:'🕯️', prob:0.08,
    text:'Priests perform rituals. The gods seem pleased.',
    effect:s=>{ s.favorAdd=+4; s.moraleAdd=+6; s.happinessAdd=+8; } },
  { id:'skilled_workers', name:'Skilled Workers Arrive', icon:'👷♂️', prob:0.07,
    text:'Master craftsmen settle in your city. Production efficiency rises.',
    effect:s=>{ s.productionBuff=1.3; } },
  { id:'tax_revolt', name:'Tax Protests', icon:'😠', prob:0.06,
    text:'Citizens protest high taxes. Happiness drops but you gain some funds.',
    effect:s=>{ s.denariDelta=+150; s.happinessAdd=-12; } },
  { id:'allied_traders', name:'Allied Traders', icon:'🤝', prob:0.08,
    text:'Foreign merchants offer favorable deals. Trade tariffs reduced.',
    effect:s=>{ s.tariffMul=0.7; } },
  { id:'architectural_marvel', name:'Architectural Marvel', icon:'🏛️', prob:0.04,
    text:'A brilliant engineer designs magnificent buildings. Reputation soars!',
    effect:s=>{ s.reputationAdd=+10; s.happinessAdd=+10; } },
];

// Achievements - NEW!
const ACHIEVEMENTS = [
  {id:'first_blood', name:'First Blood', icon:'⚔️', desc:'Win your first conquest',
   check:s=>s.victories>=1, reward:{denarii:100, favor:2}},
  {id:'iron_empire', name:'Iron Empire', icon:'⚒️', desc:'Produce 100 iron total',
   check:s=>(s.resourcesProduced.iron||0)>=100, reward:{denarii:200, reputation:5}},
  {id:'pacifist', name:'Pacifist', icon:'🕊️', desc:'Reach season 10 without conquering beyond Palatine',
   check:s=>s.round>=10 && s.territories.length===1, reward:{happiness:15, favor:5}},
  {id:'trade_baron', name:'Trade Baron', icon:'💰', desc:'Earn 5000d from a single trade season',
   check:s=>false, reward:{capacity:20}}, // Checked during trade
  {id:'legendary_find', name:'Legendary Find', icon:'✨', desc:'Find a Legendary or Imperial rarity item',
   check:s=>false, reward:{denarii:500, reputation:10}}, // Checked on generation
  {id:'against_odds', name:'Against All Odds', icon:'🎲', desc:'Win a battle with less than 30% chance',
   check:s=>false, reward:{morale:20, favor:5}}, // Checked in battle
  {id:'economic_titan', name:'Economic Titan', icon:'💎', desc:'Reach 20,000 denarii',
   check:s=>s.denarii>=20000, reward:{favor:10, reputation:10}},
  {id:'population_boom', name:'Population Boom', icon:'👥', desc:'Reach 500 population',
   check:s=>s.pop>=500, reward:{housing:50}},
  {id:'military_might', name:'Military Might', icon:'🛡️', desc:'Train 200 troops',
   check:s=>s.troops>=200, reward:{morale:15, supplies:50}},
  {id:'master_builder', name:'Master Builder', icon:'🏗️', desc:'Construct 15 production buildings',
   check:s=>s.productionBuildings.length>=15, reward:{capacity:30}},
  {id:'undefeated', name:'Undefeated', icon:'👑', desc:'Win 5 battles in a row',
   check:s=>s.currentWinStreak>=5, reward:{denarii:300, morale:10}},
  {id:'renaissance', name:'Renaissance', icon:'🔬', desc:'Research 8 technologies',
   check:s=>Object.values(s.techs).filter(Boolean).length>=8, reward:{favor:8, reputation:8}},
  {id:'territorial', name:'Territorial', icon:'🗺️', desc:'Control 10 territories',
   check:s=>s.territories.length>=10, reward:{reputation:15}},
  {id:'survivor', name:'Survivor', icon:'💪', desc:'Survive to season 30',
   check:s=>s.round>=30, reward:{denarii:500, favor:5}},
  {id:'infinite_founder', name:'Infinite Founder', icon:'♾️', desc:'Enter infinite mode',
   check:s=>s.infiniteMode, reward:{capacity:50}},
];

// Quests - NEW!
const QUEST_TEMPLATES = [
  {id:'senate_farms', name:'The Senate Requests', icon:'🌾', desc:'Build 3 farms',
   type:'building', target:'farm', count:3, reward:{denarii:300, favor:5}},
  {id:'military_expansion', name:'Military Expansion', icon:'⚔️', desc:'Conquer 2 territories',
   type:'conquest', count:2, reward:{troops:100, reputation:5}},
  {id:'trade_mission', name:'Trade Mission', icon:'💰', desc:'Complete 5 successful trades',
   type:'trade', count:5, reward:{tradeBuff:1.1, duration:5}},
  {id:'engineering', name:'Roman Engineering', icon:'🏛️', desc:'Research 3 technologies',
   type:'research', count:3, reward:{capacity:20, reputation:5}},
  {id:'population_growth', name:'Population Growth', icon:'👥', desc:'Reach 250 population',
   type:'population', target:250, reward:{housing:30, happiness:10}},
  {id:'military_training', name:'Military Training', icon:'🛡️', desc:'Train 50 troops',
   type:'troops', target:50, reward:{morale:15, supplies:25}},
  {id:'economic_power', name:'Economic Power', icon:'💎', desc:'Accumulate 8000 denarii',
   type:'wealth', target:8000, reward:{favor:8, reputation:8}},
  {id:'resource_stockpile', name:'Resource Stockpile', icon:'📦', desc:'Store 80 resources',
   type:'inventory', target:80, reward:{capacity:15}},
];

// Resource Combinations - NEW!
const RESOURCE_COMBOS = [
  {id:'forge_weapons', name:'Forge Weapons', icon:'⚔️', 
   cost:{iron:5, timber:2}, effect:{attackBonus:20, duration:1},
   desc:'+20% attack power for one season'},
  {id:'feast', name:'Host Feast', icon:'🍖',
   cost:{grain:10, livestock:5}, effect:{happiness:15},
   desc:'+15% happiness permanently'},
  {id:'monument', name:'Build Monument', icon:'🗿',
   cost:{clay:10, timber:5}, effect:{reputation:5},
   desc:'+5 reputation permanently'},
  {id:'supply_cache', name:'Supply Cache', icon:'📦',
   cost:{grain:20, salt:5}, effect:{defense:1},
   desc:'+1 fort equivalent for defense'},
  {id:'trade_caravan', name:'Trade Caravan', icon:'🐫',
   cost:{livestock:3, wool:5}, effect:{tradeBuff:1.15, duration:3},
   desc:'+15% trade prices for 3 seasons'},
  {id:'wine_festival', name:'Wine Festival', icon:'🍷',
   cost:{wine:8, grain:5}, effect:{morale:12, happiness:8},
   desc:'+12% morale, +8% happiness'},
];

// Seasonal Effects - NEW!
const SEASONS = [
  {name:'Spring', icon:'🌸', effect:{farmBonus:1.1}, desc:'Farms +10% production'},
  {name:'Summer', icon:'☀️', effect:{foodConsumption:0.95, happiness:5}, desc:'Less food needed, +5% happiness'},
  {name:'Autumn', icon:'🍂', effect:{tradePrices:1.05}, desc:'Trade prices +5%'},
  {name:'Winter', icon:'❄️', effect:{upkeepMul:1.15, moralePenalty:3}, desc:'Upkeep +15%, -3% morale per turn'},
];

// Territory Specializations - NEW!
const SPECIALIZATIONS = [
  {id:'military', name:'Military Outpost', icon:'⚔️', cost:300,
   effect:{troopBonus:0.1, fortBonus:1}, desc:'+10% troop recruitment, +1 fort'},
  {id:'trade', name:'Trade Hub', icon:'💰', cost:300,
   effect:{tariffReduction:0.1, reputation:3}, desc:'-10% tariffs, +3 reputation'},
  {id:'farm', name:'Breadbasket', icon:'🌾', cost:250,
   effect:{foodBonus:0.5}, desc:'+50% food production from this territory'},
  {id:'mine', name:'Mining District', icon:'⚒️', cost:350,
   effect:{mineralBonus:0.5}, desc:'+50% mineral production'},
];

// Emergency Actions - NEW!
const EMERGENCY_ACTIONS = [
  {id:'emergency_tax', name:'Emergency Taxes', icon:'💰', cost:0,
   effect:{denarii:500, happiness:-20}, cooldown:5,
   desc:'Raise 500d, -20% happiness'},
  {id:'conscription', name:'Conscription', icon:'⚔️', cost:0,
   effect:{troops:100, pop:-30}, cooldown:10,
   desc:'Gain 20 troops, lose 30 population'},
  {id:'sell_territory', name:'Sell Territory', icon:'🗺️', cost:0,
   effect:{denarii:800, territory:-1}, cooldown:15,
   desc:'Sell a territory for 800d'},
  {id:'call_aid', name:'Call for Aid', icon:'🆘', cost:10,
   effect:{denarii:200, troops:100, favor:-10}, cooldown:8,
   desc:'Get 200d and 15 troops, -10 favor'},
];

// Victory conditions
const ENDINGS = [
  {cond:s=>s.territories.length>=10 && s.pop>=500 && s.happiness>=75, 
   title:'🏛️ The Eternal City', text:'Rome dominates Italia. Ten territories under your banner. The legend begins.'},
  {cond:s=>s.denarii>=15000 && s.reputation>=35, 
   title:'💰 Master of Commerce', text:'Your trade empire spans the peninsula. Wealth flows like the Tiber.'},
  {cond:s=>s.territories.length>=8 && s.troops>=180, 
   title:'⚔️ Conqueror King', text:'Your legions are unmatched. Italia trembles at your name.'},
  {cond:s=>s.pop>=600 && s.happiness>=90, 
   title:'🏘️ City of Glory', text:'A thriving metropolis of culture and prosperity. The people sing your praises.'},
  {cond:s=>s.productionBuildings.length>=15 && s.denarii>=10000, 
   title:'🏭 Industrial Pioneer', text:'Farms, mines, and workshops fuel an economic powerhouse.'},
  {cond:s=>s.starvedRounds>=3 || s.pop<40, 
   title:'💀 Famine', text:'Hunger scattered your people to the winds.'},
  {cond:()=>true, 
   title:'🎭 Legend of the Founders', text:'Though Rome did not rise as you hoped, your deeds echo in history.'},
];

/* ==================== GLOBAL STATE ==================== */
const S = {
  stage:'intro', founder:null, mods:null, name:'',
  round:0, maxRounds:25, wolfClicks:0, infiniteMode:false, nextTerritoryId:1000,
  
  // Economy - BALANCED
  denarii:5000, favor:10, reputation:0, capacity:120,
  priceIndex:Object.fromEntries(GOODS.map(g=>[g.id,100])),
  inventory:Object.fromEntries(GOODS.map(g=>[g.id,0])),
  inventoryFull:false,
  
  // Military - BALANCED
  troops:100, morale:70, supplies:30, victories:0,
  
  // Settlement - BALANCED
  pop:120, housing:150, sanitation:50, forts:2, happiness:70, food:400,
  starvedRounds:0, maxFood:500, maxSanitation:100,
  
  // Production
  productionBuildings:PRODUCTION_BUILDINGS.map(b=>({type:b.id, level:1})), // {type:'farm', level:1}
  territories:['palatine'],
  
  // Tech & state
  techs:Object.fromEntries(TECHNOLOGIES.map(t=>[t.id,false])),
  history:[], focus:'resources', season:'spring', mapTab:0,
  eventModifiers:{}, milestonesReached:[],
  lastUpkeep:0, lastTaxes:0,
  
  // Raid system
  lastRaidRound:0, nextRaidRound:5, raidsPending:false, battleActive:false,
  
  // NEW FEATURES
  achievements:[], // Array of achievement IDs earned
  activeQuests:[], // {id, progress, target, reward}
  cityRelations:Object.fromEntries(CITIES.map(c=>[c.id, c.relation || 0])),
  territorySpecializations:{}, // {territoryId: specializationType}
  seasonIndex:0, // 0=spring, 1=summer, 2=autumn, 3=winter
  advisorDismissed:false,
  lastAdvisorMessage:'',
  
  // Stats tracking
  totalIncomeEarned:0,
  totalSpentOnBuildings:0,
  largestConquestValue:0,
  currentWinStreak:0,
  longestWinStreak:0,
  resourcesProduced:{}, // By type
  tradeCount:0,
  emergencyActionsUsed:{},
};

// === Initialize procedural techs once on load ===
if (!S._procTechsAdded) {
  const proc = generateSeededTechs(5);
  if (typeof TECHNOLOGIES !== 'undefined' && Array.isArray(TECHNOLOGIES)) {
    proc.forEach(t => TECHNOLOGIES.push(t));
  }
  if (S.techs) {
    proc.forEach(t => { S.techs[t.id] = false; });
  }
  S._procTechsAdded = true;
}


/* ==================== UTILITIES ==================== */
// === Food consumption helper (early grace + seasonal realism + softer base) ===
function calcFoodConsumption() {
  const seasonalEffects = SEASONS[S.seasonIndex]?.effect || {};
  const seasonMul = seasonalEffects.foodConsumption || 1;

  // Gentle early-game rations: first 6 seasons 60%, next 6 seasons 80%
  const earlyMul = S.round <= 6 ? 0.6 : (S.round <= 12 ? 0.8 : 1);

  // Softer base coefficients vs previous 0.5/0.7 (pop/troops)
  const base = (S.pop * 0.42) + (S.troops * 0.55);

  return Math.floor(base * seasonMul * earlyMul);
}

const app = document.getElementById('app');
const el = (t,a={},...kids)=>{
  const n=document.createElement(t);
  for(const k in a){
    if(k==="class")n.className=a[k];
    else if(k.startsWith("on")&&typeof a[k]==="function")n.addEventListener(k.slice(2).toLowerCase(),a[k]);
    else if(k==="html")n.innerHTML=a[k];
    else if(k==="disabled"||k==="checked"||k==="selected")n[k]=a[k];
    else if(k==="style"&&typeof a[k]==="object")Object.assign(n.style,a[k]);
    else if(k!=="onClick")n.setAttribute(k,a[k]);
  }
  kids.flat().forEach(c=>n.append(c instanceof Node?c:document.createTextNode(String(c))));
  return n;
};

const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const fmt = n => new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(Math.round(n));
const rpick = arr => arr[Math.floor(Math.random()*arr.length)];
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

// Inflation system for infinite mode
function getInflationMultiplier() {
  if (!S.infiniteMode || S.round <= 25) return 1.0;
  // 0.5% inflation per round after round 25, capped at 3x
  const inflation = 1 + ((S.round - 25) * 0.005);
  return Math.min(inflation, 3.0);
}


// === Ensure quests are initialized and progressed passively ===
function _quest_passive_update(){
  if (typeof initializeQuests === 'function') initializeQuests();
  if (typeof updateQuestProgress === 'function'){
    updateQuestProgress('population');
    updateQuestProgress('troops');
    updateQuestProgress('wealth');
    updateQuestProgress('inventory');
  }
}

// Call once on load
document.addEventListener('DOMContentLoaded', ()=>{ try{ _quest_passive_update(); }catch(e){} });

// Also call at the end of each food/round cycle
(function(){
  const _origProcess = (typeof processFoodCycle === 'function') ? processFoodCycle : null;
  if (_origProcess){
    window.processFoodCycle = function(){
      const res = _origProcess.apply(this, arguments);
      try{ _quest_passive_update(); }catch(e){}
      return res;
    };
  }
})();


// === Apply ongoing procedural perks each round ===
(function(){
  const _origProcess2 = (typeof processFoodCycle === 'function') ? processFoodCycle : null;
  if (_origProcess2){
    window.processFoodCycle = function(){
      // before original: apply continuous growth perks
      if (S.proc_perk_pop_growth){ S.pop += S.proc_perk_pop_growth; }
      const ret = _origProcess2.apply(this, arguments);
      return ret;
    };
  }
})();


function ensureTab(label, focusKey){
  const appRoot = document.getElementById('app') || document.body;
  let tabs = appRoot.querySelector('.tabs');
  if (!tabs){
    tabs = el('div', {class:'tabs'});
    appRoot.prepend(tabs);
  }
  // If already present, return it
  const exists = Array.from(tabs.querySelectorAll('.tab')).find(b => b.dataset && b.dataset.focus === focusKey);
  if (exists) return exists;
  // Create new tab button
  const btn = el('div', {class:'tab', 'data-focus': focusKey, onClick:()=>{ S.focus = focusKey; render(); }}, label);
  tabs.appendChild(btn);
  return btn;
}

function renderTrackerScreen(){
    const appRoot = document.getElementById('app');
    if (!appRoot) return;
    // Clear existing main content if current design swaps screens on focus
    // Safely append a card with tracker details
    const card = el('div', {class:'card'});
    card.append(
      el('h2', {}, '📦 Resource Tracker'),
      el('div', {class:'small'}, 'Live view of your stored resources and capacity.')
    );
    // Build a simple grid of goods
    const grid = el('div', {class:'grid g3'});
    (GOODS||[]).forEach(g=>{
      const qty = S.inventory[g.id] || 0;
      const price = (S.priceIndex && S.priceIndex[g.id]) ? S.priceIndex[g.id] : 100;
      grid.append(
        el('div', {class:'choice'}, [
          el('div', {class:'pill'}, `${g.emoji} ${g.name}`),
          el('div', {class:'small'}, `Qty: ${qty}`),
          el('div', {class:'tiny'}, `Market index: ${price}`)
        ])
      );
    });
    const cap = el('div', {class:'info'}, `Capacity used: ${Object.values(S.inventory).reduce((a,b)=>a+b,0)} / ${S.capacity}`);
    card.append(grid, cap);
    appRoot.appendChild(card);
  }

  function renderMilitaryScreen(){
    const appRoot = document.getElementById('app');
    if (!appRoot) return;
    const card = el('div', {class:'card'});
    card.append(
      el('h2', {}, '🛡️ Military Overview'),
      el('div', {class:'grid g3'}, [
        el('div', {class:'choice'}, [el('div', {class:'pill'}, '👥 Troops'), el('div', {class:'small'}, `${S.troops}`)]),
        el('div', {class:'choice'}, [el('div', {class:'pill'}, '⚔️ Morale'), el('div', {class:'small'}, `${S.morale}`)]),
        el('div', {class:'choice'}, [el('div', {class:'pill'}, '📦 Supplies'), el('div', {class:'small'}, `${S.supplies}`)]),
        el('div', {class:'choice'}, [el('div', {class:'pill'}, '🏰 Forts'), el('div', {class:'small'}, `${S.forts}`)]),
        el('div', {class:'choice'}, [el('div', {class:'pill'}, '🏅 Win Streak'), el('div', {class:'small'}, `${S.currentWinStreak||0}`)]),
        el('div', {class:'choice'}, [el('div', {class:'pill'}, '🎖️ Victories'), el('div', {class:'small'}, `${S.victories||0}`)]),
      ])
    );
    if (S.nextRaidRound !== undefined && S.round !== undefined){
      const till = Math.max(0, (S.nextRaidRound||0) - (S.round||0));
      card.append(el('div', {class:'info'}, `Next raid in ~${till} round(s).`));
    }
    appRoot.appendChild(card);
  }

  // Wrap render() to inject our tabs and screens
  const _origRender = window.render;
  if (typeof _origRender === 'function'){
    window.render = function(){
      _origRender.apply(this, arguments);
      try {
        // Ensure the two new tabs exist
        const t1 = ensureTab('Tracker', 'tracker');
        const t2 = ensureTab('Military', 'military');
        // Update tab active state based on S.focus
        const allTabs = document.querySelectorAll('.tabs .tab');
        allTabs.forEach(t => {
          if (t.dataset && t.dataset.focus){
            t.classList.toggle('active', S.focus === t.dataset.focus);
          }
        });
        // Render extra screens when focused
        if (S.focus === 'tracker') {
          renderTrackerScreen();
        } else if (S.focus === 'military') {
          renderMilitaryScreen();
        }
      } catch (e) {
        console.warn('Extra tabs render error', e);
      }
    };
  } else {
    // If render isn't defined yet, add our screens on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', ()=>{
      ensureTab('Tracker', 'tracker');
      ensureTab('Military', 'military');
      if (S.focus === 'tracker') renderTrackerScreen();
      if (S.focus === 'military') renderMilitaryScreen();
    });
  }

// Save/Load system
function saveGame() {
  try {
    const saveData = JSON.stringify(S);
    localStorage.setItem('founding_of_rome_save', saveData);
    alert('✅ Game saved successfully!');
  } catch (e) {
    alert('❌ Failed to save game: ' + e.message);
  }
}

function loadGame() {
  try {
    const saveData = localStorage.getItem('founding_of_rome_save');
    if (!saveData) {
      alert('❌ No saved game found!');
      return false;
    }
    const loaded = JSON.parse(saveData);
    Object.assign(S, loaded);
    alert('✅ Game loaded successfully!');
    render();
    return true;
  } catch (e) {
    alert('❌ Failed to load game: ' + e.message);
    return false;
  }
}

function deleteSave() {
  if (confirm('Are you sure you want to delete your saved game?')) {
    localStorage.removeItem('founding_of_rome_save');
    alert('🗑️ Save deleted!');
  }
}

/* ==================== NEW FEATURES - ACHIEVEMENTS ==================== */
function checkAchievements() {
  ACHIEVEMENTS.forEach(achievement => {
    if (!S.achievements.includes(achievement.id) && achievement.check(S)) {
      unlockAchievement(achievement);
    }
  });
}

function unlockAchievement(achievement) {
  S.achievements.push(achievement.id);
  showAchievementNotification(achievement);
  
  // Apply rewards
  if (achievement.reward.denarii) {
    S.denarii += achievement.reward.denarii;
    S.totalIncomeEarned += achievement.reward.denarii;
  }
  if (achievement.reward.favor) S.favor += achievement.reward.favor;
  if (achievement.reward.reputation) S.reputation += achievement.reward.reputation;
  if (achievement.reward.happiness) S.happiness = Math.min(100, S.happiness + achievement.reward.happiness);
  if (achievement.reward.morale) S.morale = Math.min(100, S.morale + achievement.reward.morale);
  if (achievement.reward.housing) S.housing += achievement.reward.housing;
  if (achievement.reward.capacity) S.capacity += achievement.reward.capacity;
  if (achievement.reward.supplies) S.supplies += achievement.reward.supplies;
}

function showAchievementNotification(achievement) {
  const notification = el('div', {class:'achievement-notification'});
  notification.append(
    el('div', {class:'achievement-icon'}, achievement.icon),
    el('div', {class:'achievement-title'}, '🏆 Achievement Unlocked!'),
    el('div', {class:'achievement-title'}, achievement.name),
    el('div', {class:'achievement-desc'}, achievement.desc),
    el('div', {class:'achievement-reward'}, 
      'Reward: ' + Object.entries(achievement.reward).map(([k,v])=>`+${v} ${k}`).join(', '))
  );
  
  document.body.appendChild(notification);
  setTimeout(() => {
    if (notification.parentNode) notification.parentNode.removeChild(notification);
  }, 5000);
}

/* ==================== NEW FEATURES - QUEST SYSTEM ==================== */
function initializeQuests() {
  if (S.activeQuests.length < 2) {
    const available = QUEST_TEMPLATES.filter(q => 
      !S.activeQuests.find(aq => aq.id === q.id)
    );
    if (available.length > 0) {
      const newQuest = rpick(available);
      S.activeQuests.push({
        id: newQuest.id,
        progress: 0,
        target: newQuest.count || newQuest.target,
        template: newQuest
      });
    }
  }
}

function updateQuestProgress(type, amount = 1) {
  S.activeQuests.forEach(quest => {
    const template = quest.template;
    if (template.type === type) {
      if (type === 'building' && template.target) {
        // Count specific building types
        const count = S.productionBuildings.filter(b => b.type === template.target).length;
        quest.progress = count;
      } else if (type === 'population' || type === 'troops' || type === 'wealth' || type === 'inventory') {
        // Direct value checks
        if (type === 'population') quest.progress = S.pop;
        if (type === 'troops') quest.progress = S.troops;
        if (type === 'wealth') quest.progress = S.denarii;
        if (type === 'inventory') {
          quest.progress = Object.values(S.inventory).reduce((sum, qty) => sum + qty, 0);
        }
      } else {
        // Count-based quests
        quest.progress += amount;
      }
      
      // Check completion
      if (quest.progress >= quest.target) {
        completeQuest(quest);
      }
    }
  });
}

function completeQuest(quest) {
  const template = quest.template;
  
  // Apply rewards
  if (template.reward.denarii) {
    S.denarii += template.reward.denarii;
    S.totalIncomeEarned += template.reward.denarii;
  }
  if (template.reward.troops) S.troops += template.reward.troops;
  if (template.reward.favor) S.favor += template.reward.favor;
  if (template.reward.reputation) S.reputation += template.reward.reputation;
  if (template.reward.housing) S.housing += template.reward.housing;
  if (template.reward.happiness) S.happiness = Math.min(100, S.happiness + template.reward.happiness);
  if (template.reward.capacity) S.capacity += template.reward.capacity;
  if (template.reward.tradeBuff) {
    S.questTradeBuff = template.reward.tradeBuff;
    S.questTradeBuffDuration = template.reward.duration || 5;
  }
  
  alert(`📜 QUEST COMPLETE!\n\n${template.icon} ${template.name}\n\nReward: ${Object.entries(template.reward).map(([k,v])=>`+${v} ${k}`).join(', ')}`);
  
  // Remove from active quests
  S.activeQuests = S.activeQuests.filter(q => q.id !== quest.id);
  
  // Try to add a new quest
  initializeQuests();
}

/* ==================== NEW FEATURES - ADVISOR SYSTEM ==================== */
function updateAdvisor() {
  if (S.advisorDismissed) return;
  
  let message = '';
  
  // Priority warnings
  if (S.food < S.pop * 0.5) {
    message = '🌾 Your food stores are critically low! Build farms or trade for grain.';
  } else if (S.denarii < 500 && S.lastUpkeep > S.lastTaxes) {
    message = '💰 You\'re losing money each turn. Reduce troops or build production.';
  } else if (S.morale < 40) {
    message = '⚔️ Morale is poor. Win battles or recruit more troops to boost it.';
  } else if (S.happiness < 40) {
    message = '😢 Happiness is low. Build housing, improve sanitation, or host feasts.';
  } else if (S.pop > S.housing) {
    message = '🏠 Overcrowding! Build more housing to keep citizens happy.';
  } else if (S.inventoryFull) {
    message = '📦 Inventory nearly full! Trade goods before production is wasted.';
  } else if (S.raidWarning) {
    message = '⚔️ Enemy scouts spotted! A raid is coming. Prepare your defenses!';
  }
  
  // Helpful tips (lower priority)
  else if (S.round > 5 && S.productionBuildings.length === 0) {
    message = '🏗️ Consider building production facilities for passive income.';
  } else if (S.territories.length > 3 && !S.techs.roads) {
    message = '🛣️ Research Stone Roads to reduce trade risk and increase capacity.';
  } else if (S.denarii > 3000 && S.territories.length < 5) {
    message = '🗺️ You have wealth to spare. Consider expanding your territory!';
  }
  
  if (message && message !== S.lastAdvisorMessage) {
    S.lastAdvisorMessage = message;
    showAdvisor(message);
  }
}

function showAdvisor(message) {
  // Remove existing advisor
  const existing = document.querySelector('.advisor');
  if (existing) existing.remove();
  
  const advisor = el('div', {class:'advisor'});
  advisor.append(
    el('div', {class:'advisor-header'},
      el('div', {class:'advisor-title'}, '🧙 Advisor'),
      el('div', {class:'advisor-close', onClick:dismissAdvisor}, '×')
    ),
    el('div', {class:'advisor-text'}, message)
  );
  
  document.body.appendChild(advisor);
}

function dismissAdvisor() {
  S.advisorDismissed = true;
  const advisor = document.querySelector('.advisor');
  if (advisor) advisor.remove();
}

/* ==================== NEW FEATURES - RESOURCE COMBINATIONS ==================== */
function canAffordCombo(combo) {
  for (const [resource, amount] of Object.entries(combo.cost)) {
    if ((S.inventory[resource] || 0) < amount) return false;
  }
  return true;
}

function useResourceCombo(combo) {
  if (!canAffordCombo(combo)) return false;
  
  // Deduct resources
  for (const [resource, amount] of Object.entries(combo.cost)) {
    S.inventory[resource] -= amount;
  }
  
  // Apply effects
  if (combo.effect.attackBonus) {
    S.comboAttackBonus = combo.effect.attackBonus;
    S.comboAttackDuration = combo.effect.duration || 1;
  }
  if (combo.effect.happiness) {
    S.happiness = Math.min(100, S.happiness + combo.effect.happiness);
  }
  if (combo.effect.reputation) {
    S.reputation += combo.effect.reputation;
  }
  if (combo.effect.defense) {
    S.comboDefenseBonus = (S.comboDefenseBonus || 0) + combo.effect.defense;
  }
  if (combo.effect.tradeBuff) {
    S.comboTradeBuff = combo.effect.tradeBuff;
    S.comboTradeDuration = combo.effect.duration || 1;
  }
  if (combo.effect.morale) {
    S.morale = Math.min(100, S.morale + combo.effect.morale);
  }
  
  alert(`✨ ${combo.icon} ${combo.name}\n\n${combo.desc}`);
  return true;
}

/* ==================== NEW FEATURES - BUILDING UPGRADES ==================== */
function getBuildingLevel(buildingId) {
  const building = S.productionBuildings.find(b => b.id === buildingId);
  return building ? (building.level || 1) : 0;
}

function upgradeBuilding(buildingInstance) {
  const currentLevel = buildingInstance.level || 1;
  if (currentLevel >= 3) return false;
  
  const baseCost = PRODUCTION_BUILDINGS.find(b => b.id === buildingInstance.type).cost;
  const upgradeCost = Math.floor(baseCost * (currentLevel + 1) * 0.8);
  
  if (S.denarii < upgradeCost) return false;
  
  S.denarii -= upgradeCost;
  S.totalSpentOnBuildings += upgradeCost;
  buildingInstance.level = currentLevel + 1;
  
  return true;
}

/* ==================== NEW FEATURES - CITY RELATIONSHIPS ==================== */
function adjustCityRelation(cityId, amount) {
  S.cityRelations[cityId] = (S.cityRelations[cityId] || 0) + amount;
  S.cityRelations[cityId] = clamp(S.cityRelations[cityId], -20, 20);
}

function getCityRelationMultiplier(cityId) {
  const relation = S.cityRelations[cityId] || 0;
  if (relation > 10) return 0.8; // 20% discount on tariffs
  if (relation < -5) return 1.2; // 20% penalty
  return 1.0;
}

/* ==================== NEW FEATURES - TERRITORY SPECIALIZATION ==================== */
function specializeTerritory(territoryId, specializationType) {
  const spec = SPECIALIZATIONS.find(s => s.id === specializationType);
  if (!spec || S.denarii < spec.cost) return false;
  
  S.denarii -= spec.cost;
  S.territorySpecializations[territoryId] = specializationType;
  
  // Apply immediate effects
  if (spec.effect.fortBonus) S.forts += spec.effect.fortBonus;
  if (spec.effect.reputation) S.reputation += spec.effect.reputation;
  
  alert(`✨ Territory Specialized!\n\n${spec.icon} ${spec.name}\n${spec.desc}`);
  return true;
}

/* ==================== NEW FEATURES - EMERGENCY ACTIONS ==================== */
function canUseEmergencyAction(actionId) {
  const lastUsed = S.emergencyActionsUsed[actionId] || 0;
  const action = EMERGENCY_ACTIONS.find(a => a.id === actionId);
  return (S.round - lastUsed) >= action.cooldown;
}

function useEmergencyAction(actionId) {
  const action = EMERGENCY_ACTIONS.find(a => a.id === actionId);
  if (!action || !canUseEmergencyAction(actionId)) return false;
  
  // Check favor cost
  if (action.cost && S.favor < action.cost) return false;
  
  if (action.cost) S.favor -= action.cost;
  
  // Apply effects
  if (action.effect.denarii) S.denarii += action.effect.denarii;
  if (action.effect.happiness) S.happiness = Math.max(0, S.happiness + action.effect.happiness);
  if (action.effect.troops) S.troops += action.effect.troops;
  if (action.effect.pop) S.pop = Math.max(20, S.pop + action.effect.pop);
  if (action.effect.favor) S.favor += action.effect.favor;
  
  if (action.effect.territory && S.territories.length > 1) {
    // Remove a random territory (not Palatine)
    const removable = S.territories.filter(t => t !== 'palatine');
    if (removable.length > 0) {
      const removed = rpick(removable);
      S.territories = S.territories.filter(t => t !== removed);
      const territory = TERRITORIES.find(t => t.id === removed);
      if (territory) territory.status = 'hostile';
    }
  }
  
  S.emergencyActionsUsed[actionId] = S.round;
  alert(`🚨 ${action.icon} ${action.name}\n\n${action.desc}`);
  return true;
}

/* ==================== NEW FEATURES - SEASONAL EFFECTS ==================== */
function getSeasonalEffects() {
  const season = SEASONS[S.seasonIndex];
  return season.effect;
}

function advanceSeason() {
  S.seasonIndex = (S.seasonIndex + 1) % SEASONS.length;
  S.season = SEASONS[S.seasonIndex].name.toLowerCase();
}

function countRarities() {
  const counts = {
    Imperial: 0,
    Legendary: 0,
    Epic: 0,
    Rare: 0,
    Uncommon: 0,
    Common: 0
  };
  
  // Count territories
  S.territories.forEach(tId => {
    const territory = TERRITORIES.find(t => t.id === tId);
    if (territory && territory.rarity) {
      counts[territory.rarity.name]++;
    }
  });
  
  // Count production buildings
  S.productionBuildings.forEach(b => {
    const building = PRODUCTION_BUILDINGS.find(pb => pb.id === b.type);
    if (building && building.rarity) {
      counts[building.rarity.name]++;
    }
  });
  
  return counts;
}

function exportStats() {
  const rarities = countRarities();
  const totalItems = Object.values(rarities).reduce((a, b) => a + b, 0);
  
  const stats = `
═══════════════════════════════════════════════════════════════
          🏛️ FOUNDING OF ROME - RUN SUMMARY 🏛️
═══════════════════════════════════════════════════════════════

👑 FOUNDER: ${S.name} (${S.founder})
📅 FINAL SEASON: ${S.round}
${S.infiniteMode ? '♾️ MODE: INFINITE' : '🏁 MODE: STANDARD (25 SEASONS)'}

═══════════════════════════════════════════════════════════════
                        💰 ECONOMY
═══════════════════════════════════════════════════════════════
Denarii: ${fmt(S.denarii)}
Reputation: ${S.reputation}
Favor: ${S.favor}

═══════════════════════════════════════════════════════════════
                        ⚔️ MILITARY
═══════════════════════════════════════════════════════════════
Troops: ${S.troops}
Morale: ${Math.round(S.morale)}%
Victories: ${S.victories}
Forts: ${S.forts}

═══════════════════════════════════════════════════════════════
                       🏘️ SETTLEMENT
═══════════════════════════════════════════════════════════════
Population: ${S.pop}
Housing: ${S.housing}
Happiness: ${Math.round(S.happiness)}%
Sanitation: ${Math.round(S.sanitation)}%
Food Stores: ${Math.floor(S.food)}

═══════════════════════════════════════════════════════════════
                      🗺️ TERRITORIES
═══════════════════════════════════════════════════════════════
Territories Controlled: ${S.territories.length}
${S.territories.map((tId, i) => {
  const t = TERRITORIES.find(x => x.id === tId);
  const rarityText = t && t.rarity ? ` [${t.rarity.name}]` : '';
  const latinText = t && t.latinName ? ` (${t.latinName})` : '';
  return `${i + 1}. ${t ? t.name : tId}${latinText}${rarityText}`;
}).join('\n')}

═══════════════════════════════════════════════════════════════
                    🏭 PRODUCTION BUILDINGS
═══════════════════════════════════════════════════════════════
Total Buildings: ${S.productionBuildings.length}
${S.productionBuildings.map((b, i) => {
  const building = PRODUCTION_BUILDINGS.find(pb => pb.id === b.type);
  const rarityText = building && building.rarity ? ` [${building.rarity.name}]` : '';
  const latinText = building && building.latinName ? ` (${building.latinName})` : '';
  return `${i + 1}. ${building ? building.name : b.type}${latinText}${rarityText}`;
}).join('\n')}

═══════════════════════════════════════════════════════════════
                     ✨ RARITY BREAKDOWN
═══════════════════════════════════════════════════════════════
Total Items Found: ${totalItems}

🔴 Imperial (0.05%):    ${rarities.Imperial} ${rarities.Imperial > 0 ? '🌟'.repeat(rarities.Imperial) : ''}
🟠 Legendary (0.5%):    ${rarities.Legendary}
🟣 Epic (2.5%):         ${rarities.Epic}
🔵 Rare (5%):           ${rarities.Rare}
🟢 Uncommon (12%):      ${rarities.Uncommon}
⚪ Common (80%):        ${rarities.Common}

${rarities.Imperial > 0 ? '\n🎉 INCREDIBLE! You found ' + rarities.Imperial + ' IMPERIAL item(s)! 🎉\n' : ''}
═══════════════════════════════════════════════════════════════
                      📊 TECHNOLOGIES
═══════════════════════════════════════════════════════════════
Researched: ${Object.values(S.techs).filter(Boolean).length}/${TECHNOLOGIES.length}
${TECHNOLOGIES.filter(t => S.techs[t.id]).map(t => `✓ ${t.name}`).join('\n')}

═══════════════════════════════════════════════════════════════
                        🎯 FINAL SCORE
═══════════════════════════════════════════════════════════════
Economic Power:   ${Math.floor(S.denarii / 100)}
Military Power:   ${S.troops + S.victories * 10}
Cultural Power:   ${Math.floor(S.pop / 2 + S.happiness)}
Imperial Power:   ${S.territories.length * 50}
                  ─────────────
TOTAL SCORE:      ${Math.floor(S.denarii / 100) + S.troops + S.victories * 10 + Math.floor(S.pop / 2 + S.happiness) + S.territories.length * 50}

═══════════════════════════════════════════════════════════════

Generated: ${new Date().toLocaleString()}
Game: Founding of Rome - Complete Edition
═══════════════════════════════════════════════════════════════
`;
  
  // Create download
  const blob = new Blob([stats], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rome_run_season${S.round}_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert('📊 Stats exported! Check your downloads folder.');
}

// Raid system
function checkForRaid() {
  if (S.round >= S.nextRaidRound && !S.raidsPending) {
    S.raidsPending = true;
    S.nextRaidRound = S.round + 5;
    return true;
  }
  return false;
}

function calculateRaidStrength() {
  const baseStrength = 30 + (S.round * 2);
  const territoryBonus = S.territories.length * 3;
  const wealthBonus = Math.floor(S.denarii / 500);
  
  const infiniteMultiplier = S.infiniteMode ? 1.3 : 1.0;
  const lateGameMultiplier = S.round > 25 ? 1.0 + ((S.round - 25) * 0.002) : 1.0;
  
  const totalStrength = Math.floor((baseStrength + territoryBonus + wealthBonus) * infiniteMultiplier * lateGameMultiplier);
  return totalStrength;
}

function calculateBattleOdds() {
  const ourStrength = Math.floor(S.troops * (S.morale / 100));
  const enemyStrength = calculateRaidStrength();
  
  const strengthRatio = ourStrength / (ourStrength + enemyStrength);
  const winChance = Math.floor(clamp(strengthRatio * 100, 10, 95));
  
  return {
    ourStrength,
    enemyStrength,
    winChance
  };
}

function executeBattle() {
  const odds = calculateBattleOdds();
  const roll = Math.random() * 100;
  const victory = roll < odds.winChance;
  
  const baseCasualties = Math.floor(5 + Math.random() * 15);
  const casualties = victory ? baseCasualties : Math.floor(baseCasualties * 1.5);
  
  S.troops = Math.max(0, S.troops - casualties);
  
  if (victory) {
    const goldReward = Math.floor(150 + (S.round * 10) + Math.random() * 200);
    S.denarii += goldReward;
    S.reputation += 5;
    S.favor += 3;
    S.morale = Math.min(100, S.morale + 8);
    S.victories++;
    
    setTimeout(() => {
      alert(`⚔️ VICTORY!\n\n💰 Plunder: +${fmt(goldReward)} denarii\n💀 Casualties: ${casualties} troops\n🎖️ +5 reputation, +3 favor\n\nYour legions prevail!`);
      S.battleActive = false;
      S.raidsPending = false;
      render();
    }, 100);
  } else {
    S.morale = Math.max(0, S.morale - 20);
    S.happiness = Math.max(0, S.happiness - 15);
    S.pop = Math.max(20, S.pop - Math.floor(10 + Math.random() * 20));
    
    setTimeout(() => {
      alert(`💀 DEFEAT!\n\n💀 Casualties: ${casualties} troops\n😢 Population: -${Math.floor(10 + Math.random() * 20)}\n📉 Morale: -20%, Happiness: -15%\n\nRegroup and rebuild!`);
      S.battleActive = false;
      S.raidsPending = false;
      render();
    }, 100);
  }
}

function renderBattleScreen() {
  const odds = calculateBattleOdds();
  const enemyName = `Raiding ${['Bandits', 'Barbarians', 'Marauders', 'Invaders', 'Raiders'][Math.floor(Math.random() * 5)]}`;
  
  const battleScreen = el('div', {class:'battle-screen'});
  const battleCard = el('div', {class:'battle-card'});
  
  const winChanceClass = odds.winChance >= 70 ? 'win-high' : odds.winChance >= 40 ? 'win-medium' : 'win-low';
  
  battleCard.append(
    el('h2', {style:'text-align:center;color:var(--roman-red);margin:0 0 16px 0'}, '⚔️ ENEMY RAID!'),
    el('div', {class:'info', style:'background:#fef2f2;border-color:#fca5a5'},
      `${enemyName} attack your borders! Defend Rome!`
    ),
    
    el('div', {class:'battle-animation'},
      el('div', {class:'battle-unit unit-left'}, '🛡️'),
      el('div', {class:'battle-unit unit-right'}, '⚔️'),
      el('div', {class:'battle-effects'},
        el('div', {class:'battle-spark'}, '💥')
      )
    ),
    
    el('div', {class:'grid g2', style:'margin:16px 0'},
      el('div', {},
        el('h3', {style:'margin:4px 0;text-align:center'}, '🛡️ Your Forces'),
        el('div', {class:'small', style:'text-align:center'}, `Troops: ${S.troops}`),
        el('div', {class:'small', style:'text-align:center'}, `Morale: ${Math.round(S.morale)}%`),
        el('div', {class:'small', style:'text-align:center;font-weight:700;color:#16a34a'}, `Strength: ${odds.ourStrength}`)
      ),
      el('div', {},
        el('h3', {style:'margin:4px 0;text-align:center'}, '⚔️ Enemy Forces'),
        el('div', {class:'small', style:'text-align:center'}, `${enemyName}`),
        el('div', {class:'small', style:'text-align:center'}, `Season ${S.round}`),
        el('div', {class:'small', style:'text-align:center;font-weight:700;color:#dc2626'}, `Strength: ${odds.enemyStrength}`)
      )
    ),
    
    el('div', {class:`win-chance ${winChanceClass}`},
      `Victory Chance: ${odds.winChance}%`
    ),
    
    el('div', {class:'info', style:'font-size:12px'},
      `⚠️ Victory: Gain gold and reputation\n💀 Defeat: Lose troops and population`
    ),
    
    el('div', {style:'display:flex;gap:12px;margin-top:16px'},
      el('button', {
        class:'btn btn-primary',
        style:'flex:1',
        onClick: executeBattle
      }, '⚔️ FIGHT!'),
      el('button', {
        class:'btn',
        style:'flex:1',
        onClick: () => {
          if (confirm('Retreat? You will lose 20% of your troops and all morale!')) {
            const losses = Math.floor(S.troops * 0.2);
            S.troops = Math.max(0, S.troops - losses);
            S.morale = Math.max(0, S.morale - 30);
            S.happiness = Math.max(0, S.happiness - 20);
            alert(`Retreat! Lost ${losses} troops deserting. -30% morale, -20% happiness.`);
            S.battleActive = false;
            S.raidsPending = false;
            render();
          }
        }
      }, '🏃 Retreat')
    )
  );
  
  battleScreen.append(battleCard);
  app.textContent = '';
  app.append(battleScreen);
}

/* ==================== PRODUCTION & TERRITORY MECHANICS ==================== */

function produceResources() {
  const seasonalEffects = getSeasonalEffects();
  
  // Produce from buildings
  S.productionBuildings.forEach(b => {
    const building = PRODUCTION_BUILDINGS.find(pb => pb.id === b.type);
    if (building) {
      let rate = building.rate;
      
      // Apply building level (1x, 1.5x, 2x)
      const level = b.level || 1;
      rate = Math.floor(rate * (1 + (level - 1) * 0.5));
      
      // Apply rarity bonus!
      if (building.rarity) {
        rate = Math.floor(rate * building.rarity.bonus);
      }
      
      // Tech bonuses
      if (building.produces === 'grain' && S.techs.irrigation) rate = Math.floor(rate * 1.5);
      if (building.produces === 'iron' && S.techs.mining) rate *= 2;
      
      // Event bonuses
      if ((building.produces === 'grain' || building.produces === 'livestock') && S.eventModifiers.farmBonus) {
        rate = Math.floor(rate * S.eventModifiers.farmBonus);
      }
      if (building.produces === 'livestock' && S.eventModifiers.livestockBonus) {
        rate = Math.floor(rate * S.eventModifiers.livestockBonus);
      }
      if (building.produces === 'iron' && S.eventModifiers.ironBonus) {
        rate = Math.floor(rate * S.eventModifiers.ironBonus);
      }
      if (S.eventModifiers.productionBuff) {
        rate = Math.floor(rate * S.eventModifiers.productionBuff);
      }
      
      // Seasonal effects
      if ((building.produces === 'grain' || building.produces === 'livestock') && seasonalEffects.farmBonus) {
        rate = Math.floor(rate * seasonalEffects.farmBonus);
      }
      
      // Founder bonuses
      if (S.mods && S.mods.productionBonus) rate = Math.floor(rate * S.mods.productionBonus);
      
      // Track production for achievements
      S.resourcesProduced[building.produces] = (S.resourcesProduced[building.produces] || 0) + rate;
      
      // Add to inventory with capacity check
      const current = S.inventory[building.produces] || 0;
      const totalResources = Object.values(S.inventory).reduce((sum, qty) => sum + qty, 0);
      
      if (totalResources + rate <= S.capacity) {
        S.inventory[building.produces] = current + rate;
      } else {
        const space = Math.max(0, S.capacity - totalResources);
        S.inventory[building.produces] = current + space;
      }
    }
  });
  
  // Produce from territories
  S.territories.forEach(tId => {
    const territory = TERRITORIES.find(t => t.id === tId);
    if (territory && territory.produces && territory.status === 'owned') {
      Object.entries(territory.produces).forEach(([resource, amount]) => {
        let prodAmount = amount;
        
        // Apply rarity bonus!
        if (territory.rarity) {
          prodAmount = Math.floor(prodAmount * territory.rarity.bonus);
        }
        
        // Territory specialization bonuses
        const spec = S.territorySpecializations[tId];
        if (spec === 'farm' && (resource === 'grain' || resource === 'livestock')) {
          prodAmount = Math.floor(prodAmount * 1.5);
        }
        if (spec === 'mine' && (resource === 'iron' || resource === 'clay' || resource === 'salt')) {
          prodAmount = Math.floor(prodAmount * 1.5);
        }
        
        // Event bonuses
        if ((resource === 'grain' || resource === 'livestock') && S.eventModifiers.farmBonus) {
          prodAmount = Math.floor(prodAmount * S.eventModifiers.farmBonus);
        }
        
        // Seasonal effects
        if ((resource === 'grain' || resource === 'livestock') && seasonalEffects.farmBonus) {
          prodAmount = Math.floor(prodAmount * seasonalEffects.farmBonus);
        }
        
        // Founder bonuses
        if (S.mods && S.mods.territoryBonus) {
          prodAmount = Math.floor(prodAmount * S.mods.territoryBonus);
        }
        
        // Track production for achievements
        S.resourcesProduced[resource] = (S.resourcesProduced[resource] || 0) + prodAmount;
        
        // Add to inventory with capacity check
        const current = S.inventory[resource] || 0;
        const totalResources = Object.values(S.inventory).reduce((sum, qty) => sum + qty, 0);
        
        if (totalResources + prodAmount <= S.capacity) {
          S.inventory[resource] = current + prodAmount;
        } else {
          const space = Math.max(0, S.capacity - totalResources);
          S.inventory[resource] = current + space;
        }
      });
    }
  });
  
  // Check if inventory is at or near capacity
  const totalInventory = Object.values(S.inventory).reduce((sum, qty) => sum + qty, 0);
  
// --- Auto-convert a portion of stored grain/livestock into edible food (early buffer) ---
(function __auto_convert_food_buffer__(){
  // Compute an early-game target buffer (~3x pop), but never exceed max storage
  let maxFood = S.maxFood;
  if (S.techs && S.techs.granaries) maxFood += 100;
  const targetBuffer = Math.floor(Math.min(maxFood, S.pop * 3));

  if (S.food < targetBuffer) {
    let needed = targetBuffer - S.food;

    // Convert grain first (5 food each), then livestock (3 food each)
    let useGrain = Math.min(S.inventory.grain || 0, Math.ceil(needed / 5));
    if (useGrain > 0) {
      S.inventory.grain -= useGrain;
      S.food += useGrain * 5;
      needed = Math.max(0, targetBuffer - S.food);
    }

    let useLivestock = Math.min(S.inventory.livestock || 0, Math.ceil(needed / 3));
    if (useLivestock > 0) {
      S.inventory.livestock -= useLivestock;
      S.food += useLivestock * 3;
    }

    // Respect the hard cap
    // Early-game extra storage headroom
    if (S.round <= 6) maxFood += 100;
    else if (S.round <= 12) maxFood += 50;
  // Hidden dynamic cap scaling for students
  maxFood += (S.round * 200);
    S.food = Math.min(S.food, maxFood);
  }
})(); // end auto-convert

S.inventoryFull = totalInventory >= S.capacity * 0.95;  // 95% full counts as "full"
}

function recalcHappiness() {
  let base = 50;
  
  if (S.pop > S.housing) base -= 20;
  else if (S.housing > S.pop * 1.5) base += 10;
  
  if (S.sanitation >= 70) base += 15;
  else if (S.sanitation < 40) base -= 15;
  
  if (S.food > S.pop * 2) base += 10;
  else if (S.food < S.pop) base -= 15;
  
  if (S.morale >= 70) base += 10;
  else if (S.morale < 40) base -= 10;
  
  if (S.denarii > 5000) base += 10;
  else if (S.denarii < 500) base -= 10;
  
  if (S.mods && S.mods.happinessMul) base *= S.mods.happinessMul;
  S.happiness = clamp(base, 0, 100);
}

function processFoodCycle() {
  
  // Secret ease buff: +100 food each round
  S.food = (S.food || 0) + 100;
let consumption = calcFoodConsumption();
  
  // First, deduct consumption from food stores
  S.food -= consumption;
  
  // If food goes negative, try to use inventory
  if (S.food < 0) {
    let foodDeficit = Math.abs(S.food);
    S.food = 0;  // Reset to 0
    
    // Try to cover deficit with livestock first (more efficient)
    let livestock = S.inventory.livestock || 0;
    if (livestock > 0 && foodDeficit > 0) {
      let livestockNeeded = Math.ceil(foodDeficit / 3);
      let livestockUsed = Math.min(livestock, livestockNeeded);
      S.inventory.livestock = Math.max(0, livestock - livestockUsed);
      foodDeficit -= livestockUsed * 3;
    }
    
    // Then use grain if still in deficit
    if (foodDeficit > 0) {
      let grain = S.inventory.grain || 0;
      if (grain > 0) {
        let grainNeeded = Math.ceil(foodDeficit / 5);  // Changed from 4 to 5 to match foodValue
        let grainUsed = Math.min(grain, grainNeeded);
        S.inventory.grain = Math.max(0, grain - grainUsed);
        foodDeficit -= grainUsed * 5;  // Changed from 4 to 5
      }
    }
    
    // If still in deficit after using inventory = STARVATION
    if (foodDeficit > 0) {
      S.starvedRounds++;
      const loss = Math.floor(4 + Math.random() * 8);
      S.pop = Math.max(20, S.pop - loss);
      S.happiness = Math.max(0, S.happiness - 15);
      S.morale = Math.max(0, S.morale - 10);
      return {starved: true, loss};
    } else {
      // We covered the deficit with inventory
      S.food = Math.max(0, -foodDeficit);  // Any excess becomes food
      S.starvedRounds = Math.max(0, S.starvedRounds - 1);
    }
  } else {
    // Food was positive, no deficit
    S.starvedRounds = Math.max(0, S.starvedRounds - 1);
  }
  
  // Cap food at maximum
  let maxFood = S.maxFood;
  if (S.techs.granaries) maxFood += 100;
  // Early-game extra storage headroom
  if (S.round <= 6) maxFood += 100;
  else if (S.round <= 12) maxFood += 50;
  // Hidden dynamic cap scaling for students
  maxFood += (S.round * 200);
  S.food = Math.min(S.food, maxFood);
  
  return {starved: false};
}

function processPopGrowth() {
  if (S.happiness < 30 || S.food < S.pop) return 0;
  
  let growth = 0;
  if (S.happiness >= 75) growth += 4;
  else if (S.happiness >= 60) growth += 2;
  else if (S.happiness >= 45) growth += 1;
  
  if (S.housing < S.pop) growth = 0;
  else if (S.housing > S.pop * 1.2) growth += 1;
  
  if (S.sanitation >= 60) growth += 1;
  if (S.techs.aqueduct) growth += 2;
  if (S.food > S.pop * 3) growth += 1;
  
  S.pop += growth;
  return growth;
}

function updateMorale() {
  let decay = 2;
  if (S.food < S.troops * 1.5) decay += 3;
  if (S.supplies >= S.troops * 0.5) decay -= 1;
  if (S.happiness >= 70) decay -= 1;
  else if (S.happiness < 40) decay += 2;
  if (S.techs.legion) decay *= 0.8;
  if (S.mods && S.mods.moraleDecay) decay *= S.mods.moraleDecay;
  S.morale = clamp(S.morale - decay, 0, 100);
}

function conquestTerritory(territory) {
  const odds = calculateConquestOdds(territory);
  const victory = Math.random() < odds.winProb;
  
  const loss = victory ? Math.floor(3 + Math.random() * 6) : Math.floor(8 + Math.random() * 12);
  S.troops = Math.max(0, S.troops - loss);
  
  if (victory) {
    S.territories.push(territory.id);
    territory.status = 'owned';
    
    
    try { window.dispatchEvent(new CustomEvent('territory:conquered', {detail:{id: territory.id}})); } catch(e) {}
    // Apply rarity bonus to conquest reward!
    let reward = territory.value;
    if (territory.rarity) {
      reward = Math.floor(reward * territory.rarity.bonus);
    }
    
    S.denarii += reward;
    S.morale = Math.min(100, S.morale + 10);
    S.reputation += 8;
    S.favor += 4;
    S.victories++;
    
    const rarityText = territory.rarity ? ` [${territory.rarity.name} rarity!]` : '';
    alert(`⚔️ VICTORY!\n\nConquered ${territory.name}${rarityText}\n+${fmt(reward)} denarii\nLosses: ${loss} troops`);
    
    S.history.push({
      round: S.round + 1,
      kind: 'Conquest',
      action: territory.name,
      note: `Victory! +${reward}d, Losses: ${loss}`
    });
  } else {
    S.morale = Math.max(0, S.morale - 15);
    S.happiness = Math.max(0, S.happiness - 10);
    
    alert(`💀 DEFEAT!\n\nFailed to take ${territory.name}\nLosses: ${loss} troops\n-15% morale, -10% happiness`);
    
    S.history.push({
      round: S.round + 1,
      kind: 'Conquest',
      action: territory.name,
      note: `Defeat. Losses: ${loss} troops`
    });
  }
  
  endSeason();
}

function calculateConquestOdds(territory) {
  let ourStr = S.troops * (S.morale / 100);
  if (S.supplies >= S.troops * 0.5) ourStr *= 1.2;
  if (S.techs.legion) ourStr *= 1.2;
  if (S.techs.forge) ourStr *= 1.1;
  if (S.mods && S.mods.attackBonus) ourStr += S.mods.attackBonus;
  if (S.mods && S.mods.territoryBonus) ourStr *= S.mods.territoryBonus;
  
  const enemyStr = territory.str;
  const winProb = clamp(ourStr / (ourStr + enemyStr), 0.1, 0.9);
  return {ourStr, enemyStr, winProb};
}

/* ==================== SEASON ENDING ==================== */

function endSeason() {
  // Advance season
  advanceSeason();
  const seasonalEffects = getSeasonalEffects();
  
  // Production
  produceResources();
  
  // Food & population
  let foodConsumptionMul = 1.0;
  if (seasonalEffects.foodConsumption) foodConsumptionMul = seasonalEffects.foodConsumption;
  
  const foodResult = processFoodCycle(foodConsumptionMul);
  if (foodResult.starved) {
    alert(`⚠️ FAMINE!\n\nYour people starve!\nLost ${foodResult.loss} population\n-15% happiness, -10% morale`);
  }
  processPopGrowth();
  
  // Morale & happiness
  updateMorale();
  
  // Apply seasonal morale penalty (winter)
  if (seasonalEffects.moralePenalty) {
    S.morale = Math.max(0, S.morale - seasonalEffects.moralePenalty);
  }
  
  // Apply seasonal happiness boost (summer)
  if (seasonalEffects.happiness) {
    S.happiness = Math.min(100, S.happiness + seasonalEffects.happiness);
  }
  
  recalcHappiness();
  
  // Track income for stats
  const prevDenarii = S.denarii;
  
  // Taxes (increased base rate for better balance)
  const taxes = Math.floor(S.pop * 0.7 + (S.happiness >= 70 ? S.pop * 0.2 : 0));
  S.denarii += taxes;
  S.totalIncomeEarned += taxes;
  if (S.techs.senate) S.favor += 2;
  
  // UPKEEP COSTS - Critical for game balance!
  let upkeep = 0;
  
  // Building maintenance (6d per building - reduced from 8d)
  upkeep += S.productionBuildings.length * 6;
  
  // Troop wages (2d per soldier - reduced from 3d)
  upkeep += S.troops * 2;
  
  // Housing maintenance (1d per 15 housing - reduced from 10)
  upkeep += Math.floor(S.housing / 15);
  
  // Infrastructure costs (forts, sanitation)
  upkeep += S.forts * 4;  // reduced from 5d
  upkeep += Math.floor(S.sanitation / 8);  // reduced from 5
  
  // Seasonal upkeep multiplier (winter)
  if (seasonalEffects.upkeepMul) {
    upkeep = Math.floor(upkeep * seasonalEffects.upkeepMul);
  }
  
  // Infinite mode has 1.4x upkeep costs
  if (S.infiniteMode) {
    upkeep = Math.floor(upkeep * 1.4);
  }
  
  // Event upkeep reduction
  if (S.eventModifiers.buildCostMul) {
    // Construction boom affects upkeep too
    upkeep = Math.floor(upkeep * Math.min(1.0, S.eventModifiers.buildCostMul + 0.2));
  }
  
  // Deduct upkeep
  S.denarii -= upkeep;
  
  // Bankruptcy check
  if (S.denarii < 0) {
    S.denarii = 0;
    S.happiness = Math.max(0, S.happiness - 25);
    S.morale = Math.max(0, S.morale - 15);
    alert(`💸 BANKRUPTCY!\n\nCannot afford upkeep of ${upkeep}d!\nYour denarii: 0\n\n-25% happiness\n-15% morale`);
  }
  
  // Store upkeep for display
  S.lastUpkeep = upkeep;
  S.lastTaxes = taxes;
  
  // Events
  S.eventModifiers = {};
  S.raidWarning = false;
  
  if (Math.random() < 0.35) {  // Increased from 0.3 for more events
    const event = rpick(EVENTS.filter(e => Math.random() < e.prob));
    if (event) {
      event.effect(S.eventModifiers);
      
      // Apply event effects
      if (S.eventModifiers.popAdd) S.pop += S.eventModifiers.popAdd;
      if (S.eventModifiers.foodDelta) S.food = Math.max(0, S.food + S.eventModifiers.foodDelta);
      if (S.eventModifiers.moraleAdd) S.morale = clamp(S.morale + S.eventModifiers.moraleAdd, 0, 100);
      if (S.eventModifiers.happinessAdd) S.happiness = clamp(S.happiness + S.eventModifiers.happinessAdd, 0, 100);
      if (S.eventModifiers.favorAdd) S.favor += S.eventModifiers.favorAdd;
      if (S.eventModifiers.reputationAdd) S.reputation += S.eventModifiers.reputationAdd;
      if (S.eventModifiers.denariDelta) {
        S.denarii = Math.max(0, S.denarii + S.eventModifiers.denariDelta);
        if (S.eventModifiers.denariDelta > 0) S.totalIncomeEarned += S.eventModifiers.denariDelta;
      }
      if (S.eventModifiers.sanitationDelta) {
        S.sanitation = clamp(S.sanitation + S.eventModifiers.sanitationDelta, 0, S.maxSanitation);
      }
      if (S.eventModifiers.permanentTradeBuff) {
        S.permanentTradeBuff = 1.05; // Permanent 5% trade boost
      }
      
      // Show event notification
      alert(`${event.icon} ${event.name.toUpperCase()}\n\n${event.text}`);
    }
  }
  
  // Price fluctuations
  GOODS.forEach(g => {
    let volatilityMultiplier = 1.0;
    if (S.infiniteMode) volatilityMultiplier = 2.5;
    
    // Seasonal trade price bonus (autumn)
    if (seasonalEffects.tradePrices && Math.random() > 0.5) {
      S.priceIndex[g.id] *= seasonalEffects.tradePrices;
    }
    
    const drift = (Math.random() - 0.5) * g.vol * 20 * volatilityMultiplier;
    S.priceIndex[g.id] = clamp(S.priceIndex[g.id] + drift, 60, 180);
  });
  
  // Decrease temporary buff durations
  if (S.comboAttackDuration) {
    S.comboAttackDuration--;
    if (S.comboAttackDuration <= 0) {
      S.comboAttackBonus = 0;
      S.comboAttackDuration = 0;
    }
  }
  if (S.comboTradeDuration) {
    S.comboTradeDuration--;
    if (S.comboTradeDuration <= 0) {
      S.comboTradeBuff = 1.0;
      S.comboTradeDuration = 0;
    }
  }
  if (S.questTradeBuffDuration) {
    S.questTradeBuffDuration--;
    if (S.questTradeBuffDuration <= 0) {
      S.questTradeBuff = 1.0;
      S.questTradeBuffDuration = 0;
    }
  }
  
  S.round++;
  
  // Check achievements & update quests
  checkAchievements();
  updateQuestProgress('population');
  updateQuestProgress('troops');
  updateQuestProgress('wealth');
  updateQuestProgress('inventory');
  initializeQuests();
  
  // Update advisor
  updateAdvisor();
  
  // Check for raids
  if (checkForRaid()) {
    S.battleActive = true;
    render();
    return;
  }
  
  // Infinite mode: Generate new content
  if (S.infiniteMode) {
    if (S.round % 7 === 0) {
      generateNewTerritory();
    }
    if (S.round % 10 === 0 && PRODUCTION_BUILDINGS.length < 50) {
      generateNewProductionBuilding();
    }
    if (S.round % 15 === 0 && TECHNOLOGIES.length < 40) {
      generateNewTechnology();
    }
    if (S.round % 20 === 0 && CITIES.length < 20) {
      generateNewCity();
    }
  }
  
  // Check ending
  if (S.round >= S.maxRounds || checkEarlyEnding()) {
    S.stage = 'results';
  }
  
  render();
}

function checkEarlyEnding() {
  if (S.starvedRounds >= 3) return true;
  if (S.pop < 40) return true;
  if (S.happiness <= 20) return true;
  return false;
}

function simulateSeason() {
  // Auto-produce and auto-trade
  const availableGoods = Object.entries(S.inventory)
    .filter(([id, qty]) => qty > 0 && id !== 'iron')
    .sort((a, b) => b[1] - a[1]);
  
  if (availableGoods.length > 0) {
    const cities = CITIES.filter(c => c.id !== 'tiber');
    let bestDeal = {city: null, revenue: 0, goods: []};
    
    cities.forEach(city => {
      let revenue = 0;
      let goods = [];
      
      availableGoods.slice(0, 3).forEach(([gid, qty]) => {
        const sellQty = Math.min(qty, 5);
        const price = priceFor(gid, city.id) * sellQty;
        revenue += price;
        goods.push({gid, qty: sellQty});
      });
      
      if (revenue > bestDeal.revenue) {
        bestDeal = {city, revenue, goods};
      }
    });
    
    if (bestDeal.city) {
      let totalRevenue = 0;
      bestDeal.goods.forEach(({gid, qty}) => {
        const price = priceFor(gid, bestDeal.city.id);
        totalRevenue += price * qty;
        S.inventory[gid] -= qty;
      });
      
      const risk = riskFor(bestDeal.city.id);
      const success = Math.random() > risk;
      
      if (success) {
        let finalRevenue = totalRevenue;
        if (S.mods && S.mods.sellMul) finalRevenue *= S.mods.sellMul;
        if (S.techs.market) finalRevenue *= 1.05;
        if (S.techs.senate) finalRevenue *= 1.01;
        
        const tariff = bestDeal.city.tariff * (S.mods && S.mods.tariffMul ? S.mods.tariffMul : 1) * (S.proc_perk_tariff ? S.proc_perk_tariff : 1);
        finalRevenue = Math.floor(finalRevenue * (1 - tariff));
        
        S.denarii += finalRevenue;
        S.reputation += 3;
        S.favor += Math.floor(finalRevenue / 500);
      }
    }
  }
  
  endSeason();
}

function priceFor(gid, cid) {
  const good = GOODS.find(g=>g.id===gid);
  const base = good.base;
  const idx = S.priceIndex[gid]/100;
  const city = CITIES.find(c=>c.id===cid);
  const bias = city.bias[gid]||0;
  
  let price = base * idx + bias;
  if (S.techs.market) price += 5;
  
  return Math.max(10, Math.round(price));
}

function riskFor(cid) {
  const city = CITIES.find(c=>c.id===cid);
  let risk = city.risk;
  risk += city.distance * 0.01;
  if (S.techs.roads) risk *= 0.85;
  if (S.techs.walls) risk *= 0.9;
  risk -= S.forts * 0.005;
  if (S.eventModifiers.riskMul) risk *= S.eventModifiers.riskMul;
  if (S.mods && S.mods.riskMul) risk *= S.mods.riskMul;
  return clamp(risk, 0.01, 0.5);
}

/* ==================== INFINITE MODE GENERATION ==================== */

function generateNewTerritory() {
  const rarity = rollRarity();
  
  const newId = 'generated_' + S.nextTerritoryId;
  S.nextTerritoryId++;
  
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 
                         'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
  const latinBaseName = generateLatinName('territory');
  const numeralIndex = Math.floor((S.nextTerritoryId - 1000) / 10);
  const numeral = romanNumerals[numeralIndex % 20];
  const latinName = latinBaseName + ' ' + numeral;
  const name = latinName; // Use Latin name as the main name!
  
  const difficultyFactor = Math.floor(S.territories.length / 8);
  const baseStrength = 40 + (S.territories.length * 8) + (difficultyFactor * 15);
  const strength = Math.floor(baseStrength + Math.random() * 30);
  const value = Math.floor((200 + strength * 2.5 + difficultyFactor * 50) * rarity.bonus);
  
  const resources = ['grain', 'livestock', 'timber', 'clay', 'salt', 'wool', 'iron', 'wine'];
  const produces = {};
  const numResources = Math.min(2 + Math.floor(Math.random() * 3) + Math.floor(difficultyFactor / 2), 5);
  const selectedResources = [];
  for (let i = 0; i < numResources; i++) {
    let resource = rpick(resources);
    let attempts = 0;
    while (selectedResources.includes(resource) && attempts < 10) {
      resource = rpick(resources);
      attempts++;
    }
    if (!selectedResources.includes(resource)) {
      selectedResources.push(resource);
      const baseAmount = 1 + Math.random() * 3 + (difficultyFactor * 0.5);
      produces[resource] = Math.floor(baseAmount * rarity.bonus);
    }
  }
  
  let status = 'hostile';
  if (strength < 50) status = 'contested';
  
  const newTerritory = {
    id: newId,
    latinName: latinName,
    name: name,
    status: status,
    str: strength,
    value: value,
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Italia_Antica.jpg/320px-Italia_Antica.jpg',
    produces: produces,
    desc: `A ${strength > 100 ? 'formidable' : 'promising'} territory discovered through expansion`,
    req: Math.max(0, S.territories.length - 5),
    rarity: rarity
  };
  
  TERRITORIES.push(newTerritory);
  
  const territoriesPerTab = 12;
  const newTabIndex = Math.floor((TERRITORIES.length - 1) / territoriesPerTab);
  if (newTabIndex > S.mapTab) {
    S.mapTab = newTabIndex;
  }
}

function generateNewProductionBuilding() {
  const resources = ['grain', 'livestock', 'timber', 'clay', 'salt', 'wool', 'iron', 'wine'];
  const resource = rpick(resources);
  const good = GOODS.find(g => g.id === resource);
  
  const rarity = rollRarity();
  
  const buildingEmojis = ['🏭', '⚙️', '🔨', '👷', '🏛️', '⚒️', '🏗️', '🏘️'];
  const emoji = rpick(buildingEmojis);
  
  const latinName = generateLatinName('building');
  const name = `${latinName} (${good.name})`;
  
  const baseCost = 150 + (PRODUCTION_BUILDINGS.length * 30);
  const cost = Math.floor(baseCost + Math.random() * 100);
  
  const baseRate = 2 + Math.random() * 3;
  const rate = Math.floor(baseRate * rarity.bonus);
  
  const newBuilding = {
    id: 'gen_building_' + PRODUCTION_BUILDINGS.length,
    latinName: latinName,
    name: name,
    emoji: emoji,
    cost: cost,
    produces: resource,
    rate: rate,
    desc: `Advanced facility producing ${rate} ${resource} per season`,
    rarity: rarity
  };
  
  PRODUCTION_BUILDINGS.push(newBuilding);
}

function generateNewTechnology() {
  const techTypes = [
    'Advanced Logistics', 'Imperial Roads', 'Master Craftsmanship',
    'Elite Training', 'Divine Favor', 'Market Dominance',
    'Military Innovation', 'Agricultural Revolution', 'Trade Networks',
    'Cultural Heritage', 'Engineering Mastery', 'Diplomatic Relations'
  ];
  
  const effects = ['economy', 'military', 'farming', 'mining', 'population', 'trade'];
  const baseCost = 400 + (TECHNOLOGIES.length * 50);
  const cost = Math.floor(baseCost + Math.random() * 200);
  
  const newTech = {
    id: 'gen_tech_' + TECHNOLOGIES.length,
    name: rpick(techTypes) + ' ' + (TECHNOLOGIES.length - 9),
    cost: cost,
    req: {denarii: Math.floor(cost * 0.8), territories: Math.floor(TECHNOLOGIES.length / 3)},
    effect: rpick(effects),
    desc: `Advanced technology providing strategic bonuses`,
    unlocked: false
  };
  
  TECHNOLOGIES.push(newTech);
}

function generateNewCity() {
  const cityNames = [
    'Distant Market', 'Far Trading Post', 'Remote Harbor', 'Frontier Settlement',
    'Border Town', 'Merchant Outpost', 'Trade Hub', 'Commercial Center',
    'Coastal Port', 'Mountain Village', 'River City', 'Forest Settlement'
  ];
  
  const newCity = {
    id: 'gen_city_' + CITIES.length,
    name: rpick(cityNames) + ' ' + (CITIES.length - 5),
    tariff: 0.03 + Math.random() * 0.05,
    risk: 0.05 + Math.random() * 0.06,
    distance: 2 + Math.floor(Math.random() * 4),
    bias: Object.fromEntries(GOODS.map(g => [g.id, Math.floor((Math.random() - 0.5) * 12)])),
    specialty: rpick(GOODS).id,
    relation: Math.floor((Math.random() - 0.5) * 10)
  };
  
  CITIES.push(newCity);
}

/* ==================== RENDER ==================== */

function render() {
  try{ if (window.CapSystem) CapSystem.computeCaps(); }catch(e){} if (S.battleActive) {
    renderBattleScreen();
    return;
  }
  
  if (S.stage === 'intro') renderIntro();
  else if (S.stage === 'game') renderGame();
  else if (S.stage === 'results') renderResults();
}

function renderIntro() {
  const card = el('div', {class:'card'});
  card.append(
    el('h2', {}, 'Choose Your Founder'),
    el('div', {class:'info', style:'margin-bottom:12px'},
      el('b', {}, '💡 Complete Edition Features:'),
      el('div', {class:'tiny', style:'margin-top:6px;line-height:1.6'},
        '• Resource Production: Build farms, fisheries, mines to generate goods automatically',
        el('br'),
        '• Map & Territories: Conquer 12 territories with RARITY SYSTEM and LATIN NAMES!',
        el('br'),
        '• Simulate Button: Auto-trade and fast-forward seasons',
        el('br'),
        '• Enhanced Economy: Passive income from production and territories',
        el('br'),
        '• Enemy Raids: Defend Rome from raiders every 5 seasons',
        el('br'),
        '• Save/Load: Save your progress anytime during gameplay!',
        el('br'),
        '• ✨ NEW: Rarity system for territories/buildings (Common to IMPERIAL!)',
        el('br'),
        '• 🏛️ NEW: All content now has authentic Latin names!'
      )
    ),
    el('div', {class:'grid g2'})
  );
  
  const grid = card.querySelector('.g2');
  
  // Show normal founders
  ['romulus', 'remus'].forEach(founderId => {
    const f = FOUNDERS[founderId];
    const box = el('div', {class:'choice'});
    box.append(
      el('div', {style:'font-size:32px;text-align:center;margin-bottom:8px'}, f.icon),
      el('h3', {}, f.name),
      el('div', {class:'small', style:'margin:8px 0'}, f.desc),
      el('button', {class:'btn btn-primary', onClick:()=>startGame(f)}, 'Select ' + f.name)
    );
    grid.append(box);
  });
  
  // Show Mr. Kitchen if unlocked
  if (S.wolfClicks >= 5) {
    const f = FOUNDERS.kitchen;
    const box = el('div', {class:'choice', style:'outline:3px solid gold;background:linear-gradient(135deg,#fef3c7,#fde68a);animation:imperial-glow 2s ease-in-out infinite'});
    box.append(
      el('div', {style:'font-size:32px;text-align:center;margin-bottom:8px'}, f.icon),
      el('h3', {style:'color:#dc2626'}, f.name + ' ⭐⭐⭐'),
      el('div', {class:'small', style:'margin:8px 0;font-weight:900;color:#b45309'}, f.desc),
      el('div', {class:'tiny', style:'color:#dc2626;margin:4px 0;font-weight:900'}, 'SECRET CHARACTER UNLOCKED! SUPER OVERPOWERED!'),
      el('div', {class:'tiny', style:'color:#7a1f1f;margin:4px 0'}, '999x multipliers on EVERYTHING! Instant win mode!'),
      el('button', {class:'btn btn-primary', style:'background:linear-gradient(90deg,#dc2626,#ea580c,#eab308);border:none;font-weight:900', onClick:()=>startGame(f)}, '🔥 SELECT MR. KITCHEN 🔥')
    );
    grid.append(box);
  }
  
  app.textContent = '';
  app.append(card);
}

function startGame(founder) {
  S.stage = 'game';
  S.founder = founder.id;
  S.mods = founder.mods;
  S.name = founder.name;
  
  // Mr. Kitchen gets TRULY OVERPOWERED stats!
  if (founder.id === 'kitchen') {
    S.denarii = 999999999;
    S.favor = 999999;
    S.reputation = 999999;
    S.troops = 999999;
    S.morale = 100;
    S.supplies = 999999;
    S.pop = 999999;
    S.housing = 999999;
    S.sanitation = 100;
    S.forts = 9999;
    S.happiness = 100;
    S.food = 999999;
    S.capacity = 999999;
    S.maxFood = 999999;
    S.maxSanitation = 100;
  }
  
  recalcHappiness();
  render();
}

function renderGame() {
  const root = el('div');
  
  // Save/Load buttons
  const saveLoadBtns = el('div', {class:'save-load-btn'},
    el('button', {class:'btn', style:'background:#2563eb;color:#fff;font-size:12px;padding:8px 12px', onClick:saveGame}, '💾 Save'),
    el('button', {class:'btn', style:'background:#16a34a;color:#fff;font-size:12px;padding:8px 12px', onClick:loadGame}, '📁 Load'),
    el('button', {class:'btn', style:'background:#dc2626;color:#fff;font-size:12px;padding:8px 12px', onClick:deleteSave}, '🗑️ Delete')
  );
  document.body.appendChild(saveLoadBtns);
  
  // Status card
  const currentSeason = SEASONS[S.seasonIndex];
  const statusCard = el('div', {class:'card'});
  statusCard.append(
    el('div', {style:'display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:12px'},
      el('div', {},
        el('h2', {style:'margin:0 0 4px 0'}, `Season ${S.round}/${S.infiniteMode ? '∞' : S.maxRounds} — ${S.name}`),
        el('div', {class:'season-indicator'},
          currentSeason.icon + ' ',
          currentSeason.name,
          el('span', {class:'tiny', style:'margin-left:8px'}, currentSeason.desc)
        )
      ),
      el('button', {
        class:'btn',
        style:'background:#16a34a;color:#fff',
        onClick: simulateSeason
      }, '⏭️ Simulate Season')
    ),
    el('div', {class:'grid g5'},
      statPill('💰', 'Denarii', S.denarii, 'gold'),
      statPill('👥', 'Population', S.pop, S.pop > S.housing ? 'warning' : 'normal'),
      statPill('😊', 'Happiness', Math.round(S.happiness) + '%', S.happiness < 40 ? 'warning' : 'success'),
      statPill('⚔️', 'Troops', S.troops, 'normal'),
      statPill('🌾', 'Food', Math.floor(S.food), S.food < S.pop ? 'warning' : 'normal')
    )
  );
  root.append(statusCard);
  
  // Focus tabs - ENHANCED with new tabs
  const tabs = el('div', {class:'tabs'});
  ['resources', 'map', 'trade', 'military', 'settlement', 'tech', 'achievements', 'quests'].forEach(f => {
    tabs.append(
      el('div', {
        class: 'tab' + (S.focus === f ? ' active' : ''),
        onClick: () => { S.focus = f; render(); }
      }, capitalize(f))
    );
  });
  root.append(tabs);
  
  // Focus content
  const focusCard = el('div', {class:'card'});
  if (S.focus === 'resources') renderResourcesFocus(focusCard);
  else if (S.focus === 'map') renderMapFocus(focusCard);
  else if (S.focus === 'trade') renderTradeFocus(focusCard);
  else if (S.focus === 'military') renderMilitaryFocus(focusCard);
  else if (S.focus === 'settlement') renderSettlementFocus(focusCard);
  else if (S.focus === 'tech') renderTechnologies(focusCard);
  else if (S.focus === 'achievements') renderAchievements(focusCard);
  else if (S.focus === 'quests') renderQuests(focusCard);
  root.append(focusCard);
  
  app.textContent = '';
  app.append(root);
}

function renderResourcesFocus(root) {
  root.append(
    el('h2', {}, '🏭 Production Buildings'),
    el('div', {class:'info'},
      'Build facilities to automatically produce resources each season. Rarity affects production rate!'
    )
  );
  
  // Show economy summary
  const consumption = calcFoodConsumption();
  const estimatedUpkeep = S.productionBuildings.length * 8 + S.troops * 3 + Math.floor(S.housing / 10) + S.forts * 5 + Math.floor(S.sanitation / 5);
  const estimatedTaxes = Math.floor(S.pop * 0.6 + (S.happiness > 70 ? S.pop * 0.2 : 0));
  const netIncome = estimatedTaxes - estimatedUpkeep;
  
  root.append(
    el('div', {class:'info', style:'background:#fef3c7;border-color:#fbbf24;margin:12px 0'},
      el('b', {}, '📊 Economy Status:'),
      el('br'),
      el('div', {style:'margin-top:4px'}, 
        `Food: ${Math.floor(S.food)} | Consumption: ${consumption}/season`
      ),
      el('div', {style:'margin-top:4px'}, 
        `Inventory: Grain:${S.inventory.grain||0} Livestock:${S.inventory.livestock||0}`
      ),
      el('div', {style:'margin-top:4px;padding-top:4px;border-top:1px solid #fbbf24'}, 
        `Income: ${estimatedTaxes}d/season (taxes) | Upkeep: ${estimatedUpkeep}d/season`
      ),
      el('div', {style:'margin-top:4px;font-weight:700', html: netIncome >= 0 ? 
        `<span style="color:#16a34a">Net: +${netIncome}d/season ✓</span>` : 
        `<span style="color:#dc2626">Net: ${netIncome}d/season ⚠️</span>`
      }),
      el('div', {style:'margin-top:4px;font-size:11px;color:#7a3b00'}, 
        'Grain/livestock auto-feed your people when food runs low. Buildings cost 8d/season upkeep!'
      )
    )
  );
  
  const buildGrid = el('div', {class:'grid g3'});
  PRODUCTION_BUILDINGS.forEach(building => {
    const inflationMult = getInflationMultiplier();
    const adjustedCost = Math.floor(building.cost * inflationMult);
    const canAfford = S.denarii >= adjustedCost;
    const rarityText = building.rarity ? ` [${building.rarity.name}]` : '';
    
    const box = el('div', {class:'choice', style: !canAfford ? 'opacity:0.6' : ''});
    box.append(
      el('div', {style:'font-size:24px;text-align:center;margin-bottom:8px'}, building.emoji),
      el('div', {style:'font-weight:800;margin-bottom:4px'}, building.name + rarityText),
      building.latinName ? el('div', {class:'tiny', style:'font-style:italic;color:#7a3b00;margin-bottom:4px'}, building.latinName) : '',
      el('div', {class:'small', style:'margin:4px 0'}, building.desc),
      el('div', {class:'small', style:'margin:4px 0'}, `Cost: ${adjustedCost} denarii${inflationMult > 1 ? ` (${Math.round((inflationMult-1)*100)}% inflation)` : ''}`),
      el('div', {class:'small', style:'margin:4px 0;color:#16a34a;font-weight:700'}, `Produces: ${building.rate} ${building.produces}/season`),
      el('div', {class:'tiny', style:'margin:4px 0;color:#dc2626'}, 'Upkeep: 8d/season'),
      el('button', {
        class:'btn btn-primary',
        style:'margin-top:10px;width:100%',
        disabled: !canAfford,
        onClick: !canAfford ? null : () => {
          if (S.denarii < adjustedCost) return alert('Not enough denarii');
          S.denarii -= adjustedCost;
          S.productionBuildings.push({type: building.id, level: 1});
          alert(`Built ${building.name}! Will produce ${building.rate} ${building.produces} per season.\n\nUpkeep: 8 denarii/season`);
          render();
        }
      }, canAfford ? 'Build' : 'Build (locked)')
    );
    buildGrid.append(box);
  });
  root.append(buildGrid);
  
  // Show owned buildings
  if (S.productionBuildings.length > 0) {
    root.append(
      el('h3', {style:'margin-top:16px'}, '📦 Your Buildings'),
      el('div', {class:'grid g4'},
        ...S.productionBuildings.map(b => {
          const building = PRODUCTION_BUILDINGS.find(pb => pb.id === b.type);
          const rarityBadge = building && building.rarity ? getRarityBadge(building.rarity) : '';
          const latinText = building && building.latinName ? building.latinName : '';
          return el('div', {class:'choice'},
            el('div', {style:'font-size:24px;text-align:center'}, building.emoji),
            el('div', {class:'small', style:'font-weight:700;text-align:center', html:building.name + rarityBadge}),
            latinText ? el('div', {class:'tiny', style:'color:#7a3b00;font-style:italic;text-align:center'}, latinText) : '',
            el('div', {class:'tiny', style:'text-align:center;color:#16a34a'}, `+${building.rate} ${building.produces}/season`)
          );
        })
      )
    );
  }
  
  // Resource Combinations section
  root.append(
    el('div', {class:'divider', style:'margin:24px 0'}),
    el('h2', {}, '⚙️ Resource Combinations'),
    el('div', {class:'info'}, 'Combine resources for powerful bonuses!')
  );
  
  const comboGrid = el('div', {class:'grid g2'});
  RESOURCE_COMBOS.forEach(combo => {
    const canAfford = canAffordCombo(combo);
    const card = el('div', {class:'combo-card', style: canAfford ? '' : 'opacity:0.6'});
    
    const costDisplay = el('div', {class:'combo-cost'});
    Object.entries(combo.cost).forEach(([resource, amount]) => {
      const have = S.inventory[resource] || 0;
      const good = GOODS.find(g => g.id === resource);
      costDisplay.append(
        el('div', {class:'combo-cost-item', style: have >= amount ? 'background:#dcfce7' : 'background:#fee2e2'},
          `${good.emoji} ${amount} (have: ${have})`
        )
      );
    });
    
    card.append(
      el('div', {style:'font-weight:900;margin-bottom:6px'}, `${combo.icon} ${combo.name}`),
      el('div', {class:'small', style:'margin-bottom:8px'}, combo.desc),
      costDisplay,
      el('button', {
        class:'btn btn-primary',
        style:'margin-top:10px;width:100%',
        disabled: !canAfford,
        onClick: canAfford ? () => {
          if (useResourceCombo(combo)) render();
        } : null
      }, canAfford ? 'Use Combination' : 'Need Resources')
    );
    comboGrid.append(card);
  });
  root.append(comboGrid);
}

function renderMapFocus(root) {
  root.append(
    el('h2', {}, '🗺️ Territory Map'),
    el('div', {class:'info'},
      'Conquer territories for resources and glory! Each territory has a RARITY and LATIN NAME!'
    )
  );
  
  const mapContainer = el('div', {class:'map-container'});
  
  // Map tabs (pagination)
  const territoriesPerTab = 12;
  const numTabs = Math.ceil(TERRITORIES.length / territoriesPerTab);
  
  if (numTabs > 1) {
    const mapTabs = el('div', {class:'map-tabs'});
    for (let i = 0; i < numTabs; i++) {
      mapTabs.append(
        el('div', {
          class: 'tab' + (S.mapTab === i ? ' active' : ''),
          onClick: () => { S.mapTab = i; render(); }
        }, `Region ${i + 1}`)
      );
    }
    mapContainer.append(mapTabs);
  }
  
  const startIdx = S.mapTab * territoriesPerTab;
  const endIdx = Math.min(startIdx + territoriesPerTab, TERRITORIES.length);
  const territoriesToShow = TERRITORIES.slice(startIdx, endIdx);
  
  const mapGrid = el('div', {class:'map-grid'});
  
  territoriesToShow.forEach(territory => {
    const owned = S.territories.includes(territory.id);
    const canConquer = !owned && territory.status !== 'owned';
    const locked = territory.req && S.territories.length < territory.req;
    
    let bgClass = '';
    if (owned) bgClass = 'owned';
    else if (locked) bgClass = 'locked';
    else if (territory.status === 'contested') bgClass = 'contested';
    else if (territory.str >= 80) bgClass = 'hostile-hard';
    else bgClass = 'hostile';
    
    const territoryDiv = el('div', {
      class: `territory ${bgClass}`,
      onClick: () => {
        if (locked) {
          alert(`🔒 Locked!\nRequires ${territory.req} territories to unlock.`);
        } else if (canConquer) {
          const odds = calculateConquestOdds(territory);
          const rarityText = territory.rarity ? ` [${territory.rarity.name} rarity]` : '';
          const latinText = territory.latinName ? `\n(${territory.latinName})` : '';
          if (confirm(`⚔️ Attack ${territory.name}?${latinText}${rarityText}\n\nEnemy Strength: ${territory.str}\nYour Strength: ${Math.floor(odds.ourStr)}\nWin Chance: ${Math.floor(odds.winProb * 100)}%\n\nProceed with conquest?`)) {
            conquestTerritory(territory);
          }
        }
      }
    });
    
    const rarityHTML = territory.rarity ? getRarityBadge(territory.rarity) : '';
    const nameDisplay = territory.name + rarityHTML;
    const latinDisplay = territory.latinName ? `<div class="tiny" style="font-style:italic;color:#7a3b00">${territory.latinName}</div>` : '';
    
    territoryDiv.append(
      el('div', {style:'font-weight:800;font-size:12px;margin-bottom:4px', html:nameDisplay}),
      latinDisplay ? el('div', {html:latinDisplay}) : '',
      el('div', {class:'tiny', style:'font-size:10px;line-height:1.3'}, territory.desc)
    );
    
    if (!owned && !locked) {
      territoryDiv.append(
        el('div', {class:'tiny', style:'margin-top:6px;font-weight:700'}, 
          `⚔️ ${territory.str}`
        ),
        el('div', {class:'tiny', style:'font-size:10px'}, 
          `💰 ${fmt(territory.value)}d`
        )
      );
    }
    
    if (owned && territory.produces) {
      const productionText = Object.entries(territory.produces)
        .map(([r, a]) => {
          const g = GOODS.find(go => go.id === r);
          return `${(g && g.emoji) || ''} ${a}`;
        }).join(' ');
      territoryDiv.append(
        el('div', {class:'tiny', style:'margin-top:6px;color:#15803d;font-weight:700;font-size:11px'}, 
          '✓ ' + productionText
        )
      );
    }
    
    mapGrid.append(territoryDiv);
  });
  
  mapContainer.append(
    el('h3', {}, `Controlled: ${S.territories.length}/${TERRITORIES.length} territories | Viewing: ${startIdx + 1}-${endIdx}`),
    mapGrid
  );
  
  root.append(mapContainer);
}

function renderTradeFocus(root) {
  root.append(
    el('h2', {}, '💼 Quick Trade'),
    el('div', {class:'info'},
      'Sell your inventory to cities for profit. Each city pays different prices based on their specialty.'
    )
  );
  
  const inv = Object.entries(S.inventory).filter(([k,v]) => v > 0);
  if (inv.length === 0) {
    root.append(
      el('div', {class:'info', style:'background:#fef2f2;border-color:#fca5a5'},
        '⚠️ No goods in inventory. Build production facilities or wait for season production.'
      )
    );
    return;
  }
  
  const sellGrid = el('div', {class:'grid g3'});
  CITIES.forEach(city => {
    const box = el('div', {class:'choice'});
    
    box.append(
      el('h3', {style:'margin:4px 0'}, city.name),
      el('div', {class:'tiny'}, `Specialty: ${capitalize(city.specialty)} | Risk: ${Math.round(riskFor(city.id)*100)}%`)
    );
    
    const prices = inv.slice(0, 3).map(([gid, qty]) => {
      const good = GOODS.find(g => g.id === gid);
      const price = priceFor(gid, city.id);
      return el('div', {class:'tiny'}, `${good.emoji} ${good.name}: ${price}d ea.`);
    });
    
    box.append(...prices);
    
    const btn = el('button', {
      class:'btn btn-primary',
      style:'margin-top:8px;width:100%',
      onClick: () => quickTrade(city)
    }, 'Sell Here');
    
    box.append(btn);
    sellGrid.append(box);
  });
  
  root.append(sellGrid);
}

function quickTrade(city) {
  const inv = Object.entries(S.inventory).filter(([k,v]) => v > 0);
  if (inv.length === 0) return alert('No goods to sell');
  
  let totalRevenue = 0;
  inv.slice(0, 4).forEach(([gid, qty]) => {
    const sellQty = Math.min(qty, 5);
    const price = priceFor(gid, city.id);
    totalRevenue += price * sellQty;
    S.inventory[gid] -= sellQty;
  });
  
  const risk = riskFor(city.id);
  const success = Math.random() > risk;
  
  if (success) {
    let finalRevenue = totalRevenue;
    if (S.mods && S.mods.sellMul) finalRevenue *= S.mods.sellMul;
    if (S.techs.market) finalRevenue *= 1.05;
    if (S.techs.senate) finalRevenue *= 1.01;
    
    const tariff = city.tariff * (S.mods && S.mods.tariffMul ? S.mods.tariffMul : 1);
    finalRevenue = Math.floor(finalRevenue * (1 - tariff));
    
    S.denarii += finalRevenue;
    S.reputation += 4;
    S.favor += Math.floor(finalRevenue / 400);
    
    alert(`✓ Trade successful! Earned ${fmt(finalRevenue)} denarii`);
  } else {
    alert(`✗ Trade caravan raided! Goods lost.`);
    S.happiness = Math.max(0, S.happiness - 5);
  }
  
  S.history.push({
    round: S.round + 1,
    kind: 'Trade',
    action: city.name,
    note: success ? `Sold for ${fmt(totalRevenue)}d` : 'Raided'
  });
  
  endSeason();
}

function renderMilitaryFocus(root) {
  root.append(
    el('h2', {}, '⚔️ Military'),
    el('div', {class:'info'},
      `Troops: ${S.troops} | Morale: ${Math.round(S.morale)}% | Supplies: ${S.supplies}`
    )
  );
  
  root.append(
    el('div', {class:'grid g3'},
      // Drill
      (() => {
        const disabled = S.food < 10;
        const box = el('div', {class:'choice', style: disabled ? 'opacity:0.6' : ''});
        box.append(
          el('div', {style:'font-weight:800;margin-bottom:6px'}, '🛡️ Drill'),
          el('div', {class:'small', style:'margin:3px 0'}, 'Train your troops to boost morale'),
          el('div', {class:'small', style:'margin:3px 0'}, '+10-15 morale'),
          el('div', {class:'small', style:'margin:3px 0'}, 'Cost: 10 food'),
          el('button', {
            class:'btn btn-primary',
            style:'margin-top:10px;width:100%',
            disabled: disabled,
            onClick: disabled ? null : () => {
              if (S.food < 10) return alert('Need 10 food');
              const delta = 10 + Math.floor(Math.random() * 6);
              S.food -= 10;
              S.morale = clamp(S.morale + delta, 0, 100);
              alert(`Morale increased by ${delta}%!`);
              render();
            }
          }, 'Drill' + (disabled ? ' (locked)' : ''))
        );
        return box;
      })(),
      // Recruit
      (() => {
        const inflationMult = getInflationMultiplier();
        let baseCost = 140;
        if (S.mods && S.mods.recruitCost) baseCost = Math.floor(baseCost * S.mods.recruitCost);
        const cost = Math.floor(baseCost * inflationMult);
        const disabled = S.denarii < cost || S.food < 8;
        const box = el('div', {class:'choice', style: disabled ? 'opacity:0.6' : ''});
        box.append(
          el('div', {style:'font-weight:800;margin-bottom:6px'}, '🧑🌾 Recruit'),
          el('div', {class:'small', style:'margin:3px 0'}, 'Recruit new soldiers to your army'),
          el('div', {class:'small', style:'margin:3px 0'}, '+12-18 troops'),
          el('div', {class:'small', style:'margin:3px 0'}, `Cost: ${cost} denarii, 8 food`),
          el('button', {
            class:'btn btn-primary',
            style:'margin-top:10px;width:100%',
            disabled: disabled,
            onClick: disabled ? null : () => {
              if (S.denarii < cost || S.food < 8) return alert(`Need ${cost}d and 8 food`);
              S.denarii -= cost;
              S.food -= 8;
              const recruited = 12 + Math.floor(Math.random() * 7);
              S.troops += recruited;
              alert(`Recruited ${recruited} new troops!`);
              render();
            }
          }, 'Recruit' + (disabled ? ' (locked)' : ''))
        );
        return box;
      })(),
      // Forge
      (() => {
        const disabled = S.denarii < 140;
        const box = el('div', {class:'choice', style: disabled ? 'opacity:0.6' : ''});
        box.append(
          el('div', {style:'font-weight:800;margin-bottom:6px'}, '⚒️ Forge'),
          el('div', {class:'small', style:'margin:3px 0'}, 'Forge equipment and supplies'),
          el('div', {class:'small', style:'margin:3px 0'}, '+20 supplies'),
          el('div', {class:'small', style:'margin:3px 0'}, 'Cost: 140 denarii'),
          el('button', {
            class:'btn btn-primary',
            style:'margin-top:10px;width:100%',
            disabled: disabled,
            onClick: disabled ? null : () => {
              let cost = S.techs.forge ? 110 : 140;
              if (S.mods && S.mods.buildCost) cost = Math.floor(cost * S.mods.buildCost);
              if (S.denarii < cost) return alert(`Need ${cost}d`);
              S.denarii -= cost;
              S.supplies = Math.min(300, S.supplies + 20);
              alert(`Forged +20 supplies!`);
              render();
            }
          }, 'Forge' + (disabled ? ' (locked)' : ''))
        );
        return box;
      })()
    )
  );
}

function renderSettlementFocus(root) {
  root.append(
    el('h2', {}, '🏘️ Settlement'),
    el('div', {class:'info'},
      `Population: ${S.pop} | Housing: ${S.housing} | Sanitation: ${Math.round(S.sanitation)}%`
    )
  );
  
  root.append(
    el('div', {class:'grid g3'},
      // Housing
      (() => {
        const disabled = S.denarii < 170;
        const box = el('div', {class:'choice', style: disabled ? 'opacity:0.6' : ''});
        box.append(
          el('div', {style:'font-weight:800;margin-bottom:6px'}, '🏚️ Housing'),
          el('div', {class:'small', style:'margin:3px 0'}, 'Build housing for your people'),
          el('div', {class:'small', style:'margin:3px 0'}, '+35 housing capacity'),
          el('div', {class:'small', style:'margin:3px 0'}, 'Cost: 170 denarii'),
          el('button', {
            class:'btn btn-primary',
            style:'margin-top:10px;width:100%',
            disabled: disabled,
            onClick: disabled ? null : () => {
              let cost = 170;
              if (S.mods && S.mods.buildCost) cost = Math.floor(cost * S.mods.buildCost);
              if (S.denarii < cost) return alert(`Need ${cost}d`);
              S.denarii -= cost;
              S.housing = Math.min(10000, S.housing + 35);
              recalcHappiness();
              alert('Built housing for +35 capacity!');
              render();
            }
          }, 'Build' + (disabled ? ' (locked)' : ''))
        );
        return box;
      })(),
      // Sanitation
    // Warehouse (Inventory Capacity)
    (() => {
      const disabled = S.denarii < 130;
      const box = el('div', {class:'choice', style: disabled ? 'opacity:0.6' : ''});
      box.append(
        el('div', {style:'font-weight:600;margin-bottom:6px'}, '📦 Warehouse'),
        el('div', {class:'small', style:'margin:3px 0'}, 'Expand storage capacity across your realm'),
        el('div', {class:'small', style:'margin:3px 0'}, '+40 capacity (scaled by regions)'),
        el('div', {class:'small', style:'margin:3px 0'}, 'Cost: 130 denarii'),
        el('button', {
          class:'btn btn-primary',
          style:'margin-top:10px;width:100%',
          disabled: disabled,
          onClick: disabled ? null : () => {
            let cost = 130;
            if (S.mods && S.mods.buildCost) cost = Math.floor(cost * S.mods.buildCost);
            if (S.denarii < cost) return alert(`Need ${cost}d`);
            S.denarii -= cost;
            S.buildingCounts = S.buildingCounts || {};
            S.buildingCounts.warehouse = (S.buildingCounts.warehouse||0) + 1;
            if (window.CapSystem) CapSystem.computeCaps();
            alert('Built Warehouse (+40 base capacity, scaled by regions)');
            render();
          }
        }, 'Build' + (disabled ? ' (locked)' : ''))
      );
      return box;
    })(),
    
      (() => {
        const disabled = S.denarii < 95;
        const box = el('div', {class:'choice', style: disabled ? 'opacity:0.6' : ''});
        box.append(
          el('div', {style:'font-weight:800;margin-bottom:6px'}, '🚽 Sanitation'),
          el('div', {class:'small', style:'margin:3px 0'}, 'Improve sanitation and health'),
          el('div', {class:'small', style:'margin:3px 0'}, '+12 sanitation'),
          el('div', {class:'small', style:'margin:3px 0'}, 'Cost: 95 denarii'),
          el('button', {
            class:'btn btn-primary',
            style:'margin-top:10px;width:100%',
            disabled: disabled,
            onClick: disabled ? null : () => {
              let cost = 95;
              if (S.mods && S.mods.buildCost) cost = Math.floor(cost * S.mods.buildCost);
              if (S.denarii < cost) return alert(`Need ${cost}d`);
              const cap = (window.CapSystem ? CapSystem.getCap('sanitation') : (S.maxSanitation||100));
              if (S.sanitation >= cap) return alert('Max reached');
              S.denarii -= cost;
              S.buildingCounts = S.buildingCounts || {}; S.buildingCounts.bath = (S.buildingCounts.bath||0)+1;
              const gain = Math.max(1, Math.round(12 * (window.CapSystem ? CapSystem.regionScale() : 1)));
              S.sanitation = Math.min(cap, S.sanitation + gain);
              recalcHappiness();
              alert(`Improved sanitation by +${gain}%!`);
              if (window.CapSystem) CapSystem.computeCaps();
              render();
            }
          }, 'Build' + (disabled ? ' (locked)' : ''))
        );
        return box;
      })(),
      // Fort
      (() => {
        const disabled = S.denarii < 220;
        const box = el('div', {class:'choice', style: disabled ? 'opacity:0.6' : ''});
        box.append(
          el('div', {style:'font-weight:800;margin-bottom:6px'}, '🪵 Palisade'),
          el('div', {class:'small', style:'margin:3px 0'}, 'Build defensive fortifications'),
          el('div', {class:'small', style:'margin:3px 0'}, '+1 fort, +3 morale'),
          el('div', {class:'small', style:'margin:3px 0'}, 'Cost: 220 denarii'),
          el('button', {
            class:'btn btn-primary',
            style:'margin-top:10px;width:100%',
            disabled: disabled,
            onClick: disabled ? null : () => {
              let cost = 220;
              if (S.mods && S.mods.buildCost) cost = Math.floor(cost * S.mods.buildCost);
              if (S.denarii < cost) return alert(`Need ${cost}d`);
              if (S.forts >= 10000) return alert('Max forts');
              S.denarii -= cost;
              S.forts++;
              S.morale += 3;
              recalcHappiness();
              alert('Built a new fort! +3% morale');
              render();
            }
          }, 'Build' + (disabled ? ' (locked)' : ''))
        );
        return box;
      })()
    )
  );
}

function renderTechnologies(root) {
  root.append(
    el('h2', {}, '🔬 Technologies'),
    el('div', {class:'grid g3'},
      ...TECHNOLOGIES.map(tech => {
        const unlocked = S.techs[tech.id];
        const canUnlock = !unlocked && checkTechRequirements(tech);
        const disabled = unlocked || !canUnlock || S.denarii < tech.cost;
        
        const box = el('div', {class:'choice', style: disabled ? 'opacity:0.6' : ''});
        box.append(
          el('div', {style:'font-weight:800;margin-bottom:6px'}, tech.name + (unlocked ? ' ✓' : '')),
          el('div', {class:'small', style:'margin:4px 0'}, tech.desc),
          el('div', {class:'tiny', style:'margin:4px 0;color:#7a3b00'}, formatRequirements(tech.req)),
          el('button', {
            class:'btn btn-primary',
            style:'margin-top:10px;width:100%',
            disabled: disabled,
            onClick: disabled ? null : () => {
              if (!checkTechRequirements(tech)) return alert('Requirements not met');
              S.denarii -= tech.cost;
              S.techs[tech.id] = true;
// apply any perks associated with this tech
applyTechPerk(tech || (TECHNOLOGIES.find(t=>t.id===id)));
              if (tech.id === 'market') S.capacity += 10;
              if (tech.id === 'roads') S.capacity += 20;
              if (tech.id === 'aqueduct') S.maxSanitation = 120;
              alert(`Researched ${tech.name}!`);
              render();
            }
          }, unlocked ? 'Unlocked' : 'Research')
        );
        return box;
      })
    )
  );
}

function checkTechRequirements(tech) {
  if (S.denarii < tech.cost) return false;
  for (const [key, val] of Object.entries(tech.req)) {
    if (key === 'territories' && S.territories.length < val) return false;
    if (S[key] < val) return false;
  }
  return true;
}

function formatRequirements(req) {
  return 'Requires: ' + Object.entries(req)
    .map(([k, v]) => `${capitalize(k)}: ${v}`)
    .join(', ');
}

/* ==================== NEW RENDER FUNCTIONS ==================== */

function renderAchievements(root) {
  root.append(
    el('h2', {}, '🏆 Achievements'),
    el('div', {class:'info'}, `Unlocked: ${S.achievements.length}/${ACHIEVEMENTS.length}`)
  );
  
  const grid = el('div', {class:'grid g3'});
  ACHIEVEMENTS.forEach(ach => {
    const unlocked = S.achievements.includes(ach.id);
    const badge = el('div', {class:`achievement-badge ${unlocked ? '' : 'locked'}`});
    badge.append(
      el('span', {style:'font-size:20px'}, ach.icon),
      el('div', {},
        el('div', {style:'font-weight:900;font-size:13px'}, ach.name + (unlocked ? ' ✓' : '')),
        el('div', {class:'tiny'}, ach.desc),
        unlocked ? null : el('div', {class:'tiny', style:'color:var(--roman-gold);margin-top:4px'}, 
          'Reward: ' + Object.entries(ach.reward).map(([k,v])=>`+${v} ${k}`).join(', '))
      )
    );
    grid.append(badge);
  });
  root.append(grid);
}

function renderQuests(root) {
  root.append(
    el('h2', {}, '📜 Active Quests'),
    el('div', {class:'info'}, 'Complete quests for rewards! Quests rotate automatically.')
  );
  
  if (S.activeQuests.length === 0) {
    root.append(el('div', {style:'text-align:center;padding:40px;color:#999'}, 'No active quests. They will appear as you play!'));
    return;
  }
  
  S.activeQuests.forEach(quest => {
    const template = quest.template;
    const progress = Math.min(quest.progress, quest.target);
    const progressPct = Math.floor((progress / quest.target) * 100);
    
    const questCard = el('div', {class:'quest-card'});
    questCard.append(
      el('div', {class:'quest-header'},
        el('div', {class:'quest-title'}, `${template.icon} ${template.name}`),
        el('div', {class:'quest-progress'}, `${progress}/${quest.target}`)
      ),
      el('div', {class:'quest-desc'}, template.desc),
      el('div', {class:'progress-bar-container'},
        el('div', {class:'progress-bar-fill', style:`width:${progressPct}%`})
      ),
      el('div', {class:'quest-reward', style:'margin-top:8px'}, 
        '🎁 Reward: ' + Object.entries(template.reward).map(([k,v])=>`+${v} ${k}`).join(', '))
    );
    root.append(questCard);
  });
}

function renderResourceCombos(root) {
  root.append(
    el('h2', {}, '⚙️ Resource Combinations'),
    el('div', {class:'info'}, 'Combine resources for powerful effects!')
  );
  
  const grid = el('div', {class:'grid g2'});
  RESOURCE_COMBOS.forEach(combo => {
    const canAfford = canAffordCombo(combo);
    const card = el('div', {class:'combo-card', style: canAfford ? '' : 'opacity:0.6'});
    
    const costDisplay = el('div', {class:'combo-cost'});
    Object.entries(combo.cost).forEach(([resource, amount]) => {
      const have = S.inventory[resource] || 0;
      const good = GOODS.find(g => g.id === resource);
      costDisplay.append(
        el('div', {class:'combo-cost-item', style: have >= amount ? 'background:#dcfce7' : 'background:#fee2e2'},
          `${good.emoji} ${amount} ${good.name}`
        )
      );
    });
    
    card.append(
      el('div', {style:'font-weight:900;margin-bottom:6px'}, `${combo.icon} ${combo.name}`),
      el('div', {class:'small', style:'margin-bottom:8px'}, combo.desc),
      costDisplay,
      el('button', {
        class:'btn btn-primary',
        style:'margin-top:10px;width:100%',
        disabled: !canAfford,
        onClick: canAfford ? () => {
          if (useResourceCombo(combo)) render();
        } : null
      }, canAfford ? 'Use Combination' : 'Insufficient Resources')
    );
    grid.append(card);
  });
  root.append(grid);
}

function renderEmergencyActions(root) {
  root.append(
    el('h2', {}, '🚨 Emergency Actions'),
    el('div', {class:'info warning'}, '⚠️ Use these only in desperate situations! They have long cooldowns.')
  );
  
  const grid = el('div', {class:'grid g2'});
  EMERGENCY_ACTIONS.forEach(action => {
    const canUse = canUseEmergencyAction(action.id);
    const lastUsed = S.emergencyActionsUsed[action.id] || 0;
    const cooldownRemaining = action.cooldown - (S.round - lastUsed);
    
    const card = el('div', {class:'combo-card', style: canUse ? '' : 'opacity:0.6'});
    card.append(
      el('div', {style:'font-weight:900;margin-bottom:6px'}, `${action.icon} ${action.name}`),
      el('div', {class:'small', style:'margin-bottom:8px'}, action.desc),
      !canUse ? el('div', {class:'tiny', style:'color:#dc2626;margin-bottom:8px'}, 
        `Cooldown: ${cooldownRemaining} seasons remaining`) : null,
      action.cost ? el('div', {class:'small', style:'margin-bottom:8px'}, `Cost: ${action.cost} favor`) : null,
      el('button', {
        class:'btn',
        style:'margin-top:10px;width:100%;' + (canUse ? 'background:#dc2626;color:#fff' : ''),
        disabled: !canUse,
        onClick: canUse ? () => {
          if (confirm(`Use ${action.name}?\n\n${action.desc}\n\nThis action has a ${action.cooldown} season cooldown.`)) {
            if (useEmergencyAction(action.id)) render();
          }
        } : null
      }, canUse ? 'Use Action' : 'On Cooldown')
    );
    grid.append(card);
  });
  root.append(grid);
}

function renderResults() {
  const card = el('div', {class:'card'});
  const ending = ENDINGS.find(e => e.cond(S)) || ENDINGS[ENDINGS.length - 1];
  
  card.append(
    el('h2', {}, `Final Outcome — Season ${S.round}`),
    el('div', {class:'milestone'},
      el('h2', {style:'margin:0 0 8px 0'}, ending.title),
      el('div', {}, ending.text)
    ),
    el('h3', {}, 'Final Statistics'),
    el('div', {class:'grid g4'},
      statPill('💰', 'Denarii', S.denarii, 'gold'),
      statPill('👥', 'Population', S.pop, 'normal'),
      statPill('🗺️', 'Territories', S.territories.length, 'normal'),
      statPill('🏭', 'Buildings', S.productionBuildings.length, 'normal')
    ),
    el('div', {style:'margin-top:16px;display:flex;gap:12px;flex-wrap:wrap'},
      el('button', {
        class:'btn',
        style:'background:#2563eb;color:#fff;flex:1;min-width:150px',
        onClick:exportStats
      }, '📊 Export Stats'),
      el('button', {class:'btn btn-primary', style:'flex:1;min-width:150px', onClick:() => location.reload()}, '🔄 Play Again'),
      el('button', {
        class:'btn btn-success', 
        style:'background:#16a34a;color:#fff;flex:1;min-width:150px',
        onClick:() => {
          S.infiniteMode = true;
          S.maxRounds = 999999;
          S.stage = 'game';
          S.mapTab = 0;
          S.nextRaidRound = S.round + 5;
          alert('♾️ INFINITE MODE ACTIVATED!\n\n✨ Features:\n• New territories every 7 seasons\n• New production buildings every 10 seasons\n• New technologies every 15 seasons\n• New cities every 20 seasons\n• Enemy raids every 5 seasons\n• 2.5x price volatility\n• Harder raids as you grow\n• ALL new content has Latin names and rarity!\n\nThe empire never ends!\nGood luck, eternal founder!');
          render();
        }
      }, '♾️ Infinite Seasons')
    )
  );
  
  app.textContent = '';
  app.append(card);
}

function statPill(icon, label, value, type = 'normal') {
  const colors = {
    gold: 'background:var(--roman-gold);color:#fff',
    warning: 'background:#fef2f2;color:#991b1b;border-color:#fca5a5',
    success: 'background:#f0fdf4;color:#166534;border-color:#86efac',
    normal: ''
  };
  
  return el('div', {class:'pill', style:colors[type]},
    icon + ' ',
    el('span', {class:'small'}, label + ':'),
    ' ',
    el('b', {}, typeof value === 'number' ? fmt(value) : value)
  );
}

/* ==================== BOOT ==================== */
render();

// === Balance Patch: Warehouse Nerf (auto-applied if present) ===
setTimeout(()=>{
  try{
    if (typeof PRODUCTION_BUILDINGS !== 'undefined') {
      for (const b of PRODUCTION_BUILDINGS) {
        if (b.id === 'warehouse' || (b.name && b.name.toLowerCase() === 'warehouse')) {
          b.cost = 145;
          b.capacity = 30; // interpreted as +30 capacity
          console.log('[Patch] Warehouse cost set to 145 and capacity bonus +30');
        }
      }
    }
    if (typeof BUILDINGS !== 'undefined') {
      for (const k in BUILDINGS) {
        const b = BUILDINGS[k];
        if (b && (b.id === 'warehouse' || (b.name||'').toLowerCase()==='warehouse')) {
          b.cost = 145;
          b.capacity = 30;
          console.log('[Patch] Warehouse cost set to 145 and capacity bonus +30');
        }
      }
    }
  }catch(e){ console.warn('Warehouse patch error', e); }
}, 0);


// === Patch Hook: Handle postPenalty for expired combo effects ===
(function(){
  const _tick = window.advanceSeason || window.nextRound;
  if (!_tick) return;
  window.advanceSeason = window.nextRound = function(){
    const beforeSeason = (typeof S!=='undefined') ? JSON.stringify(S) : null;
    const rv = _tick.apply(this, arguments);
    try{
      if (S && Array.isArray(S.activeEffects)) {
        // Clean up any effects that just expired last tick and carry a postPenalty
        S.activeEffects = S.activeEffects.map(e=>{
          if (e && e.duration===0 && e.postPenalty && !e.__postApplied) {
            const p = e.postPenalty;
            const roll = (n)=> Math.floor(Math.random()*n)+1;
            const down = roll(p.penaltyRange||3);
            // Decrease grain and vineyard outputs by 1-3 for one season via temporary flags
            S.__postFeastPenalty = {rounds:1, grainDown:down, vineyardDown:down};
            e.__postApplied = true;
            console.log('[Patch] Applied post-feast penalty:', S.__postFeastPenalty);
          }
          return e;
        });
      }
      // Apply any one-season penalties to production
      if (S && S.__postFeastPenalty) {
        const pen = S.__postFeastPenalty;
        if (typeof S.productionPenalty === 'undefined') S.productionPenalty = {};
        S.productionPenalty.grain = (S.productionPenalty.grain||0) - (pen.grainDown||1);
        S.productionPenalty.vineyard = (S.productionPenalty.vineyard||0) - (pen.vineyardDown||1);
        pen.rounds -= 1;
        if (pen.rounds <= 0) delete S.__postFeastPenalty;
      }
    }catch(e){ console.warn('postPenalty hook error', e); }
    return rv;
  };
})();


// === DEV DEBUG PANEL (injected) ===
(function(){
  if (window.__devDebugInstalled__) return; window.__devDebugInstalled__ = true;

  function el(tag, attrs={}, ...kids){
    const d = document.createElement(tag);
    for (const [k,v] of Object.entries(attrs||{})) {
      if (k==='style' && typeof v==='object') Object.assign(d.style, v);
      else if (k.startsWith('on') && typeof v==='function') d.addEventListener(k.slice(2), v);
      else d.setAttribute(k, v);
    }
    for (const k of kids) d.append(k);
    return d;
  }

  // Toggle button
  const toggle = el('button', {id:'devDebugToggle', title:'Toggle Debug ( ~ )'}, '🛠️ Debug');
  const panel  = el('div', {id:'devDebugPanel'});
  const header = el('header', {}, el('h3', {}, 'Rome — Dev Tools'), el('button', {id:'devClose', onclick:()=>{panel.style.display='none';}}, '✕'));
  const tabs   = el('div', {class:'tabbar'});
  const body   = el('div', {class:'body'});
  panel.append(header, tabs, body);
  document.body.append(toggle, panel);

  const sections = {
    State(){
      const wrap = el('div', {});
      const pre = el('pre', {id:'devStateDump'}, 'Loading state...');
      const btns = el('div', {class:'grid'},
        el('button', {onclick:()=>{ if(window.S){ S.denarii+=1000; dump(); } }}, '+1000 Denarii'),
        el('button', {onclick:()=>{ if(window.S){ S.troops+=25;  dump(); } }}, '+25 Troops'),
        el('button', {onclick:()=>{ if(window.S){ S.happiness = Math.min(100, (S.happiness||0)+20); S.morale = Math.min(100, (S.morale||0)+20); dump(); } }}, '+20 Happy/Morale'),
        el('button', {onclick:()=>{ if(window.S){ S.capacity += 30; dump(); } }}, '+30 Capacity'),
        el('button', {onclick:()=>{ if(window.S){ S.food = Math.min(S.maxFood||500, (S.food||0)+100); dump(); } }}, '+100 Food'),
        el('button', {onclick:()=>{ if(window.S){ (S.activeEffects||(S.activeEffects=[])).push({id:'debug_buff', name:'Debug Buff', duration:3, tradeBuff:1.25}); dump(); } }}, 'Add Trade Buff'),
      );
      const copyBtn = el('button', {style:{marginTop:'8px'}, onclick:()=>{
        try{ navigator.clipboard.writeText(pre.textContent); }catch(e){ alert('Copy failed'); }
      }}, 'Copy JSON');
      wrap.append(btns, pre, copyBtn);

      function dump(){
        try{
          const view = (window.S) ? JSON.stringify({
            round:S.round, pop:S.pop, denarii:S.denarii, troops:S.troops, happiness:S.happiness, morale:S.morale,
            capacity:S.capacity, inventory:S.inventory, techs:S.techs, quests:S.activeQuests, effects:S.activeEffects
          }, null, 2) : 'S not initialized yet';
          pre.textContent = view;
        }catch(e){ pre.textContent = String(e); }
      }
      dump();
      return wrap;
    },
    Cheats(){
      const grid = el('div', {class:'grid'},
        el('button', {onclick:()=>{ if(window.S){ S.reputation = (S.reputation||0)+5; } }}, '+5 Reputation'),
        el('button', {onclick:()=>{ if(window.S){ S.favor = (S.favor||0)+5; } }}, '+5 Favor'),
        el('button', {onclick:()=>{ if(window.S){ S.infiniteMode = true; alert('Infinite mode ON'); } }}, 'Enable Infinite Mode'),
        el('button', {onclick:()=>{ if(window.S){ S.round++; if(window.render) render(); } }}, 'Advance Round'),
        el('button', {onclick:()=>{ if(window.S){ (S.history||(S.history=[])).push({t:Date.now(), msg:'Debug marker'}); alert('History marked'); } }}, 'Mark History'),
        el('button', {onclick:()=>{ if(window.S){ S.achievements = Array.from(new Set([...(S.achievements||[]), 'first_blood'])); if(window.render) render(); } }}, 'Grant First Blood')
      );
      return grid;
    },
    Logs(){
      const wrap = el('div', {});
      const ta = el('textarea', {id:'devLogBox', placeholder:'Console output will appear here...'});
      wrap.append(ta);
      // Hook console
      if (!window.__devConsoleHook__) {
        window.__devConsoleHook__ = true;
        const buf = [];
        const orig = {log:console.log, warn:console.warn, error:console.error};
        ['log','warn','error'].forEach(k=>{
          console[k] = function(...args){
            try{
              buf.push(`[${k.toUpperCase()}] ${args.map(a=> (typeof a==='object'? JSON.stringify(a): String(a))).join(' ')}`);
              if (buf.length>500) buf.shift();
              const box = document.getElementById('devLogBox');
              if (box) { box.value = buf.join('\n'); box.scrollTop = box.scrollHeight; }
            }catch(e){}
            orig[k].apply(console, args);
          }
        });
      }
      return wrap;
    }
  };

  function setTab(name){
    [...tabs.children].forEach(b=>b.classList.remove('active'));
    [...body.children].forEach(n=>n.remove());
    const btn = tabButtons[name]; if (btn) btn.classList.add('active');
    body.append(sections[name]());
    localStorage.setItem('__devTab', name);
  }

  const tabButtons = {};
  for (const name of Object.keys(sections)){
    const b = el('button', {onclick:()=>setTab(name)}, name);
    tabButtons[name] = b;
    tabs.append(b);
  }
  setTab(localStorage.getItem('__devTab') || 'State');

  function togglePanel(){
    panel.style.display = (panel.style.display==='none'||!panel.style.display) ? 'block' : 'none';
    localStorage.setItem('__devOpen', panel.style.display);
  }
  toggle.addEventListener('click', togglePanel);
  document.addEventListener('keydown', (e)=>{ if (e.key==='`' || e.key==='~') togglePanel(); });

  // Auto-open if URL contains #debug
  if (location.hash.includes('debug') || localStorage.getItem('__devOpen')==='block') {
    panel.style.display = 'block';
  }
})();


// === Runtime guard: ensure 1-of-each production building at start ===
setTimeout(()=>{
  try{
    if (typeof S!=='undefined' && Array.isArray(S.productionBuildings) && typeof PRODUCTION_BUILDINGS!=='undefined'){
      if ((S.productionBuildings||[]).length===0){
        S.productionBuildings = PRODUCTION_BUILDINGS.map(b=>({type:b.id, level:1}));
        console.log('[Patch] Granted 1 of each production building at start.');
      }
    }
  }catch(e){ console.warn('start-buildings guard error', e); }
},0);


// === DevTools: Mods Tab + ModKit ===
(function(){
  if (window.__modsTabInstalled__) return; window.__modsTabInstalled__ = true;

  // Keep pristine baselines once (so creators can reset to a clean state)
  function deepClone(x){ return x ? JSON.parse(JSON.stringify(x)) : x; }
  window.__BASELINES__ = window.__BASELINES__ || (function(){
    try{
      return {
        PRODUCTION_BUILDINGS: deepClone(window.PRODUCTION_BUILDINGS),
        GOODS: deepClone(window.GOODS),
        EVENTS: deepClone(window.EVENTS),
        RESOURCE_COMBOS: deepClone(window.RESOURCE_COMBOS),
        TECHNOLOGIES: deepClone(window.TECHNOLOGIES),
        TERRITORIES: deepClone(window.TERRITORIES),
        FOUNDERS: deepClone(window.FOUNDERS),
      };
    }catch(e){ return {}; }
  })();

  // Lightweight mod registry
  window.__MODS__ = window.__MODS__ || []; // {name, version, enabled, raw, appliedAt}

  // Simple utilities to find arrays/objects by known names
  const TABLES = {
    production_buildings: ()=>window.PRODUCTION_BUILDINGS,
    goods: ()=>window.GOODS,
    events: ()=>window.EVENTS,
    resource_combos: ()=>window.RESOURCE_COMBOS,
    technologies: ()=>window.TECHNOLOGIES,
    territories: ()=>window.TERRITORIES,
    founders: ()=>window.FOUNDERS,
  };

  function ensureArrays(){
    for (const [k,getter] of Object.entries(TABLES)){
      const ref = getter && getter();
      if (ref && !Array.isArray(ref) && typeof ref!=='object'){
        console.warn('[ModKit] Unexpected table type for', k);
      }
    }
  }

  // ModKit API
  window.ModKit = window.ModKit || (function(){
    function mergeIntoArrayById(arr, item){
      if (!arr || !Array.isArray(arr)) return;
      const idx = arr.findIndex(x=>String(x.id)===String(item.id));
      if (idx>=0){
        arr[idx] = Object.assign({}, arr[idx], item);
      } else {
        arr.push(item);
      }
    }
    function patchArrayById(arr, patch){
      const idx = arr.findIndex(x=>String(x.id)===String(patch.id));
      if (idx>=0){
        Object.assign(arr[idx], (patch.set||{}));
      } else {
        console.warn('[ModKit] patch target not found:', patch.id);
      }
    }
    function apply(mod){
      ensureArrays();
      const adds = (mod.adds)||{};
      const patches = (mod.patches)||{};

      // Adds (merge-or-add by id)
      for (const [tableName, items] of Object.entries(adds)){
        const getter = TABLES[tableName];
        if (!getter){ console.warn('[ModKit] unknown table for adds:', tableName); continue; }
        const table = getter();
        if (!table) { console.warn('[ModKit] table not available:', tableName); continue; }
        if (Array.isArray(table)){
          for (const it of (items||[])){ mergeIntoArrayById(table, it); }
        } else if (typeof table==='object'){
          Object.assign(table, items||{});
        }
      }

      // Patches (set shallow fields by id)
      for (const [tableName, rules] of Object.entries(patches)){
        const getter = TABLES[tableName];
        if (!getter){ console.warn('[ModKit] unknown table for patches:', tableName); continue; }
        const table = getter();
        if (!table) { console.warn('[ModKit] table not available:', tableName); continue; }
        if (Array.isArray(table)){
          for (const p of (rules||[])){ patchArrayById(table, p); }
        } else if (typeof table==='object'){
          // For object maps (like FOUNDERS), rule: {id:'key', set:{...}}
          for (const p of (rules||[])){
            const key = p.id;
            if (key in table) Object.assign(table[key], (p.set||{}));
            else table[key] = (p.set||{});
          }
        }
      }

      if (window.render) try{ render(); }catch(e){}
    }

    function resetToBaseline(){
      const B = window.__BASELINES__||{};
      if (Array.isArray(window.PRODUCTION_BUILDINGS) && Array.isArray(B.PRODUCTION_BUILDINGS)) window.PRODUCTION_BUILDINGS.splice(0, window.PRODUCTION_BUILDINGS.length, ...deepClone(B.PRODUCTION_BUILDINGS));
      if (Array.isArray(window.GOODS) && Array.isArray(B.GOODS)) window.GOODS.splice(0, window.GOODS.length, ...deepClone(B.GOODS));
      if (Array.isArray(window.EVENTS) && Array.isArray(B.EVENTS)) window.EVENTS.splice(0, window.EVENTS.length, ...deepClone(B.EVENTS));
      if (Array.isArray(window.RESOURCE_COMBOS) && Array.isArray(B.RESOURCE_COMBOS)) window.RESOURCE_COMBOS.splice(0, window.RESOURCE_COMBOS.length, ...deepClone(B.RESOURCE_COMBOS));
      if (Array.isArray(window.TECHNOLOGIES) && Array.isArray(B.TECHNOLOGIES)) window.TECHNOLOGIES.splice(0, window.TECHNOLOGIES.length, ...deepClone(B.TECHNOLOGIES));
      if (Array.isArray(window.TERRITORIES) && Array.isArray(B.TERRITORIES)) window.TERRITORIES.splice(0, window.TERRITORIES.length, ...deepClone(B.TERRITORIES));
      if (typeof window.FOUNDERS==='object' && typeof B.FOUNDERS==='object') Object.keys(window.FOUNDERS).forEach(k=>{ delete window.FOUNDERS[k]; }); Object.assign(window.FOUNDERS, deepClone(B.FOUNDERS||{}));
      if (window.render) try{ render(); }catch(e){}
    }

    return { apply, resetToBaseline };
  })();

  // Attach Mods tab to existing Dev panel by augmenting the 'sections' object
  // Strategy: locate the first Dev Tools instance and append a new tab at runtime.
  function addModsTab(){
    const panel = document.getElementById('devDebugPanel');
    const tabs = panel && panel.querySelector('.tabbar');
    const body = panel && panel.querySelector('.body');
    if (!panel || !tabs || !body) return;

    const btn = document.createElement('button');
    btn.textContent = 'Mods';
    tabs.append(btn);

    function renderMods(){
      // Clear body
      while(body.firstChild) body.removeChild(body.firstChild);

      const wrap = document.createElement('div');

      const sample = {
        "name":"Example Mod",
        "version":"1.0.0",
        "adds":{
          "production_buildings":[
            {"id":"olive_grove","latinName":"Olea Cultus","name":"Olive Grove","emoji":"🫒","cost":180,"produces":"oil","rate":2,"desc":"Produces olive oil for trade"}
          ],
          "events":[
            {"id":"omen_venus","name":"Omen of Venus","icon":"💘","prob":0.07,"text":"Good omens bless your people.","effect":"/* optional: handled by game if supports function */"}
          ]
        },
        "patches":{
          "production_buildings":[
            {"id":"vineyard","set":{"rate":1}}
          ],
          "founders":[
            {"id":"romulus","set":{"mods":{"attackBonus":10}}}
          ]
        }
      };

      const ta = document.createElement('textarea');
      ta.placeholder = 'Paste JSON mod here';
      ta.value = JSON.stringify(sample, null, 2);

      const row = document.createElement('div'); row.className = 'row';

      const applyBtn = document.createElement('button');
      applyBtn.textContent = 'Apply Mod';
      applyBtn.onclick = ()=>{
        try{
          const mod = JSON.parse(ta.value);
          window.__MODS__.push({name:mod.name||'Unnamed', version:mod.version||'0.0.0', enabled:true, raw:mod, appliedAt:Date.now()});
          ModKit.apply(mod);
          alert('Mod applied: ' + (mod.name||'Unnamed'));
        }catch(e){
          alert('Invalid JSON: ' + e.message);
        }
      };

      const resetBtn = document.createElement('button');
      resetBtn.textContent = 'Reset to Baseline';
      resetBtn.onclick = ()=>{
        if (confirm('Reset core tables to pristine baseline?')) ModKit.resetToBaseline();
      };

      const exportBtn = document.createElement('button');
      exportBtn.textContent = 'Export Current State (as Mod template)';
      exportBtn.onclick = ()=>{
        try{
          const tmpl = {
            name: "My Mod",
            version: "1.0.0",
            adds: {},
            patches: {}
          };
          const blob = new Blob([JSON.stringify(tmpl, null, 2)], {type:'application/json'});
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'mod_template.json'; a.click();
          setTimeout(()=>URL.revokeObjectURL(url), 1200);
        }catch(e){ alert('Export failed: ' + e.message); }
      };

      const file = document.createElement('input');
      file.type = 'file'; file.accept = 'application/json';
      file.onchange = (ev)=>{
        const f = ev.target.files && ev.target.files[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = ()=>{ ta.value = String(r.result||''); };
        r.readAsText(f);
      };

      row.append(applyBtn, resetBtn, exportBtn, file);
      wrap.append(ta, row);

      const list = document.createElement('div'); list.className = 'mods-list';
      const title = document.createElement('div'); title.textContent = 'Installed Mods:'; title.style.marginTop='8px'; title.style.fontWeight='800';
      wrap.append(title, list);

      function refreshList(){
        list.innerHTML = '';
        (window.__MODS__||[]).forEach((m, i)=>{
          const item = document.createElement('div'); item.className = 'mod-item';
          const left = document.createElement('div');
          const name = document.createElement('div'); name.textContent = (m.enabled?'✅ ':'⛔ ') + (m.name||'Unnamed') + ' v' + (m.version||'0.0.0');
          const meta = document.createElement('div'); meta.className='meta'; meta.textContent = new Date(m.appliedAt||Date.now()).toLocaleString();
          left.append(name, meta);
          const right = document.createElement('div'); right.style.display='flex'; right.style.gap='6px';
          const toggle = document.createElement('button'); toggle.textContent = m.enabled?'Disable':'Enable';
          toggle.onclick = ()=>{
            m.enabled = !m.enabled;
            if (m.enabled) ModKit.apply(m.raw); else ModKit.resetToBaseline(); // simple approach: reset then re-apply enabled mods
            for (const other of (window.__MODS__||[])){ if (other.enabled) ModKit.apply(other.raw); }
            refreshList();
          };
          const reapply = document.createElement('button'); reapply.textContent = 'Re-Apply';
          reapply.onclick = ()=>{ ModKit.apply(m.raw); };
          const remove = document.createElement('button'); remove.textContent = 'Remove';
          remove.onclick = ()=>{
            if (!confirm('Remove this mod from registry?')) return;
            window.__MODS__.splice(i,1);
            ModKit.resetToBaseline();
            for (const other of (window.__MODS__||[])){ if (other.enabled) ModKit.apply(other.raw); }
            refreshList();
          };
          right.append(toggle, reapply, remove);
          item.append(left, right);
          list.append(item);
        });
      }
      refreshList();

      body.append(wrap);
    }

    btn.addEventListener('click', renderMods);
  }

  // Wait for the Dev Tools to be built, then add Mods tab
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', addModsTab);
  } else {
    setTimeout(addModsTab, 0);
  }
})();

// === Accessibility helpers: keyboard activation for interactive divs ===
document.addEventListener('DOMContentLoaded', () => {
  const makeButtonLike = (el) => {
    if (!el) return;
    if (!['BUTTON','A','INPUT','SELECT','TEXTAREA','SUMMARY'].includes(el.tagName)) {
      if (!el.hasAttribute('role')) el.setAttribute('role','button');
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex','0');
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.click();
        }
      });
    }
  };
  document.querySelectorAll('.choice, .territory, [data-buttonlike]').forEach(makeButtonLike);
});
// === Minimal focus trap for elements with [data-overlay] ===
(function(){
  function trapFocus(container){
    const focusable = container.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    function onKey(e){
      if (e.key === 'Escape') {
        container.dispatchEvent(new CustomEvent('overlay:close', {bubbles:true}));
      }
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
    container.addEventListener('keydown', onKey);
    container.addEventListener('overlay:destroy', () => container.removeEventListener('keydown', onKey), {once:true});
    first.focus();
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-overlay]').forEach(trapFocus);
    document.addEventListener('overlay:open', (e) => { if (e.target && e.target.matches && e.target.matches('[data-overlay]')) trapFocus(e.target); });
  });
})();
// === Scalable Building Caps tied to Map Regions ===
(function(){
  function getUnlockedRegions(){
    try {
      const territoriesPerTab = 12;
      const owned = (window.S && Array.isArray(S.territories)) ? S.territories.length : 0;
      return Math.max(1, Math.ceil(owned / territoriesPerTab));
    } catch(e){ return 1; }
  }
  function regionScale(){
    const regions = getUnlockedRegions();
    return 1 + (regions - 1) * 0.25;
  }
  function ensureState(){
    if (typeof window.S === 'undefined') window.S = {};
    const S = window.S;
    if (!S.buildingCounts) S.buildingCounts = { house: 0, bath: 0, warehouse: 0, fort: 0 };
    if (typeof S.baseHousing === 'undefined') S.baseHousing = S.housing || 0;
    if (typeof S.baseCapacity === 'undefined') S.baseCapacity = S.capacity || 0;
    if (typeof S.baseSanitationCap === 'undefined') S.baseSanitationCap = typeof S.maxSanitation === 'number' ? S.maxSanitation : 100;
  }
  function getCap(name){
    const S = window.S || {};
    const regions = getUnlockedRegions();
    switch(name){
      case 'sanitation':
        const techCap = (typeof S.maxSanitation === 'number' ? S.maxSanitation : (S.baseSanitationCap || 100));
        return techCap + (regions - 1) * 10;
      case 'capacity':
        return S.capacity || 0;
      case 'housing':
        return S.housing || 0;
      default:
        return 0;
    }
  }
  function computeCaps(){
    ensureState();
    const S = window.S;
    const scale = regionScale();
    const houseGain = Math.round((S.buildingCounts.house || 0) * 35 * scale);
    S.housing = Math.max(0, Math.floor(S.baseHousing + houseGain));
    const wareGain = Math.round((S.buildingCounts.warehouse || 0) * 40 * scale);
    S.capacity = Math.max(0, Math.floor(S.baseCapacity + wareGain));
    S.maxSanitationEffective = getCap('sanitation');
    if (typeof S.sanitation === 'number'){
      S.sanitation = Math.min(S.sanitation, S.maxSanitationEffective);
    }
    window.getUnlockedRegions = getUnlockedRegions;
    window.regionScale = regionScale;
  }
  document.addEventListener('DOMContentLoaded', computeCaps);
  window.addEventListener('app:stateRestored', computeCaps);
  window.addEventListener('territory:conquered', computeCaps);
  window.CapSystem = { computeCaps, getCap, getUnlockedRegions, regionScale };
})();
