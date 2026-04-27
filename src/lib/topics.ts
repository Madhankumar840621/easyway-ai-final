export type TopicId = "education" | "health" | "business" | "travel" | "custom";

export interface Topic {
  id: TopicId;
  name: string;
  emoji: string;
  tagline: string;
  gradient: string;
  systemPrompt: string;
}

export const TOPICS: Topic[] = [
  {
    id: "education",
    name: "Education & Learning",
    emoji: "📚",
    tagline: "Tutoring, study help, explanations",
    gradient: "linear-gradient(135deg, oklch(0.72 0.22 260), oklch(0.78 0.18 200))",
    systemPrompt:
      "You are Easy Way's Education tutor. Explain concepts step by step, give examples, quiz the user, and adapt to their level. Use markdown with headings, bullets, and code where useful.",
  },
  {
    id: "health",
    name: "Health & Wellness",
    emoji: "💪",
    tagline: "Fitness, nutrition, mindfulness",
    gradient: "linear-gradient(135deg, oklch(0.78 0.2 145), oklch(0.85 0.18 95))",
    systemPrompt:
      "You are Easy Way's Health & Wellness coach. Give safe, evidence-based guidance on fitness, nutrition, sleep and mental wellness. Always remind users to consult a professional for medical issues. Be encouraging and practical.",
  },
  {
    id: "business",
    name: "Business & Career",
    emoji: "💼",
    tagline: "Strategy, resumes, productivity",
    gradient: "linear-gradient(135deg, oklch(0.68 0.27 340), oklch(0.72 0.22 25))",
    systemPrompt:
      "You are Easy Way's Business & Career advisor. Help with resumes, interviews, business strategy, marketing, productivity and finance. Give actionable, structured advice with clear next steps.",
  },
  {
    id: "travel",
    name: "Travel & Lifestyle",
    emoji: "✈️",
    tagline: "Trips, food, hobbies",
    gradient: "linear-gradient(135deg, oklch(0.78 0.18 200), oklch(0.85 0.18 95))",
    systemPrompt:
      "You are Easy Way's Travel & Lifestyle guide. Plan trips, recommend destinations, suggest itineraries, food, and hobbies. Offer budget-friendly and premium options. Be vivid and inspiring.",
  },
  {
    id: "custom",
    name: "Anything Else",
    emoji: "✨",
    tagline: "Custom topics — just ask",
    gradient: "linear-gradient(135deg, oklch(0.72 0.28 25), oklch(0.68 0.27 340), oklch(0.65 0.24 285))",
    systemPrompt:
      "You are Easy Way, a friendly, vibrant AI assistant. Help with anything the user asks — coding, writing, planning, brainstorming. Use markdown formatting and keep a warm, encouraging tone.",
  },
];

export function getTopic(id: string | undefined): Topic {
  return TOPICS.find((t) => t.id === id) ?? TOPICS[TOPICS.length - 1];
}
