'use strict';
// ---------- Данные игры: предметы, враги, навыки, магазины ----------
const ITEMS = {
  // расходники
  potion_hp: { n: 'Лечебное зелье', t: 'cons', ic: 'potion', col: '#dd3344', price: 30, heal: 50, d: 'Восстанавливает 50 HP.' },
  potion_hp2: { n: 'Большое лечебное зелье', t: 'cons', ic: 'potion', col: '#ff5a6a', price: 90, heal: 130, d: 'Восстанавливает 130 HP.' },
  potion_mp: { n: 'Зелье маны', t: 'cons', ic: 'potion', col: '#3a8aff', price: 35, mp: 40, d: 'Восстанавливает 40 MP.' },
  potion_mp2: { n: 'Большое зелье маны', t: 'cons', ic: 'potion', col: '#5aa8ff', price: 90, mp: 100, d: 'Восстанавливает 100 MP.' },
  bread: { n: 'Хлеб', t: 'cons', ic: 'bread', price: 8, heal: 18, d: 'Простая еда. Восстанавливает 18 HP.' },
  antidote: { n: 'Противоядие', t: 'cons', ic: 'potion', col: '#5ac85a', price: 25, cure: 1, heal: 10, d: 'Снимает яд и замедление.' },
  elixir: { n: 'Эликсир пепла', t: 'cons', ic: 'potion', col: '#c85aff', price: 200, heal: 9999, mp: 9999, d: 'Полностью восстанавливает HP и MP.', rare: 1 },
  // оружие
  sword_rust: { n: 'Ржавый меч', t: 'weapon', ic: 'sword', col: '#8a6a4a', price: 8, atk: 6, d: 'Старый меч Ариона.' },
  sword_iron: { n: 'Железный меч', t: 'weapon', ic: 'sword', col: '#9aa4b8', price: 140, atk: 12, d: 'Надёжный клинок кузнеца Брогара.' },
  sword_hunter: { n: 'Охотничий клинок', t: 'weapon', ic: 'sword', col: '#6aa86a', price: 280, atk: 16, dex: 2, d: 'Лёгкий клинок: +2 к ловкости.' },
  sword_steel: { n: 'Стальной меч', t: 'weapon', ic: 'sword', col: '#c8d4e8', price: 560, atk: 22, d: 'Закалённая сталь.' },
  sword_knight: { n: 'Меч кастеляна', t: 'weapon', ic: 'sword', col: '#8ab0e8', price: 900, atk: 30, str: 3, d: 'Фамильный клинок Вальдрика. +3 к силе.', rare: 1 },
  sword_scorp: { n: 'Жало царицы', t: 'weapon', ic: 'sword', col: '#c85a8a', price: 800, atk: 26, dex: 3, d: 'Клинок из хитина. +3 к ловкости.', rare: 1 },
  sword_frost: { n: 'Клинок инея', t: 'weapon', ic: 'sword', col: '#8ad8ff', price: 1400, atk: 38, elem: 'ice', d: 'Холодный клинок. Удары несут лёд.', rare: 1 },
  sword_ash: { n: 'Пепельный клинок', t: 'weapon', ic: 'sword', col: '#ff5a4a', price: 2200, atk: 50, elem: 'ash', int: 3, d: 'Меч, закалённый в пепле. +3 к интеллекту.', rare: 1 },
  staff_novice: { n: 'Посох послушника', t: 'weapon', ic: 'staff', col: '#6a9aff', price: 150, atk: 4, int: 4, d: '+4 к интеллекту.' },
  staff_arcane: { n: 'Тайный посох', t: 'weapon', ic: 'staff', col: '#c88aff', price: 700, atk: 12, int: 10, d: '+10 к интеллекту.' },
  // броня
  armor_leather: { n: 'Кожаная куртка', t: 'armor', ic: 'armor', col: '#9a6a3a', price: 60, def: 4, d: 'Лёгкая защита.' },
  armor_chain: { n: 'Кольчуга', t: 'armor', ic: 'armor', col: '#a8b0c0', price: 260, def: 10, d: 'Плетёные кольца.' },
  armor_ranger: { n: 'Плащ следопыта', t: 'armor', ic: 'armor', col: '#4a9a4a', price: 400, def: 9, dex: 4, d: 'Наследие разведчиков. +4 к ловкости.', rare: 1 },
  armor_plate: { n: 'Латы стража', t: 'armor', ic: 'armor', col: '#8a98b8', price: 700, def: 18, d: 'Тяжёлые латы.' },
  armor_frost: { n: 'Ледяной панцирь', t: 'armor', ic: 'armor', col: '#8ad0f8', price: 1200, def: 26, vit: 4, d: 'Не тает даже в огне. +4 к выносливости.', rare: 1 },
  armor_ash: { n: 'Пепельные латы', t: 'armor', ic: 'armor', col: '#6a4a6a', price: 2000, def: 36, vit: 5, d: 'Доспех павших королей. +5 к выносливости.', rare: 1 },
  // шлемы
  cap_leather: { n: 'Кожаный капюшон', t: 'helm', ic: 'helm', col: '#8a5a2a', price: 40, def: 1, d: 'Простой капюшон.' },
  helm_iron: { n: 'Железный шлем', t: 'helm', ic: 'helm', col: '#9aa4b8', price: 130, def: 3, d: 'Защищает голову.' },
  helm_knight: { n: 'Шлем кастеляна', t: 'helm', ic: 'helm', col: '#7a90c8', price: 600, def: 7, d: 'Увенчан красным плюмажем.', rare: 1 },
  helm_frost: { n: 'Ледяной венец', t: 'helm', ic: 'helm', col: '#a8e0ff', price: 1000, def: 9, int: 4, d: '+4 к интеллекту.', rare: 1 },
  helm_ash: { n: 'Пепельный шлем', t: 'helm', ic: 'helm', col: '#7a4a6a', price: 1600, def: 13, d: 'Тёмный шлем с алым стеклом.', rare: 1 },
  // аксессуары
  ring_str: { n: 'Кольцо силы', t: 'acc', ic: 'ring', col: '#ff6a3a', price: 220, str: 3, d: '+3 к силе.' },
  ring_dex: { n: 'Кольцо ветра', t: 'acc', ic: 'ring', col: '#6aff9a', price: 220, dex: 3, d: '+3 к ловкости.' },
  ring_int: { n: 'Кольцо мудреца', t: 'acc', ic: 'ring', col: '#6a9aff', price: 220, int: 3, d: '+3 к интеллекту.' },
  amulet_vit: { n: 'Амулет стойкости', t: 'acc', ic: 'amulet', col: '#ff8a8a', price: 260, vit: 3, d: '+3 к выносливости.' },
  amulet_guard: { n: 'Амулет стража', t: 'acc', ic: 'amulet', col: '#c8d4e8', price: 400, def: 6, d: '+6 к защите.' },
  amulet_sand: { n: 'Песочные часы Хасима', t: 'acc', ic: 'amulet', col: '#ffd24a', price: 500, mp: 40, dex: 2, d: '+40 MP, +2 к ловкости.', rare: 1 },
  art_heart: { n: 'Сердце пепла', t: 'acc', ic: 'gem', col: '#ff3a4a', price: 1500, hp: 60, str: 3, int: 3, d: 'Артефакт. +60 HP, +3 к силе и интеллекту.', rare: 1 },
  art_frost: { n: 'Слеза Кхарна', t: 'acc', ic: 'gem', col: '#8ad8ff', price: 1300, mp: 60, int: 5, d: 'Артефакт стража льда. +60 MP, +5 к интеллекту.', rare: 1 },
  art_forest: { n: 'Сердце рощи', t: 'acc', ic: 'gem', col: '#6aff6a', price: 700, hp: 40, vit: 3, d: 'Артефакт храма. +40 HP, +3 к выносливости.', rare: 1 },
  // материалы
  ore: { n: 'Железная руда', t: 'mat', ic: 'ore', col: '#c0c6d4', price: 15, d: 'Нужна кузнецу для улучшений.' },
  herb: { n: 'Лесная трава', t: 'mat', ic: 'herb', col: '#4ac84a', price: 10, d: 'Лекарственное растение.' },
  crystal: { n: 'Ледяной кристалл', t: 'mat', ic: 'crystal', col: '#8ad8ff', price: 45, d: 'Редкий материал для улучшений.' },
  ash_shard: { n: 'Пепельный осколок', t: 'mat', ic: 'shard', col: '#ff5a4a', price: 35, d: 'Осколок древней силы.' },
  pelt: { n: 'Волчья шкура', t: 'mat', ic: 'herb', col: '#8a8e98', price: 12, d: 'Можно продать торговцу.' },
  silk: { n: 'Паучий шёлк', t: 'mat', ic: 'herb', col: '#cfc8e8', price: 14, d: 'Прочная нить.' },
  scale: { n: 'Хитин скорпиона', t: 'mat', ic: 'tail', col: '#c8883a', price: 30, d: 'Твёрдый панцирь.' },
  // квестовые
  tablet: { n: 'Древняя табличка', t: 'quest', ic: 'scroll', col: '#c8b078', price: 0, d: 'Покрыта странными письменами.' },
  signet: { n: 'Перстень разведчика', t: 'quest', ic: 'ring', col: '#ffd24a', price: 0, d: 'Принадлежал пропавшему разведчику Каю.' },
  teddy: { n: 'Плюшевый мишка', t: 'quest', ic: 'scroll', col: '#9a6a3a', price: 0, d: 'Любимая игрушка Тима.' },
  parcel: { n: 'Свёрток Лиары', t: 'quest', ic: 'scroll', col: '#d8a8c8', price: 0, d: 'Для кузнеца Брогара.' },
  caravan_goods: { n: 'Товары каравана', t: 'quest', ic: 'book', col: '#d8a048', price: 0, d: 'Ящик с товарами Хасима.' },
  priest_key: { n: 'Ключ жреца', t: 'quest', ic: 'key', col: '#ff5a6a', price: 0, d: 'Открывает Затонувший зал.' },
  seal_forest: { n: 'Печать Рощи', t: 'quest', ic: 'gem', col: '#4ac84a', price: 0, d: 'Первая из трёх печатей.' },
  seal_fort: { n: 'Печать Крепости', t: 'quest', ic: 'gem', col: '#8aa8e8', price: 0, d: 'Вторая печать.' },
  seal_winter: { n: 'Печать Зимы', t: 'quest', ic: 'gem', col: '#cfeaff', price: 0, d: 'Третья печать.' },
  chr1: { n: 'Хроники I: Источник', t: 'lore', ic: 'scroll', col: '#d8c898', price: 0, d: 'Страница хроник. Читайте в журнале.' },
  chr2: { n: 'Хроники II: Пакт', t: 'lore', ic: 'scroll', col: '#d8c898', price: 0, d: 'Страница хроник.' },
  chr3: { n: 'Хроники III: Приказ', t: 'lore', ic: 'scroll', col: '#d8c898', price: 0, d: 'Страница хроник.' },
  chr4: { n: 'Хроники IV: Песок', t: 'lore', ic: 'scroll', col: '#d8c898', price: 0, d: 'Страница хроник.' },
  chr5: { n: 'Хроники V: Лёд', t: 'lore', ic: 'scroll', col: '#d8c898', price: 0, d: 'Страница хроник.' },
  chr6: { n: 'Хроники VI: Пепел', t: 'lore', ic: 'scroll', col: '#d8c898', price: 0, d: 'Страница хроник.' }
};
const CHRONICLES = {
  chr1: 'Источник был даром. Первый король нашёл его в долине и поклялся беречь. Он не знал, что Источник слышит клятвы — и помнит их.',
  chr2: 'Дом Эльдарнов тайно заключил пакт: если король откажется делиться силой, ему «помогут» отказаться. Печать на пакте поставлена кровью Орвена.',
  chr3: 'Приказ кастеляну: «Закрыть ворота. Никого не выпускать из долины Пепла». Подписано регентом. Король ещё жив, но его воля уже ничего не значит.',
  chr4: 'Караваны шли за водой, а несли оружие. В песках под храмом прятали стражу, которой не суждено было вернуться.',
  chr5: 'Лёд — это не проклятие. Король приказал заморозить северную жилу Источника, чтобы пламя не вырвалось. Хранители остались навсегда.',
  chr6: 'Я не начинал эту войну. Я пытался её прекратить. Если ты читаешь это — найди меня и выслушай. Валдрис, последний король.'
};
function itemName(id) { return (ITEMS[id] || { n: id }).n; }
const isGear = it => ['weapon', 'armor', 'helm', 'acc', 'book'].includes(it.t);

