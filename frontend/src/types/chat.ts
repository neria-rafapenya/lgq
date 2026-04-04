export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

export type StoryStep = {
  id: string;
  assistant?: ChatMessage;
  user?: ChatMessage;
};

export type ChapterSplit = {
  title?: string;
  subtitle?: string;
  body: string;
};
