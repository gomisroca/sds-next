import { Extension } from '@tiptap/core';

export const ExitHeadingOnEnter = Extension.create({
  name: 'exitHeadingOnEnter',
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        if ($from.parent.type.name !== 'heading') return false;

        if ($from.parentOffset !== $from.parent.nodeSize - 2) return false;

        return editor.chain().splitBlock().setNode('paragraph').run();
      },
    };
  },
});

export function renderNode(node: Record<string, unknown>): string {
  const type = node.type as string;
  const content = (node.content as Record<string, unknown>[] | undefined) ?? [];
  const attrs = (node.attrs as Record<string, unknown> | undefined) ?? {};
  const inner = content.map(renderNode).join('');

  switch (type) {
    case 'doc':
      return inner;
    case 'paragraph':
      return `<p>${inner}</p>`;
    case 'text': {
      let text = (node.text as string) ?? '';
      const marks = (node.marks as { type: string; attrs?: Record<string, string> }[]) ?? [];
      for (const mark of marks) {
        if (mark.type === 'bold') text = `<strong>${text}</strong>`;
        else if (mark.type === 'italic') text = `<em>${text}</em>`;
        else if (mark.type === 'strike') text = `<s>${text}</s>`;
        else if (mark.type === 'link') text = `<a href="${mark.attrs?.href ?? '#'}">${text}</a>`;
      }
      return text;
    }
    case 'heading':
      return `<h${String(attrs.level)}>${inner}</h${String(attrs.level)}>`;
    case 'bulletList':
      return `<ul>${inner}</ul>`;
    case 'orderedList':
      return `<ol>${inner}</ol>`;
    case 'listItem':
      return `<li>${inner}</li>`;
    case 'blockquote':
      return `<blockquote>${inner}</blockquote>`;
    case 'horizontalRule':
      return '<hr>';
    case 'hardBreak':
      return '<br>';
    case 'image':
      return `<img src="${String(attrs.src)}" alt="${typeof attrs.alt === 'string' ? attrs.alt : ''}" />`;
    default:
      return inner;
  }
}

export function tiptapToHtml(content: unknown): string {
  if (!content || typeof content !== 'object') return '';
  return renderNode(content as Record<string, unknown>);
}
