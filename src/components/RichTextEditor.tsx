'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Heading2 } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = 'Enter description...' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const isInitialRender = useRef(true);
  const lastSavedContent = useRef(value);

  // Initialize editor content only on first render
  useEffect(() => {
    if (isInitialRender.current && editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
      lastSavedContent.current = value;
      isInitialRender.current = false;
    }
  }, []);

  const executeCommand = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      // Only trigger onChange if content actually changed
      if (newContent !== lastSavedContent.current) {
        lastSavedContent.current = newContent;
        onChange(newContent);
      }
    }
  }, [onChange]);

  // Sync external value changes (e.g., when selecting a different product)
  useEffect(() => {
    if (editorRef.current && value !== lastSavedContent.current) {
      // Only update if the external value is different from current editor content
      const currentContent = editorRef.current.innerHTML;
      if (value !== currentContent) {
        // Save cursor position before updating
        const selection = window.getSelection();
        const hasFocus = document.activeElement === editorRef.current;
        
        editorRef.current.innerHTML = value || '';
        lastSavedContent.current = value || '';
        
        // Restore focus if editor was focused
        if (hasFocus) {
          editorRef.current.focus();
        }
      }
    }
  }, [value]);

  return (
    <div className="border border-slate-300 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-300 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          title="Bold"
          className="p-2 hover:bg-slate-200 rounded transition-colors"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          title="Italic"
          className="p-2 hover:bg-slate-200 rounded transition-colors"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('underline')}
          title="Underline"
          className="p-2 hover:bg-slate-200 rounded transition-colors"
        >
          <Underline size={16} />
        </button>

        <div className="border-l border-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand('justifyLeft')}
          title="Align Left"
          className="p-2 hover:bg-slate-200 rounded transition-colors"
        >
          <AlignLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyCenter')}
          title="Align Center"
          className="p-2 hover:bg-slate-200 rounded transition-colors"
        >
          <AlignCenter size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyRight')}
          title="Align Right"
          className="p-2 hover:bg-slate-200 rounded transition-colors"
        >
          <AlignRight size={16} />
        </button>

        <div className="border-l border-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          title="Bullet List"
          className="p-2 hover:bg-slate-200 rounded transition-colors"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          title="Numbered List"
          className="p-2 hover:bg-slate-200 rounded transition-colors"
        >
          <ListOrdered size={16} />
        </button>

        <div className="border-l border-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h2>')}
          title="Heading"
          className="p-2 hover:bg-slate-200 rounded transition-colors"
        >
          <Heading2 size={16} />
        </button>

        <div className="border-l border-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand('removeFormat')}
          title="Clear Formatting"
          className="p-2 hover:bg-slate-200 rounded text-xs tracking-widest uppercase"
        >
          Clear
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className={`min-h-32 p-4 outline-none text-sm focus:ring-2 focus:ring-blue-500 ${
          isFocused ? 'ring-2 ring-blue-500' : ''
        }`}
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        }}
      />
    </div>
  );
}
