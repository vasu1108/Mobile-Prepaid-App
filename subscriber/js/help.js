document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations when elements come into view
    initializeAnimations();
    
    // Quick link filter functionality
    initializeQuickLinks();
    
    // Search functionality
    initializeSearch();
    
    // Video play button functionality
    initializeVideoButtons();
    
    // Contact form submission
    initializeContactForm();
});
// Function to handle animations on scroll
function initializeAnimations() {
    // Get all elements with animate__animated class that aren't already animated
    const animatedElements = document.querySelectorAll('.animate__animated:not(.animate__fadeIn):not(.animate__fadeInLeft):not(.animate__fadeInRight):not(.animate__fadeInUp)');
    
    // Create observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // If element is in viewport
            if (entry.isIntersecting) {
                // Add the animation class
                entry.target.classList.add('animate__fadeIn');
                // Stop observing the element
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.1,
        rootMargin: "0px"
    });
    
    // Observe each element
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}
// Function to handle quick link filtering
function initializeQuickLinks() {
    const quickLinkCards = document.querySelectorAll('.quick-link-card');
    
    quickLinkCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Scroll to FAQ section
            const faqSection = document.getElementById('faq-section');
            faqSection.scrollIntoView({ behavior: 'smooth' });
            
            // Find and click the corresponding tab
            setTimeout(() => {
                const tabButton = document.querySelector(`button[data-bs-target="#${category}-tab-pane"]`);
                if (tabButton) {
                    tabButton.click();
                } else {
                    // If no specific tab, show all and highlight the category
                    document.querySelector('button[data-bs-target="#all-tab-pane"]').click();
                    highlightCategoryQuestions(category);
                }
            }, 500);
        });
    });
}
// Function to highlight questions of a specific category in "All" tab
function highlightCategoryQuestions(category) {
    // Reset all questions
    const allItems = document.querySelectorAll('#accordionAllFAQs .accordion-item');
    allItems.forEach(item => {
        item.classList.remove('highlight-item');
    });
    
    // Highlight questions of the selected category
    const categoryItems = document.querySelectorAll(`#accordionAllFAQs .accordion-item[data-category="${category}"]`);
    categoryItems.forEach(item => {
        item.classList.add('highlight-item');
        
        // Expand the first item in the category
        if (categoryItems[0]) {
            const firstButton = categoryItems[0].querySelector('.accordion-button');
            const firstCollapse = categoryItems[0].querySelector('.accordion-collapse');
            
            if (firstButton && !firstButton.classList.contains('collapsed')) {
                firstButton.click();
            }
            
            setTimeout(() => {
                if (firstButton && firstButton.classList.contains('collapsed')) {
                    firstButton.click();
                }
            }, 300);
        }
    });
}
// Function to handle search functionality
function initializeSearch() {
    const searchInput = document.getElementById('search-faq');
    
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            // If enter key is pressed or search term is at least 3 characters
            if (e.key === 'Enter' || (searchTerm.length >= 3 && e.key !== 'Backspace')) {
                searchFAQs(searchTerm);
            }
            
            // If search term is cleared
            if (searchTerm === '') {
                resetFAQSearch();
            }
        });
        
        // Search button click
        const searchButton = searchInput.nextElementSibling;
        if (searchButton) {
            searchButton.addEventListener('click', function() {
                const searchTerm = searchInput.value.toLowerCase();
                if (searchTerm.length > 0) {
                    searchFAQs(searchTerm);
                }
            });
        }
    }
}
// Function to search FAQs
function searchFAQs(searchTerm) {
    // Always set to all tab when searching
    document.querySelector('button[data-bs-target="#all-tab-pane"]').click();
    
    const accordionItems = document.querySelectorAll('#accordionAllFAQs .accordion-item');
    let foundResults = false;
    
    accordionItems.forEach(item => {
        const questionText = item.querySelector('.accordion-button').textContent.toLowerCase();
        const answerText = item.querySelector('.accordion-body').textContent.toLowerCase();
        
        // Check if search term is in question or answer
        if (questionText.includes(searchTerm) || answerText.includes(searchTerm)) {
            item.classList.add('search-result');
            
            // Expand this item
            const button = item.querySelector('.accordion-button');
            if (button.classList.contains('collapsed')) {
                button.click();
            }
            
            foundResults = true;
        } else {
            item.classList.remove('search-result');
            
            // Collapse this item
            const button = item.querySelector('.accordion-button');
            if (!button.classList.contains('collapsed')) {
                button.click();
            }
        }
    });
    
    // Scroll to the FAQ section
    document.getElementById('faq-section').scrollIntoView({ behavior: 'smooth' });
    
    // Update UI to show search results
    if (!foundResults) {
        showNoResultsMessage();
    } else {
        hideNoResultsMessage();
    }
}
// Function to reset FAQ search
function resetFAQSearch() {
    const accordionItems = document.querySelectorAll('#accordionAllFAQs .accordion-item');
    
    accordionItems.forEach(item => {
        item.classList.remove('search-result');
    });
    
    hideNoResultsMessage();
}
// Function to show "No results" message
function showNoResultsMessage() {
    let noResultsMessage = document.getElementById('no-results-message');
    
    if (!noResultsMessage) {
        noResultsMessage = document.createElement('div');
        noResultsMessage.id = 'no-results-message';
        noResultsMessage.className = 'alert alert-info mt-3';
        noResultsMessage.textContent = 'No FAQs found matching your search term. Please try a different search.';
        
        const tabContent = document.getElementById('all-tab-pane');
        tabContent.insertBefore(noResultsMessage, tabContent.firstChild);
    }
    
    noResultsMessage.style.display = 'block';
}
// Function to hide "No results" message
function hideNoResultsMessage() {
    const noResultsMessage = document.getElementById('no-results-message');
    if (noResultsMessage) {
        noResultsMessage.style.display = 'none';
    }
}
// Function to handle video play buttons
function initializeVideoButtons() {
    const playButtons = document.querySelectorAll('.play-button');
    
    playButtons.forEach(button => {
        button.addEventListener('click', function() {
            // In a real implementation, this would open a video modal
            // For demonstration, we'll just create an alert
            const videoCard = this.closest('.video-card');
            const videoTitle = videoCard.querySelector('h4').textContent;
            
            alert(`Playing video: ${videoTitle}`);
            
            // Actual implementation would include:
            // 1. Create a modal with video player
            // 2. Set the video source
            // 3. Show the modal
            // 4. Autoplay the video
        });
    });
}
// Function to handle contact form submission
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulate form submission
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            
            // Show loading state
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';
            submitButton.disabled = true;
            
            // Simulate API call delay
            setTimeout(() => {
                // Reset button state
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
                
                // Show success message
                showSubmissionMessage(true);
                
                // Reset form
                contactForm.reset();
            }, 1500);
        });
    }
}
// Function to show form submission message
function showSubmissionMessage(success) {
    // Create message container if it doesn't exist
    let messageContainer = document.getElementById('contact-form-message');
    
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'contact-form-message';
        messageContainer.className = success ? 'alert alert-success mt-3 animate__animated animate__fadeIn' : 'alert alert-danger mt-3 animate__animated animate__fadeIn';
        
        const contactForm = document.getElementById('contactForm');
        contactForm.parentNode.insertBefore(messageContainer, contactForm.nextSibling);
    } else {
        messageContainer.className = success ? 'alert alert-success mt-3 animate__animated animate__fadeIn' : 'alert alert-danger mt-3 animate__animated animate__fadeIn';
    }
    
    messageContainer.textContent = success ? 
        'Your message has been sent successfully! Our team will get back to you soon.' : 
        'There was an error sending your message. Please try again.';
    
    // Auto-hide the message after 5 seconds
    setTimeout(() => {
        messageContainer.classList.add('animate__fadeOut');
        
        // Remove the element after animation completes
        setTimeout(() => {
            if (messageContainer.parentNode) {
                messageContainer.parentNode.removeChild(messageContainer);
            }
        }, 1000);
    }, 5000);
}
// Utility function to add logout functionality
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // In a real application, this would clear user session and redirect to login
        window.location.href = 'index.html';
    }
};

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