document.addEventListener('DOMContentLoaded', function() {
    // Initialize payment method switching
    const methodItems = document.querySelectorAll('.method-item');
    let currentPaymentMode = 'UPI';

    // Retrieve stored data
    const mobileNumber = localStorage.getItem('mobileNumber');
    const selectedPlan = JSON.parse(localStorage.getItem('selectedPlan'));
    const storedUser = localStorage.getItem('currentUserDetails') ? 
        JSON.parse(localStorage.getItem('currentUserDetails')) : null;

    // Update UI with stored data
    function updateUIWithStoredData() {
        if (mobileNumber) {
            const mobileNumberElement = document.querySelector('.mobile-number');
            if (mobileNumberElement) {
                mobileNumberElement.textContent = mobileNumber;
            }
        }

        console.log(selectedPlan);
        if (selectedPlan) {
            // Update plan price
            const planPriceElement = document.querySelector('.plan-price');
            if (planPriceElement) {
                planPriceElement.textContent = `₹${selectedPlan.planPrice}`;
            }

            // Update validity
            const planValidityElement = document.querySelector('.plan-validity');
            if (planValidityElement) {
                planValidityElement.textContent = `Validity: ${selectedPlan.validityDays} days`;
            }

            // Update features
            const dataElement = document.querySelector('.plan-feature:nth-child(1) .feature-value');
            if (dataElement) {
                dataElement.textContent = selectedPlan.dataLimit;
            }

            const callsElement = document.querySelector('.plan-feature:nth-child(2) .feature-value');
            if (callsElement) {
                callsElement.textContent = selectedPlan.callLimit;
            }

            const smsElement = document.querySelector('.plan-feature:nth-child(3) .feature-value');
            if (smsElement) {
                smsElement.textContent = selectedPlan.smsLimit;
            }

            // Update OTT benefits if any
            if (selectedPlan.ottBenefits && selectedPlan.ottBenefits.length > 0) {
                const addonElement = document.querySelector('.addon-name');
                if (addonElement) {
                    const primaryOtt = selectedPlan.ottBenefits[0].ottPlan.ottProvider;
                    addonElement.textContent = primaryOtt.ottName;
                }
            }
        }
    }

    // Payment method switching
    methodItems.forEach(item => {
        item.addEventListener('click', function() {
            methodItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.payment-section').forEach(section => 
                section.classList.remove('active'));
            
            const targetSection = this.getAttribute('data-target');
            if (targetSection) {
                document.getElementById(targetSection).classList.add('active');
                currentPaymentMode = targetSection.includes('upi') ? 'UPI' : 
                                   targetSection.includes('card') ? 'Credit/Debit Card' : 'Net Banking';
            }
        });
    });

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

    // Create and save transaction record
    async function createTransaction() {
        if (!selectedPlan || !storedUser) return false;

        try {
            const transactionData = {
                user: {
                    userId: storedUser.userId
                },
                plan: {
                    planId: selectedPlan.planId
                },
                transactionAmount: selectedPlan.planPrice,
                paymentMode: currentPaymentMode,
                transactionStatus: "Success"
            };

            const response = await fetch('http://localhost:8083/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transactionData)
            });

            if (!response.ok) {
                throw new Error('Transaction failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating transaction:', error);
            return false;
        }
    }

    // Fetch last transaction
    async function fetchLastTransaction(userId) {
        try {
            const response = await fetch(`http://localhost:8083/transactions/last/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch transaction');
            return await response.json();
        } catch (error) {
            console.error('Error fetching transaction:', error);
            return null;
        }
    }

    // Function to generate the email body
    function generateEmailBody(userName, transaction, plan) {
        return `
            <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;'>
                <h2 style='color: #4CAF50;'>Mobi-Comm Recharge Successful</h2>
                <p>Hello <strong>${userName}</strong>,</p>
                <p>Your recent recharge was successful. Below are the details:</p>
                <h3>Transaction Details</h3>
                <ul>
                    <li><strong>Transaction ID:</strong> ${transaction.transactionId}</li>
                    <li><strong>Payment Mode:</strong> ${transaction.paymentMode}</li>
                    <li><strong>Amount:</strong> ₹${transaction.transactionAmount}</li>
                    <li><strong>Date & Time:</strong> ${new Date(transaction.transactionDate).toLocaleString()}</li>
                </ul>
                <h3>Plan Details</h3>
                <ul>
                    <li><strong>Validity:</strong> ${plan.validityDays} days</li>
                    <li><strong>Data:</strong> ${plan.dataLimit}</li>
                    <li><strong>Calls:</strong> ${plan.callLimit}</li>
                    <li><strong>SMS:</strong> ${plan.smsLimit}</li>
                </ul>
                <p>Thank you for choosing Mobi-Comm!</p>
            </div>`;
    }

    // Function to send email notification with transaction details
    async function sendEmailNotification(transaction, planDetails, userDetails) {
        try {
            // Prepare email data
            const emailData = {
                userId: userDetails.userId,
                userEmail: userDetails.userEmail,
                userName: userDetails.name,
                subject: "Mobi-Comm Recharge Successful",
                body: generateEmailBody(userDetails.name, transaction, planDetails), // HTML body
            };

            // Send email using the API endpoint
            const response = await fetch('http://localhost:8083/transactions/email/send', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emailData)
            });

            if (!response.ok) {
                throw new Error('Failed to send email notification');
            }

            console.log('Email notification sent successfully');
            return true;
        } catch (error) {
            console.error('Error sending email notification:', error);
            return false;
        }
    }

    // Show success modal with transaction details
    async function showSuccessModal(transaction) {
        const lastTransaction = transaction || 
            (storedUser ? await fetchLastTransaction(storedUser.userId) : null);
            
        if (!lastTransaction) return;

        // Update modal with transaction details
        document.getElementById('transactionId').textContent = lastTransaction.transactionId || 'N/A';
        document.getElementById('paymentMode').textContent = lastTransaction.paymentMode || 'N/A';
        document.getElementById('amountPaid').textContent = `₹${lastTransaction.transactionAmount}` || 'N/A';
        document.getElementById('paymentDateTime').textContent = 
            new Date(lastTransaction.transactionDate).toLocaleString() || 'N/A';

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();

        if (storedUser && selectedPlan) {
            sendEmailNotification(lastTransaction, selectedPlan, storedUser)
                .then(success => {
                    if (success) {
                        console.log('Recharge notification email sent to', storedUser.userEmail);
                    }
                });
        }
    }

    // UPI Validation
    const upiInput = document.querySelector('#upi-section input[type="text"]');
    if (upiInput) {
        upiInput.addEventListener('input', function() {
            const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
            this.value = this.value.replace(/\s/g, ''); // Remove spaces

            if (this.value && !upiRegex.test(this.value)) {
                showError(this, 'Enter a valid UPI ID (e.g., name@okaxis)');
            } else {
                clearError(this);
            }
        });
    }

    // Card Validation
    const cardNumber = document.querySelector('#card-section input[placeholder="enter card number here"]');
    const cardHolder = document.querySelector('#card-section input[placeholder="card holder name"]');
    const expiryDate = document.querySelector('#card-section input[placeholder="MM / YY"]');
    const cvv = document.querySelector('#card-section input[placeholder="CVV"]');

    if (cardNumber) {
        cardNumber.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 16); // Only numbers, max 16 digits
        });
    }

    if (cardHolder) {
        cardHolder.addEventListener('input', function() {
            this.value = this.value.replace(/[0-9]/g, ''); // Allow only letters
        });
    }

    if (expiryDate) {
        expiryDate.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            
            if (value.length > 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            
            this.value = value;
        });
    }

    if (cvv) {
        cvv.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 3); // Only numbers, max 3 digits
        });
    }

    // Function to validate expiry date
    function validateExpiryDate() {
        if (!expiryDate) return false;

        const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (!expiryDate.value.trim()) {
            showError(expiryDate, 'Expiry date is required');
            return false;
        }
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
        if (!cardNumber || !expiryDate || !cvv || !cardHolder) return false;

        let isValid = true;

        if (!cardNumber.value.trim()) {
            showError(cardNumber, 'Card number is required');
            isValid = false;
        } else if (!/^\d{16}$/.test(cardNumber.value.replace(/\s/g, ''))) {
            showError(cardNumber, 'Enter a valid 16-digit card number');
            isValid = false;
        } else {
            clearError(cardNumber);
        }

        if (!cardHolder.value.trim()) {
            showError(cardHolder, 'Card holder name is required');
            isValid = false;
        } else {
            clearError(cardHolder);
        }

        if (!validateExpiryDate()) {
            isValid = false;
        }

        if (!cvv.value.trim()) {
            showError(cvv, 'CVV is required');
            isValid = false;
        } else if (!/^\d{3}$/.test(cvv.value)) {
            showError(cvv, 'Enter a valid 3-digit CVV');
            isValid = false;
        } else {
            clearError(cvv);
        }

        return isValid;
    }

    // Net Banking Validation
    function validateNetBanking() {
        const bankRadios = document.querySelectorAll('.bank-radio:checked');
        const otherBankSelect = document.querySelector('.other-bank-select');
        
        if (!otherBankSelect) return false;

        const isOtherBankSelected = otherBankSelect.value !== "";
        const isBankSelected = bankRadios.length > 0;

        if (!isBankSelected && !isOtherBankSelected) {
            showError(otherBankSelect, 'Please select a bank for Net Banking');
            return false;
        }
        
        clearError(otherBankSelect);
        return true;
    }

    // Payment Validation and Processing
    window.validatePayment = function(event) {
        if (event) event.preventDefault();

        const activePaymentSection = document.querySelector('.payment-section.active');
        if (!activePaymentSection) return false;

        let isValid = false;

        if (activePaymentSection.id === 'upi-section' && upiInput) {
            if (!upiInput.value.trim()) {
                showError(upiInput, 'UPI ID is required');
                return false;
            }
            
            isValid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiInput.value.trim());
            if (!isValid) {
                showError(upiInput, 'Enter a valid UPI ID (e.g., name@okaxis)');
                return false;
            }
            clearError(upiInput);
        } else if (activePaymentSection.id === 'card-section') {
            isValid = validateCardDetails();
            if (!isValid) return false;
        } else if (activePaymentSection.id === 'netbanking-section') {
            isValid = validateNetBanking();
            if (!isValid) return false;
        }

        // If validation passes, create transaction and show success modal
        createTransaction().then(transaction => {
            if (transaction) {
                showSuccessModal(transaction);
            }
        });
        
        return false; // Prevent default form submission
    };

    // Generate PDF receipt
    window.generatePDF = function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add logo and header
        doc.setFontSize(20);
        doc.text('Mobi-Comm Recharge Receipt', 105, 20, { align: 'center' });

        // Add transaction details
        const transactionId = document.getElementById('transactionId').textContent;
        const paymentMode = document.getElementById('paymentMode').textContent;
        const amount = document.getElementById('amountPaid').textContent;
        const dateTime = document.getElementById('paymentDateTime').textContent;

        doc.setFontSize(12);
        doc.text(`Transaction ID: ${transactionId}`, 20, 40);
        doc.text(`Payment Mode: ${paymentMode}`, 20, 50);
        doc.text(`Amount: ${amount}`, 20, 60);
        doc.text(`Date & Time: ${dateTime}`, 20, 70);

        // Add plan details
        if (selectedPlan) {
            doc.text('Plan Details:', 20, 90);
            doc.text(`Validity: ${selectedPlan.validityDays} days`, 20, 100);
            doc.text(`Data: ${selectedPlan.dataLimit}`, 20, 110);
            doc.text(`Calls: ${selectedPlan.callLimit}`, 20, 120);
            doc.text(`SMS: ${selectedPlan.smsLimit}`, 20, 130);
        }

        doc.save('Mobi-Comm_Receipt.pdf');
    };

    // Attach event listener to download button
    const downloadBtn = document.getElementById('downloadInvoice');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', generatePDF);
    }

    // Initialize UI
    updateUIWithStoredData();
    
    // SOLUTION: Remove the additional event listeners from pay buttons
    // The buttons already have onclick="validatePayment()" in HTML
    // DO NOT add these event listeners
    /*
    const payButtons = document.querySelectorAll('#pay-btn');
    payButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default form submission
            validatePayment();
        });
    });
    */
});

function logout() {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "index.html";
}