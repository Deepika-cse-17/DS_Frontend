// API Base URL
const API_BASE = '/api';

// Tab Management
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load data when switching to certain tabs
    if (tabName === 'students') {
        loadAllStudents();
    } else if (tabName === 'statistics') {
        loadStatistics();
    } else if (tabName === 'data-structures') {
        loadStack();
        loadQueue();
    }
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Load All Students
async function loadAllStudents() {
    const container = document.getElementById('students-list');
    container.innerHTML = '<div class="loading">Loading students...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/students`);
        const data = await response.json();
        
        if (data.success) {
            if (data.students.length === 0) {
                container.innerHTML = '<div class="empty-state">No students found. Add your first student!</div>';
                return;
            }
            
            container.innerHTML = data.students.map(student => createStudentCard(student)).join('');
            
            // Add event listeners to delete buttons
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const studentId = this.getAttribute('data-id');
                    deleteStudent(studentId);
                });
            });
        } else {
            container.innerHTML = '<div class="empty-state">Error loading students</div>';
            showToast('Error loading students', 'error');
        }
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error connecting to server</div>';
        showToast('Error connecting to server', 'error');
        console.error('Error:', error);
    }
}

// Create Student Card HTML
function createStudentCard(student) {
    let gradesHtml = '';
    if (student.subjects.length === 0) {
        gradesHtml = '<p style="color: #666; font-style: italic;">No grades added yet</p>';
    } else {
        gradesHtml = student.subjects.map((subject, index) => `
            <div class="grade-item">
                <span class="subject-name">${subject}</span>
                <span class="grade-value">${student.grades[index]}</span>
            </div>
        `).join('');
    }
    
    return `
        <div class="student-card">
            <div class="student-header">
                <div class="student-info">
                    <h3>${student.name}</h3>
                    <div class="student-id">ID: ${student.student_id}</div>
                </div>
                <button class="delete-btn" data-id="${student.student_id}">Delete</button>
            </div>
            <div class="grades-list">
                ${gradesHtml}
            </div>
            ${student.subjects.length > 0 ? `<div class="average-badge">Average: ${student.average}</div>` : ''}
        </div>
    `;
}

// Add Student Form
document.getElementById('add-student-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('student-id').value.trim();
    const name = document.getElementById('student-name').value.trim();
    
    if (!studentId || !name) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ student_id: studentId, name: name })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            document.getElementById('add-student-form').reset();
            loadAllStudents();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('Error adding student', 'error');
        console.error('Error:', error);
    }
});

// Add Grade Form
document.getElementById('add-grade-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('grade-student-id').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const grade = parseFloat(document.getElementById('grade').value);
    
    if (!studentId || !subject || isNaN(grade)) {
        showToast('Please fill in all fields correctly', 'error');
        return;
    }
    
    if (grade < 0 || grade > 100) {
        showToast('Grade must be between 0 and 100', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/students/${studentId}/grades`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ subject: subject, grade: grade })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            document.getElementById('add-grade-form').reset();
            loadAllStudents();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('Error adding grade', 'error');
        console.error('Error:', error);
    }
});

// Update Grade Form
document.getElementById('update-grade-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('update-student-id').value.trim();
    const subject = document.getElementById('update-subject').value.trim();
    const grade = parseFloat(document.getElementById('update-grade').value);
    
    if (!studentId || !subject || isNaN(grade)) {
        showToast('Please fill in all fields correctly', 'error');
        return;
    }
    
    if (grade < 0 || grade > 100) {
        showToast('Grade must be between 0 and 100', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/students/${studentId}/grades`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ subject: subject, grade: grade })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            document.getElementById('update-grade-form').reset();
            loadAllStudents();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('Error updating grade', 'error');
        console.error('Error:', error);
    }
});

// Delete Student
async function deleteStudent(studentId) {
    if (!confirm(`Are you sure you want to delete student ${studentId}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/students/${studentId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            loadAllStudents();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('Error deleting student', 'error');
        console.error('Error:', error);
    }
}

// Search by ID
async function searchById() {
    const studentId = document.getElementById('search-by-id').value.trim();
    const resultsContainer = document.getElementById('search-results');
    
    if (!studentId) {
        showToast('Please enter a student ID', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/students/${studentId}`);
        const data = await response.json();
        
        if (data.success) {
            resultsContainer.innerHTML = createStudentCard(data.student);
            showToast('Student found!', 'success');
        } else {
            resultsContainer.innerHTML = '<div class="empty-state">Student not found</div>';
            showToast(data.message, 'error');
        }
    } catch (error) {
        resultsContainer.innerHTML = '<div class="empty-state">Error searching for student</div>';
        showToast('Error searching for student', 'error');
        console.error('Error:', error);
    }
}

