document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded - script starting");
    
    // Use the correct form ID "loanApplicationForm" instead of "loan-form"
    const form = document.getElementById('loanApplicationForm');
    
    // Make sure form exists before proceeding
    if (!form) {
        console.error("Form with ID 'loanApplicationForm' not found!");
        return;
    } else {
        console.log("Form found successfully:", form);
    }
    
    // Check if error display element exists, create it if not
    let errorDisplay = document.getElementById('formError');
    if (!errorDisplay) {
        console.log("Creating error display element");
        errorDisplay = document.createElement('div');
        errorDisplay.id = 'formError';
        errorDisplay.className = 'form-error';
        errorDisplay.style.display = 'none';
        form.parentNode.insertBefore(errorDisplay, form.nextSibling);
    } else {
        console.log("Error display element found");
    }
    
    console.log("Adding submit event listener to form");
    form.addEventListener('submit', function(e) {
        console.log("Form submit event triggered");
        e.preventDefault();
        
        // Clear any previous error messages
        errorDisplay.textContent = '';
        errorDisplay.style.display = 'none';
        
        // Get form data
        const formData = {
            timestamp: new Date().toISOString(),
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            pan: document.getElementById('pan').value,
            employment: document.getElementById('employment').value,
            pincode: document.getElementById('pincode').value,
            salary: document.getElementById('salary').value,
            loanAmount: document.getElementById('loanAmount').value
        };
        
        console.log("Form data collected:", formData);
        
        // Validate the form
        console.log("Validating form...");
        if (!validateForm()) {
            console.log("Form validation failed");
            return false;
        }
        console.log("Form validation passed");
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        if (!submitButton) {
            console.error("Submit button not found!");
        } else {
            console.log("Submit button found, changing to loading state");
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
        }
        
        // Use the correct Google Apps Script URL
        const scriptURL = 'https://script.google.com/macros/s/AKfycby_Gz2BE4dunPhnboivkA-2TAiIsI_u7todFQmFmT91mXzVygw_iTHqOiAQk_mpkZL2pw/exec';
        console.log("Using Google Script URL:", scriptURL);
        
        // Format data for Google Sheets
        const params = new URLSearchParams();
        
        // Add each form field to the params
        for (const key in formData) {
            params.append(key, formData[key]);
        }
        
        console.log("Prepared params for submission:", params.toString());
        
        // Send the data using fetch API
        console.log("Sending fetch request to Google Script...");
        fetch(scriptURL, {
            method: 'POST',
            mode: 'no-cors', // Important for cross-origin requests to Google Scripts
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        })
        .then(response => {
            // Since we're using no-cors, we can't actually read the response
            // But we can assume success if there's no error thrown
            console.log('Fetch successful!', response);
            form.reset();
            showSuccessMessage();
        })
        .catch(error => {
            console.error('Fetch error:', error.message);
            showError("Something went wrong with the submission. Please try again later.");
        })
        .finally(() => {
            // Reset button state
            console.log("Fetch request completed (success or failure)");
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Application';
            }
        });
    });
    
    function validateForm() {
        // Get form fields
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const pan = document.getElementById('pan').value;
        const employment = document.getElementById('employment').value;
        const pincode = document.getElementById('pincode').value;
        const salary = document.getElementById('salary').value;
        const loanAmount = document.getElementById('loanAmount').value;
        
        // Validate name
        if (!name || name.trim() === '') {
            markFieldAsError('name', 'Please enter your name');
            return false;
        }
        
        // Validate email
        if (!isValidEmail(email)) {
            markFieldAsError('email', 'Please enter a valid email address');
            return false;
        }
        
        // Validate phone
        if (!phone || phone.length !== 10 || !/^\d+$/.test(phone)) {
            markFieldAsError('phone', 'Please enter a valid 10-digit phone number');
            return false;
        }
        
        // Validate PAN
        if (!isValidPAN(pan)) {
            markFieldAsError('pan', 'Please enter a valid PAN number (e.g., ABCDE1234F)');
            return false;
        }
        
        // Validate employment
        if (!employment || employment === '') {
            markFieldAsError('employment', 'Please select your employment type');
            return false;
        }
        
        // Validate pincode
        if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
            markFieldAsError('pincode', 'Please enter a valid 6-digit pincode');
            return false;
        }
        
        // Validate salary
        if (!salary || isNaN(salary) || parseFloat(salary) <= 0) {
            markFieldAsError('salary', 'Please enter a valid salary amount');
            return false;
        }
        
        // Validate loan amount
        if (!loanAmount || isNaN(loanAmount) || parseFloat(loanAmount) <= 0) {
            markFieldAsError('loanAmount', 'Please enter a valid loan amount');
            return false;
        }
        
        return true;
    }
    
    function markFieldAsError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) {
            console.error(`Field with id '${fieldId}' not found!`);
            return;
        }
        
        field.classList.add('error');
        
        showError(message);
        
        field.focus();
        
        // Remove error class when user starts typing
        field.addEventListener('input', function removeError() {
            field.classList.remove('error');
            errorDisplay.style.display = 'none';
            field.removeEventListener('input', removeError);
        });
    }
    
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    function isValidPAN(pan) {
        const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return re.test(pan);
    }
    
    function showSuccessMessage() {
        console.log("Showing success message");
        // Show the success message that's already in your HTML
        const successElement = document.getElementById('formSuccess');
        if (successElement) {
            console.log("Using existing success element");
            successElement.style.display = 'block';
            form.style.display = 'none';
        } else {
            // Fallback if the success element doesn't exist
            console.log("Creating fallback success message");
            const formContainer = document.querySelector('.form-container');
            formContainer.innerHTML = `
                <div class="success-message">
                    <h2>Thank you for your application!</h2>
                    <p>Your loan application has been submitted successfully. Our team will contact you shortly.</p>
                    <button onclick="window.location.reload()" class="btn">Submit Another Application</button>
                </div>
            `;
        }
    }
    
    function showError(message) {
        if (!errorDisplay) {
            console.error("Cannot show error: errorDisplay element is null");
            return;
        }
        
        console.log("Showing error:", message);
        errorDisplay.textContent = message;
        errorDisplay.style.display = 'block';
    }
});
