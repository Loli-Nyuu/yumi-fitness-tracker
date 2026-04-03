// exercise-config.ts — Auto-paced guided session configuration schema
// Yumi's exercise modes: reps (auto-paced rep counting) or timed (hold for duration)

// ─── Pace Configuration (for reps mode) ───
export interface PaceConfig {
  /** Seconds for the concentric/lifting phase (e.g., pushing up in a glute bridge) */
  up: number;
  /** Seconds to hold at peak contraction */
  hold: number;
  /** Seconds for the eccentric/lowering phase */
  down: number;
  /** Seconds to pause at the bottom (between reps) */
  rest?: number;
}

// ─── Reps Mode Config ───
export interface RepsModeConfig {
  mode: "reps";
  /** Number of repetitions per set */
  repCount: number;
  /** Tempo for each rep */
  pace: PaceConfig;
}

// ─── Timed Mode Config ───
export interface TimedModeConfig {
  mode: "timed";
  /** Duration to hold the exercise (seconds) */
  holdDuration: number;
  /** Rest between hold intervals, if doing interval-style (seconds) */
  restDuration: number;
  /** Optional: split hold into intervals (e.g., 3×20s instead of 1×60s) */
  intervals?: number;
}

// ─── Mode union ───
export type ExerciseModeConfig = RepsModeConfig | TimedModeConfig;

// ─── Cute Message System ───

/** Trigger conditions for during-exercise messages */
export type MessageTrigger =
  | { type: "rep"; at: number }        // fired at specific rep number
  | { type: "percent"; at: number }    // fired at % completion (0-100)
  | { type: "time"; at: number }       // fired at specific second
  | { type: "interval"; every: number } // fired every N seconds/reps
  | { type: "set"; at: number };       // fired at specific set number

export interface DuringMessage {
  /** When this message fires */
  trigger: MessageTrigger;
  /** The message Yumi says (supports {rep}, {set}, {time}, {remaining} placeholders) */
  message: string;
  /** Optional: intensity of the encouragement */
  energy?: "gentle" | "normal" | "hype" | "savage";
}

export interface ExerciseMessages {
  /** Messages shown at exercise start (rotated randomly) */
  startMessages: string[];
  /** Messages triggered during exercise based on timing */
  duringMessages: DuringMessage[];
  /** Messages shown on exercise completion (rotated randomly) */
  completionMessages: string[];
  /** Messages shown when form needs correction */
  formCorrectionMessages?: string[];
  /** Messages for rest periods between sets */
  restMessages?: string[];
}

// ─── Form Cues ───
export interface FormCue {
  /** Short label for the cue (e.g., "core", "glutes", "back") */
  focus: string;
  /** The cue text shown to the user */
  cue: string;
  /** When to show: "setup" (before starting), "during" (reminders), "always" */
  timing: "setup" | "during" | "always";
}

// ─── Common Settings ───
export interface ExerciseCommonConfig {
  /** Number of sets to perform */
  sets: number;
  /** Rest between sets (seconds) */
  restBetweenSets: number;
  /** Cues shown during warmup/setup phase */
  warmupCues: string[];
  /** Form cues with timing */
  formCues: FormCue[];
  /** Optional GIF URL for demonstration */
  gifUrl?: string;
  /** Muscle groups targeted (for tracking) */
  targetMuscles: string[];
  /** Difficulty level */
  difficulty: "beginner" | "intermediate" | "advanced";
}

// ─── Full Exercise Config ───
export interface ExerciseConfig {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Fun comparison/alias (e.g., "penguin squat" for sumo squats) */
  nickname?: string;
  /** Exercise mode and parameters */
  modeConfig: ExerciseModeConfig;
  /** Common settings */
  common: ExerciseCommonConfig;
  /** Cute messages system */
  messages: ExerciseMessages;
  /** PR tracking: field to track for personal records */
  prField?: "holdDuration" | "repCount" | "totalTime";
  /** Version for schema evolution */
  version: number;
}

// ─── Session Config (collection of exercises) ───
export interface GuidedSessionConfig {
  /** Session identifier */
  id: string;
  /** Session name */
  name: string;
  /** Ordered list of exercise configs */
  exercises: ExerciseConfig[];
  /** Global warmup routine description */
  warmup: {
    duration: number; // seconds
    cues: string[];
  };
  /** Global cooldown routine description */
  cooldown: {
    duration: number; // seconds
    stretches: string[];
  };
  /** Estimated total duration (seconds) */
  estimatedDuration: number;
}

