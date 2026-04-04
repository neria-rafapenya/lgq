import type { ChapterSplit, ChatMessage, StoryStep } from "../types/chat";

export const buildStorySteps = (messages: ChatMessage[]): StoryStep[] => {
  const steps: StoryStep[] = [];
  let current: StoryStep | null = null;

  messages.forEach((message) => {
    if (message.role === "assistant") {
      if (current) steps.push(current);
      current = { id: message.id, assistant: message };
      return;
    }
    if (!current) {
      current = { id: message.id, user: message };
      return;
    }
    if (!current.user) {
      current.user = message;
      return;
    }
    current = {
      id: message.id,
      assistant: current.assistant,
      user: {
        ...current.user,
        content: `${current.user.content}\n${message.content}`,
      },
    };
  });

  if (current) steps.push(current);
  return steps;
};

export const splitChapter = (content: string): ChapterSplit => {
  const trimmed = content.trim();
  if (!trimmed) return { body: content };

  const inlineMarkdown = trimmed.match(
    /^(?<preamble>[\s\S]*?)#{2,3}\s*(?<title>Tu\s+reforma|Cap[ií]tulo\s+\d+)\s+(?<subtitle>[^?\n]+)(?<rest>[\s\S]*)$/i,
  );
  if (inlineMarkdown?.groups) {
    const { preamble, title, subtitle, rest } = inlineMarkdown.groups;
    const body = `${preamble ?? ""} ${rest ?? ""}`.trim();
    return {
      title: title.trim(),
      subtitle: subtitle.trim(),
      body: body || content,
    };
  }

  const dotted = trimmed.match(
    /^(Tu\s+reforma|Cap[ií]tulo\s+\d+)\s*[·–—-]\s*([^:\n]+)(?::\s*)?([\s\S]*)$/i,
  );
  if (dotted) {
    const [, title, subtitle, rest] = dotted;
    const body = rest.trim();
    return { title: title.trim(), subtitle: subtitle.trim(), body };
  }

  const scopeMarkdown = trimmed.match(
    /^(#{2,3})\s*(Tu\s+reforma|Cap[ií]tulo\s+1)\s*\n([^\n]+)\n([\s\S]*)$/i,
  );
  if (scopeMarkdown) {
    const [, , title, subtitle, rest] = scopeMarkdown;
    return { title: title.trim(), subtitle: subtitle.trim(), body: rest.trim() };
  }

  const firstLineBreak = trimmed.indexOf("\n");
  if (firstLineBreak > 0) {
    const firstLine = trimmed.slice(0, firstLineBreak).trim();
    if (/^(Tu\s+reforma|Cap[ií]tulo\s+\d+|Cierre)\b/i.test(firstLine)) {
      return { title: firstLine, body: trimmed.slice(firstLineBreak + 1).trim() };
    }
  }

  if (/^(Tu\s+reforma|Cap[ií]tulo\s+\d+|Cierre)\b/i.test(trimmed)) {
    const questionIndex = trimmed.indexOf("¿");
    if (questionIndex > 0) {
      const title = trimmed.slice(0, questionIndex).trim().replace(/[.:]\s*$/, "");
      const body = trimmed.slice(questionIndex).trim();
      return { title, body };
    }
  }

  const match = trimmed.match(
    /^(Tu\s+reforma\s*[·–—-]\s*[^:\n¿.]+|Cap[ií]tulo\s+\d+\s*[·–—-]\s*[^:\n¿.]+)(?::|\.|\n)([\s\S]*)$/i,
  );
  if (!match) return { body: content };
  const [, title, rest] = match;
  const body = rest.trim();
  if (body) return { title, body };
  const fallback = trimmed
    .slice(title.length)
    .replace(/^[:.\s]+/, "")
    .trim();
  return { title, body: fallback || content };
};
