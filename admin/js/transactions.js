document.addEventListener("DOMContentLoaded", function () {
    // Sample transaction data
    const transactions = [
        {
            mobileNo: "9876543210",
            transactionId: "TXN123456",
            date: "2024-03-15",
            time: "14:30",
            planName: "Gold",
            price: "₹500",
            paymentMode: "UPI",
            status: "success"
        },
        {
            mobileNo: "8765432109",
            transactionId: "TXN123457",
            date: "2024-03-15",
            time: "15:45",
            planName: "Silver",
            price: "₹400",
            paymentMode: "Card",
            status: "failed"
        },
        {
            mobileNo: "7654321098",
            transactionId: "TXN123458",
            date: "2024-03-16",
            time: "10:10",
            planName: "Platinum",
            price: "₹800",
            paymentMode: "Net Banking",
            status: "success"
        },
        {
            mobileNo: "6543210987",
            transactionId: "TXN123459",
            date: "2024-03-16",
            time: "11:20",
            planName: "Gold",
            price: "₹600",
            paymentMode: "Card",
            status: "success"
        },
        {
            mobileNo: "5432109876",
            transactionId: "TXN123460",
            date: "2024-03-17",
            time: "13:45",
            planName: "Silver",
            price: "₹300",
            paymentMode: "UPI",
            status: "failed"
        },
        {
            mobileNo: "4321098765",
            transactionId: "TXN123461",
            date: "2024-03-17",
            time: "15:30",
            planName: "Platinum",
            price: "₹700",
            paymentMode: "Net Banking",
            status: "success"
        },
        {
            mobileNo: "3210987654",
            transactionId: "TXN123462",
            date: "2024-03-18",
            time: "09:25",
            planName: "Gold",
            price: "₹500",
            paymentMode: "Card",
            status: "failed"
        },
        {
            mobileNo: "2109876543",
            transactionId: "TXN123463",
            date: "2024-03-18",
            time: "10:50",
            planName: "Silver",
            price: "₹400",
            paymentMode: "UPI",
            status: "success"
        },
        {
            mobileNo: "1098765432",
            transactionId: "TXN123464",
            date: "2024-03-19",
            time: "14:00",
            planName: "Platinum",
            price: "₹800",
            paymentMode: "Net Banking",
            status: "failed"
        },
        {
            mobileNo: "1987654321",
            transactionId: "TXN123465",
            date: "2024-03-19",
            time: "16:15",
            planName: "Gold",
            price: "₹600",
            paymentMode: "Card",
            status: "success"
        },
        {
            mobileNo: "1098765432",
            transactionId: "TXN123464",
            date: "2024-03-19",
            time: "14:00",
            planName: "Platinum",
            price: "₹800",
            paymentMode: "Net Banking",
            status: "failed"
        },
        {
            mobileNo: "1987654321",
            transactionId: "TXN123465",
            date: "2024-03-19",
            time: "16:15",
            planName: "Gold",
            price: "₹600",
            paymentMode: "Card",
            status: "success"
        },
        {
            mobileNo: "1098765432",
            transactionId: "TXN123464",
            date: "2024-03-19",
            time: "14:00",
            planName: "Platinum",
            price: "₹800",
            paymentMode: "Net Banking",
            status: "failed"
        },
        {
            mobileNo: "1987654321",
            transactionId: "TXN123465",
            date: "2024-03-19",
            time: "16:15",
            planName: "Gold",
            price: "₹600",
            paymentMode: "Card",
            status: "success"
        }
    ];
    
    
    const itemsPerPage = 10;
    let currentPage = 1;
    let filteredTransactions = [...transactions];
    function applyFilters() {
        const paymentMode = document.getElementById("paymentMode").value;
        const status = document.getElementById("status").value;
        const date = document.getElementById("dateFilter").value;
        filteredTransactions = transactions.filter(transaction => {
            const matchPaymentMode = paymentMode === "all" || transaction.paymentMode === paymentMode;
            const matchStatus = status === "all" || transaction.status === status;
            const matchDate = !date || transaction.date === date;
            return matchPaymentMode && matchStatus && matchDate;
        });
        currentPage = 1;
        updateTable();
        updatePagination();
    }
    function updateTable() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageTransactions = filteredTransactions.slice(startIndex, endIndex);
        const tbody = document.getElementById("transactionsTableBody");
        tbody.innerHTML = "";
        pageTransactions.forEach(transaction => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${transaction.mobileNo}</td>
                <td>${transaction.transactionId}</td>
                <td>${transaction.date}</td>
                <td>${transaction.time}</td>
                <td>${transaction.planName}</td>
                <td>${transaction.price}</td>
                <td>${transaction.paymentMode}</td>
                <td><span class="badge bg-${transaction.status === 'success' ? 'success' : 'danger'}">${transaction.status}</span></td>
            `;
            tbody.appendChild(row);
        });
        // Update pagination info
        document.getElementById("startRecord").textContent = startIndex + 1;
        document.getElementById("endRecord").textContent = Math.min(endIndex, filteredTransactions.length);
        document.getElementById("totalRecords").textContent = filteredTransactions.length;
    }
    function updatePagination() {
        const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
        const pagination = document.getElementById("pagination");
        pagination.innerHTML = "";
        // Previous button
        const prevLi = document.createElement("li");
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" onclick="return false;">Previous</a>`;
        prevLi.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateTable();
                updatePagination();
            }
        });
        pagination.appendChild(prevLi);
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement("li");
            li.className = `page-item ${currentPage === i ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" onclick="return false;">${i}</a>`;
            li.addEventListener('click', () => {
                currentPage = i;
                updateTable();
                updatePagination();
            });
            pagination.appendChild(li);
        }
        // Next button
        const nextLi = document.createElement("li");
        nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#" onclick="return false;">Next</a>`;
        nextLi.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updateTable();
                updatePagination();
            }
        });
        pagination.appendChild(nextLi);
    }
    function downloadPDF() {
        // Create a clone of the table for PDF
        const tableClone = document.querySelector('.table').cloneNode(true);
        const container = document.createElement('div');
        
        // Add MOBI-COMM header
        const header = document.createElement('h1');
        header.style.textAlign = 'center';
        header.style.color = '#007bff';
        header.style.marginBottom = '20px';
        header.textContent = 'MOBI-COMM';
        
        container.appendChild(header);
        container.appendChild(tableClone);
        // PDF options
        const opt = {
            margin: 1,
            filename: 'transactions-report.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
        };
        // Generate PDF
        html2pdf().set(opt).from(container).save();
    }
    // Initialize
    updateTable();
    updatePagination();
    // Make functions globally available
    window.applyFilters = applyFilters;
    window.downloadPDF = downloadPDF;
    // Sidebar Toggle
    document.getElementById('sidebarCollapse').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
        document.getElementById('content').classList.toggle('active');
    });
});