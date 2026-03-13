import { useState } from 'react';
import PropTypes from 'prop-types';
import { Paperclip, X, Check, MessageSquare } from 'lucide-react';
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
  complianceTags,
  onAnswerChange,
  onClearAnswer,
  onCommentChange,
  onAddEvidence,
  hasEvidence
}) => {
  const [commentOpen, setCommentOpen] = useState(!!comment);
  const [commentText, setCommentText] = useState(comment || '');

  // Keep commentText in sync when prop changes (e.g. parent resets)
  if (comment !== undefined && comment !== null && commentText !== comment && !commentOpen) {
    setCommentText(comment);
  }

  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  const handleCommentBlur = () => {
    onCommentChange(commentText);
  };

  const handleOptionClick = (value) => {
    if (answer === value) {
      onClearAnswer();
    } else {
      onAnswerChange(value);
    }
  };

  const handleNAClick = () => {
    if (answer === NA_VALUE) {
      onClearAnswer();
    } else {
      onAnswerChange(NA_VALUE);
    }
  };

  return (
    <div className="question-card" data-testid={`question-${question.id}`}>
      <div className="question-header">
        <span className="question-id">{question.id.toUpperCase()}</span>
        {question.requiresEvidence && (
          <span className="evidence-required"><Paperclip size={14} /> Evidence Required</span>
        )}
      </div>
      
      <p className="question-text">{question.text}</p>

      {complianceTags && complianceTags.length > 0 && (
        <div className="compliance-tags" data-testid={`compliance-tags-${question.id}`}>
          {complianceTags.map(tag => (
            <span
              key={tag.id}
              className="compliance-tag"
              style={{ borderColor: tag.color, color: tag.color }}
              title={tag.name}
              data-testid={`compliance-tag-${question.id}-${tag.id}`}
            >
              {tag.icon}
            </span>
          ))}
        </div>
      )}
      
      <div className="rating-scale" role="radiogroup" aria-label="Maturity level">
        {RATING_OPTIONS.map(option => (
          <button
            key={option.value}
            role="radio"
            aria-checked={answer === option.value}
            className={`rating-option ${answer === option.value ? 'selected' : ''}`}
            onClick={() => handleOptionClick(option.value)}
            data-testid={`option-${question.id}-${option.value}`}
          >
            <span className="rating-value">{option.value}</span>
            <span className="rating-label">{option.label}</span>
          </button>
        ))}
      </div>
      
      <div className="question-actions">
        {answer && answer !== NA_VALUE && (
          <button
            className="clear-btn"
            onClick={() => handleOptionClick(answer)}
            data-testid={`clear-${question.id}`}
          >
            <X size={14} /> Clear Answer
          </button>
        )}

        <button
          className={`na-btn ${answer === NA_VALUE ? 'selected' : ''}`}
          onClick={handleNAClick}
          data-testid={`na-${question.id}`}
          title="Mark as Not Applicable — excludes this question from scoring"
        >
          {answer === NA_VALUE ? <><Check size={14} /> N/A — Not Applicable</> : 'N/A'}
        </button>

        <button
          className="evidence-btn"
          onClick={onAddEvidence}
          data-testid={`evidence-${question.id}`}
        >
          <Paperclip size={14} /> {hasEvidence ? 'View Evidence' : 'Add Evidence'}
        </button>

        <button
          className={`comment-toggle-btn ${commentText ? 'has-comment' : ''}`}
          onClick={() => setCommentOpen(open => !open)}
          data-testid={`comment-toggle-${question.id}`}
          title="Add a brief note for this question"
        >
          <MessageSquare size={14} /> {commentText ? 'Edit Note' : 'Add Note'}
        </button>
      </div>

      {commentOpen && (
        <div className="comment-area" data-testid={`comment-area-${question.id}`}>
          <textarea
            className="comment-textarea"
            placeholder="Add a brief note about this question…"
            value={commentText}
            onChange={handleCommentChange}
            onBlur={handleCommentBlur}
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
  complianceTags: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.string,
    icon: PropTypes.string
  })),
  onAnswerChange: PropTypes.func.isRequired,
  onClearAnswer: PropTypes.func.isRequired,
  onCommentChange: PropTypes.func.isRequired,
  onAddEvidence: PropTypes.func.isRequired,
  hasEvidence: PropTypes.bool
};