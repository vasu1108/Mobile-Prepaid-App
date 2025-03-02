document.addEventListener('DOMContentLoaded', function() {
    const methodItems = document.querySelectorAll('.method-item');

    // Function to display error message below an input field
    function showError(input, message) {
        let errorElement = input.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            errorElement = document.createElement('small');
            errorElement.classList.add('error-message', 'text-danger');
            input.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    // Function to clear error messages
    function clearError(input) {
        let errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = '';
        }
    }

    // UPI VALIDATION
    const upiInput = document.querySelector('#upi-section input[type="text"]');
    if (upiInput) {
        upiInput.addEventListener('input', function() {
            const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
            this.value = this.value.replace(/\s/g, ''); // Remove spaces

            if (!upiRegex.test(this.value)) {
                showError(this, 'Enter a valid UPI ID (e.g., name@okaxis)');
            } else {
                clearError(this);
            }
        });
    }

    // CARD VALIDATION
    const cardNumber = document.querySelector('#card-section input[placeholder="enter card number here"]');
    const cardHolder = document.querySelector('#card-section input[placeholder="card holder name"]');
    const expiryDate = document.querySelector('#card-section input[placeholder="MM / YY"]');
    const cvv = document.querySelector('#card-section input[placeholder="CVV"]');

    if (cardNumber) {
        cardNumber.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 16); // Only numbers, max 16 digits
        });
    }

    if (expiryDate) {
        expiryDate.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9/]/g, '').slice(0, 5); // Restrict to MM/YY format
        });
    }

    if (cvv) {
        cvv.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 3); // Only numbers, max 3 digits
        });
    }

    // Function to validate card expiry date
    function validateExpiryDate() {
        if (!expiryDate) return false;
        
        const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (!expiryRegex.test(expiryDate.value.trim())) {
            showError(expiryDate, 'Enter a valid expiry date (MM/YY)');
            return false;
        }

        const [month, year] = expiryDate.value.split('/').map(num => parseInt(num, 10));
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            showError(expiryDate, 'Card is expired');
            return false;
        }

        clearError(expiryDate);
        return true;
    }

    // Function to validate all card details
    function validateCardDetails() {
        if (!cardNumber || !cardHolder || !expiryDate || !cvv) return false;
        
        let isValid = true;

        if (!/^\d{16}$/.test(cardNumber.value.replace(/\s/g, ''))) {
            showError(cardNumber, 'Enter a valid 16-digit card number');
            isValid = false;
        } else {
            clearError(cardNumber);
        }

        if (cardHolder.value.trim() === '') {
            showError(cardHolder, 'Enter cardholder name');
            isValid = false;
        } else {
            clearError(cardHolder);
        }

        if (!validateExpiryDate()) {
            isValid = false;
        }

        if (!/^\d{3}$/.test(cvv.value)) {
            showError(cvv, 'Enter a valid 3-digit CVV');
            isValid = false;
        } else {
            clearError(cvv);
        }

        return isValid;
    }

    // NET BANKING VALIDATION
    function validateNetBanking() {
        const otherBankSelect = document.querySelector('.other-bank-select');
        if (!otherBankSelect) return false;
        
        const selectedBank = document.querySelector('.bank-radio:checked') || (otherBankSelect.value !== "" ? otherBankSelect : null);
        
        if (!selectedBank) {
            showError(otherBankSelect, 'Please select a bank for Net Banking');
            return false;
        }
        clearError(otherBankSelect);
        return true;
    }

    // Utility Functions
    function generateTransactionId() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'TXN';
        for (let i = 0; i < 8; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    
    function getCurrentDateTime() {
        const now = new Date();
        return now.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
    
    function getCurrentPaymentMode() {
        const activeMethod = document.querySelector('.method-item.active');
        if (!activeMethod) return 'UPI';
        
        const targetId = activeMethod.getAttribute('data-target');
        switch (targetId) {
            case 'upi-section':
                return 'UPI';
            case 'card-section':
                return 'Credit/Debit Card';
            case 'netbanking-section':
                return 'Net Banking';
            default:
                return 'UPI';
        }
    }

    // Function to get plan features
    function getPlanFeatures() {
        // Get the plan data from the current page
        const amount = document.querySelector('.plan-price')?.textContent.trim().replace('₹', '') || '0';
        const validityElement = document.querySelector('.plan-validity');
        const validity = validityElement ? validityElement.textContent.replace('Validity:', '').trim() : 'Unknown';
        
        // Correctly get feature values
        const features = Array.from(document.querySelectorAll('.plan-feature .feature-value'));
        const data = features[0]?.textContent?.trim() || 'Unknown';
        const calls = features[1]?.textContent?.trim() || 'Unknown';
        const sms = features[2]?.textContent?.trim() || 'Unknown';
        
        return { amount, validity, data, calls, sms };
    }

    // RECHARGE HISTORY Functions
    function addToRechargeHistory() {
        const { amount, validity, data, calls, sms } = getPlanFeatures();
        
        // Get mobile number
        const mobileNumber = document.querySelector('#mobile-number')?.value || localStorage.getItem('mobileNumber') || '9876543210';
        
        // Create date and time
        const now = new Date();
        const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        
        // Create recharge object
        const rechargeData = {
            amount,
            validity,
            data,
            calls,
            sms,
            mobileNumber,
            date,
            time,
            transactionId: generateTransactionId(),
            paymentMethod: getCurrentPaymentMode()
        };
        
        // Save to localStorage
        saveRechargeToHistory(rechargeData);
        
        // Store the last recharge for receipt download
        localStorage.setItem('lastRecharge', JSON.stringify(rechargeData));
        
        return rechargeData;
    }

    function saveRechargeToHistory(rechargeData) {
        // Get existing history or initialize empty array
        const existingHistory = JSON.parse(localStorage.getItem('rechargeHistory') || '[]');
        
        // Add new recharge to history
        existingHistory.unshift(rechargeData);
        
        // Save back to localStorage
        localStorage.setItem('rechargeHistory', JSON.stringify(existingHistory));
    }

    // PAYMENT VALIDATION AND PROCESSING
    function validatePayment(event) {
        if (event) event.preventDefault();

        const activePaymentSection = document.querySelector('.payment-section.active');
        if (!activePaymentSection) return false;
        
        let isValid = false;

        if (activePaymentSection.id === 'upi-section' && upiInput) {
            isValid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiInput.value.trim());
            if (!isValid) showError(upiInput, 'Enter a valid UPI ID (e.g., name@okaxis)');
        } else if (activePaymentSection.id === 'card-section') {
            isValid = validateCardDetails();
        } else if (activePaymentSection.id === 'netbanking-section') {
            isValid = validateNetBanking();
        }

        if (isValid) {
            showSuccessAndUpdateHistory();
            return true;
        }
        
        return false;
    }

    function showSuccessAndUpdateHistory() {
        // Generate transaction details
        const transactionId = generateTransactionId();
        const paymentMode = getCurrentPaymentMode();
        const dateTime = getCurrentDateTime();
        
        // Update the modal elements
        const transIdElement = document.getElementById('transactionId');
        const paymentModeElement = document.getElementById('paymentMode');
        const paymentDateTimeElement = document.getElementById('paymentDateTime');
        
        if (transIdElement) transIdElement.textContent = transactionId;
        if (paymentModeElement) paymentModeElement.textContent = paymentMode;
        if (paymentDateTimeElement) paymentDateTimeElement.textContent = dateTime;
        
        // Add to recharge history
        const rechargeData = addToRechargeHistory();
        
        // Show success modal
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();
        
        // Log confirmation
        console.log('Recharge added to history:', rechargeData);
    }

    // PDF GENERATION Functions
    function generateReceiptPDF() {
        // Check if jsPDF is available
        if (typeof window.jspdf === 'undefined') {
            console.error('jsPDF library not loaded');
            alert('PDF generation is not available. Please make sure jsPDF is properly loaded.');
            return;
        }
        
        try {
            // Get plan details for the PDF
            const planName = document.querySelector('.plan-name')?.textContent || 'Mobile Recharge';
            const planPrice = document.querySelector('.plan-price')?.textContent || '₹0';
            
            const { validity, data, calls, sms } = getPlanFeatures();
            
            // Get addon if exists
            const addon = document.querySelector('.addon-name')?.textContent?.trim() || 'None';
            
            // Get mobile number
            const mobileNumber = document.querySelector('#mobile-number')?.value || localStorage.getItem('mobileNumber') || '';
            
            // Creating the PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Set font and colors
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
            doc.text(mobileNumber, 80, 40);
            
            // Current date and time
            const now = new Date();
            const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            
            doc.text('Date & Time:', 20, 50);
            doc.text(`${date} ${time}`, 80, 50);
            
            // Recharge details
            doc.setFont('helvetica', 'bold');
            doc.text('Recharge Details', 20, 70);
            doc.setFont('helvetica', 'normal');
            
            doc.text('Plan:', 20, 80);
            doc.text(planName, 80, 80);
            
            doc.text('Plan Amount:', 20, 90);
            doc.text(planPrice, 80, 90);
            
            doc.text('Validity:', 20, 100);
            doc.text(validity, 80, 100);
            
            doc.text('Data:', 20, 110);
            doc.text(data, 80, 110);
            
            doc.text('Calls:', 20, 120);
            doc.text(calls, 80, 120);
            
            doc.text('SMS:', 20, 130);
            doc.text(sms, 80, 130);
            
            if (addon !== 'None') {
                doc.text('Add-on:', 20, 140);
                doc.text(addon, 80, 140);
            }
            
            // Transaction details
            doc.setFont('helvetica', 'bold');
            doc.text('Transaction Details', 20, 160);
            doc.setFont('helvetica', 'normal');
            
            doc.text('Transaction ID:', 20, 170);
            doc.text(generateTransactionId(), 80, 170);
            
            doc.text('Payment Method:', 20, 180);
            doc.text(getCurrentPaymentMode(), 80, 180);
            
            // Footer
            doc.setFontSize(10);
            doc.text('Thank you for choosing our service!', 105, 280, { align: 'center' });
            
            // Save the PDF
            doc.save(`Recharge_Receipt_${mobileNumber}.pdf`);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('There was an error generating your receipt. Please try again.');
        }
    }

    function generateInvoicePDF() {
        // Check if jsPDF is available
        if (!window.jspdf || !window.jspdf.jsPDF) {
            console.error('jsPDF library not loaded. Make sure to include the script in your HTML.');
            alert('PDF generation is not available. Make sure jsPDF is properly loaded.');
            return;
        }
        
        try {
            // Get data for the invoice
            const transactionId = document.getElementById('transactionId')?.textContent || 'Unknown';
            const paymentMode = document.getElementById('paymentMode')?.textContent || 'Unknown';
            const dateTime = document.getElementById('paymentDateTime')?.textContent || new Date().toLocaleString();
            const amount = document.querySelector('.plan-price')?.textContent || '₹499';
            const mobileNumber = document.querySelector('.mobile-number')?.textContent || 
                                document.querySelector('#mobile-number')?.value || 
                                localStorage.getItem('mobileNumber') || 'Unknown';
            
            // Get plan features
            const { validity, data, calls, sms } = getPlanFeatures();
            const addon = document.querySelector('.addon-name')?.textContent || 'None';
            
            // Create a new jsPDF instance
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('portrait', 'pt', 'a4');
            
            // Set background color
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
            
            // Add company logo/name
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(230, 0, 0); // Red color for Mobi-Comm
            doc.setFontSize(30);
            doc.text("Mobi-Comm", doc.internal.pageSize.width / 2, 50, { align: 'center' });
            
            // Add invoice title
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            doc.setFontSize(18);
            doc.text("PAYMENT INVOICE", doc.internal.pageSize.width / 2, 80, { align: 'center' });
            
            // Add horizontal line
            doc.setDrawColor(200, 200, 200);
            doc.line(40, 90, doc.internal.pageSize.width - 40, 90);
            
            // Add transaction details
            doc.setFontSize(12);
            doc.setTextColor(80, 80, 80);
            doc.text(`Date: ${dateTime}`, 40, 120);
            doc.text(`Transaction ID: ${transactionId}`, 40, 140);
            doc.text(`Mobile Number: ${mobileNumber}`, 40, 160);
            doc.text(`Payment Method: ${paymentMode}`, 40, 180);
            
            // Add plan details section
            doc.setFontSize(16);
            doc.setTextColor(60, 60, 60);
            doc.text("Plan Details", 40, 220);
            
            // Add horizontal line
            doc.setDrawColor(230, 230, 230);
            doc.line(40, 230, doc.internal.pageSize.width - 40, 230);
            
            // Add plan features table
            doc.setFontSize(12);
            doc.setTextColor(80, 80, 80);
            
            let yPos = 250;
            const features = [
                { name: "Plan Amount", value: amount },
                { name: "Validity", value: validity },
                { name: "Data", value: data },
                { name: "Calls", value: calls },
                { name: "SMS", value: sms },
                { name: "Add-on", value: addon }
            ];
            
            features.forEach(feature => {
                doc.text(feature.name, 60, yPos);
                doc.text(feature.value, 300, yPos);
                yPos += 25;
            });
            
            // Add horizontal line
            doc.setDrawColor(200, 200, 200);
            doc.line(40, yPos + 10, doc.internal.pageSize.width - 40, yPos + 10);
            
            // Add total amount
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(60, 60, 60);
            doc.text("Total Paid:", 300, yPos + 40);
            doc.setTextColor(230, 0, 0);
            doc.text(amount, 400, yPos + 40);
            
            // Add thank you note
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text("Thank you for choosing Mobi-Comm!", doc.internal.pageSize.width / 2, yPos + 80, { align: 'center' });
            
            // Add footer
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text("This is a computer-generated invoice and does not require a signature.", doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 30, { align: 'center' });
            
            // Save the PDF
            doc.save(`Mobi-Comm_Invoice_${transactionId}.pdf`);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('There was an error generating your invoice. Please try again.');
        }
    }

    // EVENT LISTENERS
    // Handle payment method switching
    methodItems.forEach(item => {
        item.addEventListener('click', function() {
            methodItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.payment-section').forEach(section => section.classList.remove('active'));
            
            const targetSection = this.getAttribute('data-target');
            if (targetSection) {
                document.getElementById(targetSection).classList.add('active');
            }
        });
    });

    // Attach validation function to payment buttons
    const payButtons = document.querySelectorAll('#pay-btn');
    if (payButtons.length > 0) {
        payButtons.forEach(button => {
            button.addEventListener('click', validatePayment);
        });
    }

    // Pay button
    const payButton = document.querySelector('#pay-button');
    if (payButton) {
        payButton.addEventListener('click', function() {
            // Validate payment and show success modal
            setTimeout(function() {
                showSuccessAndUpdateHistory();
            }, 1000);
        });
    }

    // Download invoice button
    const downloadInvoiceButton = document.getElementById('downloadInvoice');
    if (downloadInvoiceButton) {
        downloadInvoiceButton.addEventListener('click', generateInvoicePDF);
    }

    // Download receipt button
    const downloadReceiptBtn = document.querySelector('#download-receipt-btn');
    if (downloadReceiptBtn) {
        downloadReceiptBtn.addEventListener('click', function(e) {
            e.preventDefault();
            generateReceiptPDF();
        });
    }

    // Store mobile number
    const mobileNumberInput = document.querySelector('#mobile-number');
    if (mobileNumberInput) {
        mobileNumberInput.addEventListener('change', function() {
            localStorage.setItem('mobileNumber', this.value);
        });
    }

    // Make validatePayment globally accessible
    window.validatePayment = validatePayment;

    
});

