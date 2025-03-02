const plansData = {
    "Popular": [
        { cost: "299", validity: "28 Days", data: "1.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "Netflix" },
        { cost: "399", validity: "56 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "Disney+ Hotstar" },
        { cost: "199", validity: "24 Days", data: "1 GB/Day", sms: "50 SMS/day", calls: "Unlimited", benefits: "None" },
        { cost: "599", validity: "84 Days", data: "1.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "Amazon Prime" },
        { cost: "699", validity: "90 Days", data: "2.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "Netflix & Hotstar" },
        { cost: "999", validity: "120 Days", data: "3 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "Amazon Prime & Disney+" },
        { cost: "149", validity: "14 Days", data: "1 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "None" },
        { cost: "849", validity: "180 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "Netflix" }
    ],
    "Validity": [
        { cost: "599", validity: "84 Days", data: "1.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "799", validity: "120 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "999", validity: "150 Days", data: "2.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "1299", validity: "180 Days", data: "3 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "1599", validity: "210 Days", data: "3.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "1999", validity: "240 Days", data: "4 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "2499", validity: "300 Days", data: "4.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "2999", validity: "365 Days", data: "5 GB/Day", sms: "100 SMS/day", calls: "Unlimited" }
    ],
    "Unlimited": [
        { cost: "999", validity: "70 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "1199", validity: "90 Days", data: "2.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "1399", validity: "120 Days", data: "3 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "1599", validity: "150 Days", data: "3.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "1799", validity: "180 Days", data: "4 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "1999", validity: "200 Days", data: "4.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "2499", validity: "240 Days", data: "5 GB/Day", sms: "100 SMS/day", calls: "Unlimited" },
        { cost: "2999", validity: "365 Days", data: "6 GB/Day", sms: "100 SMS/day", calls: "Unlimited" }
    ],
    "OTT": [
        { cost: "349", validity: "28 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "Netflix" },
        { cost: "499", validity: "56 Days", data: "2.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "Disney+ Hotstar" },
        { cost: "649", validity: "70 Days", data: "3 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "Amazon Prime" },
        { cost: "799", validity: "84 Days", data: "3.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "Netflix & Disney+" },
        { cost: "999", validity: "120 Days", data: "4 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "Amazon Prime & Hotstar" },
        { cost: "1299", validity: "150 Days", data: "4.5 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "Netflix, Prime & Disney+" },
        { cost: "1599", validity: "180 Days", data: "5 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "Amazon Prime" },
        { cost: "1999", validity: "365 Days", data: "6 GB/Day", sms: "100 SMS/day", calls: "Unlimited", benefits: "Netflix & Hotstar" }
    ],
    "Combo/Validity": [{ cost: "399", validity: "28 Days", data: "2 GB/Day", sms: "100 SMS/day", calls: "Unlimited" }],
    "Data": [{ cost: "299", validity: "28 Days", data: "3 GB/Day", sms: "50 SMS/day", calls: "Unlimited" }],
    "Others": [{ cost: "199", validity: "15 Days", data: "1.5 GB/Day", sms: "50 SMS/day", calls: "Unlimited" }],
    "Top Up": [{ cost: "50", validity: "NA", data: "NA", sms: "NA", calls: "Talktime: 39.37" }]
};


// DOM Elements
const plansBody = document.getElementById("plansBody");
const categoryButtons = document.querySelectorAll(".category-btn");
const modal = document.getElementById("addPlanModal");
const addPlanBtn = document.getElementById("addPlanBtn");
const closeModal = document.getElementById("closeModal");
const submitPlan = document.getElementById("submitPlan");
const sortSelect = document.getElementById("sortSelect");
const closeBtn = document.querySelector(".close");
let currentCategory = "All";

// Load all plans or filtered by category
function loadPlans(category, sortBy = "") {
    plansBody.innerHTML = "";
    let plans = [];
    
    if (category === "All") {
        // Combine all plans from all categories
        Object.values(plansData).forEach(categoryPlans => {
            plans = [...plans, ...categoryPlans];
        });
    } else {
        plans = plansData[category];
    }

    // Sort plans if sorting is selected
    if (sortBy) {
        plans.sort((a, b) => {
            switch (sortBy) {
                case "price":
                    return parseInt(a.cost) - parseInt(b.cost);
                case "validity":
                    return parseInt(a.validity) - parseInt(b.validity);
                case "data":
                    return parseFloat(a.data) - parseFloat(b.data);
                default:
                    return 0;
            }
        });
    }

    plans.forEach((plan, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>₹${plan.cost}</td>
            <td>${plan.validity}</td>
            <td>${plan.data}</td>
            <td>${plan.sms}</td>
            <td>${plan.calls}</td>
            <td>${plan.benefits || "-"}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editPlan('${category}', ${index})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="removePlan('${category}', ${index})">Remove</button>
            </td>
        `;
        plansBody.appendChild(row);
    });
}

// Remove plan
function removePlan(category, index) {
    if (confirm("Are you sure you want to remove this plan?")) {
        plansData[category].splice(index, 1);
        loadPlans(currentCategory, sortSelect.value);
    }
}

// Edit plan functionality (to be implemented)
function editPlan(category, index) {
    currentEditCategory = category;
    currentEditIndex = index;
    const plan = plansData[category][index];
    
    // Populate edit modal fields
    document.getElementById("editCost").value = plan.cost;
    document.getElementById("editValidity").value = plan.validity;
    document.getElementById("editData").value = plan.data;
    document.getElementById("editSms").value = plan.sms;
    document.getElementById("editCalls").value = plan.calls;
    document.getElementById("editBenefits").value = plan.benefits || "";
    
    editModal.style.display = "block";
}
// Event Listeners
categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        categoryButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        currentCategory = button.getAttribute("data-category");
        loadPlans(currentCategory, sortSelect.value);
    });
});

sortSelect.addEventListener("change", (e) => {
    loadPlans(currentCategory, e.target.value);
});

addPlanBtn.addEventListener("click", () => {
    modal.style.display = "block";
});

closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});

submitPlan.addEventListener("click", () => {
    const category = document.getElementById("categorySelect").value;
    if (!category) {
        alert("Please select a category!");
        return;
    }

    const plan = {
        cost: document.getElementById("cost").value,
        validity: document.getElementById("validity").value,
        data: document.getElementById("data").value,
        sms: document.getElementById("sms").value,
        calls: document.getElementById("calls").value,
        benefits: document.getElementById("benefits").value || "-"
    };

    // Validate required fields
    if (!plan.cost || !plan.validity || !plan.data || !plan.sms || !plan.calls) {
        alert("Please fill all required fields!");
        return;
    }

    plansData[category].push(plan);
    loadPlans(currentCategory, sortSelect.value);
    modal.style.display = "none";

    // Clear form
    document.getElementById("categorySelect").value = "";
    document.getElementById("cost").value = "";
    document.getElementById("validity").value = "";
    document.getElementById("data").value = "";
    document.getElementById("sms").value = "";
    document.getElementById("calls").value = "";
    document.getElementById("benefits").value = "";
});

// Close modal when clicking outside
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// Initialize sidebar collapse functionality
document.getElementById("sidebarCollapse").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("active");
});

// Initial load
loadPlans(currentCategory);

// ... keep existing code (plansData and initial DOM elements)

// Additional DOM Elements for Edit Modal
const editModal = document.getElementById("editPlanModal");
const closeEditBtn = document.querySelector(".close-edit");
const cancelEditBtn = document.getElementById("cancelEdit");
const saveEditBtn = document.getElementById("saveEdit");
let currentEditCategory = "";
let currentEditIndex = -1;

// ... keep existing code (loadPlans function)

// Edit plan functionality


// Close edit modal
function closeEditModal() {
    editModal.style.display = "none";
    currentEditCategory = "";
    currentEditIndex = -1;
}

// Save edited plan
function savePlanChanges() {
    const editedPlan = {
        cost: document.getElementById("editCost").value,
        validity: document.getElementById("editValidity").value,
        data: document.getElementById("editData").value,
        sms: document.getElementById("editSms").value,
        calls: document.getElementById("editCalls").value,
        benefits: document.getElementById("editBenefits").value || "-"
    };

    // Validate required fields
    if (!editedPlan.cost || !editedPlan.validity || !editedPlan.data || 
        !editedPlan.sms || !editedPlan.calls) {
        alert("Please fill all required fields!");
        return;
    }

    // Save changes
    plansData[currentEditCategory][currentEditIndex] = editedPlan;
    loadPlans(currentCategory, sortSelect.value);
    closeEditModal();
}

// Event Listeners for Edit Modal
closeEditBtn.addEventListener("click", closeEditModal);
cancelEditBtn.addEventListener("click", closeEditModal);
saveEditBtn.addEventListener("click", savePlanChanges);

// Update window click handler to include edit modal
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
    if (event.target === editModal) {
        closeEditModal();
    }
});

// ... keep existing code (rest of the event listeners and initial load)