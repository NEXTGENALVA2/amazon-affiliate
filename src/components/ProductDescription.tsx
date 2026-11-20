import React from 'react';

interface DescriptionBlock {
  type: 'paragraph' | 'heading' | 'list';
  content: string[];
}

function parseDescription(description: string): DescriptionBlock[] {
  const blocks: DescriptionBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: 'paragraph', content: paragraph });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ type: 'list', content: list });
    list = [];
  };

  for (const rawLine of description.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      continue;
    }
    flushList();

    const markdownHeading = line.match(/^#{1,3}\s+(.{2,90})$/);
    const heading = line.match(/^(?:#{1,3}\s+)?(.{2,90}:)$/);
    const namedHeading = line.match(/^(about this item|key features?|product details?|highlights|specifications|what.s included)\s*:?\s*$/i);
    const allCapsHeading = line.length <= 90 &&
      line.split(/\s+/).length <= 10 &&
      line === line.toLocaleUpperCase() &&
      /[A-Z]/.test(line);
    if ((markdownHeading || heading || namedHeading || allCapsHeading) && !line.includes('. ')) {
      flushParagraph();
      blocks.push({ type: 'heading', content: [markdownHeading?.[1] || heading?.[1] || namedHeading?.[1] || line.replace(/^#{1,3}\s+/, '')] });
      continue;
    }
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const token = /(\*\*[^*]+\*\*|__[^_]+__|[A-Z][A-Za-z0-9-]*(?:\s+[A-Z][A-Za-z0-9-]*){0,5}:)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = token.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const value = match[0];
    const boldText = value.startsWith('**')
      ? value.slice(2, -2)
      : value.startsWith('__')
        ? value.slice(2, -2)
        : value;
    nodes.push(<strong key={`bold-${key++}`} className="font-bold text-slate-950">{boldText}</strong>);
    lastIndex = match.index + value.length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export const ProductDescription: React.FC<{ description: string; className?: string }> = ({
  description,
  className = '',
}) => {
  const blocks = parseDescription(description);
  if (!blocks.length) {
    return <p className={className}>Product details have not been added yet.</p>;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <h5 key={index} className="text-sm font-bold text-slate-950">
              {renderInline(block.content[0])}
            </h5>
          );
        }
        if (block.type === 'list') {
          return (
            <ul key={index} className="list-disc space-y-2 pl-5 marker:text-amber-500">
              {block.content.map((item, itemIndex) => (
                <li key={itemIndex} className="pl-1">
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index}>
            {block.content.map((line, lineIndex) => (
              <React.Fragment key={lineIndex}>
                {lineIndex > 0 && <br />}
                {renderInline(line)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
};
