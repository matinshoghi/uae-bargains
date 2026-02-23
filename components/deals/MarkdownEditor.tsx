"use client";

import { useState, useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Link,
  List,
  ListOrdered,
  Heading3,
  Code,
  Eye,
  Pencil,
} from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MarkdownEditorProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}

type FormatAction = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  prefix: string;
  suffix: string;
  block?: boolean;
};

const FORMAT_ACTIONS: FormatAction[] = [
  { icon: Bold, label: "Bold", prefix: "**", suffix: "**" },
  { icon: Italic, label: "Italic", prefix: "*", suffix: "*" },
  { icon: Strikethrough, label: "Strikethrough", prefix: "~~", suffix: "~~" },
  { icon: Code, label: "Code", prefix: "`", suffix: "`" },
  { icon: Link, label: "Link", prefix: "[", suffix: "](url)" },
  { icon: Heading3, label: "Heading", prefix: "### ", suffix: "", block: true },
  { icon: List, label: "Bullet list", prefix: "- ", suffix: "", block: true },
  { icon: ListOrdered, label: "Numbered list", prefix: "1. ", suffix: "", block: true },
];

export function MarkdownEditor({
  name,
  defaultValue = "",
  placeholder,
  required,
}: MarkdownEditorProps) {
  const [value, setValue] = useState(defaultValue);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = useCallback(
    (action: FormatAction) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = value.slice(start, end);

      let newText: string;
      let cursorPos: number;

      if (action.block) {
        // For block-level formatting, insert at start of line
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        const before = value.slice(0, lineStart);
        const after = value.slice(lineStart);

        if (selected) {
          // Prefix each selected line
          const lines = value.slice(start, end).split("\n");
          const prefixed = lines
            .map((line, i) => {
              const prefix =
                action.label === "Numbered list"
                  ? `${i + 1}. `
                  : action.prefix;
              return prefix + line;
            })
            .join("\n");
          newText = value.slice(0, start) + prefixed + value.slice(end);
          cursorPos = start + prefixed.length;
        } else {
          newText = before + action.prefix + after;
          cursorPos = lineStart + action.prefix.length;
        }
      } else {
        // Inline formatting — wrap selection
        const before = value.slice(0, start);
        const after = value.slice(end);

        if (selected) {
          newText = before + action.prefix + selected + action.suffix + after;
          cursorPos = start + action.prefix.length + selected.length + action.suffix.length;
        } else {
          const placeholder = action.label === "Link" ? "text" : action.label.toLowerCase();
          newText = before + action.prefix + placeholder + action.suffix + after;
          // Select the placeholder text
          cursorPos = start + action.prefix.length;
          setValue(newText);
          // Set selection after state update
          requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(
              cursorPos,
              cursorPos + placeholder.length
            );
          });
          return;
        }
      }

      setValue(newText);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(cursorPos, cursorPos);
      });
    },
    [value]
  );

  return (
    <div className="overflow-hidden rounded-md border-2 border-input focus-within:border-ring">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-input bg-muted/30 px-1">
        <div className="flex">
          <button
            type="button"
            onClick={() => setMode("write")}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
              mode === "write"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Pencil className="h-3.5 w-3.5" />
            Write
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
              mode === "preview"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
        </div>
      </div>

      {/* Toolbar — only in write mode */}
      {mode === "write" && (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/20 px-2 py-1.5">
          {FORMAT_ACTIONS.map((action, i) => (
            <span key={action.label} className="contents">
              {/* Separator between inline and block actions */}
              {i === 4 && (
                <span className="mx-1 h-5 w-px bg-border" />
              )}
              {i === 5 && (
                <span className="mx-1 h-5 w-px bg-border" />
              )}
              <button
                type="button"
                onClick={() => applyFormat(action)}
                title={action.label}
                className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <action.icon className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Editor / Preview area */}
      {mode === "write" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          rows={6}
          className="w-full resize-y bg-transparent px-3 py-2 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none"
        />
      ) : (
        <div className="min-h-[156px] px-3 py-2 text-sm">
          {value.trim() ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-muted-foreground">Nothing to preview</p>
          )}
        </div>
      )}

      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={value} />

      {/* Footer hint */}
      <div className="border-t border-input bg-muted/20 px-3 py-1.5">
        <p className="text-xs text-muted-foreground">
          Supports <strong>**bold**</strong>, <em>*italic*</em>, [links](url), lists, and{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">`code`</code>{" "}
          for coupon codes.
        </p>
      </div>
    </div>
  );
}
