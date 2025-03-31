// API URL
const API_URL = "http://localhost:8083";

// DOM Elements
const plansBody = document.getElementById("plansBody");
const categoryDropdown = document.getElementById("categoryDropdown");
const addPlanModal = document.getElementById("addPlanModal");
const editPlanModal = document.getElementById("editPlanModal");
const deletePlanModal = document.getElementById("deletePlanModal");
const addCategoryModal = document.getElementById("addCategoryModal");
const editCategoryModal = document.getElementById("editCategoryModal");
const deleteCategoryModal = document.getElementById("deleteCategoryModal");
const manageCategoriesModal = document.getElementById("manageCategoriesModal");
const addPlanBtn = document.getElementById("addPlanBtn");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const manageCategoriesBtn = document.getElementById("manageCategoriesBtn");
const closeModal = document.getElementById("closeModal");
const submitPlanBtn = document.getElementById("submitPlan");
const submitCategoryBtn = document.getElementById("submitCategory");
const updateCategoryBtn = document.getElementById("updateCategory");
const confirmDeleteCategoryBtn = document.getElementById("confirmDeleteCategory");
const closeCategoryModal = document.getElementById("closeCategoryModal");
const closeEditCategoryModal = document.getElementById("closeEditCategoryModal");
const closeDeleteCategoryModal = document.getElementById("closeDeleteCategoryModal");
const closeManageCategoriesModal = document.getElementById("closeManageCategoriesModal");
const sortSelect = document.getElementById("sortSelect");
const searchInput = document.getElementById("searchInput");
const closeBtn = document.querySelector(".close");
const closeEditBtn = document.querySelector(".close-edit");
const closeDeleteBtn = document.querySelector(".close-delete");
const closeCategoryBtn = document.querySelector(".close-category");
const closeEditCategoryBtn = document.querySelector(".close-edit-category");
const closeDeleteCategoryBtn = document.querySelector(".close-delete-category");
const closeManageCategoriesBtn = document.querySelector(".close-manage-categories");
const cancelEditBtn = document.getElementById("cancelEdit");
const saveEditBtn = document.getElementById("saveEdit");
const cancelDeleteBtn = document.getElementById("cancelDelete");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const loadingSpinner = document.getElementById("loading-spinner");
const categoriesTableBody = document.getElementById("categoriesTableBody");
const paginationContainer = document.getElementById("pagination-container");
const paginationInfo = document.getElementById("pagination-info");
const deletePlanName = document.getElementById("deletePlanName");
const deletePlanDetails = document.getElementById("deletePlanDetails");
const deleteCategoryName = document.getElementById("deleteCategoryName");
const deleteCategoryId = document.getElementById("deleteCategoryId");
const categorySelect = document.getElementById("categorySelect");
const editCategorySelect = document.getElementById("editCategorySelect");
const editCategoryName = document.getElementById("editCategoryName");
const editCategoryId = document.getElementById("editCategoryId");

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
let allCategories = [];
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
    
    // Load categories
    loadCategories();
    
    // Load plans
    loadPlans();
    
    // Setup search input
    searchInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            searchPlans();
        }
    });

    // Check if user is logged in
    checkUserAndRedirect();
    
    // Setup modal close buttons
    setupModalCloseHandlers();
    
    console.log("DOM Content Loaded and event listeners setup");
});

