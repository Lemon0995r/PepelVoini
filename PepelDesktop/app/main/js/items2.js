'use strict';
// ---------- Расширение данных: типы оружия, новые предметы, навыки, сумки ----------
Object.keys(ITEMS).forEach(k => { ITEMS[k].id = k; });
// тип оружия по умолчанию
Object.keys(ITEMS).forEach(k => { const d = ITEMS[k]; if (d.t === 'weapon' && !d.wt) d.wt = d.ic === 'staff' ? 'staff' : 'sword'; });
const WT = {   // атака по типам оружия
  sword:  { n: 'Меч', desc: 'Серия из 3 ударов', stat: 'str' },
  dagger: { n: 'Кинжал', desc: 'Очень быстрые удары, повышенный шанс крита', stat: 'dex' },
  axe:    { n: 'Топор', desc: 'Медленный широкий удар, пробивает защиту', stat: 'str' },
  hammer: { n: 'Молот', desc: 'Тяжёлый удар по площади, оглушает', stat: 'str' },
  spear:  { n: 'Копьё', desc: 'Длинный укол, бьёт всех на линии', stat: 'str' },
  bow:    { n: 'Лук', desc: 'Стрелы на расстоянии (нужна ловкость)', stat: 'dex' },
  staff:  { n: 'Посох', desc: 'Магические заряды (тратит ману, нужен интеллект)', stat: 'int' }
};
ELCOL.lightning = '#ffee6a'; ELCOL.poison = '#6aff4a';
const NEWITEMS = {
  // топоры
  axe_hand: { n: 'Ручной топор', t: 'weapon', wt: 'axe', ic: 'axe', col: '#9a8a7a', price: 120, atk: 11, d: 'Простой дровосекский топор.' },
  axe_battle: { n: 'Боевой топор', t: 'weapon', wt: 'axe', ic: 'axe', col: '#b8c0cc', price: 480, atk: 21, str: 2, d: 'Широкое лезвие. +2 к силе.' },
  axe_frost: { n: 'Топор мороза', t: 'weapon', wt: 'axe', ic: 'axe', col: '#8ad8ff', price: 1300, atk: 35, elem: 'ice', d: 'Лёд на лезвии замедляет врагов.', rare: 1 },
  axe_ash: { n: 'Топор палача', t: 'weapon', wt: 'axe', ic: 'axe', col: '#ff5a4a', price: 2000, atk: 47, elem: 'ash', str: 4, d: 'Выкован в пепельном огне. +4 к силе.', rare: 1 },
  // кинжалы
  dag_knife: { n: 'Нож охотника', t: 'weapon', wt: 'dagger', ic: 'dagger', col: '#a8aeb8', price: 70, atk: 5, dex: 2, d: 'Короткий и быстрый. +2 к ловкости.' },
  dag_stiletto: { n: 'Стилет', t: 'weapon', wt: 'dagger', ic: 'dagger', col: '#c8d0dc', price: 380, atk: 11, dex: 4, d: 'Тонкий клинок. +4 к ловкости.' },
  dag_viper: { n: 'Клык гадюки', t: 'weapon', wt: 'dagger', ic: 'dagger', col: '#6aff4a', price: 900, atk: 19, dex: 6, elem: 'poison', d: 'Яд замедляет жертву. +6 к ловкости.', rare: 1 },
  dag_shadow: { n: 'Теневой кинжал', t: 'weapon', wt: 'dagger', ic: 'dagger', col: '#8a6ac8', price: 1700, atk: 29, dex: 9, d: 'Невидимое лезвие. +9 к ловкости.', rare: 1 },
  // копья
  spear_wood: { n: 'Охотничье копьё', t: 'weapon', wt: 'spear', ic: 'spear', col: '#9a7a4a', price: 100, atk: 9, d: 'Лёгкое копьё с каменным наконечником.' },
  spear_iron: { n: 'Железное копьё', t: 'weapon', wt: 'spear', ic: 'spear', col: '#aab2c0', price: 420, atk: 18, d: 'Надёжное копьё стражи.' },
  spear_halberd: { n: 'Алебарда', t: 'weapon', wt: 'spear', ic: 'spear', col: '#c0c8d8', price: 900, atk: 29, str: 3, d: 'Копьё с топором. +3 к силе.', rare: 1 },
  spear_ice: { n: 'Ледяное копьё', t: 'weapon', wt: 'spear', ic: 'spear', col: '#8ad8ff', price: 1500, atk: 39, elem: 'ice', d: 'Наконечник из вечного льда.', rare: 1 },
  // молоты
  hammer_smith: { n: 'Кузнечный молот', t: 'weapon', wt: 'hammer', ic: 'hammer', col: '#8a8e98', price: 200, atk: 14, str: 1, d: 'Тяжёлый, зато надёжный.' },
  hammer_war: { n: 'Боевой молот', t: 'weapon', wt: 'hammer', ic: 'hammer', col: '#aeb6c6', price: 760, atk: 27, str: 3, d: 'Крушит доспехи. +3 к силе.' },
  hammer_ash: { n: 'Молот пепла', t: 'weapon', wt: 'hammer', ic: 'hammer', col: '#c8503a', price: 2100, atk: 51, elem: 'ash', str: 5, d: 'Каждый удар как взрыв. +5 к силе.', rare: 1 },
  // луки
  bow_short: { n: 'Короткий лук', t: 'weapon', wt: 'bow', ic: 'bow', col: '#9a7a4a', price: 130, atk: 8, d: 'Простой охотничий лук.' },
  bow_long: { n: 'Длинный лук', t: 'weapon', wt: 'bow', ic: 'bow', col: '#b89a5a', price: 520, atk: 17, dex: 2, d: 'Дальний бой. +2 к ловкости.' },
  bow_elven: { n: 'Лук следопыта', t: 'weapon', wt: 'bow', ic: 'bow', col: '#6aa86a', price: 1000, atk: 27, dex: 5, d: 'Лёгкий и точный. +5 к ловкости.', rare: 1 },
  bow_frost: { n: 'Ледяной лук', t: 'weapon', wt: 'bow', ic: 'bow', col: '#8ad8ff', price: 1500, atk: 36, elem: 'ice', dex: 3, d: 'Ледяные стрелы.', rare: 1 },
  bow_ash: { n: 'Лук пепельной бури', t: 'weapon', wt: 'bow', ic: 'bow', col: '#ff5a4a', price: 2200, atk: 48, elem: 'ash', dex: 5, d: 'Стрелы, горящие пеплом.', rare: 1 },
  // посохи и жезлы
  wand_spark: { n: 'Жезл искр', t: 'weapon', wt: 'staff', ic: 'wand', col: '#ffee6a', price: 100, atk: 6, int: 3, elem: 'lightning', d: 'Короткие молнии. +3 к интеллекту.' },
  staff_fire: { n: 'Посох огня', t: 'weapon', wt: 'staff', ic: 'staff', col: '#ff8a2a', price: 450, atk: 11, int: 6, elem: 'fire', d: 'Огненные шары. +6 к интеллекту.' },
  staff_storm: { n: 'Посох бури', t: 'weapon', wt: 'staff', ic: 'staff', col: '#ffee6a', price: 800, atk: 14, int: 8, elem: 'lightning', d: 'Разряды молний. +8 к интеллекту.', rare: 1 },
  staff_frost: { n: 'Посох инея', t: 'weapon', wt: 'staff', ic: 'staff', col: '#8ad8ff', price: 1400, atk: 18, int: 12, elem: 'ice', d: 'Ледяные иглы. +12 к интеллекту.', rare: 1 },
  staff_ash: { n: 'Посох пепельного жреца', t: 'weapon', wt: 'staff', ic: 'staff', col: '#ff5a4a', price: 2300, atk: 24, int: 16, elem: 'ash', d: 'Сгустки пепла. +16 к интеллекту.', rare: 1 },
  // доспехи магов и охотников
  robe_apprentice: { n: 'Мантия ученика', t: 'armor', ic: 'armor', col: '#4a5ac8', price: 90, def: 3, int: 3, d: 'Лёгкая мантия. +3 к интеллекту.' },
  robe_arcane: { n: 'Мантия чародея', t: 'armor', ic: 'armor', col: '#8a4ac8', price: 650, def: 8, int: 7, mp: 30, d: '+7 к интеллекту, +30 MP.', rare: 1 },
  armor_scale: { n: 'Чешуйчатый доспех', t: 'armor', ic: 'armor', col: '#c8883a', price: 800, def: 20, dex: 2, d: 'Хитин скорпиона. +2 к ловкости.', rare: 1 },
  hood_mage: { n: 'Капюшон мага', t: 'helm', ic: 'helm', col: '#5a4ab8', price: 300, def: 2, int: 4, d: '+4 к интеллекту.' },
  helm_horned: { n: 'Рогатый шлем', t: 'helm', ic: 'helm', col: '#b8a888', price: 420, def: 6, str: 2, d: '+2 к силе.' },
  // сумки: расширение инвентаря
  bag1: { n: 'Сумка путника', t: 'cons', ic: 'bag', col: '#a8784a', price: 250, bag: 6, d: 'Навсегда расширяет инвентарь на 6 ячеек.' },
  bag2: { n: 'Рюкзак странника', t: 'cons', ic: 'bag', col: '#6a8a5a', price: 800, bag: 8, need: 'bag1', d: 'Навсегда +8 ячеек. Нужна сумка путника.', rare: 1 },
  bag3: { n: 'Бездонная сумка', t: 'cons', ic: 'bag', col: '#8a5ac8', price: 2000, bag: 10, need: 'bag2', d: 'Навсегда +10 ячеек. Нужен рюкзак странника.', rare: 1 },
  // новые расходники
  scroll_fire: { n: 'Свиток огня', t: 'cons', ic: 'scroll', col: '#ff8a2a', price: 60, scroll: 'fire', d: 'Взрыв огня вокруг героя.' },
  potion_str: { n: 'Настой ярости', t: 'cons', ic: 'potion', col: '#ff6a3a', price: 120, buff: 'str', d: '+30% урона на 60 секунд.' },
  potion_def: { n: 'Настой стойкости', t: 'cons', ic: 'potion', col: '#8ab0e8', price: 120, buff: 'def', d: '−35% получаемого урона на 60 секунд.' }
};
Object.keys(NEWITEMS).forEach(k => { NEWITEMS[k].id = k; ITEMS[k] = NEWITEMS[k]; });
// иконки навыков
SKILLS.fire.ic = 'sk_fire'; SKILLS.whirl.ic = 'sk_whirl'; SKILLS.heal.ic = 'sk_heal'; SKILLS.nova.ic = 'sk_nova'; SKILLS.strike.ic = 'sk_strike'; SKILLS.dodge.ic = 'sk_dodge';
Object.assign(SKILLS, {
  bolt: { n: 'Цепная молния', kind: 'Магический', unlock: 4, mp: 16, cd: 2.6, d: 'Молния бьёт цель и перескакивает на ближайших врагов.', ic: 'sk_bolt', col: '#ffee6a' },
  frost: { n: 'Ледяные иглы', kind: 'Магический', unlock: 5, mp: 18, cd: 3.2, d: 'Веер ледяных игл: урон и замедление.', ic: 'sk_frost', col: '#8ad8ff' },
  shield: { n: 'Магический щит', kind: 'Магический', unlock: 7, mp: 26, cd: 14, d: 'Поглощает урон на 8 секунд.', ic: 'sk_shield', col: '#9ab8ff' },
  meteor: { n: 'Метеор', kind: 'Магический', unlock: 12, mp: 44, cd: 16, d: 'Через секунду в точку курсора падает метеор. Большой урон по области.', ic: 'sk_meteor', col: '#ff6a2a' }
});
Object.keys(SKILLS).forEach(k => { SKILLS[k].id = k; });
HOTBAR.length = 0; ['fire', 'bolt', 'frost', 'whirl', 'heal', 'shield', 'nova', 'meteor'].forEach(k => HOTBAR.push(k));
SKILLS.fire.unlock = 1; SKILLS.heal.unlock = 2; SKILLS.whirl.unlock = 3;
// ключи для навыков (для подсказок в UI)
HOTBAR.forEach((id, i) => { SKILLS[id].key = i + 1; });
// магазины
const _stock = {}; Object.keys(SHOPS).forEach(k => { _stock[k] = SHOPS[k].stock; });
SHOPS.brogar.stock = () => _stock.brogar().concat(['axe_hand', 'spear_wood', 'hammer_smith']).concat(F('jungle_done') ? ['axe_battle', 'spear_iron', 'robe_apprentice', 'helm_horned'] : []).concat(F('fort_done') ? ['hammer_war', 'spear_halberd'] : []).concat(F('winter_done') ? ['axe_frost', 'spear_ice'] : []).concat(F('ash_done') ? ['axe_ash', 'hammer_ash'] : []);
SHOPS.liara.stock = () => _stock.liara().concat(['bag1', 'bow_short', 'wand_spark', 'dag_knife', 'scroll_fire']).concat(F('jungle_done') ? ['bow_long', 'dag_stiletto', 'potion_str', 'potion_def'] : []);
SHOPS.hasim.stock = () => _stock.hasim().concat(['bag2', 'bow_long', 'dag_stiletto', 'staff_fire', 'hood_mage', 'robe_arcane', 'armor_scale', 'potion_str', 'potion_def']);
SHOPS.rein.stock = () => _stock.rein().concat(['staff_storm', 'dag_viper', 'bow_elven', 'robe_arcane']);
SHOPS.skald.stock = () => _stock.skald().concat(['staff_frost', 'bow_frost', 'bag3', 'potion_str', 'potion_def']);
SHOPS.mirena.stock = () => _stock.mirena().concat(['potion_str', 'potion_def']);
