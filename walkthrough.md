# Walkthrough: Cotizador Solar Turnkey con Envío de Correo y Ofuscación de Costos

Hemos refactorizado el prototipo local **Proyecto Llave en Mano (Turnkey)** para implementar tus requerimientos comerciales exactos de confidencialidad, simplificación de UI, captura de leads y una nota de prefactibilidad redactada profesionalmente.

El archivo del prototipo local se encuentra en la raíz del espacio de trabajo:
*   [index_turnkey_preview.html](file:///Users/josegutisilva/Documents/Antigravity/Guti Brain /index_turnkey_preview.html)

---

## 1. Características Implementadas

### A. Simplificación de la UI Web (Ocultamiento de Costos Secundarios)
*   La tabla de materiales (BOM) en el cotizador web **solo muestra Panels, Inverters y Baterías** (si la cantidad de baterías es mayor a 0).
*   Se han ocultado todas las líneas técnicas secundarias de la UI (rieles, clamps, brackets, cables, conectores MC4, sensores, protecciones de tableros, puesta a tierra, ingeniería y flete).
*   Para evitar confusiones en el cliente sobre por qué el total neto es mayor que la suma de los equipos principales, añadimos una **nota informativa en la parte inferior de la tabla web** que explica que el total consolidado ya incluye las obras civiles, tableros, protecciones, puesta a tierra, ingeniería, mano de obra e inscripción SEC.

### B. Ofuscación de Márgenes e Internación de Mano de Obra (MDO)
*   **Margen Global**: Se eliminó por completo el slider de margen de la pantalla. El sistema aplica internamente el **25% de margen** por defecto en segundo plano.
*   **Mano de Obra (MDO)**: Se eliminó el campo de costo neto de MDO. Ahora, el sistema calcula de manera interna la Mano de Obra multiplicando la potencia del inversor seleccionado (kW) por la tarifa base de venta de **$241.598 neto** (que incluye el 25% de margen sobre el costo de $193.278).

### C. Selector de Comuna (Flete Logístico)
*   Se reemplazó el control deslizante de kilómetros por un **Selector desplegable (Dropdown) de Comuna/Ciudad**. El sistema mapea automáticamente la comuna con la distancia y calcula el flete con margen de forma interna:
    *   *Puerto Montt / Puerto Varas*: $62.500 neto venta.
    *   *Calbuco / Frutillar / Llanquihue*: $88.761 neto venta.
    *   *Osorno / Ancud*: $160.023 neto venta.
    *   *Castro*: $233.171 neto venta.
    *   *Valdivia*: $294.118 neto venta.
    *   *Temuco*: $452.539 neto venta.

### D. Captura de Lead y Simulación de Envío de Email
*   Agregamos un campo de texto para **Correo Electrónico** y un botón **"Enviar Cotización Detallada"**.
*   Al ingresar un email válido y hacer clic en el botón:
    1.  Se abre un modal premium de confirmación.
    2.  Se simula la bandeja de entrada del cliente, mostrando una **Vista Previa del Correo en Formato HTML** alineada a la identidad de marca de IA Patagonia (colores gris oscuro `#171717`, amarillo `#e6e247` y celeste `#52afe3`).
    3.  El correo electrónico **sí contiene el desglose detallado de las 23 líneas (BOM completa)** organizadas en las 4 secciones oficiales del Excel, permitiendo al cliente revisar cada componente, cables, protecciones y servicios profesionales con sus precios unitarios de venta.

### E. Nota de Prefactibilidad y Visita Técnica (Actualización)
*   Hemos redactado un **descargo de responsabilidad y nota de prefactibilidad profesional** que explica detalladamente por qué los precios pueden variar una vez realizada la inspección física. Esta nota aparece en dos lugares clave:
    1.  **En la UI del Cotizador Web**: Como una tarjeta detallada al final de la tabla en modo Llave en Mano.
    2.  **En el Correo Electrónico Formal (HTML)**: Destacado visualmente con un borde lateral celeste bajo las condiciones comerciales.
*   La nota detalla las variaciones por **Estructura y Techumbre** (cerchas, inclinación, material de techumbre como zinc/teja), **Distancias y Trazado Eléctrico** (recorrido exacto de canalizaciones AC/DC), y **Logística y Accesibilidad** (fletes y manipulación de equipos de alto peso).

---

## 2. Guía de Verificación Paso a Paso

Abre el archivo local `index_turnkey_preview.html` y sigue estos pasos:

1.  En la pestaña **Cotización Personalizada**, activa la modalidad **Proyecto Llave en Mano (Instalado)**.
2.  Ingresa los parámetros de la oferta de Claudio Pavez:
    *   *Marca*: `GoodWe` | *Inversor*: `GW3600-ES-20 (3.6 kW)` | *Cant. Inversores*: `1`
    *   *Baterías*: `0` (el cliente provee sus baterías).
    *   *Paneles*: `8` Trina Solar Vertex N.
    *   *Montaje*: `Sobre Suelo` (Ground Mount).
    *   *Ubicación*: `Valdivia (Región Los Ríos)`.
3.  Verifica la **UI del Cotizador Web**:
    *   La tabla web solo muestra **2 filas**: Inversor GW3600-ES-20 and Panel Solar TSM-NEG21C.20.
    *   Verifica que la tarjeta informativa al final de la tabla detalla explícitamente los motivos técnicos de variación (techumbres, trazados y accesibilidad).
4.  Ingresa un correo (ej. `claudio.pavez@correo.com`) y haz clic en **Enviar Cotización Detallada**:
    *   Se desplegará el modal de confirmación con la simulación del correo.
    *   Verifica que en la sección **Condiciones Comerciales** del correo aparezca destacada la nueva **"Nota de Prefactibilidad y Visita Técnica"** con la redacción técnica mejorada.
