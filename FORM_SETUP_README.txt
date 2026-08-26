GSAS automatic enquiry email setup

The Contact and Homepage enquiry forms now submit directly to:
contact@gsasintl.com

Email delivery service:
FormSubmit (https://formsubmit.co)

IMPORTANT FIRST-TIME ACTIVATION
The first form submission will cause FormSubmit to send an activation email to
contact@gsasintl.com. Open that email and click the activation/confirmation link.
This is required once to authorize email delivery to the GSAS mailbox.

After activation:
1. Visitor completes the website form.
2. Browser validates email and phone number.
3. Form sends the enquiry to FormSubmit in the background.
4. FormSubmit emails the enquiry to contact@gsasintl.com.
5. On successful submission, WhatsApp opens with the same enquiry pre-filled for
   +971 58 979 7465.
6. The visitor reviews the WhatsApp message and presses Send.

No API key or backend server is required for this version.

Production note:
For higher-volume or business-critical use, consider moving to a dedicated
transactional email service/backend (Brevo, SendGrid, AWS SES, etc.) so delivery,
logging, rate limits, and spam protection are fully controlled.
