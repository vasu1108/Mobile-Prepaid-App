document.addEventListener("DOMContentLoaded", function () {
    // Color palette from the provided image
    const colors = {
        primary: '#9b87f5',    // Dark
        secondary: '#7E69AB',  // Gray
        accent1: '#4fd1c5',    // Mauve
        accent2: '#8B7A84',    // Dusty Rose
        accent3: '#63b3ed'     // Deep Gray
    };
    // Common Chart.js configuration
    Chart.defaults.font.family = "'Segoe UI', 'Arial', sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.plugins.legend.position = 'bottom';
    // Revenue Distribution by Plan Type (Pie Chart)
    const revenueDistribution = new Chart(
        document.getElementById('revenueDistributionChart'),
        {
            type: 'pie',
            data: {
                labels: ['Gold Plan', 'Silver Plan', 'Platinum Plan', 'Basic Plan'],
                datasets: [{
                    data: [40, 25, 20, 15],
                    backgroundColor: [
                        colors.primary,
                        colors.secondary,
                        colors.accent1,
                        colors.accent2
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        }
    );
    // Payment Method Usage (Bar Chart)
    const paymentMethod = new Chart(
        document.getElementById('paymentMethodChart'),
        {
            type: 'bar',
            data: {
                labels: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking'],
                datasets: [{
                    label: 'Usage Percentage',
                    data: [45, 25, 20, 10],
                    backgroundColor: colors.accent1,
                    borderColor: colors.primary,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => value + '%'
                        }
                    }
                }
            }
        }
    );
    // Monthly Revenue Growth (Line Chart)
    const revenueGrowth = new Chart(
        document.getElementById('revenueGrowthChart'),
        {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue ($)',
                    data: [30000, 35000, 32000, 40000, 45000, 50000],
                    borderColor: colors.accent2,
                    backgroundColor: colors.accent2 + '20',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => '$' + value.toLocaleString()
                        }
                    }
                }
            }
        }
    );
    // Daily Recharge Volume (Bar Chart)
    const rechargeVolume = new Chart(
        document.getElementById('rechargeVolumeChart'),
        {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Number of Recharges',
                    data: [120, 150, 140, 160, 180, 200, 170],
                    backgroundColor: colors.secondary,
                    borderColor: colors.primary,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        }
    );
    // Sidebar Toggle
    document.getElementById('sidebarCollapse').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
        document.getElementById('content').classList.toggle('active');
        
        // Trigger resize event to update charts
        window.dispatchEvent(new Event('resize'));
    });
});