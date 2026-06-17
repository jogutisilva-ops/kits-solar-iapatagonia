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
   - Aplica el **Margen de Distribuidor (25%)** directamente sobre los precios unitarios netos y subtotales de los materiales.
   - Oculta por completo el desglose del margen en la interfaz para simplificar la vista al cliente.
   - Calcula el **IVA (19%)** sobre el valor neto con margen ya incorporado.
   - Muestra el **Total Público Final** (Neto con margen + IVA) formateado en pesos chilenos (`es-CL`).

---

## Verificación de Despliegue en Producción

- La actualización del cotizador y la visualización de los kits con margen integrado se ha desplegado con éxito.
- **Validación del despliegue en tiempo real**:
  - URL: `https://kits-solar-iapatagonia.vercel.app`
  - Estado: **200 OK**
  - Contenido verificado: La fila independiente "Margen Distribuidor" fue removida de todas las tarjetas de kits, del modal de desglose y de la cotización personalizada. Ahora se muestra "Neto (c/margen)" e "IVA (19%)".
