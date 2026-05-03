
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
    statusEl.innerText = 'Initializing payment...';
    statusEl.style.color = '#fff';

    const formData = new FormData(formEl);
    const userName = formData.get('user_name');
    const userEmail = formData.get('user_email');
    const userPhone = formData.get('user_phone');
    const userInsta = formData.get('instagram');
    const selectedNumber = formData.get('selected_number');
    const userMessage = formData.get('message');

    // Enforce Google Verified Gmail constraint
    if (!userEmail.toLowerCase().endsWith('@gmail.com')) {
      statusEl.innerText = 'Please use a Google verified @gmail.com address only.';
      statusEl.style.color = '#ff4d4d';
      if (submitBtnEl) submitBtnEl.disabled = false;
      return;
    }

    // Enforce number selection — scroll to calendar if missing
    if (!selectedNumber) {
      const calErr = document.getElementById('cal-error');
      if (calErr) calErr.innerText = '⚠️ Please select a number to continue.';
      document.getElementById('number-picker')?.scrollIntoView({ behavior: 'smooth' });
      if (submitBtnEl) submitBtnEl.disabled = false;
      statusEl.innerText = '';
      return;
    }
    const calErr = document.getElementById('cal-error');
    if (calErr) calErr.innerText = '';

    // Direct UPI configuration
    const upiId = window.UPI_ID || "your_upi_id@bank";

    statusEl.innerHTML = `Sending your details securely...`;
    statusEl.style.color = '#ccc';

    const finalNumberText = selectedNumber ? selectedNumber : "Not Interested";

    const combinedMessage = userMessage + 
                            "\n\n[Phone: " + (userPhone ? userPhone : "Not provided") + "]" + 
                            "\n[Instagram: " + (userInsta ? userInsta : "Not provided") + "]" + 
                            "\n[Chosen Number: " + finalNumberText + "]" +
                            "\n[Payment Method: Direct UPI (" + upiId + ")]";

    const templateParams = {
      user_name: userName,
      from_name: userName,
      name: userName,
      sender_name: userName,
      user_email: userEmail,
      from_email: userEmail,
      email: userEmail,
      sender_email: userEmail,
      reply_to: userEmail,
      message: combinedMessage,
      user_message: userMessage,
      comments: userMessage,
      to_email: EMAILJS_TO_EMAIL || 'support@visen.in',
      to: EMAILJS_TO_EMAIL || 'support@visen.in',
      recipient: EMAILJS_TO_EMAIL || 'support@visen.in',
      destination: EMAILJS_TO_EMAIL || 'support@visen.in',
      send_to: EMAILJS_TO_EMAIL || 'support@visen.in',
      recipient_email: EMAILJS_TO_EMAIL || 'support@visen.in'
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams).then(
      () => {
        // Save user email to send auto-reply after payment confirmation
        localStorage.setItem('visen_user_email', userEmail);
        localStorage.setItem('visen_user_name', userName);
        localStorage.setItem('visen_selected_number', selectedNumber);

        // Form submitted successfully, redirect to payment page
        window.location.href = "payment.html";
      },
      (err) => {
        console.error('EmailJS Error:', err);
        statusEl.innerText = 'Failed to send message. Please contact us directly after paying.';
        statusEl.style.color = '#ff4d4d';
        if (submitBtnEl) submitBtnEl.disabled = false;
      }
    );
  });
}

// Populate calendar number grid
document.addEventListener('DOMContentLoaded', () => {
  const calGrid = document.getElementById('cal-grid');
  const hiddenInput = document.getElementById('hidden_selected_number');
  const calInfo = document.getElementById('cal-selected-info');
  const calError = document.getElementById('cal-error');

  if (!calGrid) return;

  fetch('/api/numbers')
    .then(res => res.json())
    .then(numbers => {
      numbers.forEach(item => {
        const cell = document.createElement('div');

        if (item.status === 'soldout') {
          cell.className = 'cal-cell soldout';
          cell.innerHTML = `<span class="num-label">${item.number}</span><span class="oos-label">Out of Stock</span>`;
        } else {
          cell.className = 'cal-cell available';
          cell.innerText = item.number;

          cell.onclick = () => {
            // Deselect previous
            const prev = calGrid.querySelector('.cal-cell.selected');
            if (prev) {
              prev.classList.remove('selected');
              prev.classList.add('available');
            }
            cell.classList.remove('available');
            cell.classList.add('selected');
            if (hiddenInput) hiddenInput.value = item.number;
            if (calInfo) calInfo.innerHTML = `Selected: <span class="badge">${item.number}</span>`;
            if (calError) calError.innerText = '';
          };
        }

        calGrid.appendChild(cell);
      });
    })
    .catch(err => console.error('Error loading numbers:', err));
});

