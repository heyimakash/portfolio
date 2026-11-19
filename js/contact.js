// ============================================================
//  CONTACT PAGE JS
//  Uses fetch() AJAX → FormSubmit so it works on localhost
//  AND on any live domain without page redirect.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  const form         = document.getElementById('contactForm');
  const nameInput    = document.getElementById('senderName');
  const emailInput   = document.getElementById('senderEmail');
  const subjectInput = document.getElementById('msgSubject');
  const bodyInput    = document.getElementById('msgBody');
  const submitBtn    = document.getElementById('submitBtn');
  const submitText   = document.getElementById('submitBtnText');
  const mailtoBtn    = document.getElementById('mailtoBtn');
  const formSuccess  = document.getElementById('formSuccess');
  const charCount    = document.getElementById('charCount');

  if (!form) return;

  // ── Character counter ──────────────────────────────────────
  if (bodyInput && charCount) {
    bodyInput.addEventListener('input', () => {
      const len = bodyInput.value.length;
      charCount.textContent = len;
      charCount.style.color = len > 950 ? '#f87171' : 'var(--text-muted)';
      if (len > 1000) bodyInput.value = bodyInput.value.substring(0, 1000);
    });
  }

  // ── Validation helpers ─────────────────────────────────────
  function showErr(input, errId) {
    input.classList.add('error');
    const el = document.getElementById(errId);
    if (el) el.classList.add('visible');
  }
  function clearErr(input, errId) {
    input.classList.remove('error');
    const el = document.getElementById(errId);
    if (el) el.classList.remove('visible');
  }
  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }
  function validateForm() {
    let valid = true;
    if (!nameInput.value.trim())                            { showErr(nameInput,    'nameErr');    valid = false; }
    else                                                      clearErr(nameInput,    'nameErr');
    if (!emailInput.value.trim() || !isValidEmail(emailInput.value.trim())) { showErr(emailInput, 'emailErr'); valid = false; }
    else                                                      clearErr(emailInput,  'emailErr');
    if (!subjectInput.value.trim())                         { showErr(subjectInput, 'subjectErr'); valid = false; }
    else                                                      clearErr(subjectInput,'subjectErr');
    if (!bodyInput.value.trim())                            { showErr(bodyInput,    'msgErr');     valid = false; }
    else                                                      clearErr(bodyInput,   'msgErr');
    return valid;
  }

  // Clear errors live while user types
  const errorMap = { senderName:'nameErr', senderEmail:'emailErr', msgSubject:'subjectErr', msgBody:'msgErr' };
  [nameInput, emailInput, subjectInput, bodyInput].forEach(el => {
    if (!el) return;
    el.addEventListener('input', () => clearErr(el, errorMap[el.id]));
  });

  // ── Set loading / idle UI state ────────────────────────────
  function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.style.opacity = on ? '0.65' : '1';
    submitText.textContent  = on ? 'Sending…' : 'Send Message';
  }

  // ── Show success, hide form ────────────────────────────────
  function showSuccess() {
    form.querySelectorAll('.form-row, .form-group, .form-actions').forEach(el => {
      el.style.transition = 'opacity 0.3s';
      el.style.opacity = '0';
      setTimeout(() => { el.style.display = 'none'; }, 300);
    });
    setTimeout(() => {
      if (formSuccess) {
        formSuccess.style.display = 'flex';
        formSuccess.style.opacity = '0';
        formSuccess.style.transition = 'opacity 0.5s';
        setTimeout(() => { formSuccess.style.opacity = '1'; }, 50);
      }
    }, 350);
  }

  // ── Show error banner ──────────────────────────────────────
  function showNetworkError(msg) {
    let banner = document.getElementById('networkErrBanner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'networkErrBanner';
      banner.style.cssText = `
        background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);
        border-radius:8px;padding:0.85rem 1.1rem;font-size:0.875rem;
        color:#fca5a5;margin-top:1rem;display:flex;align-items:flex-start;gap:0.5rem;
      `;
      form.appendChild(banner);
    }
    banner.innerHTML = `<span>⚠️</span><span>${msg}</span>`;
    banner.style.display = 'flex';
  }
  function clearNetworkError() {
    const b = document.getElementById('networkErrBanner');
    if (b) b.style.display = 'none';
  }

  // ── AJAX Submit via FormSubmit ─────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();           // Always prevent default page-submit
    clearNetworkError();

    if (!validateForm()) return;

    // Check honeypot
    const honey = document.getElementById('honeyField');
    if (honey && honey.value) return;

    setLoading(true);

    const payload = new FormData();
    payload.append('name',     nameInput.value.trim());
    payload.append('email',    emailInput.value.trim());
    payload.append('subject',  subjectInput.value.trim());
    payload.append('message',  bodyInput.value.trim());
    payload.append('_subject', 'New message from your Portfolio site');
    payload.append('_captcha', 'false');
    payload.append('_template','box');

    try {
      const res = await fetch('https://formsubmit.co/ajax/heyimakashchowdhury@gmail.com', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: payload,
      });

      if (res.ok) {
        showSuccess();
      } else {
        const data = await res.json().catch(() => ({}));
        setLoading(false);
        showNetworkError(
          data.message || `Submission failed (HTTP ${res.status}). Please try the "Open in Email App" button instead.`
        );
      }
    } catch (err) {
      setLoading(false);
      // Network error or CORS on first-time FormSubmit activation
      showNetworkError(
        'Could not reach the mail server. This is usually because FormSubmit needs to verify your email address the very first time — ' +
        'check your inbox (<strong>heyimakashchowdhury@gmail.com</strong>) for a confirmation link, then try again. ' +
        'Or use the <strong>"Open in Email App"</strong> button below as an instant alternative.'
      );
    }
  });

  // ── Mailto button: pre-fill from form fields ───────────────
  if (mailtoBtn) {
    mailtoBtn.addEventListener('click', () => {
      const name    = nameInput    ? nameInput.value.trim()    : '';
      const email   = emailInput   ? emailInput.value.trim()   : '';
      const subject = subjectInput ? subjectInput.value.trim() : '';
      const body    = bodyInput    ? bodyInput.value.trim()    : '';

      const mailBody = [
        name  ? `From: ${name}${email ? ` <${email}>` : ''}` : '',
        '',
        body || '(Your message here…)',
      ].join('\n');

      const href = 'mailto:heyimakashchowdhury@gmail.com'
        + '?subject=' + encodeURIComponent(subject || 'Portfolio Contact')
        + '&body='    + encodeURIComponent(mailBody);

      window.location.href = href;
    });
  }

  // ── Animate form fields in on page load ───────────────────
  form.querySelectorAll('.form-group').forEach((f, i) => {
    f.style.opacity   = '0';
    f.style.transform = 'translateY(14px)';
    setTimeout(() => {
      f.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      f.style.opacity    = '1';
      f.style.transform  = 'translateY(0)';
    }, 180 + i * 70);
  });

});
