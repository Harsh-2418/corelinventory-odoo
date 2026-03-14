// EmailJS REST API wrapper — no npm package needed
// Setup: Create a free account at https://www.emailjs.com/
// Then update the config below with your IDs

const EMAILJS_CONFIG = {
  serviceId: 'service_hhbunpt',
  templateId: 'template_3h0tth6',
  publicKey: 'Jz_xhnMtc61o8WN1t',
};

/**
 * Send an OTP email using EmailJS REST API
 * @param {string} toEmail - Recipient email
 * @param {string} otpCode - The 6-digit OTP code
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendOtpEmail(toEmail, otpCode) {
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_CONFIG.serviceId,
        template_id: EMAILJS_CONFIG.templateId,
        user_id: EMAILJS_CONFIG.publicKey,
        template_params: {
          to_email: toEmail,
          otp_code: otpCode,
          app_name: 'CoreInventory IMS',
        },
      }),
    });

    if (response.ok) {
      return { success: true };
    } else {
      const text = await response.text();
      console.error('EmailJS error:', text);
      return { success: false, error: 'Failed to send OTP email. Please try again.' };
    }
  } catch (err) {
    console.error('Email send error:', err);
    return { success: false, error: 'Network error. Please check your connection.' };
  }
}

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