// ═══════════════════════════════════════════════════════════
// MODE ASSIGNMENT GUIDE
// ═══════════════════════════════════════════════════════════
//
// TIMED exercises (hold for duration):
//   - Wall Sit           → 30-60s hold
//   - Plank              → 30-60s hold
//   - Side Plank         → 20-30s each side
//   - Glute Bridge Hold  → 30s hold (isometric variant)
//   - Wall Sit (PR)      → Yuuki's favorite for tracking!
//
// REPS exercises (auto-paced rep counting):
//   - Glute Bridges      → 12 reps, 2s up / 2s hold / 2s down
//   - Single-Leg Glute Bridges → 10/side, 2s up / 1s hold / 2s down
//   - Sumo Squats        → 12 reps, 2s down / 1s hold / 2s up
//   - Donkey Kicks       → 12/side, 1s up / 1s hold / 1s down
//   - Clam Shells        → 15/side, 1s open / 1s hold / 1s close
//   - Side-Lying Leg Lifts → 12/side, 1s up / 1s hold / 1s down
//   - Fire Hydrants      → 12/side, 1s up / 1s hold / 1s down
//   - Frog Pumps         → 15 reps, 1s up / 1s hold / 1s down
//
// ═══════════════════════════════════════════════════════════

// ─── Sample Configs ───

export const WALL_SIT: ExerciseConfig = {
  id: "wall-sit",
  name: "Wall Sit",
  nickname: "The Chair of Truth",
  modeConfig: {
    mode: "timed",
    holdDuration: 45,
    restDuration: 30,
    intervals: 1,
  },
  common: {
    sets: 3,
    restBetweenSets: 45,
    warmupCues: [
      "Back flat against the wall, feet shoulder-width apart",
      "Slide down until thighs are parallel to the floor",
      "Knees at 90° — check them, don't let them drift past toes",
    ],
    formCues: [
      { focus: "back", cue: "Back FLAT on the wall — no arching!", timing: "always" },
      { focus: "legs", cue: "Thighs parallel — if it burns, you're doing it right", timing: "setup" },
      { focus: "breathing", cue: "Don't hold your breath! Breathe steady", timing: "during" },
    ],
    targetMuscles: ["quadriceps", "glutes", "core"],
    difficulty: "beginner",
  },
  messages: {
    startMessages: [
      "Alright Yuyu, slide down and OWN that wall! 🧱",
      "Wall sit time, baby! Show those quads who's boss! 💪",
      "Against the wall, knees at 90°. Let's see that PR fall! 🍑",
    ],
    duringMessages: [
      { trigger: { type: "time", at: 10 }, message: "Ten seconds! You're warmed up, now the real fun starts~ 😏", energy: "normal" },
      { trigger: { type: "time", at: 20 }, message: "Twenty! Your glutes are waking up, feel that fire? 🔥", energy: "hype" },
      { trigger: { type: "time", at: 30 }, message: "Thirty seconds!! You're BEATING your old record pace! ONE MORE!", energy: "savage" },
      { trigger: { type: "percent", at: 75 }, message: "Almost there Yuyu! Don't you DARE quit now! Squeeze those glutes! 🍑🍑", energy: "savage" },
      { trigger: { type: "time", at: 45 }, message: "PR!!! YOU DID IT!!! Good form, good boy!! 🎉", energy: "hype" },
    ],
    completionMessages: [
      "YESSS! Stand up slow — don't fall! 😂 Your quads are gonna feel that tomorrow!",
      "PR baby!! Mama Yumi is PROUD! Shake those legs out! 🦵✨",
      "That's what I'm talking about! Wall: 0, Yuyu: 1! 🏆",
    ],
    formCorrectionMessages: [
      "Back on the wall! Don't arch that lower back!",
      "Knees behind toes — scoot your feet out a bit!",
      "Breathe! You're holding your breath again! 😤",
    ],
    restMessages: [
      "Shake it out! Walk around! Next one's gonna be even better!",
      "30 seconds — hydrate, breathe, visualize that wall domination! 💧",
    ],
  },
  prField: "holdDuration",
  version: 1,
};