// ---------- Навыки ----------
const SKILLS = {
  strike: { n: 'Удар мечом', kind: 'Физический', unlock: 1, d: 'Основная атака, три удара в серии. Растёт урон.', ic: 'sword', col: '#ff4a4a' },
  dodge: { n: 'Уклонение', kind: 'Пассивный', unlock: 1, d: 'Шанс избежать удара и длительность неуязвимости при перекате.', ic: 'gem', col: '#6a9aff' },
  fire: { n: 'Огненный шар', kind: 'Магический', unlock: 1, mp: 12, cd: 0.8, key: 1, d: 'Дальний снаряд с огненным взрывом. Урон зависит от интеллекта.', ic: 'shard', col: '#ff8a2a' },
  heal: { n: 'Лечение', kind: 'Магический', unlock: 2, mp: 20, cd: 6, key: 3, d: 'Восстанавливает здоровье.', ic: 'herb', col: '#4ac84a' },
  whirl: { n: 'Вихрь клинка', kind: 'Физический', unlock: 3, mp: 14, cd: 4, key: 2, d: 'Круговой удар: оглушает и отбрасывает врагов вокруг.', ic: 'sword', col: '#cfd6e4' },
  nova: { n: 'Пепельная нова', kind: 'Магический', unlock: 6, mp: 28, cd: 12, key: 4, d: 'Волна пепла от героя: урон и сильное отбрасывание.', ic: 'shard', col: '#ff5a4a' }
};
const HOTBAR = ['fire', 'whirl', 'heal', 'nova'];

