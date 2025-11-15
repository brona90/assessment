// Admin Panel JavaScript
let questionsData = null;
let usersData = null;
let servicesData = null;
let benchmarksData = null;

// Load all data on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    updateOverviewStats();
    renderQuestionsTable();
    renderUsersTable();
    renderServicesTable();
    renderBenchmarksContent();
});

async function loadAllData() {
    try {
        const [questions, users, services, benchmarks] = await Promise.all([
            fetch('data/questions.json').then(r => r.json()),
            fetch('data/users.json').then(r => r.json()),
            fetch('data/services.json').then(r => r.json()),
            fetch('data/benchmarks.json').then(r => r.json())
        ]);
        
        questionsData = questions;
        usersData = users;
        servicesData = services;
        benchmarksData = benchmarks;
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading data. Please check console for details.');
    }
}

// Tab Navigation
function showAdminSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

// Overview Stats
function updateOverviewStats() {
    let totalQuestions = 0;
    for (const domain in questionsData.domains) {
        for (const category in questionsData.domains[domain].categories) {
            totalQuestions += questionsData.domains[domain].categories[category].questions.length;
        }
    }
    
    document.getElementById('totalQuestionsCount').textContent = totalQuestions;
    document.getElementById('totalUsersCount').textContent = usersData.users.length;
    document.getElementById('totalServicesCount').textContent = servicesData.services.length;
}

// Questions Management
function renderQuestionsTable() {
    const container = document.getElementById('questionsTable');
    let html = '';
    
    for (const domainKey in questionsData.domains) {
        const domain = questionsData.domains[domainKey];
        html += `<h3 style="margin-top: 30px; color: var(--primary-color);">${domain.title} (Weight: ${(domain.weight * 100).toFixed(0)}%)</h3>`;
        
        for (const categoryKey in domain.categories) {
            const category = domain.categories[categoryKey];
            html += `
                <h4 style="margin-top: 20px; color: #6b7280;">${category.title}</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 100px;">ID</th>
                            <th>Question</th>
                            <th style="width: 120px;">Evidence</th>
                            <th style="width: 150px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            category.questions.forEach(question => {
                html += `
                    <tr>
                        <td><strong>${question.id}</strong></td>
                        <td>${question.text}</td>
                        <td>${question.requiresEvidence ? '✓ Required' : '○ Optional'}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-primary btn-small" onclick='editQuestion(${JSON.stringify(question)}, "${domainKey}", "${categoryKey}")'>Edit</button>
                                <button class="btn-danger btn-small" onclick='deleteQuestion("${question.id}", "${domainKey}", "${categoryKey}")'>Delete</button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            html += `
                    </tbody>
                </table>
            `;
        }
    }
    
    container.innerHTML = html;
}

function openAddQuestionModal() {
    document.getElementById('questionModalTitle').textContent = 'Add Question';
    document.getElementById('questionForm').reset();
    document.getElementById('questionId').value = '';
    document.getElementById('questionModal').style.display = 'block';
}

function editQuestion(question, domainKey, categoryKey) {
    document.getElementById('questionModalTitle').textContent = 'Edit Question';
    document.getElementById('questionId').value = question.id;
    document.getElementById('questionDomain').value = domainKey;
    document.getElementById('questionCategory').value = question.category;
    document.getElementById('questionText').value = question.text;
    document.getElementById('questionRequiresEvidence').checked = question.requiresEvidence;
    document.getElementById('questionModal').style.display = 'block';
}

function closeQuestionModal() {
    document.getElementById('questionModal').style.display = 'none';
}

