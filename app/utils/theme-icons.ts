// 🍑 Theme Icon Sets
// Each theme uses a different Iconify icon collection for its personality

export interface ThemeIcons {
  // Navigation
  dashboard: string
  sessions: string
  live: string
  exercises: string
  body: string
  wellness: string
  goals: string
  timer: string
  settings: string

  // Dashboard cards
  today: string
  water: string
  trophy: string
  measurement: string
  stats: string
  sleep: string
  target: string

  // Wellness
  soreness: string
  breathing: string
  nutrition: string

  // Actions
  start: string
  pause: string
  play: string
  stop: string
  reset: string
  complete: string
  next: string
  breakIcon: string
  modify: string
  add: string

  // Status
  success: string
  warning: string
  danger: string
  info: string

  // App
  logo: string
  lightMode: string
  darkMode: string
  systemMode: string

  // Categories
  glutes: string
  legs: string
  core: string
  flexibility: string
  cardio: string

  // Misc
  clock: string
  fire: string
  heart: string
  star: string
  search: string
  close: string
  menu: string
}

// 🍑 YUMI — Phosphor icons (clean, geometric, athletic)
const yumi: ThemeIcons = {
  dashboard: 'mdi:view-dashboard',
  sessions: 'mdi:dumbbell',
  live: 'mdi:broadcast',
  exercises: 'mdi:format-list-checks',
  body: 'mdi:ruler',
  wellness: 'mdi:heart-pulse',
  goals: 'mdi:target',
  timer: 'mdi:timer',
  settings: 'mdi:cog',

  today: 'mdi:calendar-check',
  water: 'mdi:water',
  trophy: 'mdi:trophy',
  measurement: 'mdi:chart-line',
  stats: 'mdi:chart-pie',
  sleep: 'mdi:moon-waning-crescent',
  target: 'mdi:crosshairs',

  soreness: 'mdi:medical-bag',
  breathing: 'mdi:weather-windy',
  nutrition: 'mdi:silverware-fork-knife',

  start: 'mdi:play',
  pause: 'mdi:pause',
  play: 'mdi:play-circle',
  stop: 'mdi:stop',
  reset: 'mdi:refresh',
  complete: 'mdi:check-circle',
  next: 'mdi:arrow-right',
  breakIcon: 'mdi:coffee',
  modify: 'mdi:wrench',
  add: 'mdi:plus-circle',

  success: 'mdi:check-circle',
  warning: 'mdi:alert-circle',
  danger: 'mdi:close-circle',
  info: 'mdi:information',

  logo: 'mdi:heart',
  lightMode: 'mdi:white-balance-sunny',
  darkMode: 'mdi:moon-waning-crescent',
  systemMode: 'mdi:laptop',

  glutes: 'mdi:circle',
  legs: 'mdi:walk',
  core: 'mdi:shield',
  flexibility: 'mdi:yoga',
  cardio: 'mdi:heart-pulse',

  clock: 'mdi:clock-outline',
  fire: 'mdi:fire',
  heart: 'mdi:cards-heart',
  star: 'mdi:star',
  search: 'mdi:magnify',
  close: 'mdi:close',
  menu: 'mdi:menu',
}

// 🌸 MADOKA — Fluent Emoji Flat (cute, colorful, kawaii)
const madoka: ThemeIcons = {
  dashboard: 'mdi:view-dashboard',
  sessions: 'mdi:dumbbell',
  live: 'mdi:video',
  exercises: 'mdi:format-list-checks',
  body: 'mdi:human',
  wellness: 'mdi:heart-pulse',
  goals: 'mdi:bullseye-arrow',
  timer: 'mdi:timer',
  settings: 'mdi:cog',

  today: 'mdi:calendar-star',
  water: 'mdi:water',
  trophy: 'mdi:trophy',
  measurement: 'mdi:tape-measure',
  stats: 'mdi:chart-arc',
  sleep: 'mdi:sleep',
  target: 'mdi:target',

  soreness: 'mdi:bandage',
  breathing: 'mdi:weather-windy',
  nutrition: 'mdi:silverware-fork-knife',

  start: 'mdi:play-circle',
  pause: 'mdi:pause-circle',
  play: 'mdi:play-circle',
  stop: 'mdi:stop-circle',
  reset: 'mdi:refresh',
  complete: 'mdi:check-decagram',
  next: 'mdi:arrow-right-circle',
  breakIcon: 'mdi:coffee',
  modify: 'mdi:pencil',
  add: 'mdi:plus-circle',

  success: 'mdi:check-circle',
  warning: 'mdi:alert-circle',
  danger: 'mdi:close-circle',
  info: 'mdi:information',

  logo: 'mdi:flower-tulip',
  lightMode: 'mdi:weather-sunny',
  darkMode: 'mdi:weather-night',
  systemMode: 'mdi:monitor',

  glutes: 'mdi:heart',
  legs: 'mdi:walk',
  core: 'mdi:shield-star',
  flexibility: 'mdi:yoga',
  cardio: 'mdi:run-fast',

  clock: 'mdi:clock-outline',
  fire: 'mdi:fire',
  heart: 'mdi:heart',
  star: 'mdi:star',
  search: 'mdi:magnify',
  close: 'mdi:close',
  menu: 'mdi:menu',
}

