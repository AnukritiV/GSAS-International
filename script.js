const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 40));

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
  });
}
document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => nav?.classList.remove('open')));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, {threshold: 0.12});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

let counted = false;
const stats = document.querySelector('.stats');
const countObserver = new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting || counted) return;
  counted = true;
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '+';
    let start = 0;
    const duration = 1400;
    const startTime = performance.now();
    function tick(now){
      const p = Math.min((now-startTime)/duration, 1);
      const eased = 1 - Math.pow(1-p, 3);
      el.textContent = Math.floor(target*eased) + (p === 1 ? suffix : '');
      if(p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}, {threshold:.3});
if(stats) countObserver.observe(stats);

const testimonials = [...document.querySelectorAll('.testimonial')];
const dots = document.querySelector('.dots');
let index = 0;
testimonials.forEach((_,i)=>{
  const d=document.createElement('button');
  d.setAttribute('aria-label',`Go to review ${i+1}`);
  d.addEventListener('click',()=>show(i));
  dots.appendChild(d);
});
function show(i){
  testimonials[index].classList.remove('active');
  dots.children[index].classList.remove('active');
  index=(i+testimonials.length)%testimonials.length;
  testimonials[index].classList.add('active');
  dots.children[index].classList.add('active');
}
dots.children[0]?.classList.add('active');
document.querySelector('.prev')?.addEventListener('click',()=>show(index-1));
document.querySelector('.next')?.addEventListener('click',()=>show(index+1));

document.getElementById('year').textContent = new Date().getFullYear();


/* GSAS form validation: email + international phone number */
(function () {
  const emailRegex = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

  function normalizePhone(value) {
    return value.replace(/[^\d+]/g, "");
  }

  function isValidPhone(value) {
    const trimmed = value.trim();
    if (!trimmed) return true; // allow optional phone fields
    if (!/^\+?[0-9\s()\-]+$/.test(trimmed)) return false;
    const digits = trimmed.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  }

  function attachValidation(form) {
    const emails = form.querySelectorAll('input[type="email"]');
    const phones = form.querySelectorAll('input[type="tel"]');

    emails.forEach((input) => {
      input.addEventListener("input", () => {
        const value = input.value.trim();
        input.setCustomValidity(
          value && !emailRegex.test(value)
            ? "Please enter a valid email address, for example name@example.com."
            : ""
        );
      });
      input.addEventListener("blur", () => {
        const value = input.value.trim();
        input.setCustomValidity(
          value && !emailRegex.test(value)
            ? "Please enter a valid email address, for example name@example.com."
            : ""
        );
      });
    });

    phones.forEach((input) => {
      input.addEventListener("input", () => {
        const value = input.value;
        input.setCustomValidity(
          !isValidPhone(value)
            ? "Please enter a valid phone number with 7 to 15 digits. You may include +, spaces, brackets or hyphens."
            : ""
        );
      });
      input.addEventListener("blur", () => {
        const value = input.value;
        input.setCustomValidity(
          !isValidPhone(value)
            ? "Please enter a valid phone number with 7 to 15 digits. You may include +, spaces, brackets or hyphens."
            : ""
        );
      });
    });

    form.addEventListener("submit", (event) => {
      let firstInvalid = null;

      emails.forEach((input) => {
        const value = input.value.trim();
        if (value && !emailRegex.test(value)) {
          input.setCustomValidity("Please enter a valid email address, for example name@example.com.");
          firstInvalid ||= input;
        } else {
          input.setCustomValidity("");
        }
      });

      phones.forEach((input) => {
        const value = input.value;
        if (!isValidPhone(value)) {
          input.setCustomValidity("Please enter a valid phone number with 7 to 15 digits. You may include +, spaces, brackets or hyphens.");
          firstInvalid ||= input;
        } else {
          input.setCustomValidity("");
        }
      });

      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        (firstInvalid || form.querySelector(":invalid"))?.reportValidity();
        (firstInvalid || form.querySelector(":invalid"))?.focus();
      }
    }, true);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("form").forEach(attachValidation);
  });
})();


