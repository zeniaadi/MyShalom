export interface VerseResult {
  reference: string;
  text: string;
  is_paraphrase: boolean;
  why_relevant_one_line: string;
  link: string;
}

// Footer data is now static in the UI, removed from API response type
export interface VerseResponse {
  title: string;
  interpreted_feelings: string[];
  need: string;
  results: VerseResult[];
}

export interface FeelingOption {
  id: string;
  label: string;
}

export interface FeelingCategory {
  id: string;
  label: string;
  description: string;
  colorClass: string; // Tailwind class for generic color referencing
  baseColor: string; // e.g. "amber", "emerald"
  feelings: FeelingOption[];
}