// ---------- Враги ----------
// kind: melee | heavy | combo | lunge | pack | ranged | caster
const ENEMIES = {
  goblin: { n: 'Гоблин', hp: 26, atk: 7, def: 0, spd: 56, xp: 9, gold: [2, 6], aggro: 90, kind: 'melee', wind: .35, cd: 1.1, reach: 15, spr: 'goblin', sz: 6, drops: [['bread', .15], ['potion_hp', .08], ['ore', .08]], info: 'Слабый, но быстрый. Встречается в лесах и пещерах.' },
  wolf: { n: 'Волк', hp: 36, atk: 9, def: 0, spd: 66, xp: 12, gold: [0, 3], aggro: 100, kind: 'pack', wind: .3, cd: 1.5, reach: 16, spr: 'wolf', sz: 7, drops: [['pelt', .5], ['bread', .1]], info: 'Нападает стаей, пытаясь окружить.' },
  bandit: { n: 'Разбойник', hp: 52, atk: 9, def: 1, spd: 60, xp: 17, gold: [5, 14], aggro: 100, kind: 'combo', wind: .3, cd: 1.6, reach: 16, hum: 'bandit', sz: 6, drops: [['potion_hp', .15], ['ore', .1], ['helm_iron', .03]], info: 'Атакует сериями ударов. Быстрый и ловкий.' },
  orc: { n: 'Орк', hp: 120, atk: 19, def: 4, spd: 38, xp: 34, gold: [8, 20], aggro: 85, kind: 'heavy', wind: .85, cd: 2, reach: 22, hum: 'orc', sc: 1.2, sz: 8, drops: [['ore', .3], ['potion_hp', .2], ['sword_iron', .03]], info: 'Медленный и сильный. Тяжёлые удары топором по области.' },
  spider: { n: 'Паук', hp: 42, atk: 10, def: 0, spd: 60, xp: 15, gold: [1, 5], aggro: 95, kind: 'lunge', wind: .4, cd: 1.8, reach: 15, spr: 'spider', sz: 7, poison: 1, drops: [['silk', .5], ['antidote', .1]], info: 'Обитает в пещерах. Прыжок с ядом из засады.' },
  ruinguard: { n: 'Страж руин', hp: 95, atk: 15, def: 6, spd: 40, xp: 30, gold: [6, 16], aggro: 80, kind: 'heavy', wind: .7, cd: 1.8, reach: 20, spr: 'golem', sz: 9, res: { phys: .65, fire: 1.2, ash: .8 }, drops: [['ore', .35], ['herb', .1]], info: 'Каменный страж. Устойчив к клинкам, боится огня.' },
  skeleton: { n: 'Скелет', hp: 72, atk: 15, def: 3, spd: 50, xp: 25, gold: [4, 12], aggro: 90, kind: 'melee', wind: .45, cd: 1.3, reach: 16, hum: 'skeleton', sz: 6, res: { phys: .8, fire: 1.6, ash: .7 }, drops: [['ore', .15], ['potion_mp', .12]], info: 'Восстаёт из мёртвых. Уязвим к огню и святой магии.' },
  knight: { n: 'Призрачный рыцарь', hp: 150, atk: 23, def: 10, spd: 44, xp: 46, gold: [12, 28], aggro: 85, kind: 'heavy', wind: .7, cd: 1.7, reach: 20, hum: 'knight', sc: 1.1, sz: 7, res: { phys: .8, fire: 1.2, ash: 1.0 }, drops: [['potion_hp2', .15], ['armor_chain', .05], ['ore', .3]], info: 'Страж павшей крепости.' },
  crossbow: { n: 'Арбалетчик', hp: 62, atk: 17, def: 2, spd: 52, xp: 28, gold: [8, 18], aggro: 130, kind: 'ranged', wind: .7, cd: 2, reach: 120, hum: 'crossbow', sz: 6, proj: 'bolt', drops: [['potion_mp', .12], ['ore', .12]], info: 'Держит дистанцию и стреляет.' },
  scorpion: { n: 'Скорпион', hp: 85, atk: 16, def: 5, spd: 56, xp: 28, gold: [3, 9], aggro: 90, kind: 'lunge', wind: .45, cd: 1.7, reach: 16, spr: 'scorpion', sz: 8, poison: 1, drops: [['scale', .35], ['antidote', .1]], info: 'Быстрые выпады, яд в жале.' },
  mummy: { n: 'Мумия', hp: 125, atk: 17, def: 4, spd: 36, xp: 36, gold: [8, 20], aggro: 80, kind: 'melee', wind: .6, cd: 1.6, reach: 17, hum: 'mummy', sz: 7, res: { fire: 1.7, phys: .9 }, drops: [['potion_hp', .2], ['amulet_guard', .02]], info: 'Медленная, но живучая. Горит как факел.' },
  jackal: { n: 'Шакал', hp: 58, atk: 14, def: 1, spd: 74, xp: 20, gold: [1, 4], aggro: 110, kind: 'pack', wind: .25, cd: 1.4, reach: 16, spr: 'jackal', sz: 7, drops: [['pelt', .4], ['bread', .1]], info: 'Быстрые пустынные охотники.' },
  raider: { n: 'Налётчик', hp: 80, atk: 16, def: 3, spd: 60, xp: 28, gold: [8, 20], aggro: 100, kind: 'combo', wind: .28, cd: 1.5, reach: 16, hum: 'scorpwar', sz: 6, drops: [['potion_hp', .2], ['ore', .15]], info: 'Серия быстрых ударов.' },
  frostwolf: { n: 'Ледяной волк', hp: 105, atk: 23, def: 3, spd: 72, xp: 40, gold: [2, 8], aggro: 110, kind: 'pack', wind: .3, cd: 1.4, reach: 17, spr: 'frostwolf', sz: 7, res: { ice: .4, fire: 1.4 }, slow: 1, drops: [['pelt', .5], ['crystal', .08]], info: 'Охотится стаей. Укус замедляет.' },
  wraith: { n: 'Ледяной призрак', hp: 92, atk: 25, def: 2, spd: 46, xp: 46, gold: [10, 24], aggro: 140, kind: 'ranged', wind: .8, cd: 2.2, reach: 130, spr: 'wraith', sz: 7, proj: 'ice', res: { ice: .2, fire: 1.6, phys: .8, ash: 1.0 }, slow: 1, drops: [['crystal', .22], ['potion_mp2', .06]], info: 'Бросает ледяные шары, замедляет.' },
  yeti: { n: 'Ледяной великан', hp: 270, atk: 36, def: 8, spd: 40, xp: 85, gold: [20, 40], aggro: 90, kind: 'heavy', wind: .9, cd: 2.2, reach: 26, spr: 'golem_ice', sz: 10, res: { ice: .4, fire: 1.4 }, drops: [['crystal', .4], ['potion_hp2', .2]], info: 'Огромный, медленный, невероятно сильный.' },
  frozen: { n: 'Ледяной скелет', hp: 135, atk: 27, def: 5, spd: 52, xp: 48, gold: [8, 20], aggro: 90, kind: 'melee', wind: .4, cd: 1.2, reach: 16, hum: 'skeleton', sz: 6, res: { fire: 1.7, ice: .3 }, drops: [['crystal', .15], ['potion_mp2', .05]], info: 'Замёрзший воин старой войны.' },
  ashwar: { n: 'Пепельный воин', hp: 195, atk: 35, def: 14, spd: 54, xp: 92, gold: [20, 44], aggro: 100, kind: 'combo', wind: .3, cd: 1.5, reach: 18, hum: 'ashwar', sc: 1.1, sz: 7, res: { ash: .3, ice: 1.2 }, drops: [['ash_shard', .35], ['potion_hp2', .2]], info: 'Слуга Пепельного Короля. Бьёт сериями.' },
  asharch: { n: 'Пепельный лучник', hp: 140, atk: 31, def: 6, spd: 56, xp: 82, gold: [16, 36], aggro: 150, kind: 'ranged', wind: .6, cd: 1.7, reach: 140, hum: 'asharch', sz: 6, proj: 'arrow', res: { ash: .3, ice: 1.2 }, drops: [['ash_shard', .3], ['potion_mp2', .1]], info: 'Дальние атаки, держит дистанцию.' },
  ashmage: { n: 'Пепельный маг', hp: 165, atk: 38, def: 4, spd: 48, xp: 100, gold: [20, 48], aggro: 150, kind: 'caster', wind: .8, cd: 2.4, reach: 150, hum: 'ashmage', sz: 6, proj: 'ashorb', res: { ash: .2, ice: 1.4, phys: 1.1 }, drops: [['ash_shard', .4], ['potion_mp2', .15]], info: 'Метает пепельные сгустки веером.' },
  hound: { n: 'Пепельная гончая', hp: 150, atk: 33, def: 6, spd: 82, xp: 74, gold: [4, 12], aggro: 130, kind: 'pack', wind: .25, cd: 1.3, reach: 17, spr: 'hound', sz: 7, res: { ash: .3, ice: 1.3 }, drops: [['ash_shard', .25]], info: 'Быстрая и яростная.' },
  ashorc: { n: 'Пепельный орк', hp: 380, atk: 54, def: 12, spd: 42, xp: 145, gold: [30, 60], aggro: 90, kind: 'heavy', wind: .9, cd: 2, reach: 24, hum: 'ashorc', sc: 1.35, sz: 9, res: { ash: .3, ice: 1.3 }, drops: [['ash_shard', .6], ['potion_hp2', .3]], info: 'Закалён пеплом. Крайне опасен.' },
  priest: { n: 'Пепельный жрец', hp: 520, atk: 42, def: 10, spd: 50, xp: 400, gold: [80, 120], aggro: 160, kind: 'caster', wind: .7, cd: 1.8, reach: 150, hum: 'priest', sc: 1.3, sz: 8, proj: 'ashorb', res: { ash: .2, ice: 1.4 }, unique: 1, drops: [['priest_key', 1], ['helm_ash', .5], ['ash_shard', 1]], info: 'Хранитель пепельного культа.' },
  // миньоны босса
  minion_w: { n: 'Пепельный воин', hp: 90, atk: 30, def: 6, spd: 66, xp: 0, gold: [0, 0], aggro: 999, kind: 'combo', wind: .3, cd: 1.3, reach: 18, hum: 'ashwar', sz: 7, res: { ash: .3 }, drops: [], minion: 1, info: '' },
  minion_a: { n: 'Пепельный лучник', hp: 60, atk: 26, def: 3, spd: 60, xp: 0, gold: [0, 0], aggro: 999, kind: 'ranged', wind: .6, cd: 1.8, reach: 150, hum: 'asharch', sz: 6, proj: 'arrow', res: { ash: .3 }, drops: [], minion: 1, info: '' },
  minion_m: { n: 'Пепельный маг', hp: 70, atk: 30, def: 2, spd: 52, xp: 0, gold: [0, 0], aggro: 999, kind: 'caster', wind: .8, cd: 2.4, reach: 150, hum: 'ashmage', sz: 6, proj: 'ashorb', res: { ash: .3 }, drops: [], minion: 1, info: '' }
};
// боссы: параметры; логика в boss.js
const BOSSES = {
  forest_guard: { n: 'Древний страж Рощи', hp: 520, def: 8, atk: 22, xp: 260, gold: [60, 90], spr: 'forestguard', sz: 13, music: 'm_boss', res: { phys: .75, fire: 1.4 }, drops: [['art_forest', 1], ['seal_forest', 1], ['potion_hp2', 1]], seal: 'seal_forest' },
  castellan: { n: 'Кастелян Вальдрик', hp: 900, def: 14, atk: 30, xp: 520, gold: [120, 160], spr: 'castellan', sz: 12, music: 'm_boss', res: { fire: 1.2, ice: 1.0 }, drops: [['sword_knight', 1], ['helm_knight', 1], ['seal_fort', 1]], seal: 'seal_fort' },
  queen: { n: 'Царица скорпионов', hp: 760, def: 10, atk: 28, xp: 440, gold: [100, 140], spr: 'queen', sz: 13, music: 'm_boss', res: { fire: 1.1 }, drops: [['sword_scorp', 1], ['scale', 1]], optional: 1 },
  ice_guardian: { n: 'Ледяной страж Кхарн', hp: 1300, def: 18, atk: 40, xp: 800, gold: [180, 240], spr: 'iceguard', sz: 14, music: 'm_boss', res: { ice: .2, fire: 1.5, phys: .9 }, drops: [['art_frost', 1], ['sword_frost', 1], ['seal_winter', 1]], seal: 'seal_winter' },
  ash_king: { n: 'Пепельный Король', hp: 3000, def: 22, atk: 58, xp: 2500, gold: [400, 400], spr: 'king', sz: 18, music: 'm_boss_final', res: { ash: .3, ice: 1.2, phys: 1.0 }, drops: [['art_heart', 1]] }
};

