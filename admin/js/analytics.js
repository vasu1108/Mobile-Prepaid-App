// API URL
const API_URL = "http://localhost:8083";

// DOM Elements
const loadingContainer = document.getElementById('loading-container');
const totalRevenue = document.getElementById('totalRevenue');
const totalTransactions = document.getElementById('totalTransactions');
const avgTransactionValue = document.getElementById('avgTransactionValue');
const successRate = document.getElementById('successRate');
const recentTransactionsTable = document.getElementById('recentTransactionsTable');

// Toast
const toastEl = document.getElementById("notificationToast");
const toastMessage = document.getElementById("toastMessage");
let toast;

// Store transactions data
let transactionsData = [];

// Chart references
let transactionStatusChart;
let paymentMethodChart;
let transactionTrendChart;
let popularPlansChart;

// Color palette
const colors = {
    primary: '#9b87f5',
    secondary: '#7E69AB',
    success: '#4fd1c5',
    warning: '#ffc107',
    danger: '#ff5c75',
    info: '#63b3ed',
    purple: '#a78bfa',
    blue: '#6e59a5',
    green: '#38b2ac',
    orange: '#ff7c33',
    pink: '#f472b6'
};

// Define chart gradient colors
const chartColors = [
    colors.primary,
    colors.success,
    colors.purple,
    colors.orange,
    colors.info,
    colors.secondary,
    colors.warning,
    colors.pink
];

// Initialize Bootstrap components
document.addEventListener("DOMContentLoaded", () => {
    // Initialize toast
    toast = new bootstrap.Toast(toastEl);
    
    // Fetch transactions data
    fetchTransactions();
    
    // Sidebar Toggle
    document.getElementById('sidebarCollapse').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
        document.getElementById('content').classList.toggle('active');
        
        // Trigger resize event to update charts
        window.dispatchEvent(new Event('resize'));
    });
});

// Helper function to show loading spinner
function showLoading() {
    loadingContainer.style.display = 'flex';
}

