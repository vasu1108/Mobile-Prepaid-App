document.addEventListener("DOMContentLoaded", function () {
    // Setup FAQ interaction
    document.querySelectorAll(".faq-item").forEach(item => {
        item.addEventListener("click", function () {
            this.classList.toggle("active");
        });
    });

    // Show/hide login elements based on login status
    const signInLink = document.querySelector(".nav-link.text-danger");
    const profileIcon = document.querySelector(".profile-icon");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
        if (signInLink) signInLink.style.display = "none";
        if (profileIcon) profileIcon.style.display = "inline-block";
    } else {
        if (signInLink) signInLink.style.display = "inline-block";
        if (profileIcon) profileIcon.style.display = "none";
    }

    // Initialize modals
    const rechargeModal = new bootstrap.Modal(document.getElementById('rechargeModal'));
    const rechargeModalLoggedIn = new bootstrap.Modal(document.getElementById('rechargeModal1'));
    const ottDetailsModal = new bootstrap.Modal(document.getElementById('ottDetailsModal'));
    let selectedPlan = null;

    // Fetch plans for the initially active category
    const activeTab = document.querySelector('.nav-link.active');
    if (activeTab) {
        const initialCategory = activeTab.getAttribute('data-category');
        fetchPlansByCategory(initialCategory);
    }

    // Set up category tab clicks
    document.querySelectorAll('#category .nav-link').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            document.querySelectorAll('#category .nav-link').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Fetch and display plans for the selected category
            fetchPlansByCategory(category);
        });
    });

    // Mobile number validation for recharge modal
    const mobileInput = document.getElementById('mobileNumber');
    const proceedBtn = document.getElementById('proceedBtn');
    
    if (mobileInput && proceedBtn) {
        mobileInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, ''); // Allow only numbers
            proceedBtn.disabled = this.value.length !== 10;
        });

        proceedBtn.addEventListener('click', async function() {
            if (mobileInput.value.length === 10) {
                const mobileNumber = mobileInput.value;
                
                try {
                    // Fetch user details for the entered mobile number
                    const response = await fetch(`http://localhost:8083/users/mobile/${mobileNumber}`);
                    
                    if (response.ok) {
                        const userData = await response.json();
                        
                        // Store user data in localStorage without setting isLoggedIn to true
                        localStorage.setItem("currentUserDetails", JSON.stringify(userData));
                        
                        // Store mobile number for payment page
                        localStorage.setItem('mobileNumber', mobileNumber);
                        
                        // Store selected plan
                        if (selectedPlan) {
                            localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));
                        }
                        
                        // Redirect to payment page
                        window.location.href = "payment.html";
                    } else {
                        // If user not found, show an alert and do not proceed
                        alert("Not a registered mobile number. Please register first or use a different number.");
                        // No redirection or storage happens here
                    }
                } catch (error) {
                    console.error('Error fetching user details:', error);
                    // Show alert for the error case as well
                    alert("Error checking mobile number. Please try again later.");
                    // No redirection or storage happens here
                }
                
                rechargeModal.hide();
                mobileInput.value = '';
                proceedBtn.disabled = true;
            }
        });
    }

    // Setup recharge now button for logged-in users
    const rechargeNowBtn = document.querySelector('#rechargeModal1 .btn-danger');
    if (rechargeNowBtn) {
        rechargeNowBtn.addEventListener('click', function() {
            if (selectedPlan) {
                // Store selected plan details
                localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));
                
                // If user is logged in, we already have their details
                const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
                
                if (userDetails && userDetails.mobile) {
                    // Store mobile number for payment page
                    localStorage.setItem('mobileNumber', userDetails.mobile);
                }
                
                // Redirect to payment page
                window.location.href = "payment.html";
            }
        });
    }

    // Fetch plans by category - UPDATED to use the new endpoint
    async function fetchPlansByCategory(category) {
        try {
            // Display loading indicator
            const container = document.getElementById('plansContainer');
            container.innerHTML = `
                <div class="col-12 text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading plans...</p>
                </div>
            `;
            
            // Use the new endpoint
            const url = `http://localhost:8083/plans/active-by-category?category=${encodeURIComponent(category)}`;
            
            console.log('Fetching plans from:', url);
            
            const response = await fetch(url);
            
            // Debug the response
            console.log('API response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch plans: ${response.status} ${response.statusText}`);
            }
            
            const plans = await response.json();
            console.log('Fetched plans:', plans);
            
            if (!plans || plans.length === 0) {
                container.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-info">
                            No plans available in this category.
                        </div>
                    </div>
                `;
                return;
            }
            
            // Display the fetched plans
            displayPlans(plans);
        } catch (error) {
            console.error('Error fetching plans:', error);
            
            // Display error message in plans container
            const container = document.getElementById('plansContainer');
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        Failed to load plans. Please try again later. (Error: ${error.message})
                    </div>
                </div>
            `;
        }
    }

    // Display plans directly without categorization (since we're fetching by category)
    function displayPlans(plans) {
        const container = document.getElementById('plansContainer');
        container.innerHTML = '';
        
        // Display each plan
        plans.forEach((plan, index) => {
            const card = document.createElement('div');
            card.className = 'col-12 col-md-6 col-lg-4 mb-4';
            
            // Determine if plan has multiple OTT services
            const ottServices = plan.ottBenefits || [];
            const hasMultipleOtt = ottServices.length > 1;
            const ottBadge = hasMultipleOtt ? `+${ottServices.length - 1}` : '';
            
            // Get primary OTT service for badge display
            let badgeText = '';
            let primaryOttImage = '';
            let primaryOttName = '';
            let ottPlanInfo = '';
            
            if (ottServices.length > 0) {
                const primaryOtt = ottServices[0].ottPlan.ottProvider;
                primaryOttName = primaryOtt.ottName;
                badgeText = `Premium Pack - Includes ${primaryOttName}`;
                primaryOttImage = getOttIconPath(primaryOttName);
                ottPlanInfo = `${ottServices[0].ottPlan.ottPlanName} - ${ottServices[0].ottPlan.ottValidityMonths} month(s)`;
            }
            
            card.innerHTML = `
                <div class="card shadow-sm p-4 plan-card">
                    ${badgeText ? `<div class="plan-badge">${badgeText}</div>` : ''}
                    <div>
                        <div class="card-header-content d-flex justify-content-between align-items-center mb-3">
                            <div class="price">
                                <span class="fs-5 me-1">₹</span>
                                <span class="fs-2 fw-bold">${plan.planPrice}</span>
                            </div>
                            <div class="data-validity-info">
                                <div class="info-block">
                                    <span class="info-value">${plan.dataLimit}</span>
                                    <small class="info-label">data</small>
                                </div>
                                <div class="info-block">
                                    <span class="info-value">${plan.validityDays}</span>
                                    <small class="info-label">days</small>
                                </div>
                            </div>
                            <div class="ms-auto">
                                <button class="buy-button" data-plan-index="${index}">buy</button>
                            </div>
                        </div>
                        <hr class="card-divider">
                        <div class="mt-3">
                            ${ottServices.length > 0 ? 
                                `<div class="ott-service-info">
                                    <div class="ott-icons-container position-relative">
                                        <img src="${primaryOttImage}" width="36" height="36" alt="${primaryOttName}" class="img-fluid rounded">
                                        ${ottBadge ? `<span class="ott-badge" data-plan-index="${index}">${ottBadge}</span>` : ''}
                                    </div>
                                    <div class="ott-plan-details">
                                        ${ottPlanInfo}
                                    </div>
                                </div>` 
                            : ''}
                            <div class="call-sms-info mt-2">
                                ${plan.callLimit} + ${plan.smsLimit}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        });
        
        // Attach event listeners to buy buttons
        document.querySelectorAll('.buy-button').forEach((button, index) => {
            button.addEventListener('click', function() {
                handleBuyClick(plans[index]);
            });
        });
        
        // Attach event listeners to OTT badges
        document.querySelectorAll('.ott-badge').forEach((badge) => {
            badge.addEventListener('click', function(e) {
                e.stopPropagation();
                const planIndex = this.getAttribute('data-plan-index');
                showOttDetailsModal(plans[planIndex]);
            });
        });
    }

    // Handle buy button click
    function handleBuyClick(plan) {
        selectedPlan = plan;
        showPlanDetails();
        
        if (isLoggedIn) {
            // For logged-in users, show confirmation modal
            rechargeModalLoggedIn.show();
        } else {
            // For non-logged-in users, show mobile number input modal
            rechargeModal.show();
        }
    }

    // Show OTT details modal
    function showOttDetailsModal(plan) {
        const modalContent = document.getElementById('ottDetailsContent');
        const ottServices = plan.ottBenefits || [];
        
        let ottContent = '';
        ottServices.forEach(benefit => {
            const ott = benefit.ottPlan;
            const ottProvider = ott.ottProvider;
            
            ottContent += `
                <div class="d-flex align-items-center mb-3">
                    <img src="${getOttIconPath(ottProvider.ottName)}" width="40" height="40" alt="${ottProvider.ottName}" class="me-3">
                    <div>
                        <h5 class="mb-1">${ottProvider.ottName}</h5>
                        <p class="mb-0 text-muted">${ott.ottPlanName} Plan</p>
                        <p class="mb-0 small">Duration: ${ott.ottValidityMonths} month(s)</p>
                    </div>
                </div>
            `;
        });
        
        modalContent.innerHTML = ottContent || '<p>No OTT services available with this plan.</p>';
        ottDetailsModal.show();
    }

    // Get OTT icon path based on name
    function getOttIconPath(ottName) {
        const ottIcons = {
            'Netflix': './assets/netflixbasic (1).svg',
            'Prime Video': './assets/amazonprime.svg',
            'Jio Hotstar': './assets/Hotstar (1).svg',
            'Disney+': './assets/download.jpg'
        };
        
        return ottIcons[ottName] || 'placeholder.svg';
    }

    // Show selected plan details in recharge modal
    function showPlanDetails() {
        if (!selectedPlan) return;
        
        const ottServices = selectedPlan.ottBenefits || [];
        let ottContent = '';
        
        if (ottServices.length > 0) {
            const primaryOtt = ottServices[0].ottPlan.ottProvider;
            const benefitImg = getOttIconPath(primaryOtt.ottName);
            
            ottContent = `
                <div class="d-flex align-items-center mt-2 mb-0">
                    <img src="${benefitImg}" width="40" height="40" alt="${primaryOtt.ottName}" class="me-2">
                    <div>
                        <p class="text-success fs-6 mb-0">${ottServices.length > 1 ? 'Multiple OTT Subscriptions' : primaryOtt.ottName}</p>
                        ${ottServices.length > 1 ? `<small class="text-muted">(${ottServices.length} services included)</small>` : 
                        `<small class="text-muted">${ottServices[0].ottPlan.ottPlanName} - ${ottServices[0].ottPlan.ottValidityMonths} month(s)</small>`}
                    </div>
                </div>
            `;
        }
        
        document.querySelectorAll('#selectedPlanInfo').forEach(element => {
            element.innerHTML = `
                <div class="fw-bold fs-5 mb-2">Selected Plan</div>
                <div class="small d-flex flex-column gap-2">
                    <p class="mb-1 fs-6 fw-bold">
                        <i class="bi bi-currency-rupee text-secondary"></i> ${selectedPlan.planPrice}
                    </p>
                    <p class="mb-1 fs-6">
                        <i class="bi bi-calendar-check text-secondary"></i> ${selectedPlan.validityDays} Days
                    </p>
                    <p class="mb-1 fs-6">
                        <i class="bi bi-wifi text-secondary"></i> Data: ${selectedPlan.dataLimit}
                    </p>
                    <p class="mb-1 fs-6">
                        <i class="bi bi-telephone text-secondary"></i> Calls: ${selectedPlan.callLimit}
                    </p>
                    <p class="mb-1 fs-6">
                        <i class="bi bi-chat-dots text-secondary"></i> SMS: ${selectedPlan.smsLimit}
                    </p>
                    ${ottContent}
                </div>
            `;
        });
    }
});

// Handle navigation links properly
document.addEventListener("DOMContentLoaded", function() {
    // Add click handlers only to the main navigation links, not the category tabs
    document.querySelectorAll(".navbar-nav .nav-link").forEach(link => {
        link.addEventListener("click", function() {
            // Get the href attribute
            const href = this.getAttribute("href");
            
            // If it's a valid URL and not a tab or toggle
            if (href && href !== "#" && !href.startsWith('#')) {
                window.location.href = href; // Navigate to the page
            }
            // We're not preventing default for actual navigation links
        });
    });
});

// Logout function
function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userDetails");
    localStorage.removeItem("currentUserDetails");
    window.location.href = "index.html";
}