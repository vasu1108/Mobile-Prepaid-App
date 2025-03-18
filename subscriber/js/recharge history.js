document.addEventListener('DOMContentLoaded', function() {
    // Get the container for recharge cards
    const rechargeContainer = document.querySelector('.row.g-4');
    
    // Function to format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        
        // Get month name (abbreviated)
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[date.getMonth()];
        
        const year = date.getFullYear();
        
        // Format time (HH:MM AM/PM)
        let hours = date.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return {
            formattedDate: `${day} ${month} ${year}`,
            formattedTime: `${hours}:${minutes} ${ampm}`
        };
    }
    
    // Function to create a recharge card
    function createRechargeCard(recharge) {
        const dateInfo = formatDate(recharge.rechargeDate);
        
        // Create card with enhanced box shadow
        const cardDiv = document.createElement('div');
        cardDiv.className = 'col-12 col-md-6 col-lg-4';
        cardDiv.innerHTML = `
            <div class="card h-100" style="box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);">
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-4">
                        <span class="price">₹${recharge.plan.planPrice}</span>
                        <div class="date-badge text-center">
                            <small class="d-block fw-medium">${dateInfo.formattedDate}</small>
                            <small class="d-block">${dateInfo.formattedTime}</small>
                        </div>
                    </div>
                    
                    <div class="row g-3 mb-4">
                        <div class="col-6">
                            <div class="feature-block">
                                <p class="feature-label">Calls</p>
                                <p class="feature-value">${recharge.plan.callLimit}</p>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="feature-block">
                                <p class="feature-label">Data</p>
                                <p class="feature-value">${recharge.plan.dataLimit}</p>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="feature-block">
                                <p class="feature-label">SMS</p>
                                <p class="feature-value">${recharge.plan.smsLimit}</p>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="feature-block">
                                <p class="feature-label">Validity</p>
                                <p class="feature-value">${recharge.plan.validityDays} days</p>
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
        const downloadBtn = cardDiv.querySelector('.download-btn');
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const rechargeData = JSON.parse(this.getAttribute('data-recharge'));
            generateReceipt(rechargeData);
        });
        
        return cardDiv;
    }
    
    // Function to generate and download receipt
    function generateReceipt(recharge) {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            alert('PDF generation library not loaded. Please make sure jsPDF is included.');
            return;
        }
        
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.text('Mobi-Comm Recharge Receipt', 105, 20, { align: 'center' });
        
        // Add transaction details - only include transaction ID, not other IDs
        doc.setFontSize(12);
        doc.text(`Transaction ID: ${recharge.transaction.transactionId}`, 20, 40);
        doc.text(`Payment Mode: ${recharge.transaction.paymentMode}`, 20, 50);
        doc.text(`Amount: ₹${recharge.transaction.transactionAmount}`, 20, 60);
        
        // Format date for receipt
        const txnDate = new Date(recharge.transaction.transactionDate);
        doc.text(`Date & Time: ${txnDate.toLocaleString()}`, 20, 70);
        
        // Plan details
        doc.text('Plan Details:', 20, 90);
        doc.text(`Plan Name: ${recharge.plan.planName}`, 20, 100);
        doc.text(`Validity: ${recharge.plan.validityDays} days`, 20, 110);
        doc.text(`Data: ${recharge.plan.dataLimit}`, 20, 120);
        doc.text(`Calls: ${recharge.plan.callLimit}`, 20, 130);
        doc.text(`SMS: ${recharge.plan.smsLimit}`, 20, 140);
        
        // Add OTT benefits if available
        if (recharge.plan.ottBenefits && recharge.plan.ottBenefits.length > 0) {
            doc.text('OTT Benefits:', 20, 160);
            
            // Create a Set to track unique OTT providers
            const uniqueProviders = new Set();
            let yPos = 170;
            
            recharge.plan.ottBenefits.forEach(benefit => {
                const providerName = benefit.ottPlan.ottProvider.ottName;
                
                // Only add if this provider hasn't been added yet
                if (!uniqueProviders.has(providerName)) {
                    uniqueProviders.add(providerName);
                    doc.text(`• ${providerName} (${benefit.ottPlan.ottPlanName})`, 20, yPos);
                    yPos += 10;
                }
            });
        }
        
        // Save the PDF
        doc.save(`Recharge_Receipt_${recharge.transaction.transactionId}.pdf`);
    }
    
    // Function to fetch recharges
    async function fetchRecharges() {
        try {
            // Get user from localStorage
            const storedUserString = localStorage.getItem('currentUserDetails');
            if (!storedUserString) {
                rechargeContainer.innerHTML = '<div class="col-12"><div class="alert alert-warning">Please login to view your recharge history.</div></div>';
                return;
            }
            
            const storedUser = JSON.parse(storedUserString);
            const userId = storedUser.userId;
            
            if (!userId) {
                rechargeContainer.innerHTML = '<div class="col-12"><div class="alert alert-warning">User information is incomplete. Please login again.</div></div>';
                return;
            }
            
            // Show loading state
            rechargeContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
            
            // Fetch recharges
            const response = await fetch(`http://localhost:8083/recharges/user/${userId}`);
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            
            const recharges = await response.json();
            
            // Clear the container
            rechargeContainer.innerHTML = '';
            
            if (recharges.length === 0) {
                rechargeContainer.innerHTML = '<div class="col-12"><div class="alert alert-info">No recharge history found.</div></div>';
                return;
            }
            
            // Add recharge cards
            recharges.forEach(recharge => {
                const card = createRechargeCard(recharge);
                rechargeContainer.appendChild(card);
            });
            
        } catch (error) {
            console.error('Error fetching recharges:', error);
            rechargeContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger">Failed to load recharge history: ${error.message}</div></div>`;
        }
    }
    
    // Logout function
    window.logout = function() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUserDetails');
        window.location.href = 'index.html';
    };
    
    // Load recharges on page load
    fetchRecharges();

    // Check if jsPDF is loaded
    if (typeof window.jspdf === 'undefined') {
        // Add jsPDF library dynamically if not present
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = function() {
            console.log('jsPDF library loaded successfully');
        };
        script.onerror = function() {
            console.error('Failed to load jsPDF library');
            alert('PDF generation library could not be loaded. Please try again later.');
        };
        document.head.appendChild(script);
    }
});
