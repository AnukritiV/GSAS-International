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

// The testimonial carousel exists on the homepage only. Guard it so shared
// JavaScript continues loading on Contact and Request a Quote pages.
if (testimonials.length && dots) {
  testimonials.forEach((_,i)=>{
    const d=document.createElement('button');
    d.setAttribute('aria-label',`Go to review ${i+1}`);
    d.addEventListener('click',()=>show(i));
    dots.appendChild(d);
  });

  function show(i){
    testimonials[index].classList.remove('active');
    dots.children[index]?.classList.remove('active');
    index=(i+testimonials.length)%testimonials.length;
    testimonials[index].classList.add('active');
    dots.children[index]?.classList.add('active');
  }

  dots.children[0]?.classList.add('active');
  document.querySelector('.prev')?.addEventListener('click',()=>show(index-1));
  document.querySelector('.next')?.addEventListener('click',()=>show(index+1));
}

document.getElementById('year')?.replaceChildren(document.createTextNode(new Date().getFullYear()));


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

/* ===== GSAS Agentic AI + WhatsApp Assistant ===== */
(() => {
  const SUPPORT = {
    whatsapp: '971589797465',
    phoneDisplay: '+971 58 979 7465',
    email: 'contact@gsasintl.com'
  };
  const AI_API_URL = (window.GSAS_AI_API_URL || '').trim();
  const history = [];

  const whatsappSvg = `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M19.11 17.37c-.28-.14-1.65-.81-1.91-.91-.26-.09-.45-.14-.64.14-.19.28-.73.91-.9 1.1-.16.19-.33.21-.61.07-.28-.14-1.18-.43-2.25-1.39-.83-.74-1.39-1.66-1.55-1.94-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.64-1.55-.88-2.12-.23-.56-.47-.48-.64-.49h-.54c-.19 0-.49.07-.75.35-.26.28-.99.97-.99 2.36s1.01 2.73 1.15 2.92c.14.19 1.99 3.04 4.82 4.26.67.29 1.2.46 1.61.59.68.22 1.29.19 1.78.12.54-.08 1.65-.68 1.89-1.33.23-.65.23-1.2.16-1.32-.07-.12-.26-.19-.54-.33zM16.03 3.2A12.65 12.65 0 0 0 5.2 22.39L3.3 29.32l7.09-1.86a12.63 12.63 0 1 0 5.64-24.26zm0 22.99c-1.8 0-3.57-.48-5.1-1.39l-.37-.22-4.21 1.1 1.12-4.1-.24-.38A10.35 10.35 0 1 1 16.03 26.2z"/></svg>`;

  const launcher = document.createElement('button');
  launcher.className = 'gsas-assistant-launcher';
  launcher.setAttribute('aria-label', 'Open GSAS AI assistant');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.innerHTML = `${whatsappSvg}<span class="gsas-assistant-badge" aria-hidden="true"></span>`;

  const panel = document.createElement('section');
  panel.className = 'gsas-assistant-panel';
  panel.setAttribute('aria-label', 'GSAS AI Assistant');
  panel.innerHTML = `
    <div class="gsas-assistant-head">
      <div class="gsas-assistant-head-icon">${whatsappSvg}</div>
      <div class="gsas-assistant-head-text"><strong>GSAS AI Assistant</strong><span>${AI_API_URL ? 'AI online • Human handoff available' : 'Guided mode • Human handoff available'}</span></div>
      <button class="gsas-assistant-close" aria-label="Close assistant">×</button>
    </div>
    <div class="gsas-assistant-body" aria-live="polite"></div>
    <div class="gsas-assistant-compose">
      <textarea class="gsas-assistant-input" rows="1" placeholder="Ask about banking, setup, investment, insurance..." aria-label="Message"></textarea>
      <button class="gsas-assistant-send" aria-label="Send message">➤</button>
    </div>
    <div class="gsas-assistant-disclaimer">AI guidance is general information, not legal, tax, financial or regulated advice. Do not share passwords, account numbers or sensitive documents in chat.</div>`;

  document.body.append(launcher, panel);

  const body = panel.querySelector('.gsas-assistant-body');
  const input = panel.querySelector('.gsas-assistant-input');
  const closeBtn = panel.querySelector('.gsas-assistant-close');
  const sendBtn = panel.querySelector('.gsas-assistant-send');

  const esc = (s) => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const waUrl = (text) => `https://wa.me/${SUPPORT.whatsapp}?text=${encodeURIComponent(text)}`;
  const mailUrl = (subject, text) => `mailto:${SUPPORT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;

  function addMsg(html, who='bot') {
    const m = document.createElement('div');
    m.className = `gsas-msg ${who}`;

    // User messages are always plain text. Bot UI markup is generated internally.
    // Customer-facing AI/guided text is sanitized before it reaches this function.
    m.innerHTML = html;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
    return m;
  }

  function setThinking(on) {
    const existing = body.querySelector('.gsas-thinking');
    if (existing) existing.remove();
    if (on) addMsg('<span class="gsas-thinking"><i></i><i></i><i></i></span>');
  }

  function quickActions(items) {
    const wrap = document.createElement('div');
    wrap.className = 'gsas-quick-actions';
    items.forEach(({label, value}) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = label;
      b.addEventListener('click', () => handleUserMessage(value, label));
      wrap.appendChild(b);
    });
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }

  function handoff(topic, summary, page='contact.html') {
    const text = `Hello GSAS, I am contacting you after using the website assistant.\n\nTopic: ${topic}\nSummary: ${summary || 'I would like assistance.'}\n\nPlease advise on the next step.`;
    return `<div class="gsas-agent-actions">
      <a class="gsas-agent-action primary" target="_blank" rel="noopener" href="${waUrl(text)}">Continue on WhatsApp</a>
      <a class="gsas-agent-action secondary" href="${mailUrl(`GSAS enquiry: ${topic}`, text)}">Send Email</a>
      <a class="gsas-agent-action secondary" href="tel:+971589797465">Call ${SUPPORT.phoneDisplay}</a>
      <a class="gsas-agent-action secondary" href="${esc(page)}">Open Relevant Page</a>
    </div>`;
  }

  const intents = [
    {keys:['bank','banking','account','facilitation'], topic:'Business Banking Consultation & Bank Account Facilitation', response:'GSAS can help assess your business banking or bank-account facilitation requirement. Useful details include your company jurisdiction, business activity, intended banking country and timeline.', page:'index.html#services'},
    {keys:['company','formation','setup','incorporat','license','licence'], topic:'Company Formation & Business Setup', response:'For company formation and business setup, GSAS can help route your requirement based on jurisdiction, activity, ownership structure and expected timeline.', page:'index.html#services'},
    {keys:['investment','wealth','portfolio','investor'], topic:'Investment & Wealth Solutions', response:'GSAS can route investment and wealth enquiries to the appropriate consultation path. Please avoid sharing sensitive financial information in this chat.', page:'index.html#services'},
    {keys:['insurance','life insurance','policy','protection'], topic:'High-End Life Insurance Facilitation', response:'GSAS can help route life-insurance facilitation enquiries based on your objectives and jurisdiction.', page:'index.html#services'},
    {keys:['broker','brokerage','commercial','deal'], topic:'Commercial Brokerage Services', response:'For commercial brokerage requirements, GSAS can first understand the transaction objective, jurisdiction and stage, then guide you to the appropriate next step.', page:'index.html#services'},
    {keys:['advisory','structur','specialist','consultant','consulting'], topic:'Specialist Advisory & Structuring Guidance', response:'For specialist advisory or structuring needs, GSAS can identify the appropriate advisory path after understanding your objective and jurisdiction.', page:'index.html#services'},
    {keys:['quote','quotation','price','pricing','cost','proposal','budget'], topic:'Quotation Request', response:'For pricing or a formal proposal, the Request a Quote page is the best route because it captures the scope, budget and timeline needed for review.', page:'quotation.html'},
    {keys:['contact','support','help','human','agent','representative','email','phone','call','whatsapp'], topic:'General Support', response:`You can reach GSAS by WhatsApp/phone at ${SUPPORT.phoneDisplay} or by email at ${SUPPORT.email}.`, page:'contact.html'}
  ];

  function guidedReply(raw) {
    const q = raw.toLowerCase();
    const match = intents.find(i => i.keys.some(k => q.includes(k)));
    if (match) return {reply:match.response, topic:match.topic, route:match.page, handoffSummary:raw};
    return {reply:'I can help route this enquiry. To give you the right next step, please tell me whether it relates to banking, company setup, investment/wealth, insurance, commercial brokerage, specialist advisory, pricing, or general support.', topic:'General Enquiry', route:'contact.html', handoffSummary:raw};
  }

  async function askAI(raw) {
    if (!AI_API_URL) return guidedReply(raw);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);
    try {
      const response = await fetch(AI_API_URL.replace(/\/$/, '') + '/api/chat', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        signal:controller.signal,
        body:JSON.stringify({
          message: raw,
          history: history.slice(-10),
          page: location.pathname.split('/').pop() || 'index.html'
        })
      });
      if (!response.ok) throw new Error(`AI service ${response.status}`);
      const data = await response.json();
      if (!data || !data.reply) throw new Error('Invalid AI response');
      return data;
    } catch (err) {
      console.warn('GSAS AI unavailable, using guided fallback:', err);
      return guidedReply(raw);
    } finally {
      clearTimeout(timeout);
    }
  }

  async function handleUserMessage(value, label) {
    const raw = (value || '').trim();
    if (!raw) return;
    if (raw === 'start') {
      addMsg('Welcome to <strong>GSAS International</strong>. I can understand your requirement, ask follow-up questions, recommend the appropriate service, and prepare a handoff to our team. How can I help?');
      quickActions([
        {label:'Banking',value:'I need help with business banking'},
        {label:'Company Setup',value:'I want to set up a company'},
        {label:'Investment & Wealth',value:'I need investment or wealth support'},
        {label:'Insurance',value:'I need help with life insurance'},
        {label:'Commercial Brokerage',value:'I have a commercial brokerage enquiry'},
        {label:'Specialist Advisory',value:'I need specialist advisory'},
        {label:'Request a Quote',value:'I want a quotation'},
        {label:'Human Support',value:'I want to speak with a representative'}
      ]);
      return;
    }

    if (label) addMsg(esc(label), 'user');
    history.push({role:'user', content:raw});
    setThinking(true);
    const result = await askAI(raw);
    setThinking(false);

    const topic = result.topic || 'General Enquiry';
    const page = result.route || 'contact.html';
    const summary = result.handoffSummary || raw;
    const reply = esc(result.reply || 'I can help route your enquiry.').replace(/\n/g,'<br>');
    addMsg(`${reply}${handoff(topic, summary, page)}`);
    history.push({role:'assistant', content:result.reply || ''});

    if (result.followup) {
      quickActions([{label:esc(result.followup), value:result.followup}]);
    } else {
      quickActions([{label:'Ask another question',value:'start'}]);
    }
  }

  async function send() {
    const value = input.value.trim();
    if (!value) return;
    input.value = '';
    addMsg(esc(value), 'user');
    history.push({role:'user', content:value});
    setThinking(true);
    const result = await askAI(value);
    setThinking(false);
    const topic = result.topic || 'General Enquiry';
    const page = result.route || 'contact.html';
    const summary = result.handoffSummary || value;
    const reply = esc(result.reply || 'I can help route your enquiry.').replace(/\n/g,'<br>');
    addMsg(`${reply}${handoff(topic, summary, page)}`);
    history.push({role:'assistant', content:result.reply || ''});
  }

  launcher.addEventListener('click', () => {
    const open = !panel.classList.contains('open');
    panel.classList.toggle('open', open);
    launcher.setAttribute('aria-expanded', String(open));
    if (open) {
      if (!body.children.length) handleUserMessage('start');
      setTimeout(() => input.focus(), 100);
    }
  });
  closeBtn.addEventListener('click', () => {panel.classList.remove('open'); launcher.setAttribute('aria-expanded','false');});
  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => {if (e.key === 'Enter' && !e.shiftKey){e.preventDefault();send();}});
})();
