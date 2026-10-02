/* ==========================================================
   HOTEL · lógica
   Lee CONFIG (js/config.js) y arma la página.
   No hace falta editar este archivo para personalizar.
   ========================================================== */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const soles = (n) => "S/ " + n.toFixed(2);
  const solesCorto = (n) => "S/ " + (Number.isInteger(n) ? n : n.toFixed(2));
  const waLink = (msg) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Fechas (todas como "AAAA-MM-DD", hora de Perú) ---------- */
  const hoyLima = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());
  const sumarDias = (f, n) => {
    const [y, m, d] = f.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
  };
  const diaSemana = (f) => new Date(f + "T12:00:00Z").getUTCDay();
  const fmtFecha = (f, conAnio = true) => new Intl.DateTimeFormat("es-PE", {
    weekday: "short", day: "numeric", month: "short", ...(conAnio ? { year: "numeric" } : {}), timeZone: "UTC",
  }).format(new Date(f + "T12:00:00Z")).replace(/\./g, "");
  const fmtHora = (h) => {
    const [hh, mm] = h.split(":").map(Number);
    const h12 = hh % 12 || 12;
    return `${h12}${mm ? ":" + String(mm).padStart(2, "0") : ""} ${hh < 12 ? "a. m." : "p. m."}`;
  };
  const listaNoches = () => {
    const out = [];
    for (let f = estado.llegada; f < estado.salida; f = sumarDias(f, 1)) out.push(f);
    return out;
  };

  /* ---------- Estado + memoria del navegador ---------- */
  const CLAVE = "reserva-" + CONFIG.nombre;
  const hoy = hoyLima();
  const estado = {
    llegada: sumarDias(hoy, 1),
    salida: sumarDias(hoy, 3),
    huespedes: 2,
    reserva: new Map(),   // id de habitación → cantidad
    extras: new Set(),
  };
  try {
    const g = JSON.parse(localStorage.getItem(CLAVE) || "null");
    if (g) {
      if (g.llegada >= hoy && g.salida > g.llegada) { estado.llegada = g.llegada; estado.salida = g.salida; }
      if (g.huespedes) estado.huespedes = g.huespedes;
      (g.reserva || []).forEach(([id, n]) => { if (habPorId(id)) estado.reserva.set(id, n); });
      (g.extras || []).forEach((id) => { if (CONFIG.extras.some((e) => e.id === id)) estado.extras.add(id); });
    }
  } catch (_) { /* sin memoria: se usa el estado por defecto */ }
  const guardar = () => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({
        llegada: estado.llegada, salida: estado.salida, huespedes: estado.huespedes,
        reserva: [...estado.reserva], extras: [...estado.extras],
      }));
    } catch (_) { /* modo privado o almacenamiento bloqueado */ }
  };

  function habPorId(id) { return CONFIG.habitaciones.find((h) => h.id === id); }

  /* ---------- Precios ---------- */
  const temporadaDe = (f) => CONFIG.temporadas.find((t) => f >= t.desde && f <= t.hasta);
  function precioNoche(hab, f) {
    const finde = [5, 6].includes(diaSemana(f));            // noches de viernes y sábado
    let p = finde && hab.precioFinde ? hab.precioFinde : hab.precio;
    const t = temporadaDe(f);
    if (t) p = Math.round(p * (1 + t.recargo / 100));
    return p;
  }
  const precioEstadia = (hab) => listaNoches().reduce((s, f) => s + precioNoche(hab, f), 0);
  const descuentoEstadia = (n) => CONFIG.estadias
    .filter((e) => e.porcentaje > 0 && n >= e.minNoches)
    .sort((a, b) => b.porcentaje - a.porcentaje)[0] || null;

  function precioExtra(ex, noches) {
    if (ex.gratisDesdeNoches && noches >= ex.gratisDesdeNoches) return 0;
    if (ex.cobro === "noche") return ex.precio * noches;
    if (ex.cobro === "personaNoche") return ex.precio * noches * estado.huespedes;
    return ex.precio;
  }

  function calcular() {
    const noches = listaNoches().length;
    const lineas = [...estado.reserva].map(([id, n]) => {
      const hab = habPorId(id);
      return { hab, n, total: precioEstadia(hab) * n };
    });
    const subtotal = lineas.reduce((s, l) => s + l.total, 0);
    const desc = descuentoEstadia(noches);
    const descMonto = desc ? Math.round(subtotal * desc.porcentaje) / 100 : 0;
    const extras = CONFIG.extras.filter((e) => estado.extras.has(e.id))
      .map((ex) => ({ ex, total: precioExtra(ex, noches) }));
    const extrasTotal = extras.reduce((s, e) => s + e.total, 0);
    const total = subtotal - descMonto + extrasTotal;
    const capacidad = lineas.reduce((s, l) => s + l.hab.capacidad * l.n, 0) + (estado.extras.has("cama") ? 1 : 0);
    const habitaciones = lineas.reduce((s, l) => s + l.n, 0);
    return { noches, lineas, subtotal, desc, descMonto, extras, extrasTotal, total, capacidad, habitaciones,
      adelanto: Math.round(total * CONFIG.adelanto) / 100 };
  }

  /* ---------- Textos simples ---------- */
  const [primera, ...resto] = CONFIG.nombre.split(" ");
  $$("[data-nombre]").forEach((el) => { el.innerHTML = `${esc(primera)} <em>${esc(resto.join(" "))}</em>`; });
  $$("[data-nombre-plano]").forEach((el) => { el.textContent = CONFIG.nombre; });
  $$("[data-eslogan]").forEach((el) => { el.textContent = CONFIG.eslogan; });
  $$("[data-ciudad]").forEach((el) => { el.textContent = CONFIG.ciudad; });
  $$("[data-checkin]").forEach((el) => { el.textContent = fmtHora(CONFIG.checkin); });
  $$("[data-checkout]").forEach((el) => { el.textContent = fmtHora(CONFIG.checkout); });
  $$("[data-direccion]").forEach((el) => { el.textContent = CONFIG.direccion; });
  $$("[data-tel]").forEach((el) => { el.textContent = CONFIG.telefono; el.href = "tel:" + CONFIG.telefono.replace(/\s/g, ""); });
  $$("[data-email]").forEach((el) => { el.textContent = CONFIG.email; el.href = "mailto:" + CONFIG.email; });
  $$("[data-pagos]").forEach((el) => { el.textContent = CONFIG.pagos.join(" · ") + (CONFIG.factura ? " · Boleta y factura" : ""); });
  $("#anio").textContent = new Date().getFullYear();
  $("#convenio-texto").textContent = CONFIG.convenio;

  $$("[data-wa]").forEach((a) => {
    a.href = waLink(a.dataset.wa || `Hola ${CONFIG.nombre} 👋, quiero consultar disponibilidad de habitaciones.`);
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* ---------- Anuncio que rota ---------- */
  const anuncio = $("#anuncio"), anuncioTxt = $("#anuncio-texto");
  if (!CONFIG.anuncios.length) anuncio.hidden = true;
  else {
    let i = 0;
    anuncioTxt.textContent = CONFIG.anuncios[0];
    if (CONFIG.anuncios.length > 1 && !reducido) {
      setInterval(() => {
        anuncioTxt.classList.add("cambiando");
        setTimeout(() => {
          i = (i + 1) % CONFIG.anuncios.length;
          anuncioTxt.textContent = CONFIG.anuncios[i];
          anuncioTxt.classList.remove("cambiando");
        }, 350);
      }, 4500);
    }
  }

  /* ---------- Header ---------- */
  const header = $("#header");
  window.addEventListener("scroll", () => header.classList.toggle("scrolled", scrollY > 10), { passive: true });
  const nav = $("#nav"), menuBtn = $("#menu-btn");
  menuBtn.addEventListener("click", () => {
    const abierto = nav.classList.toggle("abierto");
    menuBtn.setAttribute("aria-expanded", abierto);
    menuBtn.innerHTML = `<i class="ph ${abierto ? "ph-x" : "ph-list"}" aria-hidden="true"></i>`;
  });
  $$("a", nav).forEach((a) => a.addEventListener("click", () => {
    nav.classList.remove("abierto");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.innerHTML = '<i class="ph ph-list" aria-hidden="true"></i>';
  }));

  /* ---------- Calificaciones ---------- */
  const estrellas = (n) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));
  $("#hero-ratings").innerHTML = CONFIG.ratings.map((r) => `
    <span class="rating-pill"><i class="ph-fill ph-star" aria-hidden="true"></i>
      <strong>${r.valor}</strong>${r.max !== 5 ? `<span aria-hidden="true">/${r.max}</span>` : ""} ${esc(r.fuente)}
      <span class="sr-only">, ${r.total} reseñas</span></span>`).join("");
  $("#ratings-resumen").innerHTML = CONFIG.ratings.map((r) => `
    <div class="rating-card">
      <i class="ph ${esc(r.icono)}" aria-hidden="true"></i>
      <div><strong>${r.valor}</strong><span aria-hidden="true">/${r.max}</span>
        <small>${esc(r.fuente)} · ${r.total} reseñas</small></div>
    </div>`).join("");

  /* ---------- Cinta ---------- */
  const items = CONFIG.cinta.map((t) => `<span class="cinta__item">${esc(t)}</span><span class="cinta__sep">✦</span>`).join("");
  $("#cinta").innerHTML = `<span>${items}</span><span>${items}</span>`;

  /* ---------- Qué incluye ---------- */
  $("#incluido-grid").innerHTML = CONFIG.incluido.map((s, i) => `
    <article class="incluido__item" data-aos="fade-up" data-aos-delay="${(i % 5) * 50}">
      <span class="incluido__icono"><i class="ph ${esc(s.icono)}" aria-hidden="true"></i></span>
      <div><h3>${esc(s.nombre)}</h3><p>${esc(s.detalle)}</p></div>
    </article>`).join("");

  /* ---------- Huéspedes (selects) ---------- */
  const opcionesHuespedes = Array.from({ length: 8 }, (_, i) =>
    `<option value="${i + 1}">${i + 1} ${i ? "huéspedes" : "huésped"}</option>`).join("");
  ["#f-huespedes", "#d-huespedes"].forEach((s) => { $(s).innerHTML = opcionesHuespedes; });
  $("#c-pago").innerHTML = CONFIG.pagos.filter((p) => p !== "Efectivo").map((p) => `<option>${esc(p)}</option>`).join("");
  if (!CONFIG.factura) $("#c-factura-wrap").hidden = true;

  /* ---------- Fechas: buscador y panel sincronizados ---------- */
  const pares = [["#f-llegada", "#d-llegada"], ["#f-salida", "#d-salida"], ["#f-huespedes", "#d-huespedes"]];
  function pintarFechas() {
    pares.forEach(([a, b]) => {
      const valor = a.includes("llegada") ? estado.llegada : a.includes("salida") ? estado.salida : estado.huespedes;
      [$(a), $(b)].forEach((el) => { el.value = valor; });
    });
    ["#f-llegada", "#d-llegada"].forEach((s) => { $(s).min = hoy; });
    ["#f-salida", "#d-salida"].forEach((s) => { $(s).min = sumarDias(estado.llegada, 1); });
  }
  function cambiarFechas(campo, valor) {
    if (campo === "llegada") {
      if (!valor || valor < hoy) valor = hoy;
      const noches = listaNoches().length || 1;
      estado.llegada = valor;
      if (estado.salida <= valor) estado.salida = sumarDias(valor, noches);
    } else if (campo === "salida") {
      estado.salida = valor && valor > estado.llegada ? valor : sumarDias(estado.llegada, 1);
    } else {
      estado.huespedes = Number(valor) || 1;
    }
    guardar();
    actualizarTodo();
  }
  pares.forEach(([a, b]) => [a, b].forEach((s) => {
    const campo = s.includes("llegada") ? "llegada" : s.includes("salida") ? "salida" : "huespedes";
    $(s).addEventListener("change", (e) => cambiarFechas(campo, e.target.value));
  }));
  $("#buscador").addEventListener("submit", (e) => {
    e.preventDefault();
    const cap = estado.huespedes;
    const filtro = cap >= 3 ? "grupo" : cap === 2 ? "pareja" : "todas";
    aplicarFiltro(filtro);
    $("#habitaciones").scrollIntoView({ behavior: reducido ? "auto" : "smooth" });
  });

  function textoEstadia(conAnio = false) {
    const n = listaNoches().length;
    return `${n} ${n === 1 ? "noche" : "noches"} · ${fmtFecha(estado.llegada, conAnio)} → ${fmtFecha(estado.salida, conAnio)}`;
  }

  /* ---------- Filtros ---------- */
  const FILTROS = [
    { id: "todas", nombre: "Todas", icono: "ph-squares-four", ok: () => true },
    { id: "solo", nombre: "1 persona", icono: "ph-user", ok: (h) => h.capacidad === 1 },
    { id: "pareja", nombre: "2 personas", icono: "ph-users", ok: (h) => h.capacidad === 2 },
    { id: "grupo", nombre: "3 o más", icono: "ph-users-three", ok: (h) => h.capacidad >= 3 },
  ];
  const filtros = $("#filtros");
  filtros.innerHTML = FILTROS.map((f, i) => `
    <button class="chip" type="button" role="tab" data-filtro="${f.id}" aria-selected="${i === 0}">
      <i class="ph ${f.icono}" aria-hidden="true"></i>${f.nombre}</button>`).join("");
  function aplicarFiltro(id) {
    const f = FILTROS.find((x) => x.id === id) || FILTROS[0];
    $$(".chip", filtros).forEach((b) => b.setAttribute("aria-selected", b.dataset.filtro === f.id));
    $$(".hab").forEach((card) => { card.hidden = !f.ok(habPorId(card.dataset.id)); });
    const b = $(`[data-filtro="${f.id}"]`, filtros);
    filtros.scrollTo({ left: b.offsetLeft - (filtros.clientWidth - b.offsetWidth) / 2, behavior: "smooth" });
    if (window.AOS) AOS.refresh();
  }
  filtros.addEventListener("click", (e) => {
    const b = e.target.closest("[data-filtro]");
    if (b) aplicarFiltro(b.dataset.filtro);
  });

  /* ---------- Tarjetas de habitaciones ---------- */
  const grid = $("#habitaciones-grid");
  const fallbackHab = "images/habitaciones/habitacion.svg";

  function botonesHab(h) {
    const n = estado.reserva.get(h.id) || 0;
    const detalle = `<button class="btn btn--linea btn--sm" type="button" data-detalle="${h.id}" aria-label="Ver detalles de ${esc(h.nombre)}"><i class="ph ph-images" aria-hidden="true"></i></button>`;
    if (!n) return `${detalle}<button class="btn btn--accion btn--sm" type="button" data-agregar="${h.id}"><i class="ph ph-plus" aria-hidden="true"></i> Reservar</button>`;
    return `${detalle}<div class="cantidad" role="group" aria-label="Cantidad de ${esc(h.corto)}">
      <button type="button" data-restar="${h.id}" aria-label="Quitar una"><i class="ph ph-minus" aria-hidden="true"></i></button>
      <span>${n} ${n === 1 ? "hab." : "habs."}</span>
      <button type="button" data-sumar="${h.id}" aria-label="Agregar otra" ${n >= h.unidades ? "disabled" : ""}><i class="ph ph-plus" aria-hidden="true"></i></button>
    </div>`;
  }

  function tarjetaHab(h, i) {
    const amen = h.amenidades.map((k) => CONFIG.amenidades[k]).filter(Boolean);
    const visibles = amen.slice(0, 5);
    const ahorro = h.precioApps ? Math.round((1 - h.precio / h.precioApps) * 100) : 0;
    return `
    <article class="hab" data-id="${h.id}" data-aos="fade-up" data-aos-delay="${(i % 3) * 70}">
      <button class="hab__foto" type="button" data-detalle="${h.id}" aria-label="Ver fotos de ${esc(h.nombre)}">
        ${h.etiqueta ? `<span class="hab__etiqueta">${esc(h.etiqueta)}</span>` : h.nuevo ? `<span class="hab__etiqueta hab__etiqueta--nuevo">Renovada</span>` : ""}
        ${ahorro > 0 ? `<span class="hab__ahorro">-${ahorro}% directo</span>` : ""}
        ${h.imagenes.slice(0, 2).map((src, j) => `<img src="${esc(src)}" alt="${j ? "" : esc(h.nombre)}" loading="lazy" data-fallback="${fallbackHab}">`).join("")}
      </button>
      <div class="hab__body">
        <h3 class="hab__nombre">${esc(h.nombre)}</h3>
        <div class="hab__datos">
          <span><i class="ph ph-users" aria-hidden="true"></i>${h.capacidad} ${h.capacidad === 1 ? "persona" : "personas"}</span>
          <span><i class="ph ph-bed" aria-hidden="true"></i>${esc(h.camas)}</span>
          <span><i class="ph ph-ruler" aria-hidden="true"></i>${h.m2} m²</span>
        </div>
        <p class="hab__desc">${esc(h.descripcion)}</p>
        <ul class="hab__amen" aria-label="Comodidades">
          ${visibles.map((a) => `<li title="${esc(a.nombre)}"><i class="ph ${esc(a.icono)}" aria-hidden="true"></i><span class="sr-only">${esc(a.nombre)}</span></li>`).join("")}
          ${amen.length > visibles.length ? `<li class="mas">+${amen.length - visibles.length}</li>` : ""}
        </ul>
        <div class="hab__precio">
          <div>
            ${h.precioApps ? `<s aria-label="Precio en apps">${solesCorto(h.precioApps)} en apps</s>` : ""}
            <span class="hab__precio-num">${solesCorto(h.precio)} <small>/ noche</small></span>
          </div>
          <div class="hab__total" data-total="${h.id}"></div>
        </div>
        <div class="hab__btns" data-btns="${h.id}">${botonesHab(h)}</div>
      </div>
    </article>`;
  }
  grid.innerHTML = CONFIG.habitaciones.map(tarjetaHab).join("");

  function pintarTotalesCards() {
    const n = listaNoches().length;
    const desc = descuentoEstadia(n);
    CONFIG.habitaciones.forEach((h) => {
      let total = precioEstadia(h);
      if (desc) total = total * (1 - desc.porcentaje / 100);
      $(`[data-total="${h.id}"]`).innerHTML = `${n} ${n === 1 ? "noche" : "noches"}<strong>${soles(total)}</strong>${desc ? `<span>con ${desc.porcentaje}% menos</span>` : ""}`;
    });
    $("#hab-resumen").innerHTML = `Precios para <strong>${esc(textoEstadia())}</strong>, con desayuno incluido.`;
  }

  function pintarBotones(id, foco) {
    const h = habPorId(id);
    const cont = $(`[data-btns="${id}"]`);
    cont.innerHTML = botonesHab(h);
    if (foco) requestAnimationFrame(() => (cont.querySelector(`[data-${foco}]`) || cont.querySelector("[data-agregar]") || cont.querySelector("[data-sumar]"))?.focus());
  }

  function cambiarCantidad(id, delta, foco) {
    const h = habPorId(id);
    const n = Math.max(0, Math.min(h.unidades, (estado.reserva.get(id) || 0) + delta));
    if (n) estado.reserva.set(id, n); else estado.reserva.delete(id);
    guardar();
    pintarBotones(id, foco);
    actualizarReserva();
    if (delta > 0) {
      avisar(`${h.corto} agregada a tu reserva`);
      const c = $("#contador");
      c.classList.remove("salta"); void c.offsetWidth; c.classList.add("salta");
    }
  }

  grid.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.detalle) abrirDetalle(b.dataset.detalle);
    else if (b.dataset.agregar) cambiarCantidad(b.dataset.agregar, 1, "sumar");
    else if (b.dataset.sumar) cambiarCantidad(b.dataset.sumar, 1, "sumar");
    else if (b.dataset.restar) cambiarCantidad(b.dataset.restar, -1, "restar");
  });

  /* ---------- Detalle de habitación ---------- */
  const modal = $("#modal-hab");
  function abrirDetalle(id) {
    const h = habPorId(id);
    const noches = listaNoches();
    const amen = h.amenidades.map((k) => CONFIG.amenidades[k]).filter(Boolean);
    const total = precioEstadia(h);
    const desc = descuentoEstadia(noches.length);
    $("#modal-contenido").innerHTML = `
      <div class="modal__galeria">
        ${h.imagenes.map((src, j) => `<img src="${esc(src)}" alt="${esc(h.nombre)} · foto ${j + 1}" class="${j ? "" : "activa"}" data-fallback="${fallbackHab}">`).join("")}
        ${h.imagenes.length > 1 ? `
          <button class="modal__flecha modal__flecha--prev" type="button" data-mover="-1" aria-label="Foto anterior"><i class="ph ph-caret-left" aria-hidden="true"></i></button>
          <button class="modal__flecha modal__flecha--next" type="button" data-mover="1" aria-label="Foto siguiente"><i class="ph ph-caret-right" aria-hidden="true"></i></button>
          <div class="modal__puntos" aria-hidden="true">${h.imagenes.map((_, j) => `<span class="${j ? "" : "activa"}"></span>`).join("")}</div>` : ""}
        <button class="icon-btn modal__cerrar" type="button" data-cerrar aria-label="Cerrar"><i class="ph ph-x" aria-hidden="true"></i></button>
      </div>
      <div class="modal__info">
        <h2 id="modal-titulo">${esc(h.nombre)}</h2>
        <div class="hab__datos">
          <span><i class="ph ph-users" aria-hidden="true"></i>Hasta ${h.capacidad} ${h.capacidad === 1 ? "persona" : "personas"}</span>
          <span><i class="ph ph-bed" aria-hidden="true"></i>${esc(h.camas)}</span>
          <span><i class="ph ph-ruler" aria-hidden="true"></i>${h.m2} m²</span>
        </div>
        <p class="hab__desc">${esc(h.descripcion)}</p>
        <ul class="modal__amen">${amen.map((a) => `<li><i class="ph ${esc(a.icono)}" aria-hidden="true"></i>${esc(a.nombre)}</li>`).join("")}</ul>
        <div class="modal__noches">
          <h3>Precio de cada noche</h3>
          <ul>${noches.map((f) => {
            const t = temporadaDe(f);
            const p = precioNoche(h, f);
            return `<li class="${t || p !== h.precio ? "especial" : ""}"><span>${esc(fmtFecha(f, false))}${t ? ` · ${esc(t.nombre)}` : ""}</span><span>${soles(p)}</span></li>`;
          }).join("")}</ul>
        </div>
        <div class="hab__precio">
          <div><span class="hab__precio-num">${soles(desc ? total * (1 - desc.porcentaje / 100) : total)}</span></div>
          <div class="hab__total">${esc(textoEstadia())}${desc ? `<span>incluye ${desc.porcentaje}% por estadía</span>` : ""}</div>
        </div>
        <button class="btn btn--accion btn--full" type="button" data-reservar="${h.id}"><i class="ph ph-plus" aria-hidden="true"></i> Agregar a mi reserva</button>
      </div>`;
    modal.showModal();
  }
  let fotoActual = 0;
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest("[data-cerrar]")) { modal.close(); return; }
    const mover = e.target.closest("[data-mover]");
    if (mover) {
      const imgs = $$(".modal__galeria img", modal), puntos = $$(".modal__puntos span", modal);
      fotoActual = (fotoActual + Number(mover.dataset.mover) + imgs.length) % imgs.length;
      imgs.forEach((im, j) => im.classList.toggle("activa", j === fotoActual));
      puntos.forEach((p, j) => p.classList.toggle("activa", j === fotoActual));
    }
    const res = e.target.closest("[data-reservar]");
    if (res) {
      modal.close();
      cambiarCantidad(res.dataset.reservar, 1);
    }
  });
  modal.addEventListener("close", () => { fotoActual = 0; });

  /* ---------- Tarifas por estadía ---------- */
  const ejemplo = CONFIG.habitaciones.find((h) => h.etiqueta) || CONFIG.habitaciones[0];
  $("#tarifas-grid").innerHTML = CONFIG.estadias.map((e, i) => {
    const precio = ejemplo.precio * (1 - e.porcentaje / 100);
    return `
    <article class="tarifa ${e.destacado ? "tarifa--destacada" : ""}" data-aos="fade-up" data-aos-delay="${i * 80}">
      ${e.destacado ? `<span class="tarifa__sello">Mayor ahorro</span>` : ""}
      <i class="ph ${esc(e.icono)}" aria-hidden="true"></i>
      <h3>${esc(e.nombre)}</h3>
      <p class="tarifa__desc">${esc(e.texto)}</p>
      <p class="tarifa__pct">${e.porcentaje ? `-${e.porcentaje}%` : "Normal"} <small>${e.porcentaje ? "en tu habitación" : "precio de lista"}</small></p>
      <p class="tarifa__ejemplo">${esc(ejemplo.corto)} a <strong>${soles(precio)}</strong> la noche</p>
    </article>`;
  }).join("");

  /* ---------- Logros con contador ---------- */
  $("#logros").innerHTML = CONFIG.logros.map((l) => `
    <div class="logro"><strong data-contar="${l.valor}" data-dec="${l.decimales || 0}" data-suf="${esc(l.sufijo)}">0${esc(l.sufijo)}</strong><span>${esc(l.texto)}</span></div>`).join("");
  function animarNumero(el) {
    const fin = Number(el.dataset.contar), dec = Number(el.dataset.dec), suf = el.dataset.suf, dur = 1400;
    const final = () => { el.textContent = fin.toFixed(dec) + suf; };
    if (reducido) return final();
    const t0 = performance.now();
    const paso = (t) => {
      const p = Math.min(1, (t - t0) / dur), v = fin * (1 - Math.pow(1 - p, 3));
      el.textContent = v.toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
    setTimeout(final, dur + 100);   // respaldo si la pestaña está oculta
  }
  $$("[data-contar]").forEach((el) => {
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) { animarNumero(el); io.disconnect(); }
    }, { threshold: .6 });
    io.observe(el);
  });

  /* ---------- Galería, opiniones, políticas, preguntas ---------- */
  $("#galeria").innerHTML = CONFIG.instalaciones.map((g, i) => `
    <figure class="galeria__item ${g.grande ? "galeria__item--grande" : ""}" data-aos="zoom-in" data-aos-delay="${i * 60}">
      <img src="${esc(g.imagen)}" alt="${esc(g.nombre)}" loading="lazy" data-fallback="images/habitaciones/instalacion.svg">
      <figcaption><i class="ph ${esc(g.icono)}" aria-hidden="true"></i>${esc(g.nombre)}</figcaption>
    </figure>`).join("");

  $("#testimonios").innerHTML = CONFIG.testimonios.map((t, i) => `
    <figure class="testimonio" data-aos="fade-up" data-aos-delay="${(i % 4) * 70}">
      <span class="estrellas" aria-label="${t.estrellas} de 5 estrellas">${estrellas(t.estrellas)}</span>
      <blockquote>${esc(t.texto)}</blockquote>
      <figcaption><strong>${esc(t.nombre)}</strong>${esc(t.pais)} · vía ${esc(t.fuente)}
        <span class="testimonio__estadia">${esc(t.estadia)}</span></figcaption>
    </figure>`).join("");

  $("#politicas-grid").innerHTML = CONFIG.politicas.map((p) => `
    <article class="politica" data-aos="fade-up">
      <i class="ph ${esc(p.icono)}" aria-hidden="true"></i>
      <div><h3>${esc(p.titulo)}</h3><p>${esc(p.texto)}</p></div>
    </article>`).join("");

  $("#faq").innerHTML = CONFIG.preguntas.map((q) => `
    <details><summary>${esc(q.p)}<i class="ph ph-plus" aria-hidden="true"></i></summary><p>${esc(q.r)}</p></details>`).join("");

  /* ---------- Mapa, redes, SEO ---------- */
  const { lat, lng } = CONFIG.ubicacion;
  $("#mapa").src = `https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
  $("#como-llegar").href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const iconosRedes = { facebook: "ph-facebook-logo", instagram: "ph-instagram-logo", tiktok: "ph-tiktok-logo" };
  $("#redes").innerHTML = Object.entries(CONFIG.redes).filter(([, url]) => url).map(([red, url]) => `
    <a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${red}"><i class="ph ${iconosRedes[red]}" aria-hidden="true"></i></a>`).join("");

  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: CONFIG.nombre,
    telephone: CONFIG.telefono,
    email: CONFIG.email,
    address: { "@type": "PostalAddress", streetAddress: CONFIG.direccion, addressLocality: CONFIG.ciudad, addressRegion: CONFIG.region, addressCountry: "PE" },
    geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng },
    checkinTime: CONFIG.checkin,
    checkoutTime: CONFIG.checkout,
    priceRange: `S/ ${Math.min(...CONFIG.habitaciones.map((h) => h.precio))} – S/ ${Math.max(...CONFIG.habitaciones.map((h) => h.precioFinde || h.precio))}`,
    paymentAccepted: CONFIG.pagos.join(", "),
    amenityFeature: CONFIG.incluido.map((s) => ({ "@type": "LocationFeatureSpecification", name: s.nombre, value: true })),
  });
  document.head.appendChild(ld);

  /* ---------- Panel de reserva ---------- */
  const drawer = $("#drawer");
  const barra = $("#barra-reserva");
  const waFlotante = $("#wa-flotante");

  $("#d-extras").innerHTML = CONFIG.extras.map((ex) => `
    <label class="extra">
      <input type="checkbox" value="${ex.id}" ${estado.extras.has(ex.id) ? "checked" : ""}>
      <i class="ph ${esc(ex.icono)}" aria-hidden="true"></i>
      <span class="extra__txt"><strong>${esc(ex.nombre)}</strong><small>${esc(ex.detalle)}</small></span>
      <span class="extra__precio" data-extra-precio="${ex.id}"></span>
    </label>`).join("");
  $("#d-extras").addEventListener("change", (e) => {
    if (e.target.checked) estado.extras.add(e.target.value); else estado.extras.delete(e.target.value);
    guardar();
    actualizarReserva();
  });

  function actualizarReserva() {
    const c = calcular();

    // contador del header
    const cont = $("#contador");
    cont.hidden = !c.habitaciones;
    cont.textContent = c.habitaciones;

    // lista de habitaciones
    $("#d-items").innerHTML = c.lineas.length ? c.lineas.map(({ hab, n, total }) => `
      <div class="item">
        <img src="${esc(hab.imagenes[0])}" alt="" data-fallback="${fallbackHab}">
        <div><strong>${esc(hab.nombre)}</strong><small>${soles(total)} · ${hab.capacidad} ${hab.capacidad === 1 ? "persona" : "personas"} c/u</small></div>
        <div class="cantidad" role="group" aria-label="Cantidad de ${esc(hab.corto)}">
          <button type="button" data-restar="${hab.id}" aria-label="Quitar una"><i class="ph ${n === 1 ? "ph-trash" : "ph-minus"}" aria-hidden="true"></i></button>
          <span>${n}</span>
          <button type="button" data-sumar="${hab.id}" aria-label="Agregar otra" ${n >= hab.unidades ? "disabled" : ""}><i class="ph ph-plus" aria-hidden="true"></i></button>
        </div>
      </div>`).join("") : `
      <div class="vacio"><i class="ph ph-bed" aria-hidden="true"></i>Aún no eliges habitación.<br><a href="#habitaciones" data-cerrar>Ver habitaciones</a></div>`;

    // aviso de capacidad
    const aviso = $("#d-capacidad");
    if (c.lineas.length && estado.huespedes > c.capacidad) {
      aviso.hidden = false;
      aviso.innerHTML = `<i class="ph ph-warning" aria-hidden="true"></i><span>Elegiste habitaciones para ${c.capacidad} ${c.capacidad === 1 ? "persona" : "personas"} y vienen ${estado.huespedes}. Agrega otra habitación o una cama adicional.</span>`;
    } else aviso.hidden = true;

    // precio de cada extra
    CONFIG.extras.forEach((ex) => {
      const el = $(`[data-extra-precio="${ex.id}"]`);
      const p = precioExtra(ex, c.noches);
      el.classList.toggle("gratis", p === 0);
      el.textContent = p === 0 ? "Gratis" : "+" + solesCorto(p);
    });

    // resumen
    $("#d-noches").textContent = textoEstadia(true) + ` · ${estado.huespedes} ${estado.huespedes === 1 ? "huésped" : "huéspedes"}`;
    $("#d-resumen").innerHTML = c.lineas.length ? `
      <div><span>Habitaciones (${c.noches} ${c.noches === 1 ? "noche" : "noches"})</span><span>${soles(c.subtotal)}</span></div>
      ${c.desc ? `<div class="desc"><span>Tarifa ${esc(c.desc.nombre.toLowerCase())} (-${c.desc.porcentaje}%)</span><span>-${soles(c.descMonto)}</span></div>` : ""}
      ${c.extras.length ? `<div><span>Extras</span><span>${soles(c.extrasTotal)}</span></div>` : ""}
      <div class="adelanto"><span>Adelanto para confirmar (${CONFIG.adelanto}%)</span><span>${soles(c.adelanto)}</span></div>` : "";
    $("#d-total").textContent = soles(c.total);

    // barra inferior
    $("#barra-total").textContent = soles(c.total);
    $("#barra-detalle").textContent = `${c.habitaciones} ${c.habitaciones === 1 ? "habitación" : "habitaciones"} · ${c.noches} ${c.noches === 1 ? "noche" : "noches"}`;
    const hayReserva = c.habitaciones > 0;
    barra.hidden = !hayReserva || drawer.open;
    waFlotante.classList.toggle("oculto", hayReserva);

    // botones de las tarjetas (por si se cambió desde el panel)
    CONFIG.habitaciones.forEach((h) => {
      const cont = $(`[data-btns="${h.id}"]`);
      if (cont && !cont.contains(document.activeElement)) cont.innerHTML = botonesHab(h);
    });
  }

  function actualizarTodo() {
    pintarFechas();
    pintarTotalesCards();
    actualizarReserva();
    $("#buscador-resumen").innerHTML = `<i class="ph ph-moon-stars" aria-hidden="true"></i> <strong>${esc(textoEstadia())}</strong> · desde ${soles(Math.min(...CONFIG.habitaciones.map(precioEstadia)))} en total`;
  }

  const abrirDrawer = () => { drawer.showModal(); barra.hidden = true; };
  $("#abrir-reserva").addEventListener("click", abrirDrawer);
  $("#barra-btn").addEventListener("click", abrirDrawer);
  drawer.addEventListener("close", actualizarReserva);
  drawer.addEventListener("click", (e) => {
    if (e.target === drawer || e.target.closest("[data-cerrar]")) { drawer.close(); return; }
    const b = e.target.closest("button[data-sumar], button[data-restar]");
    if (b) {
      const id = b.dataset.sumar || b.dataset.restar;
      const h = habPorId(id);
      const n = Math.max(0, Math.min(h.unidades, (estado.reserva.get(id) || 0) + (b.dataset.sumar ? 1 : -1)));
      if (n) estado.reserva.set(id, n); else estado.reserva.delete(id);
      guardar();
      actualizarReserva();
    }
  });

  $("#c-factura").addEventListener("change", (e) => { $("#c-ruc-wrap").hidden = !e.target.checked; });

  $("#form-reserva").addEventListener("submit", (e) => {
    e.preventDefault();
    const c = calcular();
    if (!c.lineas.length) { avisar("Elige al menos una habitación", "ph-info"); return; }
    const nombreInput = $("#c-nombre");
    const nombre = nombreInput.value.trim();
    const campo = nombreInput.closest(".campo");
    if (!nombre) {
      campo.classList.add("error");
      nombreInput.focus();
      return;
    }
    campo.classList.remove("error");

    const doc = $("#c-doc").value.trim();
    const hora = $("#c-hora").value;
    const motivo = $("#c-motivo").value;
    const pago = $("#c-pago").value;
    const factura = $("#c-factura").checked;
    const ruc = $("#c-ruc").value.trim();
    const notas = $("#c-notas").value.trim();

    const msg = [
      `Hola ${CONFIG.nombre} 👋, quiero reservar:`,
      "",
      `📅 Llegada: ${fmtFecha(estado.llegada)} (desde ${fmtHora(CONFIG.checkin)})`,
      `📅 Salida: ${fmtFecha(estado.salida)} (hasta ${fmtHora(CONFIG.checkout)})`,
      `🌙 ${c.noches} ${c.noches === 1 ? "noche" : "noches"} · 👥 ${estado.huespedes} ${estado.huespedes === 1 ? "huésped" : "huéspedes"}`,
      "",
      "🛏️ Habitaciones",
      ...c.lineas.map((l) => `• ${l.n} x ${l.hab.nombre} — ${soles(l.total)}`),
      c.desc ? `Tarifa ${c.desc.nombre.toLowerCase()} (-${c.desc.porcentaje}%): -${soles(c.descMonto)}` : null,
      ...(c.extras.length ? ["", "➕ Extras", ...c.extras.map(({ ex, total }) =>
        `• ${ex.nombre}${ex.cobro === "noche" ? ` (${c.noches} ${c.noches === 1 ? "noche" : "noches"})` : ""} — ${total ? soles(total) : `Gratis (${ex.gratisDesdeNoches}+ noches)`}`)] : []),
      "",
      `*Total: ${soles(c.total)}*`,
      `Adelanto para confirmar (${CONFIG.adelanto}%): ${soles(c.adelanto)}`,
      "",
      `👤 Nombre: ${nombre}`,
      doc ? `🪪 DNI/Pasaporte: ${doc}` : null,
      hora ? `🕐 Llego: ${hora}` : null,
      motivo ? `🧳 Motivo: ${motivo}` : null,
      `💳 Pago del adelanto: ${pago}`,
      factura ? `🧾 Factura: ${ruc || "sí (envío RUC por aquí)"}` : null,
      notas ? `📝 Notas: ${notas}` : null,
    ].filter((l) => l !== null).join("\n");

    window.open(waLink(msg), "_blank", "noopener");
  });
  $("#c-nombre").addEventListener("input", (e) => {
    if (e.target.value.trim()) e.target.closest(".campo").classList.remove("error");
  });

  /* ---------- Aviso flotante ---------- */
  const toast = $("#toast");
  let timerToast;
  function avisar(texto, icono = "ph-check-circle") {
    toast.innerHTML = `<i class="ph-fill ${icono}" aria-hidden="true"></i>${esc(texto)}`;
    toast.classList.add("visible");
    clearTimeout(timerToast);
    timerToast = setTimeout(() => toast.classList.remove("visible"), 1800);
  }

  /* ---------- Imágenes con respaldo ---------- */
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (img.tagName === "IMG" && img.dataset.fallback && !img.src.endsWith(img.dataset.fallback)) {
      img.src = img.dataset.fallback;
    }
  }, true);   // captura: el error de <img> no burbujea

  /* ---------- Inicio ---------- */
  actualizarTodo();
  if (window.AOS) {
    AOS.init({ once: true, duration: 700, easing: "ease-out-cubic", offset: 40, disable: reducido });
  }
})();
