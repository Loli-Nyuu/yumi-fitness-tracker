import { useDB } from './index'
import { exercises } from './schema'

const db = useDB()

const newExercises = [
  // --- GLUTES ---
  {
    name: "Glute Bridge",
    slug: "glute-bridge",
    category: "glutes",
    musclePrimary: "gluteus maximus",
    muscleSecondary: "hamstrings, core",
    gifUrl: "https://www.inspireusafoundation.org/wp-content/uploads/2022/01/glute-bridge.gif",
    description: "Lie on your back, knees bent, feet flat. Push hips up, squeeze at top.",
    kidFriendlyTip: "Teddy bear bridge! Push your tummy to the sky and squeeze a coin between your cheeks! 🧸",
    isAnkleSafe: true,
    equipment: "mat",
    preference: "loved",
    pattern: "reps",
    defaultsJson: JSON.stringify({
      repCount: 15,
      setCount: 3,
      phaseDurations: { concentric: 2, isometric: 2, eccentric: 2 },
      restBetweenSets: 60,
      countdownSeconds: 5
    }),
    tagsJson: JSON.stringify({
      categories: ["strength", "activation", "pre-training"],
      positions: ["lying_supine"],
      difficulty: "beginner",
      goals: ["muscle_building", "aesthetic", "pain_relief"]
    }),
    formCuesJson: JSON.stringify([
      { text: "Keep ribs down, don't arch back", timing: "during" },
      { text: "Squeeze glutes hard at the top", timing: "during" },
      { text: "Drive through heels", timing: "setup" }
    ])
  },
  {
    name: "Single-Leg Glute Bridge",
    slug: "single-leg-glute-bridge",
    category: "glutes",
    musclePrimary: "gluteus maximus",
    muscleSecondary: "gluteus medius, hamstrings",
    gifUrl: "https://www.inspireusafoundation.org/wp-content/uploads/2022/11/single-leg-glute-bridge.gif",
    description: "One foot up as kickstand, push through other heel. Squeeze at top.",
    kidFriendlyTip: "One-leg teddy bear! Put one foot up like a kickstand, push through the other heel. Squeeze that booty!",
    isAnkleSafe: true,
    equipment: "mat",
    preference: "loved",
    pattern: "reps",
    defaultsJson: JSON.stringify({
      repCount: 10,
      setCount: 3,
      phaseDurations: { concentric: 2, isometric: 2, eccentric: 2 },
      restBetweenSets: 60,
      countdownSeconds: 5
    }),
    tagsJson: JSON.stringify({
      categories: ["strength", "activation"],
      positions: ["lying_supine"],
      difficulty: "intermediate",
      goals: ["muscle_building", "balance"]
    }),
    formCuesJson: JSON.stringify([
      { text: "Keep hips level, don't tilt", timing: "during" },
      { text: "Kickstand foot just touches ground", timing: "setup" }
    ])
  },
  {
    name: "Frog Pumps",
    slug: "frog-pumps",
    category: "glutes",
    musclePrimary: "gluteus medius",
    muscleSecondary: "gluteus maximus",
    gifUrl: "https://www.inspireusafoundation.org/wp-content/uploads/2023/08/frog-pump.gif",
    description: "Soles together, knees wide. Push hips up and squeeze.",
    kidFriendlyTip: "Froggy bounce! Sit like a frog — soles together, knees wide. Push up and squeeze like jumping to a lily pad! 🐸",
    isAnkleSafe: true,
    equipment: "mat",
    preference: "loved",
    pattern: "reps",
    defaultsJson: JSON.stringify({
      repCount: 20,
      setCount: 3,
      phaseDurations: { concentric: 1, isometric: 1, eccentric: 1 },
      restBetweenSets: 45,
      countdownSeconds: 5
    }),
    tagsJson: JSON.stringify({
      categories: ["activation", "strength"],
      positions: ["lying_supine"],
      difficulty: "beginner",
      goals: ["aesthetic", "muscle_building"]
    }),
    formCuesJson: JSON.stringify([
      { text: "Keep chin tucked", timing: "setup" },
      { text: "Short pulses at the top", timing: "during" }
    ])
  },
  {
    name: "Sumo Squat",
    slug: "sumo-squat",
    category: "glutes",
    musclePrimary: "gluteus maximus",
    muscleSecondary: "quadriceps, adductors",
    gifUrl: "https://www.inspireusafoundation.org/wp-content/uploads/2022/11/sumo-squat.gif",
    description: "Wide stance, toes out. Squat down, push through heels.",
    kidFriendlyTip: "Penguin pose! Open your feet wide, toes pointing out. Sit your butt DOWN like a tiny chair! Stand up — squeeze! 🐧",
    isAnkleSafe: true,
    equipment: "none",
    preference: "loved",
    pattern: "reps",
    defaultsJson: JSON.stringify({
      repCount: 12,
      setCount: 3,
      phaseDurations: { concentric: 2, isometric: 0, eccentric: 3 },
      restBetweenSets: 90,
      countdownSeconds: 5
    }),
    tagsJson: JSON.stringify({
      categories: ["strength", "training"],
      positions: ["standing"],
      difficulty: "beginner",
      goals: ["muscle_building", "aesthetic"]
    }),
    formCuesJson: JSON.stringify([
      { text: "Knees track over toes", timing: "during" },
      { text: "Chest up, core tight", timing: "setup" }
    ])
  },
  {
    name: "Donkey Kicks",
    slug: "donkey-kicks",
    category: "glutes",
    musclePrimary: "gluteus maximus",
    muscleSecondary: "hamstrings",
    gifUrl: "https://www.inspireusafoundation.org/wp-content/uploads/2023/08/donkey-kick.gif",
    description: "On all fours, kick one leg up toward ceiling, keeping knee bent.",
    kidFriendlyTip: "Kitty cat kick! On hands and knees, kick your heel up to the sky like you're kicking a ball! 🐱",
    isAnkleSafe: true,
    equipment: "mat",
    preference: "loved",
    pattern: "reps",
    defaultsJson: JSON.stringify({
      repCount: 15,
      setCount: 3,
      phaseDurations: { concentric: 1, isometric: 2, eccentric: 2 },
      restBetweenSets: 60,
      countdownSeconds: 5
    }),
    tagsJson: JSON.stringify({
      categories: ["activation", "strength"],
      positions: ["kneeling"],
      difficulty: "beginner",
      goals: ["aesthetic", "muscle_building"]
    }),
    formCuesJson: JSON.stringify([
      { text: "Keep back flat, don't sag", timing: "during" },
      { text: "Press heel to ceiling", timing: "during" }
    ])
  },
  {
    name: "Clam Shells",
    slug: "clam-shells",
    category: "glutes",
    musclePrimary: "gluteus medius",
    muscleSecondary: "hip abductors",
    gifUrl: "https://www.inspireusafoundation.org/wp-content/uploads/2023/08/clamshell.gif",
    description: "Lie on side, knees bent. Keep feet together, open top knee like a clam.",
    kidFriendlyTip: "Clam shell open! Lie on your side, knees bent. Keep your feet kissing and open your top knee like a clam! 🐚",
    isAnkleSafe: true,
    equipment: "mat",
    preference: "loved",
    pattern: "reps",
    defaultsJson: JSON.stringify({
      repCount: 15,
      setCount: 3,
      phaseDurations: { concentric: 2, isometric: 1, eccentric: 2 },
      restBetweenSets: 45,
      countdownSeconds: 5
    }),
    tagsJson: JSON.stringify({
      categories: ["activation", "pre-training"],
      positions: ["lying_side"],
      difficulty: "beginner",
      goals: ["muscle_building", "pain_relief"]
    }),
    formCuesJson: JSON.stringify([
      { text: "Stack hips vertically", timing: "setup" },
      { text: "Don't roll backward", timing: "during" }
    ])
  },
  {
    name: "Side-Lying Leg Lifts",
    slug: "side-lying-leg-lifts",
    category: "glutes",
    musclePrimary: "gluteus medius",
    muscleSecondary: "hip abductors",
    gifUrl: "https://www.inspireusafoundation.org/wp-content/uploads/2023/08/side-lying-leg-raise.gif",
    description: "Lie on side, legs straight. Lift top leg up and lower slowly.",
    kidFriendlyTip: "Side leg lift! Lie on your side, legs straight. Lift your top leg up to the sky and lower it slowly! 🌟",
    isAnkleSafe: true,
    equipment: "mat",
    preference: "loved",
    pattern: "reps",
    defaultsJson: JSON.stringify({
      repCount: 15,
      setCount: 3,
      phaseDurations: { concentric: 2, isometric: 0, eccentric: 3 },
      restBetweenSets: 45,
      countdownSeconds: 5
    }),
    tagsJson: JSON.stringify({
      categories: ["strength", "activation"],
      positions: ["lying_side"],
      difficulty: "beginner",
      goals: ["aesthetic", "muscle_building"]
    }),
    formCuesJson: JSON.stringify([
      { text: "Toes slightly down, heel up", timing: "setup" },
      { text: "Lift from hip, not lower back", timing: "during" }
    ])
  },
  {
    name: "Fire Hydrants",
    slug: "fire-hydrants",
    category: "glutes",
    musclePrimary: "gluteus medius",
    muscleSecondary: "hip abductors",
    gifUrl: "https://www.inspireusafoundation.org/wp-content/uploads/2023/08/fire-hydrant.gif",
    description: "On all fours, lift one knee out to side, keeping 90-degree bend.",
    kidFriendlyTip: "Fire hydrant! On hands and knees, lift your knee out to the side like a doggy at a hydrant! 🐶",
    isAnkleSafe: true,
    equipment: "mat",
    preference: "loved",
    pattern: "reps",
    defaultsJson: JSON.stringify({
      repCount: 12,
      setCount: 3,
      phaseDurations: { concentric: 2, isometric: 1, eccentric: 2 },
      restBetweenSets: 60,
      countdownSeconds: 5
    }),
    tagsJson: JSON.stringify({
      categories: ["activation", "strength"],
      positions: ["kneeling"],
      difficulty: "beginner",
      goals: ["aesthetic", "muscle_building"]
    }),
    formCuesJson: JSON.stringify([
      { text: "Keep core tight, don't sag", timing: "during" },
      { text: "Lift knee to hip height", timing: "during" }
    ])
  },

  // --- TIMED / ISOMETRIC ---
  {
    name: "Wall Sit",
    slug: "wall-sit",
    category: "legs",
    musclePrimary: "quadriceps",
    muscleSecondary: "gluteus maximus, calves",
    gifUrl: "https://www.inspireusafoundation.org/wp-content/uploads/2023/08/wall-sit.gif",
    description: "Lean against wall, slide down until knees at 90 degrees. Hold.",
    kidFriendlyTip: "Invisible chair! Lean on the wall and sit down like there's a tiny chair under you! Hold it! 🪑",
    isAnkleSafe: true,
    equipment: "wall",
    preference: "loved",
    pattern: "timed",
    defaultsJson: JSON.stringify({
      holdDurationSeconds: 45,
      setCount: 3,
      restBetweenSets: 90,
      countdownSeconds: 5,
      allowFreeMode: true
    }),
    tagsJson: JSON.stringify({
      categories: ["strength", "endurance"],
      positions: ["wall"],
      difficulty: "intermediate",
      goals: ["strength", "endurance"]
    }),
    formCuesJson: JSON.stringify([
      { text: "Knees behind toes", timing: "setup" },
      { text: "Back flat against wall", timing: "during" }
    ])
  },
  {
    name: "Plank",
    slug: "plank",
    category: "core",
    musclePrimary: "core",
    muscleSecondary: "shoulders, glutes",
    gifUrl: "https://www.inspireusafoundation.org/wp-content/uploads/2023/08/plank.gif",
    description: "Forearms on ground, body in straight line from head to heels.",
    kidFriendlyTip: "Superhero plank! On your forearms, keep your body straight like a board! Don't let your tummy touch the floor! 🦸",
    isAnkleSafe: true,
    equipment: "mat",
    preference: "ok",
    pattern: "timed",
    defaultsJson: JSON.stringify({
      holdDurationSeconds: 30,
      setCount: 3,
      restBetweenSets: 60,
      countdownSeconds: 5,
      allowFreeMode: true
    }),
    tagsJson: JSON.stringify({
      categories: ["strength", "core"],
      positions: ["plank_position"],
      difficulty: "intermediate",
      goals: ["strength", "posture"]
    }),
    formCuesJson: JSON.stringify([
      { text: "Squeeze glutes and core", timing: "during" },
      { text: "Don't let hips sag", timing: "during" }
    ])
  },
  {
    name: "Glute Bridge Hold",
    slug: "glute-bridge-hold",
    category: "glutes",
    musclePrimary: "gluteus maximus",
    muscleSecondary: "hamstrings",
    gifUrl: "https://www.inspireusafoundation.org/wp-content/uploads/2022/01/glute-bridge.gif",
    description: "Hold the top position of a glute bridge. Squeeze continuously.",
    kidFriendlyTip: "Teddy bear freeze! Push your hips up and FREEZE! Squeeze that booty hard! 🧊",
    isAnkleSafe: true,
    equipment: "mat",
    preference: "loved",
    pattern: "timed",
    defaultsJson: JSON.stringify({
      holdDurationSeconds: 30,
      setCount: 3,
      restBetweenSets: 60,
      countdownSeconds: 5,
      allowFreeMode: true
    }),
    tagsJson: JSON.stringify({
      categories: ["activation", "strength"],
      positions: ["lying_supine"],
      difficulty: "beginner",
      goals: ["muscle_building", "aesthetic"]
    }),
    formCuesJson: JSON.stringify([
      { text: "Ribs down, don't arch", timing: "during" },
      { text: "Squeeze glutes 10/10 effort", timing: "during" }
    ])
  },

  // --- FLEXIBILITY / YOGA ---
  {
    name: "Happy Baby Pose",
    slug: "happy-baby-pose",
    category: "flexibility",
    musclePrimary: "hamstrings",
    muscleSecondary: "glutes, lower back",
    gifUrl: "https://www.inspireusafoundation.org/wp-content/uploads/2023/08/happy-baby-pose.gif",
    description: "Lie on back, grab feet, pull knees toward armpits.",
    kidFriendlyTip: "Happy baby! Lie on your back, grab your feet, and rock side to side like a happy baby! 👶",
    isAnkleSafe: true,
    equipment: "mat",
    preference: "loved",
    pattern: "timed",
    defaultsJson: JSON.stringify({
      holdDurationSeconds: 45,
      setCount: 1,
      restBetweenSets: 0,
      countdownSeconds: 5,
      allowFreeMode: false
    }),
    tagsJson: JSON.stringify({
      categories: ["stretching", "yoga", "post-training", "recovery"],
      positions: ["lying_supine"],
      difficulty: "beginner",
      goals: ["flexibility", "pain_relief"]
    }),
    formCuesJson: JSON.stringify([
      { text: "Lower back stays on floor", timing: "during" },
      { text: "Relax shoulders", timing: "during" }
    ])
  },
  {
    name: "Figure-4 Stretch",
    slug: "figure-4-stretch",
    category: "flexibility",
    musclePrimary: "gluteus medius",
    muscleSecondary: "piriformis, hips",
    gifUrl: "https://www.inspireusafoundation.org/wp-content/uploads/2023/08/figure-4-stretch.gif",
    description: "Lie on back, cross ankle over opposite knee, pull thigh toward chest.",
    kidFriendlyTip: "Figure four! Lie on your back, make a 4 with your legs, and pull gently! 🍑",
    isAnkleSafe: true,
    equipment: "mat",
    preference: "loved",
    pattern: "timed",
    defaultsJson: JSON.stringify({
      holdDurationSeconds: 30,
      setCount: 2,
      restBetweenSets: 10,
      countdownSeconds: 5,
      allowFreeMode: false
    }),
    tagsJson: JSON.stringify({
      categories: ["stretching", "recovery"],
      positions: ["lying_supine"],
      difficulty: "beginner",
      goals: ["flexibility", "pain_relief"]
    }),
    formCuesJson: JSON.stringify([
      { text: "Flex the foot of crossed leg", timing: "setup" },
      { text: "Keep head on floor", timing: "during" }
    ])
  }
]

export async function seedExercises() {
  console.log('🌱 Seeding exercises...')
  
  // Clear existing
  await db.delete(exercises)
  
  // Insert new
  for (const ex of newExercises) {
    await db.insert(exercises).values(ex)
  }
  
  console.log(`✅ Seeded ${newExercises.length} exercises`)
}
