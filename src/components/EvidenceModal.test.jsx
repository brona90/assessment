import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EvidenceModal } from './EvidenceModal';

describe('EvidenceModal', () => {
  const mockProps = {
    questionId: 'q1',
    existingEvidence: null,
    onSave: vi.fn(),
    onClose: vi.fn()
  };

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
    
    // Create a synthetic event that doesn't bubble
    const event = new MouseEvent('click', { bubbles: false });
    modalContent.dispatchEvent(event);
    
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
});