import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { EvidenceModal } from './EvidenceModal';

describe('EvidenceModal', () => {
  const mockProps = {
    questionId: 'q1',
    existingEvidence: null,
    onSave: vi.fn(),
    onClose: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal', () => {
    render(<EvidenceModal {...mockProps} />);
    expect(screen.getByTestId('evidence-modal')).toBeInTheDocument();
  });

  it('should display question ID in header', () => {
    render(<EvidenceModal {...mockProps} />);
    expect(screen.getByText(/Q1/)).toBeInTheDocument();
  });

  it('should render text evidence textarea', () => {
    render(<EvidenceModal {...mockProps} />);
    expect(screen.getByTestId('text-evidence')).toBeInTheDocument();
  });

  it('should render image upload input', () => {
    render(<EvidenceModal {...mockProps} />);
    expect(screen.getByTestId('image-upload')).toBeInTheDocument();
  });

  it('should call onClose when close button clicked', () => {
    render(<EvidenceModal {...mockProps} />);
    fireEvent.click(screen.getByTestId('close-modal'));
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should call onClose when overlay clicked', () => {
    render(<EvidenceModal {...mockProps} />);
    fireEvent.click(screen.getByTestId('evidence-modal'));
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should not close when modal content clicked', () => {
    const onClose = vi.fn();
    render(<EvidenceModal {...mockProps} onClose={onClose} />);
    const modalContent = screen.getByTestId('evidence-modal').querySelector('.modal-content');

    fireEvent.click(modalContent);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should update text evidence on change', () => {
    render(<EvidenceModal {...mockProps} />);
    const textarea = screen.getByTestId('text-evidence');
    fireEvent.change(textarea, { target: { value: 'Test evidence' } });
    expect(textarea.value).toBe('Test evidence');
  });

  it('should load existing evidence', () => {
    const existingEvidence = {
      text: 'Existing text',
      images: [{ name: 'test.jpg', data: 'data:image/jpeg;base64,test' }]
    };
    
    render(<EvidenceModal {...mockProps} existingEvidence={existingEvidence} />);
    expect(screen.getByTestId('text-evidence').value).toBe('Existing text');
    expect(screen.getByTestId('image-preview')).toBeInTheDocument();
  });

  it('should call onSave with evidence data', () => {
    render(<EvidenceModal {...mockProps} />);
    const textarea = screen.getByTestId('text-evidence');
    fireEvent.change(textarea, { target: { value: 'Test evidence' } });
    
    fireEvent.click(screen.getByTestId('save-evidence'));
    expect(mockProps.onSave).toHaveBeenCalledWith({
      text: 'Test evidence',
      images: []
    });
  });

  it('should handle image upload', async () => {
    render(<EvidenceModal {...mockProps} />);
    const input = screen.getByTestId('image-upload');
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByTestId('image-preview')).toBeInTheDocument();
    });
  });

  it('should remove image when remove button clicked', async () => {
    const existingEvidence = {
      text: '',
      images: [{ name: 'test.jpg', data: 'data:image/jpeg;base64,test' }]
    };
    
    render(<EvidenceModal {...mockProps} existingEvidence={existingEvidence} />);
    
    const removeBtn = screen.getByTestId('remove-image-0');
    fireEvent.click(removeBtn);
    
    await waitFor(() => {
      expect(screen.queryByTestId('image-preview')).not.toBeInTheDocument();
    });
  });

  it('should call onClose when cancel button clicked', () => {
    render(<EvidenceModal {...mockProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should handle null questionId', () => {
    render(<EvidenceModal {...mockProps} questionId={null} />);
    expect(screen.getByTestId('evidence-modal')).toBeInTheDocument();
  });

  it('should handle existing evidence with empty arrays', () => {
    const existingEvidence = {
      text: 'Test',
      images: []
    };
    
    render(<EvidenceModal {...mockProps} existingEvidence={existingEvidence} />);
    expect(screen.getByTestId('text-evidence').value).toBe('Test');
  });

  it('should handle multiple image uploads', async () => {
    render(<EvidenceModal {...mockProps} />);
    const input = screen.getByTestId('image-upload');
    
    const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
    const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });
    
    Object.defineProperty(input, 'files', {
      value: [file1, file2],
      writable: false
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByTestId('image-preview')).toBeInTheDocument();
    });
  });

  it('should update when existingEvidence prop changes', () => {
    const { rerender } = render(<EvidenceModal {...mockProps} existingEvidence={null} />);
    expect(screen.getByTestId('text-evidence').value).toBe('');

    const newEvidence = {
      text: 'Updated evidence',
      images: []
    };
    
    rerender(<EvidenceModal {...mockProps} existingEvidence={newEvidence} />);
    expect(screen.getByTestId('text-evidence').value).toBe('Updated evidence');
  });

  it('should handle existing evidence without text field', () => {
    const existingEvidence = {
      images: [{ name: 'test.jpg', data: 'data:image/jpeg;base64,test' }]
    };
    
    render(<EvidenceModal {...mockProps} existingEvidence={existingEvidence} />);
    expect(screen.getByTestId('text-evidence').value).toBe('');
  });

  it('should handle existing evidence without images field', () => {
    const existingEvidence = {
      text: 'Test text'
    };

    render(<EvidenceModal {...mockProps} existingEvidence={existingEvidence} />);
    expect(screen.getByTestId('text-evidence').value).toBe('Test text');
  });

  describe('Accessibility', () => {
    it('should have role="dialog" and aria-modal="true"', () => {
      render(<EvidenceModal {...mockProps} />);
      const modalContent = screen.getByTestId('evidence-modal').querySelector('.modal-content');
      expect(modalContent).toHaveAttribute('role', 'dialog');
      expect(modalContent).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby pointing to title', () => {
      render(<EvidenceModal {...mockProps} />);
      const modalContent = screen.getByTestId('evidence-modal').querySelector('.modal-content');
      expect(modalContent).toHaveAttribute('aria-labelledby', 'evidence-modal-title');
      const title = document.getElementById('evidence-modal-title');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H3');
    });

    it('should close on Escape key press', () => {
      const onClose = vi.fn();
      render(<EvidenceModal {...mockProps} onClose={onClose} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });

    it('close button should have aria-label', () => {
      render(<EvidenceModal {...mockProps} />);
      const closeBtn = screen.getByTestId('close-modal');
      expect(closeBtn).toHaveAttribute('aria-label', 'Close');
    });

    it('remove image buttons should have aria-label', () => {
      const existingEvidence = {
        text: '',
        images: [{ name: 'screenshot.png', data: 'data:image/png;base64,test' }]
      };
      render(<EvidenceModal {...mockProps} existingEvidence={existingEvidence} />);
      const removeBtn = screen.getByTestId('remove-image-0');
      expect(removeBtn).toHaveAttribute('aria-label', 'Remove screenshot.png');
    });
  });

  describe('Focus trap (Tab key handling)', () => {
    it('should wrap focus from last element to first on Tab', () => {
      render(<EvidenceModal {...mockProps} />);
      const modal = screen.getByTestId('evidence-modal').querySelector('.modal-content');
      const focusable = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const lastEl = focusable[focusable.length - 1];

      // Focus the last focusable element
      lastEl.focus();
      expect(document.activeElement).toBe(lastEl);

      // Press Tab (no shift) on last element -> should wrap to first
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });

      // The focus trap should have called preventDefault and focused the first element
      expect(document.activeElement).toBe(focusable[0]);
    });

    it('should wrap focus from first element to last on Shift+Tab', () => {
      render(<EvidenceModal {...mockProps} />);
      const modal = screen.getByTestId('evidence-modal').querySelector('.modal-content');
      const focusable = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

      // Focus the first focusable element
      firstEl.focus();
      expect(document.activeElement).toBe(firstEl);

      // Press Shift+Tab on first element -> should wrap to last
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

      expect(document.activeElement).toBe(lastEl);
    });

    it('should not interfere with Tab when not on first or last element', () => {
      render(<EvidenceModal {...mockProps} />);
      const modal = screen.getByTestId('evidence-modal').querySelector('.modal-content');
      const focusable = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      // If there are at least 3 focusable elements, focus the middle one
      if (focusable.length >= 3) {
        const middleEl = focusable[1];
        middleEl.focus();
        // Tab should not be prevented -- just verify no crash
        fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
      }
    });

    it('should ignore non-Tab, non-Escape keys', () => {
      const onClose = vi.fn();
      render(<EvidenceModal {...mockProps} onClose={onClose} />);
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Oversized file upload', () => {
    it('should show error when file exceeds 10 MB limit', () => {
      render(<EvidenceModal {...mockProps} />);
      const input = screen.getByTestId('image-upload');

      // Create a file object larger than 10 MB
      const largeFile = new File(['x'], 'huge.jpg', { type: 'image/jpeg' });
      Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

      Object.defineProperty(input, 'files', {
        value: [largeFile],
        writable: false
      });

      fireEvent.change(input);

      expect(screen.getByTestId('upload-error')).toBeInTheDocument();
      expect(screen.getByTestId('upload-error').textContent).toContain('exceed 10 MB limit');
      expect(screen.getByTestId('upload-error').textContent).toContain('huge.jpg');
    });

    it('should show error with multiple oversized file names', () => {
      render(<EvidenceModal {...mockProps} />);
      const input = screen.getByTestId('image-upload');

      const file1 = new File(['x'], 'big1.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file1, 'size', { value: 11 * 1024 * 1024 });
      const file2 = new File(['x'], 'big2.png', { type: 'image/png' });
      Object.defineProperty(file2, 'size', { value: 15 * 1024 * 1024 });

      Object.defineProperty(input, 'files', {
        value: [file1, file2],
        writable: false
      });

      fireEvent.change(input);

      expect(screen.getByTestId('upload-error').textContent).toContain('big1.jpg');
      expect(screen.getByTestId('upload-error').textContent).toContain('big2.png');
    });
  });

  describe('File reader error handling', () => {
    it('should show error when FileReader fails', async () => {
      // Mock FileReader to trigger onerror
      const OriginalFileReader = globalThis.FileReader;
      globalThis.FileReader = class MockFileReader {
        readAsDataURL() {
          setTimeout(() => {
            this.onerror(new Error('Read failed'));
          }, 0);
        }
      };

      render(<EvidenceModal {...mockProps} />);
      const input = screen.getByTestId('image-upload');

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByTestId('upload-error')).toBeInTheDocument();
        expect(screen.getByTestId('upload-error').textContent).toContain('Failed to read test.jpg');
      });

      globalThis.FileReader = OriginalFileReader;
    });
  });

  describe('Focus restoration on unmount', () => {
    it('should restore focus to previously focused element on close', () => {
      const button = document.createElement('button');
      button.textContent = 'Trigger';
      document.body.appendChild(button);
      button.focus();

      const { unmount } = render(<EvidenceModal {...mockProps} />);
      unmount();

      expect(document.activeElement).toBe(button);
      document.body.removeChild(button);
    });
  });

  describe('accessibility', () => {
    it('should have no a11y violations', async () => {
      const { container } = render(<EvidenceModal {...mockProps} />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});