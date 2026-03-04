"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import {
  Bold,
  Italic,
  Strikethrough,
  Link as LinkIcon,
  List,
  ListOrdered,
  Heading3,
  Code,
  Quote,
  Minus,
  SquareCode,
  Unlink,
  ExternalLink,
  Pencil,
  Check,
} from "lucide-react";

interface MarkdownEditorProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  onChange?: (value: string) => void;
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("mailto:")) return trimmed;
  return `https://${trimmed}`;
}

function LinkPopover({
  initialUrl,
  onApply,
  onRemove,
  onClose,
  hasExistingLink,
}: {
  initialUrl: string;
  onApply: (url: string) => void;
  onRemove: () => void;
  onClose: () => void;
  hasExistingLink: boolean;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [isEditing, setIsEditing] = useState(!hasExistingLink);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  function handleApply() {
    const normalized = normalizeUrl(url);
    if (!normalized) return;
    onApply(normalized);
  }

  return (
    <div
      ref={containerRef}
      className="absolute left-0 top-full z-50 mt-1 w-80 rounded-lg border border-border bg-popover p-3 shadow-lg"
    >
      {hasExistingLink && !isEditing ? (
        <div className="space-y-2">
          <a
            href={initialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{initialUrl}</span>
          </a>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <Unlink className="h-3 w-3" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleApply();
              if (e.key === "Escape") onClose();
            }}
            className="flex-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none"
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={!url.trim()}
            className="flex items-center gap-1 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Check className="h-3 w-3" />
            {hasExistingLink ? "Save" : "Apply"}
          </button>
        </div>
      )}
    </div>
  );
}

export function MarkdownEditor({
  name,
  defaultValue = "",
  placeholder,
  required,
  onChange: onChangeProp,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<"editor" | "markdown">("editor");
  const [markdownText, setMarkdownText] = useState(defaultValue);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxLength = 5000;
  const length = markdownText.length;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [3] },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline underline-offset-2" },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Describe the deal — where to find it, any conditions, why it's good...",
      }),
      Markdown,
    ],
    content: defaultValue,
    immediatelyRender: false,
    onUpdate({ editor: ed }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const md = (ed.storage as any).markdown.getMarkdown() as string;
      setMarkdownText(md);
      onChangeProp?.(md);
    },
  });

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || mode !== "markdown") return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(textarea.scrollHeight, 156)}px`;
  }, [markdownText, mode]);

  const getMarkdown = useCallback(() => {
    if (!editor) return markdownText;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (editor.storage as any).markdown.getMarkdown() as string;
  }, [editor, markdownText]);

  const switchToMarkdown = useCallback(() => {
    if (editor) {
      setMarkdownText(getMarkdown());
    }
    setMode("markdown");
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, [editor]);

  const switchToEditor = useCallback(() => {
    if (editor) {
      editor.commands.setContent(markdownText);
    }
    setMode("editor");
    requestAnimationFrame(() => editor?.commands.focus());
  }, [editor, markdownText]);

  const handleToggleMode = () => {
    if (mode === "editor") switchToMarkdown();
    else switchToEditor();
  };

  const handleMarkdownChange = (val: string) => {
    setMarkdownText(val);
    onChangeProp?.(val);
  };

  const toggleLinkPopover = useCallback(() => {
    setLinkPopoverOpen((prev) => !prev);
  }, []);

  const applyLink = useCallback(
    (url: string) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
      setLinkPopoverOpen(false);
    },
    [editor]
  );

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkPopoverOpen(false);
  }, [editor]);

  type ToolbarItem =
    | { type: "button"; icon: React.ComponentType<{ className?: string }>; label: string; action: () => void; active: boolean }
    | { type: "separator" }
    | { type: "link" };

  const toolbar: ToolbarItem[] = [
    { type: "button", icon: Bold, label: "Bold", action: () => editor?.chain().focus().toggleBold().run(), active: !!editor?.isActive("bold") },
    { type: "button", icon: Italic, label: "Italic", action: () => editor?.chain().focus().toggleItalic().run(), active: !!editor?.isActive("italic") },
    { type: "button", icon: Strikethrough, label: "Strikethrough", action: () => editor?.chain().focus().toggleStrike().run(), active: !!editor?.isActive("strike") },
    { type: "button", icon: Code, label: "Inline code", action: () => editor?.chain().focus().toggleCode().run(), active: !!editor?.isActive("code") },
    { type: "separator" },
    { type: "link" },
    { type: "separator" },
    { type: "button", icon: Heading3, label: "Heading", action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), active: !!editor?.isActive("heading", { level: 3 }) },
    { type: "button", icon: List, label: "Bullet list", action: () => editor?.chain().focus().toggleBulletList().run(), active: !!editor?.isActive("bulletList") },
    { type: "button", icon: ListOrdered, label: "Numbered list", action: () => editor?.chain().focus().toggleOrderedList().run(), active: !!editor?.isActive("orderedList") },
    { type: "button", icon: Quote, label: "Blockquote", action: () => editor?.chain().focus().toggleBlockquote().run(), active: !!editor?.isActive("blockquote") },
    { type: "separator" },
    { type: "button", icon: SquareCode, label: "Code block", action: () => editor?.chain().focus().toggleCodeBlock().run(), active: !!editor?.isActive("codeBlock") },
    { type: "button", icon: Minus, label: "Horizontal rule", action: () => editor?.chain().focus().setHorizontalRule().run(), active: false },
  ];

  const isLinkActive = !!editor?.isActive("link");
  const existingLinkUrl = editor?.getAttributes("link").href ?? "";

  return (
    <div className="overflow-hidden rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border/60 px-2 py-1.5">
        {toolbar.map((item, index) => {
          if (item.type === "separator") {
            return <span key={`sep-${index}`} className="mx-1 h-5 w-px bg-border" />;
          }

          if (item.type === "link") {
            return (
              <span key="link" className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (mode === "markdown") {
                      switchToEditor();
                      requestAnimationFrame(() => toggleLinkPopover());
                    } else {
                      toggleLinkPopover();
                    }
                  }}
                  title="Link"
                  className={`rounded px-1.5 py-1 transition-colors ${
                    isLinkActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <LinkIcon className="h-4 w-4" />
                </button>
                {linkPopoverOpen && (
                  <LinkPopover
                    initialUrl={existingLinkUrl}
                    hasExistingLink={isLinkActive}
                    onApply={applyLink}
                    onRemove={removeLink}
                    onClose={() => setLinkPopoverOpen(false)}
                  />
                )}
              </span>
            );
          }

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                if (mode === "markdown") {
                  switchToEditor();
                  requestAnimationFrame(() => item.action());
                } else {
                  item.action();
                }
              }}
              title={item.label}
              className={`rounded px-1.5 py-1 transition-colors ${
                item.active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      {/* Content area */}
      {mode === "editor" ? (
        <EditorContent
          editor={editor}
          className="tiptap-editor"
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={markdownText}
          onChange={(e) => handleMarkdownChange(e.target.value)}
          placeholder={placeholder}
          rows={6}
          className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none"
        />
      )}

      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={markdownText} />

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/60 px-3 py-1.5 text-xs">
        <span
          className={
            length >= maxLength
              ? "text-red-500"
              : length >= maxLength - 500
                ? "text-amber-500"
                : "text-muted-foreground"
          }
        >
          {length.toLocaleString()} / {maxLength.toLocaleString()}
        </span>
        <button
          type="button"
          onClick={handleToggleMode}
          className="rounded px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {mode === "editor" ? "Markdown" : "Rich text"}
        </button>
      </div>
    </div>
  );
}