/* GSAS enquiry delivery: automatic email + WhatsApp */
(function () {
  const GSAS_EMAIL = "contact@gsasintl.com";
  const GSAS_WHATSAPP = "971589797465";
  const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${GSAS_EMAIL}`;

  function field(form, name) {
    const el = form.querySelector(`[name="${name}"]`);
    return el ? el.value.trim() : "";
  }

  function labelled(form, prefix) {
    const label = [...form.querySelectorAll("label")].find(
      l => l.textContent.trim().toLowerCase().startsWith(prefix.toLowerCase())
    );
    const el = label && label.querySelector("input, textarea, select");
    return el ? el.value.trim() : "";
  }

  function enquiryData(form, source) {
    const name = field(form, "name") || labelled(form, "Name");
    const email = field(form, "email") || labelled(form, "E-Mail");
    const phone = field(form, "phone") || labelled(form, "Phone Number");
    const website = field(form, "website") || labelled(form, "Your Website");
    const service = field(form, "service") || labelled(form, "Service");
    const message = field(form, "message") || labelled(form, "Message");
    const country = field(form, "country");
    const company = field(form, "company");
    const subject = field(form, "subject");

    const emailSubject = subject
      ? `GSAS Enquiry - ${subject}`
      : `GSAS Website Enquiry - ${name || "New Client"}`;

    const lines = [
      "New GSAS Website Enquiry",
      "",
      `Source: ${source}`,
      `Name: ${name || "-"}`,
      `Email: ${email || "-"}`,
      `Phone: ${phone || "-"}`,
      `Country / Region: ${country || "-"}`,
      `Company: ${company || "-"}`,
      `Website: ${website || "-"}`,
      `Service: ${service || "-"}`,
      `Subject: ${subject || "-"}`,
      "",
      "Message:",
      message || "-"
    ];

    return {
      name, email, phone, website, service, message, country, company, subject,
      emailSubject,
      whatsappMessage: lines.join("\n")
    };
  }

  async function submitEmail(data) {
    const payload = new FormData();

    payload.append("_subject", data.emailSubject);
    payload.append("_template", "table");
    payload.append("_captcha", "false");

    // Replying to the FormSubmit email will go to the customer.
    if (data.email) payload.append("_replyto", data.email);

    payload.append("Name", data.name || "-");
    payload.append("Email", data.email || "-");
    payload.append("Phone", data.phone || "-");
    payload.append("Country / Region", data.country || "-");
    payload.append("Company", data.company || "-");
    payload.append("Website", data.website || "-");
    payload.append("Service", data.service || "-");
    payload.append("Subject", data.subject || "-");
    payload.append("Message", data.message || "-");

    const response = await fetch(FORMSUBMIT_ENDPOINT, {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: payload
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || (result.success === "false")) {
      throw new Error(result.message || "Unable to send enquiry email.");
    }

    return result;
  }

  function openWhatsApp(message) {
    const url = `https://wa.me/${GSAS_WHATSAPP}?text=${encodeURIComponent(message + "\n\nPlease advise on the next steps.")}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function setButtonBusy(button, busy) {
    if (!button) return;
    if (busy) {
      button.dataset.originalText = button.innerHTML;
      button.innerHTML = "Sending Enquiry…";
      button.disabled = true;
      button.style.opacity = ".7";
      button.style.cursor = "wait";
    } else {
      button.innerHTML = button.dataset.originalText || "Send Enquiry";
      button.disabled = false;
      button.style.opacity = "";
      button.style.cursor = "";
    }
  }

  function wire(form, source, statusId) {
    if (!form || form.dataset.autoDelivery === "true") return;
    form.dataset.autoDelivery = "true";
    form.removeAttribute("onsubmit");

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const status = statusId
        ? document.getElementById(statusId)
        : form.querySelector(".form-status");
      const button = form.querySelector('button[type="submit"]');
      const data = enquiryData(form, source);

      setButtonBusy(button, true);
      if (status) status.textContent = "Sending your enquiry securely…";

      try {
        await submitEmail(data);

        if (status) {
          status.textContent =
            "Enquiry sent successfully to GSAS. WhatsApp is opening with the same details.";
          status.classList.remove("form-error");
          status.classList.add("form-success");
        }

        openWhatsApp(data.whatsappMessage);

        // Clear only after FormSubmit confirms success.
        form.reset();
      } catch (error) {
        console.error("GSAS enquiry submission failed:", error);
        if (status) {
          status.textContent =
            "We could not send the enquiry automatically. Please try again or contact GSAS directly at contact@gsasintl.com.";
          status.classList.remove("form-success");
          status.classList.add("form-error");
        }
      } finally {
        setButtonBusy(button, false);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    wire(document.getElementById("contactEnquiryForm"), "Contact Page", "formStatus");
    wire(document.getElementById("homeEnquiryForm"), "Homepage", "formStatus");
  });
})();

