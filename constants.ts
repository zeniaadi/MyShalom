import { FeelingCategory } from "./types";

export const FEELING_CATEGORIES: FeelingCategory[] = [
  {
    id: 'high-pleasant',
    label: 'High Energy • Pleasant',
    description: 'Enthusiastic, Alive',
    colorClass: 'bg-sky-100 border-sky-200 text-sky-900',
    baseColor: 'sky',
    feelings: [
      { id: 'enthusiastic', label: 'Enthusiastic' },
      { id: 'alive', label: 'Alive' },
      { id: 'energized', label: 'Energized' },
      { id: 'surprised', label: 'Surprised' },
      { id: 'exhilarated', label: 'Exhilarated' },
      { id: 'determined', label: 'Determined' },
      { id: 'inspired', label: 'Inspired' },
      { id: 'joyful', label: 'Joyful' },
      { id: 'empowered', label: 'Empowered' },
      { id: 'playful', label: 'Playful' },
    ]
  },
  {
    id: 'low-pleasant',
    label: 'Low Energy • Pleasant',
    description: 'Content, Safe',
    colorClass: 'bg-teal-100 border-teal-200 text-teal-900',
    baseColor: 'teal',
    feelings: [
      { id: 'respected', label: 'Respected' },
      { id: 'supported', label: 'Supported' },
      { id: 'compassionate', label: 'Compassionate' },
      { id: 'content', label: 'Content' },
      { id: 'safe', label: 'Safe' },
      { id: 'peaceful', label: 'Peaceful' },
      { id: 'thankful', label: 'Thankful' },
      { id: 'relaxed', label: 'Relaxed' },
      { id: 'serene', label: 'Serene' },
      { id: 'trusting', label: 'Trusting' },
    ]
  },
  {
    id: 'high-unpleasant',
    label: 'High Energy • Unpleasant',
    description: 'Angry, Anxious',
    colorClass: 'bg-violet-100 border-violet-200 text-violet-900',
    baseColor: 'violet',
    feelings: [
      { id: 'angry', label: 'Angry' },
      { id: 'anxious', label: 'Anxious' },
      { id: 'frustrated', label: 'Frustrated' },
      { id: 'nervous', label: 'Nervous' },
      { id: 'scared', label: 'Scared' },
      { id: 'shocked', label: 'Shocked' },
      { id: 'irritated', label: 'Irritated' },
      { id: 'overwhelmed', label: 'Overwhelmed' },
      { id: 'panicked', label: 'Panicked' },
      { id: 'defensive', label: 'Defensive' },
    ]
  },
  {
    id: 'low-unpleasant',
    label: 'Low Energy • Unpleasant',
    description: 'Lost, Ashamed',
    colorClass: 'bg-blue-100 border-blue-200 text-blue-900',
    baseColor: 'blue',
    feelings: [
      { id: 'lost', label: 'Lost' },
      { id: 'ashamed', label: 'Ashamed' },
      { id: 'disconnected', label: 'Disconnected' },
      { id: 'forlorn', label: 'Forlorn' },
      { id: 'lonely', label: 'Lonely' },
      { id: 'tired', label: 'Tired' },
      { id: 'sad', label: 'Sad' },
      { id: 'hopeless', label: 'Hopeless' },
      { id: 'numb', label: 'Numb' },
      { id: 'exhausted', label: 'Exhausted' },
    ]
  }
];

export const SYSTEM_INSTRUCTION = `
You are Shalom (formerly VerseGuide), a warm, grounded, and accurate Bible-verse companion.

OBJECTIVE
Generate 1–3 Bible verses that match the user’s current feelings or situation, and provide one short line explaining why each verse is relevant from a psychological and pastoral perspective.

AGENT FLOW (execute in order)

1) INTERPRETER
- Identify primary emotions, emotional intensity, and underlying psychological or spiritual need.
- Do NOT expose internal reasoning.

2) MATCHER
- Select Bible verses that align with the emotions and needs.
- Prefer variety across Psalms, Prophets, Gospels, and Epistles when appropriate.
- Accuracy rules:
  • Only output verses you are confident are correct.
  • If exact wording is uncertain, provide a faithful paraphrase and clearly label it as “Paraphrase (verify wording)”.
  • Never invent verse references.

3) CONTEXT CREATOR
- For each verse, add exactly one concise line explaining relevance.
- Ground explanations in emotional validation and psychological framing.
- Do not moralize, shame, or diagnose.

4) PRESENTER
- Present results in a calm, simple, and elegant tone.

LINK FORMAT
Use this format for all verse links:
https://www.biblegateway.com/passage/?search=BOOK+CH:VS&version=NIV
If multiple verses, use: CH:VS1-VS2

STYLE & SAFETY RULES
- Tone: gentle, validating, non-judgmental.
- Keep explanations short and grounded.
- Use minimal emojis (0–1).
- If the user expresses crisis or self-harm, respond with empathy but do not present scripture as a substitute for safety or professional care.
`;