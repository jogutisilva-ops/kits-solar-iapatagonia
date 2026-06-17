# Guía de Configuración: CRM en Google Sheets (Inicialización Automatizada)

Esta guía detalla cómo estructurar tu Google Sheet de forma **100% automática** utilizando el script provisto en `CRM_Solar_IAPatagonia.gs` (o `crm_code.js`). Todo está optimizado en español chileno.

---

## 🛠️ Paso 1: Instalar el script de automatización

1. Crea una nueva hoja de cálculo en Google Sheets y llámala exactamente **`CRM`** (puedes dejar la hoja vacía, el script configurará todo).
2. En el menú superior, selecciona **Extensiones > Apps Script**.
3. Borra cualquier código existente en el archivo `Código.gs`.
4. Abre el archivo **`CRM_Solar_IAPatagonia.gs`** (o `crm_code.js`), copia todo su contenido y pégalo en el editor de Apps Script.
5. Cambia las variables de configuración en la parte superior del script (líneas 26-43) para definir:
   - Tu correo para recibir el resumen diario de atrasados (`EMAIL_NOTIFICACIONES`).
   - El ID de tu carpeta raíz en Google Drive (`ID_CARPETA_RAIZ`).
   - El nombre de tu Google Calendar (`CALENDARIO_VISITAS`).
6. Haz clic en el icono de **Guardar** (el disquete).
7. Recarga la pestaña de tu Google Sheet en el navegador.

---

## ⚡ Paso 2: Inicializar el CRM desde el Menú Especial

Al recargar la hoja, verás un nuevo menú en la barra superior llamado **`⚡ CRM Solar`**:

1. Haz clic en **⚡ CRM Solar > Inicializar / Reconfigurar CRM**.
2. Google te pedirá autorizar los permisos para que la hoja interactúe con Drive, Calendar y Gmail. Haz clic en **Revisar permisos**, selecciona tu cuenta de Google, ve a "Avanzado" y selecciona **Ir a Proyecto sin título (no seguro)**.
3. El script se ejecutará y configurará automáticamente toda la hoja. Cuando finalice, verás un mensaje de confirmación emergente.

---

## 📋 ¿Qué hace la Inicialización Automática?

Al ejecutar el inicializador, el script realiza las siguientes tareas de forma instantánea:

1. **Creación de Encabezados (Fila 1 - 21 columnas):** Escribe y da formato estético (negrita, fondo pizarra, texto blanco, inmovilización de fila) a las 21 columnas de tu CRM:
   - **Col A:** ID de Lead *(Protegida de modificaciones manuales)*
   - **Col B:** Fecha de Ingreso
   - **Col C:** Nombre del Cliente
   - **Col D:** Teléfono
   - **Col E:** Correo Electrónico
   - **Col F:** Ciudad / Localidad *(Zona Geográfica)*
   - **Col G:** Origen del Lead
   - **Col H:** Vendedor Asignado <-- **NUEVO**
   - **Col I:** Tipo de Sistema
   - **Col J:** Selección de Kit
   - **Col K:** Boleta Eléctrica Promedio
   - **Col L:** Etapa Actual
   - **Col M:** Motivo de Pérdida
   - **Col N:** Fecha de Último Contacto
   - **Col O:** Siguiente Acción
   - **Col P:** Fecha de Siguiente Acción
   - **Col Q:** Canal de Comunicación <-- **NUEVO**
   - **Col R:** Estado de Alerta
   - **Col S:** Valor de Cotización
   - **Col T:** Observación <-- **NUEVO**
   - **Col U:** ID de Evento Calendar *(Oculta automáticamente para guardar identificadores únicos de visitas y prevenir duplicados al reprogramar)* <-- **NUEVO**
2. **Selectores de Calendario (Validación de Fecha):** Inyecta automáticamente reglas de validación de fecha en las columnas **N (Fecha de Último Contacto)** y **P (Fecha de Siguiente Acción)**. Al hacer **doble click** en cualquier celda de estas columnas, se abrirá el selector de calendario interactivo de Google Sheets.
3. **Formatos de Número y Fecha con Hora:** Aplica el formato `dd-mm-yyyy hh:mm` a las columnas de contacto y acción, permitiendo escribir tanto la fecha como la hora en la misma celda (ej: `15-06-2026 15:30`).
4. **Listas Desplegables (Validación de Datos):** Genera e inyecta menús de selección para 1000 filas en las columnas de Origen, Vendedor Asignado, Sistema, Kit, Etapa, Motivo de Pérdida, Siguiente Acción y Canal de Comunicación.
5. **Fórmula de Estado de Alerta (Columna R):** Inserta la fórmula en la columna R para 1000 filas (optimizada con `INT()` para comparar solo fechas ignorando desajustes de horas):
   ```excel
   =IF($L2="","",IFS($L2="8. Cerrado Perdido","⚪ CERRADO",$L2="7. Cerrado Ganado (Conectado)","🟢 EN VIVO",$P2="","⚪ SIN ACCIÓN",INT($P2)<TODAY(),"🔴 ATRASADO",INT($P2)=TODAY(),"🟡 HOY",INT($P2)>TODAY(),"🔵 FUTURO",TRUE,"⚪ SIN ACCIÓN"))
   ```
6. **Formato Condicional (Colores):** Agrega las 6 reglas de color de forma automática a la **Columna R** (Rojo para `🔴 ATRASADO`, Amarillo para `🟡 HOY`, etc.).
7. **Instalación de Triggers (Gatilladores):** Activa los triggers de edición y del temporizador diario de correos a las 8:00 AM.