document.getElementById('questionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const questionId = document.getElementById('questionId').value;
    const domainKey = document.getElementById('questionDomain').value;
    const category = document.getElementById('questionCategory').value;
    const text = document.getElementById('questionText').value;
    const requiresEvidence = document.getElementById('questionRequiresEvidence').checked;
    
    // Find or create category
    let categoryKey = Object.keys(questionsData.domains[domainKey].categories).find(key => 
        questionsData.domains[domainKey].categories[key].title === category
    );
    
    if (!categoryKey) {
        categoryKey = category.toLowerCase().replace(/\s+/g, '');
        questionsData.domains[domainKey].categories[categoryKey] = {
            title: category,
            questions: []
        };
    }
    
    const newQuestion = {
        id: questionId || generateQuestionId(domainKey),
        text: text,
        category: category,
        requiresEvidence: requiresEvidence
    };
    
    if (questionId) {
        // Update existing question
        const index = questionsData.domains[domainKey].categories[categoryKey].questions.findIndex(q => q.id === questionId);
        if (index !== -1) {
            questionsData.domains[domainKey].categories[categoryKey].questions[index] = newQuestion;
        }
    } else {
        // Add new question
        questionsData.domains[domainKey].categories[categoryKey].questions.push(newQuestion);
    }
    
    renderQuestionsTable();
    updateOverviewStats();
    closeQuestionModal();
    showNotification('Question saved successfully!', 'success');
});

function deleteQuestion(questionId, domainKey, categoryKey) {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    const questions = questionsData.domains[domainKey].categories[categoryKey].questions;
    const index = questions.findIndex(q => q.id === questionId);
    if (index !== -1) {
        questions.splice(index, 1);
        renderQuestionsTable();
        updateOverviewStats();
        showNotification('Question deleted successfully!', 'success');
    }
}

function generateQuestionId(domainKey) {
    const domainNum = domainKey.replace('domain', '');
    const existingIds = [];
    
    for (const catKey in questionsData.domains[domainKey].categories) {
        questionsData.domains[domainKey].categories[catKey].questions.forEach(q => {
            existingIds.push(q.id);
        });
    }
    
    let num = 1;
    while (existingIds.includes(`d${domainNum}_q${num}`)) {
        num++;
    }
    
    return `d${domainNum}_q${num}`;
}

// Users Management
function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    usersData.users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span style="padding: 4px 12px; background: ${user.role === 'admin' ? '#fef3c7' : '#dbeafe'}; border-radius: 12px; font-size: 12px;">${user.role}</span></td>
            <td>${user.assignedQuestions ? user.assignedQuestions.length : 0} questions</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-primary btn-small" onclick='editUser(${JSON.stringify(user)})'>Edit</button>
                    <button class="btn-danger btn-small" onclick='deleteUser("${user.id}")'>Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function openAddUserModal() {
    document.getElementById('userModalTitle').textContent = 'Add User';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    populateQuestionCheckboxes();
    document.getElementById('userModal').style.display = 'block';
}

function editUser(user) {
    document.getElementById('userModalTitle').textContent = 'Edit User';
    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;
    populateQuestionCheckboxes(user.assignedQuestions || []);
    document.getElementById('userModal').style.display = 'block';
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

function populateQuestionCheckboxes(selectedQuestions = []) {
    const container = document.getElementById('questionCheckboxes');
    container.innerHTML = '';
    
    for (const domainKey in questionsData.domains) {
        const domain = questionsData.domains[domainKey];
        const domainDiv = document.createElement('div');
        domainDiv.innerHTML = `<strong style="display: block; margin: 10px 0 5px 0; color: var(--primary-color);">${domain.title}</strong>`;
        container.appendChild(domainDiv);
        
        for (const categoryKey in domain.categories) {
            const category = domain.categories[categoryKey];
            category.questions.forEach(question => {
                const div = document.createElement('div');
                div.className = 'checkbox-item';
                div.innerHTML = `
                    <label>
                        <input type="checkbox" name="assignedQuestions" value="${question.id}" ${selectedQuestions.includes(question.id) ? 'checked' : ''}>
                        <span><strong>${question.id}</strong>: ${question.text.substring(0, 80)}...</span>
                    </label>
                `;
                container.appendChild(div);
            });
        }
    }
}

document.getElementById('userForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const role = document.getElementById('userRole').value;
    
    const assignedQuestions = Array.from(document.querySelectorAll('input[name="assignedQuestions"]:checked'))
        .map(cb => cb.value);
    
    const newUser = {
        id: userId || generateUserId(),
        name: name,
        email: email,
        role: role,
        assignedQuestions: assignedQuestions
    };
    
    if (userId) {
        // Update existing user
        const index = usersData.users.findIndex(u => u.id === userId);
        if (index !== -1) {
            usersData.users[index] = newUser;
        }
    } else {
        // Add new user
        usersData.users.push(newUser);
    }
    
    renderUsersTable();
    updateOverviewStats();
    closeUserModal();
    showNotification('User saved successfully!', 'success');
});

