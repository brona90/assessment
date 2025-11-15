// Additional JavaScript fixes for full-assessment.html

// Function to clear an answer
function clearAnswer(questionId) {
    // Uncheck the radio button
    const radios = document.querySelectorAll(`input[name="${questionId}"]`);
    radios.forEach(radio => {
        radio.checked = false;
    });
    
    // Remove from assessment data
    if (assessmentData[questionId] !== undefined) {
        delete assessmentData[questionId];
        saveToLocalStorage();
        updateProgress();
        updateCharts();
    }
    
    // Hide the clear button
    const clearBtn = document.querySelector(`[data-clear-btn="${questionId}"]`);
    if (clearBtn) {
        clearBtn.style.display = 'none';
    }
}

// Enhanced handleAnswerChange to show clear button
function handleAnswerChangeEnhanced(questionId, value) {
    assessmentData[questionId] = parseInt(value);
    saveToLocalStorage();
    updateProgress();
    updateCharts();
    
    // Show the clear button
    const clearBtn = document.querySelector(`[data-clear-btn="${questionId}"]`);
    if (clearBtn) {
        clearBtn.style.display = 'inline-block';
    }
}

// Override the original handleAnswerChange
const originalHandleAnswerChange = window.handleAnswerChange;
window.handleAnswerChange = function(questionId, value) {
    handleAnswerChangeEnhanced(questionId, value);
};

// Update clear buttons visibility on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        Object.keys(assessmentData || {}).forEach(questionId => {
            const clearBtn = document.querySelector(`[data-clear-btn="${questionId}"]`);
            if (clearBtn) {
                clearBtn.style.display = 'inline-block';
            }
        });
    }, 500);
});