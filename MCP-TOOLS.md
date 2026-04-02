# 🍑 Yumi Fitness Tracker — MCP Tool Reference

> All endpoints Yumi can call from OpenClaw sessions.

## Base URL: `http://localhost:3000`

---

## 💧 Fluids

### Read Today's Intake
```
GET /api/fluids
```
Returns: entries, summary (byType, totalMl, effectiveMl, percentComplete)

### Log a Drink
```
POST /api/fluids
Body: { type: "water"|"coffee"|"tea"|"juice"|"soda"|"other", amountMl: 250 }
```

### Set Exact Count (replace all of a type)
```
POST /api/fluids
Body: { action: "set_type", type: "coffee", count: 3, ml: 300 }
```

### Delete All of a Type
```
POST /api/fluids
Body: { action: "delete_type", type: "soda" }
```

### Edit a Single Entry
```
PATCH /api/fluids
Body: { id: 5, type: "coffee", amountMl: 300 }
```

### Delete a Single Entry
```
DELETE /api/fluids?id=5
```

---

## 😴 Sleep

### Read Sleep History (with daily summary)
```
GET /api/sleep
GET /api/sleep?date=2026-04-01
```
Returns: entries + todaySummary (sleepCount, napCount, totalSleepHours, totalNapHours, sleepScore)

### Log Sleep or Nap
```
POST /api/sleep
Body: { sleepType: "sleep"|"nap", quality: 4, hours: 7.5, date: "2026-04-01" }
```

### Delete Sleep Entry
```
DELETE /api/sleep?id=3
```

---

## 🤕 Soreness

### Read Soreness
```
GET /api/soreness
GET /api/soreness?today=true   (today only)
```

### Log Soreness
```
POST /api/soreness
Body: { bodyPart: "glutes", severity: 3 }
```
Body parts: glutes, quads, hamstrings, core, back, ankles

---

## 🍽️ Nutrition

### Read Nutrition Log
```
GET /api/nutrition
GET /api/nutrition?date=2026-04-01
```

### Log a Meal
```
POST /api/nutrition
Body: { mealType: "lunch", description: "Chicken and rice", protein: 45 }
```
Meal types: breakfast, lunch, dinner, snack, pre_workout, post_workout

---

## 📊 Dashboard

### Full Dashboard
```
GET /api/dashboard
```
Returns: today's session, water, PRs, body measurements, sleep, goals, weekly stats

---

## 🏋️ Sessions

### List Sessions
```
GET /api/sessions
```

### Create Session
```
POST /api/sessions
Body: { date: "2026-04-01", type: "morning", durationPlanned: 20 }
```

---

## 📏 Body

### Read Measurements
```
GET /api/body
GET /api/body?latest=true
```

### Log Measurement
```
POST /api/body
Body: { weight: 68, waist: 76, hip: 88 }
```

---

## 📝 Notes (Yumi's Coaching Notes)

### Read Notes
```
GET /api/notes
GET /api/notes?visibility=shared
GET /api/notes?sessionId=5
```

### Create Note
```
POST /api/notes
Body: { content: "Great form today!", visibility: "shared", category: "encouragement" }
```

---

## 🎯 Goals

### Read Goals
```
GET /api/goals
GET /api/goals?status=active
```

### Create Goal
```
POST /api/goals
Body: { type: "pr", description: "60-sec wall sit", targetValue: 60, targetUnit: "seconds", currentValue: 56 }
```
