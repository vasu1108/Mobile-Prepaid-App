// API URL
const API_URL = "http://localhost:8083";

// DOM Elements
const plansBody = document.getElementById("plansBody");
const categoryButtons = document.querySelectorAll(".category-btn");
const addPlanModal = document.getElementById("addPlanModal");
const editPlanModal = document.getElementById("editPlanModal");
const deletePlanModal = document.getElementById("deletePlanModal");
const addPlanBtn = document.getElementById("addPlanBtn");
const closeModal = document.getElementById("closeModal");
const submitPlanBtn = document.getElementById("submitPlan");
const sortSelect = document.getElementById("sortSelect");
const searchInput = document.getElementById("searchInput");
const closeBtn = document.querySelector(".close");
const closeEditBtn = document.querySelector(".close-edit");
const closeDeleteBtn = document.querySelector(".close-delete");
const cancelEditBtn = document.getElementById("cancelEdit");
const saveEditBtn = document.getElementById("saveEdit");
const cancelDeleteBtn = document.getElementById("cancelDelete");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const loadingSpinner = document.getElementById("loading-spinner");
const paginationContainer = document.getElementById("pagination-container");
const paginationInfo = document.getElementById("pagination-info");
const deletePlanName = document.getElementById("deletePlanName");
const deletePlanDetails = document.getElementById("deletePlanDetails");

// Stats elements
const totalPlansCount = document.getElementById("totalPlansCount");
const popularPlansCount = document.getElementById("popularPlansCount");
const entertainmentPlansCount = document.getElementById("entertainmentPlansCount");
const annualPlansCount = document.getElementById("annualPlansCount");

// OTT Checkboxes
const ottCheckboxes = document.querySelectorAll(".ott-checkbox");
const editOttCheckboxes = document.querySelectorAll(".edit-ott-checkbox");

// Toast
const toastEl = document.getElementById("notificationToast");
const toastMessage = document.getElementById("toastMessage");
let toast;

// Current category and plan for tracking
let currentCategory = "all";
let currentPlans = [];
let allPlans = [];
let currentPage = 1;
const plansPerPage = 10;

// OTT provider image paths and details
const ottProviders = {
    "Netflix": { 
        imagePath: "./assets/netflixbasic (1).svg",
        
    },
    "Prime Video": { 
        imagePath: "./assets/amazonprime.svg",
       
    },
    "Jio Hotstar": { 
        imagePath: "./assets/Hotstar (1).svg",
        
    },
    "Disney+": { 
        imagePath: "./assets/download.jpg",
        
    }
};

// Initialize Bootstrap components
document.addEventListener("DOMContentLoaded", () => {
    // Initialize toast
    toast = new bootstrap.Toast(toastEl);
    
    // Load plans
    loadPlans();
    
    // Setup search input
    searchInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            searchPlans();
        }
    });
});

// Helper function to show loading spinner
function showLoading() {
    loadingSpinner.classList.remove("d-none");
}

// Helper function to hide loading spinner
function hideLoading() {
    loadingSpinner.classList.add("d-none");
}

// Helper function to show toast notification
function showToast(message, type = "success") {
    toastMessage.textContent = message;
    
    // Set icon based on type
    const iconElement = document.querySelector('.toast-header i');
    if (type === "success") {
        iconElement.className = "bi bi-check-circle-fill me-2 text-success";
    } else if (type === "error") {
        iconElement.className = "bi bi-exclamation-triangle-fill me-2 text-danger";
    } else {
        iconElement.className = "bi bi-info-circle-fill me-2 text-primary";
    }
    
    toast.show();
}

// Helper function to display error messages
function showError(message) {
    showToast(message, "error");
}