document.addEventListener('DOMContentLoaded', function() {
    // Retrieve data from localStorage
    const mobileNumber = localStorage.getItem('mobileNumber') || '+91 9876543210'; // Default if empty
    const selectedPlan = JSON.parse(localStorage.getItem('selectedPlan'));

    // Ensure mobile number is updated
    const mobileNumberElement = document.querySelector('.mobile-number');
    if (mobileNumberElement) {
        mobileNumberElement.textContent = mobileNumber;
    }

    // Update plan details if available
    if (selectedPlan) {
        // Update plan price
        const planPriceElement = document.querySelector('.plan-price');
        if (planPriceElement) {
            planPriceElement.textContent = `₹${selectedPlan.cost}`;
        }

        // Update validity
        const planValidityElement = document.querySelector('.plan-validity');
        if (planValidityElement) {
            planValidityElement.textContent = `Validity: ${selectedPlan.validity}`;
        }

        // Update data feature
        const dataFeatureElement = document.querySelector('.plan-feature:nth-child(1) .feature-value');
        if (dataFeatureElement) {
            dataFeatureElement.textContent = selectedPlan.data;
        }

        // Update calls feature
        const callsFeatureElement = document.querySelector('.plan-feature:nth-child(2) .feature-value');
        if (callsFeatureElement) {
            callsFeatureElement.textContent = selectedPlan.calls;
        }

        // Update SMS feature
        const smsFeatureElement = document.querySelector('.plan-feature:nth-child(3) .feature-value');
        if (smsFeatureElement) {
            smsFeatureElement.textContent = selectedPlan.sms;
        }

        // Update add-on if exists
        const addonDiv = document.querySelector('.plan-addon');
        if (addonDiv) {
            if (selectedPlan.benefits) {
                const addonNameElement = document.querySelector('.addon-name');
                if (addonNameElement) {
                    addonNameElement.textContent = selectedPlan.benefits;
                }
                addonDiv.style.display = 'block';
            } else {
                addonDiv.style.display = 'none';
            }
        }
    }
});
document.addEventListener("DOMContentLoaded", function () {
    // Select the Sign In link and Profile Icon
    const signInLink = document.querySelector(".nav-link.text-danger"); // "Sign In" link
    const profileIcon = document.querySelector(".profile-icon"); // Profile Icon
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn) {
        // User is logged in: Show Profile Icon, Hide Sign In Link
        if (signInLink) signInLink.style.display = "none";
        if (profileIcon) profileIcon.style.display = "inline-block";
    } else {
        // User is logged out: Show Sign In Link, Hide Profile Icon
        if (signInLink) signInLink.style.display = "inline-block";
        if (profileIcon) profileIcon.style.display = "none";
    }
});

function logout() {
    localStorage.removeItem("isLoggedIn"); // Remove login status
    window.location.href = "index.html"; // Redirect to login page
}