function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    const index = usersData.users.findIndex(u => u.id === userId);
    if (index !== -1) {
        usersData.users.splice(index, 1);
        renderUsersTable();
        updateOverviewStats();
        showNotification('User deleted successfully!', 'success');
    }
}

function generateUserId() {
    let num = usersData.users.length + 1;
    while (usersData.users.find(u => u.id === `user${num}`)) {
        num++;
    }
    return `user${num}`;
}

// Services Management
function renderServicesTable() {
    const tbody = document.getElementById('servicesTableBody');
    tbody.innerHTML = '';
    
    servicesData.services.forEach(service => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${service.name}</strong></td>
            <td>${service.category}</td>
            <td>${service.description}</td>
            <td>${service.questionIds ? service.questionIds.length : 0} questions</td>
            <td><span style="padding: 4px 12px; background: ${service.active ? '#d1fae5' : '#fee2e2'}; border-radius: 12px; font-size: 12px;">${service.active ? 'Active' : 'Inactive'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-primary btn-small" onclick='editService(${JSON.stringify(service)})'>Edit</button>
                    <button class="btn-danger btn-small" onclick='deleteService("${service.id}")'>Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function openAddServiceModal() {
    document.getElementById('serviceModalTitle').textContent = 'Add Service';
    document.getElementById('serviceForm').reset();
    document.getElementById('serviceId').value = '';
    document.getElementById('serviceModal').style.display = 'block';
}

function editService(service) {
    document.getElementById('serviceModalTitle').textContent = 'Edit Service';
    document.getElementById('serviceId').value = service.id;
    document.getElementById('serviceName').value = service.name;
    document.getElementById('serviceCategory').value = service.category;
    document.getElementById('serviceDescription').value = service.description;
    document.getElementById('serviceActive').value = service.active.toString();
    document.getElementById('serviceModal').style.display = 'block';
}

function closeServiceModal() {
    document.getElementById('serviceModal').style.display = 'none';
}

document.getElementById('serviceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const serviceId = document.getElementById('serviceId').value;
    const name = document.getElementById('serviceName').value;
    const category = document.getElementById('serviceCategory').value;
    const description = document.getElementById('serviceDescription').value;
    const active = document.getElementById('serviceActive').value === 'true';
    
    const newService = {
        id: serviceId || generateServiceId(name),
        name: name,
        category: category,
        description: description,
        questionIds: [],
        benchmarks: {},
        active: active
    };
    
    if (serviceId) {
        // Update existing service
        const index = servicesData.services.findIndex(s => s.id === serviceId);
        if (index !== -1) {
            // Preserve existing questionIds and benchmarks
            newService.questionIds = servicesData.services[index].questionIds || [];
            newService.benchmarks = servicesData.services[index].benchmarks || {};
            servicesData.services[index] = newService;
        }
    } else {
        // Add new service
        servicesData.services.push(newService);
    }
    
    renderServicesTable();
    updateOverviewStats();
    closeServiceModal();
    showNotification('Service saved successfully!', 'success');
});

function deleteService(serviceId) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    const index = servicesData.services.findIndex(s => s.id === serviceId);
    if (index !== -1) {
        servicesData.services.splice(index, 1);
        renderServicesTable();
        updateOverviewStats();
        showNotification('Service deleted successfully!', 'success');
    }
}

function generateServiceId(name) {
    return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

// Benchmarks Management
function renderBenchmarksContent() {
    const container = document.getElementById('benchmarksContent');
    
    let html = `
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3>Current Benchmarks</h3>
            <p style="color: #6b7280; margin-bottom: 15px;">
                Source: ${benchmarksData.current.source}<br>
                Last Updated: ${benchmarksData.current.lastUpdated}<br>
                Industry: ${benchmarksData.current.industry}<br>
                Sample Size: ${benchmarksData.current.sampleSize} organizations
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div style="background: white; padding: 15px; border-radius: 6px;">
                    <strong>Domain 1</strong><br>
                    <span style="font-size: 24px; color: var(--primary-color);">${benchmarksData.current.domain1}</span>
                </div>
                <div style="background: white; padding: 15px; border-radius: 6px;">
                    <strong>Domain 2</strong><br>
                    <span style="font-size: 24px; color: var(--primary-color);">${benchmarksData.current.domain2}</span>
                </div>
                <div style="background: white; padding: 15px; border-radius: 6px;">
                    <strong>Domain 3</strong><br>
                    <span style="font-size: 24px; color: var(--primary-color);">${benchmarksData.current.domain3}</span>
                </div>
                <div style="background: white; padding: 15px; border-radius: 6px;">
                    <strong>Domain 4</strong><br>
                    <span style="font-size: 24px; color: var(--primary-color);">${benchmarksData.current.domain4}</span>
                </div>
                <div style="background: white; padding: 15px; border-radius: 6px;">
                    <strong>Overall</strong><br>
                    <span style="font-size: 24px; color: var(--primary-color);">${benchmarksData.current.overall}</span>
                </div>
            </div>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
            <h3>Historical Benchmarks</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Source</th>
                        <th>Domain 1</th>
                        <th>Domain 2</th>
                        <th>Domain 3</th>
                        <th>Domain 4</th>
                        <th>Overall</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    benchmarksData.history.forEach(record => {
        html += `
            <tr>
                <td>${record.date}</td>
                <td>${record.source}</td>
                <td>${record.domain1}</td>
                <td>${record.domain2}</td>
                <td>${record.domain3}</td>
                <td>${record.domain4}</td>
                <td><strong>${record.overall}</strong></td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

function updateBenchmarks() {
    const newValues = prompt('Enter new benchmark values (comma-separated: domain1,domain2,domain3,domain4):\nExample: 3.3,3.6,2.9,3.2');
    
    if (!newValues) return;
    
    const values = newValues.split(',').map(v => parseFloat(v.trim()));
    
    if (values.length !== 4 || values.some(isNaN)) {
        alert('Invalid input. Please enter 4 numeric values separated by commas.');
        return;
    }
    
    // Save current to history
    benchmarksData.history.unshift({
        date: benchmarksData.current.lastUpdated,
        source: benchmarksData.current.source,
        domain1: benchmarksData.current.domain1,
        domain2: benchmarksData.current.domain2,
        domain3: benchmarksData.current.domain3,
        domain4: benchmarksData.current.domain4,
        overall: benchmarksData.current.overall
    });
    
    // Update current
    benchmarksData.current.domain1 = values[0];
    benchmarksData.current.domain2 = values[1];
    benchmarksData.current.domain3 = values[2];
    benchmarksData.current.domain4 = values[3];
    benchmarksData.current.overall = (values[0] + values[1] + values[2] + values[3]) / 4;
    benchmarksData.current.lastUpdated = new Date().toISOString().split('T')[0];
    
    renderBenchmarksContent();
    showNotification('Benchmarks updated successfully!', 'success');
}

// Export Functions
function exportQuestions() {
    downloadJSON(questionsData, 'questions.json');
}

function exportUsers() {
    downloadJSON(usersData, 'users.json');
}

function exportServices() {
    downloadJSON(servicesData, 'services.json');
}

function exportBenchmarks() {
    downloadJSON(benchmarksData, 'benchmarks.json');
}

function exportAllData() {
    exportQuestions();
    setTimeout(() => exportUsers(), 100);
    setTimeout(() => exportServices(), 200);
    setTimeout(() => exportBenchmarks(), 300);
    showNotification('All configuration files exported! Commit these to GitHub.', 'success');
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Import User Assessments
function importUserAssessments() {
    const fileInput = document.getElementById('importAssessmentFile');
    const files = fileInput.files;
    
    if (files.length === 0) {
        alert('Please select assessment files to import');
        return;
    }
    
    let imported = 0;
    const allAssessments = [];
    
    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const assessment = JSON.parse(e.target.result);
                allAssessments.push(assessment);
                imported++;
                
                if (imported === files.length) {
                    // All files loaded
                    consolidateAssessments(allAssessments);
                }
            } catch (error) {
                console.error('Error parsing file:', file.name, error);
            }
        };
        reader.readAsText(file);
    });
}