// Helper function to format OTT benefits for display with SVG images
function formatOTTBenefits(ottBenefits) {
    if (!ottBenefits || ottBenefits.length === 0) {
        return '<span class="text-muted">No OTT benefits</span>';
    }

    // Group benefits by provider to avoid duplicates
    const groupedBenefits = {};
    
    ottBenefits.forEach(benefit => {
        const provider = benefit.ottPlan.ottProvider.ottName;
        const planName = benefit.ottPlan.ottPlanName;
        
        if (!groupedBenefits[provider]) {
            groupedBenefits[provider] = planName;
        }
    });
    
    let html = '<div class="ott-badges">';
    
    Object.entries(groupedBenefits).forEach(([provider, planName]) => {
        const providerInfo = ottProviders[provider] || { 
            imagePath: "assets/images/ott/default.svg",
            color: "#777" 
        };
        
        html += `
            <div class="ott-badge" title="${provider} - ${planName}">
                <div class="ott-icon">
                    <img src="${providerInfo.imagePath}" alt="${provider}" width="16" height="16">
                </div>
                <span>${planName}</span>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

// Helper function to update stats
function updateStats(plans) {
    const total = plans.length;
    const popular = plans.filter(p => p.category && p.category.categoryName === "Popular Plans").length;
    const entertainment = plans.filter(p => p.category && p.category.categoryName === "Entertainment Plans").length;
    const annual = plans.filter(p => p.category && p.category.categoryName === "Annual Plans").length;
    
    totalPlansCount.textContent = total;
    popularPlansCount.textContent = popular;
    entertainmentPlansCount.textContent = entertainment;
    annualPlansCount.textContent = annual;
}

// Helper function to generate pagination
function setupPagination(totalPlans) {
    // ... keep existing code (pagination generation logic)
    paginationContainer.innerHTML = "";
    
    if (totalPlans <= plansPerPage) return;
    
    const totalPages = Math.ceil(totalPlans / plansPerPage);
    
    // Previous button
    const prevLi = document.createElement("li");
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" ${currentPage === 1 ? 'tabindex="-1" aria-disabled="true"' : ''}><i class="bi bi-chevron-left"></i></a>`;
    if (currentPage > 1) {
        prevLi.addEventListener("click", () => {
            goToPage(currentPage - 1);
        });
    }
    paginationContainer.appendChild(prevLi);
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // First page
    if (startPage > 1) {
        const firstLi = document.createElement("li");
        firstLi.className = "page-item";
        firstLi.innerHTML = `<a class="page-link" href="#">1</a>`;
        firstLi.addEventListener("click", () => {
            goToPage(1);
        });
        paginationContainer.appendChild(firstLi);
        
        // Ellipsis if needed
        if (startPage > 2) {
            const ellipsisLi = document.createElement("li");
            ellipsisLi.className = "page-item disabled";
            ellipsisLi.innerHTML = `<a class="page-link" href="#" tabindex="-1">...</a>`;
            paginationContainer.appendChild(ellipsisLi);
        }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement("li");
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageLi.addEventListener("click", () => {
            goToPage(i);
        });
        paginationContainer.appendChild(pageLi);
    }
    
    // Last page
    if (endPage < totalPages) {
        // Ellipsis if needed
        if (endPage < totalPages - 1) {
            const ellipsisLi = document.createElement("li");
            ellipsisLi.className = "page-item disabled";
            ellipsisLi.innerHTML = `<a class="page-link" href="#" tabindex="-1">...</a>`;
            paginationContainer.appendChild(ellipsisLi);
        }
        
        const lastLi = document.createElement("li");
        lastLi.className = "page-item";
        lastLi.innerHTML = `<a class="page-link" href="#">${totalPages}</a>`;
        lastLi.addEventListener("click", () => {
            goToPage(totalPages);
        });
        paginationContainer.appendChild(lastLi);
    }
    
    // Next button
    const nextLi = document.createElement("li");
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" ${currentPage === totalPages ? 'tabindex="-1" aria-disabled="true"' : ''}><i class="bi bi-chevron-right"></i></a>`;
    if (currentPage < totalPages) {
        nextLi.addEventListener("click", () => {
            goToPage(currentPage + 1);
        });
    }
    paginationContainer.appendChild(nextLi);
}

// Function to change page
function goToPage(page) {
    currentPage = page;
    displayPlans(currentPlans);
}

// Function to search plans
function searchPlans() {
    // ... keep existing code (search functionality)
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        currentPlans = [...allPlans];
        displayPlans(currentPlans);
        return;
    }
    
    currentPlans = allPlans.filter(plan => {
        return (
            plan.planName.toLowerCase().includes(searchTerm) ||
            plan.dataLimit.toLowerCase().includes(searchTerm) ||
            plan.callLimit.toLowerCase().includes(searchTerm) ||
            plan.smsLimit.toLowerCase().includes(searchTerm) ||
            (plan.category && plan.category.categoryName.toLowerCase().includes(searchTerm))
        );
    });
    
    // Reset to first page
    currentPage = 1;
    displayPlans(currentPlans);
}

// Function to display plans with pagination
function displayPlans(plans) {
    plansBody.innerHTML = "";
    
    if (plans.length === 0) {
        plansBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    <div class="py-5">
                        <i class="bi bi-search" style="font-size: 2rem; color: var(--text-muted);"></i>
                        <p class="mt-3 text-muted">No plans found</p>
                    </div>
                </td>
            </tr>
        `;
        paginationContainer.innerHTML = "";
        document.getElementById("startRecord").textContent = "0";
        document.getElementById("endRecord").textContent = "0";
        document.getElementById("totalRecords").textContent = "0";
        return;
    }
    
    const startIndex = (currentPage - 1) * plansPerPage;
    const endIndex = Math.min(startIndex + plansPerPage, plans.length);
    const currentPagePlans = plans.slice(startIndex, endIndex);
    
    currentPagePlans.forEach(plan => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <div class="d-flex flex-column">
                    <span class="fw-medium">${plan.planName}</span>
                    <small class="text-muted">${plan.category ? plan.category.categoryName : ''}</small>
                </div>
            </td>
            <td>
                <span class="fw-medium">₹${plan.planPrice.toFixed(2)}</span>
            </td>
            <td>
                <span class="d-flex align-items-center">
                    <i class="bi bi-calendar-check me-2 text-success"></i>
                    ${plan.validityDays} days
                </span>
            </td>
            <td>
                <span class="d-flex align-items-center">
                    <i class="bi bi-wifi me-2 text-primary"></i>
                    ${plan.dataLimit}
                </span>
            </td>
            <td>
                <span class="d-flex align-items-center">
                    <i class="bi bi-chat-dots me-2 text-warning"></i>
                    ${plan.smsLimit}
                </span>
            </td>
            <td>
                <span class="d-flex align-items-center">
                    <i class="bi bi-telephone me-2 text-success"></i>
                    ${plan.callLimit}
                </span>
            </td>
            <td>
                ${formatOTTBenefits(plan.ottBenefits)}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditPlanModal(${plan.planId})">
                        <i class="bi bi-pencil-square"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="openDeletePlanModal(${plan.planId}, '${plan.planName.replace(/'/g, "\\'")}')">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        plansBody.appendChild(row);
    });
    
    // Update pagination
    setupPagination(plans.length);
    
    // Update pagination info
    document.getElementById("startRecord").textContent = plans.length > 0 ? startIndex + 1 : 0;
    document.getElementById("endRecord").textContent = endIndex;
    document.getElementById("totalRecords").textContent = plans.length;
}

// Load all plans or filtered by category
async function loadPlans(category = "all", sortBy = "") {
    // ... keep existing code (loading plans functionality)
    showLoading();
    plansBody.innerHTML = `
        <tr>
            <td colspan="8" class="text-center py-4">Loading plans...</td>
        </tr>
    `;
    
    try {
        let url;
        
        if (category === "all") {
            url = `${API_URL}/plans/active`;
        } else {
            url = `${API_URL}/plans/active-by-category?category=${encodeURIComponent(category)}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        let plans = await response.json();
        
        // Normalize to array if single object
        if (!Array.isArray(plans)) {
            plans = [plans];
        }
        
        // Update all plans and current plans
        allPlans = plans;
        currentPlans = [...plans];
        
        // Sort plans if sorting is selected
        if (sortBy) {
            sortPlans(sortBy);
        }
        
        // Update statistics
        updateStats(allPlans);
        
        // Reset to first page when loading new plans
        currentPage = 1;
        displayPlans(currentPlans);
        
    } catch (error) {
        console.error("Error loading plans:", error);
        showError("Failed to load plans. Please try again.");
        plansBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Error loading plans. Please try again.
                </td>
            </tr>
        `;
        paginationContainer.innerHTML = "";
    } finally {
        hideLoading();
    }
}

// Sort plans based on criteria
function sortPlans(sortBy) {
    // ... keep existing code (sorting functionality)
    if (!sortBy) return;
    
    currentPlans.sort((a, b) => {
        switch (sortBy) {
            case "price-low":
                return a.planPrice - b.planPrice;
            case "price-high":
                return b.planPrice - a.planPrice;
            case "validity-high":
                return b.validityDays - a.validityDays;
            case "data-high":
                // Simple string comparison for data
                return b.dataLimit.localeCompare(a.dataLimit);
            default:
                return 0;
        }
    });
    
    displayPlans(currentPlans);
}

// Function to add a new plan
async function addPlan() {
    // ... keep existing code (add plan functionality)
    const categoryId = document.getElementById("categorySelect").value;
    const planName = document.getElementById("planName").value;
    const planPrice = parseFloat(document.getElementById("planPrice").value);
    const validityDays = parseInt(document.getElementById("validityDays").value);
    const dataLimit = document.getElementById("dataLimit").value;
    const smsLimit = document.getElementById("smsLimit").value;
    const callLimit = document.getElementById("callLimit").value;
    
    // Validate required fields
    if (!categoryId || !planName || isNaN(planPrice) || isNaN(validityDays) || !dataLimit || !smsLimit || !callLimit) {
        showError("Please fill all required fields with valid values.");
        return;
    }
    
    // Create the plan object
    const plan = {
        planName: planName,
        planPrice: planPrice,
        validityDays: validityDays,
        dataLimit: dataLimit,
        smsLimit: smsLimit,
        callLimit: callLimit,
        planStatus: "Active",
        category: {
            categoryId: parseInt(categoryId)
        }
    };
    
    // Add OTT benefits if any are selected
    const ottBenefits = [];
    
    // Netflix
    if (document.getElementById("includeNetflix").checked) {
        const selectedPlan = document.querySelector('input[name="netflixPlan"]:checked');
        if (selectedPlan) {
            ottBenefits.push({
                ottPlan: {
                    ottPlanId: parseInt(selectedPlan.value)
                }
            });
        }
    }
    
    // Prime Video
    if (document.getElementById("includePrimeVideo").checked) {
        const selectedPlan = document.querySelector('input[name="primePlan"]:checked');
        if (selectedPlan) {
            ottBenefits.push({
                ottPlan: {
                    ottPlanId: parseInt(selectedPlan.value)
                }
            });
        }
    }
    
    // Hotstar
    if (document.getElementById("includeHotstar").checked) {
        const selectedPlan = document.querySelector('input[name="hotstarPlan"]:checked');
        if (selectedPlan) {
            ottBenefits.push({
                ottPlan: {
                    ottPlanId: parseInt(selectedPlan.value)
                }
            });
        }
    }
    
    // Disney+
    if (document.getElementById("includeDisney").checked) {
        const selectedPlan = document.querySelector('input[name="disneyPlan"]:checked');
        if (selectedPlan) {
            ottBenefits.push({
                ottPlan: {
                    ottPlanId: parseInt(selectedPlan.value)
                }
            });
        }
    }
    
    if (ottBenefits.length > 0) {
        plan.ottBenefits = ottBenefits;
    }
    
    try {
        showLoading();
        const response = await fetch(`${API_URL}/plans`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(plan)
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        closeAddPlanModal();
        resetAddPlanForm();
        loadPlans(currentCategory, sortSelect.value);
        
        showToast("Plan added successfully!", "success");
    } catch (error) {
        console.error("Error adding plan:", error);
        showError("Failed to add plan. Please try again.");
    } finally {
        hideLoading();
    }
}

// Function to update a plan
async function updatePlan() {
    // ... keep existing code (update plan functionality)
    const planId = document.getElementById("editPlanId").value;
    const categoryId = document.getElementById("editCategorySelect").value;
    const planName = document.getElementById("editPlanName").value;
    const planPrice = parseFloat(document.getElementById("editPlanPrice").value);
    const validityDays = parseInt(document.getElementById("editValidityDays").value);
    const dataLimit = document.getElementById("editDataLimit").value;
    const smsLimit = document.getElementById("editSmsLimit").value;
    const callLimit = document.getElementById("editCallLimit").value;
    
    // Validate required fields
    if (!categoryId || !planName || isNaN(planPrice) || isNaN(validityDays) || !dataLimit || !smsLimit || !callLimit) {
        showError("Please fill all required fields with valid values.");
        return;
    }
    
    // Create the plan object
    const plan = {
        planId: parseInt(planId),
        planName: planName,
        planPrice: planPrice,
        validityDays: validityDays,
        dataLimit: dataLimit,
        smsLimit: smsLimit,
        callLimit: callLimit,
        planStatus: "Active",
        category: {
            categoryId: parseInt(categoryId)
        }
    };
    
    // Add OTT benefits if any are selected
    const ottBenefits = [];
    
    // Netflix
    if (document.getElementById("editIncludeNetflix").checked) {
        const selectedPlan = document.querySelector('input[name="editNetflixPlan"]:checked');
        if (selectedPlan) {
            ottBenefits.push({
                ottPlan: {
                    ottPlanId: parseInt(selectedPlan.value)
                }
            });
        }
    }
    
    // Prime Video
    if (document.getElementById("editIncludePrimeVideo").checked) {
        const selectedPlan = document.querySelector('input[name="editPrimePlan"]:checked');
        if (selectedPlan) {
            ottBenefits.push({
                ottPlan: {
                    ottPlanId: parseInt(selectedPlan.value)
                }
            });
        }
    }
    
    // Hotstar
    if (document.getElementById("editIncludeHotstar").checked) {
        const selectedPlan = document.querySelector('input[name="editHotstarPlan"]:checked');
        if (selectedPlan) {
            ottBenefits.push({
                ottPlan: {
                    ottPlanId: parseInt(selectedPlan.value)
                }
            });
        }
    }
    
    // Disney+
    if (document.getElementById("editIncludeDisney").checked) {
        const selectedPlan = document.querySelector('input[name="editDisneyPlan"]:checked');
        if (selectedPlan) {
            ottBenefits.push({
                ottPlan: {
                    ottPlanId: parseInt(selectedPlan.value)
                }
            });
        }
    }
    
    if (ottBenefits.length > 0) {
        plan.ottBenefits = ottBenefits;
    }
    
    try {
        showLoading();
        const response = await fetch(`${API_URL}/plans/${planId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(plan)
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        closeEditPlanModal();
        loadPlans(currentCategory, sortSelect.value);
        
        showToast("Plan updated successfully!", "success");
    } catch (error) {
        console.error("Error updating plan:", error);
        showError("Failed to update plan. Please try again.");
    } finally {
        hideLoading();
    }
}

async function deletePlan() {
    const planId = document.getElementById("deletePlanId").value;
    
    try {
        showLoading();
        const response = await fetch(`${API_URL}/plans/${planId}/deactivate`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            }
            // No body needed for this endpoint
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        closeDeletePlanModal();
        loadPlans(currentCategory, sortSelect.value);
        showToast("Plan deactivated successfully!", "success");
    } catch (error) {
        console.error("Error deactivating plan:", error);
        showError("Failed to deactivate plan. Please try again.");
    } finally {
        hideLoading();
    }
}

// Ensure delete button triggers the correct function
confirmDeleteBtn.addEventListener("click", deletePlan);



// Function to open edit plan modal
function openEditPlanModal(planId) {
    // ... keep existing code (edit plan modal functionality)
    const plan = allPlans.find(p => p.planId === planId);
    if (!plan) {
        showError("Plan not found.");
        return;
    }
    
    // Set plan details
    document.getElementById("editPlanId").value = plan.planId;
    document.getElementById("editCategorySelect").value = plan.category ? plan.category.categoryId : "";
    document.getElementById("editPlanName").value = plan.planName;
    document.getElementById("editPlanPrice").value = plan.planPrice;
    document.getElementById("editValidityDays").value = plan.validityDays;
    document.getElementById("editDataLimit").value = plan.dataLimit;
    document.getElementById("editSmsLimit").value = plan.smsLimit;
    document.getElementById("editCallLimit").value = plan.callLimit;
    
    // Reset OTT checkboxes
    editOttCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
        const providerId = checkbox.getAttribute("data-provider");
        document.getElementById(`editNetflixPlans`).classList.add("d-none");
        document.getElementById(`editPrimeVideoPlans`).classList.add("d-none");
        document.getElementById(`editHotstarPlans`).classList.add("d-none");
        document.getElementById(`editDisneyPlans`).classList.add("d-none");
    });
    
    // Set OTT benefits if any
    if (plan.ottBenefits && plan.ottBenefits.length > 0) {
        plan.ottBenefits.forEach(benefit => {
            const providerId = benefit.ottPlan.ottProvider.ottId;
            const planId = benefit.ottPlan.ottPlanId;
            
            // Check the provider checkbox
            const checkbox = document.querySelector(`#editInclude${getProviderName(providerId)}`);
            if (checkbox) {
                checkbox.checked = true;
                
                // Show the plan options
                const plansDiv = document.getElementById(`edit${getProviderName(providerId)}Plans`);
                if (plansDiv) {
                    plansDiv.classList.remove("d-none");
                    
                    // Check the correct plan radio button
                    const planRadio = document.querySelector(`input[name="edit${getProviderName(providerId)}Plan"][value="${planId}"]`);
                    if (planRadio) {
                        planRadio.checked = true;
                    }
                }
            }
        });
    }
    
    editPlanModal.style.display = "block";
}

