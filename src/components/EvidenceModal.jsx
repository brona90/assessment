import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { X, Paperclip } from 'lucide-react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const EvidenceModal = ({ questionId, existingEvidence, onSave, onClose }) => {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Initialize state with existing evidence
  const [textEvidence, setTextEvidence] = useState(() => existingEvidence?.text || '');
  const [images, setImages] = useState(() => existingEvidence?.images || []);
  const [uploadError, setUploadError] = useState(null);

  // Focus trap and Escape key
  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    dialogRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [onClose]);

  // Update state when existingEvidence changes (for rerender scenarios)
  useEffect(() => {
    if (existingEvidence) {
      setTextEvidence(existingEvidence.text || '');
       
      setImages(existingEvidence.images || []);
    }
  }, [existingEvidence]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadError(null);

    const oversized = files.filter(f => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      setUploadError(`File(s) exceed 10 MB limit: ${oversized.map(f => f.name).join(', ')}`);
      return;
    }

    const readers = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            name: file.name,
            data: event.target.result,
            size: file.size
          });
        };
        reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(newImages => {
      setImages(prev => [...prev, ...newImages]);
    }).catch(err => {
      setUploadError(err.message);
    });
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({
      text: textEvidence,
      images: images
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="evidence-modal">
      <div
        className="modal-content"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="evidence-modal-title">Add Evidence for {questionId?.toUpperCase()}</h3>
          <button className="modal-close" onClick={onClose} data-testid="close-modal" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="evidence-section">
            <label htmlFor="text-evidence">Text Evidence:</label>
            <textarea
              id="text-evidence"
              value={textEvidence}
              onChange={(e) => setTextEvidence(e.target.value)}
              placeholder="Describe your evidence here..."
              rows={5}
              data-testid="text-evidence"
            />
          </div>

          <div className="evidence-section">
            <label htmlFor="image-upload">Image Evidence:</label>
            <label className="file-upload-label" htmlFor="image-upload">
              <span className="file-upload-icon"><Paperclip size={24} /></span>
              <span>Choose files or drag &amp; drop</span>
              <span className="file-upload-hint">PNG, JPG, PDF accepted</span>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                data-testid="image-upload"
                className="file-upload-input"
              />
            </label>
            
            {uploadError && (
              <p className="upload-error" role="alert" data-testid="upload-error" style={{ color: 'var(--danger-color)', marginTop: '0.5rem' }}>
                {uploadError}
              </p>
            )}
            {images.length > 0 && (
              <div className="image-preview-grid" data-testid="image-preview">
                {images.map((img, idx) => (
                  <div key={idx} className="image-preview-item">
                    <img src={img.data} alt={img.name} />
                    <button
                      className="remove-image"
                      onClick={() => handleRemoveImage(idx)}
                      data-testid={`remove-image-${idx}`}
                      aria-label={`Remove ${img.name}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave} data-testid="save-evidence">
            Save Evidence
          </button>
        </div>
      </div>
    </div>
  );
};

EvidenceModal.propTypes = {
  questionId: PropTypes.string,
  existingEvidence: PropTypes.shape({
    text: PropTypes.string,
    images: PropTypes.array
  }),
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};