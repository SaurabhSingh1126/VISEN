# VISEN Contact Form - EmailJS Setup Guide

## 🚨 **IMPORTANT: Fix for Deployment Issues**

## Deploy with GitHub Desktop + GitHub Pages

Use this checklist before you create/publish your repo:

1. Copy `.env.example` to `.env`.
2. Fill these values in `.env`:
   - `EMAILJS_PUBLIC_KEY`
   - `EMAILJS_SERVICE_ID`
   - `EMAILJS_TEMPLATE_ID`
3. Run:
   - `npm run build`
4. Verify `env.js` is generated locally (it is ignored by git and will not be committed).

Then deploy from GitHub Desktop with this flow:

1. Create a new repository on GitHub.
2. In GitHub Desktop, add this project and publish/push it to that repo.
3. In your GitHub repo, go to **Settings** → **Secrets and variables** → **Actions** and add:
   - `EMAILJS_PUBLIC_KEY`
   - `EMAILJS_SERVICE_ID`
   - `EMAILJS_TEMPLATE_ID`
   - `EMAILJS_TO_EMAIL` (optional, needed if your EmailJS template uses `{{to_email}}`)
4. Go to **Settings** → **Pages** and set **Source** to **GitHub Actions**.
5. Push to `main` from GitHub Desktop. The workflow in `.github/workflows/static.yml` will:
   - generate `env.js` from your repository secrets
   - deploy the site to GitHub Pages

After the first successful workflow run, your site URL is usually:
- `https://<your-username>.github.io/<repo-name>/`

### **Fix EmailJS Domain Whitelisting**
The most common issue is that your deployed domain is not whitelisted in EmailJS.

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Sign in to your account
3. Go to **Account** → **General**
4. In **"Allowed Domains"** section, add your deployed domain:
   - **GitHub Pages**: `yourusername.github.io`
   - **Custom domain**: `yourdomain.com`

### **Verify EmailJS Configuration**
1. In EmailJS Dashboard, go to **Email Services**
2. Click on your service (`service_73qnm3i`)
3. Make sure it's properly configured with your email provider

4. Go to **Email Templates**
5. Click on your template (`template_hnfzwqc`)
6. Verify the template has:
   - Correct "To Email" address
   - Template variables: `{{user_name}}`, `{{user_email}}`, `{{message}}`

### **Test After Deployment**
1. Deploy your changes
2. Visit your deployed site
3. Open browser developer tools (F12)
4. Go to Console tab
5. Try submitting the contact form
6. Check for error messages

### **Common Error Codes & Solutions**

- **403 Forbidden**: Domain not whitelisted → Add domain to EmailJS allowed domains
- **400 Bad Request**: Invalid configuration → Check service/template IDs
- **422 Unprocessable Entity**: Recipient address empty → Set template **To Email** in EmailJS or provide `EMAILJS_TO_EMAIL`
- **429 Too Many Requests**: Rate limited → Wait and try again
- **Network Error**: CORS issue → Check domain whitelisting

### **Debug Information**
The contact form now provides detailed error messages and console logs to help identify issues.

### **Files Overview**
- `contact.html` - Main contact page
- `script.js` - EmailJS integration with error handling
- `scripts/generate-env.js` - Generates `env.js` from environment variables or local `.env`
- `.github/workflows/static.yml` - GitHub Pages deploy workflow
- `.env.example` - Template for local environment values

### **Security Note**
Never commit `env.js` to version control if it contains sensitive information. Consider using build-time environment variable injection for production.