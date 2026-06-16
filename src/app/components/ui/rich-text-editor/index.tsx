'use client';

import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo,
  Strikethrough,
  Undo,
} from 'lucide-react';

interface RichTextEditorProps {
  content: Record<string, unknown> | null;
  onChange: (json: Record<string, unknown>) => void;
  placeholder?: string;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center border transition-all duration-150 ${
        active
          ? 'border-red-700/60 bg-red-950/40 text-red-400'
          : 'border-transparent text-white/30 hover:border-red-900/30 hover:text-white/60'
      } disabled:opacity-30`}>
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px bg-red-900/20" />;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Write something…',
      }),
    ],
    content: content ?? undefined,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as Record<string, unknown>);
    },
    editorProps: {
      attributes: {
        class: 'prose-editor min-h-[300px] outline-none',
      },
    },
  });

  if (!editor) return null;

  function addLink() {
    const url = window.prompt('URL');
    if (!url) return;
    editor?.chain().focus().setLink({ href: url }).run();
  }

  return (
    <div className="flex flex-col border border-red-900/25">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-red-900/25 bg-white/[0.02] px-3 py-2">
        <ToolbarButton
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}>
          <Bold className="h-3.5 w-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}>
          <Italic className="h-3.5 w-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          title="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}>
          <Strikethrough className="h-3.5 w-3.5" strokeWidth={2} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          title="Heading 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}>
          <Heading2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton
          title="Heading 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}>
          <Heading3 className="h-3.5 w-3.5" strokeWidth={1.5} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          title="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}>
          <List className="h-3.5 w-3.5" strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}>
          <ListOrdered className="h-3.5 w-3.5" strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton
          title="Blockquote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}>
          <Quote className="h-3.5 w-3.5" strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton title="Add link" onClick={addLink} active={editor.isActive('link')}>
          <LinkIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo className="h-3.5 w-3.5" strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo className="h-3.5 w-3.5" strokeWidth={1.5} />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} className="rich-text-editor px-5 py-4 text-sm font-light text-white/75" />
    </div>
  );
}
