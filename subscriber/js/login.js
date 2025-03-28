let resendInterval, remainingTime = 37;
let currentUserEmail = '';
let generatedOtp = '';
let currentUserDetails = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in and redirect if needed
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
        window.location.href = "Account.html";
    }
});

// Show custom alert function
function showCustomAlert(title, message, duration = 5000) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = 'custom-alert';
    
    const alertContent = `
        <div class="custom-alert-title">${title}</div>
        <div class="custom-alert-body">${message}</div>
    `;
    
    alertDiv.innerHTML = alertContent;
    document.body.appendChild(alertDiv);
    
    // Remove alert after duration
    setTimeout(() => {
        alertDiv.style.animation = 'fadeOut 0.5s ease-out forwards';
        setTimeout(() => {
            alertDiv.remove();
        }, 500);
    }, duration);
}

const validateMobile = input => {
    input.value = input.value.replace(/\D/g, ''); // Remove non-numeric characters
    document.getElementById('submitButton').disabled = input.value.length !== 10;
    
    // Hide error messages when user starts typing again
    document.getElementById('mobileError').classList.add('d-none');
    document.getElementById('serverError').classList.add('d-none');
};

function handleOtpInput(input) {
    const value = input.value;
    const index = parseInt(input.dataset.index);
    
    // Allow only numbers
    if (!/^\d*$/.test(value)) {
        input.value = '';
        return;
    }

    // Auto-focus next input
    if (value && index < 3) {
        const nextInput = document.querySelector(`[data-index="${index + 1}"]`);
        nextInput?.focus();
    }

    // Enable/disable verify button
    const allInputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(allInputs).map(input => input.value).join('');
    document.getElementById('verifyButton').disabled = otp.length !== 4;
    
    // Hide error message when user starts typing a new OTP
    document.getElementById('otpError').classList.add('d-none');
}

function updateResendTimer() {
    const resendTimer = document.getElementById('resendTimer');
    if (remainingTime > 0) {
        resendTimer.textContent = `resend otp in ${remainingTime} sec`;
        remainingTime--;
    } else {
        clearInterval(resendInterval);
        resendTimer.textContent = 'resend otp';
        resendTimer.style.cursor = 'pointer';
        resendTimer.onclick = handleResendOTP;
    }
}

function generateRandomOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

async function sendOTPEmail(userEmail, otp, userName) {
    try {
        const response = await fetch('http://localhost:8083/users/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: userEmail,
                subject: 'Your Mobi-Comm OTP',
                body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                    <h2 style="color: #d9534f;">Mobi-Comm Login OTP</h2>
                    <p>Hello ${userName},</p>
                    <p>Your one-time password (OTP) for Mobi-Comm login is:</p>
                    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 4px;">${otp}</div>
                    <p>This OTP will expire in 5 minutes.</p>
                    <p>If you did not request this OTP, please ignore this email.</p>
                    <p>Thank you,<br>Mobi-Comm Team</p>
                </div>`
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to send email');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

async function handleResendOTP() {
    // Show loading in resend text
    const resendTimer = document.getElementById('resendTimer');
    resendTimer.textContent = 'sending...';
    resendTimer.style.cursor = 'default';
    resendTimer.onclick = null;
    
    try {
        // Generate new OTP
        generatedOtp = generateRandomOTP();
        
        if (currentUserDetails) {
            // Send OTP via email
            await sendOTPEmail(
                currentUserDetails.userEmail, 
                generatedOtp, 
                currentUserDetails.name
            );
            
            showCustomAlert('OTP Sent', `A new OTP has been sent to ${currentUserDetails.userEmail}`);
            
            // Reset timer
            remainingTime = 37;
            updateResendTimer();
            resendInterval = setInterval(updateResendTimer, 1000);
            
            // Clear OTP inputs
            document.querySelectorAll('.otp-input').forEach(input => input.value = '');
            document.getElementById('verifyButton').disabled = true;
        } else {
            throw new Error('User details not available');
        }
    } catch (error) {
        console.error('Failed to resend OTP:', error);
        resendTimer.textContent = 'Failed to send OTP. Try again.';
        resendTimer.style.cursor = 'pointer';
        resendTimer.onclick = handleResendOTP;
        
        // Show error alert
        showCustomAlert('Error', 'Failed to send OTP email. Please try again.');
    }
}

async function handleMobileSubmit() {
    const mobileNumber = document.getElementById('mobileNumber').value;
    
    // Show loading
    document.getElementById('submitText').classList.add('d-none');
    document.getElementById('submitSpinner').classList.remove('d-none');
    document.getElementById('submitButton').disabled = true;
    
    try {
        // Clear previous error messages
        document.getElementById('mobileError').classList.add('d-none');
        document.getElementById('serverError').classList.add('d-none');
        
        // Fetch user details from API with specific mobile endpoint
        const response = await fetch(`http://localhost:8083/users/mobile/${mobileNumber}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                // User not found
                document.getElementById('mobileError').classList.remove('d-none');
                document.getElementById('submitText').classList.remove('d-none');
                document.getElementById('submitSpinner').classList.add('d-none');
                document.getElementById('submitButton').disabled = false;
                return;
            } else {
                // Other server errors
                throw new Error('Server error: ' + response.status);
            }
        }
        
        const userData = await response.json();
        
        // Check if user is active
        if (userData.userStatus !== 'Active') {
            document.getElementById('mobileError').textContent = 'Account is inactive. Please contact support.';
            document.getElementById('mobileError').classList.remove('d-none');
            document.getElementById('submitText').classList.remove('d-none');
            document.getElementById('submitSpinner').classList.add('d-none');
            document.getElementById('submitButton').disabled = false;
            return;
        }
        
        // Store user details
        currentUserDetails = userData;
        currentUserEmail = userData.userEmail;
        
        // Store user details in local storage
        localStorage.setItem("currentUserDetails", JSON.stringify(userData));
        
        // Generate 4-digit OTP
        generatedOtp = generateRandomOTP();
        
        // Send OTP via email
        await sendOTPEmail(
            userData.userEmail, 
            generatedOtp, 
            userData.name
        );
        
        // Hide mobile view and show OTP view
        document.getElementById('mobileView').style.display = 'none';
        document.getElementById('otpView').style.display = 'block';
        
        // Show masked email address in message
        const maskedEmail = maskEmail(userData.userEmail);
        document.getElementById('otpMessage').textContent = 
            `OTP has been sent to ${maskedEmail}`;
        
        // Start resend timer
        remainingTime = 37;
        updateResendTimer();
        resendInterval = setInterval(updateResendTimer, 1000);
        
        // Focus first OTP input
        document.querySelector('.otp-input').focus();
        
        // Show success message
        showCustomAlert('OTP Sent', `An OTP has been sent to your email`);
        
    } catch (error) {
        console.error('Error in login process:', error);
        
        // Show server error
        document.getElementById('serverError').classList.remove('d-none');
        document.getElementById('submitText').classList.remove('d-none');
        document.getElementById('submitSpinner').classList.add('d-none');
        document.getElementById('submitButton').disabled = false;
        
        // Try to use fallback if API is not available
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            simulateLoginForTesting(mobileNumber);
        }
    }
}

