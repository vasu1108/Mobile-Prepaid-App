document.addEventListener('DOMContentLoaded', function() {
    // Sample data for subscribers
    const subscribers = [
        { mobile: '9876543210', name: 'John Doe', plan: 'Gold' },
        { mobile: '8765432109', name: 'Jane Smith', plan: 'Silver' },
        { mobile: '7654321098', name: 'Mike Johnson', plan: 'Platinum' }
    ];

    // Populate table
    const tableBody = document.getElementById('subscriberTable');
    subscribers.forEach(sub => {
        let row = `<tr>
            <td>${sub.mobile}</td>
            <td>${sub.name}</td>
            <td><span class="badge bg-${getBadgeColor(sub.plan)}">${sub.plan}</span></td>
            <td>
                <button class='btn btn-info btn-sm me-2'>
                    <i class="bi bi-clock-history me-1"></i>History
                </button> 
                <button class='btn btn-warning btn-sm'>
                    <i class="bi bi-bell me-1"></i>Notify
                </button>
            </td>
        </tr>`;
        tableBody.innerHTML += row;
    });

    // Helper function for badge colors
    function getBadgeColor(plan) {
        switch(plan.toLowerCase()) {
            case 'gold':
                return 'warning';
            case 'silver':
                return 'secondary';
            case 'platinum':
                return 'info';
            default:
                return 'primary';
        }
    }

    // Initialize Charts
    // Pie Chart - Most Recharged Plans
    new Chart(document.getElementById('pieChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Gold', 'Silver', 'Platinum'],
            datasets: [{
                data: [40, 35, 25],
                backgroundColor: ['#9b87f5', '#63b3ed', '#4fd1c5'],
                borderWidth: 0
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
                        usePointStyle: true
                    }
                }
            },
            cutout: '75%'
        }
    });

    // Bar Chart - Monthly Revenue
    new Chart(document.getElementById('barChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue',
                data: [500, 600, 700, 800, 650, 750],
                backgroundColor: '#9b87f5',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Sidebar Toggle
    document.getElementById('sidebarCollapse').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
    });

    // Add click handlers for notifications and profile menu
    document.querySelector('.notifications').addEventListener('click', () => {
        // Add notification panel logic here
        console.log('Notifications clicked');
    });

    document.querySelector('.profile-menu').addEventListener('click', () => {
        // Add profile menu logic here
        console.log('Profile menu clicked');
    });
});