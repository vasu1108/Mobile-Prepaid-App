document.addEventListener("DOMContentLoaded", function() {
    // Global Variables
    const API_BASE_URL = 'http://localhost:8083';
    const TRANSACTIONS_URL = `${API_BASE_URL}/transactions`;
    
    let allTransactions = [];
    let filteredTransactions = [];
    let currentPage = 1;
    const itemsPerPage = 10;
    
    // Initialize toast
    const toastElement = document.getElementById('liveToast');
    const toast = new bootstrap.Toast(toastElement);
    
    // Initialize the page
    fetchTransactions();
    
    // Event Listeners
    document.getElementById('applyFiltersBtn').addEventListener('click', applyFilters);
    document.getElementById('downloadBtn').addEventListener('click', downloadPDF);
    document.getElementById('searchInput').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
    
    // Sidebar Toggle
    document.getElementById('sidebarCollapse').addEventListener('click', function() {
        document.getElementById('sidebar').classList.toggle('active');
        document.getElementById('content').classList.toggle('full-width');
    });
    
    // Fetch transactions from API
    async function fetchTransactions() {
        showSpinner(true);
        try {
            const response = await fetch(TRANSACTIONS_URL);
            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }
            
            const data = await response.json();
            // Handle both array and single object response
            allTransactions = Array.isArray(data) ? data : [data];
            
            // Initialize filtered transactions with all transactions
            filteredTransactions = [...allTransactions];
            
            // Update the UI
            updateStatistics();
            updateTable();
            updatePagination();
            
        } catch (error) {
            console.error('Error fetching transactions:', error);
            showErrorInTable('Failed to load transactions. Please try again later.');
            setToastMessage('Error: Failed to load transactions', 'error');
        } finally {
            showSpinner(false);
        }
    }
    
    // Apply filters to the transactions
    function applyFilters() {
        const paymentMode = document.getElementById('paymentMode').value;
        const status = document.getElementById('status').value;
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;
        const searchInput = document.getElementById('searchInput').value.toLowerCase().trim();
        
        filteredTransactions = allTransactions.filter(transaction => {
            // Payment mode filter
            const paymentModeMatch = paymentMode === 'all' || transaction.paymentMode === paymentMode;
            
            // Status filter
            const statusMatch = status === 'all' || transaction.transactionStatus === status;
            
            // Date range filter
            let dateMatch = true;
            if (dateFrom) {
                const transactionDate = new Date(transaction.transactionDate);
                const fromDate = new Date(dateFrom);
                fromDate.setHours(0, 0, 0, 0);
                dateMatch = dateMatch && transactionDate >= fromDate;
            }
            
            if (dateTo) {
                const transactionDate = new Date(transaction.transactionDate);
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                dateMatch = dateMatch && transactionDate <= toDate;
            }
            
            // Search filter - check in transactionId, user name, mobile number
            let searchMatch = true;
            if (searchInput) {
                searchMatch = transaction.transactionId.toLowerCase().includes(searchInput) ||
                              transaction.user.name.toLowerCase().includes(searchInput) ||
                              transaction.user.mobileNumber.toLowerCase().includes(searchInput);
            }
            
            return paymentModeMatch && statusMatch && dateMatch && searchMatch;
        });
        
        // Reset to first page and update UI
        currentPage = 1;
        updateStatistics();
        updateTable();
        updatePagination();
    }
    
    // Update the statistics based on filtered transactions
    function updateStatistics() {
        const totalTransactions = filteredTransactions.length;
        const successfulTransactions = filteredTransactions.filter(t => t.transactionStatus === 'Success').length;
        
        // Calculate total amount of successful transactions
        const totalAmount = filteredTransactions
            .filter(t => t.transactionStatus === 'Success')
            .reduce((sum, t) => sum + t.transactionAmount, 0);
        
        document.getElementById('totalTransactionsCount').textContent = totalTransactions;
        document.getElementById('successTransactionsCount').textContent = successfulTransactions;
        document.getElementById('totalAmount').textContent = `₹${totalAmount.toLocaleString('en-IN')}`;
    }
    
    // Update the transactions table with current page data
    function updateTable() {
        const tableBody = document.getElementById('transactionsTableBody');
        tableBody.innerHTML = '';
        
        if (filteredTransactions.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No transactions found</td>
                </tr>
            `;
            
            updatePaginationInfo(0, 0, 0);
            return;
        }
        
        // Calculate pagination bounds
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredTransactions.length);
        
        // Get current page transactions
        const currentPageTransactions = filteredTransactions.slice(startIndex, endIndex);
        
        // Populate table
        currentPageTransactions.forEach(transaction => {
            // Format date
            const date = new Date(transaction.transactionDate);
            const formattedDate = date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            const formattedTime = date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Determine status badge class
            let statusClass = 'success';
            if (transaction.transactionStatus !== 'Success') {
                statusClass = transaction.transactionStatus === 'Pending' ? 'pending' : 'failed';
            }
            
            // Create row
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <span class="fw-medium">${transaction.transactionId}</span>
                </td>
                <td>
                    <div class="user-cell">
                        <div class="user-info">
                            <span class="user-name">${transaction.user.name}</span>
                            <span class="user-email">${transaction.user.mobileNumber}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="date-info">
                        <div>${formattedDate}</div>
                        <small class="text-muted">${formattedTime}</small>
                    </div>
                </td>
                <td>
                    <span class="plan-name">${transaction.plan.planName}</span>
                </td>
                <td>
                    <span class="fw-medium">₹${transaction.transactionAmount.toFixed(2)}</span>
                </td>
                <td>
                    <span class="payment-mode">${transaction.paymentMode}</span>
                </td>
                <td>
                    <span class="status-badge ${statusClass.toLowerCase()}">${transaction.transactionStatus}</span>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Update pagination info
        updatePaginationInfo(startIndex + 1, endIndex, filteredTransactions.length);
    }
    
    // Update pagination information
    function updatePaginationInfo(start, end, total) {
        document.getElementById('startRecord').textContent = start;
        document.getElementById('endRecord').textContent = end;
        document.getElementById('totalRecords').textContent = total;
    }
    
    // Update pagination controls
    function updatePagination() {
        const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
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
                updateTable();
                updatePagination();
            }
        });
        paginationElement.appendChild(prevItem);
        
        // Page numbers
        // Show up to 5 page numbers, with first and last always visible
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // Adjust startPage if we're near the end
        if (endPage - startPage + 1 < maxVisiblePages && startPage > 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // First page link if not in range
        if (startPage > 1) {
            const firstPageItem = document.createElement('li');
            firstPageItem.className = 'page-item';
            firstPageItem.innerHTML = '<a class="page-link" href="#">1</a>';
            firstPageItem.addEventListener('click', function(e) {
                e.preventDefault();
                currentPage = 1;
                updateTable();
                updatePagination();
            });
            paginationElement.appendChild(firstPageItem);
            
            // Ellipsis if needed
            if (startPage > 2) {
                const ellipsisItem = document.createElement('li');
                ellipsisItem.className = 'page-item disabled';
                ellipsisItem.innerHTML = '<a class="page-link" href="#">...</a>';
                paginationElement.appendChild(ellipsisItem);
            }
        }
        
        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageItem.addEventListener('click', function(e) {
                e.preventDefault();
                currentPage = i;
                updateTable();
                updatePagination();
            });
            paginationElement.appendChild(pageItem);
        }
        
        // Last page link if not in range
        if (endPage < totalPages) {
            // Ellipsis if needed
            if (endPage < totalPages - 1) {
                const ellipsisItem = document.createElement('li');
                ellipsisItem.className = 'page-item disabled';
                ellipsisItem.innerHTML = '<a class="page-link" href="#">...</a>';
                paginationElement.appendChild(ellipsisItem);
            }
            
            const lastPageItem = document.createElement('li');
            lastPageItem.className = 'page-item';
            lastPageItem.innerHTML = `<a class="page-link" href="#">${totalPages}</a>`;
            lastPageItem.addEventListener('click', function(e) {
                e.preventDefault();
                currentPage = totalPages;
                updateTable();
                updatePagination();
            });
            paginationElement.appendChild(lastPageItem);
        }
        
        // Next button
        const nextItem = document.createElement('li');
        nextItem.className = `page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`;
        nextItem.innerHTML = `
            <a class="page-link" href="#" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        `;
        nextItem.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                updateTable();
                updatePagination();
            }
        });
        paginationElement.appendChild(nextItem);
    }
    
    // Generate and download PDF
    function downloadPDF() {
        // Get jsPDF instance
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape');
        
        // Add title
        doc.setFontSize(18);
        doc.setTextColor(155, 135, 245); // Primary color
        doc.text('MOBI-COMM Transaction Report', 14, 22);
        
        // Add subtitle with date
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        const today = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(`Generated on: ${today}`, 14, 30);
        
        // Add filter information
        const paymentMode = document.getElementById('paymentMode').value;
        const status = document.getElementById('status').value;
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;
        
        let filterText = 'Filters: ';
        if (paymentMode !== 'all') filterText += `Payment Mode: ${paymentMode}, `;
        if (status !== 'all') filterText += `Status: ${status}, `;
        if (dateFrom) filterText += `From: ${dateFrom}, `;
        if (dateTo) filterText += `To: ${dateTo}, `;
        
        if (filterText !== 'Filters: ') {
            filterText = filterText.slice(0, -2); // Remove last comma and space
            doc.setFontSize(10);
            doc.text(filterText, 14, 38);
        }
        
        // Add statistics
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);
        const totalTransactions = document.getElementById('totalTransactionsCount').textContent;
        const successfulTransactions = document.getElementById('successTransactionsCount').textContent;
        const totalAmount = document.getElementById('totalAmount').textContent;
        
        doc.text(`Total Transactions: ${totalTransactions}   |   Successful Transactions: ${successfulTransactions}   |   Total Revenue: ${totalAmount}`, 14, 46);
        
        // Define table columns
        const tableColumn = ['Transaction ID', 'User', 'Mobile', 'Date & Time', 'Plan', 'Amount', 'Payment Mode', 'Status'];
        
        // Create data for the table
        const tableRows = [];
        
        // Get all transactions for PDF (not just current page)
        filteredTransactions.forEach(transaction => {
            const date = new Date(transaction.transactionDate);
            const formattedDate = date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            const formattedTime = date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const userData = [
                transaction.transactionId,
                transaction.user.name,
                transaction.user.mobileNumber,
                `${formattedDate} ${formattedTime}`,
                transaction.plan.planName,
                `₹${transaction.transactionAmount.toFixed(2)}`,
                transaction.paymentMode,
                transaction.transactionStatus
            ];
            
            tableRows.push(userData);
        });
        
        // Generate table
        if (tableRows.length > 0) {
            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 55,
                theme: 'grid',
                styles: {
                    font: 'helvetica',
                    fontSize: 9,
                    cellPadding: 3,
                    overflow: 'ellipsize'
                },
                headStyles: {
                    fillColor: [155, 135, 245],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                columnStyles: {
                    7: { // Status column
                        fontStyle: function(cell) {
                            return cell.raw === 'Success' ? 'bold' : 'normal';
                        },
                        textColor: function(cell) {
                            if (cell.raw === 'Success') return [79, 209, 197];
                            if (cell.raw === 'Failed') return [252, 129, 129];
                            return [246, 173, 85]; // Pending
                        }
                    }
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                }
            });
        } else {
            doc.text('No transactions found matching the filter criteria.', 14, 60);
        }
        
        // Add footer with page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
            doc.text('MOBI-COMM Transactions Report', 14, doc.internal.pageSize.height - 10);
        }
        
        // Save PDF
        doc.save('MOBI-COMM_Transactions.pdf');
        
        // Show toast notification
        setToastMessage('PDF downloaded successfully!', 'success');
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
    
    // Show error message in table
    function showErrorInTable(message) {
        const tableBody = document.getElementById('transactionsTableBody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i> ${message}
                </td>
            </tr>
        `;
    }
    
    // Show toast message
    function setToastMessage(message, type = 'success') {
        const toastMessage = document.getElementById('toastMessage');
        toastMessage.textContent = message;
        
        // Set icon based on type
        const iconElement = document.querySelector('.toast-header i');
        if (type === 'success') {
            iconElement.className = 'bi bi-check-circle me-2 text-success';
        } else if (type === 'error') {
            iconElement.className = 'bi bi-exclamation-triangle me-2 text-danger';
        } else {
            iconElement.className = 'bi bi-info-circle me-2 text-primary';
        }
        
        toast.show();
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