// Setup modal close handlers for all modals
function setupModalCloseHandlers() {
    // Add Plan Modal
    if (closeBtn) closeBtn.addEventListener("click", closeAddPlanModal);
    if (closeModal) closeModal.addEventListener("click", closeAddPlanModal);
    
    // Edit Plan Modal
    if (closeEditBtn) closeEditBtn.addEventListener("click", closeEditPlanModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener("click", closeEditPlanModal);
    
    // Delete Plan Modal
    if (closeDeleteBtn) closeDeleteBtn.addEventListener("click", closeDeletePlanModal);
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener("click", closeDeletePlanModal);
    
    // Add Category Modal
    if (closeCategoryBtn) closeCategoryBtn.addEventListener("click", closeAddCategoryModal);
    if (closeCategoryModal) closeCategoryModal.addEventListener("click", closeAddCategoryModal);
    
    // Edit Category Modal
    if (closeEditCategoryBtn) closeEditCategoryBtn.addEventListener("click", closeEditCategoryModal);
    if (closeEditCategoryModal) closeEditCategoryModal.addEventListener("click", closeEditCategoryModal);
    
    // Delete Category Modal
    if (closeDeleteCategoryBtn) closeDeleteCategoryBtn.addEventListener("click", closeDeleteCategoryModal);
    if (closeDeleteCategoryModal) closeDeleteCategoryModal.addEventListener("click", closeDeleteCategoryModal);
    
    // Manage Categories Modal
    if (closeManageCategoriesBtn) closeManageCategoriesBtn.addEventListener("click", closeManageCategoriesModal);
    if (closeManageCategoriesModal) closeManageCategoriesModal.addEventListener("click", closeManageCategoriesModal);
    
    console.log("Modal close handlers setup");
}

// Helper function to show loading spinner
function showLoading() {
    if (loadingSpinner) {
        loadingSpinner.classList.remove("d-none");
    }
}

// Helper function to hide loading spinner
function hideLoading() {
    if (loadingSpinner) {
        loadingSpinner.classList.add("d-none");
    }
}

// Helper function to show toast notification
function showToast(message, type = "success") {
    if (!toastMessage || !toast) return;
    
    toastMessage.textContent = message;
    
    // Set icon based on type
    const iconElement = document.querySelector('.toast-header i');
    if (iconElement) {
        if (type === "success") {
            iconElement.className = "bi bi-check-circle-fill me-2 text-success";
        } else if (type === "error") {
            iconElement.className = "bi bi-exclamation-triangle-fill me-2 text-danger";
        } else {
            iconElement.className = "bi bi-info-circle-fill me-2 text-primary";
        }
    }
    
    toast.show();
}

// Helper function to display error messages
function showError(message) {
    showToast(message, "error");
}

// Load all categories
async function loadCategories() {
    try {
        showLoading();
        console.log("Loading categories from API");
        const response = await fetch(`${API_URL}/categories/names`);
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        allCategories = await response.json();
        console.log("Categories loaded:", allCategories);
        
        // Ensure data is an array
        if (!Array.isArray(allCategories)) {
            allCategories = [allCategories];
        }
        
        // Populate the category dropdowns
        populateCategoryDropdowns();
        
    } catch (error) {
        console.error("Error loading categories:", error);
        showError("Failed to load categories. Please try again.");
    } finally {
        hideLoading();
    }
}

// Populate all category dropdowns
function populateCategoryDropdowns() {
    if (!categoryDropdown || !categorySelect || !editCategorySelect) return;
    
    // Clear existing options except the first one
    categoryDropdown.innerHTML = '<option value="all">All Categories</option>';
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    editCategorySelect.innerHTML = '<option value="">Select Category</option>';
    
    // Add categories to dropdowns
    allCategories.forEach(category => {
        // Main filter dropdown
        const filterOption = document.createElement("option");
        filterOption.value = category.categoryName;
        filterOption.textContent = category.categoryName;
        categoryDropdown.appendChild(filterOption);
        
        // Add plan modal dropdown
        const addOption = document.createElement("option");
        addOption.value = category.categoryId;
        addOption.textContent = category.categoryName;
        categorySelect.appendChild(addOption);
        
        // Edit plan modal dropdown
        const editOption = document.createElement("option");
        editOption.value = category.categoryId;
        editOption.textContent = category.categoryName;
        editCategorySelect.appendChild(editOption);
    });
    
    console.log("Category dropdowns populated");
}

// Load categories for the manage categories modal
function loadCategoriesTable() {
    if (!categoriesTableBody) return;
    
    categoriesTableBody.innerHTML = '';
    
    if (!allCategories || allCategories.length === 0) {
        categoriesTableBody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center py-4">
                    <div class="py-5">
                        <i class="bi bi-folder" style="font-size: 2rem; color: var(--text-muted);"></i>
                        <p class="mt-3 text-muted">No categories found</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    allCategories.forEach(category => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <i class="bi bi-folder me-2 text-primary"></i>
                    <span>${category.categoryName}</span>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditCategoryModal(${category.categoryId}, '${category.categoryName.replace(/'/g, "\\'")}')">
                        <i class="bi bi-pencil-square"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="openDeleteCategoryModal(${category.categoryId}, '${category.categoryName.replace(/'/g, "\\'")}')">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        categoriesTableBody.appendChild(row);
    });
    console.log("Categories table loaded");
}

