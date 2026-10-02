/* ==========================================================
   CONFIGURACIÓN DEL HOTEL
   Todo lo que cambia de un cliente a otro está en este archivo.
   No hace falta tocar main.js para personalizar la página.
   ========================================================== */

// Fotos de Unsplash (licencia gratuita, uso comercial permitido).
// Para un cliente real: reemplaza por sus fotos, p. ej. "images/habitaciones/matrimonial-1.webp"
// Las habitaciones usan formato horizontal 4:3 (800 × 600 px).
const foto = (id, w = 800, h = 600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? "&h=" + h : ""}&q=70`;

const CONFIG = {
  nombre: "Hotel Aguaje",
  eslogan: "Hotel · Puerto Maldonado",

  // WhatsApp: código de país + número, sin "+", espacios ni guiones
  whatsapp: "51999999999",
  telefono: "+51 999 999 999",
  email: "reservas@hotelaguaje.pe",

  direccion: "Av. León Velarde 845, Puerto Maldonado",
  ciudad: "Puerto Maldonado",
  region: "Madre de Dios",
  // En Google Maps: clic derecho sobre el local → copiar coordenadas
  ubicacion: { lat: -12.5925, lng: -69.1847 },

  // Deja una red en "" para ocultarla
  redes: {
    facebook: "https://www.facebook.com/",
    instagram: "https://www.instagram.com/",
    tiktok: "",
  },

  // Mensajes de la barra superior (rotan cada pocos segundos). [] = se oculta.
  anuncios: [
    "Reserva directo por WhatsApp y paga menos que en las apps",
    "Desayuno buffet incluido en todas las habitaciones",
    "Estadías largas: hasta 25% de descuento por semana o por mes",
  ],

  // Usa las calificaciones REALES del cliente. max: escala de cada página (Google 5, Booking 10).
  ratings: [
    { fuente: "Google", valor: 4.7, total: 386, max: 5, icono: "ph-google-logo" },
    { fuente: "Booking.com", valor: 8.9, total: 241, max: 10, icono: "ph-bed" },
  ],

  // Horas en formato 24 h
  checkin: "13:00",
  checkout: "11:00",
  adelanto: 50,                // % que se paga para confirmar la reserva
  cancelacionHoras: 48,        // cambios y cancelación sin costo hasta X horas antes
  pagos: ["Yape", "Plin", "Transferencia", "Tarjeta", "Efectivo"],
  factura: true,               // emite boleta y factura (se muestra en la página y el formulario)

  // Fechas con tarifa especial (feriados, festividades). El recargo se suma a esas noches.
  temporadas: [
    { nombre: "Fiestas Patrias", desde: "2026-07-24", hasta: "2026-07-31", recargo: 20 },
    { nombre: "Fiestas de fin de año", desde: "2026-12-23", hasta: "2027-01-02", recargo: 25 },
  ],

  // Descuentos por estadía larga. Se aplica solo el mayor que corresponda.
  // Ideales para quien viene por trabajo, obra, capacitación o trámite.
  estadias: [
    { nombre: "Por noche", minNoches: 1, porcentaje: 0, icono: "ph-moon-stars",
      texto: "Tarifa normal. Ideal si estás de paso o vienes por pocos días." },
    { nombre: "Por semana", minNoches: 7, porcentaje: 10, icono: "ph-calendar-blank",
      texto: "Desde 7 noches. Limpieza diaria y cambio de sábanas cada 2 días." },
    { nombre: "Por mes", minNoches: 28, porcentaje: 25, icono: "ph-calendar-check", destacado: true,
      texto: "Desde 28 noches. Lavandería semanal incluida y factura a tu empresa." },
  ],
  convenio: "¿Tu empresa envía personal seguido? Te damos una tarifa fija todo el año, factura mensual y habitaciones aseguradas.",

  // Números que generan confianza (se animan al aparecer)
  logros: [
    { valor: 14, sufijo: "", texto: "años hospedando" },
    { valor: 32, sufijo: "", texto: "habitaciones" },
    { valor: 25, sufijo: "k", texto: "huéspedes atendidos" },
    { valor: 4.7, sufijo: "", texto: "en Google", decimales: 1 },
  ],

  // Frases de la cinta que se desplaza
  cinta: ["Colchones ortopédicos", "Aire acondicionado silencioso", "Agua caliente las 24 h", "Desayuno buffet", "Wi-Fi de fibra", "Cochera vigilada", "Recepción 24 h"],

  // "Todo esto va incluido en tu tarifa"
  incluido: [
    { nombre: "Desayuno buffet", detalle: "De 6:30 a 10 a. m. Pan del día, huevos, frutas, jugo y café.", icono: "ph-coffee" },
    { nombre: "Camas que se sienten", detalle: "Colchones ortopédicos, almohadas de pluma y sábanas de algodón.", icono: "ph-bed" },
    { nombre: "Silencio para dormir", detalle: "Ventanas con doble vidrio y cortinas blackout en todas las habitaciones.", icono: "ph-moon-stars" },
    { nombre: "Agua caliente 24 h", detalle: "Terma propia en cada baño y buena presión a cualquier hora.", icono: "ph-shower" },
    { nombre: "Wi-Fi de fibra", detalle: "100 Mbps en habitaciones y áreas comunes. Para trabajar o ver series.", icono: "ph-wifi-high" },
    { nombre: "Limpieza diaria", detalle: "Habitación ordenada todos los días y toallas limpias cuando las pidas.", icono: "ph-sparkle" },
    { nombre: "Recepción 24 h", detalle: "Llega a la hora que llegues: siempre hay alguien para recibirte.", icono: "ph-bell-simple" },
    { nombre: "Cochera vigilada", detalle: "Para autos y motos, con cámaras y vigilancia toda la noche.", icono: "ph-car" },
    { nombre: "Guardamos tu equipaje", detalle: "Antes de tu entrada o después de tu salida, sin costo.", icono: "ph-suitcase-rolling" },
    { nombre: "Agua filtrada gratis", detalle: "Dispensador en cada piso para rellenar tu botella.", icono: "ph-drop" },
  ],

  // Íconos y nombres de las comodidades (se usan con su clave en cada habitación)
  amenidades: {
    aire: { nombre: "Aire acondicionado", icono: "ph-snowflake" },
    ventilador: { nombre: "Ventilador de techo", icono: "ph-fan" },
    wifi: { nombre: "Wi-Fi de fibra", icono: "ph-wifi-high" },
    bano: { nombre: "Baño privado con agua caliente", icono: "ph-shower" },
    tv: { nombre: "Smart TV 43\" con cable", icono: "ph-television-simple" },
    desayuno: { nombre: "Desayuno buffet incluido", icono: "ph-coffee" },
    blackout: { nombre: "Cortinas blackout", icono: "ph-moon" },
    frigobar: { nombre: "Frigobar", icono: "ph-thermometer-cold" },
    escritorio: { nombre: "Escritorio de trabajo", icono: "ph-desk" },
    cajaFuerte: { nombre: "Caja fuerte", icono: "ph-lock-key" },
    sofa: { nombre: "Sala con sofá", icono: "ph-couch" },
    ducha: { nombre: "Ducha de lluvia", icono: "ph-drop-half" },
    cuna: { nombre: "Cuna a pedido", icono: "ph-baby" },
    hervidor: { nombre: "Hervidor con café e infusiones", icono: "ph-coffee-bean" },
  },

  /* Habitaciones
     - id: único y sin espacios (se usa para guardar la reserva)
     - precio: por noche de domingo a jueves · precioFinde: noches de viernes y sábado (opcional)
     - precioApps: lo que cuesta en Booking/Airbnb (opcional). Se muestra tachado: "reserva directo y ahorra".
     - unidades: cuántas habitaciones de ese tipo tiene el hotel */
  habitaciones: [
    { id: "simple", nombre: "Simple ejecutiva", corto: "Simple",
      precio: 90, precioFinde: 95, precioApps: 105, capacidad: 1, camas: "1 cama de 2 plazas", m2: 16, unidades: 8,
      descripcion: "Pensada para quien viaja por trabajo: cama de 2 plazas, escritorio con buena luz y enchufes al lado de la cama.",
      amenidades: ["aire", "bano", "desayuno", "wifi", "tv", "escritorio", "blackout"],
      imagenes: [foto("1600908389678-64b54d9cf054"), foto("1631049035509-076f10beb2fe")] },

    { id: "matrimonial", nombre: "Matrimonial clásica", corto: "Matrimonial", etiqueta: "La más pedida",
      precio: 130, precioFinde: 145, precioApps: 155, capacidad: 2, camas: "1 cama queen", m2: 20, unidades: 10,
      descripcion: "Cama queen con colchón ortopédico, aire acondicionado silencioso y cortinas blackout. Para dormir de verdad.",
      amenidades: ["aire", "bano", "desayuno", "wifi", "tv", "blackout", "frigobar"],
      imagenes: [foto("1576354302919-96748cb8299e"), foto("1718894070114-6de0e98449a2")] },

    { id: "doble", nombre: "Doble con dos camas", corto: "Doble",
      precio: 140, precioFinde: 155, precioApps: 165, capacidad: 2, camas: "2 camas de 1½ plaza", m2: 22, unidades: 6,
      descripcion: "Dos camas amplias e independientes. Ideal para compañeros de trabajo, amigos o mamá e hijo.",
      amenidades: ["aire", "bano", "desayuno", "wifi", "tv", "blackout", "escritorio"],
      imagenes: [foto("1648383228240-6ed939727ad6"), foto("1619128395560-8a749ac9926d")] },

    { id: "superior", nombre: "Matrimonial superior", corto: "Superior", nuevo: true,
      precio: 175, precioFinde: 195, precioApps: 209, capacidad: 2, camas: "1 cama king", m2: 28, unidades: 4,
      descripcion: "Nuestra habitación más cómoda: cama king, ventanal en el último piso, ducha de lluvia y hervidor con café.",
      amenidades: ["aire", "bano", "ducha", "desayuno", "wifi", "tv", "blackout", "frigobar", "cajaFuerte", "hervidor"],
      imagenes: [foto("1690935986319-c11e6cae84f7"), foto("1649369365908-a0d1225e0b05")] },

    { id: "triple", nombre: "Triple", corto: "Triple",
      precio: 185, precioFinde: 200, precioApps: 215, capacidad: 3, camas: "3 camas de 1½ plaza", m2: 26, unidades: 2,
      descripcion: "Tres camas independientes y espacio para las maletas de todos. Muy pedida por equipos de trabajo.",
      amenidades: ["aire", "bano", "desayuno", "wifi", "tv", "blackout", "frigobar"],
      imagenes: [foto("1741506131058-533fcf894483"), foto("1605346576608-92f1346b67d6")] },

    { id: "familiar", nombre: "Suite familiar", corto: "Familiar",
      precio: 230, precioFinde: 250, precioApps: 269, capacidad: 4, camas: "1 cama queen + 2 camas de 1 plaza", m2: 36, unidades: 2,
      descripcion: "Dormitorio con dos ambientes y una pequeña sala con sofá. Espacio para toda la familia sin separarse. Cuna gratis.",
      amenidades: ["aire", "bano", "desayuno", "wifi", "tv", "sofa", "blackout", "frigobar", "cuna", "cajaFuerte"],
      imagenes: [foto("1771775529138-a7a20ba7e032"), foto("1744000311635-0280df5cc00e")] },
  ],

  /* Extras que el huésped puede sumar a su reserva
     cobro: "unico" (una vez) · "noche" (por noche) · "personaNoche" (por huésped y por noche)
     gratisDesdeNoches: el extra sale gratis si la estadía llega a esas noches (opcional) */
  extras: [
    { id: "temprano", nombre: "Entrada temprana", detalle: "Tu habitación lista desde las 8 a. m.", precio: 40, cobro: "unico", icono: "ph-sun-horizon" },
    { id: "tarde", nombre: "Salida tarde", detalle: "Quédate hasta las 6 p. m.", precio: 40, cobro: "unico", icono: "ph-clock-afternoon" },
    { id: "recojo", nombre: "Recojo del aeropuerto o terminal", detalle: "Te esperamos con tu nombre", precio: 25, cobro: "unico", gratisDesdeNoches: 4, icono: "ph-van" },
    { id: "cama", nombre: "Cama adicional", detalle: "Plegable, con sábanas y almohada", precio: 35, cobro: "noche", icono: "ph-bed" },
    { id: "cochera", nombre: "Cochera techada", detalle: "Espacio reservado para tu auto", precio: 10, cobro: "noche", icono: "ph-garage" },
    { id: "lavanderia", nombre: "Lavandería", detalle: "Hasta 4 kg, lista en el día", precio: 15, cobro: "unico", icono: "ph-washing-machine" },
  ],

  // Galería de áreas del hotel. grande: true ocupa más espacio en la cuadrícula.
  instalaciones: [
    { nombre: "Recepción 24 horas", icono: "ph-bell-simple", grande: true, imagen: foto("1759038086832-795644825e3a", 900, 900) },
    { nombre: "Comedor del desayuno", icono: "ph-coffee", imagen: foto("1578704311587-4fbd590630d5", 600, 600) },
    { nombre: "Pasillos silenciosos", icono: "ph-moon-stars", imagen: foto("1631049780150-c197bf723954", 600, 600) },
    { nombre: "Toallas y amenities", icono: "ph-sparkle", imagen: foto("1787168295699-03aed18d17d4", 600, 600) },
    { nombre: "Desayuno a la habitación", icono: "ph-tray", imagen: foto("1540304453527-62f979142a17", 600, 600) },
  ],

  // Usa reseñas REALES del cliente (copiadas de Google o Booking)
  testimonios: [
    { nombre: "Carlos M.", pais: "Arequipa", fuente: "Google", estrellas: 5, estadia: "Simple ejecutiva · 12 noches · trabajo",
      texto: "Vine por una obra y me quedé casi dos semanas. Wi-Fi rápido, escritorio cómodo y la tarifa semanal me ayudó bastante con los viáticos." },
    { nombre: "Rosa y Daniel", pais: "Lima", fuente: "Booking.com", estrellas: 5, estadia: "Matrimonial superior · 2 noches · en pareja",
      texto: "La cama king es una maravilla y no se escucha nada de la calle. El desayuno, completo y rico. Volveremos." },
    { nombre: "Familia Quispe", pais: "Cusco", fuente: "Google", estrellas: 5, estadia: "Suite familiar · 3 noches · en familia",
      texto: "Entramos los cuatro con espacio de sobra. Nos dieron cuna para el bebé sin pedirla dos veces. Todo muy limpio." },
    { nombre: "Mariela T.", pais: "Juliaca", fuente: "Booking.com", estrellas: 4, estadia: "Doble · 1 noche · de paso",
      texto: "Llegué a las 3 a. m. en bus y me recibieron sin problema. Agua caliente de verdad y aire que no hace ruido." },
  ],

  // Políticas del hotel (se muestran como tarjetas)
  politicas: [
    { icono: "ph-sign-in", titulo: "Entrada", texto: "Desde la 1 p. m. Si llegas antes, guardamos tu equipaje o pide entrada temprana." },
    { icono: "ph-sign-out", titulo: "Salida", texto: "Hasta las 11 a. m. Pide salida tarde si tu viaje es en la noche." },
    { icono: "ph-calendar-x", titulo: "Cambios y cancelación", texto: "Sin costo hasta 48 horas antes. Después se retiene el adelanto." },
    { icono: "ph-identification-card", titulo: "Documentos", texto: "DNI o pasaporte de todos los huéspedes. Los menores van con sus padres." },
    { icono: "ph-baby", titulo: "Niños", texto: "Menores de 5 años no pagan si duermen con sus padres. Cuna gratis." },
    { icono: "ph-cigarette-slash", titulo: "Hotel libre de humo", texto: "No se fuma en habitaciones ni pasillos. No se admiten mascotas." },
  ],

  preguntas: [
    { p: "¿Cómo confirmo mi reserva?",
      r: "Envíanos tu solicitud por WhatsApp desde esta página. Te confirmamos la disponibilidad en minutos y, para asegurarla, pagas el 50% de adelanto por Yape, Plin o transferencia. El resto lo pagas al llegar." },
    { p: "¿Por qué es más barato reservar directo?",
      r: "Porque no pagamos comisión a las apps de reserva. Ese ahorro te lo damos a ti en el precio, con el mismo desayuno y la misma habitación." },
    { p: "¿Emiten boleta y factura?",
      r: "Sí. Indícanos el RUC y la razón social al reservar o al llegar y te entregamos la factura electrónica al salir. Para estadías por mes podemos facturar a tu empresa." },
    { p: "¿Puedo llegar de madrugada?",
      r: "Sí, la recepción atiende las 24 horas. Avísanos tu hora aproximada y te tenemos la habitación lista. Si quieres entrar antes de la 1 p. m. sin esperar, agrega la entrada temprana." },
    { p: "¿Tienen estacionamiento?",
      r: "Sí, cochera vigilada para autos y motos sin costo, según disponibilidad. Si quieres un espacio techado asegurado, agrégalo a tu reserva." },
    { p: "¿Cómo funciona la tarifa por semana o por mes?",
      r: "Se aplica sola cuando eliges 7 noches o más (10% menos) o 28 noches o más (25% menos). Puedes pagar por semana adelantada y tienes limpieza diaria incluida." },
  ],
};