// Search by Name
async function searchByName() {
    const name = document.getElementById('search-by-name').value.trim();
    const resultsContainer = document.getElementById('search-results');
    
    if (!name) {
        showToast('Please enter a student name', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/students/search?name=${encodeURIComponent(name)}`);
        const data = await response.json();
        
        if (data.success) {
            if (data.students.length === 0) {
                resultsContainer.innerHTML = '<div class="empty-state">No students found</div>';
            } else {
                resultsContainer.innerHTML = `
                    <h3 style="margin-bottom: 15px;">Found ${data.students.length} student(s):</h3>
                    <div class="students-grid">
                        ${data.students.map(student => createStudentCard(student)).join('')}
                    </div>
                `;
                showToast(`Found ${data.students.length} student(s)`, 'success');
            }
        } else {
            resultsContainer.innerHTML = '<div class="empty-state">No students found</div>';
            showToast(data.message, 'error');
        }
    } catch (error) {
        resultsContainer.innerHTML = '<div class="empty-state">Error searching for students</div>';
        showToast('Error searching for students', 'error');
        console.error('Error:', error);
    }
}

// Load Statistics
async function loadStatistics() {
    const container = document.getElementById('statistics-content');
    container.innerHTML = '<div class="loading">Loading statistics...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/statistics`);
        const data = await response.json();
        
        if (data.success) {
            const stats = data.statistics;
            container.innerHTML = `
                <div class="stat-card">
                    <h3>Total Students</h3>
                    <div class="value">${stats.total_students}</div>
                </div>
                <div class="stat-card">
                    <h3>Undo Stack Size</h3>
                    <div class="value">${stats.undo_stack_size}</div>
                </div>
                <div class="stat-card">
                    <h3>Queue Size</h3>
                    <div class="value">${stats.queue_size}</div>
                </div>
                <div class="stat-card">
                    <h3>Highest Average</h3>
                    <div class="value">${stats.highest_average}</div>
                </div>
                <div class="stat-card">
                    <h3>Lowest Average</h3>
                    <div class="value">${stats.lowest_average}</div>
                </div>
                <div class="stat-card">
                    <h3>Overall Average</h3>
                    <div class="value">${stats.overall_average}</div>
                </div>
            `;
        } else {
            container.innerHTML = '<div class="empty-state">Error loading statistics</div>';
        }
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error connecting to server</div>';
        console.error('Error:', error);
    }
}

// Load Stack
async function loadStack() {
    const container = document.getElementById('stack-content');
    container.innerHTML = '<div class="loading">Loading stack...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/stack`);
        const data = await response.json();
        
        if (data.success) {
            if (data.stack.length === 0) {
                container.innerHTML = '<div class="empty-state">Stack is empty</div>';
            } else {
                container.innerHTML = `
                    <p style="margin-bottom: 15px; font-weight: 600;">Stack Size: ${data.size}</p>
                    ${data.stack.map((item, index) => `
                        <div class="ds-item">
                            <div class="ds-item-header">
                                <span class="operation-type ${item.operation_type}">${item.operation_type}</span>
                                <span style="color: #666;">#${index + 1}</span>
                            </div>
                            <div style="margin-top: 8px;">
                                <strong>${item.student_name}</strong> (ID: ${item.student_id})
                            </div>
                        </div>
                    `).join('')}
                `;
            }
        }
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error loading stack</div>';
        console.error('Error:', error);
    }
}

// Load Queue
async function loadQueue() {
    const container = document.getElementById('queue-content');
    container.innerHTML = '<div class="loading">Loading queue...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/queue`);
        const data = await response.json();
        
        if (data.success) {
            if (data.queue.length === 0) {
                container.innerHTML = '<div class="empty-state">Queue is empty</div>';
            } else {
                container.innerHTML = `
                    <p style="margin-bottom: 15px; font-weight: 600;">Queue Size: ${data.size}</p>
                    ${data.queue.map((item, index) => `
                        <div class="ds-item">
                            <div class="ds-item-header">
                                <span class="operation-type ${item.operation_type}">${item.operation_type}</span>
                                <span style="color: #666;">#${index + 1}</span>
                            </div>
                            <div style="margin-top: 8px;">
                                <strong>${item.student_name}</strong> (ID: ${item.student_id})
                            </div>
                        </div>
                    `).join('')}
                `;
            }
        }
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error loading queue</div>';
        console.error('Error:', error);
    }
}

// Undo Delete
async function undoDelete() {
    try {
        const response = await fetch(`${API_BASE}/undo`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            loadStack();
            loadAllStudents();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('Error undoing delete', 'error');
        console.error('Error:', error);
    }
}

// Process Queue
async function processQueue() {
    if (!confirm('Are you sure you want to process all operations in the queue?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/queue/process`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            loadQueue();
        } else {
            showToast('Error processing queue', 'error');
        }
    } catch (error) {
        showToast('Error processing queue', 'error');
        console.error('Error:', error);
    }
}

// Allow Enter key to trigger search
document.getElementById('search-by-id').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchById();
    }
});

document.getElementById('search-by-name').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchByName();
    }
});

// Load students on page load
document.addEventListener('DOMContentLoaded', function() {
    loadAllStudents();
});
