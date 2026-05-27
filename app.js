const html = document.documentElement;
const toggle = document.querySelector("[data-theme-toggle]");
const reveals = document.querySelectorAll(".reveal");
const slides = document.querySelectorAll(".bg-slide");
const form = document.getElementById("rsvpForm");

const totalGuests = document.getElementById("totalGuests");
const totalComing = document.getElementById("totalComing");
const totalDeclined = document.getElementById("totalDeclined");

let currentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
html.setAttribute("data-theme", currentTheme);

if (toggle) {
  toggle.addEventListener("click", () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", currentTheme);
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  },
  { threshold: 0.18 }
);

reveals.forEach((el) => observer.observe(el));

let activeSlide = 0;
setInterval(() => {
  slides[activeSlide].classList.remove("active");
  activeSlide = (activeSlide + 1) % slides.length;
  slides[activeSlide].classList.add("active");
}, 4500);

async function loadRSVP() {
  try {
    const res = await fetch("./rsvp.json?v=" + Date.now());
    const data = await res.json();
    renderStats(data.respuestas || []);
  } catch (error) {
    renderStats([]);
  }
}

function renderStats(respuestas) {
  const coming = respuestas.filter((item) => item.attending === true);
  const declined = respuestas.filter((item) => item.attending === false);

  const guestsConfirmed = coming.reduce((acc, item) => acc + Number(item.guests || 1), 0);

  totalGuests.textContent = guestsConfirmed;
  totalComing.textContent = coming.length;
  totalDeclined.textContent = declined.length;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    name: document.getElementById("name").value.trim(),
    attending: document.getElementById("attending").value === "si",
    guests: Number(document.getElementById("guests").value),
    song: document.getElementById("song").value.trim(),
    message: document.getElementById("message").value.trim(),
    createdAt: new Date().toISOString()
  };

  const prettyJson = JSON.stringify(payload, null, 2);

  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(prettyJson);
    }
  } catch (e) {}

  const phone = "34600000000"; // CAMBIA ESTO POR TU NÚMERO
  const text = `RSVP boda:%0A%0A${encodeURIComponent(prettyJson)}`;
  const url = `https://wa.me/${phone}?text=${text}`;

  window.open(url, "_blank", "noopener,noreferrer");
  form.reset();
  document.getElementById("formNote").textContent =
    "Se ha preparado tu respuesta. Si no se abrió WhatsApp, revisa el número configurado.";
});

loadRSVP();
