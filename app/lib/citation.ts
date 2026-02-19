export function parseCitation(text: string): { content: string; citations: { document: string; page: number }[] } {
  const citationRegex = /\(Source: ([^,]+), Page (\d+)\)/g;
  let match;
  let lastIndex = 0;
  const citations: { document: string; page: number }[] = [];
  let content = "";

  while ((match = citationRegex.exec(text)) !== null) {
    content += text.substring(lastIndex, match.index);
    citations.push({
      document: match[1],
      page: parseInt(match[2], 10),
    });
    lastIndex = citationRegex.lastIndex;
  }

  content += text.substring(lastIndex);

  return { content: content.trim(), citations };
}
