
// EMAIL/SMTP CONFIGURATION FUNCTIONS
function toggleEmailFields() {
    const provider = document.getElementById('emailProvider').value;
    const smtpFields = document.getElementById('smtpFields');
    const resendFields = document.getElementById('resendFields');

    if (provider === 'smtp') {
        smtpFields.style.display = 'block';
        resendFields.style.display = 'none';
    } else {
        smtpFields.style.display = 'none';
        resendFields.style.display = 'block';
    }
}

async function saveEmailSettings() {
    try {
        const token = localStorage.getItem('token');
        const provider = document.getElementById('emailProvider').value;

        const data = {
            email_provider: provider
        };

        if (provider === 'smtp') {
            data.smtp_host = document.getElementById('smtpHost').value;
            data.smtp_port = document.getElementById('smtpPort').value;
            data.smtp_user = document.getElementById('smtpUser').value;
            data.smtp_password = document.getElementById('smtpPassword').value;
            data.smtp_from = document.getElementById('smtpFromEmail').value;
            data.smtp_secure = document.getElementById('smtpSecure').checked ? 'true' : 'false';
        } else {
            data.resend_api_key = document.getElementById('resendApiKey').value;
            data.resend_from_email = document.getElementById('resendFromEmail').value;
        }

        const response = await fetch(API_BASE + '/settings/email', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (!result.success) throw new Error(result.message || 'Failed to save settings');

        showToast('Email settings saved successfully!', 'success');

        // Update current configuration display
        if (provider === 'smtp') {
            document.getElementById('currentSmtpHost').textContent = data.smtp_host || '--';
            document.getElementById('currentSmtpUser').textContent = data.smtp_user || '--';
            document.getElementById('currentFromEmail').textContent = data.smtp_from || '--';
        }
    } catch (error) {
        console.error('Error saving email settings:', error);
        showToast('Failed to save email settings: ' + error.message, 'error');
    }
}
