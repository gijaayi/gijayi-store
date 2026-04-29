'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Heading1, Heading2, Heading3, Type } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = 'Enter description...' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedFontSize, setSelectedFontSize] = useState('16px');
  const [selectedColor, setSelectedColor] = useState('#000000');
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

  // Handle font size change
  const handleFontSizeChange = (size: string) => {
    setSelectedFontSize(size);
    executeCommand('fontSize', '7'); // Set to max size first
    document.querySelectorAll('font[size="7"]').forEach((element) => {
      (element as HTMLElement).style.fontSize = size;
    });
    handleInput();
  };

  // Handle color change
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    executeCommand('foreColor', color);
    handleInput();
  };

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
        {/* Font Styling */}
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

        {/* Font Size Selector */}
        <select
          value={selectedFontSize}
          onChange={(e) => handleFontSizeChange(e.target.value)}
          title="Font Size"
          className="px-2 py-2 text-xs border border-slate-300 rounded hover:bg-slate-200 transition-colors bg-white"
        >
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
          <option value="28px">28px</option>
          <option value="32px">32px</option>
        </select>

        {/* Font Color Picker */}
        <div className="flex items-center gap-1">
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => handleColorChange(e.target.value)}
            title="Font Color"
            className="h-8 w-8 rounded cursor-pointer border border-slate-300"
          />
        </div>

        <div className="border-l border-slate-300 mx-1" />

        {/* Alignment */}
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

        {/* Lists */}
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

        {/* Headings */}
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h1>')}
          title="Heading 1"
          className="p-2 hover:bg-slate-200 rounded transition-colors"
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h2>')}
          title="Heading 2"
          className="p-2 hover:bg-slate-200 rounded transition-colors"
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h3>')}
          title="Heading 3"
          className="p-2 hover:bg-slate-200 rounded transition-colors"
        >
          <Heading3 size={16} />
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
