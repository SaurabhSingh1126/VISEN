
const formEl = document.getElementById('contact-form');
const statusEl = document.getElementById('status');
const submitBtnEl = formEl ? formEl.querySelector('button[type="submit"]') : null;

if (!formEl || !statusEl) {
  console.warn('Contact form elements were not found on this page.');
} else {
  let EMAILJS_PUBLIC_KEY = window.EMAILJS_PUBLIC_KEY || '';
  let EMAILJS_SERVICE_ID = window.EMAILJS_SERVICE_ID || '';
  let EMAILJS_TEMPLATE_ID = window.EMAILJS_TEMPLATE_ID || '';
  let EMAILJS_TO_EMAIL = window.EMAILJS_TO_EMAIL || '';

  const hasEmailjsConfig = Boolean(
    EMAILJS_PUBLIC_KEY && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID
  );

  if (!hasEmailjsConfig) {
    console.error('Missing EmailJS configuration.');
    statusEl.innerText = 'Service not configured. Check your env.js file.';
    if (submitBtnEl) submitBtnEl.disabled = true;
  } else {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log("EmailJS initialized with Public Key:", EMAILJS_PUBLIC_KEY);
  }

  formEl.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!hasEmailjsConfig) return;

    if (submitBtnEl) submitBtnEl.disabled = true;
    statusEl.innerText = 'Sending...';
    statusEl.style.color = '#fff';

    const formData = new FormData(formEl);
    const userName = formData.get('user_name');
    const userEmail = formData.get('user_email');
    const userMessage = formData.get('message');

    const templateParams = {
      // Name aliases
      user_name: userName,
      from_name: userName,
      name: userName,
      sender_name: userName,

      // Email aliases
      user_email: userEmail,
      from_email: userEmail,
      email: userEmail,
      sender_email: userEmail,
      reply_to: userEmail,

      // Message aliases
      message: userMessage,
      user_message: userMessage,
      comments: userMessage,

      // Recipient aliases (FORCING support@visen.in)
      to_email: EMAILJS_TO_EMAIL || 'support@visen.in',
      to: EMAILJS_TO_EMAIL || 'support@visen.in',
      recipient: EMAILJS_TO_EMAIL || 'support@visen.in',
      destination: EMAILJS_TO_EMAIL || 'support@visen.in',
      send_to: EMAILJS_TO_EMAIL || 'support@visen.in',
      recipient_email: EMAILJS_TO_EMAIL || 'support@visen.in'
    };

    console.log("Submitting with params:", templateParams);

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams).then(
      () => {
        statusEl.innerText = 'Message sent successfully!';
        statusEl.style.color = '#4CAF50';
        formEl.reset();
        if (submitBtnEl) submitBtnEl.disabled = false;
      },
      (err) => {
        console.error('EmailJS Error:', err);
        const errorDetail = err && err.text ? err.text : JSON.stringify(err);
        statusEl.innerText = `Error: ${errorDetail}`;
        statusEl.style.color = '#ff4d4d';
        if (submitBtnEl) submitBtnEl.disabled = false;
        
        if (errorDetail.includes("Unauthorized") || errorDetail.includes("public key")) {
          statusEl.innerText += " (Check your Public Key in EmailJS Dashboard)";
        }
      }
    );
  });
}