// Function to open delete plan modal
function openDeletePlanModal(planId, planName) {
    const plan = allPlans.find(p => p.planId === planId);
    if (!plan) {
        showError("Plan not found.");
        return;
    }
    
    document.getElementById("deletePlanId").value = planId;
    document.getElementById("deletePlanDetails").value = JSON.stringify(plan);
    document.getElementById("deletePlanName").textContent = planName;
    
    deletePlanModal.style.display = "block";
}

// Helper function to get provider name from ID
function getProviderName(providerId) {
    switch (parseInt(providerId)) {
        case 1: return "Netflix";
        case 2: return "PrimeVideo";
        case 3: return "Hotstar";
        case 4: return "Disney";
        default: return "";
    }
}

// Function to close add plan modal
function closeAddPlanModal() {
    addPlanModal.style.display = "none";
}

// Function to close edit plan modal
function closeEditPlanModal() {
    editPlanModal.style.display = "none";
}

// Function to close delete plan modal
function closeDeletePlanModal() {
    deletePlanModal.style.display = "none";
}

// Function to reset add plan form
function resetAddPlanForm() {
    // ... keep existing code (reset form functionality)
    document.getElementById("categorySelect").value = "";
    document.getElementById("planName").value = "";
    document.getElementById("planPrice").value = "";
    document.getElementById("validityDays").value = "";
    document.getElementById("dataLimit").value = "";
    document.getElementById("smsLimit").value = "";
    document.getElementById("callLimit").value = "";
    
    // Reset OTT checkboxes
    ottCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Hide all OTT plan selections
    document.getElementById("netflixPlans").classList.add("d-none");
    document.getElementById("primeVideoPlans").classList.add("d-none");
    document.getElementById("hotstarPlans").classList.add("d-none");
    document.getElementById("disneyPlans").classList.add("d-none");
}

