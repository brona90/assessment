// Evidence Management System
// Handles image and text evidence storage using IndexedDB

class EvidenceManager {
    constructor() {
        this.dbName = 'AssessmentEvidence';
        this.dbVersion = 1;
        this.storeName = 'evidence';
        this.db = null;
    }

    // Initialize IndexedDB
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, { keyPath: 'questionId' });
                    objectStore.createIndex('userId', 'userId', { unique: false });
                    objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    // Save evidence for a question
    async saveEvidence(questionId, evidenceData) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            const evidence = {
                questionId: questionId,
                text: evidenceData.text || '',
                images: evidenceData.images || [],
                timestamp: new Date().toISOString(),
                userId: evidenceData.userId || 'current-user'
            };

            const request = store.put(evidence);
            request.onsuccess = () => resolve(evidence);
            request.onerror = () => reject(request.error);
        });
    }

    // Get evidence for a question
    async getEvidence(questionId) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(questionId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Get all evidence
    async getAllEvidence() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Delete evidence for a question
    async deleteEvidence(questionId) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(questionId);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Clear all evidence
    async clearAll() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Convert image file to base64 for storage
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Export all evidence as JSON
    async exportEvidence() {
        const allEvidence = await this.getAllEvidence();
        return JSON.stringify(allEvidence, null, 2);
    }

    // Import evidence from JSON
    async importEvidence(jsonData) {
        if (!this.db) await this.init();

        const evidenceArray = JSON.parse(jsonData);
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);

        for (const evidence of evidenceArray) {
            store.put(evidence);
        }

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }
}

// Global evidence manager instance
const evidenceManager = new EvidenceManager();

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await evidenceManager.init();
        console.log('Evidence manager initialized');
    } catch (error) {
        console.error('Failed to initialize evidence manager:', error);
    }
});

// Evidence UI Functions
function openEvidenceModal(questionId) {
    const modal = document.getElementById('evidenceModal');
    const modalQuestionId = document.getElementById('modalQuestionId');
    const evidenceText = document.getElementById('evidenceText');
    const imagePreview = document.getElementById('imagePreview');

    modalQuestionId.value = questionId;
    modal.style.display = 'block';

    // Load existing evidence
    evidenceManager.getEvidence(questionId).then(evidence => {
        if (evidence) {
            evidenceText.value = evidence.text || '';
            displayImages(evidence.images);
        } else {
            evidenceText.value = '';
            imagePreview.innerHTML = '';
        }
    });
}

function closeEvidenceModal() {
    const modal = document.getElementById('evidenceModal');
    modal.style.display = 'none';
}

async function saveEvidenceFromModal() {
    const questionId = document.getElementById('modalQuestionId').value;
    const text = document.getElementById('evidenceText').value;
    const fileInput = document.getElementById('evidenceImages');
    const files = fileInput.files;

    // Convert images to base64
    const images = [];
    for (let i = 0; i < files.length; i++) {
        const base64 = await evidenceManager.fileToBase64(files[i]);
        images.push({
            name: files[i].name,
            type: files[i].type,
            data: base64
        });
    }

    // Get existing evidence to merge images
    const existing = await evidenceManager.getEvidence(questionId);
    const allImages = existing && existing.images ? [...existing.images, ...images] : images;

    // Save evidence
    await evidenceManager.saveEvidence(questionId, {
        text: text,
        images: allImages
    });

    // Update UI indicator
    updateEvidenceIndicator(questionId);

    closeEvidenceModal();
    
    // Show success message
    showNotification('Evidence saved successfully!', 'success');
}

function displayImages(images) {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';

    if (!images || images.length === 0) {
        preview.innerHTML = '<p class="no-images">No images uploaded</p>';
        return;
    }

    images.forEach((img, index) => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'image-preview-item';
        
        const imgElement = document.createElement('img');
        imgElement.src = img.data;
        imgElement.alt = img.name;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-image-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.onclick = () => removeImage(index);
        
        imgContainer.appendChild(imgElement);
        imgContainer.appendChild(deleteBtn);
        preview.appendChild(imgContainer);
    });
}

async function removeImage(index) {
    const questionId = document.getElementById('modalQuestionId').value;
    const evidence = await evidenceManager.getEvidence(questionId);
    
    if (evidence && evidence.images) {
        evidence.images.splice(index, 1);
        await evidenceManager.saveEvidence(questionId, evidence);
        displayImages(evidence.images);
    }
}

function updateEvidenceIndicator(questionId) {
    evidenceManager.getEvidence(questionId).then(evidence => {
        const indicator = document.querySelector(`[data-evidence-indicator="${questionId}"]`);
        if (indicator) {
            if (evidence && (evidence.text || (evidence.images && evidence.images.length > 0))) {
                indicator.classList.add('has-evidence');
                indicator.textContent = '📎 Evidence Added';
            } else {
                indicator.classList.remove('has-evidence');
                indicator.textContent = '📎 Add Evidence';
            }
        }
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize evidence indicators on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for evidence manager to initialize
    await evidenceManager.init();
    
    // Update all evidence indicators
    const indicators = document.querySelectorAll('[data-evidence-indicator]');
    indicators.forEach(indicator => {
        const questionId = indicator.getAttribute('data-evidence-indicator');
        updateEvidenceIndicator(questionId);
    });
});