// Helper function to hide loading spinner
function hideLoading() {
    loadingContainer.style.display = 'none';
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

// Format currency
function formatCurrency(amount) {
    return '₹' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Fetch transactions from API
async function fetchTransactions() {
    showLoading();
    
    try {
        const response = await fetch(`${API_URL}/transactions`);
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        let data = await response.json();
        
        // Ensure data is an array
        if (!Array.isArray(data)) {
            data = [data];
        }
        
        transactionsData = data;
        
        // Process data and update UI
        processTransactionData(transactionsData);
        
        // Show success message
        showToast("Analytics data loaded successfully!", "success");
        
    } catch (error) {
        console.error("Error fetching transactions:", error);
        showToast("Failed to load transaction data. Please try again.", "error");
    } finally {
        hideLoading();
    }
}

// Process transaction data and update UI
function processTransactionData(transactions) {
    // Update KPI stats
    updateKPIStats(transactions);
    
    // Update charts
    initializeCharts(transactions);
    
    // Update recent transactions table
    updateRecentTransactions(transactions);
}

// Update KPI stats
function updateKPIStats(transactions) {
    // Calculate total revenue
    const revenue = transactions.reduce((total, txn) => {
        return total + (txn.transactionAmount || 0);
    }, 0);
    
    // Calculate average transaction value
    const avgValue = transactions.length > 0 ? revenue / transactions.length : 0;
    
    // Calculate success rate
    const successfulTxns = transactions.filter(txn => 
        txn.transactionStatus && txn.transactionStatus.toLowerCase() === 'success'
    ).length;
    const successRateValue = transactions.length > 0 ? 
        (successfulTxns / transactions.length) * 100 : 0;
    
    // Update UI elements
    totalRevenue.textContent = formatCurrency(revenue);
    totalTransactions.textContent = transactions.length;
    avgTransactionValue.textContent = formatCurrency(avgValue);
    successRate.textContent = `${successRateValue.toFixed(0)}%`;
}

// Initialize or update all charts
function initializeCharts(transactions) {
    // Destroy existing charts if they exist
    destroyCharts();
    
    // Initialize charts with data
    initTransactionStatusChart(transactions);
    initPaymentMethodChart(transactions);
    initTransactionTrendChart(transactions);
    initPopularPlansChart(transactions);
}

// Destroy existing charts
function destroyCharts() {
    if (transactionStatusChart) transactionStatusChart.destroy();
    if (paymentMethodChart) paymentMethodChart.destroy();
    if (transactionTrendChart) transactionTrendChart.destroy();
    if (popularPlansChart) popularPlansChart.destroy();
}

// Initialize Transaction Status Distribution Chart
function initTransactionStatusChart(transactions) {
    // Group transactions by status
    const statusMap = {};
    
    transactions.forEach(txn => {
        let status = txn.transactionStatus ? txn.transactionStatus : 'Unknown';
        
        // Normalize status values
        status = status.toLowerCase();
        if (status === 'success') {
            status = 'Success';
        } else if (status === 'failed' || status === 'failure') {
            status = 'Failed';
        } else if (status === 'pending') {
            status = 'Pending';
        } else if (status === 'cancelled' || status === 'canceled') {
            status = 'Cancelled';
        } else {
            status = 'Other';
        }
        
        if (!statusMap[status]) {
            statusMap[status] = 0;
        }
        statusMap[status]++;
    });
    
    // Prepare data for chart
    const labels = Object.keys(statusMap);
    const data = Object.values(statusMap);
    
    // Define colors for different statuses
    const statusColors = {
        'Success': colors.success,
        'Failed': colors.danger,
        'Pending': colors.warning,
        'Cancelled': colors.orange,
        'Other': colors.secondary
    };
    
    // Create color array matching the order of labels
    const backgroundColors = labels.map(label => statusColors[label] || colors.primary);
    
    // Create chart
    const ctx = document.getElementById('transactionStatusChart').getContext('2d');
    transactionStatusChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1,
                borderColor: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${value} transactions (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize Payment Method Chart
function initPaymentMethodChart(transactions) {
    // Group transactions by payment method
    const paymentMethodMap = {};
    
    transactions.forEach(txn => {
        if (txn.paymentMode) {
            if (!paymentMethodMap[txn.paymentMode]) {
                paymentMethodMap[txn.paymentMode] = 0;
            }
            paymentMethodMap[txn.paymentMode]++;
        }
    });
    
    // Prepare data for chart
    const labels = Object.keys(paymentMethodMap);
    const data = Object.values(paymentMethodMap);
    
    // Create chart
    const ctx = document.getElementById('paymentMethodChart').getContext('2d');
    paymentMethodChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: chartColors,
                borderWidth: 1,
                borderColor: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${value} transactions (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize Transaction Trend Chart
function initTransactionTrendChart(transactions) {
    // Group transactions by date and count
    const dateFormat = date => {
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(a.transactionDate) - new Date(b.transactionDate)
    );
    
    // Group by date
    const dailyTransactions = {};
    const dailyRevenue = {};
    
    sortedTransactions.forEach(txn => {
        if (txn.transactionDate) {
            const dateKey = dateFormat(txn.transactionDate);
            
            if (!dailyTransactions[dateKey]) {
                dailyTransactions[dateKey] = 0;
                dailyRevenue[dateKey] = 0;
            }
            
            dailyTransactions[dateKey]++;
            dailyRevenue[dateKey] += (txn.transactionAmount || 0);
        }
    });
    
    // Get the last 7 days of data or all if less than 7
    const datesArray = Object.keys(dailyTransactions);
    const labels = datesArray.slice(-7);
    
    const transactionData = labels.map(date => dailyTransactions[date] || 0);
    const revenueData = labels.map(date => dailyRevenue[date] || 0);
    
    // Create chart
    const ctx = document.getElementById('transactionTrendChart').getContext('2d');
    transactionTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Transactions',
                    data: transactionData,
                    borderColor: colors.primary,
                    backgroundColor: 'rgba(155, 135, 245, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: colors.primary,
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.3,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Revenue',
                    data: revenueData,
                    borderColor: colors.success,
                    borderDash: [5, 5],
                    borderWidth: 2,
                    pointBackgroundColor: colors.success,
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.3,
                    fill: false,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    title: {
                        display: true,
                        text: 'Transactions'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Revenue (₹)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.label === 'Revenue') {
                                return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                            } 
                            return `${context.dataset.label}: ${context.raw}`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize Popular Plans Chart
function initPopularPlansChart(transactions) {
    // Group transactions by plan name and calculate revenue
    const planRevenueMap = {};
    
    transactions.forEach(txn => {
        if (txn.plan && txn.plan.planName) {
            const planName = txn.plan.planName;
            if (!planRevenueMap[planName]) {
                planRevenueMap[planName] = 0;
            }
            planRevenueMap[planName] += (txn.transactionAmount || 0);
        }
    });
    
    // Sort by revenue (descending) and limit to top 5 plans
    const sortedPlans = Object.entries(planRevenueMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    // Prepare data for chart
    const labels = sortedPlans.map(item => item[0]);
    const data = sortedPlans.map(item => item[1]);
    
    // Create chart
    const ctx = document.getElementById('popularPlansChart').getContext('2d');
    
    // Create horizontal bar chart
    popularPlansChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue',
                data: data,
                backgroundColor: colors.primary,
                borderColor: colors.secondary,
                borderWidth: 1,
                barPercentage: 0.5,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Revenue: ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            }
        }
    });
}

// Update Recent Transactions Table
function updateRecentTransactions(transactions) {
    // Sort transactions by date (descending) and limit to 5
    const recentTxns = [...transactions]
        .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
        .slice(0, 5);
    
    // Clear current table
    recentTransactionsTable.innerHTML = '';
    
    // Populate table with recent transactions
    recentTxns.forEach(txn => {
        const row = document.createElement('tr');
        
        // Set status class based on transaction status
        let statusClass = 'pending';
        if (txn.transactionStatus && txn.transactionStatus.toLowerCase() === 'success') {
            statusClass = 'success';
        } else if (txn.transactionStatus && txn.transactionStatus.toLowerCase() === 'failed') {
            statusClass = 'failed';
        }
        
        row.innerHTML = `
            <td>
                <span class="text-muted text-truncate">${txn.transactionId || 'N/A'}</span>
            </td>
            <td>
                <div class="d-flex flex-column">
                    <span class="fw-medium">${txn.user ? txn.user.name : 'N/A'}</span>
                    <small class="text-muted">${txn.user ? txn.user.mobileNumber : ''}</small>
                </div>
            </td>
            <td>
                <span>${txn.plan ? txn.plan.planName : 'N/A'}</span>
            </td>
            <td>
                <span class="fw-medium">${formatCurrency(txn.transactionAmount || 0)}</span>
            </td>
            <td>
                <span>${txn.paymentMode || 'N/A'}</span>
            </td>
            <td>
                <span>${formatDate(txn.transactionDate)}</span>
            </td>
            <td>
                <span class="status-badge ${statusClass}">${txn.transactionStatus || 'Pending'}</span>
            </td>
        `;
        
        recentTransactionsTable.appendChild(row);
    });
    
    // If no transactions, show message
    if (recentTxns.length === 0) {
        recentTransactionsTable.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <div class="py-5">
                        <i class="bi bi-inbox" style="font-size: 2rem; color: var(--text-muted);"></i>
                        <p class="mt-3 text-muted">No transactions found</p>
                    </div>
                </td>
            </tr>
        `;
    }
}
function checkUserAndRedirect() {
    const currentUser = sessionStorage.getItem('currentUser');
    
    if (!currentUser) {
      // No user found in sessionStorage, redirect to login page
      window.location.href = 'login.html';
    }
  }
  
  // Call this function when your page loads
  document.addEventListener('DOMContentLoaded', checkUserAndRedirect);