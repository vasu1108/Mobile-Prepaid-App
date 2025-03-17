document.addEventListener("DOMContentLoaded", function () {
    let template = document.querySelector("#row .col").outerHTML;
    for (let i = 1; i < 3; i++) {
      document.getElementById("row").innerHTML += template;
    }
  });

//   document.addEventListener("DOMContentLoaded", function () {
//   const loginLink = document.querySelector(".nav-link.text-danger"); // Selects the "Sign In" link
//   const isLoggedIn = localStorage.getItem("isLoggedIn");

//   if (isLoggedIn) {
//       loginLink.textContent = "My account";  
//       loginLink.href = "Account.html";  
//   } else {
//       loginLink.textContent = "Sign In";  
//       loginLink.href = "login.html";  
//   }
// })


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







let selectedPlan = null;
let modal, modal1;

document.addEventListener('DOMContentLoaded', function() {
    modal = new bootstrap.Modal(document.getElementById('rechargeModal'));
    modal1 = new bootstrap.Modal(document.getElementById('rechargeModal1'));
    displayPlans();
});



const popularPlans = [
    { cost: "349", validity: "28 Days", data: "1.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "3 months of Jio Hotstar mobile" },
    { cost: "399", validity: "56 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "3 months of Jio Hotstar mobile" },
    { cost: "399", validity: "56 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "3 months of Jio Hotstar mobile" },
    { cost: "399", validity: "56 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "3 months of Jio Hotstar mobile" },
];

function displayPlans() {
    const container = document.getElementById('plansContainer');
    container.innerHTML = '';

    popularPlans.forEach((plan, index) => {
        const planHTML = `
            <div class="col-12 col-md-6">
                <div class="card shadow-sm rounded-4 p-4">
                    ${plan.benefits?.includes('Hotstar') ? '<div class="plan-badge">Premium Pack - Jio Hotstar</div>' : ''}
                    <div class="plan-card">
                        <div class="card-header-content d-flex justify-content-between align-items-center mb-4">
                            <div class="price-info">
                                <div class="price">
                                    <span class="fs-5">₹</span>
                                    <span class="fs-2 fw-bold">${plan.cost}</span>
                                </div>
                                <div class="text-center">
                                    <div class="fw-bold">${plan.data}</div>
                                    <small class="text-muted">data</small>
                                </div>
                                <div class="text-center">
                                    <div class="fw-bold">${plan.validity}</div>
                                    <small class="text-muted">validity</small>
                                </div>
                            </div>
                            <button class="buy-button" onclick="handleBuyClick(${index})">Buy</button>
                        </div>
                        <hr>
                        <div class="feature-item mt-4">
                            ${plan.benefits ? `<p class="mb-2">${plan.benefits}</p>` : ''}
                            <small class="text-muted">${plan.calls} calls + ${plan.sms}</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += planHTML;
    });
}

function handleBuyClick(index) {
    selectedPlan = popularPlans[index];
    showPlanDetails();

    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn) {
        modal1.show();
    } else {
        modal.show();
    }
}

// Mobile number validation for first modal
const mobileInput = document.getElementById('mobileNumber');
const proceedBtn = document.getElementById('proceedBtn');



function showPlanDetails() {
    if (selectedPlan) {
        document.querySelectorAll('#selectedPlanInfo').forEach(element => {
            element.innerHTML = `
                <div class="fw-bold mb-2">Selected Plan</div>
                <div class="small">
                    <p class="mb-1 fw-bold">₹${selectedPlan.cost}</p>
                    <p class="mb-1">${selectedPlan.validity}</p>
                    <p class="mb-1">Data: ${selectedPlan.data}</p>
                    <p class="mb-1">Calls: ${selectedPlan.calss}</p>
                    <p class="mb-1">SMS: ${selectedPlan.sms}</p>
                    ${selectedPlan.benefits ? 
                        `<p class="text-success mb-0">${selectedPlan.benefits}</p>` : ''}
                </div>
            `;
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    displayPlans();
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

// const validateMobile = input => { 
//     input.value = input.value.replace(/\D/g, ''); // Remove non-numeric characters
//     document.getElementById('submitButton').disabled = input.value.length !== 10;
// };


const validateMobile = input => { 
    input.value = input.value.replace(/\D/g, ''); // Allow only numbers
    const button = document.getElementById('submitButton');
    const link = document.getElementById('submitLink');

    button.disabled = input.value.length !== 10;
    
    if (button.disabled) {
        link.removeAttribute("href"); // Prevents navigation
    } else {
        link.setAttribute("href", "prepaid plans.html"); // Allows navigation
    }
};



function logout() {
    localStorage.removeItem("isLoggedIn"); // Remove login status
    window.location.href = "index.html"; // Redirect to login page
}