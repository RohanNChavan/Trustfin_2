document.addEventListener('DOMContentLoaded', function() {
    const loanForm = document.getElementById('loanApplicationForm');
    const formSuccess = document.getElementById('formSuccess');
    const formError = document.getElementById('formError');
    
    if (loanForm) {
        loanForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm()) {
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
        const inputs = loanForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.classList.remove('error');
        });
        
        let isValid = true;
        
        // Basic validation
        if (document.getElementById('name').value.trim() === '') {
            document.getElementById('name').classList.add('error');
            isValid = false;
        }
        
        const email = document.getElementById('email').value;
        if (!isValidEmail(email)) {
            document.getElementById('email').classList.add('error');
            isValid = false;
        }
        
        const phone = document.getElementById('phone').value;
        if (phone.trim() === '' || phone.length < 10) {
            document.getElementById('phone').classList.add('error');
            isValid = false;
        }
        
        const pan = document.getElementById('pan').value;
        if (pan.trim() === '' || pan.length !== 10) {
            document.getElementById('pan').classList.add('error');
            isValid = false;
        }
        
        if (document.getElementById('employment').value === '') {
            document.getElementById('employment').classList.add('error');
            isValid = false;
        }
        
        const pincode = document.getElementById('pincode').value;
        if (pincode.trim() === '' || pincode.length !== 6) {
            document.getElementById('pincode').classList.add('error');
            isValid = false;
        }
        
        const salary = document.getElementById('salary').value;
        if (salary < 10000) {
            document.getElementById('salary').classList.add('error');
            isValid = false;
        }
        
        const loanAmount = document.getElementById('loanAmount').value;
        if (loanAmount < 50000 || loanAmount > 2000000) {
            document.getElementById('loanAmount').classList.add('error');
            isValid = false;
        }
        
        if (!document.getElementById('terms').checked) {
            document.getElementById('terms').classList.add('error');
            isValid = false;
        }
        
        if (!isValid) {
            showError('Please correct the highlighted fields');
        }
        
        return isValid;
    }
    
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    function sendToGoogleSheets(formData) {
        // Show loading state
        const submitButton = loanForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;
        
        // Replace this URL with your actual Google Apps Script Web App URL
        // The URL should be the one you get after deploying your Google Apps Script
        const scriptURL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
        
        // Format data for Google Sheets
        const params = new URLSearchParams();
        
        // Add each form field to the params
        for (const key in formData) {
            params.append(key, formData[key]);
        }
        
        // Send the data using fetch API
        fetch(scriptURL, {
            method: 'POST',
            body: params
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Show success message
            loanForm.style.display = 'none';
            formSuccess.style.display = 'block';
            
            // Reset form for next use
            loanForm.reset();
        })
        .catch(error => {
            console.error('Error:', error);
            
            // Show error message
            formError.style.display = 'block';
            
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        });
    }
    
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-message error-message';
        errorDiv.textContent = message;
        
        // Insert at top of form
        loanForm.insertBefore(errorDiv, loanForm.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    // Add some styles for error states
    const style = document.createElement('style');
    style.textContent = `
        input.error, select.error {
            border-color: var(--error-color) !important;
        }
        
        .form-message {
            padding: 10px;
            margin-bottom: 20px;
            border-radius: var(--border-radius);
            text-align: center;
        }
        
        .error-message {
            background-color: rgba(240, 62, 62, 0.1);
            color: var(--error-color);
            border: 1px solid var(--error-color);
        }
    `;
    document.head.appendChild(style);
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