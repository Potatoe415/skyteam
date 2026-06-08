// UI string dictionary. Keys are language-neutral; the engine never imports this
// (it emits stable codes — see src/game). Use `{name}` tokens for interpolation.

export type Language = 'en' | 'fr'

export interface LanguageOption {
  code: Language
  label: string
  flag: string
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
]

export type Dict = Record<string, string>

const en: Dict = {
  // Start / splash screen
  'start.subtitle': 'Landing procedure · 2-player co-op',
  'start.language': 'Language',
  'start.pilot.title': 'PILOT',
  'start.pilot.sub': 'Blue dice · Gear · Brakes',
  'start.copilot.title': 'CO-PILOT',
  'start.copilot.sub': 'Orange dice · Flaps',
  'start.instructions':
    'Play together on one device. Each round: talk freely, roll the dice, then place them in silence, taking turns. Pass the phone to your teammate when it is their turn.',
  'start.button': 'Start the game',

  // Roles
  'role.pilot': 'Pilot',
  'role.copilot': 'Co-Pilot',

  // Status bar
  'status.round': 'Round {round}/7 · {altitude} ft',
  'status.dice': '{placed}/{total} dice',
  'status.briefing': 'Briefing',

  // Briefing overlay
  'briefing.title': 'Round {round} / 7',
  'briefing.altitude': 'Altitude: {altitude} ft',
  'briefing.strategy':
    'Discuss your strategy freely. The {role} starts. Do not reveal your dice values!',
  'briefing.silence': 'After the roll, total silence until the round ends.',
  'briefing.roll': '🎲 Roll the dice',

  // Handoff overlay
  'handoff.title': "{role}'s turn",
  'handoff.body':
    'Hand the device to the {role}. Do not show your dice to your teammate.',
  'handoff.reveal': 'I am the {role} — show my dice',

  // Round-end overlay
  'roundEnd.title': 'Round complete',
  'roundEnd.position': 'Position: {pos} / {airport}',
  'roundEnd.axis': 'Axis: {axis}',
  'roundEnd.resources': 'Coffee: {coffee} · Rerolls: {rerolls}',
  'roundEnd.next': 'Next round ⤵',

  // Result overlay
  'result.won': 'Landing successful!',
  'result.lost': 'Failure',
  'result.restart': 'Play again',

  // Loss reasons (engine codes)
  'loss.spin': 'Spin-out! The axis hit the red limit.',
  'loss.collision': 'Collision! A plane was on your position.',
  'loss.overshoot': 'Overshoot! You flew past the airport.',
  'loss.mandatory': 'Mandatory placements missing (Axis / Engines).',
  'loss.notReached': 'Approach missed: the airport was not reached in time.',
  'loss.landing': 'Botched landing.',

  // Landing checks (engine codes)
  'check.traffic': 'traffic cleared',
  'check.gear': 'landing gear down',
  'check.flaps': 'flaps deployed',
  'check.axis': 'wings level',
  'check.speed': 'speed < brakes',

  // Dice tray
  'tray.dice': "🎲 {role}'s dice",
  'tray.chooseReroll': 'Choose the dice to reroll',
  'tray.chooseDie': 'Choose a die',
  'tray.allPlaced': 'All your dice are placed.',
  'tray.reroll': 'Reroll {n} die(s)',
  'tray.coffeeUsed': '☕ {n} used',
  'tray.placeHint': 'Tap a green slot to place the die.',

  // Panels
  'panel.concentration': '🧠 CONCENTRATION',
  'panel.radio': '📻 RADIO',
  'panel.gear': '🛞 GEAR',
  'panel.brakes': '🛑 BRAKES',
  'panel.flaps': '🪶 FLAPS',
  'panel.altitude': 'ALTITUDE',
  'panel.approach': 'YUL · APPROACH',
  'panel.axis': 'AXIS ✶',
  'panel.engines': 'ENGINES ✶',
  'resources.reroll': '🔄 Reroll ({n})',

  // Speed gauge
  'speed.title': 'SPEED / AERODYNAMICS',
  'speed.engines': 'Engines: {speed}',
  'speed.threshold': 'Threshold {label}: {pos}',
  'speed.gear': 'gear',
  'speed.flaps': 'flaps',

  // Axis dial
  'axis.label': 'Axis: {axis}',

  // Altitude / approach
  'altitude.rerollToken': 'Reroll token',
  'approach.runway': 'RUNWAY',
  'approach.currentPos': 'Current position',

  // Dice / slots (accessibility)
  'die.hidden': 'hidden die',
  'die.face': '{role} die showing {value}',
  'slot.aria': 'slot {id}',
}