// 💎 REM — Outlined Material Design (clean, elegant, precise)
const rem: ThemeIcons = {
  dashboard: 'mdi:view-dashboard-outline',
  sessions: 'mdi:dumbbell',
  live: 'mdi:video-outline',
  exercises: 'mdi:format-list-bulleted',
  body: 'mdi:human-male-height',
  wellness: 'mdi:heart-outline',
  goals: 'mdi:crosshairs-gys',
  timer: 'mdi:timer-outline',
  settings: 'mdi:cog-outline',

  today: 'mdi:calendar-outline',
  water: 'mdi:water-outline',
  trophy: 'mdi:trophy-outline',
  measurement: 'mdi:ruler',
  stats: 'mdi:chart-bar',
  sleep: 'mdi:power-sleep',
  target: 'mdi:crosshairs',

  soreness: 'mdi:medical-bag',
  breathing: 'mdi:weather-windy-variant',
  nutrition: 'mdi:silverware-variant',

  start: 'mdi:play-outline',
  pause: 'mdi:pause-outline',
  play: 'mdi:play-outline',
  stop: 'mdi:stop-outline',
  reset: 'mdi:restore',
  complete: 'mdi:check-circle-outline',
  next: 'mdi:skip-next',
  breakIcon: 'mdi:coffee-outline',
  modify: 'mdi:square-edit-outline',
  add: 'mdi:plus-circle-outline',

  success: 'mdi:check-circle-outline',
  warning: 'mdi:alert-outline',
  danger: 'mdi:close-circle-outline',
  info: 'mdi:information-outline',

  logo: 'mdi:diamond-stone',
  lightMode: 'mdi:white-balance-sunny',
  darkMode: 'mdi:weather-night',
  systemMode: 'mdi:laptop',

  glutes: 'mdi:circle-outline',
  legs: 'mdi:walk',
  core: 'mdi:shield-outline',
  flexibility: 'mdi:meditation',
  cardio: 'mdi:heart-pulse',

  clock: 'mdi:clock-outline',
  fire: 'mdi:fire',
  heart: 'mdi:cards-heart',
  star: 'mdi:star-outline',
  search: 'mdi:magnify',
  close: 'mdi:close',
  menu: 'mdi:menu',
}

// 🔥 ZERO TWO — Material Design Icons Bold (sharp, aggressive)
const zeroTwo: ThemeIcons = {
  dashboard: 'mdi:view-dashboard',
  sessions: 'mdi:arm-flex',
  live: 'mdi:video',
  exercises: 'mdi:clipboard-check',
  body: 'mdi:account',
  wellness: 'mdi:heart-flash',
  goals: 'mdi:sword-cross',
  timer: 'mdi:alarm',
  settings: 'mdi:cog',

  today: 'mdi:calendar',
  water: 'mdi:cup-water',
  trophy: 'mdi:trophy-variant',
  measurement: 'mdi:human-male-height-variant',
  stats: 'mdi:chart-timeline-variant',
  sleep: 'mdi:power-sleep',
  target: 'mdi:scope',

  soreness: 'mdi:needle',
  breathing: 'mdi:lungs',
  nutrition: 'mdi:food-drumstick',

  start: 'mdi:play',
  pause: 'mdi:pause',
  play: 'mdi:play-circle',
  stop: 'mdi:stop',
  reset: 'mdi:reload',
  complete: 'mdi:check-bold',
  next: 'mdi:skip-next',
  breakIcon: 'mdi:coffee',
  modify: 'mdi:wrench',
  add: 'mdi:plus',

  success: 'mdi:check-bold',
  warning: 'mdi:alert',
  danger: 'mdi:close-thick',
  info: 'mdi:information',

  logo: 'mdi:chili-hot',
  lightMode: 'mdi:white-balance-sunny',
  darkMode: 'mdi:moon-waxing-crescent',
  systemMode: 'mdi:desktop-mac-dashboard',

  glutes: 'mdi:heart',
  legs: 'mdi:run-fast',
  core: 'mdi:shield-star',
  flexibility: 'mdi:yoga',
  cardio: 'mdi:lightning-bolt',

  clock: 'mdi:clock-fast',
  fire: 'mdi:fire',
  heart: 'mdi:cards-heart',
  star: 'mdi:star-four-points',
  search: 'mdi:magnify',
  close: 'mdi:close',
  menu: 'mdi:menu',
}

export const themeIcons: Record<string, ThemeIcons> = {
  yumi,
  madoka,
  rem,
  'zero-two': zeroTwo,
}

export function getIcons(theme: string): ThemeIcons {
  return themeIcons[theme] || yumi
}