// Event listeners for category buttons
categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        categoryButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        const category = button.getAttribute("data-category");
        currentCategory = category;
        searchInput.value = ""; // Reset search when changing category
        loadPlans(category, sortSelect.value);
    });
});

// Event listener for sort select
sortSelect.addEventListener("change", (e) => {
    sortPlans(e.target.value);
});

// Event listeners for OTT checkboxes - add plan modal
ottCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", (e) => {
        const providerId = e.target.getAttribute("data-provider");
        let planDiv;
        
        switch (providerId) {
            case "1":
                planDiv = document.getElementById("netflixPlans");
                break;
            case "2":
                planDiv = document.getElementById("primeVideoPlans");
                break;
            case "3":
                planDiv = document.getElementById("hotstarPlans");
                break;
            case "4":
                planDiv = document.getElementById("disneyPlans");
                break;
        }
        
        if (planDiv) {
            if (e.target.checked) {
                planDiv.classList.remove("d-none");
            } else {
                planDiv.classList.add("d-none");
            }
        }
    });
});

// Event listeners for OTT checkboxes - edit plan modal
editOttCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", (e) => {
        const providerId = e.target.getAttribute("data-provider");
        let planDiv;
        
        switch (providerId) {
            case "1":
                planDiv = document.getElementById("editNetflixPlans");
                break;
            case "2":
                planDiv = document.getElementById("editPrimeVideoPlans");
                break;
            case "3":
                planDiv = document.getElementById("editHotstarPlans");
                break;
            case "4":
                planDiv = document.getElementById("editDisneyPlans");
                break;
        }
        
        if (planDiv) {
            if (e.target.checked) {
                planDiv.classList.remove("d-none");
            } else {
                planDiv.classList.add("d-none");
            }
        }
    });
});

