import {fresh,CAP,upgrades} from './economy.js';
export const KEY='bread-empire-v1';
const number=(n,max=CAP)=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=max;
export function validate(v){
 if(!v||v.version!==1)throw Error('Неизвестная версия сохранения');
 const s=fresh();
 for(const k of ['crumbs','cycle','lifetime','clicks','crusts','earnedCrusts','rebirths','bestCombo','gold','savedAt','startedAt','playTime']){if(!number(v[k]))throw Error('Повреждено поле: '+k);s[k]=v[k];}
 for(const [key,length,max] of [['units',7,10000],['levels',9,200],['permanent',3,5]]){if(!Array.isArray(v[key])||v[key].length!==length||!v[key].every(n=>number(n,max)&&Number.isInteger(n)))throw Error('Повреждены улучшения');s[key]=[...v[key]];}
 if(s.levels.some((n,i)=>n>upgrades[i].max)||s.permanent[2]>1)throw Error('Некорректные уровни');
 if(!Array.isArray(v.achievements)||!v.achievements.every(n=>Number.isInteger(n)&&n>=0&&n<8)||new Set(v.achievements).size!==v.achievements.length)throw Error('Повреждены достижения');
 s.achievements=[...v.achievements];
 if(!['classic','baguette','dark','gold','rainbow','space','legend'].includes(v.skin))throw Error('Неизвестный скин');s.skin=v.skin;
 const skinIds=['classic','baguette','dark','gold','rainbow','space','legend'];
 if(v.unlockedSkins!==undefined&&(!Array.isArray(v.unlockedSkins)||v.unlockedSkins.length>7||!v.unlockedSkins.every(n=>skinIds.includes(n))))throw Error('Повреждена коллекция скинов');
 s.unlockedSkins=[...new Set(v.unlockedSkins||['classic',v.skin])];
 if(!v.settings||!['sound','reduced','full'].every(k=>typeof v.settings[k]==='boolean')||!number(v.settings.volume,1))throw Error('Повреждены настройки');
 s.settings={sound:v.settings.sound,reduced:v.settings.reduced,full:v.settings.full,volume:v.settings.volume};return s;
}
export function store(s,storage=localStorage){const savedAt=Date.now();storage.setItem(KEY,JSON.stringify({...s,savedAt}));s.savedAt=savedAt;}
export function load(storage=localStorage){const raw=storage.getItem(KEY);return raw?validate(JSON.parse(raw)):fresh();}
