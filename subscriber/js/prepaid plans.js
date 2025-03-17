document.addEventListener("DOMContentLoaded", function () {
    const loginLink = document.querySelector(".nav-link.text-danger"); // Selects the "Sign In" link
    const isLoggedIn = localStorage.getItem("isLoggedIn");
  
    
  })
  
//   document.addEventListener("DOMContentLoaded", function () {
//     document.querySelectorAll(".faq-item").forEach(item => {
//         item.addEventListener("click", function () {
//             let answer = this.querySelector(".faq-answer");
//             let icon = this.querySelector(".faq-icon");

//             if (answer.style.display === "block") {
//                 answer.style.display = "none";
//                 icon.textContent = "+";
//             } else {
//                 answer.style.display = "block";
//                 icon.textContent = "-";
//             }
//         });
//     });
// });

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".faq-item").forEach(item => {
        item.addEventListener("click", function () {
            this.classList.toggle("active");
        });
    });
});

let selectedPlan = null;
const modal = new bootstrap.Modal(document.getElementById('rechargeModal'));
const modal1 = new bootstrap.Modal(document.getElementById('rechargeModal1'));
const data = '349'
const plansData = {
    "Popular": [
        { cost: `${data}`, validity: "28 Days", data: "1.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "3 months of Jio Hotstar mobile" },
        { cost: "399", validity: "56 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "3 months of Jio Hotstar mobile" },
        { cost: "399", validity: "56 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "3 months of Jio Hotstar mobile" },
        { cost: "399", validity: "56 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "3 months of Jio Hotstar mobile" },
        { cost: "399", validity: "56 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "3 months of Jio Hotstar mobile" },
        { cost: "399", validity: "56 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "3 months of Jio Hotstar mobile" }
    ],
    "Validity": [
        { cost: "599", validity: "84 Days", data: "1.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "599", validity: "84 Days", data: "1.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "599", validity: "84 Days", data: "1.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "599", validity: "84 Days", data: "1.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "599", validity: "84 Days", data: "1.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "699", validity: "90 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited" }
    ],
    "Unlimited": [
        { cost: "999", validity: "70 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "999", validity: "70 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "999", validity: "70 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "999", validity: "70 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "999", validity: "70 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "1199", validity: "84 Days", data: "3 GB/Day", sms: "100 SMS/day", calls: "Unlimited" }
    ],
    "OTT": [
        { cost: "899", validity: "90 Days", data: "2.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "Jio Hotstar" },
        { cost: "899", validity: "90 Days", data: "2.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "Jio Hotstar" },
        { cost: "899", validity: "90 Days", data: "2.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "Jio Hotstar" },
        { cost: "899", validity: "90 Days", data: "2.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "Jio Hotstar" },
        { cost: "1499", validity: "84 Days", data: "3 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "1 Year of Netflix" },
        { cost: "1499", validity: "84 Days", data: "3 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "1 Year of Netflix" }
    ],
    "Combo/Validity": [
        { cost: "499", validity: "56 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "499", validity: "56 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "499", validity: "56 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "499", validity: "56 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "499", validity: "56 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "799", validity: "84 Days", data: "1.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited" }
    ],
    "Data": [
        { cost: "299", validity: "28 Days", data: "4 GB", sms: "Existing Pack", calls: "Existing Pack" },
        { cost: "299", validity: "28 Days", data: "4 GB", sms: "Existing Pack", calls: "Existing Pack" },
        { cost: "299", validity: "28 Days", data: "4 GB", sms: "Existing Pack", calls: "Existing Pack" },
        { cost: "299", validity: "28 Days", data: "4 GB", sms: "Existing Pack", calls: "Existing Pack" },
        { cost: "299", validity: "28 Days", data: "4 GB", sms: "Existing Pack", calls: "Existing Pack" },
        { cost: "199", validity: "28 Days", data: "2 GB", sms: "Existing Pack", calls: "Existing Pack" }
    ],
    "Others": [
        {cost: "1499", validity: "84 Days", data: "3 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "1 Year of Netflix" },
        { cost: "1499", validity: "84 Days", data: "3 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "1 Year of Netflix" }],
    "Top Up": [
        { cost: "100", validity: "Unlimited", data: "No Data", sms: "No SMS", calls: "₹81.75 Talktime" },
        { cost: "100", validity: "Unlimited", data: "No Data", sms: "No SMS", calls: "₹81.75 Talktime" },
        { cost: "100", validity: "Unlimited", data: "No Data", sms: "No SMS", calls: "₹81.75 Talktime" },
        { cost: "100", validity: "Unlimited", data: "No Data", sms: "No SMS", calls: "₹81.75 Talktime" },
        { cost: "100", validity: "Unlimited", data: "No Data", sms: "No SMS", calls: "₹81.75 Talktime" },
        { cost: "50", validity: "Unlimited", data: "No Data", sms: "No SMS", calls: "₹39.37 Talktime" }
    ]
};

function displayPlans(category) {
    const container = document.getElementById('plansContainer');
    container.innerHTML = '';

    plansData[category]?.forEach((plan, index) => {
        const card = document.createElement('div');
        card.className = 'col-12 col-md-6';

        let badgeText = '';
        let imgSrc = '';

        if (plan.benefits?.includes('Hotstar')) {
            badgeText = 'Premium Pack - Includes Hotstar';
            imgSrc = 'Hotstar (1).svg';
        } else if (plan.benefits?.includes('Netflix')) {
            badgeText = 'Premium Pack - Includes Netflix';
            imgSrc = 'netflixbasic.svg';
        }

        card.innerHTML = `
            <div class="card shadow-sm rounded-4 p-4">
                ${badgeText ? `<div class="plan-badge">${badgeText}</div>` : ''}
                <div class="plan-card">
                    <div class="card-header-content d-flex justify-content-between align-items-center mb-4">
                        <div class="price-info">
                            <div class="price">
                                <span class="fs-5">₹</span>
                                <span class="fs-2 fw-bold">${plan.cost}</span>
                            </div>
                            <div class="text-center">
                                <div class="d-flex align-items-center">
                                    <span class="fw-bold">${plan.data}</span>
                                </div>
                                <small class="text-muted">data</small>
                            </div>
                            <div class="text-center">
                                <div class="d-flex align-items-center">
                                    <span class="fw-bold">${plan.validity}</span>
                                </div>
                                <small class="text-muted">validity</small>
                            </div>
                        </div>
                        <div class="buy-button-container">
                            <button class="buy-button" id="buy-btn-${index}">buy</button>
                        </div>
                    </div>
                    <hr>
                    ${plan.benefits ? 
                        `<div class="feature-item mt-4">
                            ${imgSrc ? `<div><img src="${imgSrc}" width="40" height="40" alt="Benefit Image" class="img-fluid"></div>` : ''}
                            <div>
                                <p class="mb-2">${plan.benefits}</p>
                                <small class="text-muted">
                                    ${plan.calls} calls + ${plan.sms}<span class="text-decoration-underline" style="cursor: pointer;"></span>
                                </small>
                            </div>
                        </div>` : 
                        `<div class="feature-item mt-4">
                            <small class="text-muted">
                                ${plan.calls} calls + ${plan.sms}<span class="text-decoration-underline" style="cursor: pointer;"></span>
                            </small>
                        </div>`
                    }
                </div>
            </div>
        `;

        container.appendChild(card);

        // Attach event listener to the buy button
        document.getElementById(`buy-btn-${index}`).addEventListener('click', () => handleBuyClick(category, index));
    });
}


function handleBuyClick(category, index) {
    selectedPlan = plansData[category][index];
    showPlanDetails();
    
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn) {
        modal1.show();
    } else {
        modal.show();
    }
}

function showPlanDetails() {
    if (selectedPlan) {
        let benefitImg = '';

        // Assign benefit image based on selected plan
        if (selectedPlan.benefits?.includes('Hotstar')) {
            benefitImg = 'Hotstar (1).svg';
        } else if (selectedPlan.benefits?.includes('Netflix')) {
            benefitImg = 'Netflix.svg';
        }

        document.querySelectorAll('#selectedPlanInfo').forEach(element => {
            element.innerHTML = `
                <div class="fw-bold fs-5 mb-2">Selected Plan</div>
                <div class="small d-flex flex-column gap-2">
                    <p class="mb-1 fs-6 fw-bold">
                        <i class="bi bi-currency-rupee text-secondary"></i> ${selectedPlan.cost}
                    </p>
                    <p class="mb-1 fs-6">
                        <i class="bi bi-calendar-check text-secondary"></i> ${selectedPlan.validity}
                    </p>
                    <p class="mb-1 fs-6">
                        <i class="bi bi-wifi text-secondary"></i> Data: ${selectedPlan.data}
                    </p>
                    <p class="mb-1 fs-6">
                        <i class="bi bi-telephone text-secondary"></i> Calls: ${selectedPlan.calls}
                    </p>
                    <p class="mb-1 fs-6">
                        <i class="bi bi-chat-dots text-secondary"></i> SMS: ${selectedPlan.sms}
                    </p>
                    ${selectedPlan.benefits ? 
                        `<div class="d-flex align-items-center mt-2 mb-0">
                            ${benefitImg ? `<img src="${benefitImg}" width="40" height="40" alt="Benefit Image" class="me-2">` : ''}
                            <p class="text-success fs-6 mb-0">${selectedPlan.benefits}</p>
                        </div>` 
                    : ''}
                </div>
            `;
        });
    }
}



document.addEventListener('DOMContentLoaded', function() {
    // Initialize with Popular plans
    displayPlans('Popular');
    
    // Set up category tab clicks
    document.querySelectorAll('.nav-link').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            if (category && plansData[category]) {
                document.querySelectorAll('.nav-link').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                displayPlans(category);
            }
        });
    });

    // Mobile number validation for first modal
    const mobileInput = document.getElementById('mobileNumber');
    const proceedBtn = document.getElementById('proceedBtn');
    
    
});

document.addEventListener('DOMContentLoaded', function() {
    const mobileInput = document.getElementById('mobileNumber');
    const proceedBtn = document.getElementById('proceedBtn');

    if (mobileInput && proceedBtn) {
        mobileInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, ''); // Allow only numbers
            proceedBtn.disabled = this.value.length !== 10;
        });

        proceedBtn.addEventListener('click', function() {
            if (mobileInput.value.length === 10) {
                modal.hide();
                mobileInput.value = '';
                proceedBtn.disabled = true;
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".navbar-nav .nav-link").forEach(link => {
        link.addEventListener("click", function (event) {
            event.stopPropagation(); // Prevent interference from other event listeners
            event.preventDefault(); // Prevent unwanted default behavior

            let target = this.getAttribute("href");
            if (target && target !== "#") {
                window.location.href = target; // Force navigation
            }
        });
    });
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

    document.getElementById('proceedBtn').addEventListener('click', function() {
        const mobileNumberInput = document.getElementById('mobileNumber').value;
        const mobileNumber = mobileNumberInput ? mobileNumberInput : '+91 9876543210'; // Default if empty
    
        // Store mobile number
        localStorage.setItem('mobileNumber', mobileNumber);
    
        // Store selected plan details
        if (selectedPlan) {
            localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));
        }
    });
    
});

function logout() {
    localStorage.removeItem("isLoggedIn"); // Remove login status
    window.location.href = "index.html"; // Redirect to login page
}