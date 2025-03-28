document.addEventListener('DOMContentLoaded', function() {
    // Global Variables
    let currentPage = 1;
    const pageSize = 5;
    let totalItems = 0;
    let allExpiringPlans = [];
    let currentUserForHistory = null;
    let currentUser = null;
    
    // Bootstrap Components
    const notificationToast = new bootstrap.Toast(document.getElementById('notificationToast'));
    const changePasswordModal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
    
    // API Endpoints
    const API_BASE_URL = 'http://localhost:8083';
    const EXPIRING_PLANS_URL = `${API_BASE_URL}/current-plan/expiring-soon`;
    
    // Check if user is logged in and retrieve user data
    function checkLoggedInUser() {
        const userData = sessionStorage.getItem('currentUser');
        if (!userData) {
            // Redirect to login page if not logged in
            window.location.href = 'login.html';
            return;
        }
        
        try {
            currentUser = JSON.parse(userData);
            // Update UI with user information
            document.getElementById('profileUsername').textContent = currentUser.name;
        } catch (error) {
            console.error('Error parsing user data:', error);
            // If data is corrupted, clear and redirect
            sessionStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        }
    }
    
    // Toggle profile dropdown
    function setupProfileDropdown() {
        const dropdownToggle = document.getElementById('profileDropdownToggle');
        const dropdownMenu = document.getElementById('profileDropdownMenu');
        
        dropdownToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdownMenu.contains(e.target) && !dropdownToggle.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
        
        // Change Password button
        document.getElementById('changePasswordBtn').addEventListener('click', function() {
            dropdownMenu.classList.remove('show');
            // Reset form
            document.getElementById('changePasswordForm').reset();
            document.getElementById('passwordError').classList.add('d-none');
            document.getElementById('passwordSuccess').classList.add('d-none');
            // Show modal
            changePasswordModal.show();
        });
        
        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', function() {
            sessionStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }
    
    // Setup password toggle visibility
    function setupPasswordToggles() {
        document.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const passwordInput = document.getElementById(targetId);
                const icon = this.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('bi-eye');
                    icon.classList.add('bi-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('bi-eye-slash');
                    icon.classList.add('bi-eye');
                }
            });
        });
    }
    
    // Handle password change
    function setupPasswordChangeForm() {
        document.getElementById('savePasswordBtn').addEventListener('click', async function() {
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const errorElement = document.getElementById('passwordError');
            const successElement = document.getElementById('passwordSuccess');
            
            // Reset alerts
            errorElement.classList.add('d-none');
            successElement.classList.add('d-none');
            
            // Validate inputs
            if (!currentPassword || !newPassword || !confirmPassword) {
                errorElement.textContent = 'All fields are required';
                errorElement.classList.remove('d-none');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                errorElement.textContent = 'New password and confirmation do not match';
                errorElement.classList.remove('d-none');
                return;
            }
            
            if (newPassword.length < 8) {
                errorElement.textContent = 'New password must be at least 8 characters long';
                errorElement.classList.remove('d-none');
                return;
            }
            
            // Check if current password is correct
            if (currentPassword !== currentUser.passwordHash) {
                errorElement.textContent = 'Current password is incorrect';
                errorElement.classList.remove('d-none');
                return;
            }
            
            // Update password via API
            try {
                const userId = currentUser.userId;
                const response = await fetch(`${API_BASE_URL}/users/${userId}/update-password`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        newPassword: newPassword
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                
                // Update current user object with new password
                currentUser.passwordHash = newPassword;
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                // Show success message
                successElement.textContent = 'Password updated successfully';
                successElement.classList.remove('d-none');
                
                // Close modal after 2 seconds
                setTimeout(() => {
                    changePasswordModal.hide();
                }, 2000);
                
            } catch (error) {
                console.error('Error updating password:', error);
                errorElement.textContent = 'Failed to update password. Please try again.';
                errorElement.classList.remove('d-none');
            }
        });
    }
    
    // Fetch expiring plans data
    async function fetchExpiringPlans() {
        showTableSpinner(true);
        try {
            const response = await fetch(EXPIRING_PLANS_URL);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            allExpiringPlans = Array.isArray(data) ? data : [data]; // Handle both array and single object
            totalItems = allExpiringPlans.length;
            renderTable();
            updatePagination();
        } catch (error) {
            console.error('Error fetching expiring plans:', error);
            document.getElementById('expiringPlansTable').innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">Error loading data. Please try again later.</td>
                </tr>
            `;
        } finally {
            showTableSpinner(false);
        }
    }
    
    // Fetch recharge history for a user
    async function fetchRechargeHistory(userId) {
        try {
            // Add pagination parameters or query params to fetch all records
            const response = await fetch(`${API_BASE_URL}/recharges/user/${userId}`);
            
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Check and handle the data format
            if (Array.isArray(data)) {
                return data; // Already an array of recharges
            } else if (data.recharges && Array.isArray(data.recharges)) {
                return data.recharges; // Extract from wrapper object
            } else if (typeof data === 'object') {
                return [data]; // Single recharge object, convert to array
            } else {
                console.warn('Unexpected data format returned from API');
                return [];
            }
        } catch (error) {
            console.error('Error fetching recharge history:', error);
            return [];
        }
    }
    
    // Render the table with current page data
    function renderTable() {
        const tableBody = document.getElementById('expiringPlansTable');
        tableBody.innerHTML = '';
        
        if (allExpiringPlans.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No expiring plans found.</td>
                </tr>
            `;
            return;
        }
        
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);
        const currentPageData = allExpiringPlans.slice(startIndex, endIndex);
        
        currentPageData.forEach(plan => {
            const row = document.createElement('tr');
            
            // Format date for display
            const expiryDate = new Date(plan.planExpiryDate);
            const formattedDate = expiryDate.toLocaleDateString('en-US', {
                year: 'numeric', 
                month: 'short', 
                day: 'numeric'
            });
            
            // Create plan badge with color based on plan price
            const planPrice = plan.plan.planPrice;
            let badgeColor = 'primary';
            if (planPrice >= 699) badgeColor = 'info';
            else if (planPrice >= 399) badgeColor = 'warning';
            
            row.innerHTML = `
                <td>${plan.user.mobileNumber}</td>
                <td>${plan.user.name}</td>
                <td>
                    <span class="badge bg-${badgeColor} plan-badge">
                        ${plan.plan.planName} (₹${plan.plan.planPrice})
                    </span>
                </td>
                <td>${formattedDate}</td>
                <td>
                    <button class="btn btn-info btn-sm me-2 history-btn" data-user-id="${plan.user.userId}" data-bs-toggle="modal" data-bs-target="#rechargeHistoryModal">
                        <i class="bi bi-clock-history me-1"></i>History
                    </button> 
                    <button class="btn btn-warning btn-sm notify-btn" data-mobile="${plan.user.mobileNumber}" data-name="${plan.user.name}">
                        <i class="bi bi-bell me-1"></i>Notify
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Update pagination info
        document.getElementById('paginationInfo').textContent = 
            `Showing ${startIndex + 1}-${endIndex} of ${totalItems} entries`;
            
        // Add event listeners for the newly created buttons
        addButtonEventListeners();
    }
    
    // Add event listeners to the history and notify buttons
    function addButtonEventListeners() {
        // History button event listeners
        document.querySelectorAll('.history-btn').forEach(button => {
            button.addEventListener('click', async function() {
                const userId = this.getAttribute('data-user-id');
                await showRechargeHistory(userId);
            });
        });
        
        // Notify button event listeners
        document.querySelectorAll('.notify-btn').forEach(button => {
            button.addEventListener('click', function() {
                const mobile = this.getAttribute('data-mobile');
                const name = this.getAttribute('data-name');
                showNotification(mobile, name);
            });
        });
    }
    
    // Show recharge history in modal
    async function showRechargeHistory(userId) {
        const user = allExpiringPlans.find(plan => plan.user.userId == userId)?.user;
        if (!user) return;
        
        currentUserForHistory = user;
        
        // Update modal with user information
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userMobile').textContent = user.mobileNumber;
        
        const historyTableBody = document.getElementById('rechargeHistoryTableBody');
        historyTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </td>
            </tr>
        `;
        
        // Fetch and display recharge history
        const rechargeHistory = await fetchRechargeHistory(userId);
        
        historyTableBody.innerHTML = '';
        
        if (rechargeHistory.length === 0) {
            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No recharge history found.</td>
                </tr>
            `;
            return;
        }
        
        rechargeHistory.forEach(recharge => {
            const row = document.createElement('tr');
            
            // Format recharge date
            const rechargeDate = new Date(recharge.rechargeDate);
            const formattedDate = rechargeDate.toLocaleDateString('en-US', {
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Define status badge color
            let statusBadgeClass = 'bg-success';
            if (recharge.transaction?.transactionStatus !== 'Success') {
                statusBadgeClass = 'bg-danger';
            }
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${recharge.plan.planName}</td>
                <td>₹${recharge.plan.planPrice.toFixed(2)}</td>
                <td>${recharge.transaction?.paymentMode || 'N/A'}</td>
                <td>
                    <span class="badge ${statusBadgeClass}">
                        ${recharge.transaction?.transactionStatus || 'N/A'}
                    </span>
                </td>
            `;
            
            historyTableBody.appendChild(row);
        });
    }
    
    // Show notification toast
    function showNotification(mobile, name) {
        document.getElementById('toastMessage').textContent = 
            `Notification sent to ${name} (${mobile})`;
        notificationToast.show();
    }
    
    // Update pagination controls
    function updatePagination() {
        const totalPages = Math.ceil(totalItems / pageSize);
        const paginationElement = document.getElementById('pagination');
        paginationElement.innerHTML = '';
        
        // Previous button
        const prevItem = document.createElement('li');
        prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevItem.innerHTML = `
            <a class="page-link" href="#" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        `;
        prevItem.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                renderTable();
                updatePagination();
            }
        });
        paginationElement.appendChild(prevItem);
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (totalPages <= 5 || i === 1 || i === totalPages || 
                (i >= currentPage - 1 && i <= currentPage + 1)) {
                const pageItem = document.createElement('li');
                pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
                pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
                pageItem.addEventListener('click', function(e) {
                    e.preventDefault();
                    currentPage = i;
                    renderTable();
                    updatePagination();
                });
                paginationElement.appendChild(pageItem);
            } else if (
                (i === currentPage - 2 && currentPage > 2) || 
                (i === currentPage + 2 && currentPage < totalPages - 1)
            ) {
                const ellipsisItem = document.createElement('li');
                ellipsisItem.className = 'page-item disabled';
                ellipsisItem.innerHTML = '<a class="page-link" href="#">...</a>';
                paginationElement.appendChild(ellipsisItem);
            }
        }
        
        // Next button
        const nextItem = document.createElement('li');
        nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextItem.innerHTML = `
            <a class="page-link" href="#" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        `;
        nextItem.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
                updatePagination();
            }
        });
        paginationElement.appendChild(nextItem);
    }
    
    // Show/hide the spinner for the table
    function showTableSpinner(show) {
        const spinner = document.getElementById('tableSpinner');
        if (show) {
            spinner.classList.remove('d-none');
        } else {
            spinner.classList.add('d-none');
        }
    }
    
    // Generate and download PDF
    function generatePDF() {
        if (!currentUserForHistory) return;
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(18);
        doc.text('Recharge History', 14, 20);
        
        // Add user information
        doc.setFontSize(12);
        doc.text(`User: ${currentUserForHistory.name}`, 14, 30);
        doc.text(`Mobile: ${currentUserForHistory.mobileNumber}`, 14, 36);
        doc.text(`Email: ${currentUserForHistory.userEmail}`, 14, 42);
        
        // Add timestamp
        const today = new Date();
        doc.setFontSize(10);
        doc.text(`Generated on: ${today.toLocaleString()}`, 14, 50);
        
        // Generate table from the modal
        const tableData = [];
        const tableHeaders = [
            'Date', 'Plan', 'Amount', 'Payment Mode', 'Status'
        ];
        
        document.querySelectorAll('#rechargeHistoryTableBody tr').forEach(row => {
            const rowData = [];
            row.querySelectorAll('td').forEach(cell => {
                // Clean the text content (remove any HTML)
                const div = document.createElement('div');
                div.innerHTML = cell.innerHTML;
                rowData.push(div.textContent.trim());
            });
            
            if (rowData.length > 0 && rowData[0] !== 'No recharge history found.') {
                tableData.push(rowData);
            }
        });
        
        if (tableData.length > 0) {
            doc.autoTable({
                head: [tableHeaders],
                body: tableData,
                startY: 60,
                theme: 'grid',
                styles: {
                    fontSize: 10,
                    cellPadding: 3
                },
                headStyles: {
                    fillColor: [155, 135, 245],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                }
            });
        } else {
            doc.text('No recharge history available.', 14, 60);
        }
        
        // Add footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.text('Plan Alert Tracker - Recharge History', 14, doc.internal.pageSize.height - 10);
            doc.text('Page ' + i + ' of ' + pageCount, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
        }
        
        // Save the PDF
        doc.save(`Recharge_History_${currentUserForHistory.name.replace(/\s+/g, '_')}.pdf`);
    }
    
    // Initialize charts
    function initializeCharts() {
        // Pie Chart - Most Recharged Plans
        new Chart(document.getElementById('pieChart').getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Popular Plans_399', 'Popular Plans_699', 'Popular Plans_999'],
                datasets: [{
                    data: [40, 35, 25],
                    backgroundColor: ['#9b87f5', '#63b3ed', '#4fd1c5'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                cutout: '75%'
            }
        });

        // Bar Chart - Monthly Revenue
        new Chart(document.getElementById('barChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue',
                    data: [15000, 18000, 22000, 19000, 24000, 27000],
                    backgroundColor: '#9b87f5',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            drawBorder: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
    
    // Event listeners
    document.getElementById('downloadPdf').addEventListener('click', generatePDF);
    
    document.getElementById('sidebarCollapse').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
        document.getElementById('content').classList.toggle('active');
    });
    
    // Initialize the application
    checkLoggedInUser();
    setupProfileDropdown();
    setupPasswordToggles();
    setupPasswordChangeForm();
    fetchExpiringPlans();
    initializeCharts();
});
