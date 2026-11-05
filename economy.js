export const CAP = 1e100;
export const producers = [
 ['Хлебная мышь','Маленький помощник. Большой аппетит.','🐭',30,.2],
 ['Бабушка с тестом','Всё по секретному семейному рецепту.','👵',250,2],
 ['Мини-пекарня','Тёплый хлеб на каждом углу.','🏠',2000,15],
 ['Хлебный завод','Поставим хруст на поток.','🏭',20000,120],
 ['Батонная корпорация','Хлеб — дело серьёзное.','🏙️',250000,1200],
 ['Космическая пекарня','Первый батон на орбите.','🚀',5000000,15000],
 ['Межгалактическая фабрика','Вся вселенная пахнет выпечкой.','🪐',100000000,250000]
];
export const upgrades = [
 {name:'Крепкая корочка',icon:'🥖',desc:'+1 к базовой силе клика',base:25,growth:1.7,max:200,unlock:0},
 {name:'Масляные пальцы',icon:'🧈',desc:'×2 к силе клика',base:500,growth:5,max:10,unlock:250},
 {name:'Золотая мука',icon:'🌾',desc:'Открывает критические клики: 5%, затем +2% (до 25%)',base:1500,growth:3,max:11,unlock:1000},
 {name:'Хрустящий удар',icon:'💥',desc:'Открывает крит ×3, затем +1 (до ×8)',base:3000,growth:4,max:6,unlock:1500},
 {name:'Батонный комбо',icon:'🔥',desc:'Открывает комбо до ×2 при 100 кликах',base:200,growth:1,max:1,unlock:100},
 {name:'Рецепт бабушки',icon:'📖',desc:'×2 к производству бабушек; нужно 10 бабушек',base:10000,growth:1,max:1,requires:[1,10]},
 {name:'Новые печи',icon:'♨️',desc:'×2 к производству мини-пекарен; нужно 10 пекарен',base:80000,growth:1,max:1,requires:[2,10]},
 {name:'Промышленная автоматизация',icon:'⚙️',desc:'×2 к производству заводов; нужно 10 заводов',base:800000,growth:1,max:1,requires:[3,10]},
 {name:'Хлебная революция',icon:'✊',desc:'+25% ко всему производству; нужно 50 производителей',base:250000,growth:1,max:1,unlock:100000,units:50}
];
export const achievements = [
 ['Первый хруст','Сделайте первый клик','🥖',s=>s.clicks>=1],
 ['Хлебная зависимость','Сделайте 1 000 кликов','🤎',s=>s.clicks>=1000],
 ['Пекарь-любитель','Заработайте 10 000 крошек','🧑‍🍳',s=>s.lifetime>=10000],
 ['Маленькая империя','Купите 100 производителей','🏘️',s=>s.units.reduce((a,b)=>a+b,0)>=100],
 ['Хлебный миллионер','Заработайте 1 000 000 крошек','💰',s=>s.lifetime>=1e6],
 ['Король батонов','Достигните 1 000 000 КВС','👑',s=>rates(s).auto>=1e6],
 ['Рука-молния','Достигните комбо 100','⚡',s=>s.bestCombo>=100],
 ['Золотая удача','Соберите 50 золотых батонов','🍀',s=>s.gold>=50]
];
export function fresh(now=Date.now()) {return {version:1,crumbs:0,cycle:0,lifetime:0,clicks:0,units:Array(7).fill(0),levels:Array(9).fill(0),achievements:[],crusts:0,earnedCrusts:0,rebirths:0,permanent:[0,0,0],bestCombo:0,gold:0,skin:'classic',unlockedSkins:['classic'],settings:{sound:false,volume:.3,reduced:false,full:false},savedAt:now,startedAt:now,playTime:0};}
export function rates(s, effects={}, now=Date.now()) {
 const global=1+s.earnedCrusts*.1;
 const click=(1+s.levels[0])*2**s.levels[1]*global;
 const raw=s.units.reduce((v,n,i)=>v+n*producers[i][4]*(i>=1&&i<=3&&s.levels[i+4]?2:1),0);
 const auto=raw*global*(1+Math.min(.3,s.achievements.length*.02))*(s.levels[8]?1.25:1);
 return {click:Math.min(CAP,click)*(effects.click>now?2:1),auto:Math.min(CAP,auto)*(effects.auto>now?2:1),critChance:Math.min(.5,(s.levels[2]? .05+(s.levels[2]-1)*.02:0)+(effects.crit>now?.2:0)),critMultiplier:s.levels[3]?3+s.levels[3]-1:3};
}
export function price(base,growth,owned) {return Math.min(CAP,Math.ceil(base*growth**owned));}
export function quote(base,growth,owned,mode,balance,max=10000) {
 let cost=0,count=0; const limit=mode==='MAX'?max:Math.min(Number(mode),max);
 for(let i=0;i<limit;i++){const p=price(base,growth,owned+i);if(cost+p>CAP || (mode==='MAX'&&cost+p>balance))break;cost+=p;count++;}
 return {cost,count,affordable:count>0&&cost<=balance};
}
export function unlocked(s,u){return (!u.unlock||s.lifetime>=u.unlock)&&(!u.requires||s.units[u.requires[0]]>=u.requires[1])&&(!u.units||s.units.reduce((a,b)=>a+b,0)>=u.units);}
export function buy(s,kind,i,mode='1') {
 const u=upgrades[i]; if(kind==='upgrade'&&(!u||!unlocked(s,u)||s.levels[i]>=u.max))return false;
 if(kind==='producer'&&!producers[i])return false;
 const q=kind==='producer'?quote(producers[i][3],1.15,s.units[i],mode,s.crumbs,10000-s.units[i]):quote(u.base,u.growth,s.levels[i],mode,s.crumbs,u.max-s.levels[i]);
 if(!q.affordable)return false;
 s.crumbs=Math.max(0,s.crumbs-q.cost);(kind==='producer'?s.units:s.levels)[i]+=q.count;return true;
}
export function earn(s,n){if(Number.isFinite(n)&&n>0){s.crumbs=Math.min(CAP,s.crumbs+n);s.cycle=Math.min(CAP,s.cycle+n);s.lifetime=Math.min(CAP,s.lifetime+n);}}
export function comboMultiplier(n){return n>=100?2:n>=50?1.5:n>=25?1.25:n>=10?1.1:1;}
export function reward(s){return Math.floor(Math.sqrt(s.cycle/1e6));}
export function rebirth(s){const n=reward(s);if(!n)return false;const next=fresh();Object.assign(next,{lifetime:s.lifetime,clicks:s.clicks,achievements:[...s.achievements],crusts:s.crusts+n,earnedCrusts:s.earnedCrusts+n,rebirths:s.rebirths+1,permanent:[...s.permanent],bestCombo:s.bestCombo,gold:s.gold,skin:s.skin,unlockedSkins:[...s.unlockedSkins],settings:{...s.settings},startedAt:s.startedAt,playTime:s.playTime});if(next.permanent[0])earn(next,100*next.permanent[0]);Object.assign(s,next);return true;}
export function offline(s,now=Date.now()){const seconds=Math.max(0,Math.min(14400,(now-s.savedAt)/1000));const n=rates(s).auto*seconds*Math.min(1,.25+s.permanent[1]*.15);earn(s,n);s.savedAt=now;return n;}
export function grantEffect(e,type,now=Date.now()){e[type]=now+20000;}