// Event listeners for modals
addPlanBtn.addEventListener("click", () => {
    resetAddPlanForm();
    addPlanModal.style.display = "block";
});

closeBtn.addEventListener("click", closeAddPlanModal);
closeModal.addEventListener("click", closeAddPlanModal);

closeEditBtn.addEventListener("click", closeEditPlanModal);
cancelEditBtn.addEventListener("click", closeEditPlanModal);

closeDeleteBtn.addEventListener("click", closeDeletePlanModal);
cancelDeleteBtn.addEventListener("click", closeDeletePlanModal);

// Form submission buttons
submitPlanBtn.addEventListener("click", addPlan);
saveEditBtn.addEventListener("click", updatePlan);
confirmDeleteBtn.addEventListener("click", deletePlan);

// Close modals when clicking outside
window.addEventListener("click", (event) => {
    if (event.target === addPlanModal) {
        closeAddPlanModal();
    }
    if (event.target === editPlanModal) {
        closeEditPlanModal();
    }
    if (event.target === deletePlanModal) {
        closeDeletePlanModal();
    }
});

// Initialize sidebar collapse functionality
document.getElementById("sidebarCollapse").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("active");
    document.getElementById("content").classList.toggle("ml-0");
});

// Make functions available globally
window.openEditPlanModal = openEditPlanModal;
window.openDeletePlanModal = openDeletePlanModal;

function checkUserAndRedirect() {
    const currentUser = sessionStorage.getItem('currentUser');
    
    if (!currentUser) {
      // No user found in sessionStorage, redirect to login page
      window.location.href = 'login.html';
    }
  }
  
  // Call this function when your page loads
  document.addEventListener('DOMContentLoaded', checkUserAndRedirect);