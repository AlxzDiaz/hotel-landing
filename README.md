# Landing de hotel · plantilla (solo hospedaje)

Página para hoteles y hostales que **solo alojan**: sin tours ni lugares turísticos. Se enfoca en lo que el huésped necesita para decidir dónde dormir: habitaciones, qué incluye la tarifa, precios por noche, descuentos por estadía larga, políticas y una reserva que llega ordenada por WhatsApp.

Usa HTML, CSS y JavaScript, sin build. Solo hay que subir la carpeta.

```
hotel-landing/
├── index.html          estructura + SEO + textos fijos (portada, "El hotel", comparación directo vs apps)
├── css/styles.css      estilos (paleta en :root, arriba del archivo)
├── js/config.js        ← DATOS DEL HOTEL: casi todo se cambia aquí
├── js/main.js          lógica (no hace falta tocarlo)
└── images/
    ├── logo.svg        emblema (luna sobre una cama)
    ├── favicon.svg
    └── habitaciones/   ilustraciones de respaldo (se ven si una foto no carga)
```

## Qué tiene frente al demo del hostal

| Hostal (Casa Lupuna) | Hotel (Hotel Aguaje) |
|---|---|
| Tours a Tambopata, fauna, operador | **Se quitaron.** Solo hospedaje |
| "Cerca de todo" (Plaza, mercado, embarcadero) | **Se quitó.** Solo dirección, mapa y "Cómo llegar" |
| Promo de temporada con cuenta regresiva | **Tarifas por estadía**: por noche, por semana (-10%) y por mes (-25%), que se aplican solas |
| — | **"Todo esto va incluido"**: 10 servicios que ya trae la tarifa (desayuno, agua caliente, limpieza, cochera…) |
| — | **Comparación "Directo vs Apps"** en tabla |
| — | **Convenio para empresas** (tarifa fija y factura mensual) |
| — | **Factura con RUC** en el formulario de reserva |
| — | **Motivo del viaje** y **hora aproximada de llegada** en el formulario |
| Extras: recojo, lavandería | Extras de hotel: **entrada temprana, salida tarde, cama adicional, cochera techada**, recojo y lavandería |

Se mantiene lo que ya funcionaba: buscador de fechas con total de la estadía, tarifa de fin de semana y temporadas, precio de apps tachado, ficha de habitación con galería y precio de cada noche, aviso de capacidad, adelanto, reserva guardada en el navegador y mensaje ordenado por WhatsApp.