// Function to open manage categories modal
function openManageCategoriesModal() {
    if (!manageCategoriesModal) return;
    
    loadCategoriesTable();
    manageCategoriesModal.style.display = "block";
    console.log("Opened manage categories modal");
}

// Function to open edit category modal
function openEditCategoryModal(categoryId, categoryName) {
    if (!editCategoryModal || !document.getElementById("editCategoryId") || !document.getElementById("editCategoryName")) return;
    
    document.getElementById("editCategoryId").value = categoryId;
    document.getElementById("editCategoryName").value = categoryName;
    editCategoryModal.style.display = "block";
    console.log("Opened edit category modal for:", categoryName);
}



// Function to open delete category modal
function openDeleteCategoryModal(categoryId, categoryName) {
    if (!deleteCategoryModal || !document.getElementById("deleteCategoryId") || !document.getElementById("deleteCategoryName")) return;
    
    document.getElementById("deleteCategoryId").value = categoryId;
    document.getElementById("deleteCategoryName").textContent = categoryName;
    deleteCategoryModal.style.display = "block";
    console.log("Opened delete category modal for:", categoryName);
}

// Function to edit a category
async function updateCategory() {
    const categoryIdElement = document.getElementById("editCategoryId");
    const categoryNameElement = document.getElementById("editCategoryName");
    
    if (!categoryIdElement || !categoryNameElement) {
        showError("Form elements not found.");
        return;
    }
    
    const categoryId = categoryIdElement.value;
    const categoryName = categoryNameElement.value.trim();
    
    // Validate required fields
    if (!categoryName) {
        showError("Please enter a category name.");
        return;
    }
    
    // Create the category object
    const category = {
        categoryName: categoryName
    };
    
    try {
        showLoading();
        console.log(`Updating category ${categoryId} with name: ${categoryName}`);
        const response = await fetch(`${API_URL}/categories/${categoryId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(category)
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        const updatedCategory = await response.json();
        console.log("Category updated successfully:", updatedCategory);
        
        // Update the category in the allCategories array
        const index = allCategories.findIndex(c => c.categoryId == categoryId);
        if (index !== -1) {
            allCategories[index] = updatedCategory;
        }
        
        // Update categories table
        loadCategoriesTable();
        
        // Update category dropdowns
        populateCategoryDropdowns();
        
        // Close modal first, then show success message
        closeEditCategoryModal();
        showToast("Category updated successfully!", "success");
        
        // Reload plans to reflect the updated category
        loadPlans(currentCategory, sortSelect ? sortSelect.value : "");
    } catch (error) {
        console.error("Error updating category:", error);
        showError("Failed to update category. Please try again.");
    } finally {
        hideLoading();
    }
}

// Function to delete a category
async function deleteCategory() {
    const categoryIdElement = document.getElementById("deleteCategoryId");
    
    if (!categoryIdElement) {
        showError("Category ID not found.");
        return;
    }
    
    const categoryId = categoryIdElement.value;
    
    try {
        showLoading();
        console.log(`Deleting category with ID: ${categoryId}`);
        const response = await fetch(`${API_URL}/categories/${categoryId}/deactivate-plans`, {
            method: "DELETE"
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        console.log("Category deleted successfully");
        
        // Remove the category from the allCategories array
        allCategories = allCategories.filter(c => c.categoryId != categoryId);
        
        // Update categories table
        loadCategoriesTable();
        
        // Update category dropdowns
        populateCategoryDropdowns();
        
        // Close modal first, then show success message
        closeDeleteCategoryModal();
        showToast("Category deleted successfully!", "success");
        
        // Reload plans to reflect the deleted category
        loadPlans(currentCategory, sortSelect ? sortSelect.value : "");
    } catch (error) {
        console.error("Error deleting category:", error);
        showError("Failed to delete category. Please try again.");
    } finally {
        hideLoading();
    }
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
    if (!totalPlansCount || !popularPlansCount || !entertainmentPlansCount || !annualPlansCount) return;
    
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
    if (!paginationContainer) return;
    
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
    if (!searchInput) return;
    
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
    if (!plansBody) return;
    
    plansBody.innerHTML = "";
    
    if (!plans || plans.length === 0) {
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
        if (paginationContainer) paginationContainer.innerHTML = "";
        if (document.getElementById("startRecord")) document.getElementById("startRecord").textContent = "0";
        if (document.getElementById("endRecord")) document.getElementById("endRecord").textContent = "0";
        if (document.getElementById("totalRecords")) document.getElementById("totalRecords").textContent = "0";
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
    if (document.getElementById("startRecord")) document.getElementById("startRecord").textContent = plans.length > 0 ? startIndex + 1 : 0;
    if (document.getElementById("endRecord")) document.getElementById("endRecord").textContent = endIndex;
    if (document.getElementById("totalRecords")) document.getElementById("totalRecords").textContent = plans.length;
}

// Load all plans or filtered by category
async function loadPlans(category = "all", sortBy = "") {
    if (!plansBody) return;
    
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
        
        console.log("Loading plans from:", url);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        let plans = await response.json();
        console.log("Plans loaded:", plans);
        
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
        if (paginationContainer) paginationContainer.innerHTML = "";
    } finally {
        hideLoading();
    }
}

// Sort plans based on criteria
function sortPlans(sortBy) {
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

// Function to add a new category
async function addCategory() {
    const categoryNameElement = document.getElementById("categoryName");
    
    if (!categoryNameElement) {
        showError("Category name input not found.");
        return;
    }
    
    const categoryName = categoryNameElement.value.trim();
    
    // Validate required fields
    if (!categoryName) {
        showError("Please enter a category name.");
        return;
    }
    
    // Create the category object
    const category = {
        categoryName: categoryName
    };
    
    try {
        showLoading();
        console.log("Adding new category:", categoryName);
        const response = await fetch(`${API_URL}/categories`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(category)
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        const newCategory = await response.json();
        console.log("Category added successfully:", newCategory);
        
        // Update categories list
        if (!Array.isArray(allCategories)) {
            allCategories = [];
        }
        allCategories.push(newCategory);
        
        // Repopulate dropdowns
        populateCategoryDropdowns();
        
        // Close modal first, then show success message
        closeAddCategoryModal();
        
        // Clear input
        categoryNameElement.value = "";
        
        showToast("Category added successfully!", "success");
    } catch (error) {
        console.error("Error adding category:", error);
        showError("Failed to add category. Please try again.");
    } finally {
        hideLoading();
    }
}

// Function to add a new plan
async function addPlan() {
    const categoryIdElement = document.getElementById("categorySelect");
    const planNameElement = document.getElementById("planName");
    const planPriceElement = document.getElementById("planPrice");
    const validityDaysElement = document.getElementById("validityDays");
    const dataLimitElement = document.getElementById("dataLimit");
    const smsLimitElement = document.getElementById("smsLimit");
    const callLimitElement = document.getElementById("callLimit");
    
    if (!categoryIdElement || !planNameElement || !planPriceElement || !validityDaysElement || 
        !dataLimitElement || !smsLimitElement || !callLimitElement) {
        showError("One or more form elements not found.");
        return;
    }
    
    const categoryId = categoryIdElement.value;
    const planName = planNameElement.value;
    const planPrice = parseFloat(planPriceElement.value);
    const validityDays = parseInt(validityDaysElement.value);
    const dataLimit = dataLimitElement.value;
    const smsLimit = smsLimitElement.value;
    const callLimit = callLimitElement.value;
    
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
    const includeNetflix = document.getElementById("includeNetflix");
    if (includeNetflix && includeNetflix.checked) {
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
    const includePrimeVideo = document.getElementById("includePrimeVideo");
    if (includePrimeVideo && includePrimeVideo.checked) {
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
    const includeHotstar = document.getElementById("includeHotstar");
    if (includeHotstar && includeHotstar.checked) {
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
    const includeDisney = document.getElementById("includeDisney");
    if (includeDisney && includeDisney.checked) {
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
        console.log("Adding new plan:", plan);
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
        
        console.log("Plan added successfully");
        
        // Close modal first, then show success message
        closeAddPlanModal();
        resetAddPlanForm();
        loadPlans(currentCategory, sortSelect ? sortSelect.value : "");
        
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
    const planIdElement = document.getElementById("editPlanId");
    const categoryIdElement = document.getElementById("editCategorySelect");
    const planNameElement = document.getElementById("editPlanName");
    const planPriceElement = document.getElementById("editPlanPrice");
    const validityDaysElement = document.getElementById("editValidityDays");
    const dataLimitElement = document.getElementById("editDataLimit");
    const smsLimitElement = document.getElementById("editSmsLimit");
    const callLimitElement = document.getElementById("editCallLimit");
    
    if (!planIdElement || !categoryIdElement || !planNameElement || !planPriceElement || 
        !validityDaysElement || !dataLimitElement || !smsLimitElement || !callLimitElement) {
        showError("One or more form elements not found.");
        return;
    }
    
    const planId = planIdElement.value;
    const categoryId = categoryIdElement.value;
    const planName = planNameElement.value;
    const planPrice = parseFloat(planPriceElement.value);
    const validityDays = parseInt(validityDaysElement.value);
    const dataLimit = dataLimitElement.value;
    const smsLimit = smsLimitElement.value;
    const callLimit = callLimitElement.value;
    
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
    const editIncludeNetflix = document.getElementById("editIncludeNetflix");
    if (editIncludeNetflix && editIncludeNetflix.checked) {
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
    const editIncludePrimeVideo = document.getElementById("editIncludePrimeVideo");
    if (editIncludePrimeVideo && editIncludePrimeVideo.checked) {
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
    const editIncludeHotstar = document.getElementById("editIncludeHotstar");
    if (editIncludeHotstar && editIncludeHotstar.checked) {
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
    const editIncludeDisney = document.getElementById("editIncludeDisney");
    if (editIncludeDisney && editIncludeDisney.checked) {
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
        console.log("Updating plan:", plan);
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
        
        console.log("Plan updated successfully");
        
        // Close modal first, then show success message
        closeEditPlanModal();
        loadPlans(currentCategory, sortSelect ? sortSelect.value : "");
        
        showToast("Plan updated successfully!", "success");
    } catch (error) {
        console.error("Error updating plan:", error);
        showError("Failed to update plan. Please try again.");
    } finally {
        hideLoading();
    }
}

// Function to deactivate a plan
async function deletePlan() {
    const planIdElement = document.getElementById("deletePlanId");
    
    if (!planIdElement) {
        showError("Plan ID not found.");
        return;
    }
    
    const planId = planIdElement.value;
    
    try {
        showLoading();
        console.log(`Deactivating plan with ID: ${planId}`);
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
        
        console.log("Plan deactivated successfully");
        
        // Close modal first, then show success message
        closeDeletePlanModal();
        loadPlans(currentCategory, sortSelect ? sortSelect.value : "");
        showToast("Plan deactivated successfully!", "success");
    } catch (error) {
        console.error("Error deactivating plan:", error);
        showError("Failed to deactivate plan. Please try again.");
    } finally {
        hideLoading();
    }
}

// Function to open edit plan modal
function openEditPlanModal(planId) {
    const plan = allPlans.find(p => p.planId === planId);
    if (!plan) {
        showError("Plan not found.");
        return;
    }
    
    // Make sure all required elements exist
    const editPlanIdEl = document.getElementById("editPlanId");
    const editCategorySelectEl = document.getElementById("editCategorySelect");
    const editPlanNameEl = document.getElementById("editPlanName");
    const editPlanPriceEl = document.getElementById("editPlanPrice");
    const editValidityDaysEl = document.getElementById("editValidityDays");
    const editDataLimitEl = document.getElementById("editDataLimit");
    const editSmsLimitEl = document.getElementById("editSmsLimit");
    const editCallLimitEl = document.getElementById("editCallLimit");
    
    if (!editPlanIdEl || !editCategorySelectEl || !editPlanNameEl || !editPlanPriceEl || 
        !editValidityDaysEl || !editDataLimitEl || !editSmsLimitEl || !editCallLimitEl) {
        showError("One or more edit form elements not found.");
        return;
    }
    
    // Set plan details
    editPlanIdEl.value = plan.planId;
    editCategorySelectEl.value = plan.category ? plan.category.categoryId : "";
    editPlanNameEl.value = plan.planName;
    editPlanPriceEl.value = plan.planPrice;
    editValidityDaysEl.value = plan.validityDays;
    editDataLimitEl.value = plan.dataLimit;
    editSmsLimitEl.value = plan.smsLimit;
    editCallLimitEl.value = plan.callLimit;
    
    // Reset OTT checkboxes
    if (editOttCheckboxes) {
        editOttCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
            const providerId = checkbox.getAttribute("data-provider");
            if (document.getElementById(`editNetflixPlans`)) document.getElementById(`editNetflixPlans`).classList.add("d-none");
            if (document.getElementById(`editPrimeVideoPlans`)) document.getElementById(`editPrimeVideoPlans`).classList.add("d-none");
            if (document.getElementById(`editHotstarPlans`)) document.getElementById(`editHotstarPlans`).classList.add("d-none");
            if (document.getElementById(`editDisneyPlans`)) document.getElementById(`editDisneyPlans`).classList.add("d-none");
        });
    }
    
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
    
    if (editPlanModal) {
        editPlanModal.style.display = "block";
        console.log("Opened edit plan modal for:", plan.planName);
    }
}

// Function to open delete plan modal
function openDeletePlanModal(planId, planName) {
    const plan = allPlans.find(p => p.planId === planId);
    if (!plan) {
        showError("Plan not found.");
        return;
    }
    
    if (!document.getElementById("deletePlanId") || !document.getElementById("deletePlanDetails") || 
        !document.getElementById("deletePlanName") || !deletePlanModal) {
        showError("One or more delete modal elements not found.");
        return;
    }
    
    document.getElementById("deletePlanId").value = planId;
    document.getElementById("deletePlanDetails").value = JSON.stringify(plan);
    document.getElementById("deletePlanName").textContent = planName;
    
    deletePlanModal.style.display = "block";
    console.log("Opened delete plan modal for:", planName);
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



// Function to close add category modal
function closeAddCategoryModal() {
    if (addCategoryModal) {
        addCategoryModal.style.display = "none";
        console.log("Closed add category modal");
    }
}





// Function to close add plan modal
function closeAddPlanModal() {
    if (addPlanModal) {
        addPlanModal.style.display = "none";
        console.log("Closed add plan modal");
    }
}

// Function to close edit plan modal
function closeEditPlanModal() {
    if (editPlanModal) {
        editPlanModal.style.display = "none";
        console.log("Closed edit plan modal");
    }
}

// Function to close delete plan modal
function closeDeletePlanModal() {
    if (deletePlanModal) {
        deletePlanModal.style.display = "none";
        console.log("Closed delete plan modal");
    }
}

// Function to reset add plan form
function resetAddPlanForm() {
    if (document.getElementById("categorySelect")) document.getElementById("categorySelect").value = "";
    if (document.getElementById("planName")) document.getElementById("planName").value = "";
    if (document.getElementById("planPrice")) document.getElementById("planPrice").value = "";
    if (document.getElementById("validityDays")) document.getElementById("validityDays").value = "";
    if (document.getElementById("dataLimit")) document.getElementById("dataLimit").value = "";
    if (document.getElementById("smsLimit")) document.getElementById("smsLimit").value = "";
    if (document.getElementById("callLimit")) document.getElementById("callLimit").value = "";
    
    // Reset OTT checkboxes
    if (ottCheckboxes) {
        ottCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    
    // Hide all OTT plan selections
    if (document.getElementById("netflixPlans")) document.getElementById("netflixPlans").classList.add("d-none");
    if (document.getElementById("primeVideoPlans")) document.getElementById("primeVideoPlans").classList.add("d-none");
    if (document.getElementById("hotstarPlans")) document.getElementById("hotstarPlans").classList.add("d-none");
    if (document.getElementById("disneyPlans")) document.getElementById("disneyPlans").classList.add("d-none");
}

// Event listener for category dropdown change
if (categoryDropdown) {
    categoryDropdown.addEventListener("change", (e) => {
        const selectedCategory = e.target.value;
        currentCategory = selectedCategory;
        loadPlans(selectedCategory, sortSelect ? sortSelect.value : "");
    });
}

// Event listener for sort select
if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
        sortPlans(e.target.value);
    });
}

// Event listeners for OTT checkboxes - add plan modal
if (ottCheckboxes) {
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
}

// Event listeners for OTT checkboxes - edit plan modal
if (editOttCheckboxes) {
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
}

// Event listeners for modal open buttons
if (addPlanBtn) {
    addPlanBtn.addEventListener("click", () => {
        resetAddPlanForm();
        if (addPlanModal) addPlanModal.style.display = "block";
    });
}

if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", () => {
        if (document.getElementById("categoryName")) document.getElementById("categoryName").value = "";
        if (addCategoryModal) addCategoryModal.style.display = "block";
    });
}

if (manageCategoriesBtn) {
    manageCategoriesBtn.addEventListener("click", () => {
        openManageCategoriesModal();
    });
}

// Form submission buttons
if (submitPlanBtn) submitPlanBtn.addEventListener("click", addPlan);
if (submitCategoryBtn) submitCategoryBtn.addEventListener("click", addCategory);
if (updateCategoryBtn) updateCategoryBtn.addEventListener("click", updateCategory);
if (confirmDeleteCategoryBtn) confirmDeleteCategoryBtn.addEventListener("click", deleteCategory);
if (saveEditBtn) saveEditBtn.addEventListener("click", updatePlan);
if (confirmDeleteBtn) confirmDeleteBtn.addEventListener("click", deletePlan);

// Close modals when clicking outside
window.addEventListener("click", (event) => {
    if (addPlanModal && event.target === addPlanModal) {
        closeAddPlanModal();
    }
    if (addCategoryModal && event.target === addCategoryModal) {
        closeAddCategoryModal();
    }
    if (editPlanModal && event.target === editPlanModal) {
        closeEditPlanModal();
    }
    if (deletePlanModal && event.target === deletePlanModal) {
        closeDeletePlanModal();
    }
    if (editCategoryModal && event.target === editCategoryModal) {
        closeEditCategoryModal();
    }
    if (deleteCategoryModal && event.target === deleteCategoryModal) {
        closeDeleteCategoryModal();
    }
    if (manageCategoriesModal && event.target === manageCategoriesModal) {
        closeManageCategoriesModal();
    }
});

// Initialize sidebar collapse functionality
const sidebarCollapseBtn = document.getElementById("sidebarCollapse");
if (sidebarCollapseBtn) {
    sidebarCollapseBtn.addEventListener("click", () => {
        const sidebar = document.getElementById("sidebar");
        const content = document.getElementById("content");
        if (sidebar && content) {
            sidebar.classList.toggle("active");
            content.classList.toggle("ml-0");
        }
    });
}

// Check if user is logged in
function checkUserAndRedirect() {
    const currentUser = sessionStorage.getItem('currentUser');
    
    if (!currentUser) {
      // No user found in sessionStorage, redirect to login page
      window.location.href = 'login.html';
    }
}

// Make functions available globally
window.openEditPlanModal = openEditPlanModal;
window.openDeletePlanModal = openDeletePlanModal;
window.openEditCategoryModal = openEditCategoryModal;
window.openDeleteCategoryModal = openDeleteCategoryModal;
window.openManageCategoriesModal = openManageCategoriesModal;
window.closeAddPlanModal = closeAddPlanModal;
window.closeEditPlanModal = closeEditPlanModal;
window.closeDeletePlanModal = closeDeletePlanModal;
window.closeAddCategoryModal = closeAddCategoryModal;
window.closeEditCategoryModal = closeEditCategoryModal;
window.closeDeleteCategoryModal = closeDeleteCategoryModal;
window.closeManageCategoriesModal = closeManageCategoriesModal;

