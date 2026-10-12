'use client';

import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Underline,
  Unlink,
  type LucideIcon,
} from 'lucide-react';

export type RichTextLabels = {
  toolbar: string;
  bold: string;
  italic: string;
  underline: string;
  heading2: string;
  heading3: string;
  bulletList: string;
  numberedList: string;
  quote: string;
  codeBlock: string;
  link: string;
  unlink: string;
  linkPrompt: string;
};

type Props = {
  id: string;
  labelId: string;
  describedBy?: string;
  value: string;
  onChange: (html: string) => void;
  labels: RichTextLabels;
};

export default function RichTextEditor({ id, labelId, describedBy, value, onChange, labels }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        horizontalRule: false,
        link: { openOnClick: false },
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        id,
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-labelledby': labelId,
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
        class: 'rich-text min-h-40 px-3 py-2 outline-none',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? '' : editor.getHTML()),
  });

  const active = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            bold: editor.isActive('bold'),
            italic: editor.isActive('italic'),
            underline: editor.isActive('underline'),
            h2: editor.isActive('heading', { level: 2 }),
            h3: editor.isActive('heading', { level: 3 }),
            bulletList: editor.isActive('bulletList'),
            orderedList: editor.isActive('orderedList'),
            blockquote: editor.isActive('blockquote'),
            codeBlock: editor.isActive('codeBlock'),
            link: editor.isActive('link'),
          }
        : null,
  });

  function editLink() {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt(labels.linkPrompt, previous ?? 'https://');
    if (url === null) return;

    const chain = editor.chain().focus().extendMarkRange('link');
    if (url.trim() === '') chain.unsetLink().run();
    else chain.setLink({ href: url.trim() }).run();
  }

  const buttons: { label: string; icon: LucideIcon; pressed?: boolean; run: () => void }[] = editor
    ? [
        { label: labels.bold, icon: Bold, pressed: active?.bold, run: () => editor.chain().focus().toggleBold().run() },
        { label: labels.italic, icon: Italic, pressed: active?.italic, run: () => editor.chain().focus().toggleItalic().run() },
        { label: labels.underline, icon: Underline, pressed: active?.underline, run: () => editor.chain().focus().toggleUnderline().run() },
        { label: labels.heading2, icon: Heading2, pressed: active?.h2, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
        { label: labels.heading3, icon: Heading3, pressed: active?.h3, run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
        { label: labels.bulletList, icon: List, pressed: active?.bulletList, run: () => editor.chain().focus().toggleBulletList().run() },
        { label: labels.numberedList, icon: ListOrdered, pressed: active?.orderedList, run: () => editor.chain().focus().toggleOrderedList().run() },
        { label: labels.quote, icon: Quote, pressed: active?.blockquote, run: () => editor.chain().focus().toggleBlockquote().run() },
        { label: labels.codeBlock, icon: Code, pressed: active?.codeBlock, run: () => editor.chain().focus().toggleCodeBlock().run() },
        { label: labels.link, icon: LinkIcon, pressed: active?.link, run: editLink },
        { label: labels.unlink, icon: Unlink, run: () => editor.chain().focus().unsetLink().run() },
      ]
    : [];

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-300 focus-within:border-zinc-900 focus-within:ring-1 focus-within:ring-zinc-900">
      <div role="toolbar" aria-label={labels.toolbar} className="flex flex-wrap gap-1 border-b border-zinc-200 bg-zinc-50 p-1">
        {buttons.map(({ label, icon: Icon, pressed, run }) => (
          <button
            key={label}
            type="button"
            onClick={run}
            aria-label={label}
            aria-pressed={pressed === undefined ? undefined : pressed}
            title={label}
            className={`rounded-md p-1.5 ${pressed ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-200'}`}
          >
            <Icon size={16} aria-hidden />
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}