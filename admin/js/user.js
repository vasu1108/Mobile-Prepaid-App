document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let allUsers = [];
    let filteredUsers = [];
    let currentPage = 1;
    let pageSize = 10;
    let currentUserId = null;
    let sortDirection = 'asc';
    let sortField = 'name';
    let statusFilterValue = 'all';
    let planFilterValue = 'all';
    let searchValue = '';
    
    // API URLs
    const API_BASE_URL = 'http://localhost:8083';
    const ALL_USERS_URL = `${API_BASE_URL}/current-plan/all`;
    
    // Initialize Bootstrap components
    const notificationToast = new bootstrap.Toast(document.getElementById('notificationToast'));
    const historyModal = new bootstrap.Modal(document.getElementById('historyModal'));
    const statusModal = new bootstrap.Modal(document.getElementById('statusModal'));
    
    // Initialize the page
    initPage();
    
    // ====== FUNCTIONS ======
    
    // Initialize the page
    async function initPage() {
        await fetchAllUsers();
        setupEventListeners();
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Sidebar toggle
        document.getElementById('sidebarCollapse').addEventListener('click', function() {
            document.getElementById('sidebar').classList.toggle('active');
            document.getElementById('content').classList.toggle('active');
        });
        
        // Search input
        document.getElementById('searchInput').addEventListener('input', function() {
            searchValue = this.value.trim().toLowerCase();
            currentPage = 1;
            filterAndDisplayUsers();
        });
        
        // Status filter
        document.getElementById('statusFilter').addEventListener('change', function() {
            statusFilterValue = this.value;
            currentPage = 1;
            filterAndDisplayUsers();
        });
        
        // Plan filter
        document.getElementById('planFilter').addEventListener('change', function() {
            planFilterValue = this.value;
            currentPage = 1;
            filterAndDisplayUsers();
        });
        
        // Sort by
        document.getElementById('sortBy').addEventListener('change', function() {
            sortField = this.value;
            currentPage = 1;
            filterAndDisplayUsers();
        });
        
        // Stats cards filtering
        document.querySelectorAll('.stats-card').forEach(card => {
            card.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                document.getElementById('statusFilter').value = filter;
                statusFilterValue = filter;
                currentPage = 1;
                filterAndDisplayUsers();
            });
        });
        
        // Download PDF button
        document.getElementById('downloadHistory').addEventListener('click', generatePDF);
        
        // Save status button
        document.getElementById('saveStatusBtn').addEventListener('click', updateUserStatus);
    }
    
    // Fetch all users from the API
    async function fetchAllUsers() {
        showSpinner(true);
        try {
            const response = await fetch(ALL_USERS_URL);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            // Handle if data is an array or a single object
            allUsers = Array.isArray(data) ? data : [data];
            
            // Populate plans filter
            populatePlanFilter();
            
            // Update stats
            updateStats();
            
            // Filter and display users
            filterAndDisplayUsers();
        } catch (error) {
            console.error('Error fetching users:', error);
            showNotification('Error loading users. Please try again later.', 'error');
        } finally {
            showSpinner(false);
        }
    }
    
    // Populate plan filter dropdown
    function populatePlanFilter() {
        const planFilter = document.getElementById('planFilter');
        const planNames = new Set();
        
        allUsers.forEach(user => {
            planNames.add(user.plan.planName);
        });
        
        planFilter.innerHTML = '<option value="all">All Plans</option>';
        
        planNames.forEach(planName => {
            const option = document.createElement('option');
            option.value = planName;
            option.textContent = planName;
            planFilter.appendChild(option);
        });
    }
    
    // Update stats
    function updateStats() {
        const totalUsers = allUsers.length;
        const activeUsers = allUsers.filter(user => user.user.userStatus === 'Active').length;
        const inactiveUsers = allUsers.filter(user => user.user.userStatus === 'Inactive').length;
        const blockedUsers = allUsers.filter(user => user.user.userStatus === 'Blocked').length;
        
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('activeUsers').textContent = activeUsers;
        document.getElementById('inactiveUsers').textContent = inactiveUsers;
        document.getElementById('blockedUsers').textContent = blockedUsers;
        
        // Calculate percentages
        const activePercentage = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
        const inactivePercentage = totalUsers > 0 ? (inactiveUsers / totalUsers) * 100 : 0;
        const blockedPercentage = totalUsers > 0 ? (blockedUsers / totalUsers) * 100 : 0;
        
        // Update progress bars
        document.getElementById('activeProgress').style.width = `${activePercentage}%`;
        document.getElementById('inactiveProgress').style.width = `${inactivePercentage}%`;
        document.getElementById('blockedProgress').style.width = `${blockedPercentage}%`;
        
        // Update percentage text
        document.getElementById('activePercentage').textContent = `${Math.round(activePercentage)}%`;
        document.getElementById('inactivePercentage').textContent = `${Math.round(inactivePercentage)}%`;
        document.getElementById('blockedPercentage').textContent = `${Math.round(blockedPercentage)}%`;
    }
    
    // Filter and display users
    function filterAndDisplayUsers() {
        // Apply filters
        filteredUsers = allUsers.filter(user => {
            // Status filter
            if (statusFilterValue !== 'all' && user.user.userStatus !== statusFilterValue) {
                return false;
            }
            
            // Plan filter
            if (planFilterValue !== 'all' && user.plan.planName !== planFilterValue) {
                return false;
            }
            
            // Search filter
            if (searchValue) {
                // Search in name, email, mobile, username
                const searchableText = (
                    user.user.name.toLowerCase() + ' ' +
                    user.user.userEmail.toLowerCase() + ' ' +
                    user.user.mobileNumber.toLowerCase() + ' ' +
                    user.user.username.toLowerCase() + ' ' +
                    user.plan.planName.toLowerCase()
                );
                
                return searchableText.includes(searchValue);
            }
            
            return true;
        });
        
        // Sort users
        sortUsers();
        
        // Update pagination
        updatePagination();
        
        // Display users
        displayUsers();
    }
    
    // Sort users
    function sortUsers() {
        filteredUsers.sort((a, b) => {
            let valueA, valueB;
            
            // Extract the correct values based on the sort field
            switch (sortField) {
                case 'name':
                    valueA = a.user.name;
                    valueB = b.user.name;
                    break;
                case 'planExpiryDate':
                    valueA = new Date(a.planExpiryDate);
                    valueB = new Date(b.planExpiryDate);
                    break;
                case 'planPrice':
                    valueA = a.plan.planPrice;
                    valueB = b.plan.planPrice;
                    break;
                default:
                    valueA = a.user.name;
                    valueB = b.user.name;
            }
            
            // Compare values based on sort direction
            if (valueA < valueB) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }
    
    // Update pagination
    function updatePagination() {
        const totalUsers = filteredUsers.length;
        const totalPages = Math.ceil(totalUsers / pageSize);
        
        // Ensure current page is valid
        if (currentPage > totalPages) {
            currentPage = totalPages > 0 ? totalPages : 1;
        }
        
        // Update pagination info
        const startIndex = (currentPage - 1) * pageSize + 1;
        const endIndex = Math.min(startIndex + pageSize - 1, totalUsers);
        
        document.getElementById('paginationInfo').textContent = 
            `Showing ${totalUsers > 0 ? startIndex : 0}-${endIndex} of ${totalUsers} entries`;
        
        // Build pagination controls
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
        
        // Previous button
        const prevButton = document.createElement('li');
        prevButton.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevButton.innerHTML = `<a class="page-link" href="#" aria-label="Previous">
            <i class="bi bi-chevron-left"></i>
        </a>`;
        prevButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                filterAndDisplayUsers();
            }
        });
        pagination.appendChild(prevButton);
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            // Show first, last, and pages around current page
            if (
                i === 1 || 
                i === totalPages || 
                (i >= currentPage - 1 && i <= currentPage + 1) ||
                (totalPages <= 5)
            ) {
                const pageItem = document.createElement('li');
                pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
                pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
                pageItem.addEventListener('click', function(e) {
                    e.preventDefault();
                    currentPage = i;
                    filterAndDisplayUsers();
                });
                pagination.appendChild(pageItem);
            } else if (
                (i === currentPage - 2 && currentPage > 3) || 
                (i === currentPage + 2 && currentPage < totalPages - 2)
            ) {
                // Add ellipsis
                const ellipsis = document.createElement('li');
                ellipsis.className = 'page-item disabled';
                ellipsis.innerHTML = '<a class="page-link" href="#">...</a>';
                pagination.appendChild(ellipsis);
            }
        }
        
        // Next button
        const nextButton = document.createElement('li');
        nextButton.className = `page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`;
        nextButton.innerHTML = `<a class="page-link" href="#" aria-label="Next">
            <i class="bi bi-chevron-right"></i>
        </a>`;
        nextButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                filterAndDisplayUsers();
            }
        });
        pagination.appendChild(nextButton);
    }
    
    // Display users in the table
    function displayUsers() {
        const tableBody = document.getElementById('userTableBody');
        tableBody.innerHTML = '';
        
        if (filteredUsers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <i class="bi bi-search me-2"></i>No users found.
                    </td>
                </tr>
            `;
            return;
        }
        
        // Calculate start and end index
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, filteredUsers.length);
        
        // Display users for current page
        for (let i = startIndex; i < endIndex; i++) {
            const user = filteredUsers[i];
            
            // Calculate days left
            const expiryDate = new Date(user.planExpiryDate);
            const today = new Date();
            const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            
            // Calculate data usage percentage
            const dataUsed = user.dataUsed ? parseFloat(user.dataUsed.replace('GB', '')) : 0;
            const dataRemaining = user.dataRemaining ? parseFloat(user.dataRemaining.replace('GB', '')) : 0;
            const totalData = dataUsed + dataRemaining;
            const dataUsagePercentage = Math.round((dataUsed / totalData) * 100) || 0;
            
            // Get initials for avatar
            const initials = user.user.name.split(' ').map(name => name[0]).join('').toUpperCase();
            
            // Create row
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="user-cell">
                        <div class="user-avatar">${initials}</div>
                        <div class="user-info">
                            <div class="user-name">${user.user.name}</div>
                            <div class="user-email">${user.user.mobileNumber} | ${user.user.userEmail}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="plan-badge">
                        ${user.plan.planName} (₹${user.plan.planPrice})
                    </div>
                </td>
                <td>
                    <div class="progress-container">
                        <div class="progress-label">
                            <span class="label">Data Usage</span>
                            <span class="value">${dataUsed}GB / ${totalData}GB</span>
                        </div>
                        <div class="progress">
                            <div class="progress-bar bg-${dataUsagePercentage > 75 ? 'danger' : dataUsagePercentage > 50 ? 'warning' : 'success'}" 
                                 role="progressbar" 
                                 style="width: ${dataUsagePercentage}%" 
                                 aria-valuenow="${dataUsagePercentage}" 
                                 aria-valuemin="0" 
                                 aria-valuemax="100"></div>
                        </div>
                    </div>
                </td>
                <td>
                    <div>
                        <div class="mb-1">${formatDate(user.planExpiryDate)}</div>
                        <span class="badge bg-${daysLeft <= 3 ? 'danger' : daysLeft <= 7 ? 'warning' : 'success'}">${daysLeft} days left</span>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${user.user.userStatus.toLowerCase()}">${user.user.userStatus}</span>
                </td>
                <td>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary history-btn" 
                                data-user-id="${user.user.userId}" 
                                title="View History">
                            <i class="bi bi-clock-history"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning status-btn" 
                                data-user-id="${user.user.userId}" 
                                data-user-name="${user.user.name}" 
                                data-user-status="${user.user.userStatus}"
                                title="Change Status">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        }
        
        // Add event listeners to action buttons
        addActionButtonListeners();
    }
    
    // Add event listeners to action buttons
    function addActionButtonListeners() {
        // History buttons
        document.querySelectorAll('.history-btn').forEach(button => {
            button.addEventListener('click', async function() {
                const userId = this.getAttribute('data-user-id');
                await showRechargeHistory(userId);
            });
        });
        
        // Status buttons
        document.querySelectorAll('.status-btn').forEach(button => {
            button.addEventListener('click', function() {
                const userId = this.getAttribute('data-user-id');
                const userName = this.getAttribute('data-user-name');
                const currentStatus = this.getAttribute('data-user-status');
                
                currentUserId = userId;
                document.getElementById('statusUserName').textContent = userName;
                document.getElementById('userStatus').value = currentStatus;
                
                statusModal.show();
            });
        });
    }
    
    // Show recharge history modal
    async function showRechargeHistory(userId) {
        showModalSpinner(true);
        
        try {
            // Find user in all users
            const userDetail = allUsers.find(user => user.user.userId == userId);
            if (!userDetail) {
                throw new Error('User not found');
            }
            
            // Update user info in modal
            document.getElementById('modalUserName').textContent = userDetail.user.name;
            document.getElementById('modalUserMobile').textContent = userDetail.user.mobileNumber;
            document.getElementById('modalUserEmail').textContent = userDetail.user.userEmail;
            
            // Fetch recharge history
            const rechargeHistory = await fetchRechargeHistory(userId);
            
            // Display recharge history
            const historyTableBody = document.getElementById('historyTableBody');
            historyTableBody.innerHTML = '';
            
            if (rechargeHistory.length === 0) {
                historyTableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center py-3">
                            <i class="bi bi-calendar-x me-2"></i>No recharge history found.
                        </td>
                    </tr>
                `;
            } else {
                rechargeHistory.forEach(recharge => {
                    // Format date and time
                    const rechargeDate = new Date(recharge.rechargeDate);
                    const formattedDate = formatDate(rechargeDate);
                    
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${formattedDate}</td>
                        <td>${recharge.plan.planName}</td>
                        <td>₹${recharge.plan.planPrice.toFixed(2)}</td>
                        <td>${recharge.transaction?.paymentMode || 'N/A'}</td>
                        <td>
                            <span class="badge bg-${recharge.transaction?.transactionStatus === 'Success' ? 'success' : 'danger'}">
                                ${recharge.transaction?.transactionStatus || 'N/A'}
                            </span>
                        </td>
                    `;
                    
                    historyTableBody.appendChild(row);
                });
            }
            
            historyModal.show();
        } catch (error) {
            console.error('Error showing recharge history:', error);
            showNotification('Error loading recharge history. Please try again.', 'error');
        } finally {
            showModalSpinner(false);
        }
    }
    
    // Fetch recharge history for a user
    async function fetchRechargeHistory(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/recharges/${userId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            return Array.isArray(data) ? data : [data];
        } catch (error) {
            console.error('Error fetching recharge history:', error);
            return [];
        }
    }
    
    // Update user status
    async function updateUserStatus() {
        if (!currentUserId) return;
        
        const newStatus = document.getElementById('userStatus').value;
        const user = allUsers.find(u => u.user.userId == currentUserId);
        
        if (!user) {
            showNotification('Error: User not found.', 'error');
            return;
        }
        
        try {
            // Prepare update data
            const updateData = {
                name: user.user.name,
                username: user.user.username,
                userEmail: user.user.userEmail,
                mobileNumber: user.user.mobileNumber,
                passwordHash: user.user.passwordHash,
                userStatus: newStatus,
                role: {
                    roleId: user.user.role.roleId
                }
            };
            
            // Send update request
            const response = await fetch(`${API_BASE_URL}/users/${currentUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update user status');
            }
            
            // Update local data
            user.user.userStatus = newStatus;
            
            // Update stats
            updateStats();
            
            // Refresh table
            filterAndDisplayUsers();
            
            // Show success notification
            showNotification(`Status for ${user.user.name} successfully updated to ${newStatus}.`, 'success');
            
            // Close modal
            statusModal.hide();
        } catch (error) {
            console.error('Error updating user status:', error);
            showNotification('Error updating user status. Please try again.', 'error');
        }
    }
    
    // Generate PDF of recharge history
    function generatePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Get user info
        const userName = document.getElementById('modalUserName').textContent;
        const userMobile = document.getElementById('modalUserMobile').textContent;
        const userEmail = document.getElementById('modalUserEmail').textContent;
        
        // Set title
        doc.setFontSize(20);
        doc.setTextColor(155, 135, 245);
        doc.text('Recharge History Report', 105, 15, { align: 'center' });
        
        // Set subtitle
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });
        
        // Add user info
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Name: ${userName}`, 14, 35);
        doc.text(`Mobile: ${userMobile}`, 14, 40);
        doc.text(`Email: ${userEmail}`, 14, 45);
        
        // Add recharge history table
        const tableColumn = ["Date", "Plan", "Amount", "Payment Mode", "Status"];
        const tableRows = [];
        
        // Get data from the table
        document.querySelectorAll('#historyTableBody tr').forEach(row => {
            const rowData = [];
            row.querySelectorAll('td').forEach(cell => {
                // Clean up the text (remove HTML)
                rowData.push(cell.textContent.trim());
            });
            
            if (rowData.length > 0) {
                tableRows.push(rowData);
            }
        });
        
        // AutoTable for PDF
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 50,
            styles: {
                fontSize: 8,
                cellPadding: 3,
                lineColor: [80, 80, 80]
            },
            headStyles: {
                fillColor: [155, 135, 245],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 250]
            }
        });
        
        // Add footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text('MOBI-COMM Recharge History', 14, doc.internal.pageSize.height - 10);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
        }
        
        // Save the PDF
        doc.save(`RechargeHistory_${userName.replace(/\s+/g, '_')}.pdf`);
    }
    
    // Show or hide spinner
    function showSpinner(show) {
        const spinner = document.getElementById('tableSpinner');
        if (show) {
            spinner.classList.remove('d-none');
        } else {
            spinner.classList.add('d-none');
        }
    }
    
    // Show or hide modal spinner
    function showModalSpinner(show) {
        const historyTableBody = document.getElementById('historyTableBody');
        if (show) {
            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
    
    // Show notification toast
    function showNotification(message, type = 'success') {
        const toastElement = document.getElementById('notificationToast');
        const toastMessage = document.getElementById('toastMessage');
        
        // Set message
        toastMessage.textContent = message;
        
        // Set toast style based on type
        toastElement.classList.remove('bg-success', 'bg-danger', 'bg-warning');
        toastElement.style.borderLeftColor = type === 'success' ? '#4fd1c5' : 
                                             type === 'error' ? '#ff5c75' : 
                                             '#f6ad55';
        
        // Show toast
        notificationToast.show();
    }
    
    // Format date for display
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
});

function checkUserAndRedirect() {
    const currentUser = sessionStorage.getItem('currentUser');
    
    if (!currentUser) {
      // No user found in sessionStorage, redirect to login page
      window.location.href = 'login.html';
    }
  }
  
  // Call this function when your page loads
  document.addEventListener('DOMContentLoaded', checkUserAndRedirect);