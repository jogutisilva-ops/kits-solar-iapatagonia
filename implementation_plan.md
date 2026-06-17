# Plan de Implementación: CRM en Google Sheets y Automatización con Apps Script

Este plan describe la creación de la estructura del CRM en Google Sheets y el código de Google Apps Script para automatizar las tareas de seguimiento, agendar eventos en el calendario, crear carpetas en Google Drive y activar alertas. Todo el sistema estará configurado en **Español (Chile)**.

## Revisión del Usuario Requerida

Por favor, revisa la estructura propuesta y la lógica del script antes de comenzar la implementación.

> [!IMPORTANT]
> La automatización se ejecutará completamente dentro de tu cuenta de Google. Te proporcionaremos un código listo para copiar y pegar, por lo que no es necesario que compartas tus contraseñas ni credenciales de API de Google con la IA.

## Cambios Propuestos

Crearemos dos nuevos archivos dentro de tu espacio de trabajo:
1. **[crm_setup_guide.md](file:///Users/josegutisilva/Documents/Antigravity/Guti%20Brain%20/crm_setup_guide.md)**: Una guía paso a paso que explica cómo dar formato a la hoja de Google Sheets, agregar los encabezados de las columnas, crear validaciones de datos (listas desplegables) y configurar las reglas de formato condicional.
2. **[crm_code.js](file:///Users/josegutisilva/Documents/Antigravity/Guti%20Brain%20/crm_code.js)**: El código completo de Google Apps Script que incluye funciones para:
   - Detectar cambios en la hoja (por ejemplo, cambiar la Etapa a "Visita Técnica Agendada").
   - Crear eventos en Google Calendar para las visitas técnicas.
   - Crear automáticamente una estructura de carpetas en Google Drive para los clientes ganados.
   - Analizar la hoja diariamente para enviar un correo de resumen con las tareas de seguimiento atrasadas.

---

### Detalles de Configuración del CRM (en Español)

#### Estructura de Columnas
Documentaremos el diseño de la hoja en la guía utilizando las siguientes columnas:
* **Col A:** ID de Lead
* **Col B:** Fecha de Ingreso
* **Col C:** Nombre del Cliente
* **Col D:** Teléfono (con fórmula de enlace a WhatsApp)
* **Col E:** Correo Electrónico
* **Col F:** Ciudad / Localidad (clave para calcular logística en el sur)
* **Col G:** Origen del Lead (Lista Desplegable: *Publicidad Facebook, Publicidad Google, Referido, Sitio Web, Orgánico*)
* **Col H:** Tipo de Sistema (Lista Desplegable: *Híbrido, On-Grid*)
* **Col I:** Selección de Kit (Lista Desplegable: *Kit 3kW, Kit 5kW, Kit 8kW, Kit 10kW*)
* **Col J:** Boleta Eléctrica Promedio (CLP)
* **Col K:** Etapa Actual (Lista Desplegable):
  1. `1. Lead Nuevo`
  2. `2. Contactado`
  3. `3. Visita Técnica Agendada`
  4. `4. Propuesta Enviada`
  5. `5. En Negociación`
  6. `6. Cerrado Ganado (Instalando)`
  7. `7. Cerrado Ganado (Conectado)`
  8. `8. Cerrado Perdido`
* **Col L:** Motivo de Pérdida (Lista Desplegable: *Precio, Sin Espacio en Techumbre, Red Inestable, Sin Respuesta, Competencia, Otro*)
* **Col M:** Fecha de Último Contacto
* **Col N:** Siguiente Acción (Lista Desplegable: *Llamar, Enviar Correo, Agendar Visita, Enviar Cotización, Seguimiento de Propuesta*)
* **Col O:** Fecha de Siguiente Acción
* **Col P:** Estado de Alerta (Fórmula: *ATRASADO / HOY / FUTURO / COMPLETADO*)
* **Col Q:** Valor de Cotización (CLP)

#### Fórmulas de Google Sheets en Español (Usando punto y coma `;` como separador de argumentos)
* **Enlace de WhatsApp:** `=HIPERVINCULO("https://wa.me/" & C2; "Conversar por WhatsApp")`
* **Estado de Alerta:** `=SI.CONJUNTO(K2="8. Cerrado Perdido"; "⚪ CERRADO"; K2="7. Cerrado Ganado (Conectado)"; "🟢 EN VIVO"; O2 < HOY(); "🔴 ATRASADO"; O2 = HOY(); "🟡 HOY"; O2 > HOY(); "🔵 FUTURO"; VERDADERO; "⚪ SIN ACCIÓN")`

---

### Funciones de Google Apps Script

El archivo `crm_code.js` contendrá las siguientes automatizaciones principales:
1. **`onEditTrigger(e)`** (Gatillador al editar la hoja):
   - Si la Etapa (Col K) cambia a `3. Visita Técnica Agendada`, lee la fecha/hora de la visita técnica de la fila y crea un evento en tu Google Calendar.
   - Si cambia a `6. Cerrado Ganado (Instalando)`, verifica si existe la carpeta principal `Clientes Solar - IA Patagonia` en Google Drive y crea una subcarpeta con el nombre `[Nombre Cliente] - [ID de Lead]`, la cual contendrá tres subcarpetas internas: `/Documentos`, `/Fotos_Terreno` y `/SEC_Netbilling`.
2. **`enviarCorreosSeguimientoDiario()`** (Ejecución diaria programada):
   - Analiza la hoja una vez al día buscando filas donde el Estado de Alerta sea `🔴 ATRASADO`.
   - Envía un correo electrónico resumen al administrador detallando los leads que requieren contacto urgente.

---

## Plan de Verificación

### Verificación Manual
1. Crear una nueva hoja de Google Sheets.
2. Configurar las columnas y listas desplegables tal como se detalla en la guía.
3. Abrir *Extensiones > Apps Script*, copiar y pegar el código de `crm_code.js` y guardar.
4. Configurar el activador de edición (trigger onEdit) para la función `onEditTrigger`.
5. Cambiar el estado de un lead a `3. Visita Técnica Agendada` y verificar que el evento se cree en Google Calendar.
6. Cambiar el estado a `6. Cerrado Ganado (Instalando)` y verificar la creación de carpetas en Google Drive.
7. Ejecutar manualmente la función de correo diario para comprobar la correcta recepción del resumen.