const fr: Dict = {
  'start.subtitle': "Procédure d'atterrissage · 2 joueurs en coopération",
  'start.language': 'Langue',
  'start.pilot.title': 'PILOTE',
  'start.pilot.sub': 'Dés bleus · Train · Freins',
  'start.copilot.title': 'COPILOTE',
  'start.copilot.sub': 'Dés orange · Volets',
  'start.instructions':
    "Jouez à deux sur le même appareil. À chaque manche : discutez, lancez les dés, puis placez-les en silence à tour de rôle. Passez le téléphone à votre coéquipier quand c'est son tour.",
  'start.button': 'Commencer la partie',

  'role.pilot': 'Pilote',
  'role.copilot': 'Copilote',

  'status.round': 'Manche {round}/7 · {altitude} ft',
  'status.dice': '{placed}/{total} dés',
  'status.briefing': 'Briefing',

  'briefing.title': 'Manche {round} / 7',
  'briefing.altitude': 'Altitude : {altitude} ft',
  'briefing.strategy':
    'Discutez votre stratégie librement. Le {role} commence. Interdit de parler des valeurs de dés !',
  'briefing.silence': "Après le lancer, silence total jusqu'à la fin de la manche.",
  'briefing.roll': '🎲 Lancer les dés',

  'handoff.title': 'Au tour du {role}',
  'handoff.body':
    "Passez l'appareil au {role}. Ne montrez pas vos dés à votre coéquipier.",
  'handoff.reveal': 'Je suis le {role} — voir mes dés',

  'roundEnd.title': 'Manche terminée',
  'roundEnd.position': 'Position : {pos} / {airport}',
  'roundEnd.axis': 'Axe : {axis}',
  'roundEnd.resources': 'Café : {coffee} · Relances : {rerolls}',
  'roundEnd.next': 'Manche suivante ⤵',

  'result.won': 'Atterrissage réussi !',
  'result.lost': 'Échec',
  'result.restart': 'Rejouer',

  'loss.spin': "Vrille ! L'axe a atteint la limite rouge.",
  'loss.collision': 'Collision ! Un avion se trouvait sur votre position.',
  'loss.overshoot': "Dépassement ! Vous avez dépassé l'aéroport.",
  'loss.mandatory': 'Placements obligatoires manquants (Axe / Moteurs).',
  'loss.notReached': "Approche manquée : l'aéroport n'a pas été atteint à temps.",
  'loss.landing': 'Atterrissage raté.',

  'check.traffic': 'trafic dégagé',
  'check.gear': 'train sorti',
  'check.flaps': 'volets sortis',
  'check.axis': 'avion horizontal',
  'check.speed': 'vitesse < freins',

  'tray.dice': '🎲 Dés du {role}',
  'tray.chooseReroll': 'Choisissez les dés à relancer',
  'tray.chooseDie': 'Choisissez un dé',
  'tray.allPlaced': 'Tous vos dés sont placés.',
  'tray.reroll': 'Relancer {n} dé(s)',
  'tray.coffeeUsed': '☕ {n} utilisé(s)',
  'tray.placeHint': 'Touchez un emplacement vert pour poser le dé.',

  'panel.concentration': '🧠 CONCENTRATION',
  'panel.radio': '📻 RADIO',
  'panel.gear': '🛞 TRAIN',
  'panel.brakes': '🛑 FREINS',
  'panel.flaps': '🪶 VOLETS',
  'panel.altitude': 'ALTITUDE',
  'panel.approach': 'NZIR · APPROCHE',
  'panel.axis': 'AXE ✶',
  'panel.engines': 'MOTEURS ✶',
  'resources.reroll': '🔄 Relance ({n})',

  'speed.title': 'VITESSE / AÉRODYNAMISME',
  'speed.engines': 'Moteurs : {speed}',
  'speed.threshold': 'Seuil {label} : {pos}',
  'speed.gear': 'train',
  'speed.flaps': 'volets',

  'axis.label': 'Axe : {axis}',

  'altitude.rerollToken': 'Jeton de relance',
  'approach.runway': 'PISTE',
  'approach.currentPos': 'Position actuelle',

  'die.hidden': 'dé caché',
  'die.face': 'dé {role} valeur {value}',
  'slot.aria': 'emplacement {id}',
}

export const MESSAGES: Record<Language, Dict> = { en, fr }
