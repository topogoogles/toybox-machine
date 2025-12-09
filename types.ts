export enum AspectRatio {
  SQUARE = "1:1",
  PORTRAIT = "3:4",
  LANDSCAPE = "4:3",
  WIDE = "16:9",
  TALL = "9:16"
}

export interface GenerationResult {
  imageUrl: string | null;
  text: string | null;
}

export interface HistoryItem {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
}

export interface ToyBoxState {
  inputImage: string | null; // Base64
  inputMimeType: string;
  userPrompt: string;
  generatedImage: string | null;
  isGenerating: boolean;
  isEnhancing: boolean;
  isAutoEnhance: boolean; // Checkbox state
  isBrainstorming: boolean;
  brainstormingIdeas: string | null;
  aspectRatio: AspectRatio;
  error: string | null;
  history: HistoryItem[];
}