// ---------- Магазины ----------
const SHOPS = {
  liara: { n: 'Лавка Лиары', stock: () => ['potion_hp', 'potion_mp', 'bread', 'antidote'].concat(F('jungle_done') ? ['potion_hp2', 'potion_mp2'] : []).concat(F('fort_done') ? ['ring_dex', 'ring_int'] : []) },
  brogar: { n: 'Кузница Брогара', stock: () => ['sword_iron', 'armor_leather', 'cap_leather', 'helm_iron', 'staff_novice'].concat(F('jungle_done') ? ['sword_hunter', 'armor_chain'] : []).concat(F('fort_done') ? ['sword_steel', 'armor_plate', 'staff_arcane'] : []) },
  mirena: { n: 'Аптека Мирены', stock: () => ['potion_hp', 'potion_mp', 'antidote', 'bread'].concat(F('fort_done') ? ['potion_hp2'] : []) },
  hasim: { n: 'Лавка Хасима', stock: () => ['potion_hp2', 'potion_mp2', 'antidote', 'ring_str', 'amulet_vit', 'amulet_guard', 'ring_dex', 'ring_int', 'amulet_sand'] },
  rein: { n: 'Запасы Рейна', stock: () => ['potion_hp2', 'potion_mp2', 'staff_arcane', 'helm_knight', 'amulet_guard'] },
  skald: { n: 'Хижина Скальда', stock: () => ['potion_hp2', 'potion_mp2', 'bread', 'antidote', 'armor_plate'] }
};
const F = k => !!(typeof S !== 'undefined' && S && S.flags && S.flags[k]);

