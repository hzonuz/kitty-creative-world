"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useT } from "@/components/i18n/I18nProvider";

export function RichTextEditor({
  name,
  defaultValue,
  placeholder,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const t = useT();
  const [html, setHtml] = useState(defaultValue ?? "");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? t("wiki.editorPlaceholder"),
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener", class: "text-rune-300 underline" },
      }),
    ],
    content: defaultValue ?? "",
    editorProps: {
      attributes: {
        class: "ProseMirror min-h-[320px] px-4 py-3 focus:outline-none",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  useEffect(() => {
    return () => editor?.destroy();
  }, [editor]);

  if (!editor) {
    return (
      <div className="rounded-md border border-ink-600 bg-ink-900/80 px-4 py-3 text-sm text-ink-400">
        {t("wiki.editorLoading")}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-ink-600 bg-ink-900/80">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} />
    </div>
  );
}

function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;
  const btn = (active: boolean) =>
    cn(
      "rounded px-2 py-1 text-xs transition-colors",
      active
        ? "bg-rune-500/20 text-rune-300"
        : "text-parchment-100/70 hover:bg-ink-800 hover:text-parchment-50",
    );
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-ink-700 px-2 py-2">
      <button
        type="button"
        className={btn(editor.isActive("bold"))}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        className={btn(editor.isActive("italic"))}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </button>
      <button
        type="button"
        className={btn(editor.isActive("strike"))}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        S
      </button>
      <span className="mx-1 h-4 w-px bg-ink-700" />
      <button
        type="button"
        className={btn(editor.isActive("heading", { level: 1 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </button>
      <button
        type="button"
        className={btn(editor.isActive("heading", { level: 2 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </button>
      <button
        type="button"
        className={btn(editor.isActive("heading", { level: 3 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </button>
      <span className="mx-1 h-4 w-px bg-ink-700" />
      <button
        type="button"
        className={btn(editor.isActive("bulletList"))}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </button>
      <button
        type="button"
        className={btn(editor.isActive("orderedList"))}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </button>
      <button
        type="button"
        className={btn(editor.isActive("blockquote"))}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        "Quote"
      </button>
      <button
        type="button"
        className={btn(editor.isActive("codeBlock"))}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        {`</>`}
      </button>
      <span className="mx-1 h-4 w-px bg-ink-700" />
      <button
        type="button"
        className={btn(editor.isActive("link"))}
        onClick={() => {
          const prev = editor.getAttributes("link").href as string | undefined;
          const url = window.prompt("URL", prev ?? "https://");
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().unsetLink().run();
          } else {
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }
        }}
      >
        Link
      </button>
      <button
        type="button"
        className={btn(false)}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        ―
      </button>
      <span className="mx-1 h-4 w-px bg-ink-700" />
      <button
        type="button"
        className={btn(false)}
        onClick={() => editor.chain().focus().undo().run()}
      >
        ↶
      </button>
      <button
        type="button"
        className={btn(false)}
        onClick={() => editor.chain().focus().redo().run()}
      >
        ↷
      </button>
    </div>
  );
}
