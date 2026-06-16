import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import RichTextEditor from '@/app/components/ui/rich-text-editor'; // Adjust this import path to match your project structure

// Standardized types matching Tiptap core methods chain outputs
interface MockEditorChain {
  focus: () => MockEditorChain;
  toggleBold: () => MockEditorChain;
  toggleItalic: () => MockEditorChain;
  toggleStrike: () => MockEditorChain;
  toggleHeading: (options: { level: number }) => MockEditorChain;
  toggleBulletList: () => MockEditorChain;
  toggleOrderedList: () => MockEditorChain;
  toggleBlockquote: () => MockEditorChain;
  setHorizontalRule: () => MockEditorChain;
  setLink: (options: { href: string }) => MockEditorChain;
  undo: () => MockEditorChain;
  redo: () => MockEditorChain;
  run: () => boolean;
}

const mockChain: MockEditorChain = {
  focus: () => mockChain,
  toggleBold: () => mockChain,
  toggleItalic: () => mockChain,
  toggleStrike: () => mockChain,
  toggleHeading: () => mockChain,
  toggleBulletList: () => mockChain,
  toggleOrderedList: () => mockChain,
  toggleBlockquote: () => mockChain,
  setHorizontalRule: () => mockChain,
  setLink: () => mockChain,
  undo: () => mockChain,
  redo: () => mockChain,
  run: () => true,
};

const mockEditorInstance = {
  isActive: vi.fn(() => false),
  can: vi.fn(() => ({
    undo: () => true,
    redo: () => true,
  })),
  chain: vi.fn(() => mockChain),
  getJSON: vi.fn(() => ({ type: 'doc', content: [] })),
};

// Mock Tiptap's root module hooks explicitly to keep execution predictable
vi.mock('@tiptap/react', async () => {
  const actual = await vi.importActual('@tiptap/react');
  return {
    ...actual,
    useEditor: () => mockEditorInstance,
    EditorContent: ({ className }: { className?: string }) => (
      <div data-testid="mock-editor-content" className={className} />
    ),
  };
});

describe('RichTextEditor Component', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the editor toolbar actions correctly', () => {
    render(<RichTextEditor content={null} onChange={mockOnChange} />);

    expect(screen.getByTitle('Bold')).toBeInTheDocument();
    expect(screen.getByTitle('Italic')).toBeInTheDocument();
    expect(screen.getByTitle('Heading 2')).toBeInTheDocument();
    expect(screen.getByTitle('Add link')).toBeInTheDocument();
    expect(screen.getByTestId('mock-editor-content')).toBeInTheDocument();
  });

  it('triggers bold styling commands on toolbar activation', () => {
    render(<RichTextEditor content={null} onChange={mockOnChange} />);

    const boldButton = screen.getByTitle('Bold');
    fireEvent.click(boldButton);

    expect(mockEditorInstance.chain).toHaveBeenCalled();
  });

  it('prompts the browser environment when invoking the link menu modal', () => {
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('https://sleepingdragons.com');
    render(<RichTextEditor content={null} onChange={mockOnChange} />);

    const linkButton = screen.getByTitle('Add link');
    fireEvent.click(linkButton);

    expect(promptSpy).toHaveBeenCalledWith('URL');
    promptSpy.mockRestore();
  });
});
