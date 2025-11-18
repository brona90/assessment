import { useState } from 'react';
import PropTypes from 'prop-types';

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
  onAnswerChange, 
  onClearAnswer,
  onAddEvidence,
  hasEvidence 
}) => {
  const [selectedValue, setSelectedValue] = useState(answer);

  const handleOptionClick = (value) => {
    if (selectedValue === value) {
      setSelectedValue(null);
      onClearAnswer();
    } else {
      setSelectedValue(value);
      onAnswerChange(value);
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
        {selectedValue && (
          <button 
            className="clear-btn"
            onClick={() => handleOptionClick(selectedValue)}
            data-testid={`clear-${question.id}`}
          >
            ✕ Clear Answer
          </button>
        )}
        
        <button 
          className="evidence-btn"
          onClick={onAddEvidence}
          data-testid={`evidence-${question.id}`}
        >
          📎 {hasEvidence ? 'View Evidence' : 'Add Evidence'}
        </button>
      </div>
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
  onAnswerChange: PropTypes.func.isRequired,
  onClearAnswer: PropTypes.func.isRequired,
  onAddEvidence: PropTypes.func.isRequired,
  hasEvidence: PropTypes.bool
};