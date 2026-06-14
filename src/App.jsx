import { useState, useEffect, useRef } from "react";
const PROFILES = [
  {
    id: "adhd",
    emoji: "🧠",
    label: "ADHD & Focus",
    tagline: "Executive function, structure & getting things done",
    color: "#a78bfa",
    accent: "#c4b5fd",
    bg: "#f2f0ff",
    tabs: ["checkin","journal","activities","breathe","night","reachout","safetyplan","moodboard","tools","history"],
    toolHighlight: "Goblin Tools, Focusmate & Tiimo are waiting for you in Tools.",
  },
  {
    id: "anxiety",
    emoji: "🌊",
    label: "Anxiety & Overwhelm",
    tagline: "Calm the spiral, breathe through it, find support",
    color: "#38bdf8",
    accent: "#7dd3fc",
    bg: "#edf6ff",
    tabs: ["checkin","breathe","night","journal","activities","reachout","safetyplan","moodboard","tools","history"],
    toolHighlight: "Rootd, Woebot & NHS Talking Therapies are in your Tools tab.",
  },
  {
    id: "mindfulness",
    emoji: "🌿",
    label: "Mindfulness & Wellbeing",
    tagline: "Check in, reflect, and tend to yourself gently",
    color: "#22c55e",
    accent: "#16a34a",
    bg: "#f4f7f2",
    tabs: ["checkin","breathe","night","journal","moodboard","activities","reachout","safetyplan","tools","history"],
    toolHighlight: "Headspace, Calm & Finch are in your Tools tab.",
  },
  {
    id: "all",
    emoji: "✨",
    label: "Everything",
    tagline: "Show me all features — I'll find my way",
    color: "#fbbf24",
    accent: "#fde68a",
    bg: "#f4f7f2",
    tabs: ["checkin","journal","activities","breathe","night","reachout","safetyplan","moodboard","tools","history"],
    toolHighlight: "",
  },
];

const MOODS = [
  { emoji: "😭", label: "Awful", color: "#ef4444", value: 1 },
  { emoji: "😟", label: "Bad", color: "#f97316", value: 2 },
  { emoji: "😐", label: "Meh", color: "#eab308", value: 3 },
  { emoji: "🙂", label: "Good", color: "#84cc16", value: 4 },
  { emoji: "😄", label: "Great", color: "#22c55e", value: 5 },
];

const DEFAULT_ACTIVITIES = [
  { id: "water",       emoji: "💧", label: "Drink Water",   interval: 2,  unit: "h", reminder: true,  color: "#38bdf8" },
  { id: "eat",         emoji: "🍽️", label: "Eat Something", interval: 4,  unit: "h", reminder: true,  color: "#fb923c" },
  { id: "shower",      emoji: "🚿", label: "Shower",        interval: 24, unit: "h", reminder: false, color: "#a78bfa" },
  { id: "walk",        emoji: "🚶", label: "Walk",          interval: 4,  unit: "h", reminder: false, color: "#22c55e" },
  { id: "screenbreak", emoji: "👁️", label: "Screen Break",  interval: 1,  unit: "h", reminder: true,  color: "#fbbf24" },
  { id: "refocus",     emoji: "🎯", label: "Refocus",       interval: 2,  unit: "h", reminder: false, color: "#f472b6" },
  { id: "breathe",     emoji: "🌬️", label: "Breathe",       interval: 1,  unit: "h", reminder: false, color: "#16a34a" },
  { id: "stretch",     emoji: "🧘", label: "Stretch",       interval: 6,  unit: "h", reminder: false, color: "#22c55e" },
];

const EMOJI_OPTIONS = ["💧","🍽️","🚿","🚶","👁️","🎯","🌬️","🧘","☀️","🌙","💊","📵","🏃","🛏️","📖","🎵","🌿","🧠","💪","🫁","🫶","🌊","🍵","🥗","🐾","🎨","✍️","🧹","📞","🪴"];

const UNIT_OPTIONS = [
  { value: "m", label: "mins",  factor: 1/60 },
  { value: "h", label: "hours", factor: 1 },
  { value: "d", label: "days",  factor: 24 },
];

const QUOTES = [
  { text: "You are allowed to be both a masterpiece and a work in progress.", author: "Sophia Bush" },
  { text: "Rest is not idleness. It is the key to a better tomorrow.", author: "Anonymous" },
  { text: "Small steps every day add up to miles over time.", author: "Anonymous" },
  { text: "Your feelings are valid. Your pace is valid. You are valid.", author: "Anonymous" },
  { text: "Be gentle with yourself. You are a child of the universe.", author: "Max Ehrmann" },
  { text: "It's okay to not be okay, as long as you don't give up.", author: "Anonymous" },
  { text: "Healing is not linear. Every good day counts.", author: "Anonymous" },
  { text: "You've survived 100% of your bad days so far.", author: "Anonymous" },
];

const STRESS_LABELS = ["", "Very Calm", "Calm", "Slightly Tense", "Stressed", "Very Stressed", "Overwhelmed", "Anxious", "High Stress", "Near Limit", "Crisis"];
const STRESS_COLORS = ["", "#22c55e", "#22c55e", "#16a34a", "#fbbf24", "#f97316", "#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d"];

// ── CRISIS KEYWORD DETECTION ─────────────────────────────────────────────────
// Level 2: high risk — triggers full crisis support
// Uses simple string includes on normalised text (no regex word boundary issues)
const LEVEL2_PHRASES = [
  // Suicidal ideation — direct
  "kill myself", "killing myself", "end my life", "end it all", "ending it all",
  "end it tonight", "ending it tonight", "take my life", "taking my life",
  "take my own life", "want to die", "wanting to die", "i want to die",
  "wish i was dead", "wish i were dead", "wish i was gone", "better off dead",
  "better off without me", "don't want to be here", "dont want to be here",
  "no longer want to be here", "not want to wake up", "don't want to wake up",
  "dont want to wake up", "never wake up", "go to sleep and not wake up",
  "rather be dead", "rather not be alive", "rather not be here",
  "don't want to be alive", "dont want to be alive", "don't want to live anymore",
  "dont want to live anymore", "feel like a burden", "feeling like a burden",
  "i am a burden", "im a burden", "i'm a burden",
  // Self harm — direct
  "hurt myself", "hurting myself", "harm myself", "harming myself",
  "cut myself", "cutting myself", "self harm", "self-harm", "selfharm",
  "punish myself", "punishing myself", "burn myself", "burning myself",
  "hit myself", "hitting myself", "scratch myself", "starve myself",
  // Crisis language
  "no reason to live", "no point in living", "no point anymore",
  "can't go on", "cannot go on", "can't carry on", "cannot carry on",
  "give up on life", "giving up on life", "don't want to live",
  "dont want to live", "not worth living", "life isn't worth",
  "life is not worth", "want it to stop", "want everything to stop",
  "want to disappear forever", "disappear forever", "fade away forever",
  "end the pain", "make it stop", "it needs to stop",
  "suicid", "overdose on", "jump off", "hang myself", "od on",
  // Shorthand / abbreviations
  "kms", "kys", "unalive",
];

// Level 1: general struggle — gentle nudge
const LEVEL1_PHRASES = [
  "can't cope", "cant cope", "cannot cope", "can't do this", "cant do this",
  "too much to handle", "falling apart", "breaking point", "breaking down",
  "can't take it", "cant take it", "burnt out", "burned out", "burning out",
  "nothing matters", "what's the point", "whats the point", "no point",
  "feel numb", "feeling numb", "gone numb", "feel empty", "feeling empty",
  "feel hollow", "feel hopeless", "feeling hopeless", "feel worthless",
  "feeling worthless", "feel like a burden", "i'm a burden", "im a burden",
  "everyone would be better off", "no one cares", "nobody cares",
  "all alone", "completely alone", "so alone", "utterly alone",
  "can't get out of bed", "cant get out of bed", "haven't eaten",
  "not sleeping", "can't sleep", "cant sleep", "not eating",
  "can't see a way out", "cant see a way out", "no way out",
  "feel trapped", "feeling trapped", "feel stuck", "no way forward",
  "overwhelmed by everything", "too exhausted", "so exhausted",
  "drained completely", "running on empty", "nothing left",
  "don't recognise myself", "dont recognise myself", "losing my mind",
  "falling to pieces", "crumbling", "at rock bottom", "hit rock bottom",
  "really struggling", "struggling so much", "struggling badly",
];

function detectLevel(text) {
  if (!text || text.length < 8) return 0;
  // Normalise: lowercase, collapse whitespace, strip punctuation except apostrophes
  const norm = text.toLowerCase().replace(/[^\w\s']/g, " ").replace(/\s+/g, " ");
  for (const phrase of LEVEL2_PHRASES) {
    if (norm.includes(phrase)) return 2;
  }
  for (const phrase of LEVEL1_PHRASES) {
    if (norm.includes(phrase)) return 1;
  }
  return 0;
}
const CHECKIN_TOOL_SUGGESTIONS = {
  highStress: [
    { name: "Rootd", desc: "Real-time panic & anxiety support", url: "https://www.rootd.io", emoji: "🌱", color: "#22c55e" },
    { name: "Box Breathing", desc: "Use the Breathe tab right now", tab: "breathe", emoji: "🌬️", color: "#16a34a" },
    { name: "Focusmate", desc: "Body doubling to feel less alone", url: "https://www.focusmate.com", emoji: "🧑‍💻", color: "#38bdf8" },
  ],
  lowMood: [
    { name: "Finch", desc: "Gentle self-care, one small thing", url: "https://finchcare.com", emoji: "🐣", color: "#fb923c" },
    { name: "Mood Board", desc: "Open your anchor photos", tab: "moodboard", emoji: "🖼️", color: "#a78bfa" },
    { name: "Woebot", desc: "Talk through what you're feeling", url: "https://woebothealth.com", emoji: "🤖", color: "#38bdf8" },
  ],
  unfocused: [
    { name: "Goblin Tools", desc: "Break one task into tiny steps", url: "https://goblin.tools", emoji: "👺", color: "#a78bfa" },
    { name: "Forest", desc: "25 mins of focus, grow a tree", url: "https://www.forestapp.cc", emoji: "🌲", color: "#22c55e" },
    { name: "Tiimo", desc: "Visual schedule for the next few hours", url: "https://www.tiimoapp.com", emoji: "🕐", color: "#fb923c" },
  ],
  crisis: [
    { name: "Your Safety Plan", desc: "Open your personal plan now", tab: "safetyplan", emoji: "🛡️", color: "#ef4444" },
    { name: "Crisis Support", desc: "See free helplines for your country", crisis: true, emoji: "💙", color: "#fca5a5" },
  ],
};

function Thermometer({ value, onChange }) {
  const levels = Array.from({ length: 10 }, (_, i) => 10 - i);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{
        position: "relative",
        width: 56,
        borderRadius: 28,
        background: "#f0f6f0",
        border: "2px solid #cce4c8",
        overflow: "hidden",
        padding: "6px 5px 0 5px",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        boxShadow: "inset 0 2px 8px rgba(0,0,0,0.06)",
      }}>
        {levels.map(level => (
          <div
            key={level}
            onClick={() => onChange(level === value ? 0 : level)}
            title={STRESS_LABELS[level]}
            style={{
              height: 24,
              borderRadius: 6,
              cursor: "pointer",
              background: value >= level ? STRESS_COLORS[level] : "#e8f2e4",
              border: value === level ? "2.5px solid rgba(0,0,0,0.25)" : "2px solid transparent",
              transition: "all 0.2s",
              opacity: value >= level ? 1 : 0.45,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {value === level && (
              <span style={{ fontSize: 9, fontWeight: 800, color: "rgba(0,0,0,0.5)", fontFamily: "'Nunito', sans-serif" }}>{level}</span>
            )}
          </div>
        ))}
        <div style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: value > 0 ? STRESS_COLORS[value] : "#e8f2e4",
          border: `3px solid ${value > 0 ? "rgba(0,0,0,0.1)" : "#cce4c8"}`,
          margin: "5px auto 5px auto",
          transition: "background 0.3s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          fontWeight: 900,
          color: value > 0 ? "white" : "#88a888",
          fontFamily: "'Nunito', sans-serif",
          boxShadow: value > 0 ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
        }}>
          {value || "?"}
        </div>
      </div>
      <div style={{
        fontSize: 12,
        color: value > 0 ? STRESS_COLORS[value] : "#7a9a7a",
        fontWeight: 700,
        textAlign: "center",
        fontFamily: "'DM Mono', monospace",
        letterSpacing: 1,
        minHeight: 18,
      }}>
        {value > 0 ? STRESS_LABELS[value].toUpperCase() : "TAP TO SET"}
      </div>
    </div>
  );
}

const CRISIS_BY_COUNTRY = {
  GB: [
    { name: "Samaritans", desc: "Free, confidential — call anytime 24/7", contact: "116 123", type: "call", url: "tel:116123", emoji: "📞", color: "#22c55e" },
    { name: "Shout 85258", desc: "Text SHOUT — free, confidential 24/7", contact: "Text SHOUT to 85258", type: "text", url: "sms:85258?body=SHOUT", emoji: "💬", color: "#22c55e" },
    { name: "Mind Infoline", desc: "Mental health info & local support", contact: "0300 123 3393", type: "call", url: "tel:03001233393", emoji: "💜", color: "#a78bfa" },
    { name: "CALM", desc: "For men in crisis — call or webchat", contact: "0800 58 58 58", type: "call", url: "tel:08005858585", emoji: "💙", color: "#38bdf8" },
    { name: "Papyrus HOPELINEUK", desc: "Under 35s — suicide prevention support", contact: "0800 068 4141", type: "call", url: "tel:08000684141", emoji: "🌱", color: "#16a34a" },
    { name: "7 Cups", desc: "Free online chat with trained listeners", contact: "7cups.com", type: "chat", url: "https://www.7cups.com", emoji: "👂", color: "#fbbf24" },
  ],
  US: [
    { name: "988 Suicide & Crisis Lifeline", desc: "Call or text 988 — free 24/7", contact: "988", type: "call", url: "tel:988", emoji: "📞", color: "#22c55e" },
    { name: "Crisis Text Line", desc: "Text HOME to 741741 — free 24/7", contact: "Text HOME to 741741", type: "text", url: "sms:741741?body=HOME", emoji: "💬", color: "#22c55e" },
    { name: "NAMI Helpline", desc: "Mental health info & referrals", contact: "1-800-950-6264", type: "call", url: "tel:18009506264", emoji: "💜", color: "#a78bfa" },
    { name: "7 Cups", desc: "Free online chat with trained listeners", contact: "7cups.com", type: "chat", url: "https://www.7cups.com", emoji: "👂", color: "#16a34a" },
  ],
  CA: [
    { name: "Talk Suicide Canada", desc: "Call or text — free 24/7", contact: "1-833-456-4566", type: "call", url: "tel:18334564566", emoji: "📞", color: "#22c55e" },
    { name: "Crisis Text Line", desc: "Text HOME to 686868", contact: "Text HOME to 686868", type: "text", url: "sms:686868?body=HOME", emoji: "💬", color: "#22c55e" },
    { name: "Canada Mental Health Assoc.", desc: "Local resources & support", contact: "cmha.ca", type: "chat", url: "https://cmha.ca", emoji: "💜", color: "#a78bfa" },
    { name: "7 Cups", desc: "Free online chat with trained listeners", contact: "7cups.com", type: "chat", url: "https://www.7cups.com", emoji: "👂", color: "#16a34a" },
  ],
  AU: [
    { name: "Lifeline Australia", desc: "Call 13 11 14 — free 24/7", contact: "13 11 14", type: "call", url: "tel:131114", emoji: "📞", color: "#22c55e" },
    { name: "Beyond Blue", desc: "Call 1300 22 4636 — 24/7", contact: "1300 22 4636", type: "call", url: "tel:1300224636", emoji: "💙", color: "#22c55e" },
    { name: "Crisis Text Line", desc: "Text HOME to 0477 13 11 14", contact: "Text HOME to 0477 13 11 14", type: "text", url: "sms:0477131114?body=HOME", emoji: "💬", color: "#16a34a" },
    { name: "7 Cups", desc: "Free online chat with trained listeners", contact: "7cups.com", type: "chat", url: "https://www.7cups.com", emoji: "👂", color: "#a78bfa" },
  ],
  NZ: [
    { name: "Lifeline New Zealand", desc: "Call 0800 543 354 — free 24/7", contact: "0800 543 354", type: "call", url: "tel:0800543354", emoji: "📞", color: "#22c55e" },
    { name: "1737 Need to Talk", desc: "Call or text 1737 — free 24/7", contact: "1737", type: "call", url: "tel:1737", emoji: "💬", color: "#22c55e" },
    { name: "7 Cups", desc: "Free online chat with trained listeners", contact: "7cups.com", type: "chat", url: "https://www.7cups.com", emoji: "👂", color: "#16a34a" },
  ],
  IE: [
    { name: "Samaritans Ireland", desc: "Call 116 123 — free 24/7", contact: "116 123", type: "call", url: "tel:116123", emoji: "📞", color: "#22c55e" },
    { name: "Crisis Text Line", desc: "Text HOME to 741741", contact: "Text HOME to 741741", type: "text", url: "sms:741741?body=HOME", emoji: "💬", color: "#22c55e" },
    { name: "Pieta House", desc: "Suicide & self-harm crisis support", contact: "1800 247 247", type: "call", url: "tel:1800247247", emoji: "💜", color: "#a78bfa" },
  ],
  IN: [
    { name: "iCall", desc: "Free counselling helpline", contact: "9152987821", type: "call", url: "tel:9152987821", emoji: "📞", color: "#22c55e" },
    { name: "Vandrevala Foundation", desc: "24/7 mental health helpline", contact: "1860-2662-345", type: "call", url: "tel:18602662345", emoji: "💜", color: "#a78bfa" },
    { name: "7 Cups", desc: "Free online chat with trained listeners", contact: "7cups.com", type: "chat", url: "https://www.7cups.com", emoji: "👂", color: "#16a34a" },
  ],
  DEFAULT: [
    { name: "Samaritans", desc: "UK & Ireland — free 24/7", contact: "116 123", type: "call", url: "tel:116123", emoji: "📞", color: "#22c55e" },
    { name: "Shout 85258", desc: "UK — text SHOUT free 24/7", contact: "Text SHOUT to 85258", type: "text", url: "sms:85258?body=SHOUT", emoji: "💬", color: "#22c55e" },
    { name: "International Crisis Centres", desc: "Find a helpline in your country", contact: "iasp.info/resources/Crisis_Centres", type: "chat", url: "https://www.iasp.info/resources/Crisis_Centres/", emoji: "🌍", color: "#16a34a" },
    { name: "7 Cups", desc: "Free online chat with trained listeners", contact: "7cups.com", type: "chat", url: "https://www.7cups.com", emoji: "👂", color: "#fbbf24" },
  ],
};

