
// SMTP EMAIL CONFIGURATION FUNCTION
async function saveEmailSettings() {
    try {
        const token = localStorage.getItem('token');

        const data = {
            smtp_host: document.getElementById('smtpHost').value,
            smtp_port: document.getElementById('smtpPort').value,
            smtp_user: document.getElementById('smtpUser').value,
            smtp_password: document.getElementById('smtpPassword').value,
            smtp_from: document.getElementById('smtpFromEmail').value,
            smtp_secure: document.getElementById('smtpSecure').checked ? 'true' : 'false'
        };

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

        showToast('SMTP settings saved successfully!', 'success');

        // Update current configuration display
        document.getElementById('currentSmtpHost').textContent = data.smtp_host || '--';
        document.getElementById('currentSmtpUser').textContent = data.smtp_user || '--';
        document.getElementById('currentFromEmail').textContent = data.smtp_from || '--';
    } catch (error) {
        console.error('Error saving SMTP settings:', error);
        showToast('Failed to save SMTP settings: ' + error.message, 'error');
    }
}
