// Fix for answer highlighting and click-to-unselect functionality
// This script ensures selected answers are properly highlighted and can be unselected

(function() {
    'use strict';

    // Function to update answer highlighting
    function updateAnswerHighlighting() {
        // Get all radio inputs
        const radioInputs = document.querySelectorAll('.rating-option input[type="radio"]');
        
        radioInputs.forEach(radio => {
            const label = radio.closest('.rating-option');
            if (!label) return;
            
            // Remove existing click handler if any
            label.onclick = null;
            
            // Add click handler for unselect functionality
            label.onclick = function(e) {
                const input = this.querySelector('input[type="radio"]');
                const questionId = input.name;
                const currentValue = input.value;
                
                // Check if this radio is already selected
                if (input.checked && assessmentData[questionId] == currentValue) {
                    // Unselect it
                    input.checked = false;
                    delete assessmentData[questionId];
                    
                    // Save and update
                    saveToLocalStorage();
                    updateProgress();
                    updateCharts();
                    
                    // Update visual state
                    updateLabelStates(questionId);
                    
                    // Prevent default radio behavior
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                } else {
                    // Normal selection
                    input.checked = true;
                    assessmentData[questionId] = parseInt(currentValue);
                    
                    // Save and update
                    saveToLocalStorage();
                    updateProgress();
                    updateCharts();
                    
                    // Update visual state
                    updateLabelStates(questionId);
                }
            };
            
            // Update initial state
            if (radio.checked) {
                label.classList.add('selected');
            } else {
                label.classList.remove('selected');
            }
        });
    }

    // Function to update label states for a specific question
    function updateLabelStates(questionId) {
        const labels = document.querySelectorAll(`.rating-option input[name="${questionId}"]`);
        labels.forEach(input => {
            const label = input.closest('.rating-option');
            if (input.checked) {
                label.classList.add('selected');
            } else {
                label.classList.remove('selected');
            }
        });
    }

    // Function to restore selections from localStorage
    function restoreSelections() {
        if (!assessmentData) return;
        
        Object.keys(assessmentData).forEach(questionId => {
            const value = assessmentData[questionId];
            const radio = document.querySelector(`input[name="${questionId}"][value="${value}"]`);
            if (radio) {
                radio.checked = true;
                const label = radio.closest('.rating-option');
                if (label) {
                    label.classList.add('selected');
                }
            }
        });
    }

    // Override the original handleAnswerChange function
    window.handleAnswerChange = function(questionId, value) {
        assessmentData[questionId] = parseInt(value);
        saveToLocalStorage();
        updateProgress();
        updateCharts();
        updateLabelStates(questionId);
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                updateAnswerHighlighting();
                restoreSelections();
            }, 500);
        });
    } else {
        setTimeout(() => {
            updateAnswerHighlighting();
            restoreSelections();
        }, 500);
    }

    // Re-apply highlighting when questions are re-rendered
    const originalLoadQuestions = window.loadQuestions;
    if (originalLoadQuestions) {
        window.loadQuestions = async function() {
            await originalLoadQuestions();
            setTimeout(() => {
                updateAnswerHighlighting();
                restoreSelections();
            }, 200);
        };
    }

    // Export for use in other scripts
    window.updateAnswerHighlighting = updateAnswerHighlighting;
    window.restoreSelections = restoreSelections;
})();