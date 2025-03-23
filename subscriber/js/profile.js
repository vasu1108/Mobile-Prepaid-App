document.addEventListener('DOMContentLoaded', function() {
    // Track modified fields
    let modifiedFields = {};
    let originalUserData = null;
    let userId = null;
    let toast;
    
    // Initialize toast
    const toastElement = document.getElementById('toast');
    if (toastElement) {
        toast = new bootstrap.Toast(toastElement);
    }

    // Function to show toast notification
    function showToast(title, message, isSuccess = true) {
        const toastTitle = document.getElementById('toast-title');
        const toastMessage = document.getElementById('toast-message');
        
        if (toastTitle && toastMessage) {
            toastTitle.textContent = title;
            toastMessage.textContent = message;
            
            // Set icon based on success/error
            const toastIcon = document.querySelector('.toast-header i');
            if (toastIcon) {
                if (isSuccess) {
                    toastIcon.className = 'bi bi-check-circle-fill text-success me-2';
                } else {
                    toastIcon.className = 'bi bi-exclamation-circle-fill text-danger me-2';
                }
            }
            
            toast.show();
        }
    }

    // Function to fetch user data
    async function fetchUserData() {
        try {
            // Get user from localStorage
            const storedUserString = localStorage.getItem("currentUserDetails");
            if (!storedUserString) {
                showToast("Error", "Please login to view your profile.", false);
                return;
            }
            
            const storedUser = JSON.parse(storedUserString);
            userId = storedUser.userId;
            
            if (!userId) {
                showToast("Error", "User information is incomplete. Please login again.", false);
                return;
            }
            
            // Fetch user details
            const response = await fetch(`http://localhost:8083/user-details/fetch/${userId}`);
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            
            const userData = await response.json();
            originalUserData = userData;
            
            // Update user name and mobile in header
            document.getElementById('user-name').textContent = userData.user.name;
            document.getElementById('user-mobile').textContent = userData.user.mobileNumber;
            
            // Build the form
            buildProfileForm(userData);
            
        } catch (error) {
            console.error('Error fetching user data:', error);
            document.getElementById('settings-form').innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-circle-fill me-2"></i>
                    Failed to load profile: ${error.message}
                </div>
            `;
        }
    }
    
    // Function to build profile form
    function buildProfileForm(userData) {
        const form = document.getElementById('settings-form');
        form.innerHTML = ''; // Clear loading spinner
        
        // Create form structure
        const fields = [
            { key: 'email', label: 'Email Address', value: userData.user.userEmail, editable: true, section: 'Contact Information', icon: 'bi-envelope' },
            { key: 'dateOfBirth', label: 'Date of Birth', value: userData.dateOfBirth, editable: false, section: 'Personal Information', icon: 'bi-calendar' },
            { key: 'mobileNumber', label: 'Mobile Number', value: userData.user.mobileNumber, editable: false, section: 'Contact Information', icon: 'bi-phone' },
            { key: 'alternateContact', label: 'Alternate Contact', value: userData.alternateContact, editable: true, section: 'Contact Information', icon: 'bi-telephone' },
            { key: 'communicationLanguage', label: 'Communication Language', value: userData.communicationLanguage, editable: true, section: 'Preferences', icon: 'bi-translate' },
            { key: 'workDetails', label: 'Work Details', value: userData.workDetails, editable: true, section: 'Additional Information', icon: 'bi-briefcase' },
            { key: 'userAddress', label: 'Address', value: userData.userAddress, editable: true, section: 'Contact Information', icon: 'bi-geo-alt' }
        ];
        
        // Group fields by section
        const sections = {};
        fields.forEach(field => {
            if (!sections[field.section]) {
                sections[field.section] = [];
            }
            sections[field.section].push(field);
        });
        
        // Create section containers
        for (const [sectionName, sectionFields] of Object.entries(sections)) {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'mb-4';
            
            const sectionTitle = document.createElement('h5');
            sectionTitle.className = 'border-bottom pb-2 mb-3';
            sectionTitle.textContent = sectionName;
            sectionDiv.appendChild(sectionTitle);
            
            // Add fields to section
            sectionFields.forEach(field => {
                sectionDiv.appendChild(createField(field));
            });
            
            form.appendChild(sectionDiv);
        }
    }
    
    // Function to create form field
    function createField(fieldData) {
        const { key, label, value, editable, icon } = fieldData;
        
        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'field-group';
        
        // Create label
        const fieldLabel = document.createElement('div');
        fieldLabel.className = 'field-label';
        
        // Add icon if provided
        if (icon) {
            const iconElement = document.createElement('i');
            iconElement.className = `bi ${icon} me-2`;
            fieldLabel.appendChild(iconElement);
        }
        
        const labelText = document.createTextNode(label);
        fieldLabel.appendChild(labelText);
        fieldGroup.appendChild(fieldLabel);
        
        // Create input
        const input = document.createElement('input');
        input.type = key === 'dateOfBirth' ? 'date' : 'text';
        input.className = 'field-input';
        input.value = value || '';
        input.dataset.key = key; // Store key for reference
        
        if (!editable) {
            input.className += ' non-editable';
            input.readOnly = true;
            
            const nonEditableTag = document.createElement('span');
            nonEditableTag.className = 'non-editable-tag';
            nonEditableTag.textContent = 'Not editable';
            fieldLabel.appendChild(nonEditableTag);
        } else {
            // Add edit button
            const editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.className = 'edit-button';
            editButton.innerHTML = '<i class="bi bi-pencil"></i>';
            
            editButton.addEventListener('click', function() {
                if (input.readOnly) {
                    // Enter edit mode
                    input.readOnly = false;
                    input.focus();
                    this.innerHTML = '<i class="bi bi-check"></i>';
                } else {
                    // Save changes
                    input.readOnly = true;
                    this.innerHTML = '<i class="bi bi-pencil"></i>';
                    
                    // Store modified value
                    if (input.value !== value) {
                        modifiedFields[key] = input.value;
                    } else {
                        delete modifiedFields[key];
                    }
                }
            });
            
            // Handle input changes
            input.addEventListener('input', function() {
                if (this.value !== value) {
                    modifiedFields[key] = this.value;
                } else {
                    delete modifiedFields[key];
                }
            });
            
            input.addEventListener('blur', function() {
                if (!input.readOnly) {
                    input.readOnly = true;
                    editButton.innerHTML = '<i class="bi bi-pencil"></i>';
                }
            });
            
            input.readOnly = true;
            fieldGroup.appendChild(editButton);
        }
        
        fieldGroup.appendChild(input);
        return fieldGroup;
    }
    
    // Handle save all button
    document.getElementById('save-all-button').addEventListener('click', async function() {
        if (Object.keys(modifiedFields).length === 0) {
            showToast("No Changes", "No changes were made to your profile.");
            return;
        }
        
        try {
            this.disabled = true;
            this.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Saving...';
            
            // Prepare update payload with the correct structure
            const updatePayload = {
                user: {
                    userId: userId
                },
                dateOfBirth: originalUserData.dateOfBirth,
                alternateContact: originalUserData.alternateContact,
                communicationLanguage: originalUserData.communicationLanguage,
                workDetails: originalUserData.workDetails,
                userAddress: originalUserData.userAddress
            };
            
            // Apply modifications to the payload
            for (const [key, value] of Object.entries(modifiedFields)) {
                if (key === 'email') {
                    updatePayload.user.userEmail = value;
                } else {
                    updatePayload[key] = value;
                }
            }
            
            console.log('Update payload:', JSON.stringify(updatePayload));
            
            // Send update request with the correct URL format
            const response = await fetch(`http://localhost:8083/user-details/user/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatePayload)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Update response:', errorText);
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            
            // Show success message
            showToast("Success", "Your profile has been updated successfully");
            
            // Reset modified fields
            modifiedFields = {};
            
            // Reload user data to get fresh values
            fetchUserData();
            
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast("Error", `Failed to update profile: ${error.message}`, false);
        } finally {
            this.disabled = false;
            this.textContent = 'Save Changes';
        }
    });

    function checkLoginStatus() {
        const isLoggedIn = localStorage.getItem("isLoggedIn");
        
        if (isLoggedIn !== "true") {
          // User is not logged in, redirect to login page
          window.location.href = "login.html";
        }
      }
      
      // Call the function when the page loads
      window.addEventListener("DOMContentLoaded", checkLoginStatus);
    
    // Logout function
    window.logout = function() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUserDetails');
        window.location.href = 'index.html';
    };
    
    // Initialize by fetching user data
    fetchUserData();
});