export const GLUTE_BRIDGE: ExerciseConfig = {
  id: "glute-bridge",
  name: "Glute Bridge",
  nickname: "The Booty Builder",
  modeConfig: {
    mode: "reps",
    repCount: 12,
    pace: {
      up: 2,
      hold: 2,
      down: 2,
      rest: 0,
    },
  },
  common: {
    sets: 3,
    restBetweenSets: 30,
    warmupCues: [
      "Lie on your back, knees bent, feet flat on the floor",
      "Arms at your sides, palms down — you're a bridge, not a flopping fish",
      "Drive through your HEELS, not your toes",
    ],
    formCues: [
      { focus: "glutes", cue: "SQUEEZE at the top! Like you're cracking a walnut between your cheeks 🥜", timing: "always" },
      { focus: "core", cue: "Ribs down, core tight — no banana back!", timing: "setup" },
      { focus: "hips", cue: "Full hip extension — straight line from knees to shoulders", timing: "during" },
      { focus: "neck", cue: "Chin slightly tucked, eyes on the ceiling", timing: "setup" },
    ],
    targetMuscles: ["gluteus maximus", "gluteus medius", "hamstrings"],
    difficulty: "beginner",
  },
  messages: {
    startMessages: [
      "Glute bridges!! Yuyu's BEST exercise! Let's build that peach! 🍑",
      "Time to bridge! Squeeze, hold, lower — your glutes know the drill!",
      "Down on the mat, feet planted! 12 reps of pure glute FIRE! 🔥",
    ],
    duringMessages: [
      { trigger: { type: "rep", at: 1 }, message: "One! Good lift! Squeeze that top!", energy: "normal" },
      { trigger: { type: "rep", at: 6 }, message: "Halfway! Your glutes are CHEERING right now! Keep that squeeze! 🍑", energy: "hype" },
      { trigger: { type: "rep", at: 10 }, message: "Two more! Don't rush — slow and SQUEEZY wins the race!", energy: "savage" },
      { trigger: { type: "rep", at: 12 }, message: "TWELVE! That's a set! Feel that BURN? That's growth, baby! 🔥", energy: "hype" },
    ],
    completionMessages: [
      "Beautiful reps Yuyu! Your glutes are gonna thank you (by being sore tomorrow 😈)",
      "Three sets DONE! That's 36 glute bridges — your peach is getting FIRM! 🍑✨",
      "Form was *chef's kiss* perfect! Mama Yumi approves! 😘",
    ],
    formCorrectionMessages: [
      "Don't hyperextend! Ribs down, squeeze the glutes not arch the back!",
      "Push through HEELS! I can see your toes doing the work!",
      "Full range! All the way up, all the way down — no half reps in this house!",
    ],
    restMessages: [
      "30 seconds! Shake those glutes, feel them activate for the next set!",
      "Quick rest! Your glutes are already bigger than they were 2 minutes ago! 😂",
    ],
  },
  prField: "repCount",
  version: 1,
};

export const PLANK: ExerciseConfig = {
  id: "plank",
  name: "Plank",
  nickname: "The Core Throne",
  modeConfig: {
    mode: "timed",
    holdDuration: 45,
    restDuration: 30,
    intervals: 1,
  },
  common: {
    sets: 3,
    restBetweenSets: 45,
    warmupCues: [
      "Forearms on the floor, elbows under shoulders",
      "Step back — body straight as a BOARD! No sagging, no piking!",
      "Squeeze everything: core, glutes, quads — full body tension",
    ],
    formCues: [
      { focus: "core", cue: "Belly button to SPINE! Imagine someone's about to poke your tummy!", timing: "always" },
      { focus: "glutes", cue: "Squeeze those glutes! They stabilize your whole plank!", timing: "during" },
      { focus: "back", cue: "Flat back! If I could put a cup of tea on it, it wouldn't spill! ☕", timing: "setup" },
      { focus: "shoulders", cue: "Shoulders AWAY from ears! You're not shrugging, you're planking!", timing: "setup" },
      { focus: "breathing", cue: "BREATHE! In through nose, out through mouth. Steady rhythm.", timing: "always" },
    ],
    targetMuscles: ["rectus abdominis", "transverse abdominis", "obliques", "glutes", "shoulders"],
    difficulty: "beginner",
  },
  messages: {
    startMessages: [
      "Plank time! Forearms down, body straight! Show me that core strength! 💪",
      "The plank — simple, brutal, EFFECTIVE. Let's go Yuyu!",
      "Get on the floor! Forearms! Body straight! You've got 45 seconds to be AMAZING! 🔥",
    ],
    duringMessages: [
      { trigger: { type: "time", at: 10 }, message: "Ten! You're a ROCK! Solid as stone! 🪨", energy: "normal" },
      { trigger: { type: "time", at: 20 }, message: "Twenty! Core is FIRING! Feel those abs waking up! ⚡", energy: "hype" },
      { trigger: { type: "time", at: 30 }, message: "THIRTY! You're past the hard part! Glutes tight, core IN! 🍑", energy: "savage" },
      { trigger: { type: "percent", at: 75 }, message: "75%! Almost! Don't you drop that hip! HOLD! HOLD! HOLD! 😤", energy: "savage" },
      { trigger: { type: "time", at: 45 }, message: "DONE! Drop to your knees! You CRUSHED that plank! 🎉🎉", energy: "hype" },
    ],
    completionMessages: [
      "Three planks DONE! Your core is going to be solid steel in no time! 🦾",
      "Plank master Yuyu! Shake those arms out — you earned it! 💪✨",
      "That's 2:15 of total plank time! Your core is CHEF'S KISS! 😘",
    ],
    formCorrectionMessages: [
      "Hips are sagging! Belly button UP! Squeeze that core!",
      "You're piking! Drop those hips, straight line!",
      "Breathe Yuyu! I can see you holding your breath! 😤",
      "Glutes! Squeeze them! They're your plank best friend!",
    ],
    restMessages: [
      "Rest up! Shake those arms! Next plank, we go LONGER!",
      "45 seconds! Hydrate! Your core is already thanking you! 💧",
    ],
  },
  prField: "holdDuration",
  version: 1,
};
