# Plan de Implementación: Cotizador Turnkey con Envío de Correo y Ofuscación de Costos

Este plan describe la refactorización de `index_turnkey_preview.html` para cumplir con las especificaciones comerciales de IA Patagonia:
1.  **UI Simplificada**: Mostrar únicamente Paneles, Inversores y Baterías en la tabla web. Ocultar cables, rieles, tableros, MDO, flete, ingeniería y trámites.
2.  **Ofuscación Total de Márgenes**: Eliminar el slider de margen de la interfaz. El 25% de margen se calculará internamente.
3.  **MDO Automatizado**: Calcular la mano de obra en el motor interno multiplicando la potencia del inversor (kW) por la tarifa base de venta ($241.598 neto).
4.  **Captura de Leads y Simulación de Email**: Añadir un campo de correo electrónico. Al presionar "Enviar Cotización", se abrirá un modal premium que simula el envío y despliega una **Vista Previa del Correo Electrónico formal en formato HTML** con la identidad de marca de IA Patagonia, el cual sí incluye el desglose completo de las 4 secciones (equipos, estructuras, protecciones y servicios).

---

## 1. Diseño de Interfaz de Usuario (UI)

### Controles de Entrada (Columna Izquierda)
*   **Selectores de Equipos**: Marca, Tipo de Inversor, Modelo, Cantidad, Baterías, Cantidad de Baterías, Modelo de Panel, Cantidad de Paneles.
*   **Configuración del Servicio (Simplificado)**:
    *   *Tipo de Montaje*: Selector entre `Sobre Techo` y `Sobre Suelo`.
    *   *Ubicación del Proyecto*: Selector desplegable (Dropdown) con comunas del sur (Puerto Montt, Puerto Varas, Calbuco, Frutillar, Osorno, Ancud, Castro, Valdivia).
*   **Captura de Correo**:
    *   Un input de texto para el email del cliente (`calc-client-email`).
    *   Botón de llamada a la acción: `Enviar Cotización por Email` (`btn-send-quote`).

### Resultados de la Cotización (Columna Derecha)
*   **Tabla del Cotizador**: Solo listará un máximo de 3 filas si corresponden:
    1.  Inversor (Marca, Modelo y Cantidad).
    2.  Panel Solar (Modelo y Cantidad).
    3.  Batería Litio (si se selecciona cantidad > 0).
*   **Bloque Financiero**:
    *   **Neto**: La suma de *todos* los costos del proyecto con margen (incluyendo flete, MDO, tableros, cables, SEC y apoyos de hormigón).
    *   **IVA (19%)**: Calculado sobre el neto total consolidado.
    *   **Total con IVA**: Valor final de venta al público.

---

## 2. Motor de Cálculo Interno (Javascript)

*   **MDO**: Calculado dinámicamente como:
    \[
    \text{MDO Venta} = \text{Potencia Inversor (kW)} \times \text{Cantidad de Inversores} \times \$241.598
    \]
*   **Flete**: Se calcula automáticamente según la comuna seleccionada:
    *   *Puerto Montt / Puerto Varas*: $50.000 costo ($62.500 venta).
    *   *Calbuco / Frutillar / Llanquihue*: 50 km ($88.761 venta).
    *   *Osorno / Ancud*: 110 km ($160.023 venta).
    *   *Castro*: 170 km ($233.171 venta).
    *   *Valdivia*: 220 km ($294.118 venta).
*   **Apoyos de Hormigón**: 2 unidades por panel (solo si el tipo de montaje es "Sobre Suelo") a `$17.188` venta c/u.
*   **Cables y Protecciones**: Se calculan en segundo plano al precio de venta neto correspondiente (costo × 1.25).

---

## 3. Simulador de Envío y Vista Previa del Email (Modal HTML)

Al hacer clic en "Enviar Cotización por Email":
1.  Se validará que el correo ingresado sea válido.
2.  Se mostrará un modal de éxito estilizado ("¡Cotización Enviada!").
3.  El modal contendrá una pestaña interactiva para **"Ver Vista Previa del Correo Recibido"**.
4.  Esta vista previa renderizará un correo electrónico con:
    *   **Logotipo e Identidad Visual de IA Patagonia** (colores gris oscuro, amarillo y celeste).
    *   **Datos del Cliente y N° de Cotización** auto-generados.
    *   **La Tabla de Desglose Completa de Materiales y Servicios (23 filas del Excel)** organizada por secciones, mostrando las cantidades y precios unitarios.
    *   **Resumen de Totales y Condiciones Comerciales** (forma de pago, plazos).

---

## 4. Plan de Verificación

*   **Validación de Ocultamiento**: Inspeccionar la tabla de la página y confirmar que no aparecen cables, protecciones, mano de obra ni flete en la tabla web del cotizador.
*   **Validación del Envío**: Ingresar un correo y presionar el botón de envío. Verificar que se despliega el modal de confirmación y que el diseño del correo de vista previa coincide con el formato oficial de cotización del cliente en Valdivia.
*   **Verificación del Cálculo MDO**: Cambiar el inversor (ej. de 3kW a 6kW) y verificar que en el desglose del correo la Mano de Obra se reajuste proporcionalmente.
