/**
 * Landing — Locação de carros
 * Edite o objeto CONFIG abaixo para trocar WhatsApp e regras simples.
 */

/* ========== CONFIGURÁVEL ========== */
const CONFIG = {
  // Número com DDI (ex.: 5511999999999). Troque pelo número real.
  whatsappNumber: "559884479292",

  // Mensagem do botão flutuante (sem dados do formulário)
  floatingMessage: "Olá! Quero saber mais sobre alugar meu carro.",

  // Prefixo da mensagem pós-formulário
  formMessagePrefix: "Olá, acabei de preencher o formulário sobre alugar meu carro",

  // Ano mínimo aceito no formulário
  minYear: 1990,
};

/* ========== HELPERS ========== */

/** Remove tudo que não for dígito */
function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

/** Máscara leve de telefone BR: (11) 99999-9999 */
function formatWhatsApp(value) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 2) {
    return digits.length ? `(${digits}` : "";
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Monta URL do wa.me com texto pré-pronto */
function buildWhatsAppUrl(message) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${text}`;
}

/** Define o href do botão flutuante */
function setupFloatingWhatsApp() {
  const floatBtn = document.getElementById("whatsapp-float");
  if (!floatBtn) return;
  floatBtn.href = buildWhatsAppUrl(CONFIG.floatingMessage);
}

/* ========== SCROLL REVEAL ========== */

function setupScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((el) => observer.observe(el));
}

/* ========== VALIDAÇÃO ========== */

function clearFieldError(input, errorEl) {
  input.classList.remove("is-invalid");
  if (errorEl) errorEl.textContent = "";
}

function setFieldError(input, errorEl, message) {
  input.classList.add("is-invalid");
  if (errorEl) errorEl.textContent = message;
}

function validateName(value) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  const parts = trimmed.split(" ").filter(Boolean);
  if (parts.length < 2) {
    return { ok: false, message: "Informe nome e sobrenome." };
  }
  return { ok: true, value: trimmed };
}

function validateWhatsApp(value) {
  const digits = onlyDigits(value);
  if (digits.length < 10 || digits.length > 11) {
    return { ok: false, message: "Informe um WhatsApp válido com DDD." };
  }
  return { ok: true, value: digits };
}

function validateRequired(value, label) {
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: false, message: `${label} é obrigatório.` };
  }
  return { ok: true, value: trimmed };
}

function validateYear(value) {
  const year = Number(value);
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(year) || year < CONFIG.minYear || year > currentYear) {
    return {
      ok: false,
      message: `Informe um ano entre ${CONFIG.minYear} e ${currentYear}.`,
    };
  }
  return { ok: true, value: year };
}

function getFormElements() {
  return {
    form: document.getElementById("lead-form"),
    success: document.getElementById("form-success"),
    status: document.getElementById("form-status"),
    successWhatsApp: document.getElementById("success-whatsapp"),
    fields: {
      nome: document.getElementById("nome"),
      whatsapp: document.getElementById("whatsapp"),
      modelo: document.getElementById("modelo"),
      ano: document.getElementById("ano"),
      cidade: document.getElementById("cidade"),
    },
    errors: {
      nome: document.getElementById("erro-nome"),
      whatsapp: document.getElementById("erro-whatsapp"),
      modelo: document.getElementById("erro-modelo"),
      ano: document.getElementById("erro-ano"),
      cidade: document.getElementById("erro-cidade"),
    },
  };
}

function setupForm() {
  const els = getFormElements();
  if (!els.form) return;

  // Máscara enquanto digita
  els.fields.whatsapp.addEventListener("input", () => {
    const formatted = formatWhatsApp(els.fields.whatsapp.value);
    els.fields.whatsapp.value = formatted;
  });

  // Limpa erro ao digitar
  Object.keys(els.fields).forEach((key) => {
    els.fields[key].addEventListener("input", () => {
      clearFieldError(els.fields[key], els.errors[key]);
      if (els.status) els.status.textContent = "";
    });
  });

  els.form.addEventListener("submit", (event) => {
    event.preventDefault();

    const nome = validateName(els.fields.nome.value);
    const whatsapp = validateWhatsApp(els.fields.whatsapp.value);
    const modelo = validateRequired(els.fields.modelo.value, "Modelo");
    const ano = validateYear(els.fields.ano.value);
    const cidade = validateRequired(els.fields.cidade.value, "Cidade");

    const results = { nome, whatsapp, modelo, ano, cidade };
    let firstInvalid = null;

    Object.keys(results).forEach((key) => {
      const result = results[key];
      if (result.ok) {
        clearFieldError(els.fields[key], els.errors[key]);
      } else {
        setFieldError(els.fields[key], els.errors[key], result.message);
        if (!firstInvalid) firstInvalid = els.fields[key];
      }
    });

    if (firstInvalid) {
      if (els.status) {
        els.status.textContent = "Confira os campos destacados e tente novamente.";
      }
      firstInvalid.focus();
      return;
    }

    // Sucesso: monta mensagem com os dados e troca a UI
    const message = [
      CONFIG.formMessagePrefix + ".",
      "",
      `Nome: ${nome.value}`,
      `WhatsApp: ${whatsapp.value}`,
      `Modelo: ${modelo.value}`,
      `Ano: ${ano.value}`,
      `Cidade: ${cidade.value}`,
    ].join("\n");

    if (els.successWhatsApp) {
      els.successWhatsApp.href = buildWhatsAppUrl(message);
    }

    els.form.hidden = true;
    if (els.success) {
      els.success.hidden = false;
      els.success.focus?.();
      els.success.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    if (els.status) els.status.textContent = "";
  });
}

/* ========== INIT ========== */

document.addEventListener("DOMContentLoaded", () => {
  setupFloatingWhatsApp();
  setupScrollReveal();
  setupForm();
});