async function consolidateAssessments(assessments) {
    // Merge all assessments
    const consolidated = {
        answers: {},
        evidence: [],
        users: []
    };
    
    assessments.forEach(assessment => {
        // Merge answers
        Object.assign(consolidated.answers, assessment.answers);
        
        // Merge evidence
        if (assessment.evidence) {
            consolidated.evidence.push(...assessment.evidence);
        }
        
        // Track users
        consolidated.users.push(assessment.user);
    });
    
    // Save consolidated answers to localStorage with the correct key from config
    try {
        const storageKey = CONFIG.assessment.storageKey || 'techAssessment';
        
        // Get existing data and merge
        const existing = localStorage.getItem(storageKey);
        const existingData = existing ? JSON.parse(existing) : {};
        const mergedData = { ...existingData, ...consolidated.answers };
        
        // Save merged data
        localStorage.setItem(storageKey, JSON.stringify(mergedData));
        console.log('Saved to localStorage:', storageKey, mergedData);
        
        // Import evidence into IndexedDB
        if (typeof evidenceManager !== 'undefined' && evidenceManager.db) {
            let evidenceCount = 0;
            for (const evidence of consolidated.evidence) {
                await evidenceManager.saveEvidence(evidence.questionId, evidence);
                evidenceCount++;
            }
            console.log('Imported evidence items:', evidenceCount);
        }
        
        // Show detailed success message
        const message = `✅ Successfully imported ${assessments.length} assessments!\n\n` +
                       `📊 Summary:\n` +
                       `- ${Object.keys(consolidated.answers).length} answers saved\n` +
                       `- ${consolidated.evidence.length} evidence items imported\n` +
                       `- Consolidated backup downloaded\n\n` +
                       `📝 Next Steps:\n` +
                       `1. Open Dashboard to see all answers\n` +
                       `2. Open Full Assessment and click "🔄 Reload Data"\n` +
                       `3. Generate PDF report with all evidence`;
        
        alert(message);
        showNotification('Import successful! Data saved to system.', 'success');
    } catch (error) {
        console.error('Error saving consolidated data:', error);
        alert('Error saving consolidated data: ' + error.message);
        showNotification('Error saving consolidated data: ' + error.message, 'error');
    }
    
    // Also download consolidated assessment as backup
    downloadJSON(consolidated, `consolidated-assessment-${new Date().toISOString().split('T')[0]}.json`);
}

// Instructions
function viewInstructions() {
    alert(`Admin Panel Instructions:

1. QUESTIONS: Add, edit, or delete assessment questions
2. USERS: Manage users and assign questions to them
3. SERVICES: Add technology services to track
4. BENCHMARKS: Update industry benchmark values
5. IMPORT/EXPORT:
   - Export configuration files
   - Commit to GitHub (data/ folder)
   - GitHub Pages will auto-update
   - Import user assessments to consolidate

Workflow:
1. Make changes in admin panel
2. Export configuration files
3. Commit files to GitHub repo (data/ folder)
4. Changes go live in 1-2 minutes
5. Users see updated questions/assignments`);
}

// Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        background-color: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 2000;
        border-left: 4px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    `;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
}