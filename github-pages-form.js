// GitHub Pages Version - LoanApplicationForm.js
// This is a simplified version for GitHub Pages that only submits to Google Sheets

document.addEventListener('DOMContentLoaded', function() {
    const loanForm = document.getElementById('loanApplicationForm');
    const formSuccess = document.getElementById('formSuccess');
    const formError = document.getElementById('formError');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    if (loanForm) {
        loanForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Hide any previous messages
            if (formSuccess) formSuccess.style.display = 'none';
            if (formError) formError.style.display = 'none';
            
            // Show loading spinner
            if (loadingSpinner) loadingSpinner.style.display = 'block';
            const submitButton = loanForm.querySelector('button[type="submit"]');
            if (submitButton) {
                const originalText = submitButton.textContent;
                submitButton.textContent = 'Submitting...';
                submitButton.disabled = true;
            }
            
            // Validate form
            if (!validateForm()) {
                // Hide loading spinner on error
                if (loadingSpinner) loadingSpinner.style.display = 'none';
                if (submitButton) {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                }
                return;
            }
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                pan: document.getElementById('pan').value,
                employment: document.getElementById('employment').value,
                pincode: document.getElementById('pincode').value,
                salary: document.getElementById('salary').value,
                loanAmount: document.getElementById('loanAmount').value,
                timestamp: new Date().toISOString()
            };
            
            // Send data to Google Sheets
            sendToGoogleSheets(formData);
        });
    }
    
    function validateForm() {
        // Reset previous errors
        const errorMessages = loanForm.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
        
        const inputs = loanForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.classList.remove('error');
        });
        
        let isValid = true;
        
        // Basic validation
        if (document.getElementById('name').value.trim() === '') {
            markFieldAsError('name', 'Please enter your name');
            isValid = false;
        }
        
        const email = document.getElementById('email').value;
        if (!isValidEmail(email)) {
            markFieldAsError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        const phone = document.getElementById('phone').value;
        if (phone.trim() === '' || phone.length < 10) {
            markFieldAsError('phone', 'Please enter a valid 10-digit phone number');
            isValid = false;
        }
        
        const pan = document.getElementById('pan').value;
        if (pan.trim() === '' || !isValidPAN(pan)) {
            markFieldAsError('pan', 'Please enter a valid PAN number (e.g. ABCDE1234F)');
            isValid = false;
        }
        
        if (document.getElementById('employment').value === '') {
            markFieldAsError('employment', 'Please select your employment status');
            isValid = false;
        }
        
        const pincode = document.getElementById('pincode').value;
        if (pincode.trim() === '' || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
            markFieldAsError('pincode', 'Please enter a valid 6-digit PIN code');
            isValid = false;
        }
        
        const salary = document.getElementById('salary').value;
        if (salary < 10000) {
            markFieldAsError('salary', 'Salary must be at least ₹10,000');
            isValid = false;
        }
        
        const loanAmount = document.getElementById('loanAmount').value;
        if (loanAmount === '' || loanAmount < 50000) {
            markFieldAsError('loanAmount', 'Please select a loan amount');
            isValid = false;
        }
        
        if (!document.getElementById('terms').checked) {
            markFieldAsError('terms', 'You must agree to the terms and conditions');
            isValid = false;
        }
        
        if (!isValid) {
            showError('Please correct the highlighted fields');
        }
        
        return isValid;
    }
    
    function markFieldAsError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('error');
            
            // Add error message below the field
            const errorSpan = document.createElement('span');
            errorSpan.className = 'error-message';
            errorSpan.textContent = message;
            
            const parentDiv = field.parentElement;
            if (parentDiv) {
                // Check if error message already exists
                const existingError = parentDiv.querySelector('.error-message');
                if (!existingError) {
                    parentDiv.appendChild(errorSpan);
                }
            }
        }
    }
    
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    function isValidPAN(pan) {
        const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return regex.test(pan);
    }
    
    function sendToGoogleSheets(formData) {
        // Replace this URL with your actual Google Apps Script Web App URL
        // The URL should be the one you get after deploying your Google Apps Script
        const scriptURL = 'https://script.google.com/macros/s/AKfycbwo9Xa-9KoICnuwEPGwVJ-8LyE1nC6Q1Mpu2Q1gqVoEFrJ2tNVD_JyYAiLsPYW6OAU/exec';
        
        // Format data for Google Sheets
        const params = new URLSearchParams();
        
        // Add each form field to the params
        for (const key in formData) {
            params.append(key, formData[key]);
        }
        
        // Send the data using fetch API
        fetch(scriptURL, {
            method: 'POST',
            body: params,
            mode: 'no-cors' // This is required for Google Apps Script
        })
        .then(response => {
            // Since we're using no-cors, we can't actually read the response
            // We'll just assume success if there's no error
            
            // Show success message
            if (formSuccess) formSuccess.style.display = 'block';
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            
            // Reset form for next use
            loanForm.reset();
            
            // Reset submit button
            const submitButton = loanForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.textContent = 'Submit Application';
                submitButton.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            
            // Show error message
            if (formError) formError.style.display = 'block';
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            
            // Reset submit button
            const submitButton = loanForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.textContent = 'Submit Application';
                submitButton.disabled = false;
            }
        });
    }
    
    function showError(message) {
        // Check if there's already a general error message at the top
        let errorDiv = loanForm.querySelector('.form-error-message');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'form-message form-error-message error-message';
            
            // Insert at top of form
            loanForm.insertBefore(errorDiv, loanForm.firstChild);
        }
        
        errorDiv.textContent = message;
        
        // Remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
});

/*
INSTRUCTIONS FOR SETTING UP GOOGLE SHEETS INTEGRATION:

1. Create a new Google Sheet with the following column headers in row 1:
   timestamp | name | email | phone | pan | employment | pincode | salary | loanAmount

2. Open the Script Editor:
   - In your Google Sheet, click on Extensions > Apps Script
   - This will open a new tab with the Google Apps Script editor

3. Replace the default code with the following:

   function doPost(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     
     var data = e.parameter;
     var timestamp = data.timestamp;
     var name = data.name;
     var email = data.email;
     var phone = data.phone;
     var pan = data.pan;
     var employment = data.employment;
     var pincode = data.pincode;
     var salary = data.salary;
     var loanAmount = data.loanAmount;
     
     sheet.appendRow([timestamp, name, email, phone, pan, employment, pincode, salary, loanAmount]);
     
     return ContentService.createTextOutput(JSON.stringify({
       'result': 'success',
       'data': data
     }))
     .setMimeType(ContentService.MimeType.JSON);
   }
   
   function doGet(e) {
     return ContentService.createTextOutput("The web app is working correctly, but it's designed to handle POST requests from the form.");
   }

4. Save the script with a name like "Form Handler"

5. Deploy the web app:
   - Click on Deploy > New deployment
   - For the "Type of deployment" select "Web app"
   - Fill in the following details:
      * Description: "Loan Form Handler"
      * Execute as: "Me"
      * Who has access: "Anyone" (This allows your form to submit data without authentication)
   - Click "Deploy"

6. Authorize the app when prompted

7. Copy the Web App URL provided after deployment

8. Replace the placeholder URL in the sendToGoogleSheets function with your Web App URL

9. Now your form should be able to submit data directly to the Google Sheet

NOTE: Make sure your Google Sheet is not restricted. The form submission might fail if the sheet isn't accessible to the script.
*/