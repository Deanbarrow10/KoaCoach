let xp = 0;
let level = 0;

export function addXP(page) {
  xp += 10;
  level = Math.floor(xp / 50);
  console.log(`Visited ${page}. XP is now ${xp}, level is ${level}`);
}

export function getXP() {
  return xp;
}

export function getLevel() {
  return level;
}
