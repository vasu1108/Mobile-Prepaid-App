document.addEventListener("DOMContentLoaded", function () {
    const users = [
        {
            name: "John Doe",
            mobile: "9876543210",
            emailId: "john.doe@email.com",
            plan: "Gold",
            planPrice: "₹300",
            expiryDate: "2025-03-10",
            status: "Active",
            rechargeHistory: [
                {
                    date: "2024-03-01",
                    time: "14:30",
                    plan: "Gold",
                    price: "₹300",
                    validity: "28 days",
                    data: "2GB/day",
                    calls: "Unlimited",
                    sms: "100/day"
                },
                {
                    date: "2024-02-01",
                    time: "10:15",
                    plan: "Gold",
                    price: "₹300",
                    validity: "28 days",
                    data: "2GB/day",
                    calls: "Unlimited",
                    sms: "100/day"
                }
            ]
        },
        {
            name: "Jane Smith",
            mobile: "8765432109",
            emailId: "jane.smith@email.com",
            plan: "Silver",
            planPrice: "₹200",
            expiryDate: "2025-02-28",
            status: "Inactive",
            rechargeHistory: [
                {
                    date: "2024-02-15",
                    time: "09:45",
                    plan: "Silver",
                    price: "₹200",
                    validity: "28 days",
                    data: "1.5GB/day",
                    calls: "Unlimited",
                    sms: "100/day"
                }
            ]
        },
        {
            name: "Mike Johnson",
            mobile: "7654321098",
            emailId: "mike.j@email.com",
            plan: "Platinum",
            planPrice: "₹500",
            expiryDate: "2025-04-15",
            status: "Active",
            rechargeHistory: [
                {
                    date: "2024-03-05",
                    time: "16:20",
                    plan: "Platinum",
                    price: "₹500",
                    validity: "28 days",
                    data: "3GB/day",
                    calls: "Unlimited",
                    sms: "Unlimited"
                }
            ]
        },
        {
            name: "Alice Brown",
            mobile: "6543210987",
            emailId: "alice.b@email.com",
            plan: "Diamond",
            planPrice: "₹400",
            expiryDate: "2025-03-20",
            status: "Active",
            rechargeHistory: [
                {
                    date: "2024-03-10",
                    time: "12:00",
                    plan: "Diamond",
                    price: "₹400",
                    validity: "30 days",
                    data: "2.5GB/day",
                    calls: "Unlimited",
                    sms: "150/day"
                }
            ]
        },
        {
            name: "Robert Williams",
            mobile: "5432109876",
            emailId: "robert.w@email.com",
            plan: "Bronze",
            planPrice: "₹270",
            expiryDate: "2025-02-25",
            status: "Inactive",
            rechargeHistory: [
                {
                    date: "2024-01-25",
                    time: "08:30",
                    plan: "Bronze",
                    price: "₹270",
                    validity: "28 days",
                    data: "1GB/day",
                    calls: "Unlimited",
                    sms: "50/day"
                }
            ]
        },
        {
            name: "Sophia Martinez",
            mobile: "4321098765",
            emailId: "sophia.m@email.com",
            plan: "Premium",
            planPrice: "₹600",
            expiryDate: "2025-05-01",
            status: "Active",
            rechargeHistory: [
                {
                    date: "2024-03-15",
                    time: "18:45",
                    plan: "Premium",
                    price: "₹600",
                    validity: "35 days",
                    data: "4GB/day",
                    calls: "Unlimited",
                    sms: "200/day"
                }
            ]
        },
        {
            name: "Daniel Clark",
            mobile: "3210987654",
            emailId: "daniel.c@email.com",
            plan: "Standard",
            planPrice: "₹250",
            expiryDate: "2025-03-05",
            status: "Active",
            rechargeHistory: [
                {
                    date: "2024-02-10",
                    time: "14:00",
                    plan: "Standard",
                    price: "₹250",
                    validity: "28 days",
                    data: "1.8GB/day",
                    calls: "Unlimited",
                    sms: "100/day"
                }
            ]
        }
    ];


    const usersTableBody = document.getElementById("usersTableBody");
    const searchInput = document.getElementById("searchInput");
    const filterField = document.getElementById("filterField");
    const sortBy = document.getElementById("sortBy");
    const sortOrder = document.getElementById("sortOrder");

    function updateStatsCounts() {
        const activeUsers = users.filter(user => user.status === "Active").length;
        const inactiveUsers = users.filter(user => user.status === "Inactive").length;
        
        document.getElementById("activeUsersCount").textContent = activeUsers;
        document.getElementById("inactiveUsersCount").textContent = inactiveUsers;
        document.getElementById("allUsersCount").textContent = users.length;
    }

    function compareValues(a, b, sortField, order) {
        let valueA, valueB;

        // Handle special cases for different fields
        if (sortField === 'planPrice') {
            valueA = parseFloat(a[sortField].replace('$', ''));
            valueB = parseFloat(b[sortField].replace('$', ''));
        } else if (sortField === 'expiryDate') {
            valueA = new Date(a[sortField]);
            valueB = new Date(b[sortField]);
        } else {
            valueA = a[sortField];
            valueB = b[sortField];
        }
        
        if (valueA < valueB) return order === 'asc' ? -1 : 1;
        if (valueA > valueB) return order === 'asc' ? 1 : -1;
        return 0;
    }

    function loadUsers(statusFilter = "All") {
        let filteredUsers = statusFilter === "All" ? [...users] : users.filter(user => user.status === statusFilter);
        
        // Apply search filter
        const searchTerm = searchInput.value.toLowerCase();
        const searchField = filterField.value;
        
        if (searchTerm) {
            filteredUsers = filteredUsers.filter(user => {
                if (searchField === 'all') {
                    return Object.values(user).some(value => 
                        String(value).toLowerCase().includes(searchTerm)
                    );
                }
                return String(user[searchField]).toLowerCase().includes(searchTerm);
            });
        }

        // Apply sorting
        const sortField = sortBy.value;
        const order = sortOrder.value;
        filteredUsers.sort((a, b) => compareValues(a, b, sortField, order));

        // Render table
        usersTableBody.innerHTML = "";
        filteredUsers.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.mobile}</td>
                <td>${user.plan}</td>
                <td>${user.planPrice}</td>
                <td>${user.expiryDate}</td>
                <td><span class="badge bg-${user.status === 'Active' ? 'success' : 'danger'}">${user.status}</span></td>
                <td>
                    <button class="btn btn-info btn-sm history-btn">
                        <i class="bi bi-clock-history"></i> History
                    </button>
                </td>
            `;
            
            // Add click event listener to the history button
            const historyBtn = row.querySelector('.history-btn');
            historyBtn.addEventListener('click', () => viewHistory(user));
            
            usersTableBody.appendChild(row);
        });
    }

    // Event Listeners
    document.getElementById("activeUsersCard").addEventListener("click", () => loadUsers("Active"));
    document.getElementById("inactiveUsersCard").addEventListener("click", () => loadUsers("Inactive"));
    document.getElementById("allUsersCard").addEventListener("click", () => loadUsers("All"));
    
    searchInput.addEventListener("input", () => loadUsers("All"));
    filterField.addEventListener("change", () => loadUsers("All"));
    sortBy.addEventListener("change", () => loadUsers("All"));
    sortOrder.addEventListener("change", () => loadUsers("All"));

    function viewHistory(user) {
        // Update modal content
        document.getElementById('modalUserName').textContent = user.name;
        document.getElementById('modalUserMobile').textContent = user.mobile;
        document.getElementById('modalUserEmail').textContent = user.emailId;

        const historyTableBody = document.getElementById('historyTableBody');
        historyTableBody.innerHTML = '';
        
        user.rechargeHistory.forEach(record => {
            historyTableBody.innerHTML += `
                <tr>
                    <td>${record.date}</td>
                    <td>${record.time}</td>
                    <td>${record.plan}</td>
                    <td>${record.price}</td>
                    <td>${record.validity}</td>
                    <td>${record.data}</td>
                    <td>${record.calls}</td>
                    <td>${record.sms}</td>
                </tr>
            `;
        });

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('historyModal'));
        modal.show();
    }

    window.downloadPDF = function() {
        // Create a clone of the modal content for PDF
        const content = document.getElementById('modalContent').cloneNode(true);
        
        // Add MOBI-COMM header
        const header = document.createElement('h1');
        header.className = 'pdf-header';
        header.textContent = 'MOBI-COMM';
        content.insertBefore(header, content.firstChild);

        // PDF options
        const opt = {
            margin: 1,
            filename: 'user-history.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Generate PDF
        html2pdf().set(opt).from(content).save();
    };

    // Sidebar Toggle
    document.getElementById('sidebarCollapse').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
    });

    // Initialize
    updateStatsCounts();
    loadUsers();
});