function MoodboardGrid({ moodboard, setMoodboard, moodboardInputRef, setLightboxPhoto, removePhoto }) {
  const CATS = [
    { id: "all",      label: "All",      emoji: "🖼️", color: "#34a853" },
    { id: "joy",      label: "Joy",      emoji: "✨", color: "#fbbf24" },
    { id: "calm",     label: "Calm",     emoji: "🌿", color: "#22c55e" },
    { id: "strength", label: "Strength", emoji: "💪", color: "#f97316" },
    { id: "hope",     label: "Hope",     emoji: "💙", color: "#38bdf8" },
  ];
  const [activeCat, setActiveCat] = useState("all");
  const filtered = activeCat === "all" ? moodboard : moodboard.filter(p => p.category === activeCat);
  const activeCatObj = CATS.find(c => c.id === activeCat);

  const addPhoto = (cat) => {
    const input = moodboardInputRef.current;
    if (input) { input.setAttribute("data-category", cat); input.click(); }
  };

  return (
    <>
      {/* Category filter pills */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", padding: "2px 0" }}>
        {CATS.map(cat => (
          <button key={cat.id} onClick={() => setActiveCat(cat.id)}
            style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 20, fontSize: 12,
              background: activeCat === cat.id ? `${cat.color}22` : "#f5f8f3",
              border: `1.5px solid ${activeCat === cat.id ? cat.color : "#e0eed8"}`,
              color: activeCat === cat.id ? cat.color : "#8aaa88",
              fontWeight: activeCat === cat.id ? 700 : 500,
              cursor: "pointer", fontFamily: "'Nunito', sans-serif", whiteSpace: "nowrap" }}>
            {cat.emoji} {cat.label}
            {cat.id !== "all" && <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.8 }}>({moodboard.filter(p => p.category === cat.id).length})</span>}
          </button>
        ))}
      </div>

      {/* Active category add prompt */}
      {activeCat !== "all" && (
        <div style={{ background: `${activeCatObj.color}12`, border: `1px solid ${activeCatObj.color}30`, borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 12, color: "#5a7a5a", fontFamily: "'Nunito Sans', sans-serif" }}>
            Adding to <strong style={{ fontFamily: "'Nunito', sans-serif" }}>{activeCatObj.emoji} {activeCatObj.label}</strong>
          </div>
          <button onClick={() => addPhoto(activeCat)}
            style={{ padding: "6px 14px", borderRadius: 10, background: activeCatObj.color, border: "none", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
            + Add photo
          </button>
        </div>
      )}

      {/* File input */}
      <input ref={moodboardInputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => {
          if (!e.target.files[0]) return;
          const cat = e.target.getAttribute("data-category") || "all";
          const reader = new FileReader();
          reader.onload = ev => {
            const photo = { id: Date.now(), dataUrl: ev.target.result, caption: "", category: cat };
            const updated = [...moodboard, photo];
            setMoodboard(updated);
            try { localStorage.setItem("mh_moodboard", JSON.stringify(updated)); } catch {}
          };
          reader.readAsDataURL(e.target.files[0]);
          e.target.value = "";
        }} />

      {/* Grid or empty state */}
      {filtered.length === 0 ? (
        <div onClick={() => addPhoto(activeCat)}
          style={{ border: "2px dashed #c8e4c0", borderRadius: 18, padding: "36px 20px", textAlign: "center", cursor: "pointer" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>{activeCat === "all" ? "🖼️" : activeCatObj.emoji}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#3a6a3a", fontFamily: "'Nunito', sans-serif", marginBottom: 4 }}>
            {activeCat === "all" ? "Add your first photo" : `Add something that feels like ${activeCatObj.label.toLowerCase()}`}
          </div>
          <div style={{ fontSize: 12, color: "#9aba98", fontFamily: "'Nunito Sans', sans-serif" }}>
            Screenshots, photos, anything that feels good
          </div>
        </div>
      ) : (
        <div style={{ columns: 2, gap: 8 }}>
          {filtered.map(photo => {
            const cat = CATS.find(c => c.id === photo.category);
            return (
              <div key={photo.id} style={{ breakInside: "avoid", marginBottom: 8, borderRadius: 14, overflow: "hidden", position: "relative", border: "1px solid #e0eed8" }}>
                <img src={photo.dataUrl} alt={photo.caption || "moodboard"}
                  onClick={() => setLightboxPhoto(photo)}
                  style={{ width: "100%", display: "block", cursor: "pointer" }} />
                {cat && cat.id !== "all" && (
                  <div style={{ position: "absolute", top: 6, left: 6, background: `${cat.color}ee`, borderRadius: 8, padding: "2px 7px", fontSize: 10, color: "white", fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
                    {cat.emoji} {cat.label}
                  </div>
                )}
                {photo.caption && <div style={{ padding: "6px 10px", fontSize: 11, color: "#3a7a3a", fontStyle: "italic" }}>{photo.caption}</div>}
                <button onClick={() => removePhoto(moodboard, setMoodboard, "mh_moodboard", photo.id)}
                  style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "white", fontSize: 11, cursor: "pointer" }}>✕</button>
              </div>
            );
          })}
        </div>
      )}

      {moodboard.length > 0 && (
        <button onClick={() => addPhoto(activeCat)}
          style={{ padding: "13px", borderRadius: 14, border: "2px dashed #c8e4c0", background: "transparent", color: "#4a8a4a", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
          + Add {activeCat !== "all" ? `to ${activeCatObj.label}` : "another photo"}
        </button>
      )}
    </>
  );
}

function ToolSection({ section }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#ffffff", border: `1px solid ${section.color}28`, borderRadius: 18, overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
      <div onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 18px", cursor: "pointer" }}>
        <div style={{ width: 40, height: 40, borderRadius: 13, background: `${section.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
          {section.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#1e3820", fontFamily: "'Nunito', sans-serif" }}>{section.label}</div>
          <div style={{ fontSize: 11, color: "#8aaa88", fontFamily: "'Nunito Sans', sans-serif", marginTop: 1 }}>{section.items.length} resources</div>
        </div>
        <div style={{ fontSize: 20, color: section.color, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s" }}>⌄</div>
      </div>
      {open && (
        <div style={{ borderTop: `1px solid ${section.color}18`, padding: "0 14px 14px" }}>
          <div style={{ fontSize: 12, color: "#7a9a78", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.6, padding: "12px 4px 10px", fontStyle: "italic" }}>
            {section.intro}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {section.items.map(item => item.featured ? (
              <a key={item.name} href={item.url} target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: "none", background: "linear-gradient(135deg, #f5f0ff, #ede8ff)", border: `2px solid ${item.color}44`, borderRadius: 16, padding: "16px 16px", display: "block", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${item.color}, ${item.color}88)` }} />
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 13, background: `${item.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{item.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#2a1a5a", fontFamily: "'Nunito', sans-serif" }}>{item.name}</div>
                      <div style={{ fontSize: 9, background: item.color, color: "white", padding: "2px 8px", borderRadius: 6, fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>{item.tag}</div>
                    </div>
                    <div style={{ fontSize: 12, color: "#6a5a90", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.4 }}>{item.tagline}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: item.color, fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                  Open ND Brain OS →
                </div>
              </a>
            ) : (
              <a key={item.name} href={item.url} target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: "none", background: "#fafcf8", border: `1px solid ${item.color}22`, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: item.color, borderRadius: "3px 0 0 3px" }} />
                <div style={{ width: 38, height: 38, borderRadius: 11, background: `${item.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>{item.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3820", fontFamily: "'Nunito', sans-serif", marginBottom: 2 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: "#7a9a78", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.4 }}>{item.tagline}</div>
                </div>
                <div style={{ fontSize: 9, color: item.color, background: `${item.color}15`, border: `1px solid ${item.color}30`, padding: "2px 7px", borderRadius: 6, fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>{item.tag}</div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MentalHealthTracker() {
  // Auth state
  const [authScreen, setAuthScreen] = useState(null); // null | "signup" | "signin"
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // { name, email }
  const [showAccount, setShowAccount] = useState(false);
  const [tab, setTab] = useState("checkin");
  const [openingMood, setOpeningMood] = useState(null); // null=not chosen yet | chosen mood obj
  const [mood, setMood] = useState(null);
  const [stress, setStress] = useState(0);
  const [journal, setJournal] = useState("");
  const [entries, setEntries] = useState([]);
  const [activities, setActivities] = useState({});
  const [customActivities, setCustomActivities] = useState(DEFAULT_ACTIVITIES);
  const [editingActivity, setEditingActivity] = useState(null);
  const [addingActivity, setAddingActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({ emoji: "✨", label: "", interval: 2, unit: "h", reminder: false, color: "#22c55e" });
  const [reminderTicks, setReminderTicks] = useState({});
  const reminderRef = useRef({});
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [saved, setSaved] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [userCountry, setUserCountry] = useState(null);
  const [countryLoading, setCountryLoading] = useState(false);
  const [journalEntries, setJournalEntries] = useState([]);
  const [journalSaved, setJournalSaved] = useState(false);
  const [viewingEntry, setViewingEntry] = useState(null);
  const [journalAlert, setJournalAlert] = useState(null);
  const journalScanRef = useRef(null);
  const [anchorPhotos, setAnchorPhotos] = useState([]);
  const [moodboard, setMoodboard] = useState([]);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const anchorInputRef = useRef(null);
  const moodboardInputRef = useRef(null);
  const DEFAULT_PLAN = {
    warningSigns: "",
    copingStrategies: "",
    distractions: "",
    supportPeople: "",
    professionalContacts: "",
    safeEnvironment: "",
    reasons: "",
    level1: "",
    level2: "",
    level3: "",
    lastUpdated: null,
  };
  const [safetyPlan, setSafetyPlan] = useState(DEFAULT_PLAN);
  const [planSaved, setPlanSaved] = useState(false);
  const [planSection, setPlanSection] = useState(0);
  const [checkinSuggestions, setCheckinSuggestions] = useState(null);
  const [nightMode, setNightMode] = useState("menu");
  const [nightText, setNightText] = useState("");
  const [nightStep, setNightStep] = useState(0);
  const [reachOutPerson, setReachOutPerson] = useState(null);
  const [reachOutInputText, setReachOutInputText] = useState("");
  const [reachOutMode, setReachOutMode] = useState("choose");
  const [escalationAlert, setEscalationAlert] = useState(null); // null | "gp" | "urgent"
  const [profile, setProfile] = useState(null);
  const [onboardingDone, setOnboardingDone] = useState(null); // null=loading, false=show welcome, true=done
  const [welcomePage, setWelcomePage] = useState(1);
  const [trendView, setTrendView] = useState("week"); // "week" | "month"
  const [breatheActive, setBreatheActive] = useState(false);
  const [breathePhase, setBreathePhase] = useState("ready");
  const [breatheCount, setBreatheCount] = useState(0);
  const breatheRef = useRef(null);

  const crisisResources = CRISIS_BY_COUNTRY[userCountry] || CRISIS_BY_COUNTRY.DEFAULT;
  const countryNames = { GB: "🇬🇧 United Kingdom", US: "🇺🇸 United States", CA: "🇨🇦 Canada", AU: "🇦🇺 Australia", NZ: "🇳🇿 New Zealand", IE: "🇮🇪 Ireland", IN: "🇮🇳 India" };

  const detectCountry = async () => {
    setCountryLoading(true);
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      const code = data.country_code;
      setUserCountry(CRISIS_BY_COUNTRY[code] ? code : "DEFAULT");
      localStorage.setItem("mh_country", code);
    } catch {
      setUserCountry("DEFAULT");
    }
    setCountryLoading(false);
  };

  useEffect(() => {
    const stored = localStorage.getItem("mh_entries");
    if (stored) setEntries(JSON.parse(stored));
    const storedActs = localStorage.getItem("mh_activities");
    if (storedActs) setActivities(JSON.parse(storedActs));
    const storedCustom = localStorage.getItem("mh_custom_activities");
    if (storedCustom) setCustomActivities(JSON.parse(storedCustom));
    const storedUser = localStorage.getItem("mh_user");
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
    const storedProfile = localStorage.getItem("mh_profile");
    if (storedProfile) {
      const saved = JSON.parse(storedProfile);
      const fresh = PROFILES.find(p => p.id === saved.id) || saved;
      setProfile(fresh);
      setOnboardingDone(true);
      localStorage.setItem("mh_profile", JSON.stringify(fresh));
      // openingMood stays null — show the opening screen each session
    }
    else { setOnboardingDone(false); }
    setQuoteIdx(Math.floor(Math.random() * QUOTES.length));
    const savedCountry = localStorage.getItem("mh_country");
    if (savedCountry) {
      setUserCountry(CRISIS_BY_COUNTRY[savedCountry] ? savedCountry : "DEFAULT");
    } else {
      detectCountry();
    }
    const storedJournal = localStorage.getItem("mh_journal_entries");
    if (storedJournal) setJournalEntries(JSON.parse(storedJournal));
    const storedPlan = localStorage.getItem("mh_safety_plan");
    if (storedPlan) setSafetyPlan(JSON.parse(storedPlan));
    const storedAnchors = localStorage.getItem("mh_anchor_photos");
    if (storedAnchors) setAnchorPhotos(JSON.parse(storedAnchors));
    const storedMoodboard = localStorage.getItem("mh_moodboard");
    if (storedMoodboard) setMoodboard(JSON.parse(storedMoodboard));
  }, []);
  useEffect(() => {
    if (typeof Notification === "undefined") return;
    Object.values(reminderRef.current).forEach(clearInterval);
    reminderRef.current = {};
    customActivities.forEach(act => {
      if (!act.reminder) return;
      const hours = act.unit === "m" ? act.interval / 60 : act.unit === "d" ? act.interval * 24 : act.interval;
      const ms = Math.max(hours * 3600 * 1000, 60000);
      reminderRef.current[act.id] = setInterval(() => {
        if (Notification.permission === "granted") {
          new Notification(`🌿 Time for: ${act.label}`, {
            body: `Your ${act.label.toLowerCase()} reminder — tap to log it ✓`,
          });
        }
      }, ms);
    });
    return () => Object.values(reminderRef.current).forEach(clearInterval);
  }, [customActivities]);

  const saveJournalEntry = () => {
    if (!journal.trim()) return;
    const entry = { id: Date.now(), text: journal.trim(), date: new Date().toISOString() };
    const updated = [entry, ...journalEntries].slice(0, 50);
    setJournalEntries(updated);
    localStorage.setItem("mh_journal_entries", JSON.stringify(updated));
    setJournalSaved(true);
    setTimeout(() => setJournalSaved(false), 2000);
    setJournal("");
  };

  const deleteJournalEntry = (id) => {
    const updated = journalEntries.filter(e => e.id !== id);
    setJournalEntries(updated);
    localStorage.setItem("mh_journal_entries", JSON.stringify(updated));
    if (viewingEntry?.id === id) setViewingEntry(null);
  };

  const saveSafetyPlan = () => {
    const updated = { ...safetyPlan, lastUpdated: new Date().toISOString() };
    setSafetyPlan(updated);
    localStorage.setItem("mh_safety_plan", JSON.stringify(updated));
    setPlanSaved(true);
    setTimeout(() => setPlanSaved(false), 2000);
  };

  const updatePlan = (field, value) => setSafetyPlan(p => ({ ...p, [field]: value }));

  const addPhoto = (collection, setCollection, storageKey, file, caption = "") => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const photo = { id: Date.now(), dataUrl: e.target.result, caption };
      const updated = [...collection, photo];
      setCollection(updated);
      try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch {}
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (collection, setCollection, storageKey, id) => {
    const updated = collection.filter(p => p.id !== id);
    setCollection(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    if (lightboxPhoto?.id === id) setLightboxPhoto(null);
  };

  const updateCaption = (collection, setCollection, storageKey, id, caption) => {
    const updated = collection.map(p => p.id === id ? { ...p, caption } : p);
    setCollection(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const PhotoGrid = ({ photos, onAdd, inputRef, storageKey, collection, setCollection, emptyMsg }) => (
    <div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => e.target.files[0] && addPhoto(collection, setCollection, storageKey, e.target.files[0])} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
        {photos.map(photo => (
          <div key={photo.id} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1", background: "#fafcf8" }}>
            <img src={photo.dataUrl} alt={photo.caption || "photo"}
              onClick={() => setLightboxPhoto(photo)}
              style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer", display: "block" }} />
            <button onClick={() => removePhoto(collection, setCollection, storageKey, photo.id)}
              style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: "none", color: "white", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        ))}
        <div onClick={() => inputRef.current?.click()}
          style={{ aspectRatio: "1", borderRadius: 10, border: "2px dashed #a8d5a2", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 4 }}>
          <span style={{ fontSize: 20 }}>+</span>
          <span style={{ fontSize: 9, color: "#7aaa7a", fontFamily: "'DM Mono', monospace" }}>ADD</span>
        </div>
      </div>
      {photos.length === 0 && <div style={{ fontSize: 12, color: "#7aaa7a", textAlign: "center", padding: "8px 0", fontStyle: "italic" }}>{emptyMsg}</div>}
    </div>
  );

  const saveEntry = () => {
    if (!mood && !stress && !journal.trim()) return;
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      mood,
      stress,
      journal: journal.trim(),
    };
    const updated = [entry, ...entries].slice(0, 30);
    setEntries(updated);
    localStorage.setItem("mh_entries", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setJournal("");

    // ── Smart routing based on stress AND mood combined ──────────────────────
    // Stress: 1-3=nothing, 4-5=level1, 6-7=level2, 8-10=level3+crisis
    // Mood: 5(great)/4(good)=celebrate, 3(meh)=level1, 2(bad)=level2, 1(awful)=level3+crisis

    const stressLevel = stress >= 8 ? 3 : stress >= 6 ? 2 : stress >= 4 ? 1 : 0;
    const moodLevel = mood === 1 ? 3 : mood === 2 ? 2 : mood === 3 ? 1 : 0;
    const combinedLevel = Math.max(stressLevel, moodLevel);

    if (combinedLevel === 3) {
      // Level 3 — crisis support + safety plan level 3 + reach out
      setTimeout(() => setShowCrisis(true), 400);
      setCheckinSuggestions({ type: "level3", planLevel: "level3" });
    } else if (combinedLevel === 2) {
      // Level 2 — safety plan level 2 + reach out
      setCheckinSuggestions({ type: "level2", planLevel: "level2" });
    } else if (combinedLevel === 1) {
      // Level 1 — safety plan level 1 + breathe
      setCheckinSuggestions({ type: "level1", planLevel: "level1" });
    } else if (mood >= 4) {
      // Good or great — celebrate
      setCheckinSuggestions({ type: "celebrate", planLevel: null });
    } else {
      setCheckinSuggestions(null);
    }

    // Escalation detection — last 3 check-ins
    const allEntries = [entry, ...entries].slice(0, 10);
    if (allEntries.length >= 3) {
      const last3Stress = allEntries.slice(0, 3).filter(e => e.stress > 0).map(e => e.stress);
      const last3Mood = allEntries.slice(0, 3).filter(e => e.mood > 0).map(e => e.mood);
      const avgRecentStress = last3Stress.length ? last3Stress.reduce((a,b) => a+b, 0) / last3Stress.length : 0;
      const avgRecentMood = last3Mood.length ? last3Mood.reduce((a,b) => a+b, 0) / last3Mood.length : 5;
      if (avgRecentStress >= 8 || avgRecentMood <= 1.5) {
        setTimeout(() => setEscalationAlert("urgent"), 600);
      } else if (avgRecentStress >= 6.5 || avgRecentMood <= 2.5) {
        setTimeout(() => setEscalationAlert("gp"), 600);
      }
    }
  };
  useEffect(() => {
    clearTimeout(journalScanRef.current);
    if (!journal || journal.length < 15) { setJournalAlert(null); return; }
    journalScanRef.current = setTimeout(() => {
      const level = detectLevel(journal);
      if (level === 0) setJournalAlert(null);
      else setJournalAlert(prev => {
        // Don't re-show if user already dismissed at this level
        if (prev?.dismissed && prev?.level === level) return prev;
        return { level, dismissed: false };
      });
    }, 1200);
    return () => clearTimeout(journalScanRef.current);
  }, [journal]);

  const logActivity = (id) => {
    const updated = { ...activities, [id]: Date.now() };
    setActivities(updated);
    localStorage.setItem("mh_activities", JSON.stringify(updated));
  };

  const getTimeSince = (id) => {
    if (!activities[id]) return null;
    const mins = Math.floor((Date.now() - activities[id]) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  const isOverdue = (act) => {
    if (!activities[act.id]) return true;
    const hours = act.unit === "m" ? act.interval / 60 : act.unit === "d" ? act.interval * 24 : act.interval;
    return (Date.now() - activities[act.id]) / 3600000 > hours;
  };

  const saveCustomActivities = (updated) => {
    setCustomActivities(updated);
    localStorage.setItem("mh_custom_activities", JSON.stringify(updated));
  };

  const saveActivityEdit = (act) => {
    const updated = customActivities.map(a => a.id === act.id ? act : a);
    saveCustomActivities(updated);
    setEditingActivity(null);
  };

  const deleteActivity = (id) => {
    saveCustomActivities(customActivities.filter(a => a.id !== id));
    setEditingActivity(null);
  };

  const addNewActivity = () => {
    if (!newActivity.label.trim()) return;
    const act = { ...newActivity, id: `custom_${Date.now()}`, label: newActivity.label.trim() };
    saveCustomActivities([...customActivities, act]);
    setNewActivity({ emoji: "✨", label: "", interval: 2, unit: "h", reminder: false, color: "#22c55e" });
    setAddingActivity(false);
  };

  const requestNotificationPermission = async () => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const startBreathe = () => {
    setBreatheActive(true);
    setBreatheCount(0);
    runBreathe(0);
  };

  const runBreathe = (count) => {
    if (count >= 4) {
      setBreatheActive(false);
      setBreathePhase("ready");
      setBreatheCount(0);
      return;
    }
    setBreathePhase("in");
    breatheRef.current = setTimeout(() => {
      setBreathePhase("hold");
      breatheRef.current = setTimeout(() => {
        setBreathePhase("out");
        breatheRef.current = setTimeout(() => {
          setBreatheCount(c => c + 1);
          runBreathe(count + 1);
        }, 4000);
      }, 4000);
    }, 4000);
  };

  useEffect(() => () => clearTimeout(breatheRef.current), []);

  const breatheLabel = { ready: "Tap to Begin", in: "Breathe In…", hold: "Hold…", out: "Breathe Out…" };

  const ALL_TABS = [
    { id: "checkin",    emoji: "✨", label: "Check In" },
    { id: "journal",    emoji: "📓", label: "Journal" },
    { id: "activities", emoji: "🌿", label: "Activities" },
    { id: "breathe",    emoji: "🌬️", label: "Breathe" },
    { id: "night",      emoji: "🌙", label: "Night" },
    { id: "reachout",   emoji: "💌", label: "Reach Out" },
    { id: "safetyplan", emoji: "🛡️", label: "My Plan" },
    { id: "moodboard",  emoji: "🖼️", label: "Mood Board" },
    { id: "tools",      emoji: "🔗", label: "Tools" },
    { id: "history",    emoji: "📈", label: "History" },
  ];
  const tabOrder = profile?.tabs || ALL_TABS.map(t => t.id);
  const TABS = tabOrder.map(id => ALL_TABS.find(t => t.id === id)).filter(Boolean);

  const quote = QUOTES[quoteIdx];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const handleAuth = (mode) => {
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError("Please fill in all fields.");
      return;
    }
    if (mode === "signup" && !authName.trim()) {
      setAuthError("Please enter your name.");
      return;
    }
    if (authPassword.length < 8) {
      setAuthError("Password must be at least 8 characters.");
      return;
    }
    setAuthLoading(true);
    setAuthError("");
    // Simulate Supabase auth — replace with real Supabase calls when ready
    setTimeout(() => {
      const user = { name: authName || authEmail.split("@")[0], email: authEmail };
      setCurrentUser(user);
      localStorage.setItem("mh_user", JSON.stringify(user));
      setAuthScreen(null);
      setAuthLoading(false);
    }, 900);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem("mh_user");
    setShowAccount(false);
  };

  const selectProfile = (p) => {
    const fresh = PROFILES.find(prof => prof.id === p.id) || p;
    setProfile(fresh);
    setOnboardingDone(true);
    // Don't set tab yet — opening mood screen comes first
    localStorage.setItem("mh_profile", JSON.stringify(fresh));
  };

  const OPENING_MOODS = [
    {
      emoji: "🌤",
      label: "Okay, just checking in",
      sub: "I'm alright — just want to see how today goes",
      color: "#34a853",
      route: "checkin",
      message: "Good to see you. Let's check in.",
    },
    {
      emoji: "🌧",
      label: "A bit heavy",
      sub: "Things feel hard but I'm getting through",
      color: "#60a5fa",
      route: "breathe",
      message: "That's okay. Let's slow things down a little.",
    },
    {
      emoji: "⛈",
      label: "Really struggling",
      sub: "I need some support right now",
      color: "#a78bfa",
      route: "reachout",
      message: "Thank you for saying so. You're in the right place.",
    },
  ];

  const handleOpeningMood = (mood) => {
    setOpeningMood(mood);
    // Brief pause so they see the confirmation message, then navigate
    setTimeout(() => {
      setTab(mood.route);
      // Also pre-set the check-in mood if they tapped one
      const moodMap = { "🌤": 4, "🌧": 2, "⛈": 1 };
      if (moodMap[mood.emoji]) setMood(moodMap[mood.emoji]);
    }, 1200);
  };

  const WELCOME_SLIDES = [
    {
      emoji: "⚓",
      title: "Welcome to Anchor",
      body: "A quiet space to check in with yourself, track how you're feeling, and find support when things get hard — all in one place, always private.",
      sub: "by Wired & Well",
      btn: "Let's get started",
    },
    {
      emoji: "🌱",
      title: "It works with you",
      body: "Check in daily or just when you need to. Your mood, stress, journal entries and activities are saved privately on your device — no account needed, no data shared.",
      btn: "Good to know",
    },
    {
      emoji: "🛡️",
      title: "Your safety, your way",
      body: "Anchor has a personal safety plan, a reach out feature to message the people you trust, crisis support, and a gentle night mode for when sleep won't come.",
      btn: "Tell me about the tabs",
    },
    {
      emoji: "🧭",
      title: "Finding your way around",
      body: "The icons along the top are your tabs — swipe them to scroll. Each one is a different part of Anchor.",
      tabs: [
        { emoji: "✨", label: "Check In", desc: "Daily mood & stress" },
        { emoji: "📓", label: "Journal", desc: "Write freely" },
        { emoji: "🌿", label: "Activities", desc: "Small acts of care" },
        { emoji: "🌬️", label: "Breathe", desc: "Calm techniques" },
        { emoji: "🌙", label: "Night", desc: "Can't sleep?" },
        { emoji: "💌", label: "Reach Out", desc: "Message someone" },
        { emoji: "🛡️", label: "My Plan", desc: "Safety plan" },
        { emoji: "🔗", label: "Tools", desc: "Apps & resources" },
        { emoji: "📈", label: "History", desc: "Your trends" },
      ],
      btn: "Almost there",
    },
  ];

  if (onboardingDone === null) return (
    <div style={{ minHeight: "100vh", background: "#f6f9f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 40 }}>🌿</div>
    </div>
  );

  // Opening mood screen — shown every session after onboarding
  if (onboardingDone && !openingMood) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f6f9f4 0%, #eef6ec 100%)", fontFamily: "'Nunito Sans', sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=Nunito+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing: border-box; } @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } } .mood-card { animation: fadeIn 0.4s ease both; }`}</style>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "52px 24px 40px" }}>

        {/* Top */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#9aba98", letterSpacing: 2.5, marginBottom: 16 }}>ANCHOR · WIRED &amp; WELL</div>
          <div style={{ fontSize: 32, fontFamily: "'Nunito', sans-serif", fontWeight: 900, color: "#1a3820", lineHeight: 1.1, marginBottom: 8 }}>
            Hey{profile?.id === "all" ? "" : ` —`}
          </div>
          <div style={{ fontSize: 20, fontFamily: "'Nunito', sans-serif", fontWeight: 400, fontStyle: "italic", color: "#4a8a4a", lineHeight: 1.3, marginBottom: 12 }}>
            how are you today?
          </div>
          <div style={{ fontSize: 13, color: "#8aaa88", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.7, maxWidth: 280, margin: "0 auto" }}>
            No wrong answer. Just tap how you're feeling and we'll go from there.
          </div>
        </div>

        {/* Mood options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {OPENING_MOODS.map((m, i) => (
            <div
              key={i}
              className="mood-card"
              onClick={() => handleOpeningMood(m)}
              style={{
                animationDelay: `${i * 0.08}s`,
                background: "#ffffff",
                border: `1.5px solid ${m.color}30`,
                borderRadius: 22,
                padding: "18px 20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 16,
                boxShadow: `0 2px 16px ${m.color}12`,
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onTouchStart={e => e.currentTarget.style.transform = "scale(0.98)"}
              onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <span style={{ fontSize: 34 }}>{m.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#1a3820", fontFamily: "'Nunito', sans-serif", marginBottom: 3 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 12, color: "#8aaa88", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.4 }}>
                  {m.sub}
                </div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: `${m.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 16, color: m.color }}>→</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => { setOpeningMood({ route: "checkin", emoji: null }); setTab("checkin"); }}
            style={{ background: "none", border: "none", fontSize: 12, color: "#b8d4b4", cursor: "pointer", fontFamily: "'Nunito Sans', sans-serif" }}
          >
            Skip and go straight in
          </button>
        </div>
      </div>
    </div>
  );

  // Brief confirmation message while routing
  if (openingMood && tab === "checkin" && openingMood.route !== "checkin" && openingMood.message) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f6f9f4, #eef6ec)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Nunito+Sans:wght@400;600&display=swap'); * { box-sizing: border-box; } @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={{ textAlign: "center", animation: "fadeIn 0.4s ease" }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>{openingMood.emoji}</div>
        <div style={{ fontSize: 20, fontFamily: "'Nunito', sans-serif", fontWeight: 800, color: "#1a3820", lineHeight: 1.4, maxWidth: 280 }}>
          {openingMood.message}
        </div>
      </div>
    </div>
  );

  if (!onboardingDone) {    const slideIndex = Math.max(0, Math.min(welcomePage - 1, WELCOME_SLIDES.length - 1));
    const slide = WELCOME_SLIDES[slideIndex];
    const isProfilePage = welcomePage > WELCOME_SLIDES.length;

    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f6f9f4 0%, #eef6ec 100%)", fontFamily: "'Nunito Sans', sans-serif", display: "flex", flexDirection: "column" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=Nunito+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing: border-box; } input, textarea, select { font-family: inherit; }`}</style>

        {isProfilePage ? (
          /* Profile selection */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#9aba98", letterSpacing: 2.5, marginBottom: 10 }}>WIRED &amp; WELL</div>
              <div style={{ fontSize: 32, fontFamily: "'Nunito', sans-serif", fontWeight: 900, color: "#2a5a2a", marginBottom: 6 }}>What brings you here?</div>
              <div style={{ fontSize: 14, color: "#6a8a6a", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.7, maxWidth: 300 }}>
                We'll organise Anchor around what matters most to you. You can always change this later.
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 400 }}>
              {PROFILES.map(p => (
                <div key={p.id} onClick={() => selectProfile(p)}
                  style={{ background: "#ffffff", border: `1.5px solid ${p.color}44`, borderRadius: 20, padding: "18px 20px", cursor: "pointer", position: "relative", overflow: "hidden", boxShadow: `0 2px 12px ${p.color}18`, transition: "transform 0.15s" }}
                  onMouseOver={e => e.currentTarget.style.transform = "scale(1.01)"}
                  onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${p.color}, ${p.accent})` }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 50, height: 50, borderRadius: 16, background: `${p.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{p.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#1a3820", fontFamily: "'Nunito', sans-serif", marginBottom: 3 }}>{p.label}</div>
                      <div style={{ fontSize: 12, color: "#6a8a6a", lineHeight: 1.5, fontFamily: "'Nunito Sans', sans-serif" }}>{p.tagline}</div>
                    </div>
                    <div style={{ fontSize: 22, color: p.color }}>→</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#9aba98", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>Your data stays private · Change anytime</div>
              <a href="https://www.wiredandwell.co.uk" target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 11, color: "#7aaa7a", fontFamily: "'DM Mono', monospace", textDecoration: "none" }}>wiredandwell.co.uk</a>
            </div>
          </div>
        ) : (
          /* Welcome slides */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 28px 40px" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>

              {/* Emoji */}
              <div style={{ fontSize: 64, marginBottom: 24, animation: "fadeIn 0.4s ease" }}>{slide.emoji}</div>

              {/* Title */}
              <div style={{ fontSize: 26, fontFamily: "'Nunito', sans-serif", fontWeight: 900, color: "#1a3820", textAlign: "center", marginBottom: 14, lineHeight: 1.2 }}>
                {slide.title}
              </div>

              {slide.sub && (
                <div style={{ fontSize: 12, color: "#9aba98", fontFamily: "'DM Mono', monospace", letterSpacing: 1.5, marginBottom: 14 }}>
                  {slide.sub.toUpperCase()}
                </div>
              )}

              {/* Body */}
              <div style={{ fontSize: 15, color: "#5a7a5a", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.8, textAlign: "center", maxWidth: 320, marginBottom: 24 }}>
                {slide.body}
              </div>

              {/* Tab grid for slide 4 */}
              {slide.tabs && (
                <div style={{ width: "100%", maxWidth: 360, background: "#ffffff", border: "1px solid #d4e8cc", borderRadius: 20, padding: "16px 14px", boxShadow: "0 2px 16px rgba(60,100,60,0.08)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {slide.tabs.map((t, i) => (
                      <div key={i} style={{ background: "#f4f9f2", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
                        <div style={{ fontSize: 20, marginBottom: 3 }}>{t.emoji}</div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#2a4a2a", fontFamily: "'Nunito', sans-serif", marginBottom: 1 }}>{t.label}</div>
                        <div style={{ fontSize: 9, color: "#8aaa88", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.3 }}>{t.desc}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, textAlign: "center", fontSize: 11, color: "#9aba98", fontFamily: "'Nunito Sans', sans-serif" }}>
                    Swipe the tab bar to see them all
                  </div>
                </div>
              )}
            </div>

            {/* Bottom controls */}
            <div>
              {/* Progress dots */}
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 24 }}>
                {WELCOME_SLIDES.map((_, i) => (
                  <div key={i} style={{
                    width: i === welcomePage - 1 ? 24 : 8, height: 8, borderRadius: 4,
                    background: i === welcomePage - 1 ? "#34a853" : "#c8e4c0",
                    transition: "all 0.3s ease",
                  }} />
                ))}
              </div>

              <button
                onClick={() => setWelcomePage(p => p + 1)}
                style={{
                  width: "100%", padding: "16px", borderRadius: 18,
                  background: "linear-gradient(135deg, #34a853, #2a8a44)",
                  border: "none", color: "white", fontSize: 16, fontWeight: 800,
                  cursor: "pointer", fontFamily: "'Nunito', sans-serif",
                  boxShadow: "0 4px 16px rgba(52,168,83,0.35)",
                  marginBottom: 12,
                }}
              >
                {slide.btn} →
              </button>

              {welcomePage > 1 && (
                <button onClick={() => setWelcomePage(p => p - 1)}
                  style={{ width: "100%", padding: "12px", borderRadius: 14, background: "transparent", border: "none", color: "#8aaa88", fontSize: 13, cursor: "pointer", fontFamily: "'Nunito Sans', sans-serif" }}>
                  ← Back
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #f6f9f4 0%, #f0f6ee 40%, #f4f8f2 100%)",
      fontFamily: "'Nunito Sans', sans-serif",
      color: "#1a3a1a",
      display: "flex",
      flexDirection: "column",
      maxWidth: 480,
      margin: "0 auto",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=Nunito+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #a8d5a2; border-radius: 4px; }
        textarea { resize: none; outline: none; }
        textarea::placeholder { color: #9aca9a; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .entry-card { animation: fadeIn 0.3s ease; }
        .breathe-circle { transition: transform 4s ease-in-out, background 4s ease-in-out; }
        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover { opacity: 0.8; }
        .activity-btn { transition: all 0.2s; }
        .activity-btn:active { transform: scale(0.95); }
        .mood-btn { transition: all 0.2s; cursor: pointer; }
        .mood-btn:hover { transform: scale(1.12); }
        .tool-card { transition: all 0.2s; cursor: pointer; }
        .tool-card:hover { transform: translateY(-2px); }
        .tool-card:active { transform: scale(0.97); opacity: 0.85; }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      `}</style>

      {/* Header */}
      <div style={{ padding: "24px 24px 10px", position: "sticky", top: 0, zIndex: 10, background: "linear-gradient(to bottom, #f6f9f4 94%, transparent)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 9, color: "#7aaa7a", fontFamily: "'DM Mono', monospace", letterSpacing: 2, marginBottom: 3 }}>{today.toUpperCase()}</div>
            {profile?.greetings ? (
              <div style={{ fontSize: profile.greetings[new Date().getDay() % profile.greetings.length].length > 32 ? 15 : 18,
                fontFamily: "'Nunito', sans-serif", fontWeight: 800, color: "#2a4a2a",
                lineHeight: 1.3, maxWidth: 220 }}>
                {profile.greetings[new Date().getDay() % profile.greetings.length]}
              </div>
            ) : (
              <div style={{ fontSize: 26, fontFamily: "'Nunito', sans-serif", fontWeight: 900, color: "#2d6a2d", lineHeight: 1.1 }}>How are you<br /><span style={{ fontStyle: "italic", fontWeight: 400, color: "#4a8a4a" }}>really?</span></div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <a href="https://www.wiredandwell.co.uk" target="_blank" rel="noopener noreferrer"
              style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
              <div style={{ fontSize: 17, fontFamily: "'Nunito', sans-serif", fontWeight: 800, color: "#5a8a5a", letterSpacing: 0.5 }}>Anchor</div>
              <div style={{ fontSize: 8, color: "#9aca9a", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>Wired &amp; Well</div>
            </a>
            <button
              onClick={() => {
                localStorage.removeItem("mh_profile");
                setProfile(null);
                setOnboardingDone(false);
                setWelcomePage(1);
              }}
              style={{ background: "none", border: "none", fontSize: 9, color: "#c8dcc8", cursor: "pointer",
                fontFamily: "'DM Mono', monospace", letterSpacing: 0.5, padding: 0 }}>
              preview intro
            </button>
            <button onClick={() => currentUser ? setShowAccount(true) : setAuthScreen("signup")}
              style={{ padding: "6px 12px", borderRadius: 20, border: "1px solid #c8e4c0",
                background: currentUser ? "#e4f5e0" : "#f0f7ee",
                color: "#2a5a2a", fontSize: 11, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Nunito', sans-serif", whiteSpace: "nowrap" }}>
              {currentUser ? `👤 ${currentUser.name.split(" ")[0]}` : "Sign in"}
            </button>
          </div>
        </div>
      </div>

      {/* Coming Soon banner */}
      <div style={{ background: "linear-gradient(135deg, #1e3a5f, #2d5a8a)", padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <span style={{ fontSize: 14 }}>🚀</span>
        <div style={{ fontSize: 11, color: "#a8d4f8", fontFamily: "'Nunito', sans-serif", fontWeight: 600, textAlign: "center" }}>
          Anchor is in beta — accounts &amp; cloud sync <span style={{ color: "#fbbf24", fontWeight: 800 }}>coming soon</span>
        </div>
      </div>

      {/* Tab Navigation — fixed bottom bar, 5 visible + swipe overflow */}
      <div style={{ position: "relative", borderBottom: "1px solid #e8f0e4", background: "#f6f9f4" }}>
        {/* Scrollable emoji row */}
        <div style={{
          display: "flex", gap: 0, overflowX: "auto", scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch", padding: "6px 8px 0",
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: "0 0 auto",
                minWidth: 60,
                padding: "8px 4px 10px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                position: "relative",
              }}
            >
              {/* Active indicator dot above emoji */}
              {tab === t.id && (
                <div style={{
                  position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                  width: 20, height: 3, borderRadius: 2,
                  background: "linear-gradient(90deg, #34a853, #22c55e)",
                }} />
              )}
              <span style={{ fontSize: tab === t.id ? 22 : 20, transition: "font-size 0.15s" }}>{t.emoji}</span>
              <span style={{
                fontSize: 9, fontFamily: "'Nunito', sans-serif",
                fontWeight: tab === t.id ? 800 : 500,
                color: tab === t.id ? "#2a5a2a" : "#9aba90",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}>{t.label}</span>
            </button>
          ))}
          <div style={{ flex: "0 0 12px" }} />
        </div>
        {/* Right fade — signals scrollability */}
        <div style={{
          position: "absolute", top: 0, right: 0, bottom: 0, width: 52,
          background: "linear-gradient(to left, #f6f9f4 20%, transparent)",
          pointerEvents: "none",
        }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "16px 20px 100px", overflowY: "auto" }}>

        {/* CHECK IN TAB */}
        {tab === "checkin" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Quote */}
            <div style={{
              background: "#fafcf8",
              border: "1px solid #deeeda",
              borderRadius: 16,
              padding: "18px 20px",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #22c55e, #4ade80, #86efac)" }} />
              <div style={{ fontSize: 13, fontFamily: "'Nunito', sans-serif", fontStyle: "italic", color: "#3a7a3a", lineHeight: 1.6, marginBottom: 8 }}>
                "{quote.text}"
              </div>
              <div style={{ fontSize: 11, color: "#5a8a5a", fontFamily: "'DM Mono', monospace" }}>— {quote.author}</div>
              <button
                onClick={() => setQuoteIdx((quoteIdx + 1) % QUOTES.length)}
                style={{ position: "absolute", bottom: 12, right: 16, background: "none", border: "none", color: "#5a8a5a", cursor: "pointer", fontSize: 18 }}
              >↻</button>
            </div>

            {/* Emoji Mood */}
            <div style={{ background: "#fafcf8", border: "1px solid #deeeda", borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#5a8a5a", letterSpacing: 2, marginBottom: 14 }}>MOOD CHECK-IN</div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                {MOODS.map(m => (
                  <div
                    key={m.value}
                    className="mood-btn"
                    onClick={() => setMood(mood === m.value ? null : m.value)}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      padding: "10px 4px",
                      borderRadius: 12,
                      border: `2px solid ${mood === m.value ? m.color : "#cce4c8"}`,
                      background: mood === m.value ? `${m.color}22` : "transparent",
                    }}
                  >
                    <span style={{ fontSize: 26 }}>{m.emoji}</span>
                    <span style={{ fontSize: 9, color: mood === m.value ? m.color : "#5a8a5a", fontFamily: "'DM Mono', monospace", letterSpacing: 0.5 }}>{m.label.toUpperCase()}</span>
                  </div>
                ))}
              </div>
              {mood === 1 && (
                <div style={{
                  marginTop: 12,
                  background: "#fff0f0",
                  border: "1px solid #f0a0a0",
                  borderRadius: 12,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  animation: "fadeIn 0.3s ease",
                }}>
                  <span style={{ fontSize: 22 }}>💙</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#fca5a5", fontWeight: 600, marginBottom: 3 }}>We see you. You're not alone.</div>
                    <div style={{ fontSize: 12, color: "#f87171", lineHeight: 1.5 }}>It's okay to reach out. Real support is here.</div>
                  </div>
                  <button
                    onClick={() => setShowCrisis(true)}
                    style={{
                      padding: "7px 12px", borderRadius: 8,
                      background: "#7f1d1d", border: "1px solid #f0a0a0",
                      color: "#fca5a5", fontSize: 11,
                      cursor: "pointer", fontFamily: "'Nunito Sans', sans-serif",
                      fontWeight: 600, whiteSpace: "nowrap",
                    }}
                  >Get Help</button>
                </div>
              )}
            </div>

            {/* Stress Thermometer */}
            <div style={{ background: "#fafcf8", border: "1px solid #deeeda", borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#5a8a5a", letterSpacing: 2, marginBottom: 16 }}>STRESS THERMOMETER</div>
              <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                <Thermometer value={stress} onChange={setStress} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 42, fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: stress > 0 ? STRESS_COLORS[stress] : "#b8d8b4", lineHeight: 1 }}>
                    {stress > 0 ? stress : "–"}
                  </div>
                  <div style={{ fontSize: 11, color: "#5a8a5a", marginBottom: 12, marginTop: 4 }}>out of 10</div>
                  {stress > 0 && (
                    <div style={{ fontSize: 13, color: "#3a7a3a", lineHeight: 1.5 }}>
                      {stress <= 3 && "You're feeling pretty centered right now. Nice."}
                      {stress > 3 && stress <= 6 && "Some tension building up. A short walk or breathing break might help."}
                      {stress > 6 && stress <= 7 && "That's a lot to carry. Be extra gentle with yourself today."}
                      {stress >= 8 && (
                        <div style={{
                          background: "#fff0f0",
                          border: "1px solid #f0a0a0",
                          borderRadius: 12,
                          padding: "12px 14px",
                          marginTop: 4,
                        }}>
                          <div style={{ fontSize: 13, color: "#fca5a5", fontWeight: 600, marginBottom: 6 }}>
                            That's a really high level of stress. 💙
                          </div>
                          <div style={{ fontSize: 12, color: "#f87171", lineHeight: 1.5, marginBottom: 10 }}>
                            You don't have to carry this alone. Real support is available right now.
                          </div>
                          <button
                            onClick={() => setShowCrisis(true)}
                            style={{
                              width: "100%", padding: "9px", borderRadius: 8,
                              background: "linear-gradient(135deg, #dc2626, #991b1b)",
                              border: "none", color: "white",
                              fontSize: 12, fontWeight: 600, cursor: "pointer",
                              fontFamily: "'Nunito Sans', sans-serif",
                            }}
                          >
                            See Support Resources →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <div
                        key={n}
                        onClick={() => setStress(n)}
                        style={{
                          width: 28, height: 28, borderRadius: 6,
                          background: stress >= n ? STRESS_COLORS[n] : "#d4ecd0",
                          border: stress === n ? "2px solid white" : "2px solid transparent",
                          cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, color: "white", fontFamily: "'DM Mono', monospace",
                          transition: "all 0.15s",
                          opacity: stress >= n ? 1 : 0.4,
                        }}
                      >{n}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={saveEntry}
              style={{
                width: "100%",
                padding: "15px",
                borderRadius: 12,
                border: "none",
                background: saved ? "#22c55e33" : "linear-gradient(135deg, #22c55e, #16a34a)",
                color: saved ? "#22c55e" : "white",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Nunito Sans', sans-serif",
                letterSpacing: 0.5,
                transition: "all 0.3s",
              }}
            >
              {saved ? "✓ Saved!" : "Save Check-In"}
            </button>

            {/* ── Smart post check-in routing ── */}
            {checkinSuggestions && (
              <div style={{ animation: "fadeIn 0.4s ease" }}>

                {/* CELEBRATE — mood 4 or 5, stress 1-3 */}
                {checkinSuggestions.type === "celebrate" && (
                  <div style={{ background: "linear-gradient(135deg, #f0fdf4, #e8f5e8)", border: "1.5px solid #86efac", borderRadius: 20, padding: "20px 18px" }}>
                    <div style={{ fontSize: 28, marginBottom: 8, textAlign: "center" }}>🌟</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#1a4a1a", fontFamily: "'Nunito', sans-serif", textAlign: "center", marginBottom: 6 }}>
                      You're doing well today.
                    </div>
                    <div style={{ fontSize: 13, color: "#4a7a4a", fontFamily: "'Nunito Sans', sans-serif", textAlign: "center", lineHeight: 1.7, marginBottom: 16 }}>
                      Notice it. Hold onto it. That matters.
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { setTab("journal"); setCheckinSuggestions(null); }}
                        style={{ flex: 1, padding: "11px", borderRadius: 12, background: "#f0f7ee", border: "1px solid #c8e4c0", color: "#2a5a2a", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                        📓 Write it down
                      </button>
                      <button onClick={() => { setTab("moodboard"); setCheckinSuggestions(null); }}
                        style={{ flex: 1, padding: "11px", borderRadius: 12, background: "#f0f7ee", border: "1px solid #c8e4c0", color: "#2a5a2a", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                        🖼️ Mood board
                      </button>
                    </div>
                    <button onClick={() => setCheckinSuggestions(null)}
                      style={{ width: "100%", marginTop: 8, padding: "8px", borderRadius: 10, background: "transparent", border: "none", color: "#9aba98", fontSize: 12, cursor: "pointer", fontFamily: "'Nunito Sans', sans-serif" }}>
                      Just carry on
                    </button>
                  </div>
                )}

                {/* LEVEL 1 — stress 4-5 or mood meh */}
                {checkinSuggestions.type === "level1" && (
                  <div style={{ background: "#fafcf8", border: "1.5px solid #d4e8cc", borderRadius: 20, padding: "20px 18px" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#2a4a2a", fontFamily: "'Nunito', sans-serif", marginBottom: 4 }}>
                      Things feel a bit heavy.
                    </div>
                    <div style={{ fontSize: 13, color: "#6a8a6a", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.7, marginBottom: 14 }}>
                      That's okay. Here are a few things that might help right now.
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <button onClick={() => { setTab("safetyplan"); setPlanSection(0); setCheckinSuggestions(null); }}
                        style={{ padding: "13px 16px", borderRadius: 14, background: "linear-gradient(135deg, #f0f7ee, #e8f4e4)", border: "1.5px solid #c8e0c0", color: "#1e3820", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
                        <span style={{ fontSize: 20 }}>🛡️</span>
                        <div>
                          <div>My safety plan — Level 1</div>
                          <div style={{ fontSize: 11, fontWeight: 400, color: "#7a9a7a", marginTop: 1 }}>Your coping strategies and what helps</div>
                        </div>
                      </button>
                      <button onClick={() => { setTab("breathe"); setCheckinSuggestions(null); }}
                        style={{ padding: "13px 16px", borderRadius: 14, background: "#f4f8f2", border: "1px solid #deeeda", color: "#1e3820", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
                        <span style={{ fontSize: 20 }}>🌬️</span>
                        <div>
                          <div>Breathing techniques</div>
                          <div style={{ fontSize: 11, fontWeight: 400, color: "#7a9a7a", marginTop: 1 }}>Slow it down in a few breaths</div>
                        </div>
                      </button>
                      <button onClick={() => { setTab("reachout"); setCheckinSuggestions(null); }}
                        style={{ padding: "13px 16px", borderRadius: 14, background: "#f4f8f2", border: "1px solid #deeeda", color: "#1e3820", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
                        <span style={{ fontSize: 20 }}>💌</span>
                        <div>
                          <div>Reach out to someone</div>
                          <div style={{ fontSize: 11, fontWeight: 400, color: "#7a9a7a", marginTop: 1 }}>We'll help you find the words</div>
                        </div>
                      </button>
                    </div>
                    <button onClick={() => setCheckinSuggestions(null)}
                      style={{ width: "100%", marginTop: 8, padding: "8px", borderRadius: 10, background: "transparent", border: "none", color: "#9aba98", fontSize: 12, cursor: "pointer", fontFamily: "'Nunito Sans', sans-serif" }}>
                      I'm okay for now
                    </button>
                  </div>
                )}

                {/* LEVEL 2 — stress 6-7 or mood bad */}
                {checkinSuggestions.type === "level2" && (
                  <div style={{ background: "#fafcf8", border: "1.5px solid #c8d8e8", borderRadius: 20, overflow: "hidden" }}>
                    <div style={{ height: 4, background: "linear-gradient(90deg, #60a5fa, #38bdf8)" }} />
                    <div style={{ padding: "18px 18px 16px" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#1a2a4a", fontFamily: "'Nunito', sans-serif", marginBottom: 4 }}>
                        Today is genuinely hard.
                      </div>
                      <div style={{ fontSize: 13, color: "#5a6a80", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.7, marginBottom: 14 }}>
                        You don't have to push through this alone. Here's what might help.
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <button onClick={() => { setTab("safetyplan"); setPlanSection(1); setCheckinSuggestions(null); }}
                          style={{ padding: "13px 16px", borderRadius: 14, background: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "1.5px solid #93c5fd", color: "#1e3a5f", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
                          <span style={{ fontSize: 20 }}>🛡️</span>
                          <div>
                            <div>My safety plan — Level 2</div>
                            <div style={{ fontSize: 11, fontWeight: 400, color: "#6080a0", marginTop: 1 }}>Your plan for when things feel overwhelming</div>
                          </div>
                        </button>
                        <button onClick={() => { setTab("reachout"); setCheckinSuggestions(null); }}
                          style={{ padding: "13px 16px", borderRadius: 14, background: "#f8f4ff", border: "1.5px solid #c8b8e8", color: "#3a2a5a", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
                          <span style={{ fontSize: 20 }}>💌</span>
                          <div>
                            <div>Tell someone you trust</div>
                            <div style={{ fontSize: 11, fontWeight: 400, color: "#7060a0", marginTop: 1 }}>One tap to reach out — we'll find the words</div>
                          </div>
                        </button>
                        <button onClick={() => { setTab("night"); setCheckinSuggestions(null); }}
                          style={{ padding: "13px 16px", borderRadius: 14, background: "#f4f8f2", border: "1px solid #deeeda", color: "#1e3820", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
                          <span style={{ fontSize: 20 }}>🌬️</span>
                          <div>
                            <div>Breathe through it</div>
                            <div style={{ fontSize: 11, fontWeight: 400, color: "#7a9a7a", marginTop: 1 }}>Breathing and grounding techniques</div>
                          </div>
                        </button>
                      </div>
                      <button onClick={() => setCheckinSuggestions(null)}
                        style={{ width: "100%", marginTop: 8, padding: "8px", borderRadius: 10, background: "transparent", border: "none", color: "#9aba98", fontSize: 12, cursor: "pointer", fontFamily: "'Nunito Sans', sans-serif" }}>
                        I'll manage for now
                      </button>
                    </div>
                  </div>
                )}

                {/* LEVEL 3 — stress 8-10 or mood awful */}
                {checkinSuggestions.type === "level3" && (
                  <div style={{ background: "#fafcf8", border: "1.5px solid #c8b8e8", borderRadius: 20, overflow: "hidden" }}>
                    <div style={{ height: 4, background: "linear-gradient(90deg, #a78bfa, #7c3aed)" }} />
                    <div style={{ padding: "20px 18px 16px" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#2a1a4a", fontFamily: "'Nunito', sans-serif", marginBottom: 6 }}>
                        This is a really hard moment.
                      </div>
                      <div style={{ fontSize: 13, color: "#5a4a70", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.7, marginBottom: 16 }}>
                        Thank you for checking in. You matter. Please don't sit with this alone.
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <button onClick={() => { setShowCrisis(true); setCheckinSuggestions(null); }}
                          style={{ padding: "14px 16px", borderRadius: 14, background: "linear-gradient(135deg, #34a853, #2a8a44)", border: "none", color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: 10, textAlign: "left", boxShadow: "0 3px 12px rgba(52,168,83,0.3)" }}>
                          <span style={{ fontSize: 22 }}>💙</span>
                          <div>
                            <div>Get support now</div>
                            <div style={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.8)", marginTop: 1 }}>Crisis lines, 111, 999 — always free</div>
                          </div>
                        </button>
                        <button onClick={() => { setTab("safetyplan"); setPlanSection(2); setCheckinSuggestions(null); }}
                          style={{ padding: "13px 16px", borderRadius: 14, background: "linear-gradient(135deg, #f5f0ff, #ede8ff)", border: "1.5px solid #c8b8e8", color: "#2a1a4a", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
                          <span style={{ fontSize: 20 }}>🛡️</span>
                          <div>
                            <div>My safety plan — Level 3</div>
                            <div style={{ fontSize: 11, fontWeight: 400, color: "#7060a0", marginTop: 1 }}>Your plan for crisis moments</div>
                          </div>
                        </button>
                        <button onClick={() => { setTab("reachout"); setCheckinSuggestions(null); }}
                          style={{ padding: "13px 16px", borderRadius: 14, background: "#f8f4ff", border: "1px solid #d0c4e8", color: "#3a2a5a", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
                          <span style={{ fontSize: 20 }}>💌</span>
                          <div>
                            <div>Reach out to someone now</div>
                            <div style={{ fontSize: 11, fontWeight: 400, color: "#7060a0", marginTop: 1 }}>Tell someone you trust how you feel</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* JOURNAL TAB */}
        {tab === "journal" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* View single entry */}
            {viewingEntry ? (
              <div>
                <button onClick={() => setViewingEntry(null)} style={{ background: "none", border: "none", color: "#5a8a5a", cursor: "pointer", fontSize: 13, marginBottom: 12, padding: 0, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Nunito Sans', sans-serif" }}>
                  ← Back to journal
                </button>
                <div style={{ background: "#fafcf8", border: "1px solid #deeeda", borderRadius: 16, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 13, fontFamily: "'Nunito', sans-serif", color: "#2d6a2d" }}>
                        {new Date(viewingEntry.id).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                      </div>
                      <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7aaa7a", marginTop: 2 }}>
                        {new Date(viewingEntry.id).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <button onClick={() => deleteJournalEntry(viewingEntry.id)} style={{ background: "#fff0f0", border: "1px solid #f0c8c8", color: "#7a5050", borderRadius: 8, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontFamily: "'Nunito Sans', sans-serif" }}>
                      Delete
                    </button>
                  </div>
                  <div style={{ fontSize: 14, color: "#1a3a1a", lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "'Nunito Sans', sans-serif" }}>
                    {viewingEntry.text}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* ── Journal awareness — shown ABOVE the text box so it can't be missed ── */}
                {journalAlert && !journalAlert.dismissed && (() => {
                  const isHigh = journalAlert.level === 2;
                  const hasPlan = safetyPlan && (safetyPlan.copingStrategies || safetyPlan.supportPeople || safetyPlan.reasons);
                  const planCoping = safetyPlan?.copingStrategies?.trim().split("\n")[0];
                  const planPerson = safetyPlan?.supportPeople?.trim().split("\n")[0];
                  const planReason = safetyPlan?.reasons?.trim().split("\n")[0];
                  return (
                    <div style={{
                      borderRadius: 20,
                      overflow: "hidden",
                      animation: "fadeIn 0.4s ease",
                      boxShadow: isHigh
                        ? "0 4px 24px rgba(180,60,60,0.15), 0 0 0 2px rgba(239,100,100,0.3)"
                        : "0 4px 20px rgba(60,130,80,0.12), 0 0 0 2px rgba(100,200,120,0.25)",
                    }}>
                      {/* Coloured top stripe */}
                      <div style={{ height: 5, background: isHigh
                        ? "linear-gradient(90deg, #f87171, #fb923c)"
                        : "linear-gradient(90deg, #34d399, #22c55e)" }} />
                      <div style={{
                        background: isHigh ? "#fffaf9" : "#f5fdf7",
                        padding: "16px 18px 18px",
                        position: "relative",
                      }}>
                        <button onClick={() => setJournalAlert(a => ({ ...a, dismissed: true }))}
                          style={{ position: "absolute", top: 12, right: 14, background: "none", border: "none",
                            color: isHigh ? "#d4a0a0" : "#9aba98", fontSize: 18, cursor: "pointer", lineHeight: 1, padding: 4 }}>✕</button>

                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
                          <div style={{ fontSize: 28, lineHeight: 1, marginTop: 2 }}>{isHigh ? "💙" : "🌿"}</div>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: isHigh ? "#b04040" : "#1e4a28",
                              fontFamily: "'Nunito', sans-serif", marginBottom: 5, lineHeight: 1.3 }}>
                              {isHigh ? "We noticed something in what you wrote." : "It sounds like things feel heavy right now."}
                            </div>
                            <div style={{ fontSize: 13, color: isHigh ? "#9a5050" : "#4a7a56",
                              fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.7 }}>
                              {isHigh
                                ? "You don't have to carry this alone. Support is here whenever you're ready."
                                : "That's real, and it matters. There's no rush — but a few things below might help."}
                            </div>
                          </div>
                        </div>

                        {hasPlan && (planCoping || planPerson || (isHigh && planReason)) && (
                          <div style={{ background: isHigh ? "#fff0ee" : "#edf7f0",
                            borderRadius: 12, padding: "12px 14px", marginBottom: 14,
                            border: `1px solid ${isHigh ? "#f0c8c0" : "#b8ddc4"}` }}>
                            <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace",
                              color: isHigh ? "#b07070" : "#6aaa7a", letterSpacing: 2, marginBottom: 8 }}>
                              FROM YOUR SAFETY PLAN
                            </div>
                            {planCoping && <div style={{ fontSize: 12, color: isHigh ? "#9a5050" : "#2d5a38",
                              marginBottom: 5, lineHeight: 1.6, fontFamily: "'Nunito Sans', sans-serif" }}>
                              <span style={{ color: isHigh ? "#c08080" : "#7aaa88" }}>Something that helps you: </span>
                              <span style={{ fontWeight: 700 }}>"{planCoping}"</span>
                            </div>}
                            {planPerson && <div style={{ fontSize: 12, color: isHigh ? "#9a5050" : "#2d5a38",
                              marginBottom: 5, lineHeight: 1.6, fontFamily: "'Nunito Sans', sans-serif" }}>
                              <span style={{ color: isHigh ? "#c08080" : "#7aaa88" }}>Someone you trust: </span>
                              <span style={{ fontWeight: 700 }}>"{planPerson}"</span>
                            </div>}
                            {isHigh && planReason && <div style={{ fontSize: 12, color: "#b05050",
                              lineHeight: 1.6, fontFamily: "'Nunito Sans', sans-serif" }}>
                              <span style={{ color: "#c08080" }}>A reason you wrote down: </span>
                              <span style={{ fontWeight: 700 }}>"{planReason}"</span>
                            </div>}
                          </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {isHigh ? (
                            <>
                              <button onClick={() => { setShowCrisis(true); setJournalAlert(a => ({ ...a, dismissed: true })); }}
                                style={{ padding: "13px", borderRadius: 13,
                                  background: "linear-gradient(135deg, #34a853, #2a8a44)",
                                  border: "none", color: "white", fontSize: 14, fontWeight: 700,
                                  cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                                💙 See support &amp; crisis resources
                              </button>
                              <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => { setTab("reachout"); setJournalAlert(a => ({ ...a, dismissed: true })); }}
                                  style={{ flex: 1, padding: "11px", borderRadius: 12, background: "#f0f7ee",
                                    border: "1px solid #c8e0c0", color: "#2a5a2a", fontSize: 13,
                                    fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                                  💌 Reach out
                                </button>
                                <button onClick={() => { setTab("safetyplan"); setJournalAlert(a => ({ ...a, dismissed: true })); }}
                                  style={{ flex: 1, padding: "11px", borderRadius: 12, background: "#f0f7ee",
                                    border: "1px solid #c8e0c0", color: "#2a5a2a", fontSize: 13,
                                    fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                                  🛡️ My plan
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => { setTab("breathe"); setJournalAlert(a => ({ ...a, dismissed: true })); }}
                                  style={{ flex: 1, padding: "11px", borderRadius: 12, background: "#f0f7ee",
                                    border: "1px solid #c8e0c0", color: "#2a5a2a", fontSize: 12,
                                    fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                                  🌬️ Breathe
                                </button>
                                <button onClick={() => { setTab("night"); setJournalAlert(a => ({ ...a, dismissed: true })); }}
                                  style={{ flex: 1, padding: "11px", borderRadius: 12, background: "#f0f7ee",
                                    border: "1px solid #c8e0c0", color: "#2a5a2a", fontSize: 12,
                                    fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                                  🌙 Night mode
                                </button>
                                <button onClick={() => { setTab("reachout"); setJournalAlert(a => ({ ...a, dismissed: true })); }}
                                  style={{ flex: 1, padding: "11px", borderRadius: 12, background: "#f0f7ee",
                                    border: "1px solid #c8e0c0", color: "#2a5a2a", fontSize: 12,
                                    fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                                  💌 Reach out
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Write */}
                <div style={{ background: "#fafcf8", border: "1px solid #deeeda", borderRadius: 16, padding: 20 }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#5a8a5a", letterSpacing: 2, marginBottom: 12 }}>
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase()}
                  </div>
                  <textarea
                    value={journal}
                    onChange={e => setJournal(e.target.value)}
                    placeholder="What's on your mind? There are no rules here — write freely, vent, reflect, dream…"
                    rows={10}
                    style={{
                      width: "100%", background: "transparent", border: "none",
                      color: "#1a3a1a", fontSize: 14, lineHeight: 1.8,
                      fontFamily: "'Nunito Sans', sans-serif",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, borderTop: "1px solid #1e3a1e", paddingTop: 12 }}>
                    <span style={{ fontSize: 11, color: "#7aaa7a", fontFamily: "'DM Mono', monospace" }}>{journal.length} chars · {journalEntries.length} entries saved</span>
                    <button
                      onClick={saveJournalEntry}
                      style={{
                        padding: "8px 20px", borderRadius: 8,
                        border: "1px solid #bcd8b8", background: journalSaved ? "#22c55e22" : "#daeeda",
                        color: journalSaved ? "#22c55e" : "#2d6a2d", fontSize: 13,
                        cursor: "pointer", fontFamily: "'Nunito Sans', sans-serif", transition: "all 0.3s",
                      }}
                    >
                      {journalSaved ? "✓ Saved" : "Save Entry"}
                    </button>
                  </div>
                </div>

                {/* Prompts — personalised per profile */}
                <div style={{ background: "#fafcf8", border: "1px solid #deeeda", borderRadius: 16, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#5a8a5a", letterSpacing: 2 }}>JOURNAL PROMPTS</div>
                    {profile?.label && <div style={{ fontSize: 10, color: profile.color || "#9aba98", fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>{profile.emoji} {profile.label}</div>}
                  </div>
                  {/* AI responses coming soon banner */}
                  <div style={{ background: "linear-gradient(135deg, #f0f4ff, #e8eeff)", border: "1px solid #c0ccee", borderRadius: 12, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16 }}>✨</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#3a4a8a", fontFamily: "'Nunito', sans-serif" }}>AI journal responses — coming soon</div>
                      <div style={{ fontSize: 11, color: "#6a7ab0", fontFamily: "'Nunito Sans', sans-serif", marginTop: 1 }}>Anchor will gently reflect back what you write. Powered by Wired &amp; Well.</div>
                    </div>
                    <div style={{ fontSize: 9, background: "#3a4a8a", color: "white", padding: "3px 8px", borderRadius: 6, fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>SOON</div>
                  </div>
                  {(profile?.journalPrompts || [
                    "What am I grateful for today, even something small?",
                    "What's one thing I can let go of right now?",
                    "What does my body need that I haven't given it yet?",
                    "What would I tell a friend who felt the way I feel?",
                    "What small win can I celebrate from today?",
                    "What's been weighing on me that I haven't said out loud?",
                    "If today had a colour, what would it be and why?",
                  ]).map((p, i) => (
                    <div key={i} onClick={() => setJournal(journal ? journal + "\n\n" + p + "\n" : p + "\n")}
                      style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 8, cursor: "pointer",
                        background: "linear-gradient(135deg, #f0f9ee, #eaf4e8)",
                        border: "1px solid #d4e8cc", fontSize: 13, color: "#2a5a2a",
                        lineHeight: 1.5, fontFamily: "'Nunito Sans', sans-serif",
                        display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ color: profile?.color || "#22c55e", fontWeight: 800, fontSize: 14, marginTop: 1 }}>+</span>
                      {p}
                    </div>
                  ))}
                </div>

                {/* Past entries */}
                {journalEntries.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#5a8a5a", letterSpacing: 2, marginBottom: 10 }}>
                      PAST ENTRIES — {journalEntries.length}
                    </div>
                    {journalEntries.map(entry => (
                      <div key={entry.id} onClick={() => setViewingEntry(entry)}
                        style={{ background: "#fafcf8", border: "1px solid #deeeda", borderRadius: 14, padding: "14px 16px", marginBottom: 8, cursor: "pointer", transition: "border-color 0.2s" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                          <div style={{ fontSize: 12, fontFamily: "'Nunito', sans-serif", color: "#4a8a4a" }}>
                            {new Date(entry.id).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          </div>
                          <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#7aaa7a" }}>
                            {new Date(entry.id).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        <div style={{ fontSize: 13, color: "#3a7a3a", lineHeight: 1.5 }}>
                          {entry.text.length > 100 ? entry.text.slice(0, 100) + "…" : entry.text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ACTIVITIES TAB */}
        {tab === "activities" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Gentle intro */}
            <div style={{ textAlign: "center", padding: "8px 16px 4px" }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>🌱</div>
              <div style={{ fontSize: 18, fontFamily: "'Nunito', sans-serif", fontWeight: 800, color: "#2a4a2a", marginBottom: 6 }}>
                Small acts of care
              </div>
              <div style={{ fontSize: 13, color: "#8aaa88", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.7 }}>
                You don't have to do everything. Just one thing, when you can.
              </div>
            </div>

            {/* Notification permission */}
            {typeof Notification !== "undefined" && Notification.permission === "default" && customActivities.some(a => a.reminder) && (
              <div style={{ background: "linear-gradient(135deg, #f4fcf4, #edf7ed)", border: "1px solid #c4ddc0", borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22 }}>🔔</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#2a4a2a", fontFamily: "'Nunito', sans-serif" }}>Gentle reminders</div>
                  <div style={{ fontSize: 11, color: "#6a9060", fontFamily: "'Nunito Sans', sans-serif", marginTop: 2 }}>Allow notifications so Anchor can nudge you softly.</div>
                </div>
                <button onClick={requestNotificationPermission}
                  style={{ padding: "8px 16px", borderRadius: 20, background: "#34a853", border: "none", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", whiteSpace: "nowrap" }}>
                  Allow
                </button>
              </div>
            )}

            {/* Activity cards — soft, roomy, tap-friendly */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {customActivities.map(act => {
                const overdue = isOverdue(act);
                const timeSince = getTimeSince(act.id);
                const cardColor = act.color || "#22c55e";
                const hours = act.unit === "m" ? act.interval / 60 : act.unit === "d" ? act.interval * 24 : act.interval;
                const progressPct = activities[act.id]
                  ? Math.min(100, ((Date.now() - activities[act.id]) / (hours * 3600000)) * 100)
                  : 100;
                const remaining = Math.max(0, 100 - progressPct);

                return (
                  <div key={act.id} style={{
                    background: "#ffffff",
                    borderRadius: 22,
                    boxShadow: overdue
                      ? "0 4px 20px rgba(200,160,40,0.12), 0 1px 4px rgba(0,0,0,0.04)"
                      : "0 2px 16px rgba(60,100,60,0.07), 0 1px 4px rgba(0,0,0,0.03)",
                    border: `1px solid ${overdue ? "#f0dea0" : "#e8f2e4"}`,
                    overflow: "hidden",
                  }}>
                    {/* Top: emoji + name + edit */}
                    <div style={{ padding: "18px 18px 10px 18px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                      {/* Large emoji circle */}
                      <div style={{
                        width: 54, height: 54, borderRadius: 18, flexShrink: 0,
                        background: overdue ? "linear-gradient(135deg, #fef3c7, #fde68a)" : `linear-gradient(135deg, ${cardColor}22, ${cardColor}10)`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
                        boxShadow: overdue ? "0 2px 8px rgba(200,160,40,0.2)" : `0 2px 8px ${cardColor}20`,
                      }}>
                        {act.emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#1e3820", fontFamily: "'Nunito', sans-serif", lineHeight: 1.2, marginBottom: 3 }}>
                          {act.label}
                        </div>
                        <div style={{ fontSize: 12, color: overdue ? "#b08020" : "#8aaa88", fontFamily: "'Nunito Sans', sans-serif" }}>
                          {overdue
                            ? timeSince ? `Hasn't happened in a while · last ${timeSince}` : "Not yet today"
                            : timeSince ? `Last ${timeSince} · every ${act.interval}${act.unit}` : `Every ${act.interval}${act.unit}`
                          }
                        </div>
                        {act.reminder && (
                          <div style={{ marginTop: 5, display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 10 }}>🔔</span>
                            <span style={{ fontSize: 10, color: "#9abc98", fontFamily: "'Nunito Sans', sans-serif" }}>reminder on</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => { setEditingActivity({ ...act }); setAddingActivity(false); }}
                        style={{ width: 30, height: 30, borderRadius: 10, background: "#f4f8f2", border: "none", color: "#a0c0a0", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                      >✏️</button>
                    </div>

                    {/* Progress arc bar */}
                    <div style={{ padding: "0 18px" }}>
                      <div style={{ height: 5, background: "#f0f5ee", borderRadius: 10, overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${100 - remaining}%`,
                          background: overdue
                            ? "linear-gradient(90deg, #f0c040, #d4a020)"
                            : `linear-gradient(90deg, ${cardColor}90, ${cardColor})`,
                          borderRadius: 10,
                          transition: "width 1s ease",
                        }} />
                      </div>
                    </div>

                    {/* Done button — full width, feels like a soft tap */}
                    <div style={{ padding: "12px 18px 16px" }}>
                      <button
                        onClick={() => logActivity(act.id)}
                        style={{
                          width: "100%",
                          padding: "12px 0",
                          borderRadius: 14,
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "'Nunito', sans-serif",
                          fontWeight: 700,
                          fontSize: 14,
                          transition: "all 0.2s",
                          background: overdue
                            ? "linear-gradient(135deg, #f5e070, #e0c030)"
                            : `linear-gradient(135deg, ${cardColor}dd, ${cardColor})`,
                          color: overdue ? "#5a4000" : "white",
                          boxShadow: overdue
                            ? "0 3px 12px rgba(200,160,0,0.25)"
                            : `0 3px 12px ${cardColor}35`,
                        }}
                      >
                        {overdue ? "✨ I did this" : "✓ Done — I took care of myself"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add new — subtle, at the bottom */}
            <button
              onClick={() => { setAddingActivity(true); setEditingActivity(null); }}
              style={{
                width: "100%", padding: "14px", borderRadius: 18,
                background: "transparent",
                border: "2px dashed #cce4c4",
                color: "#7aaa7a", fontSize: 14, cursor: "pointer",
                fontFamily: "'Nunito', sans-serif", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <span style={{ fontSize: 18 }}>+</span> Add something new to care for
            </button>

            {/* Edit activity modal */}
            {editingActivity && (
              <div onClick={() => setEditingActivity(null)}
                style={{ position: "fixed", inset: 0, zIndex: 150, background: "rgba(20,40,20,0.5)", backdropFilter: "blur(12px)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 16px 32px" }}>
                <div onClick={e => e.stopPropagation()}
                  style={{ width: "100%", maxWidth: 480, background: "#f8fcf6", border: "1px solid #cce4c4", borderRadius: 28, padding: "24px 22px", boxShadow: "0 -8px 40px rgba(0,0,0,0.12)" }}>
                  <div style={{ width: 40, height: 4, background: "#c8e0c4", borderRadius: 2, margin: "0 auto 20px" }} />
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#1e3820", fontFamily: "'Nunito', sans-serif", marginBottom: 18 }}>Edit</div>

                  <div style={{ fontSize: 10, color: "#9aba98", fontFamily: "'DM Mono', monospace", letterSpacing: 2, marginBottom: 8 }}>CHOOSE AN EMOJI</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                    {EMOJI_OPTIONS.map(e => (
                      <div key={e} onClick={() => setEditingActivity(a => ({ ...a, emoji: e }))}
                        style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, cursor: "pointer",
                          background: editingActivity.emoji === e ? "#d4f0cc" : "#f0f7ee",
                          border: `1.5px solid ${editingActivity.emoji === e ? "#6ab86a" : "#e0eede"}` }}>
                        {e}
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: 10, color: "#9aba98", fontFamily: "'DM Mono', monospace", letterSpacing: 2, marginBottom: 6 }}>LABEL</div>
                  <input value={editingActivity.label} onChange={e => setEditingActivity(a => ({ ...a, label: e.target.value }))}
                    style={{ width: "100%", background: "#f0f7ee", border: "1.5px solid #d4e8d0", borderRadius: 12, color: "#1a3a1a", fontSize: 15, padding: "11px 14px", fontFamily: "'Nunito', sans-serif", fontWeight: 600, outline: "none", marginBottom: 14 }} />

                  <div style={{ fontSize: 10, color: "#9aba98", fontFamily: "'DM Mono', monospace", letterSpacing: 2, marginBottom: 8 }}>REMIND ME EVERY</div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    <input type="number" min="1" max="999" value={editingActivity.interval} onChange={e => setEditingActivity(a => ({ ...a, interval: parseInt(e.target.value) || 1 }))}
                      style={{ width: 72, background: "#f0f7ee", border: "1.5px solid #d4e8d0", borderRadius: 12, color: "#1a3a1a", fontSize: 18, padding: "10px", fontFamily: "'Nunito', sans-serif", fontWeight: 700, outline: "none", textAlign: "center" }} />
                    {UNIT_OPTIONS.map(u => (
                      <button key={u.value} onClick={() => setEditingActivity(a => ({ ...a, unit: u.value }))}
                        style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none",
                          background: editingActivity.unit === u.value ? "#2a5a2a" : "#f0f7ee",
                          color: editingActivity.unit === u.value ? "white" : "#7aaa7a",
                          fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                        {u.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize: 10, color: "#9aba98", fontFamily: "'DM Mono', monospace", letterSpacing: 2, marginBottom: 8 }}>COLOUR</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                    {["#22c55e","#34a853","#38bdf8","#818cf8","#f472b6","#fb923c","#fbbf24","#ef4444","#10b981","#a78bfa"].map(c => (
                      <div key={c} onClick={() => setEditingActivity(a => ({ ...a, color: c }))}
                        style={{ width: 32, height: 32, borderRadius: 10, background: c, cursor: "pointer",
                          border: editingActivity.color === c ? "3px solid #1a3a1a" : "3px solid transparent",
                          boxShadow: editingActivity.color === c ? "0 2px 8px rgba(0,0,0,0.2)" : "none" }} />
                    ))}
                  </div>

                  <div onClick={() => setEditingActivity(a => ({ ...a, reminder: !a.reminder }))}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0f7ee", border: "1.5px solid #d4e8d0", borderRadius: 14, padding: "13px 16px", cursor: "pointer", marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 14, color: "#1e3820", fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>🔔 Send me reminders</div>
                      <div style={{ fontSize: 11, color: "#8aaa88", marginTop: 2, fontFamily: "'Nunito Sans', sans-serif" }}>Every {editingActivity.interval}{editingActivity.unit}</div>
                    </div>
                    <div style={{ width: 48, height: 26, borderRadius: 13, background: editingActivity.reminder ? "#22c55e" : "#d8eed4", border: "none", position: "relative", transition: "background 0.25s" }}>
                      <div style={{ position: "absolute", top: 3, left: editingActivity.reminder ? 24 : 3, width: 20, height: 20, borderRadius: "50%", background: "white", transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => deleteActivity(editingActivity.id)}
                      style={{ flex: 1, padding: 13, borderRadius: 14, background: "#fff0f0", border: "1px solid #f0cccc", color: "#c06060", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                      Remove
                    </button>
                    <button onClick={() => saveActivityEdit(editingActivity)}
                      style={{ flex: 2, padding: 13, borderRadius: 14, background: "linear-gradient(135deg, #34a853, #2a8a44)", border: "none", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add new activity modal */}
            {addingActivity && (
              <div onClick={() => setAddingActivity(false)}
                style={{ position: "fixed", inset: 0, zIndex: 150, background: "rgba(20,40,20,0.5)", backdropFilter: "blur(12px)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 16px 32px" }}>
                <div onClick={e => e.stopPropagation()}
                  style={{ width: "100%", maxWidth: 480, background: "#f8fcf6", border: "1px solid #cce4c4", borderRadius: 28, padding: "24px 22px", boxShadow: "0 -8px 40px rgba(0,0,0,0.12)" }}>
                  <div style={{ width: 40, height: 4, background: "#c8e0c4", borderRadius: 2, margin: "0 auto 20px" }} />
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#1e3820", fontFamily: "'Nunito', sans-serif", marginBottom: 4 }}>Add something to care for</div>
                  <div style={{ fontSize: 12, color: "#8aaa88", fontFamily: "'Nunito Sans', sans-serif", marginBottom: 18 }}>Big or small — it all counts.</div>

                  <div style={{ fontSize: 10, color: "#9aba98", fontFamily: "'DM Mono', monospace", letterSpacing: 2, marginBottom: 8 }}>EMOJI</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                    {EMOJI_OPTIONS.map(e => (
                      <div key={e} onClick={() => setNewActivity(a => ({ ...a, emoji: e }))}
                        style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, cursor: "pointer",
                          background: newActivity.emoji === e ? "#d4f0cc" : "#f0f7ee",
                          border: `1.5px solid ${newActivity.emoji === e ? "#6ab86a" : "#e0eede"}` }}>
                        {e}
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: 10, color: "#9aba98", fontFamily: "'DM Mono', monospace", letterSpacing: 2, marginBottom: 6 }}>WHAT IS IT?</div>
                  <input value={newActivity.label} onChange={e => setNewActivity(a => ({ ...a, label: e.target.value }))}
                    placeholder="e.g. Drink water, take medication, step outside…"
                    style={{ width: "100%", background: "#f0f7ee", border: "1.5px solid #d4e8d0", borderRadius: 12, color: "#1a3a1a", fontSize: 15, padding: "11px 14px", fontFamily: "'Nunito', sans-serif", fontWeight: 600, outline: "none", marginBottom: 14 }} />

                  <div style={{ fontSize: 10, color: "#9aba98", fontFamily: "'DM Mono', monospace", letterSpacing: 2, marginBottom: 8 }}>HOW OFTEN?</div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    <input type="number" min="1" max="999" value={newActivity.interval} onChange={e => setNewActivity(a => ({ ...a, interval: parseInt(e.target.value) || 1 }))}
                      style={{ width: 72, background: "#f0f7ee", border: "1.5px solid #d4e8d0", borderRadius: 12, color: "#1a3a1a", fontSize: 18, padding: "10px", fontFamily: "'Nunito', sans-serif", fontWeight: 700, outline: "none", textAlign: "center" }} />
                    {UNIT_OPTIONS.map(u => (
                      <button key={u.value} onClick={() => setNewActivity(a => ({ ...a, unit: u.value }))}
                        style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none",
                          background: newActivity.unit === u.value ? "#2a5a2a" : "#f0f7ee",
                          color: newActivity.unit === u.value ? "white" : "#7aaa7a",
                          fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                        {u.label}
                      </button>
                    ))}
                  </div>

                  <div onClick={() => setNewActivity(a => ({ ...a, reminder: !a.reminder }))}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0f7ee", border: "1.5px solid #d4e8d0", borderRadius: 14, padding: "13px 16px", cursor: "pointer", marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 14, color: "#1e3820", fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>🔔 Remind me</div>
                      <div style={{ fontSize: 11, color: "#8aaa88", marginTop: 2, fontFamily: "'Nunito Sans', sans-serif" }}>Ping me every {newActivity.interval}{newActivity.unit}</div>
                    </div>
                    <div style={{ width: 48, height: 26, borderRadius: 13, background: newActivity.reminder ? "#22c55e" : "#d8eed4", position: "relative", transition: "background 0.25s" }}>
                      <div style={{ position: "absolute", top: 3, left: newActivity.reminder ? 24 : 3, width: 20, height: 20, borderRadius: "50%", background: "white", transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setAddingActivity(false)}
                      style={{ flex: 1, padding: 13, borderRadius: 14, background: "transparent", border: "1.5px solid #d4e8d0", color: "#8aaa88", fontSize: 13, cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
                      Cancel
                    </button>
                    <button onClick={addNewActivity} disabled={!newActivity.label.trim()}
                      style={{ flex: 2, padding: 13, borderRadius: 14, border: "none",
                        background: newActivity.label.trim() ? "linear-gradient(135deg, #34a853, #2a8a44)" : "#e4f0e0",
                        color: newActivity.label.trim() ? "white" : "#a0c8a0",
                        fontSize: 14, fontWeight: 700, cursor: newActivity.label.trim() ? "pointer" : "default", fontFamily: "'Nunito', sans-serif" }}>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* BREATHE TAB */}
        {tab === "breathe" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, paddingTop: 8 }}>

            {/* Soft header */}
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: 13, color: "#88aa88", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.7 }}>
                When your nervous system is overwhelmed,<br />breathing is the fastest way back to yourself.
              </div>
            </div>

            {/* Box breathing circle */}
            <div style={{ background: "#fafcf8", border: "1px solid #deeeda", borderRadius: 24, padding: "24px 20px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontFamily: "'Nunito', sans-serif", fontWeight: 800, color: "#2a5a2a", marginBottom: 4 }}>Box Breathing</div>
                <div style={{ fontSize: 12, color: "#7a9a7a", fontFamily: "'Nunito Sans', sans-serif" }}>4 in · 4 hold · 4 out · repeat 4 times</div>
              </div>

              {/* Fixed outer container — never changes size, circle grows inside it */}
              <div style={{ width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div
                  onClick={!breatheActive ? startBreathe : undefined}
                  style={{
                    width: breathePhase === "in" || breathePhase === "hold" ? 180 : 130,
                    height: breathePhase === "in" || breathePhase === "hold" ? 180 : 130,
                    borderRadius: "50%",
                    border: `3px solid ${
                      breathePhase === "in" ? "#22c55e" :
                      breathePhase === "hold" ? "#4ade80" :
                      breathePhase === "out" ? "#86efac" : "#c8e4c4"
                    }`,
                    background: `radial-gradient(circle, ${
                      breathePhase === "ready" ? "#f0f7f0" :
                      breathePhase === "in" ? "#22c55e30" :
                      breathePhase === "hold" ? "#4ade8025" : "#86efac18"
                    } 0%, #eef6ec 70%)`,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    cursor: breatheActive ? "default" : "pointer",
                    boxShadow: breathePhase !== "ready"
                      ? `0 0 ${breathePhase === "in" || breathePhase === "hold" ? "50px" : "20px"} ${breathePhase === "in" ? "rgba(34,197,94,0.25)" : "rgba(74,222,128,0.15)"}`
                      : "0 2px 20px rgba(0,0,0,0.06)",
                    userSelect: "none",
                    transition: "width 4s ease-in-out, height 4s ease-in-out, background 4s ease-in-out, border-color 4s ease-in-out, box-shadow 4s ease-in-out",
                  }}
                >
                  <div style={{ fontSize: 13, fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: breathePhase === "ready" ? "#7a9a7a" : "#2a5a2a", textAlign: "center", letterSpacing: 0.3, transition: "color 1s" }}>
                    {breatheLabel[breathePhase]}
                  </div>
                  {breatheActive && (
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#2a5a2a", marginTop: 5, fontFamily: "'Nunito', sans-serif" }}>
                      {breatheCount + 1}/4
                    </div>
                  )}
                  {!breatheActive && (
                    <div style={{ fontSize: 11, color: "#9aba98", marginTop: 4, fontFamily: "'Nunito Sans', sans-serif" }}>
                      tap to begin
                    </div>
                  )}
                </div>
              </div>

              {breatheActive && (
                <button onClick={() => { clearTimeout(breatheRef.current); setBreatheActive(false); setBreathePhase("ready"); }}
                  style={{ padding: "8px 24px", borderRadius: 20, background: "transparent", border: "1px solid #c8e4c4", color: "#7a9a7a", cursor: "pointer", fontSize: 13, fontFamily: "'Nunito Sans', sans-serif" }}>
                  Stop
                </button>
              )}
            </div>

            {/* Technique cards */}
            {[
              {
                emoji: "🌊",
                name: "4-7-8 Breathing",
                sub: "For anxiety & sleep",
                desc: "Breathe in for 4 counts. Hold for 7. Out slowly for 8. This activates your parasympathetic nervous system and is particularly good before sleep or during anxiety spikes.",
                steps: ["In through nose — 4 counts", "Hold — 7 counts", "Out through mouth — 8 counts", "Repeat 3–4 times"],
                color: "#38bdf8",
              },
              {
                emoji: "🌿",
                name: "Grounding 5-4-3-2-1",
                sub: "For panic & dissociation",
                desc: "Brings you back into your body and out of your head. Use when thoughts are spiralling or you feel disconnected from what's real.",
                steps: ["5 things you can see", "4 things you can physically feel", "3 things you can hear", "2 things you can smell", "1 thing you can taste"],
                color: "#22c55e",
              },
              {
                emoji: "🧘",
                name: "Body Scan",
                sub: "For tension & overwhelm",
                desc: "Close your eyes. Starting at the top of your head, slowly move your attention down through your body. Notice where you're holding tension — jaw, shoulders, chest, stomach — and consciously soften each area.",
                steps: ["Head & face — unclench your jaw", "Neck & shoulders — let them drop", "Chest & stomach — breathe into it", "Hands & legs — feel the weight of them"],
                color: "#a78bfa",
              },
              {
                emoji: "💧",
                name: "Cold Water Reset",
                sub: "For acute stress & panic",
                desc: "The dive reflex. Splashing cold water on your face or holding your wrists under cold water triggers an immediate nervous system response that slows your heart rate.",
                steps: ["Hold wrists under cold water for 30s", "Or splash cold water on your face", "Or hold ice cubes briefly", "Focus on the physical sensation only"],
                color: "#0ea5e9",
              },
              {
                emoji: "🌬️",
                name: "Physiological Sigh",
                sub: "Fastest stress relief — 1 breath",
                desc: "The quickest way to calm down. Used by athletes and recommended by neuroscientists. It deflates stress balloons in your lungs caused by shallow breathing.",
                steps: ["Breathe in fully through your nose", "At the top, take one more short sniff", "Then exhale slowly and completely", "One or two of these is enough"],
                color: "#10b981",
              },
            ].map((t, i) => (
              <div key={i} style={{ width: "100%", background: "#fafcf8", border: "1px solid #deeeda", borderRadius: 18, overflow: "hidden" }}>
                <div style={{ height: 3, background: `linear-gradient(90deg, ${t.color}, ${t.color}66)` }} />
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 13, background: `${t.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{t.emoji}</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#1e3820", fontFamily: "'Nunito', sans-serif" }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: t.color, fontFamily: "'Nunito Sans', sans-serif", fontWeight: 600 }}>{t.sub}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "#4a6a4a", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.7, marginBottom: 12 }}>{t.desc}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {t.steps.map((step, si) => (
                      <div key={si} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${t.color}20`, border: `1px solid ${t.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: t.color, fontFamily: "'Nunito', sans-serif", flexShrink: 0, marginTop: 1 }}>{si+1}</div>
                        <div style={{ fontSize: 12, color: "#5a7a5a", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.5 }}>{step}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div style={{ fontSize: 11, color: "#9aba98", textAlign: "center", fontFamily: "'Nunito Sans', sans-serif", paddingBottom: 8 }}>
              There's no wrong way to breathe. Any of these is better than none.
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (() => {
          const now = Date.now();
          const msPerDay = 86400000;
          const days = trendView === "week" ? 7 : 28;
          const recentEntries = entries.filter(e => e.id >= now - 7 * msPerDay);
          const avgMoodWeek = recentEntries.filter(e => e.mood).length
            ? (recentEntries.reduce((s,e) => s+(e.mood||0),0)/recentEntries.filter(e=>e.mood).length).toFixed(1) : null;
          const avgStressWeek = recentEntries.filter(e => e.stress).length
            ? (recentEntries.reduce((s,e) => s+(e.stress||0),0)/recentEntries.filter(e=>e.stress).length).toFixed(1) : null;
          const moodEmoji = avgMoodWeek ? MOODS.find(m => m.value === Math.round(avgMoodWeek))?.emoji : null;

          const buckets = Array.from({ length: days }, (_, i) => {
            const dayStart = now - (days-1-i)*msPerDay;
            const dayEntries = entries.filter(e => e.id >= dayStart && e.id < dayStart+msPerDay);
            const avgM = dayEntries.filter(e=>e.mood).length ? dayEntries.reduce((s,e)=>s+(e.mood||0),0)/dayEntries.filter(e=>e.mood).length : null;
            const avgS = dayEntries.filter(e=>e.stress).length ? dayEntries.reduce((s,e)=>s+(e.stress||0),0)/dayEntries.filter(e=>e.stress).length : null;
            return { label: new Date(dayStart).toLocaleDateString("en-GB",{day:"numeric",month:"short"}), mood: avgM?parseFloat(avgM.toFixed(1)):null, stress: avgS?parseFloat(avgS.toFixed(1)):null };
          });
          const maxVal = 10;
          const chartH = 140;
          const chartW = 300;

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {recentEntries.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[
                    { emoji: moodEmoji||"—", label: "AVG MOOD", value: avgMoodWeek||"—", color: "#2d6a2d" },
                    { emoji: "🌡️", label: "AVG STRESS", value: avgStressWeek||"—", color: avgStressWeek>6?"#ef4444":avgStressWeek>3?"#f97316":"#22c55e" },
                    { emoji: "📝", label: "THIS WEEK", value: `${recentEntries.length}`, color: "#2d6a2d" },
                  ].map(card => (
                    <div key={card.label} style={{ background: "#fafcf8", border: "1px solid #deeeda", borderRadius: 14, padding: "12px 8px", textAlign: "center" }}>
                      <div style={{ fontSize: 22 }}>{card.emoji}</div>
                      <div style={{ fontSize: 9, color: "#7a9a7a", fontFamily: "'DM Mono', monospace", letterSpacing: 1, margin: "3px 0" }}>{card.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: card.color, fontFamily: "'Nunito', sans-serif" }}>{card.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* SVG Trend Chart */}
              <div style={{ background: "#fafcf8", border: "1px solid #deeeda", borderRadius: 16, padding: "16px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#9aba98", letterSpacing: 2.5 }}>TREND</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["week","month"].map(v => (
                      <button key={v} onClick={() => setTrendView(v)}
                        style={{ padding: "4px 10px", borderRadius: 8, border: `1px solid ${trendView===v?"#7ab87a":"#d4e8cc"}`, background: trendView===v?"#d4ecd0":"#f5f8f3", color: trendView===v?"#2d6a2d":"#7a9a7a", fontSize: 10, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
                        {v==="week"?"7d":"28d"}
                      </button>
                    ))}
                  </div>
                </div>
                {buckets.some(b => b.mood||b.stress) ? (
                  <svg width="100%" viewBox={`0 0 ${chartW} ${chartH+30}`} style={{ overflow: "visible" }}>
                    {/* Grid lines */}
                    {[0,2,4,6,8,10].map(v => (
                      <line key={v} x1="0" x2={chartW} y1={chartH-(v/maxVal)*chartH} y2={chartH-(v/maxVal)*chartH} stroke="#e8f0e4" strokeWidth="1"/>
                    ))}
                    {/* Mood line */}
                    {buckets.map((b,i) => b.mood && i>0 && buckets[i-1].mood ? (
                      <line key={`m${i}`}
                        x1={(i-1)/(days-1)*chartW} y1={chartH-(buckets[i-1].mood/5)*chartH}
                        x2={i/(days-1)*chartW} y2={chartH-(b.mood/5)*chartH}
                        stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
                    ) : null)}
                    {/* Stress line */}
                    {buckets.map((b,i) => b.stress && i>0 && buckets[i-1].stress ? (
                      <line key={`s${i}`}
                        x1={(i-1)/(days-1)*chartW} y1={chartH-(buckets[i-1].stress/maxVal)*chartH}
                        x2={i/(days-1)*chartW} y2={chartH-(b.stress/maxVal)*chartH}
                        stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 2"/>
                    ) : null)}
                    {/* Dots */}
                    {buckets.map((b,i) => b.mood ? <circle key={`md${i}`} cx={i/(days-1)*chartW} cy={chartH-(b.mood/5)*chartH} r="3" fill="#22c55e"/> : null)}
                    {buckets.map((b,i) => b.stress ? <circle key={`sd${i}`} cx={i/(days-1)*chartW} cy={chartH-(b.stress/maxVal)*chartH} r="3" fill="#ef4444"/> : null)}
                    {/* X labels - show every 3rd */}
                    {buckets.filter((_,i)=>i%(Math.ceil(days/5))===0).map((b,i,arr) => {
                      const origIdx = i*(Math.ceil(days/5));
                      return <text key={i} x={origIdx/(days-1)*chartW} y={chartH+18} fontSize="9" fill="#9aba98" textAnchor="middle">{b.label}</text>;
                    })}
                  </svg>
                ) : (
                  <div style={{ textAlign: "center", padding: "24px", color: "#7a9a7a" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🌱</div>
                    <div style={{ fontSize: 13, fontFamily: "'Nunito Sans', sans-serif" }}>Start checking in to see your trends</div>
                  </div>
                )}
                <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#7a9a7a" }}>
                    <div style={{ width: 14, height: 2, background: "#22c55e", borderRadius: 1 }} /> Mood
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#7a9a7a" }}>
                    <div style={{ width: 14, height: 2, background: "#ef4444", borderRadius: 1 }} /> Stress
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#9aba98", letterSpacing: 2.5 }}>{entries.length} CHECK-INS LOGGED</div>
              {entries.slice(0,10).map(entry => {
                const moodObj = MOODS.find(m => m.value === entry.mood);
                const d = new Date(entry.id);
                return (
                  <div key={entry.id} style={{ background: "#fafcf8", border: "1px solid #deeeda", borderRadius: 14, padding: "13px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#9aba98" }}>
                        {d.toLocaleDateString("en-GB")} {d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {moodObj && <span style={{ fontSize: 16 }}>{moodObj.emoji}</span>}
                        {entry.stress>0 && <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: STRESS_COLORS[entry.stress], background: `${STRESS_COLORS[entry.stress]}18`, padding: "1px 7px", borderRadius: 6 }}>{entry.stress}/10</span>}
                      </div>
                    </div>
                    {entry.journal && <div style={{ fontSize: 12, color: "#5a7a5a", lineHeight: 1.5, fontFamily: "'Nunito Sans', sans-serif" }}>{entry.journal.slice(0,100)}{entry.journal.length>100?"…":""}</div>}
                  </div>
                );
              })}
            </div>
          );
        })()}
        {/* NIGHT MODE TAB */}
        {tab === "night" && (() => {
          const STEPS = [
            { emoji: "🌙", title: "You're safe right now.", body: "Wherever you are, whatever your mind is doing — you are physically safe in this moment. Let's just start there.", action: "I hear you" },
            { emoji: "👂", title: "Name 3 things you can hear.", body: "Don't try to sleep. Don't try to think less. Just listen. The hum of something. A sound outside. Your own breathing.", action: "I found them" },
            { emoji: "🤲", title: "Feel where your body touches the bed.", body: "Your heels. The back of your legs. Your shoulders. Your head. Notice the weight of you. Just notice.", action: "I can feel it" },
            { emoji: "💨", title: "One slow breath. Just one.", body: "In through your nose for 4 counts. Hold for 2. Out through your mouth for 6. Slow, slow, slow.", action: "Done" },
            { emoji: "🌿", title: "Your thoughts are not facts.", body: "Whatever is circling right now — it feels urgent, but it doesn't need solving tonight. It will still be there in the morning.", action: "I know" },
            { emoji: "🌙", title: "You made it through.", body: "That matters. Even if you're still awake. You reached out instead of spiralling alone. That was the right thing to do.", action: "Close ♡" },
          ];
          const step = STEPS[Math.min(nightStep, STEPS.length - 1)];
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {nightMode === "menu" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ textAlign: "center", padding: "16px 8px 8px" }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>🌙</div>
                    <div style={{ fontSize: 22, fontFamily: "'Nunito', sans-serif", fontWeight: 800, color: "#2a3a4a", marginBottom: 8 }}>Can't sleep?</div>
                    <div style={{ fontSize: 14, color: "#6a8090", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.7 }}>That restless, racing, won't-stop-spinning feeling. You don't have to lie there fighting it alone.</div>
                  </div>
                  {[
                    { mode: "settle", emoji: "🌊", title: "Settle my thoughts", desc: "A gentle stepped guide to slow the spiral. No effort needed.", bg: "#f0f6ff", border: "#c8d8f0", titleColor: "#2a3a6a", descColor: "#6070a0" },
                    { mode: "ramble", emoji: "✍️", title: "Get it out of my head", desc: "Just write. Anything. No one reads it. Sometimes naming it loosens the grip.", bg: "#f5f0ff", border: "#c8b8e8", titleColor: "#4a2a6a", descColor: "#7060a0" },
                  ].map(opt => (
                    <div key={opt.mode} onClick={() => { setNightMode(opt.mode); setNightStep(0); }}
                      style={{ background: opt.bg, border: `1px solid ${opt.border}`, borderRadius: 18, padding: "18px 20px", cursor: "pointer" }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{opt.emoji}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: opt.titleColor, fontFamily: "'Nunito', sans-serif", marginBottom: 4 }}>{opt.title}</div>
                      <div style={{ fontSize: 13, color: opt.descColor, fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.5 }}>{opt.desc}</div>
                    </div>
                  ))}
                  <div onClick={() => setTab("breathe")}
                    style={{ background: "#f0fdf4", border: "1px solid #b8ddc8", borderRadius: 16, padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>🌬️</span>
                    <div><div style={{ fontSize: 14, fontWeight: 700, color: "#1a4a2a", fontFamily: "'Nunito', sans-serif" }}>Breathe with me</div>
                    <div style={{ fontSize: 12, color: "#5a8a6a", fontFamily: "'Nunito Sans', sans-serif" }}>Go to the breathing guide</div></div>
                  </div>
                  <div onClick={() => setShowCrisis(true)}
                    style={{ background: "#fff8f8", border: "1px solid #f0cac8", borderRadius: 14, padding: "13px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>💙</span>
                    <div style={{ fontSize: 13, color: "#8a4040", fontFamily: "'Nunito Sans', sans-serif" }}>This feels like more than not sleeping — I need support</div>
                  </div>
                </div>
              )}
              {nightMode === "settle" && (
                <div style={{ display: "flex", flexDirection: "column", minHeight: "65vh", justifyContent: "space-between" }}>
                  <div style={{ textAlign: "center", padding: "28px 16px 20px" }}>
                    <div style={{ fontSize: 50, marginBottom: 16 }}>{step.emoji}</div>
                    <div style={{ fontSize: 20, fontFamily: "'Nunito', sans-serif", fontWeight: 800, color: "#2a3a5a", marginBottom: 14, lineHeight: 1.3 }}>{step.title}</div>
                    <div style={{ fontSize: 14, color: "#5a6a80", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.8, maxWidth: 300, margin: "0 auto" }}>{step.body}</div>
                  </div>
                  <div style={{ paddingBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
                      {STEPS.map((_, i) => <div key={i} style={{ width: i===nightStep?18:6, height: 6, borderRadius: 3, background: i===nightStep?"#5580cc":"#c8d8e8", transition: "all 0.3s" }} />)}
                    </div>
                    <button onClick={() => { if(nightStep<STEPS.length-1) setNightStep(s=>s+1); else { setNightMode("menu"); setNightStep(0); } }}
                      style={{ width: "100%", padding: "15px", borderRadius: 14, background: "linear-gradient(135deg, #5580cc, #4060aa)", border: "none", color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                      {nightStep < STEPS.length-1 ? step.action + " →" : "Close ♡"}
                    </button>
                    <button onClick={() => { setNightMode("menu"); setNightStep(0); }}
                      style={{ width: "100%", marginTop: 8, padding: "10px", borderRadius: 10, background: "transparent", border: "none", color: "#90a0b0", fontSize: 13, cursor: "pointer", fontFamily: "'Nunito Sans', sans-serif" }}>← Back</button>
                  </div>
                </div>
              )}
              {nightMode === "ramble" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 13, color: "#8a80a0", fontFamily: "'Nunito Sans', sans-serif", fontStyle: "italic", lineHeight: 1.6, textAlign: "center", padding: "8px 0" }}>
                    Just write. No rules. No one will read this.
                  </div>
                  <textarea value={nightText} onChange={e => setNightText(e.target.value)} placeholder="It's okay to start mid-thought. Start anywhere…" autoFocus
                    style={{ width: "100%", minHeight: 260, background: "#fafcf8", border: "1px solid #d4e0d0", borderRadius: 14, color: "#2a3a2a", fontSize: 15, lineHeight: 1.9, padding: "14px", fontFamily: "'Nunito Sans', sans-serif", outline: "none", resize: "none" }} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => { setNightText(""); setNightMode("menu"); }}
                      style={{ flex: 1, padding: 12, borderRadius: 12, background: "transparent", border: "1px solid #d0e0cc", color: "#7a9080", fontSize: 13, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>Clear &amp; done</button>
                    <button onClick={() => {
                      if(nightText.trim()) {
                        const e = { id: Date.now(), text: "[Night note] "+nightText.trim(), date: new Date().toISOString() };
                        const u = [e, ...journalEntries].slice(0, 50);
                        setJournalEntries(u);
                        try { localStorage.setItem("mh_journal_entries", JSON.stringify(u)); } catch {}
                      }
                      setNightText(""); setNightMode("menu");
                    }}
                      style={{ flex: 2, padding: 12, borderRadius: 12, background: "linear-gradient(135deg, #7060b0, #5a4a9a)", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>Save to journal</button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* REACH OUT TAB */}
        {tab === "reachout" && (() => {
          const people = safetyPlan?.supportPeople?.trim()
            ? safetyPlan.supportPeople.trim().split("\n").filter(Boolean).map((line, i) => {
                const ph = line.match(/[\d\s+\-()]{7,}/);
                return { name: line.replace(ph?.[0]||"","").replace(/[-—–:,]/g,"").trim() || `Person ${i+1}`, phone: ph?.[0]?.replace(/\s/g,"") || null, raw: line };
              })
            : [];

          const QUICK = [
            { emoji: "🤗", label: "I could just use a hug", text: "Hey. I'm having a hard time and could really just use a hug, or even just knowing someone's there. No need to fix anything. 💙" },
            { emoji: "💬", label: "Can we talk?", text: "Hey, are you around? I'm struggling a bit and could really do with a chat. Even just a few minutes would help." },
            { emoji: "🌙", label: "Can't sleep, head's busy", text: "I can't sleep and my head won't quiet down. Just reaching out because it helps to tell someone. You don't have to do anything." },
            { emoji: "😶", label: "Not great, just wanted you to know", text: "Not doing great today. Not sure what I need but didn't want to keep it to myself." },
          ];
          const SCRIPTS = [
            { title: "When you don't know how to start", text: "I've been struggling and I find it hard to ask for help. But I'm trying. I don't need you to fix anything — I just needed to say it to someone I trust." },
            { title: "When you're exhausted", text: "I'm really tired. Not just physically — the kind of tired where everything feels heavy. I'm not in crisis, I just need someone to know today is hard." },
            { title: "When anxiety is loud", text: "My anxiety is quite bad right now. My thoughts are going in circles. I don't know what would help but reaching out felt like the right thing." },
            { title: "When you've been masking", text: "I've been putting on a brave face for a while and I'm running out of steam. I'm okay but I'm not okay, if that makes sense." },
          ];

          if (people.length === 0) return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>💌</div>
                <div style={{ fontSize: 20, fontFamily: "'Nunito', sans-serif", fontWeight: 800, color: "#2a4a2a", marginBottom: 8 }}>Reach Out</div>
                <div style={{ fontSize: 13, color: "#6a8a6a", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.8 }}>
                  Add the people you trust below and you'll be able to message them in one tap — even when you can't find the words yourself.
                </div>
              </div>

              {/* Inline add form — no navigation needed */}
              <div style={{ background: "linear-gradient(135deg, #f8fcf6, #f2f8f0)", border: "1.5px solid #c8e4c0", borderRadius: 22, padding: "20px 18px" }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#1e3820", fontFamily: "'Nunito', sans-serif", marginBottom: 4 }}>
                  Add someone you trust
                </div>
                <div style={{ fontSize: 12, color: "#8aaa88", fontFamily: "'Nunito Sans', sans-serif", marginBottom: 16, lineHeight: 1.6 }}>
                  Add one person to start. You can add more later in My Plan.
                </div>
                <div style={{ fontSize: 10, color: "#9aba98", fontFamily: "'DM Mono', monospace", letterSpacing: 2, marginBottom: 6 }}>THEIR NAME &amp; NUMBER</div>
                <textarea
                  value={reachOutInputText}
                  onChange={e => setReachOutInputText(e.target.value)}
                  placeholder={"Mum — 07700 900123\nBest friend Sarah — 07900 123456\nMy therapist — Tues 3pm"}
                  rows={4}
                  autoCorrect="off"
                  autoCapitalize="words"
                  spellCheck={false}
                  style={{
                    width: "100%", background: "#ffffff", border: "1.5px solid #d4e8cc",
                    borderRadius: 14, color: "#1a3a1a", fontSize: 15, lineHeight: 1.9,
                    padding: "12px 14px", fontFamily: "'Nunito Sans', sans-serif",
                    outline: "none", resize: "none",
                  }}
                />
                <div style={{ fontSize: 11, color: "#9aba98", fontFamily: "'Nunito Sans', sans-serif", marginTop: 6, marginBottom: 14 }}>
                  One person per line. Include their number if you have it.
                </div>
                <button
                  onClick={() => {
                    const text = reachOutInputText.trim();
                    if (!text) return;
                    // Update both safetyPlan state and localStorage atomically
                    const updated = { ...safetyPlan, supportPeople: text, lastUpdated: new Date().toISOString() };
                    setSafetyPlan(updated);
                    localStorage.setItem("mh_safety_plan", JSON.stringify(updated));
                    setPlanSaved(true);
                    setTimeout(() => setPlanSaved(false), 3000);
                  }}
                  disabled={!reachOutInputText.trim()}
                  style={{
                    width: "100%", padding: "13px", borderRadius: 14, border: "none",
                    background: reachOutInputText.trim()
                      ? "linear-gradient(135deg, #34a853, #2a8a44)"
                      : "#e4f0e0",
                    color: reachOutInputText.trim() ? "white" : "#a0c8a0",
                    fontSize: 14, fontWeight: 700, cursor: reachOutInputText.trim() ? "pointer" : "default",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  {planSaved ? "✓ Saved — your people are ready" : "Save my people"}
                </button>
              </div>

              {/* Preview of what they unlock */}
              <div style={{ background: "#fafcf8", border: "1px solid #deeeda", borderRadius: 18, padding: "16px 18px", opacity: 0.6 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#2a4a2a", fontFamily: "'Nunito', sans-serif", marginBottom: 10 }}>Once added, you'll be able to send…</div>
                {[
                  { emoji: "🤗", label: "I could just use a hug" },
                  { emoji: "💬", label: "Can we talk?" },
                  { emoji: "🌙", label: "Can't sleep, head's busy" },
                ].map((m, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 2 ? "1px solid #eef4ec" : "none" }}>
                    <span style={{ fontSize: 18 }}>{m.emoji}</span>
                    <span style={{ fontSize: 13, color: "#5a7a5a", fontFamily: "'Nunito Sans', sans-serif" }}>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          );

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💌</div>
                <div style={{ fontSize: 20, fontFamily: "'Nunito', sans-serif", fontWeight: 800, color: "#2a4a2a", marginBottom: 4 }}>Reach Out</div>
                <div style={{ fontSize: 13, color: "#6a8a6a", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.6 }}>
                  You don't have to find the words.<br />We'll help you say what you mean.
                </div>
              </div>

              {/* People selector */}
              <div>
                <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#9aba98", letterSpacing: 2.5, marginBottom: 10 }}>WHO DO YOU WANT TO REACH?</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {people.map((p, i) => (
                    <div key={i} onClick={() => setReachOutPerson(reachOutPerson?.name === p.name ? null : p)}
                      style={{
                        background: reachOutPerson?.name === p.name ? "linear-gradient(135deg, #f0fdf0, #e8fbe8)" : "#fafcf8",
                        border: `1.5px solid ${reachOutPerson?.name === p.name ? "#7ac87a" : "#deeeda"}`,
                        borderRadius: 16, padding: "14px 16px", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 14,
                        boxShadow: reachOutPerson?.name === p.name ? "0 2px 12px rgba(100,180,100,0.15)" : "none",
                        transition: "all 0.2s",
                      }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 22, flexShrink: 0,
                        background: "linear-gradient(135deg, #c8e8c4, #a8d8a4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, fontWeight: 800, color: "#1a4a1a",
                        fontFamily: "'Nunito', sans-serif",
                      }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#1e3820", fontFamily: "'Nunito', sans-serif" }}>{p.name}</div>
                        {p.raw && <div style={{ fontSize: 11, color: "#8aaa88", fontFamily: "'Nunito Sans', sans-serif", marginTop: 1 }}>{p.raw}</div>}
                      </div>
                      <div style={{
                        width: 26, height: 26, borderRadius: 13,
                        background: reachOutPerson?.name === p.name ? "#22c55e" : "#eef4ec",
                        border: `1.5px solid ${reachOutPerson?.name === p.name ? "#22c55e" : "#cce4c8"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, color: "white", transition: "all 0.2s",
                      }}>
                        {reachOutPerson?.name === p.name ? "✓" : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message sections — only show once someone is selected */}
              {!reachOutPerson && (
                <div style={{ textAlign: "center", padding: "12px", background: "#f4f8f2", borderRadius: 14, border: "1px solid #deeeda" }}>
                  <div style={{ fontSize: 13, color: "#8aaa88", fontFamily: "'Nunito Sans', sans-serif" }}>
                    ↑ Select someone above to see message options
                  </div>
                </div>
              )}

              {reachOutPerson && (
                <>
                  <div style={{ textAlign: "center", padding: "4px 0" }}>
                    <div style={{ fontSize: 13, color: "#5a8a5a", fontFamily: "'Nunito Sans', sans-serif" }}>
                      Sending to <strong style={{ color: "#2a5a2a", fontFamily: "'Nunito', sans-serif" }}>{reachOutPerson.name}</strong>
                    </div>
                  </div>

                  {/* Quick send */}
                  <div>
                    <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#9aba98", letterSpacing: 2.5, marginBottom: 10 }}>SEND IN ONE TAP</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {QUICK.map((msg, i) => (
                        <a key={i}
                          href={reachOutPerson.phone
                            ? `sms:${reachOutPerson.phone}?body=${encodeURIComponent(msg.text)}`
                            : `sms:?body=${encodeURIComponent(msg.text)}`}
                          style={{
                            textDecoration: "none", display: "flex", alignItems: "center", gap: 14,
                            background: "#fafcf8", border: "1px solid #deeeda",
                            borderRadius: 16, padding: "14px 16px",
                          }}>
                          <div style={{ width: 40, height: 40, borderRadius: 13, background: "#eef7ec", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                            {msg.emoji}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#1e3820", fontFamily: "'Nunito', sans-serif", marginBottom: 3 }}>{msg.label}</div>
                            <div style={{ fontSize: 11, color: "#8aaa88", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.5 }}>{msg.text.slice(0, 60)}…</div>
                          </div>
                          <div style={{ fontSize: 18, color: "#5a9a5a", flexShrink: 0 }}>→</div>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Help finding words */}
                  <div>
                    <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#9aba98", letterSpacing: 2.5, marginBottom: 4 }}>HELP ME FIND THE WORDS</div>
                    <div style={{ fontSize: 12, color: "#8aaa88", fontFamily: "'Nunito Sans', sans-serif", marginBottom: 10 }}>Tap one to open it in your messages — edit it to make it yours.</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {SCRIPTS.map((s, i) => (
                        <a key={i}
                          href={reachOutPerson.phone
                            ? `sms:${reachOutPerson.phone}?body=${encodeURIComponent(s.text)}`
                            : `sms:?body=${encodeURIComponent(s.text)}`}
                          style={{
                            textDecoration: "none", display: "block",
                            background: "linear-gradient(135deg, #faf6ff, #f4eeff)",
                            border: "1px solid #d8cce8", borderRadius: 16, padding: "16px 16px",
                          }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#4a3a6a", fontFamily: "'Nunito', sans-serif", marginBottom: 6 }}>{s.title}</div>
                          <div style={{ fontSize: 12, color: "#7068a0", fontFamily: "'Nunito Sans', sans-serif", fontStyle: "italic", lineHeight: 1.7, marginBottom: 8 }}>
                            "{s.text}"
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#8070c0", fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                            Send this message <span>→</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div style={{ textAlign: "center", padding: "4px 0 4px" }}>
                    <div style={{ fontSize: 11, color: "#9aba98", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.6 }}>
                      These open in your phone's Messages app.<br />Nothing is sent without you tapping send.
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {/* SAFETY PLAN TAB */}
        {tab === "safetyplan" && (() => {
          const sections = [
            {
              id: 0,
              emoji: "🌤️",
              title: "Level 1 — Life Feels Heavy",
              subtitle: "When things are hard but manageable",
              color: "#fbbf24",
              fields: [
                { key: "warningSigns", label: "My warning signs", placeholder: "e.g. I stop replying to messages, I skip meals, I can't concentrate, I feel numb…", hint: "What does it look and feel like when things start sliding?" },
                { key: "copingStrategies", label: "Things I can do alone to feel better", placeholder: "e.g. Go for a walk, make tea, watch a comfort show, journal, take a shower…", hint: "Small solo actions that usually help, even a little." },
                { key: "level1", label: "What I need most at this level", placeholder: "e.g. Routine, gentleness, rest, to not be hard on myself…", hint: "A reminder to yourself when you're struggling." },
              ],
            },
            {
              id: 1,
              emoji: "🌧️",
              title: "Level 2 — I'm Overwhelmed",
              subtitle: "When it feels like too much",
              color: "#f97316",
              fields: [
                { key: "distractions", label: "Distractions & activities that help", placeholder: "e.g. Call a friend, cook something, go outside, play music loud, clean…", hint: "Things that shift your attention when thoughts spiral." },
                { key: "supportPeople", label: "People I trust & can reach out to", placeholder: "e.g. Mum — 07700 900000\nBest friend Sarah\nMy therapist — Tues 3pm", hint: "Include names, numbers, or how to contact them." },
                { key: "level2", label: "What I need to hear at this level", placeholder: "e.g. This feeling will pass. I have got through hard days before. I am not a burden.", hint: "Write a message from your calmer self to your overwhelmed self." },
              ],
            },
            {
              id: 2,
              emoji: "⛈️",
              title: "Level 3 — Crisis Point",
              subtitle: "When I need immediate support",
              color: "#ef4444",
              fields: [
                { key: "professionalContacts", label: "Professional & crisis contacts", placeholder: "e.g. GP: Dr Singh — 0161 xxx\nSamaritans: 116 123\nCrisis team: xxx\nA&E if needed", hint: "The real numbers to call. Include your GP, therapist, and crisis lines." },
                { key: "safeEnvironment", label: "Making my environment safer", placeholder: "e.g. Ask someone to stay with me, remove or lock away things that could harm me, go to a friend's house…", hint: "Practical steps to reduce risk in a crisis moment." },
                { key: "level3", label: "My reason to stay", placeholder: "e.g. My dog. Finishing my degree. The people who love me. The version of me I'm still becoming.", hint: "Your anchor. What matters most. This can be one word or a paragraph." },
              ],
            },
            {
              id: 3,
              emoji: "🌱",
              title: "Reasons & Anchors",
              subtitle: "What I'm holding onto",
              color: "#22c55e",
              fields: [
                { key: "reasons", label: "My reasons to keep going", placeholder: "Write anything — people, places, future dreams, pets, unfinished books, a song you haven't heard yet…", hint: "No reason is too small. They all count." },
              ],
              hasPhotos: true,
            },
          ];

          const current = sections[planSection];

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Intro */}
              <div style={{ background: "#fafcf8", border: "1px solid #deeeda", borderRadius: 20, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>🛡️</span>
                  <div style={{ fontSize: 16, fontFamily: "'Nunito', sans-serif", fontWeight: 800, color: "#2d6a2d" }}>My Personal Safety Plan</div>
                </div>
                <div style={{ fontSize: 12, color: "#5a8a5a", lineHeight: 1.6 }}>
                  This is yours. It covers everything from the everyday hard days all the way through to crisis moments. Fill in as much or as little as feels right. Come back and update it whenever you need to.
                </div>
                {safetyPlan.lastUpdated && (
                  <div style={{ fontSize: 10, color: "#7aaa7a", fontFamily: "'DM Mono', monospace", marginTop: 8 }}>
                    Last updated: {new Date(safetyPlan.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                )}
              </div>

              {/* Section tabs */}
              <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
                {sections.map(s => (
                  <button key={s.id} onClick={() => setPlanSection(s.id)} style={{
                    flex: "0 0 auto", padding: "6px 12px", borderRadius: 20,
                    border: `1px solid ${planSection === s.id ? s.color : "#cce4c8"}`,
                    background: planSection === s.id ? `${s.color}18` : "#f5f8f3",
                    color: planSection === s.id ? s.color : "#5a8a5a",
                    fontSize: 11, cursor: "pointer", fontFamily: "'Nunito Sans', sans-serif",
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    {s.emoji} {s.title.split("—")[0].trim()}
                  </button>
                ))}
              </div>

              {/* Current section */}
              <div style={{
                background: "#fafcf8",
                border: `1px solid ${current.color}33`,
                borderRadius: 16,
                overflow: "hidden",
              }}>
                <div style={{ height: 3, background: `linear-gradient(90deg, ${current.color}, ${current.color}88)` }} />
                <div style={{ padding: "18px 18px 4px" }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{current.emoji}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1a3a1a", marginBottom: 2 }}>{current.title}</div>
                  <div style={{ fontSize: 12, color: "#5a8a5a", fontStyle: "italic", marginBottom: 16 }}>{current.subtitle}</div>

                  {current.fields.map(field => (
                    <div key={field.key} style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: current.color, letterSpacing: 1.5, marginBottom: 4 }}>
                        {field.label.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 11, color: "#7aaa7a", marginBottom: 6, fontStyle: "italic" }}>{field.hint}</div>
                      <textarea
                        value={safetyPlan[field.key]}
                        onChange={e => updatePlan(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        style={{
                          width: "100%", background: "#f2f7f0",
                          border: `1px solid ${safetyPlan[field.key] ? current.color + "44" : "#d4ecd0"}`,
                          borderRadius: 10, color: "#1a3a1a",
                          fontSize: 13, lineHeight: 1.7, padding: "10px 12px",
                          fontFamily: "'Nunito Sans', sans-serif", outline: "none",
                          resize: "vertical", transition: "border-color 0.2s",
                        }}
                      />
                    </div>
                  ))}

                  {/* Anchor photos — only on Reasons & Anchors section */}
                  {current.hasPhotos && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#22c55e", letterSpacing: 1.5, marginBottom: 4 }}>
                        MY ANCHOR PHOTOS
                      </div>
                      <div style={{ fontSize: 11, color: "#7aaa7a", marginBottom: 10, fontStyle: "italic" }}>
                        Photos that ground you — your people, your pet, a place, anything that matters.
                      </div>
                      <input ref={anchorInputRef} type="file" accept="image/*" style={{ display: "none" }}
                        onChange={e => e.target.files[0] && addPhoto(anchorPhotos, setAnchorPhotos, "mh_anchor_photos", e.target.files[0])} />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                        {anchorPhotos.map(photo => (
                          <div key={photo.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "1", background: "#f2f7f0", border: "1px solid #deeeda" }}>
                            <img src={photo.dataUrl} alt={photo.caption || "anchor"}
                              onClick={() => setLightboxPhoto(photo)}
                              style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer", display: "block" }} />
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", padding: "3px 6px" }}>
                              <input value={photo.caption || ""} onChange={e => updateCaption(anchorPhotos, setAnchorPhotos, "mh_anchor_photos", photo.id, e.target.value)}
                                placeholder="Add label…" style={{ background: "transparent", border: "none", color: "#1a3a1a", fontSize: 9, width: "100%", outline: "none", fontFamily: "'Nunito Sans', sans-serif" }} />
                            </div>
                            <button onClick={() => removePhoto(anchorPhotos, setAnchorPhotos, "mh_anchor_photos", photo.id)}
                              style={{ position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: "50%", background: "rgba(0,0,0,0.75)", border: "none", color: "white", fontSize: 9, cursor: "pointer" }}>✕</button>
                          </div>
                        ))}
                        <div onClick={() => anchorInputRef.current?.click()}
                          style={{ aspectRatio: "1", borderRadius: 12, border: "2px dashed #a8d5a2", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 4, background: "#f2f7f0" }}>
                          <span style={{ fontSize: 22, color: "#9aca9a" }}>+</span>
                          <span style={{ fontSize: 9, color: "#7aaa7a", fontFamily: "'DM Mono', monospace" }}>ADD PHOTO</span>
                        </div>
                      </div>
                      {anchorPhotos.length > 0 && (
                        <div style={{ fontSize: 10, color: "#9aca9a", marginTop: 8, fontFamily: "'DM Mono', monospace" }}>
                          {anchorPhotos.length} anchor {anchorPhotos.length === 1 ? "photo" : "photos"} · tap to view full size
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Nav + Save */}
              <div style={{ display: "flex", gap: 8 }}>
                {planSection > 0 && (
                  <button onClick={() => setPlanSection(p => p - 1)} style={{
                    flex: 1, padding: 12, borderRadius: 12,
                    border: "1px solid #bcd8b8", background: "transparent",
                    color: "#5a8a5a", fontSize: 13, cursor: "pointer",
                    fontFamily: "'Nunito Sans', sans-serif",
                  }}>← Previous</button>
                )}
                <button onClick={saveSafetyPlan} style={{
                  flex: 2, padding: 12, borderRadius: 12, border: "none",
                  background: planSaved ? "#22c55e33" : "linear-gradient(135deg, #22c55e, #16a34a)",
                  color: planSaved ? "#22c55e" : "white",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  fontFamily: "'Nunito Sans', sans-serif", transition: "all 0.3s",
                }}>
                  {planSaved ? "✓ Saved" : "Save Plan"}
                </button>
                {planSection < sections.length - 1 && (
                  <button onClick={() => setPlanSection(p => p + 1)} style={{
                    flex: 1, padding: 12, borderRadius: 12,
                    border: "1px solid #bcd8b8", background: "transparent",
                    color: "#5a8a5a", fontSize: 13, cursor: "pointer",
                    fontFamily: "'Nunito Sans', sans-serif",
                  }}>Next →</button>
                )}
              </div>

              {/* Quick view of filled sections */}
              <div style={{ background: "#fafcf8", border: "1px solid #deeeda", borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#5a8a5a", letterSpacing: 2, marginBottom: 12 }}>PLAN OVERVIEW</div>
                {sections.map(s => {
                  const filled = s.fields.filter(f => safetyPlan[f.key]?.trim()).length;
                  return (
                    <div key={s.id} onClick={() => setPlanSection(s.id)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #1a2e1a", cursor: "pointer" }}>
                      <span style={{ fontSize: 16 }}>{s.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: "#3a7a3a" }}>{s.title}</div>
                      </div>
                      <div style={{
                        fontSize: 10, fontFamily: "'DM Mono', monospace",
                        color: filled === s.fields.length ? s.color : "#7aaa7a",
                        background: filled === s.fields.length ? `${s.color}18` : "#d4ecd0",
                        padding: "2px 8px", borderRadius: 6,
                      }}>
                        {filled}/{s.fields.length} filled
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: 11, color: "#9aca9a", textAlign: "center", lineHeight: 1.5, paddingBottom: 4 }}>
                Your plan is stored privately on this device — Anchor never sees it.<br />Consider sharing it with someone you trust.
              </div>

              {/* Download safety plan */}
              {safetyPlan.lastUpdated && (
                <button
                  onClick={() => {
                    const SECTION_LABELS = {
                      warningSigns: "My warning signs",
                      copingStrategies: "Things that help me",
                      distractions: "Distractions & activities",
                      supportPeople: "People I trust",
                      professionalContacts: "Professional contacts",
                      safeEnvironment: "Making my environment safer",
                      reasons: "My reasons to stay",
                      level1: "What I need at Level 1",
                      level2: "What I need at Level 2",
                      level3: "What I need at Level 3",
                    };
                    const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
                    const lines = [
                      "MY PERSONAL SAFETY PLAN",
                      "Created with Anchor by Wired & Well",
                      `Last updated: ${date}`,
                      "",
                      "─────────────────────────────────────",
                      "",
                    ];
                    Object.entries(SECTION_LABELS).forEach(([key, label]) => {
                      if (safetyPlan[key]?.trim()) {
                        lines.push(`${label.toUpperCase()}`);
                        lines.push(safetyPlan[key].trim());
                        lines.push("");
                      }
                    });
                    lines.push("─────────────────────────────────────");
                    lines.push("Anchor is a self-help tool and is not a substitute for professional advice.");
                    lines.push("In an emergency call 999. For urgent mental health support call 111 option 2.");
                    lines.push("Samaritans: 116 123  |  Shout: text SHOUT to 85258");
                    lines.push("wiredandwell.co.uk");

                    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "my-anchor-safety-plan.txt";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  style={{
                    width: "100%", padding: "13px", borderRadius: 14,
                    background: "#f4f9f2", border: "1.5px solid #c8e4c0",
                    color: "#2a5a2a", fontSize: 13, fontWeight: 700,
                    cursor: "pointer", fontFamily: "'Nunito', sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  <span>📄</span> Download my safety plan
                </button>
              )}
            </div>
          );
        })()}

        {/* MOODBOARD TAB */}
        {tab === "moodboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#fafcf8", border: "1px solid #deeeda", borderRadius: 20, padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>🖼️</span>
                <div style={{ fontSize: 16, fontFamily: "'Nunito', sans-serif", fontWeight: 800, color: "#2d6a2d" }}>My Mood Board</div>
              </div>
              <div style={{ fontSize: 12, color: "#5a8a5a", lineHeight: 1.6 }}>
                A private gallery of things that make you feel something good — calm, joy, hope, safety. Screenshots, photos, anything.
              </div>
            </div>

            <input ref={moodboardInputRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => e.target.files[0] && addPhoto(moodboard, setMoodboard, "mh_moodboard", e.target.files[0])} />

            {/* Categories — functional with add-to-category */}
            <MoodboardGrid
              moodboard={moodboard}
              setMoodboard={setMoodboard}
              moodboardInputRef={moodboardInputRef}
              setLightboxPhoto={setLightboxPhoto}
              removePhoto={removePhoto}
            />

            <div style={{ fontSize: 11, color: "#9aca9a", textAlign: "center", fontFamily: "'DM Mono', monospace" }}>
              {moodboard.length} photo{moodboard.length !== 1 ? "s" : ""} · stored privately on this device — Anchor never sees it
            </div>
          </div>
        )}

        {/* TOOLS TAB */}
        {tab === "tools" && (() => {
          const TOOL_SECTIONS = [
            {
              id: "adhd",
              emoji: "🧠",
              label: "ADHD & Focus",
              color: "#a78bfa",
              intro: "These work with an ADHD brain, not against it — when starting feels impossible, these help.",
              items: [
                { name: "ND Brain OS", tagline: "Built for neurodivergent minds — dopamine, habits, focus & life admin in one place", emoji: "⚡", color: "#a78bfa", url: "https://nd-brain-os.vercel.app", tag: "By Wired & Well", featured: true },
                { name: "Goblin Tools", tagline: "Break any task into tiny steps with AI", emoji: "👺", color: "#a78bfa", url: "https://goblin.tools", tag: "Task Breakdown" },
                { name: "Focusmate", tagline: "Body doubling — work alongside someone online", emoji: "🧑‍💻", color: "#38bdf8", url: "https://www.focusmate.com", tag: "Focus" },
                { name: "Tiimo", tagline: "Visual daily planner designed for ADHD & autism", emoji: "🕐", color: "#fb923c", url: "https://www.tiimoapp.com", tag: "Planning" },
                { name: "Llama Life", tagline: "Tasks with time estimates — helps with time blindness", emoji: "🦙", color: "#f472b6", url: "https://llamalife.co", tag: "Time Blindness" },
              ],
            },
            {
              id: "anxiety",
              emoji: "🌊",
              label: "Anxiety & Calm",
              color: "#38bdf8",
              intro: "When the spiral starts, these help you slow it down.",
              items: [
                { name: "Rootd", tagline: "Real-time panic attack & anxiety support", emoji: "🌱", color: "#22c55e", url: "https://www.rootd.io", tag: "Panic & Anxiety" },
                { name: "Finch", tagline: "Gentle self-care with a baby bird — for low days", emoji: "🐣", color: "#fb923c", url: "https://finchcare.com", tag: "Gentle Habits" },
                { name: "Woebot", tagline: "CBT-based chat to help reframe anxious thoughts", emoji: "🤖", color: "#38bdf8", url: "https://woebothealth.com", tag: "CBT" },
              ],
            },
            {
              id: "productivity",
              emoji: "✅",
              label: "Productivity",
              color: "#34a853",
              intro: "Structure and gentle accountability — without the pressure.",
              items: [
                { name: "Todoist", tagline: "Simple, trusted task manager", emoji: "✅", color: "#db4035", url: "https://todoist.com", tag: "Tasks" },
                { name: "Forest", tagline: "Grow a virtual forest while you focus", emoji: "🌲", color: "#5aae5e", url: "https://www.forestapp.cc", tag: "Focus" },
                { name: "Notion", tagline: "Notes, journals, habit trackers — all in one", emoji: "🗒️", color: "#888888", url: "https://notion.so", tag: "Notes" },
                { name: "Trello", tagline: "Visual boards for projects and goals", emoji: "📋", color: "#0052cc", url: "https://trello.com", tag: "Boards" },
              ],
            },
            {
              id: "nhs",
              emoji: "🏥",
              label: "NHS Self-Referral",
              color: "#005eb8",
              intro: "You don't need a GP referral for most of these. You can refer yourself directly.",
              items: [
                { name: "NHS Talking Therapies", tagline: "Free CBT on the NHS — self-refer online, no GP needed", emoji: "🏥", color: "#005eb8", url: "https://www.nhs.uk/mental-health/talking-therapies-medicine-treatments/talking-therapies-and-counselling/nhs-talking-therapies/", tag: "Free · NHS" },
                { name: "Find a Therapies Service", tagline: "Search by postcode for your nearest IAPT provider", emoji: "📍", color: "#22c55e", url: "https://www.nhs.uk/service-search/mental-health/find-an-nhs-talking-therapies-service", tag: "Postcode" },
                { name: "Kooth", tagline: "Free online counselling for under 25s — no waiting list", emoji: "🌿", color: "#10b981", url: "https://www.kooth.com", tag: "Under 25 · Free" },
                { name: "Togetherall", tagline: "Anonymous peer support, monitored by professionals", emoji: "🌐", color: "#6366f1", url: "https://togetherall.com/en-gb/", tag: "Anonymous" },
                { name: "BACP Therapist Finder", tagline: "Accredited private therapists — many offer sliding scale fees", emoji: "🔍", color: "#f59e0b", url: "https://www.bacp.co.uk/search/Therapists", tag: "Private" },
                { name: "Psychology Today UK", tagline: "Filter by issue, therapy type & price", emoji: "🧩", color: "#8b5cf6", url: "https://www.psychologytoday.com/gb/therapists", tag: "Private · Specialist" },
              ],
            },
            {
              id: "resources",
              emoji: "💜",
              label: "Mental Health Resources",
              color: "#a78bfa",
              intro: "UK-based support lines and resources. All free.",
              items: [
                { name: "Mind", tagline: "UK mental health info, advice & local support", emoji: "💜", color: "#a78bfa", url: "https://www.mind.org.uk", tag: "UK" },
                { name: "Samaritans — 116 123", tagline: "Free confidential support, 24/7", emoji: "📞", color: "#22c55e", url: "https://www.samaritans.org", tag: "Crisis" },
                { name: "Shout 85258", tagline: "Text SHOUT — free crisis text line 24/7", emoji: "💬", color: "#4ade80", url: "https://giveusashout.org", tag: "Crisis" },
                { name: "CALM", tagline: "Men's mental health & crisis support — 0800 58 58 58", emoji: "💙", color: "#38bdf8", url: "https://www.thecalmzone.net", tag: "UK" },
                { name: "Papyrus", tagline: "Suicide prevention for under 35s — 0800 068 4141", emoji: "🌱", color: "#10b981", url: "https://www.papyrus-uk.org", tag: "Under 35" },
                { name: "ADHD UK", tagline: "ADHD support, diagnosis info & community", emoji: "🧠", color: "#f472b6", url: "https://adhduk.co.uk", tag: "UK" },
                { name: "Rethink Mental Illness", tagline: "Practical support for people severely affected", emoji: "🔄", color: "#fb923c", url: "https://www.rethink.org", tag: "UK" },
                { name: "7 Cups", tagline: "Free online chat with trained listeners", emoji: "👂", color: "#fbbf24", url: "https://www.7cups.com", tag: "Global" },
              ],
            },
          ];

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

              {/* Motherly intro */}
              <div style={{ background: "linear-gradient(135deg, #f5f0ff, #ede8ff)", border: "1px solid #c8b8e8", borderRadius: 16, padding: "14px 16px", marginBottom: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#4a2a6a", fontFamily: "'Nunito', sans-serif", marginBottom: 4 }}>Before you scroll past these 👀</div>
                <div style={{ fontSize: 12, color: "#6a5a90", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.7 }}>
                  These tools exist for exactly where you are. Give one a proper try — not a quick look, an actual try.
                </div>
              </div>

              {/* Accordion sections */}
              {TOOL_SECTIONS.map(section => (
                <ToolSection key={section.id} section={section} />
              ))}

              <div style={{ borderTop: "1px solid #d4e8cc", paddingTop: 16, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#9aca9a", fontFamily: "'DM Mono', monospace", letterSpacing: 2, marginBottom: 4 }}>PART OF THE</div>
                <a href="https://www.wiredandwell.co.uk" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", fontSize: 16, fontFamily: "'Nunito', sans-serif", color: "#5a8a5a", fontWeight: 800 }}>Wired &amp; Well</a>
                <div style={{ fontSize: 10, color: "#9aca9a", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>wiredandwell.co.uk</div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── AUTH MODAL (Sign Up / Sign In) ── */}
      {authScreen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "linear-gradient(160deg, #f6f9f4 0%, #eef6ec 100%)", fontFamily: "'Nunito Sans', sans-serif", display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "52px 28px 40px", maxWidth: 440, margin: "0 auto", width: "100%" }}>

            {/* Close */}
            <button onClick={() => { setAuthScreen(null); setAuthError(""); }}
              style={{ position: "absolute", top: 20, right: 20, background: "#f0f7ee", border: "1px solid #c8e0c4", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#4a7a4a", cursor: "pointer" }}>
              ✕
            </button>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#9aba98", letterSpacing: 2.5, marginBottom: 10 }}>WIRED &amp; WELL</div>
              <div style={{ fontSize: 32, fontFamily: "'Nunito', sans-serif", fontWeight: 900, color: "#1a3820", marginBottom: 6 }}>Anchor</div>
              <div style={{ fontSize: 15, fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: "#4a7a4a", marginBottom: 4 }}>
                {authScreen === "signup" ? "Create your account" : "Welcome back"}
              </div>
              <div style={{ fontSize: 13, color: "#8aaa88", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.6 }}>
                {authScreen === "signup"
                  ? "Your data is stored privately. Only you can see it."
                  : "Your journal, check-ins and plan are waiting for you."}
              </div>
            </div>

            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {authScreen === "signup" && (
                <div>
                  <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#7a9a7a", letterSpacing: 2, marginBottom: 6 }}>YOUR NAME</div>
                  <input value={authName} onChange={e => setAuthName(e.target.value)}
                    placeholder="What should we call you?"
                    autoCapitalize="words"
                    style={{ width: "100%", background: "#ffffff", border: "1.5px solid #d4e8cc", borderRadius: 14, color: "#1a3820", fontSize: 15, padding: "13px 16px", fontFamily: "'Nunito', sans-serif", fontWeight: 600, outline: "none" }} />
                </div>
              )}
              <div>
                <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#7a9a7a", letterSpacing: 2, marginBottom: 6 }}>EMAIL</div>
                <input value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                  placeholder="you@example.com"
                  type="email" autoCapitalize="none" autoCorrect="off"
                  style={{ width: "100%", background: "#ffffff", border: "1.5px solid #d4e8cc", borderRadius: 14, color: "#1a3820", fontSize: 15, padding: "13px 16px", fontFamily: "'Nunito', sans-serif", fontWeight: 600, outline: "none" }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#7a9a7a", letterSpacing: 2, marginBottom: 6 }}>PASSWORD</div>
                <input value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                  placeholder={authScreen === "signup" ? "At least 8 characters" : "Your password"}
                  type="password"
                  style={{ width: "100%", background: "#ffffff", border: "1.5px solid #d4e8cc", borderRadius: 14, color: "#1a3820", fontSize: 15, padding: "13px 16px", fontFamily: "'Nunito', sans-serif", fontWeight: 600, outline: "none" }} />
              </div>

              {authError && (
                <div style={{ background: "#fff5f5", border: "1px solid #f0c8c8", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#b05050", fontFamily: "'Nunito Sans', sans-serif" }}>
                  {authError}
                </div>
              )}

              <button onClick={() => handleAuth(authScreen)}
                disabled={authLoading}
                style={{ padding: "15px", borderRadius: 16, background: authLoading ? "#c8e4c0" : "linear-gradient(135deg, #34a853, #2a8a44)", border: "none", color: "white", fontSize: 15, fontWeight: 800, cursor: authLoading ? "default" : "pointer", fontFamily: "'Nunito', sans-serif", marginTop: 4, boxShadow: "0 4px 16px rgba(52,168,83,0.3)" }}>
                {authLoading ? "Just a moment…" : authScreen === "signup" ? "Create my account" : "Sign in"}
              </button>

              <div style={{ textAlign: "center" }}>
                <button onClick={() => { setAuthScreen(authScreen === "signup" ? "signin" : "signup"); setAuthError(""); }}
                  style={{ background: "none", border: "none", fontSize: 13, color: "#5a8a5a", cursor: "pointer", fontFamily: "'Nunito Sans', sans-serif", textDecoration: "underline" }}>
                  {authScreen === "signup" ? "Already have an account? Sign in" : "New to Anchor? Create account"}
                </button>
              </div>
            </div>

            {/* Privacy note */}
            <div style={{ marginTop: 28, background: "#f4f9f2", border: "1px solid #d4e8cc", borderRadius: 16, padding: "14px 16px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2a5a2a", fontFamily: "'Nunito', sans-serif", marginBottom: 4 }}>🔒 Your privacy</div>
              <div style={{ fontSize: 11, color: "#6a8a6a", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.7 }}>
                Your journal, check-ins, and safety plan are stored privately in your own account. Wired &amp; Well staff cannot read your data. You can delete your account and all data at any time.
              </div>
              <a href="https://www.wiredandwell.co.uk/privacy" target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 11, color: "#34a853", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textDecoration: "none", display: "block", marginTop: 8 }}>
                Read our Privacy Policy →
              </a>
            </div>

            {/* Coming soon note */}
            <div style={{ marginTop: 14, background: "linear-gradient(135deg, #f0f4ff, #e8eeff)", border: "1px solid #c0ccee", borderRadius: 14, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 16 }}>🚀</span>
              <div style={{ fontSize: 11, color: "#5a6ab0", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.6 }}>
                Cloud accounts are coming soon. For now your data saves privately on this device. Creating an account reserves your place.
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <div style={{ fontSize: 10, color: "#9aba98", fontFamily: "'DM Mono', monospace" }}>WIRED &amp; WELL · wiredandwell.co.uk</div>
            </div>
          </div>
        </div>
      )}

      {/* ── ACCOUNT PAGE ── */}
      {showAccount && currentUser && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "linear-gradient(160deg, #f6f9f4, #eef6ec)", fontFamily: "'Nunito Sans', sans-serif", overflowY: "auto" }}>
          <div style={{ padding: "52px 24px 40px", maxWidth: 440, margin: "0 auto" }}>

            <button onClick={() => setShowAccount(false)}
              style={{ position: "absolute", top: 20, left: 20, background: "#f0f7ee", border: "1px solid #c8e0c4", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#4a7a4a", cursor: "pointer" }}>
              ←
            </button>

            {/* Avatar */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ width: 72, height: 72, borderRadius: 24, background: "linear-gradient(135deg, #d4f0cc, #a8e0a0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#1a4a1a", fontFamily: "'Nunito', sans-serif", margin: "0 auto 12px" }}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#1a3820", fontFamily: "'Nunito', sans-serif" }}>{currentUser.name}</div>
              <div style={{ fontSize: 13, color: "#8aaa88", fontFamily: "'Nunito Sans', sans-serif", marginTop: 2 }}>{currentUser.email}</div>
            </div>

            {/* Settings sections */}
            {[
              {
                title: "Account",
                items: [
                  { icon: "✉️", label: "Email address", value: currentUser.email, action: null },
                  { icon: "🔑", label: "Change password", value: "••••••••", action: () => {} },
                  { icon: "🌍", label: "Profile focus", value: profile?.label || "Everything", action: () => { setShowAccount(false); setTimeout(() => { setOnboardingDone(false); setWelcomePage(5); }, 100); } },
                ],
              },
              {
                title: "Data & Privacy",
                items: [
                  { icon: "📥", label: "Download my data", value: "Export all entries", action: () => {
                    const data = { checkins: entries, journal: journalEntries, safetyPlan, activities };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = "anchor-my-data.json"; a.click();
                  }},
                  { icon: "📋", label: "Privacy Policy", value: "wiredandwell.co.uk/privacy", action: () => window.open("https://www.wiredandwell.co.uk/privacy") },
                  { icon: "📄", label: "Terms of Service", value: "wiredandwell.co.uk/terms", action: () => window.open("https://www.wiredandwell.co.uk/terms") },
                  { icon: "🗑️", label: "Delete my account", value: "Remove all data permanently", action: () => {
                    if (window.confirm("This will permanently delete your account and all data. Are you sure?")) {
                      localStorage.clear();
                      setCurrentUser(null);
                      setShowAccount(false);
                    }
                  }, danger: true },
                ],
              },
              {
                title: "About Anchor",
                items: [
                  { icon: "🌿", label: "Version", value: "1.0 Beta", action: null },
                  { icon: "🌐", label: "Wired & Well", value: "wiredandwell.co.uk", action: () => window.open("https://www.wiredandwell.co.uk") },
                  { icon: "✉️", label: "Get in touch", value: "hello@wiredandwell.co.uk", action: () => window.open("mailto:hello@wiredandwell.co.uk") },
                ],
              },
            ].map(section => (
              <div key={section.title} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#9aba98", letterSpacing: 2.5, marginBottom: 8 }}>{section.title.toUpperCase()}</div>
                <div style={{ background: "#ffffff", border: "1px solid #e0eed8", borderRadius: 18, overflow: "hidden" }}>
                  {section.items.map((item, i) => (
                    <div key={i} onClick={item.action || undefined}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderBottom: i < section.items.length - 1 ? "1px solid #eef4ec" : "none", cursor: item.action ? "pointer" : "default" }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: item.danger ? "#c05050" : "#1e3820", fontFamily: "'Nunito', sans-serif" }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: item.danger ? "#d07070" : "#8aaa88", fontFamily: "'Nunito Sans', sans-serif", marginTop: 1 }}>{item.value}</div>
                      </div>
                      {item.action && <div style={{ fontSize: 16, color: item.danger ? "#e08080" : "#9aba98" }}>→</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Sign out */}
            <button onClick={handleSignOut}
              style={{ width: "100%", padding: "14px", borderRadius: 16, background: "#fff5f5", border: "1.5px solid #f0c8c8", color: "#b05050", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", marginBottom: 12 }}>
              Sign out
            </button>

            {/* Disclaimer */}
            <div style={{ fontSize: 11, color: "#9aba98", textAlign: "center", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.7 }}>
              Anchor is a self-help tool and is not a substitute for professional medical advice, diagnosis or treatment.
            </div>
          </div>
        </div>
      )}

      {/* PHOTO LIGHTBOX */}
      {lightboxPhoto && (
        <div onClick={() => setLightboxPhoto(null)}
          style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.95)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn 0.2s ease" }}>
          <img src={lightboxPhoto.dataUrl} alt={lightboxPhoto.caption || "photo"}
            style={{ maxWidth: "100%", maxHeight: "75vh", borderRadius: 16, objectFit: "contain" }} />
          {lightboxPhoto.caption && (
            <div style={{ marginTop: 16, fontSize: 14, color: "#2d6a2d", fontStyle: "italic", textAlign: "center" }}>
              {lightboxPhoto.caption}
            </div>
          )}
          <button onClick={() => setLightboxPhoto(null)}
            style={{ marginTop: 24, padding: "10px 28px", borderRadius: 12, background: "#dbeeda", border: "1px solid #bcd8b8", color: "#5a8a5a", fontSize: 13, cursor: "pointer", fontFamily: "'Nunito Sans', sans-serif" }}>
            Close
          </button>
        </div>
      )}

      {/* ESCALATION ALERT MODAL */}
      {escalationAlert && (
        <div onClick={() => setEscalationAlert(null)}
          style={{ position: "fixed", inset: 0, zIndex: 250, background: "rgba(40,30,30,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 16px 32px" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 480, background: "#fefefe", borderRadius: 28, overflow: "hidden", boxShadow: "0 -8px 40px rgba(0,0,0,0.15)" }}>
            <div style={{ height: 4, background: escalationAlert === "urgent" ? "linear-gradient(90deg, #ef4444, #f97316)" : "linear-gradient(90deg, #f97316, #fbbf24)" }} />
            <div style={{ padding: "24px 24px 28px" }}>
              <div style={{ width: 36, height: 4, background: "#e0e8e0", borderRadius: 2, margin: "0 auto 20px" }} />
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{escalationAlert === "urgent" ? "💙" : "🌿"}</div>
                <div style={{ fontSize: 18, fontFamily: "'Nunito', sans-serif", fontWeight: 800, color: "#2a3a2a", marginBottom: 8 }}>
                  {escalationAlert === "urgent" ? "Your last few check-ins concern us." : "We've noticed things have been hard lately."}
                </div>
                <div style={{ fontSize: 13, color: "#5a7060", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.7 }}>
                  {escalationAlert === "urgent"
                    ? "Your mood and stress have been in a difficult place consistently. This isn't something to push through alone — it's time to get some proper support."
                    : "You've been carrying a heavy load. It might be worth talking to someone who can really help — not because you're not coping, but because you deserve support."}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                {escalationAlert === "urgent" && (
                  <>
                    <a href="tel:999" style={{ textDecoration: "none", background: "#ffffff", border: "1.5px solid #f0b0a8", borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 12px rgba(200,60,60,0.1)" }}>
                      <div style={{ width: 46, height: 46, borderRadius: 14, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🚨</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#a02020", fontFamily: "'Nunito', sans-serif", marginBottom: 2 }}>Call 999</div>
                        <div style={{ fontSize: 12, color: "#b05050", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.5 }}>If you or someone else is in immediate danger</div>
                      </div>
                      <div style={{ fontSize: 16, color: "#c04040", fontWeight: 700 }}>→</div>
                    </a>
                    <a href="tel:111" style={{ textDecoration: "none", background: "#ffffff", border: "1px solid #e8d0c8", borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 46, height: 46, borderRadius: 14, background: "#fef3f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📞</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#8a3020", fontFamily: "'Nunito', sans-serif", marginBottom: 2 }}>Call 111 — option 2</div>
                        <div style={{ fontSize: 12, color: "#a06050", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.5 }}>NHS urgent mental health line — free, 24/7</div>
                      </div>
                      <div style={{ fontSize: 16, color: "#b04030", fontWeight: 700 }}>→</div>
                    </a>
                  </>
                )}
                <a href={escalationAlert === "urgent" ? "tel:116123" : "tel:"}
                  style={{ textDecoration: "none", background: "#ffffff", border: "1px solid #c8e4cc", borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: "#e4f5e8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                    {escalationAlert === "urgent" ? "💚" : "🏥"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#1a4a2a", fontFamily: "'Nunito', sans-serif", marginBottom: 2 }}>
                      {escalationAlert === "urgent" ? "Samaritans — 116 123" : "Call your GP"}
                    </div>
                    <div style={{ fontSize: 12, color: "#4a7a5a", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.5 }}>
                      {escalationAlert === "urgent"
                        ? "Free, confidential — someone to talk to right now"
                        : "Tell them how you've been feeling. You don't need to be in crisis to deserve support — this is exactly what they're there for."}
                    </div>
                  </div>
                  <div style={{ fontSize: 16, color: "#2a7a4a", fontWeight: 700 }}>→</div>
                </a>
                <div onClick={() => { setTab("reachout"); setEscalationAlert(null); }}
                  style={{ background: "linear-gradient(135deg, #f8f4ff, #f0ecff)", border: "1px solid #c8b8e8", borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#e4d8ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>💌</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#3a2a5a", fontFamily: "'Nunito', sans-serif", marginBottom: 2 }}>Tell someone you trust</div>
                    <div style={{ fontSize: 12, color: "#6a5a90", fontFamily: "'Nunito Sans', sans-serif" }}>Reach out to one of your people — we'll help you find the words.</div>
                  </div>
                  <div style={{ fontSize: 18, color: "#5a4a8a" }}>→</div>
                </div>
              </div>

              <div style={{ background: "#f5fcf7", border: "1px solid #c8e4cc", borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#4a6a50", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.6, fontStyle: "italic" }}>
                  {escalationAlert === "urgent"
                    ? "This isn't a sign of weakness. This is your brain and body asking for help. That takes courage to hear."
                    : "You don't have to be in crisis to deserve support. Struggling for a while is reason enough."}
                </div>
              </div>

              <div style={{ fontSize: 11, color: "#9aba98", textAlign: "center", fontFamily: "'Nunito Sans', sans-serif", marginBottom: 10, lineHeight: 1.6 }}>
                Your data stays private — this alert is generated from your check-ins on this device only.
              </div>
              <button onClick={() => setEscalationAlert(null)}
                style={{ width: "100%", padding: 13, borderRadius: 12, background: "#f0f7ee", border: "1.5px solid #c8e0c4", color: "#4a7a50", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                I'll keep an eye on it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CRISIS SUPPORT MODAL */}
      {showCrisis && (
        <div
          onClick={() => setShowCrisis(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(20,35,20,0.6)",
            backdropFilter: "blur(16px)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            padding: "24px 16px 24px",
            animation: "fadeIn 0.3s ease",
            overflowY: "auto",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 480,
              background: "linear-gradient(160deg, #f8fcf6 0%, #f4f9f2 100%)",
              borderRadius: 32,
              overflow: "hidden",
              boxShadow: "0 4px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(180,220,170,0.4)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Soft top accent — gentle, not alarming */}
            <div style={{ height: 5, background: "linear-gradient(90deg, #86efac, #34d399, #6ee7b7)" }} />

            <div style={{ padding: "22px 22px 26px" }}>
              {/* Handle */}
              <div style={{ width: 40, height: 4, borderRadius: 2, background: "#cce4c4", margin: "0 auto 20px" }} />

              {/* Header — warm and human */}
              <div style={{ textAlign: "center", marginBottom: 22 }}>
                <div style={{ fontSize: 38, marginBottom: 12, lineHeight: 1 }}>🤍</div>
                <div style={{ fontSize: 20, fontFamily: "'Nunito', sans-serif", fontWeight: 800, color: "#1e3820", marginBottom: 8, lineHeight: 1.3 }}>
                  You reached out.<br />That took courage.
                </div>
                <div style={{ fontSize: 13, color: "#6a8a6a", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.8 }}>
                  These people are trained to listen — not to judge,<br />
                  not to fix, just to be there. Free and confidential.
                </div>
              </div>

              {/* Location — soft, not clinical */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#f0f7ee", border: "1px solid #d4e8cc",
                borderRadius: 12, padding: "10px 14px", marginBottom: 14,
              }}>
                <div style={{ fontSize: 12, color: "#7a9a7a", fontFamily: "'Nunito Sans', sans-serif" }}>
                  {countryLoading ? "Finding your local services…" : `Showing services for ${countryNames[userCountry] || "🌍 Global"}`}
                </div>
                <select
                  value={userCountry || "DEFAULT"}
                  onChange={e => { setUserCountry(e.target.value); localStorage.setItem("mh_country", e.target.value); }}
                  style={{
                    background: "#e8f5e4", border: "1px solid #c0ddb8",
                    color: "#3a6a3a", fontSize: 11, borderRadius: 8,
                    padding: "4px 8px", cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif", fontWeight: 600,
                  }}
                >
                  <option value="GB">🇬🇧 UK</option>
                  <option value="US">🇺🇸 US</option>
                  <option value="CA">🇨🇦 Canada</option>
                  <option value="AU">🇦🇺 Australia</option>
                  <option value="NZ">🇳🇿 New Zealand</option>
                  <option value="IE">🇮🇪 Ireland</option>
                  <option value="IN">🇮🇳 India</option>
                  <option value="DEFAULT">🌍 Global</option>
                </select>
              </div>

              {/* Resource cards — warm whites, no red */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {crisisResources.map(res => (
                  <a
                    key={res.name}
                    href={res.url}
                    style={{
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      background: "#ffffff",
                      border: "1px solid #e4f0e0",
                      borderRadius: 18,
                      padding: "14px 16px",
                      boxShadow: "0 1px 8px rgba(60,100,60,0.06)",
                    }}
                  >
                    {/* Icon circle in the resource's own colour */}
                    <div style={{
                      width: 46, height: 46, borderRadius: 15, flexShrink: 0,
                      background: `${res.color}18`,
                      border: `1.5px solid ${res.color}40`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22,
                    }}>
                      {res.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#1e3820", marginBottom: 1, fontFamily: "'Nunito', sans-serif" }}>
                        {res.name}
                      </div>
                      <div style={{ fontSize: 11, color: "#7a9a78", marginBottom: 3, fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.4 }}>
                        {res.desc}
                      </div>
                      <div style={{ fontSize: 13, color: res.color, fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
                        {res.contact}
                      </div>
                    </div>
                    <div style={{
                      padding: "8px 16px", borderRadius: 12,
                      background: `${res.color}18`,
                      color: res.color, fontSize: 12, fontWeight: 700,
                      fontFamily: "'Nunito', sans-serif", whiteSpace: "nowrap",
                      border: `1px solid ${res.color}30`,
                    }}>
                      {res.type === "call" ? "Call" : res.type === "text" ? "Text" : "Chat"}
                    </div>
                  </a>
                ))}
              </div>

              {/* Grounding — integrated naturally, not labelled like a form */}
              <div style={{
                background: "linear-gradient(135deg, #f0fdf4, #eaf7ec)",
                border: "1px solid #c8e8c4",
                borderRadius: 18, padding: "16px 18px", marginBottom: 14,
              }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1e3820", fontFamily: "'Nunito', sans-serif", marginBottom: 6 }}>
                  🌿 While you work up to calling
                </div>
                <div style={{ fontSize: 13, color: "#4a7a4a", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.8 }}>
                  Name{" "}
                  <span style={{ fontWeight: 700, color: "#2d6a2d" }}>5 things you can see</span>,{" "}
                  <span style={{ fontWeight: 700, color: "#2d6a2d" }}>4 you can touch</span>,{" "}
                  <span style={{ fontWeight: 700, color: "#2d6a2d" }}>3 you can hear</span>,{" "}
                  <span style={{ fontWeight: 700, color: "#2d6a2d" }}>2 you can smell</span>,{" "}
                  <span style={{ fontWeight: 700, color: "#2d6a2d" }}>1 you can taste</span>.
                </div>
                <div style={{ fontSize: 12, color: "#7a9a7a", fontFamily: "'Nunito Sans', sans-serif", marginTop: 8, lineHeight: 1.6 }}>
                  This brings you back into your body and out of the spiral. It doesn't have to fix everything. Just this, right now.
                </div>
              </div>

              {/* Close — warm, not dismissive */}
              <button
                onClick={() => setShowCrisis(false)}
                style={{
                  width: "100%", padding: "14px", borderRadius: 16,
                  background: "#f0f7ee",
                  border: "1.5px solid #cce4c4",
                  color: "#5a8a5a", fontSize: 14, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                I'm okay for now
              </button>
            </div>
          </div>
        </div>
      )}
      {/* DISCLAIMER */}
      <div style={{ padding: "20px 24px 32px", textAlign: "center", borderTop: "1px solid #e8f0e4", marginTop: 8 }}>
        <div style={{ fontSize: 11, color: "#9aba98", fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.8, maxWidth: 360, margin: "0 auto" }}>
          Anchor is a self-help tool and is not a substitute for professional medical advice, diagnosis or treatment. If you are in crisis or need urgent help, please contact emergency services or a mental health professional.
        </div>
        <div style={{ marginTop: 10, fontSize: 10, color: "#b8d4b4", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
          WIRED &amp; WELL · ANCHOR · wiredandwell.co.uk
        </div>
      </div>
    </div>
  );
}