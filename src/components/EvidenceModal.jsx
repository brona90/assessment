import { useState } from 'react';
import PropTypes from 'prop-types';

export const EvidenceModal = ({ questionId, existingEvidence, onSave, onClose }) => {
  const [textEvidence, setTextEvidence] = useState(existingEvidence?.text || '');
  const [images, setImages] = useState(existingEvidence?.images || []);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            name: file.name,
            data: event.target.result,
            size: file.size
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(newImages => {
      setImages([...images, ...newImages]);
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Evidence for {questionId?.toUpperCase()}</h3>
          <button className="modal-close" onClick={onClose} data-testid="close-modal">
            ✕
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
            <label>Image Evidence:</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              data-testid="image-upload"
            />
            
            {images.length > 0 && (
              <div className="image-preview-grid" data-testid="image-preview">
                {images.map((img, idx) => (
                  <div key={idx} className="image-preview-item">
                    <img src={img.data} alt={img.name} />
                    <button
                      className="remove-image"
                      onClick={() => handleRemoveImage(idx)}
                      data-testid={`remove-image-${idx}`}
                    >
                      ✕
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