**Librerías (por CDN):** [Phosphor Icons](https://phosphoricons.com), [AOS](https://michalsnik.github.io/aos/) y Google Fonts (**DM Serif Display** para títulos y **Manrope** para el texto).

**Paleta "Noche serena":** azul noche `#0E1726`, cobre `#A64B2A` (botones, texto blanco 5.7:1), latón `#D4A85A` (acentos, texto oscuro) y fondos lino `#F6F2EA`. Transmite calma y descanso.

## Personalizar para un cliente

1. **`js/config.js`:**
   - **Datos básicos:** nombre, WhatsApp (`51` + número, sin espacios), dirección, coordenadas, redes y correo.
   - **Reservas:** hora de entrada y salida, % de adelanto, medios de pago, si emite factura y temporadas con recargo.
   - **Tarifas por estadía:** noches mínimas y % de descuento de cada una.
   - **Incluido:** los servicios que trae la tarifa.
   - **Habitaciones:** precios (semana, fin de semana y en apps), capacidad, camas, m², cuántas hay y comodidades.
   - **Extras:** precio y si se cobra una vez o por noche.
   - **Confianza:** calificaciones, logros, reseñas, políticas y preguntas frecuentes.
2. **`index.html`:** cambia el `<title>`, la `meta description`, la `og:image`, la foto de portada y la historia de "El hotel".
3. **Logo:** reemplaza `images/logo.svg` y `favicon.svg`.
4. **Colores:** edita las variables de `:root` en `css/styles.css`.

### Cómo cargar una habitación

```js
{ id: "matrimonial", nombre: "Matrimonial clásica", corto: "Matrimonial",
  precio: 130,          // por noche, domingo a jueves
  precioFinde: 145,     // opcional: noches de viernes y sábado
  precioApps: 155,      // opcional: precio en Booking/Airbnb (se muestra tachado)
  capacidad: 2, camas: "1 cama queen", m2: 20,
  unidades: 10,         // cuántas habitaciones de este tipo tiene el hotel
  etiqueta: "La más pedida", nuevo: true,   // opcionales
  amenidades: ["aire", "bano", "desayuno", "wifi", "tv"],   // claves de CONFIG.amenidades
  descripcion: "…",
  imagenes: ["images/habitaciones/matrimonial-1.webp", "images/habitaciones/matrimonial-2.webp"] },
```

- El `id` no debe tener espacios y no conviene cambiarlo después: con él se guarda la reserva en el navegador.
- Las **comodidades** nuevas se agregan en `CONFIG.amenidades` con su nombre y un ícono de [Phosphor](https://phosphoricons.com).
- Si el hotel no hace descuento por mes, borra esa línea de `estadias`.

### Fotos

- Las fotos de ejemplo son de [Unsplash](https://unsplash.com) (licencia gratuita, uso comercial permitido) y se cargan desde su CDN.
- Con un cliente real, **usa siempre fotos de sus habitaciones**: el huésped compara con lo que encuentra al llegar.
- Formato **4:3 (800 × 600 px)** en **WebP** de menos de 150 KB. Comprímelas en [squoosh.app](https://squoosh.app).
- La segunda foto de cada habitación aparece al pasar el mouse (el baño funciona muy bien).

### Datos que deben ser reales

Las calificaciones, los logros, las reseñas, los precios en apps y la historia del hotel son **de ejemplo**. Con un cliente real usa solo sus datos. Si el precio "en apps" tachado no es el que de verdad aparece en Booking, el huésped lo comprueba en un minuto y deja de confiar.

## Cómo llega la reserva

```
Hola Hotel Aguaje 👋, quiero reservar:

📅 Llegada: sáb, 3 oct 2026 (desde 1 p. m.)
📅 Salida: lun, 12 oct 2026 (hasta 11 a. m.)
🌙 9 noches · 👥 2 huéspedes

🛏️ Habitaciones
• 1 x Matrimonial clásica — S/ 1215.00
Tarifa por semana (-10%): -S/ 121.50

➕ Extras
• Recojo del aeropuerto o terminal — Gratis (4+ noches)
• Cochera techada (9 noches) — S/ 90.00

*Total: S/ 1183.50*
Adelanto para confirmar (50%): S/ 591.75

👤 Nombre: Ana Torres
🪪 DNI/Pasaporte: 45678912
💳 Pago del adelanto: Yape
🧾 Factura: 20123456789 · Constructora Sur SAC
```

La página **no confirma disponibilidad**: envía una solicitud y el hotel responde por WhatsApp.

## Probar en tu computadora

Abre una terminal en la carpeta y ejecuta:

```bash
python -m http.server 8000
```

Luego entra a `http://localhost:8000`.

## Publicar en Netlify (gratis)

1. Entra a [app.netlify.com/drop](https://app.netlify.com/drop) y arrastra la carpeta.
2. En *Site settings → Change site name* ponle un nombre como `hotel-aguaje.netlify.app`.
3. Opcional: conecta un dominio `.pe` o `.com`.

## Checklist antes de entregar

- [ ] Se ve bien en un celular real
- [ ] "Enviar solicitud" abre WhatsApp con el número correcto y el mensaje completo
- [ ] Los precios por noche, de fin de semana, de temporadas y por estadía son los reales
- [ ] El precio "en apps" es el que aparece hoy en Booking/Airbnb (o se quitó)
- [ ] El número de habitaciones de cada tipo es el real
- [ ] Los servicios de "incluido" son los que de verdad ofrece el hotel
- [ ] Las fotos son del hotel
- [ ] Las calificaciones, reseñas y logros son reales
- [ ] La hora de entrada y salida, el adelanto y la política de cancelación son los del cliente
- [ ] Título, descripción, logo y redes sociales son los del cliente
