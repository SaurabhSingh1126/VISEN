
const formEl = document.getElementById('contact-form');
const statusEl = document.getElementById('status');
const submitBtnEl = formEl ? formEl.querySelector('button[type="submit"]') : null;

if (!formEl || !statusEl) {
  // This script can be included on pages without the contact form.
  console.warn('Contact form elements were not found on this page.');
} else {
  let EMAILJS_PUBLIC_KEY = window.EMAILJS_PUBLIC_KEY || '';
  let EMAILJS_SERVICE_ID = window.EMAILJS_SERVICE_ID || '';
  let EMAILJS_TEMPLATE_ID = window.EMAILJS_TEMPLATE_ID || '';
  let EMAILJS_TO_EMAIL = window.EMAILJS_TO_EMAIL || '';

  const hasEmailjsConfig = Boolean(
    EMAILJS_PUBLIC_KEY && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID
  );
  const hasConfiguredRecipient = Boolean(EMAILJS_TO_EMAIL && EMAILJS_TO_EMAIL.includes('@'));

  if (!hasEmailjsConfig) {
    console.error(
      'Missing EmailJS configuration. Generate env.js by setting EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, and EMAILJS_TEMPLATE_ID, then run: npm run build'
    );
    statusEl.innerText = 'Email service configuration is missing. Set EmailJS env vars and run npm run build.';
    if (submitBtnEl) {
      submitBtnEl.disabled = true;
      submitBtnEl.title = 'Email service is not configured';
    }
  } else {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  // If template uses {{to_email}}, provide it from config as a hidden field.
  if (EMAILJS_TO_EMAIL) {
    let toEmailInput = formEl.querySelector('input[name="to_email"]');
    if (!toEmailInput) {
      toEmailInput = document.createElement('input');
      toEmailInput.type = 'hidden';
      toEmailInput.name = 'to_email';
      formEl.appendChild(toEmailInput);
    }
    toEmailInput.value = EMAILJS_TO_EMAIL;
  }

  if (EMAILJS_TO_EMAIL && !hasConfiguredRecipient) {
    console.warn('EMAILJS_TO_EMAIL is set but is not a valid email address.');
  }

  formEl.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!hasEmailjsConfig) {
      statusEl.innerText = 'Email service configuration is missing. Set EmailJS env vars and run npm run build.';
      return;
    }

    if (submitBtnEl) {
      submitBtnEl.disabled = true;
    }
    statusEl.innerText = 'Sending...';

    const formData = new FormData(formEl);
    const userName = (formData.get('user_name') || '').toString();
    const userEmail = (formData.get('user_email') || '').toString();
    const message = (formData.get('message') || '').toString();

    const templateParams = {
      user_name: userName,
      user_email: userEmail,
      message,
      from_name: userName,
      reply_to: userEmail,
      to_email: EMAILJS_TO_EMAIL || '',
      to: EMAILJS_TO_EMAIL || '',
      recipient_email: EMAILJS_TO_EMAIL || ''
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams).then(
      () => {
        statusEl.innerText = 'Message sent successfully!';
        formEl.reset();
        if (submitBtnEl) {
          submitBtnEl.disabled = false;
        }
      },
      (err) => {
        const errText = err && err.text ? err.text : '';
        if (errText.toLowerCase().includes('recipients address is empty')) {
          statusEl.innerText = 'Failed to send message. Recipient is empty. In EmailJS template set To Email to a fixed email or {{to_email}}, and ensure EMAILJS_TO_EMAIL is a valid email.';
        } else {
          const detail = errText ? ` (${errText})` : '';
          statusEl.innerText = `Failed to send message.${detail}`;
        }
        if (submitBtnEl) {
          submitBtnEl.disabled = false;
        }
      }
    );
  });
}