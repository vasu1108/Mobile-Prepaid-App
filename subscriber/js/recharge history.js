// Store recharge history in localStorage
function saveRechargeToHistory(rechargeData) {
    // Get existing history or initialize empty array
    const existingHistory = JSON.parse(localStorage.getItem('rechargeHistory') || '[]');
    
    // Add new recharge to history
    existingHistory.unshift(rechargeData);
    
    // Save back to localStorage
    localStorage.setItem('rechargeHistory', JSON.stringify(existingHistory));
}
// Create a recharge history card element
function createRechargeCard(recharge) {
    const card = document.createElement('div');
    card.className = 'col-12 col-md-6 col-lg-4';
    card.innerHTML = `
        <div class="card h-100">
            <div class="card-body d-flex flex-column">
                <div class="d-flex justify-content-between align-items-start mb-4">
                    <span class="price">₹${recharge.amount}</span>
                    <div class="date-badge text-center">
                        <small class="d-block fw-medium">${recharge.date}</small>
                        <small class="d-block">${recharge.time}</small>
                    </div>
                </div>
                
                <div class="row g-3 mb-4">
                    <div class="col-6">
                        <div class="feature-block">
                            <p class="feature-label">Calls</p>
                            <p class="feature-value">${recharge.calls}</p>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="feature-block">
                            <p class="feature-label">Data</p>
                            <p class="feature-value">${recharge.data}</p>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="feature-block">
                            <p class="feature-label">SMS</p>
                            <p class="feature-value">${recharge.sms}</p>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="feature-block">
                            <p class="feature-label">Validity</p>
                            <p class="feature-value">${recharge.validity}</p>
                        </div>
                    </div>
                </div>
                <div class="mt-auto">
                    <a href="#" class="download-btn" data-recharge='${JSON.stringify(recharge)}'>
                        <i class="bi bi-download me-1"></i> Download Receipt
                    </a>
                </div>
            </div>
        </div>
    `;
    
    // Add event listener to download button
    const downloadBtn = card.querySelector('.download-btn');
    downloadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const rechargeData = JSON.parse(this.getAttribute('data-recharge'));
        generatePDF(rechargeData);
    });
    
    return card;
}
// Load and display recharge history
function loadRechargeHistory() {
    const historyContainer = document.querySelector('.row.g-4');
    if (!historyContainer) return;
    
    // Clear existing cards
    historyContainer.innerHTML = '';
    
    // Get history from localStorage
    const history = JSON.parse(localStorage.getItem('rechargeHistory') || '[]');
    
    // Display history or "No history" message
    if (history.length === 0) {
        const noHistory = document.createElement('div');
        noHistory.className = 'col-12 text-center py-5';
        noHistory.innerHTML = '<p class="text-muted">No recharge history found</p>';
        historyContainer.appendChild(noHistory);
    } else {
        // Create card for each recharge
        history.forEach(recharge => {
            const card = createRechargeCard(recharge);
            historyContainer.appendChild(card);
        });
    }
}
// Generate PDF for receipt download
function generatePDF(rechargeData) {
    // Import jsPDF if using directly in browser
    if (typeof jsPDF === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        document.head.appendChild(script);
        
        script.onload = function() {
            generatePDFContent(rechargeData);
        };
    } else {
        generatePDFContent(rechargeData);
    }
}
// Generate PDF content
function generatePDFContent(rechargeData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add logo
    // doc.addImage('logo.png', 'PNG', 10, 10, 50, 20);
    
    // Set font and text color
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(230, 0, 0); // Vodafone Red
    
    // Header
    doc.setFontSize(22);
    doc.text('Recharge Receipt', 105, 20, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    
    // Customer details
    doc.text('Mobile Number:', 20, 40);
    doc.text(rechargeData.mobileNumber || '9876543210', 80, 40);
    
    doc.text('Date & Time:', 20, 50);
    doc.text(`${rechargeData.date} ${rechargeData.time}`, 80, 50);
    
    // Recharge details
    doc.setFont('helvetica', 'bold');
    doc.text('Recharge Details', 20, 70);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Plan Amount:', 20, 80);
    doc.text(`₹${rechargeData.amount}`, 80, 80);
    
    doc.text('Validity:', 20, 90);
    doc.text(rechargeData.validity, 80, 90);
    
    doc.text('Data:', 20, 100);
    doc.text(rechargeData.data, 80, 100);
    
    doc.text('Calls:', 20, 110);
    doc.text(rechargeData.calls, 80, 110);
    
    doc.text('SMS:', 20, 120);
    doc.text(rechargeData.sms, 80, 120);
    
    // Transaction details
    doc.setFont('helvetica', 'bold');
    doc.text('Transaction Details', 20, 140);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Transaction ID:', 20, 150);
    doc.text(rechargeData.transactionId || generateTransactionId(), 80, 150);
    
    doc.text('Payment Method:', 20, 160);
    doc.text(rechargeData.paymentMethod || 'Online', 80, 160);
    
    // Footer
    doc.setFontSize(10);
    doc.text('Thank you for choosing our service!', 105, 280, { align: 'center' });
    
    // Save the PDF
    doc.save(`Recharge_Receipt_${rechargeData.mobileNumber || 'receipt'}.pdf`);
}
// Helper function to generate transaction ID
function generateTransactionId() {
    return 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase();
}
// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadRechargeHistory();
});

function logout() {
    localStorage.removeItem("isLoggedIn"); // Remove login status
    window.location.href = "index.html"; // Redirect to login page
}