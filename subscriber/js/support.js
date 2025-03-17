document.addEventListener('DOMContentLoaded', function() {
    // Initialize ticket number and array to store tickets
    let tickets = [];
    
    // Get form and add submit event listener
    const supportForm = document.getElementById('supportForm');
    supportForm.addEventListener('submit', handleFormSubmit);
    
    // Initialize mobile validation
    const mobileInput = document.getElementById('mobile');
    mobileInput.addEventListener('input', function() {
        validateMobile(this);
    });
    
    // Function to validate mobile number
    function validateMobile(input) {
        input.value = input.value.replace(/\D/g, ''); // Remove non-numeric characters
    }
    
    // Function to handle form submission
    function handleFormSubmit(event) {
        event.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const mobile = document.getElementById('mobile').value;
        const email = document.getElementById('email').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        
        // Validate mobile number
        if (mobile.length !== 10) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }
        
        // Generate random ticket ID
        const ticketId = generateTicketId();
        
        // Create new ticket object
        const newTicket = {
            id: ticketId,
            name: name,
            mobile: mobile,
            email: email,
            category: category,
            description: description,
            dateTime: new Date(),
            status: 'Pending'
        };
        
        // Add ticket to array
        tickets.push(newTicket);
        
        // Update UI
        updateTicketsList();
        
        // Show success modal
        showSuccessModal(ticketId);
        
        // Reset form
        supportForm.reset();
    }
    
    // Function to generate random ticket ID
    function generateTicketId() {
        const prefix = 'MC';
        const timestamp = new Date().getTime().toString().slice(-6);
        const random = Math.floor(Math.random() * 9000) + 1000;
        return `${prefix}${timestamp}${random}`;
    }
    
    // Function to update tickets list in UI
    function updateTicketsList() {
        const ticketHistory = document.getElementById('ticketHistory');
        const ticketList = document.getElementById('ticketList');
        
        // Show ticket history section if there are tickets
        if (tickets.length > 0) {
            ticketHistory.classList.remove('d-none');
            
            // Clear current list
            ticketList.innerHTML = '';
            
            // Add tickets to list (newest first)
            tickets.slice().reverse().forEach(ticket => {
                const row = document.createElement('tr');
                
                // Format date
                const date = new Date(ticket.dateTime);
                const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                
                row.innerHTML = `
                    <td><strong>${ticket.id}</strong></td>
                    <td>${formattedDate}</td>
                    <td>${ticket.category}</td>
                    <td><span class="ticket-status status-pending">${ticket.status}</span></td>
                `;
                
                ticketList.appendChild(row);
            });
        }
    }
    
    // Function to show success modal
    function showSuccessModal(ticketId) {
        const modalTicketId = document.getElementById('modalTicketId');
        modalTicketId.textContent = ticketId;
        
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();
    }
    
    // Function to logout
    window.logout = function() {
        localStorage.removeItem("isLoggedIn"); // Remove login status
        window.location.href = "index.html"; // Redirect to login page
    };
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
});