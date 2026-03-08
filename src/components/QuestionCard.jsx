import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { NA_VALUE } from '../utils/scoreCalculator';

const RATING_OPTIONS = [
  { value: 1, label: 'Not Implemented' },
  { value: 2, label: 'Initial/Ad-hoc' },
  { value: 3, label: 'Defined/Repeatable' },
  { value: 4, label: 'Managed/Measured' },
  { value: 5, label: 'Optimized/Innovating' }
];

export const QuestionCard = ({
  question,
  answer,
  comment,
  onAnswerChange,
  onClearAnswer,
  onCommentChange,
  onAddEvidence,
  hasEvidence
}) => {
  const [selectedValue, setSelectedValue] = useState(answer);
  const [commentOpen, setCommentOpen] = useState(!!comment);
  const [commentText, setCommentText] = useState(comment || '');

  useEffect(() => {
    setSelectedValue(answer);
  }, [answer]);

  useEffect(() => {
    setCommentText(comment || '');
    if (comment) setCommentOpen(true);
  }, [comment]);

  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
    onCommentChange(e.target.value);
  };

  const handleOptionClick = (value) => {
    if (selectedValue === value) {
      setSelectedValue(null);
      onClearAnswer();
    } else {
      setSelectedValue(value);
      onAnswerChange(value);
    }
  };

  const handleNAClick = () => {
    if (selectedValue === NA_VALUE) {
      setSelectedValue(null);
      onClearAnswer();
    } else {
      setSelectedValue(NA_VALUE);
      onAnswerChange(NA_VALUE);
    }
  };

  return (
    <div className="question-card" data-testid={`question-${question.id}`}>
      <div className="question-header">
        <span className="question-id">{question.id.toUpperCase()}</span>
        {question.requiresEvidence && (
          <span className="evidence-required">📎 Evidence Required</span>
        )}
      </div>
      
      <p className="question-text">{question.text}</p>
      
      <div className="rating-scale">
        {RATING_OPTIONS.map(option => (
          <button
            key={option.value}
            className={`rating-option ${selectedValue === option.value ? 'selected' : ''}`}
            onClick={() => handleOptionClick(option.value)}
            data-testid={`option-${question.id}-${option.value}`}
          >
            <span className="rating-value">{option.value}</span>
            <span className="rating-label">{option.label}</span>
          </button>
        ))}
      </div>
      
      <div className="question-actions">
        {selectedValue && selectedValue !== NA_VALUE && (
          <button
            className="clear-btn"
            onClick={() => handleOptionClick(selectedValue)}
            data-testid={`clear-${question.id}`}
          >
            ✕ Clear Answer
          </button>
        )}

        <button
          className={`na-btn ${selectedValue === NA_VALUE ? 'selected' : ''}`}
          onClick={handleNAClick}
          data-testid={`na-${question.id}`}
          title="Mark as Not Applicable — excludes this question from scoring"
        >
          {selectedValue === NA_VALUE ? '✓ N/A — Not Applicable' : 'N/A'}
        </button>

        <button
          className="evidence-btn"
          onClick={onAddEvidence}
          data-testid={`evidence-${question.id}`}
        >
          📎 {hasEvidence ? 'View Evidence' : 'Add Evidence'}
        </button>

        <button
          className={`comment-toggle-btn ${commentText ? 'has-comment' : ''}`}
          onClick={() => setCommentOpen(open => !open)}
          data-testid={`comment-toggle-${question.id}`}
          title="Add a brief note for this question"
        >
          💬 {commentText ? 'Edit Note' : 'Add Note'}
        </button>
      </div>

      {commentOpen && (
        <div className="comment-area" data-testid={`comment-area-${question.id}`}>
          <textarea
            className="comment-textarea"
            placeholder="Add a brief note about this question…"
            value={commentText}
            onChange={handleCommentChange}
            rows={3}
            data-testid={`comment-input-${question.id}`}
            aria-label={`Note for question ${question.id}`}
          />
        </div>
      )}
    </div>
  );
};

QuestionCard.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    requiresEvidence: PropTypes.bool
  }).isRequired,
  answer: PropTypes.number,
  comment: PropTypes.string,
  onAnswerChange: PropTypes.func.isRequired,
  onClearAnswer: PropTypes.func.isRequired,
  onCommentChange: PropTypes.func.isRequired,
  onAddEvidence: PropTypes.func.isRequired,
  hasEvidence: PropTypes.bool
};