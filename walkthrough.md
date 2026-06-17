# Walkthrough: Cotizador Solar Interactivo - IA Patagonia

Hemos transformado la sección estática de **Cotización Personalizada** en un configurador interactivo dinámico de dos columnas, permitiendo a tus clientes y equipo cotizar sistemas fotovoltaicos a medida en tiempo real.

## Características y Lógica del Cotizador

1. **Diseño de Dos Columnas Responsivo**:
   - **Columna Izquierda (Controles)**: Selectores interactivos y controles deslizantes (ranges) de fácil uso táctil y web para definir:
     * Marca del Sistema (Huawei / GoodWe).
     * Tipo de Inversor (Híbrido c/ Respaldo / On-Grid).
     * Modelo de Inversor (filtrado automático según marca y tipo).
     * Cantidad de Inversores (de 1 a 3).
     * Cantidad de Módulos de Batería (de 0 a 6 módulos, con indicador de capacidad en kWh total en tiempo real).
     * Modelo de Panel Solar (Trina Solar / JA Solar de 715Wp).
     * Cantidad de Paneles Solares (de 0 a 40 paneles, con indicador de potencia total en kWp).
   - **Columna Derecha (Desglose de Materiales y Precios)**: Tabla de materiales (BOM) y resúmenes financieros dinámicos.

2. **Cálculo Inteligente de Dependencias**:
   - **Estructura Proporcional**: Calcula de forma automática la cantidad necesaria de Rieles de 5m (1 riel por cada 2 paneles), fijaciones bracket L para madera (~3 por riel), coplas de riel, clamps medios y clamps finales (4 por string).
   - **Cables y Conectores MC4**: Añade 10 metros de cable solar rojo y 10 metros de negro de 6mm por cada panel, y calcula los pares de conectores MC4 correspondientes.
   - **Accesorios Obligatorios de Marca**:
     * Si eliges baterías **Huawei LUNA2000**, añade automáticamente el módulo de potencia `LUNA2000-5KW-C0`, el Smart Power Sensor `DDSU666-H` y el Smart Dongle WLAN/FE.
     * Si eliges inversor **GoodWe**, añade automáticamente el sensor de monitoreo `Smart Meter Monofásico`.

3. **Operaciones Financieras con Margen Integrado**:
   - Ajusta los precios finales de cada kit para que coincidan exactamente con la planilla Excel oficial de precios (donde `Total = Neto * 1.44`).
   - Aplica retrospectivamente un factor multiplicador de $F = 1.44 / 1.19 \approx 1.210084$ sobre los netos base de cada componente y cotización para integrar el margen del 25% y que el IVA sea del 19% sobre el Neto con margen facturado.
   - Oculta por completo el desglose del margen en la interfaz para simplificar la vista al cliente.
   - Muestra el **Total Público Final** exacto de la planilla (ej: **$1.585.069** para el kit GoodWe 3kW On-Grid).

---

## Verificación de Despliegue en Producción

- La actualización de la lógica de precios y el visualizador con el margen integrado se ha desplegado con éxito.
- **Validación del despliegue en tiempo real**:
  - URL: `https://kits-solar-iapatagonia.vercel.app`
  - Estado: **200 OK**
  - Contenido verificado: Los precios mostrados coinciden exactamente con los montos oficiales de la planilla (ej: $1.585.069 para 3kW on grid), la fila independiente "Margen Distribuidor" fue removida y ahora se muestra "Neto (c/margen)" e "IVA (19%)".
