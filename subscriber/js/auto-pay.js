document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const autopayForm = document.getElementById('autopay-form');
    const paymentMethodCards = document.querySelectorAll('.payment-method-card');
    const paymentFieldsContainer = document.getElementById('payment-fields-container');
    const paymentFields = document.querySelectorAll('.payment-fields');
    const setupAutopayBtn = document.getElementById('setup-autopay-btn');
    const cancelAutopayBtn = document.getElementById('cancel-autopay-btn');
    const changePaymentBtn = document.getElementById('change-payment-btn');
    const changePlanBtn = document.getElementById('change-plan-btn');
    const planChangeBtn = document.getElementById('plan-change-btn');
    const confirmPlanChange = document.getElementById('confirm-plan-change');
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
    
    const autopaySetupContainer = document.getElementById('autopay-setup-container');
    const autopayStatusContainer = document.getElementById('autopay-status-container');
    
    // Input Fields
    const mobileNumberInput = document.getElementById('mobile-number');
    const termsCheckbox = document.getElementById('terms-checkbox');
    
    // Plan Selection
    const planCards = document.querySelectorAll('.plan-card');
    let selectedPlanId = '2'; // Default to the middle plan (already active)
    
    // UPI Fields
    const upiIdInput = document.getElementById('upi-id');
    
    // Card Fields
    const cardNumberInput = document.getElementById('card-number');
    const cardExpiryInput = document.getElementById('card-expiry');
    const cardCvvInput = document.getElementById('card-cvv');
    const cardNameInput = document.getElementById('card-name');
    
    // Net Banking Fields
    const bankNameSelect = document.getElementById('bank-name');
    
    // Modals
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    const cancelModal = new bootstrap.Modal(document.getElementById('cancelModal'));
    const cancelSuccessModal = new bootstrap.Modal(document.getElementById('cancelSuccessModal'));
    const changePlanModal = new bootstrap.Modal(document.getElementById('changePlanModal'));
    
    // Status Display Elements
    const statusBadge = document.getElementById('status-badge');
    const statusPlan = document.getElementById('status-plan');
    const statusNextDate = document.getElementById('status-next-date');
    const statusPaymentMethod = document.getElementById('status-payment-method');
    const statusMobile = document.getElementById('status-mobile');
    
    // Current Plan Display
    const currentPlanName = document.getElementById('current-plan-name');
    const currentPlanPrice = document.getElementById('current-plan-price');
    const currentPlanValidity = document.getElementById('current-plan-validity');
    const currentPlanBenefits = document.getElementById('current-plan-benefits');
    
    // Global variables
    let selectedPaymentMethod = null;
    let autopayActive = false;
    let autopayData = null;
    
    // Sample Plans Data
    const plansData = {
        '1': {
            name: 'Basic Plan',
            price: '₹199',
            validity: '28 Days',
            benefits: 'Unlimited Calls, 1.5GB/day'
        },
        '2': {
            name: 'Unlimited 5G',
            price: '₹299',
            validity: '28 Days',
            benefits: 'Unlimited Calls, 2GB/day'
        },
        '3': {
            name: 'Premium Plan',
            price: '₹499',
            validity: '28 Days',
            benefits: 'Unlimited Calls, 3GB/day, OTT Subscriptions'
        }
    };
    
    // Check if auto pay is already set up (from localStorage)
    function checkExistingAutopay() {
        const savedAutopayData = localStorage.getItem('autopayData');
        if (savedAutopayData) {
            autopayData = JSON.parse(savedAutopayData);
            autopayActive = autopayData.status === 'active';
            
            if (autopayActive) {
                updateStatusDisplay();
                showStatusContainer();
            }
        }
    }
    
    // Initialize current plan display
    function initCurrentPlanDisplay() {
        const planData = plansData[selectedPlanId];
        
        if (currentPlanName) currentPlanName.textContent = planData.name;
        if (currentPlanPrice) currentPlanPrice.textContent = planData.price;
        if (currentPlanValidity) currentPlanValidity.textContent = planData.validity;
        if (currentPlanBenefits) currentPlanBenefits.textContent = planData.benefits;
    }
    
    // Event Listeners
    paymentMethodCards.forEach(card => {
        card.addEventListener('click', function() {
            selectPaymentMethod(this.getAttribute('data-method'));
        });
    });
    
    // Plan Selection Event Listeners
    planCards.forEach(card => {
        card.querySelector('.select-plan-btn').addEventListener('click', function() {
            const planId = card.getAttribute('data-plan-id');
            selectPlan(planId);
        });
    });
    
    // Format card number with spaces
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = '';
            
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
            
            e.target.value = formattedValue;
        });
    }
    
    // Format card expiry date
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            
            e.target.value = value;
        });
    }
    
    // Form submission
    if (autopayForm) {
        autopayForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm()) {
                setupAutopay();
            }
        });
    }
    
    // Plan change button on current plan display
    if (planChangeBtn) {
        planChangeBtn.addEventListener('click', function() {
            changePlanModal.show();
        });
    }
    
    // Plan change button on status container
    if (changePlanBtn) {
        changePlanBtn.addEventListener('click', function() {
            changePlanModal.show();
        });
    }
    
    // Confirm plan change button
    if (confirmPlanChange) {
        confirmPlanChange.addEventListener('click', function() {
            updatePlan();
            changePlanModal.hide();
        });
    }
    
    // Cancel autopay
    if (cancelAutopayBtn) {
        cancelAutopayBtn.addEventListener('click', function() {
            cancelModal.show();
        });
    }
    
    // Confirm cancel
    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', function() {
            cancelAutopay();
            cancelModal.hide();
            cancelSuccessModal.show();
        });
    }
    
    // Change payment method
    if (changePaymentBtn) {
        changePaymentBtn.addEventListener('click', function() {
            showSetupContainer();
        });
    }
    
    // Initialize the page
    initPage();
    
    // Functions
    function initPage() {
        // Initialize current plan display
        initCurrentPlanDisplay();
        
        // Check if user has existing autopay setup
        checkExistingAutopay();
        
        // Pre-fill mobile number if available
        const savedMobile = localStorage.getItem('userMobile');
        if (savedMobile && mobileNumberInput) {
            mobileNumberInput.value = savedMobile;
        }
    }
    
    function selectPaymentMethod(method) {
        // Reset all cards
        paymentMethodCards.forEach(card => {
            card.classList.remove('active');
        });
        
        // Hide all payment fields
        paymentFields.forEach(field => {
            field.classList.add('d-none');
        });
        
        // Select the clicked card
        const selectedCard = document.querySelector(`.payment-method-card[data-method="${method}"]`);
        if (selectedCard) {
            selectedCard.classList.add('active');
        }
        
        // Show the corresponding fields
        const fieldsToShow = document.getElementById(`${method}-fields`);
        if (fieldsToShow) {
            fieldsToShow.classList.remove('d-none');
        }
        
        // Show the container and set selected method
        paymentFieldsContainer.classList.remove('d-none');
        selectedPaymentMethod = method;
        
        // Hide payment method error if shown
        document.getElementById('payment-method-error').style.display = 'none';
    }
    
    function selectPlan(planId) {
        // Reset all plan cards
        planCards.forEach(card => {
            card.classList.remove('active');
            const btn = card.querySelector('.select-plan-btn');
            btn.textContent = 'Select';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-outline-primary');
        });
        
        // Select the clicked plan
        const selectedCard = document.querySelector(`.plan-card[data-plan-id="${planId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('active');
            const btn = selectedCard.querySelector('.select-plan-btn');
            btn.textContent = 'Selected';
            btn.classList.remove('btn-outline-primary');
            btn.classList.add('btn-primary');
        }
        
        selectedPlanId = planId;
    }
    
    function updatePlan() {
        // Update the current plan display with selected plan
        const planData = plansData[selectedPlanId];
        
        // Update current plan display
        if (currentPlanName) currentPlanName.textContent = planData.name;
        if (currentPlanPrice) currentPlanPrice.textContent = planData.price;
        if (currentPlanValidity) currentPlanValidity.textContent = planData.validity;
        if (currentPlanBenefits) currentPlanBenefits.textContent = planData.benefits;
        
        // If autopay is active, update it
        if (autopayActive && autopayData) {
            autopayData.plan = {
                id: selectedPlanId,
                name: planData.name,
                price: planData.price,
                validity: planData.validity,
                benefits: planData.benefits
            };
            
            localStorage.setItem('autopayData', JSON.stringify(autopayData));
            
            // Update status display
            updateStatusDisplay();
        }
    }
    
    function validateForm() {
        let isValid = true;
        
        // Validate mobile number
        if (mobileNumberInput.value.trim() === '') {
            showError(mobileNumberInput, 'mobile-number-error', 'Mobile number is required');
            isValid = false;
        } else if (!/^[6-9]\d{9}$/.test(mobileNumberInput.value)) {
            showError(mobileNumberInput, 'mobile-number-error', 'Enter a valid 10-digit mobile number');
            isValid = false;
        } else {
            hideError(mobileNumberInput, 'mobile-number-error');
        }
        
        // Validate payment method selection
        if (!selectedPaymentMethod) {
            document.getElementById('payment-method-error').style.display = 'block';
            isValid = false;
        }
        
        // Validate payment method specific fields
        if (selectedPaymentMethod) {
            switch (selectedPaymentMethod) {
                case 'upi':
                    if (!validateUpiFields()) isValid = false;
                    break;
                case 'card':
                    if (!validateCardFields()) isValid = false;
                    break;
                case 'netbanking':
                    if (!validateNetBankingFields()) isValid = false;
                    break;
            }
        }
        
        // Validate terms checkbox
        if (!termsCheckbox.checked) {
            showError(termsCheckbox, 'terms-checkbox-error', 'You must agree to the terms');
            isValid = false;
        } else {
            hideError(termsCheckbox, 'terms-checkbox-error');
        }
        
        return isValid;
    }
    
    function validateUpiFields() {
        let isValid = true;
        
        // Validate UPI ID
        if (upiIdInput.value.trim() === '') {
            showError(upiIdInput, 'upi-id-error', 'UPI ID is required');
            isValid = false;
        } else if (!/^[a-zA-Z0-9.]{3,}@[a-zA-Z]{3,}$/.test(upiIdInput.value)) {
            showError(upiIdInput, 'upi-id-error', 'Enter a valid UPI ID');
            isValid = false;
        } else {
            hideError(upiIdInput, 'upi-id-error');
        }
        
        return isValid;
    }
    
    function validateCardFields() {
        let isValid = true;
        
        // Validate card number
        const cardNumberValue = cardNumberInput.value.replace(/\s+/g, '');
        if (cardNumberValue === '') {
            showError(cardNumberInput, 'card-number-error', 'Card number is required');
            isValid = false;
        } else if (cardNumberValue.length !== 16 || !/^\d+$/.test(cardNumberValue)) {
            showError(cardNumberInput, 'card-number-error', 'Enter a valid 16-digit card number');
            isValid = false;
        } else {
            hideError(cardNumberInput, 'card-number-error');
        }
        
        // Validate card expiry
        if (cardExpiryInput.value === '') {
            showError(cardExpiryInput, 'card-expiry-error', 'Expiry date is required');
            isValid = false;
        } else if (!/^\d{2}\/\d{2}$/.test(cardExpiryInput.value)) {
            showError(cardExpiryInput, 'card-expiry-error', 'Enter a valid date (MM/YY)');
            isValid = false;
        } else {
            // Check if date is valid and not expired
            const [month, year] = cardExpiryInput.value.split('/');
            const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
            const now = new Date();
            
            if (expiry < now) {
                showError(cardExpiryInput, 'card-expiry-error', 'Card has expired');
                isValid = false;
            } else {
                hideError(cardExpiryInput, 'card-expiry-error');
            }
        }
        
        // Validate CVV
        if (cardCvvInput.value === '') {
            showError(cardCvvInput, 'card-cvv-error', 'CVV is required');
            isValid = false;
        } else if (!/^\d{3}$/.test(cardCvvInput.value)) {
            showError(cardCvvInput, 'card-cvv-error', 'Enter a valid 3-digit CVV');
            isValid = false;
        } else {
            hideError(cardCvvInput, 'card-cvv-error');
        }
        
        // Validate name on card
        if (cardNameInput.value.trim() === '') {
            showError(cardNameInput, 'card-name-error', 'Name is required');
            isValid = false;
        } else if (cardNameInput.value.trim().length < 3) {
            showError(cardNameInput, 'card-name-error', 'Enter a valid name');
            isValid = false;
        } else {
            hideError(cardNameInput, 'card-name-error');
        }
        
        return isValid;
    }
    
    function validateNetBankingFields() {
        let isValid = true;
        
        // Validate bank selection
        if (bankNameSelect.value === '') {
            showError(bankNameSelect, 'bank-name-error', 'Please select your bank');
            isValid = false;
        } else {
            hideError(bankNameSelect, 'bank-name-error');
        }
        
        return isValid;
    }
    
    function showError(inputElement, errorId, message) {
        inputElement.classList.add('is-invalid');
        document.getElementById(errorId).innerText = message;
        document.getElementById(errorId).style.display = 'block';
    }
    
    function hideError(inputElement, errorId) {
        inputElement.classList.remove('is-invalid');
        document.getElementById(errorId).style.display = 'none';
    }
    
    function setupAutopay() {
        // Get form values
        const mobileNumber = mobileNumberInput.value;
        
        // Get current plan data
        const planData = plansData[selectedPlanId];
        
        // Calculate next recharge date based on plan validity
        const nextRechargeDate = calculateNextRechargeDate(planData.validity);
        
        // Get payment method details
        let paymentMethodDetails = getPaymentMethodDetails();
        
        // Create autopay data object
        autopayData = {
            mobile: mobileNumber,
            plan: {
                id: selectedPlanId,
                name: planData.name,
                price: planData.price,
                validity: planData.validity,
                benefits: planData.benefits
            },
            nextDate: nextRechargeDate,
            paymentMethod: selectedPaymentMethod,
            paymentDetails: paymentMethodDetails,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem('autopayData', JSON.stringify(autopayData));
        localStorage.setItem('userMobile', mobileNumber);
        
        // Set global flag
        autopayActive = true;
        
        // Show success modal
        successModal.show();
        
        // When modal is hidden, update display
        document.getElementById('successModal').addEventListener('hidden.bs.modal', function () {
            updateStatusDisplay();
            showStatusContainer();
        });
    }
    
    function getPaymentMethodDetails() {
        switch (selectedPaymentMethod) {
            case 'upi':
                return {
                    upiId: upiIdInput.value,
                    displayInfo: upiIdInput.value
                };
            case 'card':
                const cardNumber = cardNumberInput.value.replace(/\s+/g, '');
                const maskedNumber = 'XXXX XXXX XXXX ' + cardNumber.slice(-4);
                return {
                    cardNumber: cardNumber,
                    expiry: cardExpiryInput.value,
                    name: cardNameInput.value,
                    displayInfo: maskedNumber
                };
            case 'netbanking':
                const bankName = bankNameSelect.options[bankNameSelect.selectedIndex].text;
                return {
                    bank: bankNameSelect.value,
                    bankName: bankName,
                    displayInfo: bankName
                };
            default:
                return {};
        }
    }
    
    function calculateNextRechargeDate(validity) {
        const today = new Date();
        let nextDate = new Date(today);
        
        // Extract number of days from validity (e.g. "28 Days" -> 28)
        const days = parseInt(validity.match(/\d+/)[0]);
        nextDate.setDate(today.getDate() + days);
        
        return nextDate.toISOString();
    }
    
    function updateStatusDisplay() {
        if (!autopayData) return;
        
        // Update status badge
        if (autopayData.status === 'active') {
            statusBadge.textContent = 'Active';
            statusBadge.className = 'badge bg-success';
        } else {
            statusBadge.textContent = 'Cancelled';
            statusBadge.className = 'badge bg-danger';
        }
        
        // Update other details
        statusPlan.textContent = `${autopayData.plan.name} (${autopayData.plan.price})`;
        
        const nextDate = new Date(autopayData.nextDate);
        statusNextDate.textContent = formatDate(nextDate);
        
        statusPaymentMethod.textContent = autopayData.paymentDetails.displayInfo;
        statusMobile.textContent = autopayData.mobile;
    }
    
    function showStatusContainer() {
        autopaySetupContainer.classList.add('d-none');
        autopayStatusContainer.classList.remove('d-none');
        
        // Add animate.css classes for animation
        autopayStatusContainer.classList.add('animate__animated', 'animate__fadeIn');
    }
    
    function showSetupContainer() {
        autopayStatusContainer.classList.add('d-none');
        autopaySetupContainer.classList.remove('d-none');
        
        // Add animate.css classes for animation
        autopaySetupContainer.classList.add('animate__animated', 'animate__fadeIn');
        
        // Reset the form
        if (autopayForm) {
            autopayForm.reset();
            
            // Pre-fill mobile number
            if (autopayData && autopayData.mobile) {
                mobileNumberInput.value = autopayData.mobile;
            }
            
            // Reset selected payment method
            paymentMethodCards.forEach(card => {
                card.classList.remove('active');
            });
            
            paymentFields.forEach(field => {
                field.classList.add('d-none');
            });
            
            paymentFieldsContainer.classList.add('d-none');
            selectedPaymentMethod = null;
        }
    }
    
    function cancelAutopay() {
        // Update autopay status to cancelled
        if (autopayData) {
            autopayData.status = 'cancelled';
            localStorage.setItem('autopayData', JSON.stringify(autopayData));
        }
        
        // Update UI
        updateStatusDisplay();
    }
    
    function formatDate(date) {
        const day = date.getDate();
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        
        return `${day} ${month} ${year}`;
    }
});