// Function to mask email for privacy
function maskEmail(email) {
    const [username, domain] = email.split('@');
    const maskedUsername = username.charAt(0) + 
                           '*'.repeat(username.length - 2) + 
                           username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
}

// Function to simulate successful login when the API is not available (for testing purposes)
function simulateLoginForTesting(mobileNumber) {
    console.log('API not available, using fallback for testing');
    
    // Create a mock user
    currentUserDetails = {
        userId: "demo123",
        name: "Demo User",
        userEmail: "demo@example.com",
        mobileNumber: mobileNumber,
        userStatus: "Active"
    };
    
    // Generate OTP
    generatedOtp = generateRandomOTP();
    
    // Show OTP in custom alert (only for testing)
    showCustomAlert('Development Mode', `Your OTP is: ${generatedOtp} (for Demo User)`);
    
    // Hide mobile view and show OTP view
    document.getElementById('mobileView').style.display = 'none';
    document.getElementById('otpView').style.display = 'block';
    
    // Show masked email in message
    document.getElementById('otpMessage').textContent = 
        `OTP has been sent to d***@example.com`;
    
    // Start resend timer
    remainingTime = 37;
    updateResendTimer();
    resendInterval = setInterval(updateResendTimer, 1000);
    
    // Focus first OTP input
    document.querySelector('.otp-input').focus();
}

function handleVerifyOTP() {
    // Get entered OTP
    const otpInputs = document.querySelectorAll('.otp-input');
    const enteredOtp = Array.from(otpInputs).map(input => input.value).join('');
    
    // Show loading
    document.getElementById('verifyText').classList.add('d-none');
    document.getElementById('verifySpinner').classList.remove('d-none');
    document.getElementById('verifyButton').disabled = true;
    
    // Simulate verification process
    setTimeout(() => {
        if (enteredOtp === generatedOtp) {
            // Save login status and user info to localStorage
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userDetails", JSON.stringify({
                userId: currentUserDetails.userId,
                name: currentUserDetails.name,
                email: currentUserDetails.userEmail,
                mobile: currentUserDetails.mobileNumber
            }));
            
            showCustomAlert('Success', 'Login successful! Redirecting to your account.');
            
            // Redirect to account page on successful login
            setTimeout(() => {
                window.location.href = "Account.html";
            }, 1500);
        } else {
            // Show error for incorrect OTP
            document.getElementById('otpError').classList.remove('d-none');
            document.getElementById('verifyText').classList.remove('d-none');
            document.getElementById('verifySpinner').classList.add('d-none');
            document.getElementById('verifyButton').disabled = false;
        }
    }, 1500);
}