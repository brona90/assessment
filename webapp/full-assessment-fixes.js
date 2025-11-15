// Additional JavaScript fixes for full-assessment.html

// Add clear buttons to all questions after page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        // Find all question cards
        const questionCards = document.querySelectorAll('.question-card');
        
        questionCards.forEach(card => {
            const questionId = card.getAttribute('data-question-id');
            if (!questionId) return;
            
            // Check if clear button already exists
            if (card.querySelector(`[data-clear-btn="${questionId}"]`)) return;
            
            // Find the evidence button
            const evidenceBtn = card.querySelector('.evidence-btn');
            if (!evidenceBtn) return;
            
            // Create clear button
            const clearBtn = document.createElement('button');
            clearBtn.className = 'clear-answer-btn';
            clearBtn.setAttribute('data-clear-btn', questionId);
            clearBtn.onclick = () => clearAnswer(questionId);
            clearBtn.innerHTML = '✕ Clear Answer';
            clearBtn.style.display = assessmentData[questionId] !== undefined ? 'inline-block' : 'none';
            
            // Insert after evidence button
            evidenceBtn.parentNode.insertBefore(clearBtn, evidenceBtn.nextSibling);
        });
    }, 1000);
});

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

