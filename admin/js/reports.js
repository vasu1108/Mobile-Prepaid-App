document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar
    document.getElementById('sidebarCollapse').addEventListener('click', function() {
        document.getElementById('sidebar').classList.toggle('active');
        document.getElementById('content').classList.toggle('active');
    });
    // Initialize complaints data
    let complaints = [];
    let filteredComplaints = [];
    let currentPage = 1;
    const rowsPerPage = 10;
    // Generate sample complaint data
    generateSampleComplaints();
    // Initial setup
    applyFilters();
    updateStatistics();
    // Event listeners for modal actions
    document.getElementById('updateStatusBtn').addEventListener('click', updateComplaintStatus);
    document.getElementById('addNoteBtn').addEventListener('click', addNote);
    // Function to generate sample complaints for demo
    function generateSampleComplaints() {
        const categories = [
            'Network Issues', 
            'Recharge Problems', 
            'Plan Activation', 
            'Data Services', 
            'Account Related', 
            'Other'
        ];
        
        const statuses = ['Pending', 'In Progress', 'Resolved', 'Escalated'];
        const names = [
            'John Smith', 'Mary Johnson', 'Robert Williams', 'Sarah Brown', 
            'Michael Jones', 'Lisa Davis', 'James Miller', 'Patricia Wilson',
            'David Moore', 'Jennifer Taylor', 'Richard Anderson', 'Nancy Thomas'
        ];
        
        // Generate 30-50 sample complaints
        const sampleCount = Math.floor(Math.random() * 21) + 30; // 30-50 complaints
        
        for (let i = 1; i <= sampleCount; i++) {
            const ticketPrefix = 'MC';
            const ticketNumber = Math.floor(1000000 + Math.random() * 9000000);
            const ticketId = `${ticketPrefix}${ticketNumber}`;
            
            const nameIndex = Math.floor(Math.random() * names.length);
            const name = names[nameIndex];
            
            const mobile = `9${Math.floor(10000000 + Math.random() * 90000000)}`;
            const email = `${name.toLowerCase().replace(' ', '.')}@example.com`;
            
            const categoryIndex = Math.floor(Math.random() * categories.length);
            const category = categories[categoryIndex];
            
            const statusIndex = Math.floor(Math.random() * statuses.length);
            const status = statuses[statusIndex];
            
            // Random date within the last 30 days
            const today = new Date();
            const days = Math.floor(Math.random() * 30);
            const date = new Date(today);
            date.setDate(today.getDate() - days);
            
            // Generate random description
            let description;
            switch (category) {
                case 'Network Issues':
                    description = "I'm experiencing frequent call drops and poor network coverage in my area. It's been happening for the past few days.";
                    break;
                case 'Recharge Problems':
                    description = "I made a recharge payment but the amount hasn't been credited to my account. Transaction ID: REF" + Math.floor(10000000 + Math.random() * 90000000);
                    break;
                case 'Plan Activation':
                    description = "I purchased a new plan yesterday but it hasn't been activated on my number yet. Please check.";
                    break;
                case 'Data Services':
                    description = "My data is getting consumed very quickly even when I'm not using it. I suspect there might be some background process or wrong billing.";
                    break;
                case 'Account Related':
                    description = "I need to update my KYC details. The current information is outdated.";
                    break;
                default:
                    description = "I have a query regarding my recent bill. There are some charges I don't recognize.";
            }
            
            // Create notes array (some complaints have notes, some don't)
            let notes = [];
            if (Math.random() > 0.5) {
                const noteCount = Math.floor(Math.random() * 3) + 1; // 1-3 notes
                for (let j = 0; j < noteCount; j++) {
                    const noteDate = new Date(date);
                    noteDate.setHours(date.getHours() + j + 1);
                    
                    let noteText;
                    if (j === 0) {
                        noteText = "Complaint received and assigned to technical team.";
                    } else if (j === 1) {
                        noteText = "Technical team investigating the issue. Customer informed via SMS.";
                    } else {
                        noteText = "Follow-up call made to gather additional information.";
                    }
                    
                    notes.push({
                        text: noteText,
                        timestamp: noteDate,
                        addedBy: "Admin User"
                    });
                }
            }
            
            complaints.push({
                id: i,
                ticketId: ticketId,
                customerName: name,
                mobile: mobile,
                email: email,
                category: category,
                description: description,
                date: date,
                status: status,
                notes: notes
            });
        }
    }
    // Function to update statistics counters
    function updateStatistics() {
        const totalComplaints = complaints.length;
        const pendingCount = complaints.filter(c => c.status === 'Pending').length;
        const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
        const escalatedCount = complaints.filter(c => c.status === 'Escalated').length;
        
        document.getElementById('totalComplaints').textContent = totalComplaints;
        document.getElementById('pendingComplaints').textContent = pendingCount;
        document.getElementById('resolvedComplaints').textContent = resolvedCount;
        document.getElementById('escalatedComplaints').textContent = escalatedCount;
    }
    // Function to apply filters
    window.applyFilters = function() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;
        
        filteredComplaints = complaints.filter(complaint => {
            // Apply category filter
            if (categoryFilter !== 'all' && complaint.category !== categoryFilter) {
                return false;
            }
            
            // Apply status filter
            if (statusFilter !== 'all' && complaint.status !== statusFilter) {
                return false;
            }
            
            // Apply date filter
            if (dateFilter) {
                const filterDate = new Date(dateFilter);
                const complaintDate = new Date(complaint.date);
                
                if (filterDate.toDateString() !== complaintDate.toDateString()) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Reset to first page when filters change
        currentPage = 1;
        
        // Update table and pagination
        renderComplaintsTable();
        renderPagination();
    };
    // Function to render complaints table
    function renderComplaintsTable() {
        const tableBody = document.getElementById('complaintsTableBody');
        tableBody.innerHTML = '';
        
        // Calculate the start and end index for current page
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = Math.min(startIndex + rowsPerPage, filteredComplaints.length);
        
        // Update the pagination info text
        document.getElementById('startRecord').textContent = filteredComplaints.length > 0 ? startIndex + 1 : 0;
        document.getElementById('endRecord').textContent = endIndex;
        document.getElementById('totalRecords').textContent = filteredComplaints.length;
        
        // If no complaints match the filter
        if (filteredComplaints.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="7" class="text-center">No complaints found matching the filters</td>
            `;
            tableBody.appendChild(row);
            return;
        }
        
        // Loop through the current page's complaints
        for (let i = startIndex; i < endIndex; i++) {
            const complaint = filteredComplaints[i];
            const row = document.createElement('tr');
            
            // Format date
            const formattedDate = formatDate(complaint.date);
            
            // Get status badge class
            const statusClass = getStatusBadgeClass(complaint.status);
            
            row.innerHTML = `
                <td>${complaint.ticketId}</td>
                <td>${complaint.customerName}</td>
                <td>${complaint.mobile}</td>
                <td>${complaint.category}</td>
                <td>${formattedDate}</td>
                <td><span class="badge ${statusClass}">${complaint.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-view btn-action" onclick="viewComplaint(${complaint.id})">
                        <i class="bi bi-eye"></i> View
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        }
    }
    // Function to render pagination
    function renderPagination() {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
        
        const totalPages = Math.ceil(filteredComplaints.length / rowsPerPage);
        
        // Add Previous button
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous" ${currentPage > 1 ? 'onclick="changePage(' + (currentPage - 1) + '); return false;"' : ''}>
            <span aria-hidden="true">&laquo;</span>
        </a>`;
        pagination.appendChild(prevLi);
        
        // Determine range of pages to show
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        if (endPage - startPage < 4 && totalPages > 5) {
            startPage = Math.max(1, endPage - 4);
        }
        
        // Add page numbers
        for (let i = startPage; i <= endPage; i++) {
            const pageLi = document.createElement('li');
            pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>`;
            pagination.appendChild(pageLi);
        }
        
        // Add Next button
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next" ${currentPage < totalPages ? 'onclick="changePage(' + (currentPage + 1) + '); return false;"' : ''}>
            <span aria-hidden="true">&raquo;</span>
        </a>`;
        pagination.appendChild(nextLi);
    }
    // Function to change page
    window.changePage = function(page) {
        currentPage = page;
        renderComplaintsTable();
        renderPagination();
    };
    // Function to view complaint details
    window.viewComplaint = function(id) {
        const complaint = complaints.find(c => c.id === id);
        if (!complaint) return;
        
        // Populate modal fields
        document.getElementById('modalTicketId').textContent = complaint.ticketId;
        document.getElementById('modalCustomerName').textContent = complaint.customerName;
        document.getElementById('modalMobile').textContent = complaint.mobile;
        document.getElementById('modalEmail').textContent = complaint.email;
        document.getElementById('modalCategory').textContent = complaint.category;
        document.getElementById('modalDate').textContent = formatDate(complaint.date);
        
        const statusElement = document.getElementById('modalStatus');
        statusElement.textContent = complaint.status;
        statusElement.className = `badge ${getStatusBadgeClass(complaint.status)}`;
        
        document.getElementById('modalDescription').textContent = complaint.description;
        document.getElementById('updateStatus').value = complaint.status;
        
        // Populate notes
        const notesContainer = document.getElementById('notesContainer');
        notesContainer.innerHTML = '';
        
        if (complaint.notes && complaint.notes.length > 0) {
            complaint.notes.forEach(note => {
                const noteDiv = document.createElement('div');
                noteDiv.className = 'note-item';
                noteDiv.innerHTML = `
                    <p class="mb-1">${note.text}</p>
                    <p class="note-time mb-0">
                        ${formatDateTime(note.timestamp)} by ${note.addedBy}
                    </p>
                `;
                notesContainer.appendChild(noteDiv);
            });
        } else {
            notesContainer.innerHTML = '<p class="text-muted">No notes available</p>';
        }
        
        // Set the current complaint ID to the update button's data attribute
        document.getElementById('updateStatusBtn').setAttribute('data-complaint-id', id);
        document.getElementById('addNoteBtn').setAttribute('data-complaint-id', id);
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('complaintModal'));
        modal.show();
    };
    // Function to update complaint status
    function updateComplaintStatus() {
        const complaintId = parseInt(this.getAttribute('data-complaint-id'));
        const newStatus = document.getElementById('updateStatus').value;
        
        const complaint = complaints.find(c => c.id === complaintId);
        if (!complaint) return;
        
        // Update status
        complaint.status = newStatus;
        
        // Add a note about the status change
        const now = new Date();
        complaint.notes = complaint.notes || [];
        complaint.notes.push({
            text: `Status updated to: ${newStatus}`,
            timestamp: now,
            addedBy: "Admin User"
        });
        
        // Update the modal
        const statusElement = document.getElementById('modalStatus');
        statusElement.textContent = newStatus;
        statusElement.className = `badge ${getStatusBadgeClass(newStatus)}`;
        
        // Refresh the notes display
        const notesContainer = document.getElementById('notesContainer');
        const noteDiv = document.createElement('div');
        noteDiv.className = 'note-item';
        noteDiv.innerHTML = `
            <p class="mb-1">Status updated to: ${newStatus}</p>
            <p class="note-time mb-0">
                ${formatDateTime(now)} by Admin User
            </p>
        `;
        notesContainer.prepend(noteDiv);
        
        // Update the table
        updateStatistics();
        applyFilters();
        
        // Show success message
        alert('Status updated successfully!');
    }
    // Function to add a note
    function addNote() {
        const complaintId = parseInt(this.getAttribute('data-complaint-id'));
        const noteText = document.getElementById('noteText').value.trim();
        
        if (!noteText) {
            alert('Please enter a note');
            return;
        }
        
        const complaint = complaints.find(c => c.id === complaintId);
        if (!complaint) return;
        
        // Add note
        const now = new Date();
        complaint.notes = complaint.notes || [];
        complaint.notes.push({
            text: noteText,
            timestamp: now,
            addedBy: "Admin User"
        });
        
        // Refresh the notes display
        const notesContainer = document.getElementById('notesContainer');
        
        // Remove "No notes available" message if it exists
        if (notesContainer.innerHTML.includes('No notes available')) {
            notesContainer.innerHTML = '';
        }
        
        const noteDiv = document.createElement('div');
        noteDiv.className = 'note-item';
        noteDiv.innerHTML = `
            <p class="mb-1">${noteText}</p>
            <p class="note-time mb-0">
                ${formatDateTime(now)} by Admin User
            </p>
        `;
        notesContainer.prepend(noteDiv);
        
        // Clear the note text field
        document.getElementById('noteText').value = '';
        
        // Show success message
        alert('Note added successfully!');
    }
    // Function to download complaints as PDF
    window.downloadPDF = function() {
        // Create a clone of the table to modify for PDF export
        const tableClone = document.querySelector('.table').cloneNode(true);
        const tableBody = tableClone.querySelector('tbody');
        
        // Remove action column from the table header
        const headerRow = tableClone.querySelector('thead tr');
        headerRow.removeChild(headerRow.lastElementChild);
        
        // Remove action buttons from each row
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            if (row.lastElementChild) {
                row.removeChild(row.lastElementChild);
            }
        });
        
        // Create a container for the PDF content
        const pdfContent = document.createElement('div');
        pdfContent.className = 'pdf-content';
        
        // Add title and filters summary
        const title = document.createElement('h2');
        title.textContent = 'Customer Complaints Report';
        title.style.textAlign = 'center';
        title.style.marginBottom = '20px';
        
        const dateGenerated = document.createElement('p');
        dateGenerated.textContent = `Generated on: ${formatDate(new Date())}`;
        dateGenerated.style.textAlign = 'center';
        dateGenerated.style.marginBottom = '20px';
        
        // Add filters summary
        const filtersApplied = document.createElement('div');
        filtersApplied.style.marginBottom = '20px';
        filtersApplied.style.padding = '10px';
        filtersApplied.style.backgroundColor = '#f8f9fa';
        filtersApplied.style.borderRadius = '5px';
        
        const categoryFilter = document.getElementById('categoryFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;
        
        filtersApplied.innerHTML = `
            <p><strong>Filters Applied:</strong></p>
            <p>Category: ${categoryFilter === 'all' ? 'All Categories' : categoryFilter}</p>
            <p>Status: ${statusFilter === 'all' ? 'All Statuses' : statusFilter}</p>
            <p>Date: ${dateFilter ? formatDate(new Date(dateFilter)) : 'All Dates'}</p>
            <p>Total Records: ${filteredComplaints.length}</p>
        `;
        
        // Append everything to the container
        pdfContent.appendChild(title);
        pdfContent.appendChild(dateGenerated);
        pdfContent.appendChild(filtersApplied);
        pdfContent.appendChild(tableClone);
        
        // Configure PDF options
        const options = {
            margin: 10,
            filename: 'complaint_report.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };
        
        // Generate and download the PDF
        html2pdf().from(pdfContent).set(options).save();
    };
    // Function to download complaints as CSV
    window.downloadCSV = function() {
        // Define CSV headers
        let csvContent = "Ticket ID,Customer Name,Mobile,Category,Date,Status\n";
        
        // Add each complaint as a row
        filteredComplaints.forEach(complaint => {
            const formattedDate = formatDate(complaint.date);
            csvContent += `"${complaint.ticketId}","${complaint.customerName}","${complaint.mobile}","${complaint.category}","${formattedDate}","${complaint.status}"\n`;
        });
        
        // Create a Blob and create a download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // Create a link element to trigger the download
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'complaint_report.csv');
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    // Helper function to format date
    function formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    // Helper function to format date and time
    function formatDateTime(date) {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    // Helper function to get status badge CSS class
    function getStatusBadgeClass(status) {
        switch (status) {
            case 'Pending':
                return 'bg-pending';
            case 'In Progress':
                return 'bg-progress';
            case 'Resolved':
                return 'bg-resolved';
            case 'Escalated':
                return 'bg-escalated';
            default:
                return 'bg-secondary';
        }
    }
});