// Service detail popup: Business Banking Consultation
(function () {
  const modal = document.getElementById('business-banking-modal');
  if (!modal) return;

  const openLink = document.querySelector('[data-service-modal="business-banking"]');
  const closeTargets = modal.querySelectorAll('[data-close-service-modal]');
  let lastFocused = null;

  function openModal(event) {
    if (event) event.preventDefault();
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('service-modal-open');
    const closeButton = modal.querySelector('.service-modal-close');
    if (closeButton) closeButton.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('service-modal-open');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  if (openLink) openLink.addEventListener('click', openModal);
  closeTargets.forEach((el) => el.addEventListener('click', closeModal));

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
})();


// Service detail popup: Company Formation and Business Setup
(function () {
  const modal = document.getElementById('company-formation-modal');
  if (!modal) return;

  const openLink = document.querySelector('[data-service-modal="company-formation"]');
  const closeTargets = modal.querySelectorAll('[data-close-company-formation-modal]');
  let lastFocused = null;

  function openModal(event) {
    if (event) event.preventDefault();
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('service-modal-open');
    const closeButton = modal.querySelector('.service-modal-close');
    if (closeButton) closeButton.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('service-modal-open');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  if (openLink) openLink.addEventListener('click', openModal);
  closeTargets.forEach((el) => el.addEventListener('click', closeModal));

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
})();


// Service detail popup: Investment and Wealth Management Solutions
(function () {
  const modal = document.getElementById('investment-wealth-modal');
  if (!modal) return;
  const openLink = document.querySelector('[data-service-modal="investment-wealth"]');
  const closeTargets = modal.querySelectorAll('[data-close-investment-wealth-modal]');
  let lastFocused = null;
  function openModal(event) {
    if (event) event.preventDefault();
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('service-modal-open');
    const closeButton = modal.querySelector('.service-modal-close');
    if (closeButton) closeButton.focus();
  }
  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('service-modal-open');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }
  if (openLink) openLink.addEventListener('click', openModal);
  closeTargets.forEach((el) => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
})();

// Service detail popup: High-End Life Insurance Facilitation
(function () {
  const modal = document.getElementById('life-insurance-modal');
  if (!modal) return;
  const openLink = document.querySelector('[data-service-modal="life-insurance"]');
  const closeTargets = modal.querySelectorAll('[data-close-life-insurance-modal]');
  let lastFocused = null;

  function openModal(event) {
    if (event) event.preventDefault();
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('service-modal-open');
    const closeButton = modal.querySelector('.service-modal-close');
    if (closeButton) closeButton.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('service-modal-open');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  if (openLink) openLink.addEventListener('click', openModal);
  closeTargets.forEach((el) => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
})();


// Service 05: Commercial Brokerage Services modal
(() => {
  const modal = document.getElementById('commercial-brokerage-modal');
  if (!modal) return;
  const openLink = document.querySelector('[data-service-modal="commercial-brokerage"]');
  const closeTargets = modal.querySelectorAll('[data-close-commercial-brokerage-modal]');

  function openModal(event) {
    if (event) event.preventDefault();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('service-modal-open');
    const closeButton = modal.querySelector('.service-modal-close');
    if (closeButton) closeButton.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('service-modal-open');
    if (openLink) openLink.focus();
  }

  if (openLink) openLink.addEventListener('click', openModal);
  closeTargets.forEach((el) => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
})();


// Service 06: Specialist Advisory Connections and Structuring Guidance modal
(() => {
  const modal = document.getElementById('specialist-advisory-modal');
  if (!modal) return;
  const openLink = document.querySelector('[data-service-modal="specialist-advisory"]');
  const closeTargets = modal.querySelectorAll('[data-close-specialist-advisory-modal]');
  let lastFocused = null;

  function openModal(event) {
    if (event) event.preventDefault();
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('service-modal-open');
    const closeButton = modal.querySelector('.service-modal-close');
    if (closeButton) closeButton.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('service-modal-open');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  if (openLink) openLink.addEventListener('click', openModal);
  closeTargets.forEach((el) => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
})();


/* Reliable Back to top control */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href="#top"]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    });
  });
});