// ---------- Улучшение у кузнеца ----------
const MAXUP = 5;
function upgradeCost(it, lvl) {
  const base = ITEMS[it.id].price || 60;
  return { gold: Math.round(base * 0.35 * (lvl + 1) + 20 * lvl), ore: lvl + 1, rare: lvl >= 3 ? (lvl >= 4 ? ['ash_shard', 2] : ['crystal', 1]) : null };
}
const upMul = up => 1 + 0.14 * (up || 0);

// ---------- Регионы ----------
const REGIONS = {
  capital: { n: 'Столица', music: 'm_city', col: '#5a8a3a', ambient: [0, 0, 0, 0], light: 0, fx: 'leaves' },
  jungle: { n: 'Джунгли', music: 'm_jungle', col: '#2a7a3a', ambient: [4, 24, 16, .22], light: .22, fx: 'fireflies' },
  fortress: { n: 'Крепость', music: 'm_fortress', col: '#6a7080', ambient: [10, 10, 30, .24], light: .24, fx: 'dust' },
  desert: { n: 'Пустыня', music: 'm_desert', col: '#e0b858', ambient: [60, 30, 0, .05], light: .05, fx: 'sand' },
  winter: { n: 'Зима', music: 'm_winter', col: '#cfe4f4', ambient: [20, 40, 90, .22], light: .2, fx: 'snow' },
  ash: { n: 'Пепельный остров', music: 'm_ash', col: '#6a5a66', ambient: [40, 6, 10, .34], light: .34, fx: 'ash' }
};
