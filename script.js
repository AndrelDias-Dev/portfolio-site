/**
 * Configurações fáceis de editar.
 * Adicione o número com DDI e DDD, somente dígitos. Ex.: 5511999999999.
 * Enquanto estiver vazio, o WhatsApp abrirá o seletor de contatos.
 */
const CONFIGURACAO = {
  whatsapp: "",
  mensagem: "Olá, Andrel! Vi seu portfólio e gostaria de conversar sobre um site para o meu negócio."
};

const movimentoReduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const linksWhatsApp = document.querySelectorAll("[data-whatsapp]");
const cabecalho = document.querySelector("[data-cabecalho]");
const menu = document.querySelector(".menu");
const botaoMenu = document.querySelector(".menu-botao");
let quadroRolagem = null;

function configurarWhatsApp() {
  const destino = CONFIGURACAO.whatsapp ? `/${CONFIGURACAO.whatsapp}` : "";
  const url = `https://wa.me${destino}?text=${encodeURIComponent(CONFIGURACAO.mensagem)}`;
  linksWhatsApp.forEach((link) => link.href = url);
}

function controlarMenu() {
  const aberto = botaoMenu.getAttribute("aria-expanded") === "true";
  botaoMenu.setAttribute("aria-expanded", String(!aberto));
  botaoMenu.setAttribute("aria-label", aberto ? "Abrir menu" : "Fechar menu");
  menu.classList.toggle("aberto", !aberto);
  document.body.classList.toggle("menu-aberto", !aberto);
}

function fecharMenu() {
  botaoMenu.setAttribute("aria-expanded", "false");
  botaoMenu.setAttribute("aria-label", "Abrir menu");
  menu.classList.remove("aberto");
  document.body.classList.remove("menu-aberto");
}

function cancelarRolagem() {
  if (!quadroRolagem) return;
  cancelAnimationFrame(quadroRolagem);
  quadroRolagem = null;
  document.documentElement.classList.remove("rolagem-controlada");
}

function rolarAteSecao(secao, ancora) {
  cancelarRolagem();

  const alturaCabecalho = cabecalho.offsetHeight;
  const inicio = window.scrollY;
  const posicaoSecao = secao.id === "inicio"
    ? 0
    : secao.getBoundingClientRect().top + inicio - alturaCabecalho - 16;
  const destino = Math.max(0, posicaoSecao);
  const distancia = destino - inicio;

  if (movimentoReduzido || Math.abs(distancia) < 2) {
    window.scrollTo(0, destino);
    history.pushState(null, "", ancora);
    return;
  }

  const duracao = Math.min(1800, Math.max(1050, 900 + Math.abs(distancia) * 0.14));
  let tempoInicial = null;
  document.documentElement.classList.add("rolagem-controlada");

  function animar(tempoAtual) {
    if (tempoInicial === null) tempoInicial = tempoAtual;
    const progresso = Math.min((tempoAtual - tempoInicial) / duracao, 1);
    const suavizacao = progresso < 0.5
      ? 4 * Math.pow(progresso, 3)
      : 1 - Math.pow(-2 * progresso + 2, 3) / 2;
    window.scrollTo(0, inicio + distancia * suavizacao);

    if (progresso < 1) {
      quadroRolagem = requestAnimationFrame(animar);
      return;
    }

    quadroRolagem = null;
    document.documentElement.classList.remove("rolagem-controlada");
    history.pushState(null, "", ancora);
  }

  quadroRolagem = requestAnimationFrame(animar);
}

function navegarParaAncora(evento) {
  const link = evento.currentTarget;
  const ancora = link.getAttribute("href");
  const secao = document.querySelector(ancora);
  if (!secao) return;

  evento.preventDefault();
  if (link.closest(".menu")) fecharMenu();
  requestAnimationFrame(() => rolarAteSecao(secao, ancora));
}

function iniciarRevelacoes() {
  const elementos = document.querySelectorAll(".revelar");
  if (movimentoReduzido || !("IntersectionObserver" in window)) {
    elementos.forEach((elemento) => elemento.classList.add("visivel"));
    return;
  }

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add("visivel");
      observador.unobserve(entrada.target);
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -45px" });

  elementos.forEach((elemento) => observador.observe(elemento));
}

function iniciarSpotlights() {
  if (movimentoReduzido || !window.matchMedia("(pointer: fine)").matches) return;
  document.querySelectorAll("[data-spotlight]").forEach((elemento) => {
    elemento.addEventListener("pointermove", (evento) => {
      const area = elemento.getBoundingClientRect();
      elemento.style.setProperty("--spot-x", `${evento.clientX - area.left}px`);
      elemento.style.setProperty("--spot-y", `${evento.clientY - area.top}px`);
    });
  });
}

function atualizarRolagem() {
  cabecalho.classList.toggle("rolado", window.scrollY > 24);

  const timeline = document.querySelector("[data-timeline]");
  if (timeline) {
    const area = timeline.getBoundingClientRect();
    const inicio = window.innerHeight * 0.7;
    const distancia = area.height + window.innerHeight * 0.15;
    const progresso = Math.min(1, Math.max(0, (inicio - area.top) / distancia));
    timeline.style.setProperty("--progresso", progresso.toFixed(3));
  }
}

function observarSecoes() {
  const links = [...document.querySelectorAll(".menu a")];
  const secoes = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      links.forEach((link) => link.classList.toggle("ativo", link.getAttribute("href") === `#${entrada.target.id}`));
    });
  }, { rootMargin: "-35% 0px -55%" });
  secoes.forEach((secao) => observador.observe(secao));
}

configurarWhatsApp();
iniciarRevelacoes();
iniciarSpotlights();
observarSecoes();
atualizarRolagem();

botaoMenu.addEventListener("click", controlarMenu);
document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((link) => {
  link.addEventListener("click", navegarParaAncora);
});
window.addEventListener("wheel", cancelarRolagem, { passive: true });
window.addEventListener("touchstart", cancelarRolagem, { passive: true });
window.addEventListener("scroll", atualizarRolagem, { passive: true });
document.querySelector("[data-ano]").textContent = new Date().getFullYear();
