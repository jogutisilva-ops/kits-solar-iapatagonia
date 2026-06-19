// ==========================================
// CONFIGURACIÓN (Valores Personalizados)
// ==========================================
const CONFIG = {
  NOMBRE_HOJA_CRM: "CRM",                          // Nombre de la pestaña del CRM
  EMAIL_NOTIFICACIONES: "jo.gutisilva@gmail.com",    // Correo que recibe el resumen diario de atrasados
  
  // RUTA DE GOOGLE DRIVE: usa el ID de la carpeta para evitar fallos si la renombras.
  ID_CARPETA_RAIZ: "1RXRYTSH-nNZuD2HfUobB26SLveDBIGBt",        // ID de la carpeta raíz en Drive
  CARPETA_RAIZ_DRIVE: "Clientes Solar - IA Patagonia", // Nombre de respaldo si no usas ID
  
  CALENDARIO_VISITAS: "Visitas Técnicas Solar",    // Nombre del Google Calendar para visitas
  ZONA_HORARIA: "America/Santiago",           // Zona horaria de Chile Continental
  CODIGO_PAIS: "56",                          // Código de país para WhatsApp (Chile)
  
  HORA_CORREO_DIARIO: 8,                      // Hora (0-23) del envío del resumen diario (08:00 AM)
  HORA_INICIO_VISITA: 10,                     // Hora de inicio POR DEFECTO de la visita (si no escribes la hora en la celda)
  HORA_FIN_VISITA: 12,                        // Hora de fin POR DEFECTO de la visita (si no escribes la hora en la celda)
  FILAS_CONFIG: 1000                          // Cantidad de filas que el script formateará automáticamente
};

// Mapeo de Columnas (Base 1-indexed, A=1, B=2, etc. - Total 21 columnas)
const COL = {
  ID_LEAD: 1,         // Columna A (Protegida)
  FECHA_INGRESO: 2,   // Columna B
  NOMBRE_CLIENTE: 3,  // Columna C
  TELEFONO: 4,        // Columna D (Auto-whatsapp enlace)
  EMAIL: 5,           // Columna E
  CIUDAD: 6,          // Columna F (Zona geográfica)
  ORIGEN: 7,          // Columna G
  VENDEDOR: 8,        // Columna H (Dropdown: Sergio, Ismael, Marcelo) <-- NUEVO
  SISTEMA: 9,         // Columna I
  KIT: 10,            // Columna J
  BOLETA_PROM: 11,    // Columna K
  ETAPA: 12,          // Columna L
  MOTIVO_PERDIDA: 13, // Columna M
  ULTIMO_CONTACTO: 14,// Columna N (Calendario doble click + Hora)
  SIG_ACCION: 15,     // Columna O
  FECHA_ACCION: 16,   // Columna P (Calendario doble click + Hora para visita)
  CANAL_COMUN: 17,    // Columna Q (Dropdown: correo, teléfono, Whatsapp, Redes Sociales) <-- NUEVO
  ESTADO_ALERTA: 18,  // Columna R (Fórmula autoinyectada)
  COTIZACION: 19,     // Columna S
  OBSERVACION: 20,    // Columna T (Texto manual de notas) <-- NUEVO
  ID_EVENTO: 21       // Columna U (ID de Evento Calendar, oculta) <-- NUEVO
};

// Etiquetas exactas de las etapas
const ETAPAS = {
  LEAD_NUEVO: "1. Lead Nuevo",
  CONTACTADO: "2. Contactado",
  VISITA_AGENDADA: "3. Visita Técnica Agendada",
  PROPUESTA: "4. Propuesta Enviada",
  NEGOCIACION: "5. En Negociación",
  GANADO_INSTALANDO: "6. Cerrado Ganado (Instalando)",
  GANADO_CONECTADO: "7. Cerrado Ganado (Conectado)",
  PERDIDO: "8. Cerrado Perdido"
};

// Listas desplegables
const LISTAS = {
  ORIGEN: ["Publicidad Facebook", "Publicidad Google", "Referido", "Sitio Web", "Orgánico"],
  VENDEDOR: ["Sergio", "Ismael", "Marcelo"],
  SISTEMA: ["Híbrido", "On-Grid"],
  KIT: ["Kit 3kW", "Kit 5kW", "Kit 8kW", "Kit 10kW"],
  ETAPA: [
    ETAPAS.LEAD_NUEVO, ETAPAS.CONTACTADO, ETAPAS.VISITA_AGENDADA, ETAPAS.PROPUESTA,
    ETAPAS.NEGOCIACION, ETAPAS.GANADO_INSTALANDO, ETAPAS.GANADO_CONECTADO, ETAPAS.PERDIDO
  ],
  MOTIVO_PERDIDA: ["Precio", "Sin Espacio en Techumbre", "Red Inestable", "Sin Respuesta", "Competencia", "Otro"],
  SIG_ACCION: ["Llamar", "Enviar Correo", "Agendar Visita", "Enviar Cotización", "Seguimiento de Propuesta", "Visita en Terreno"],
  CANAL_COMUN: ["Correo", "Teléfono", "WhatsApp", "Redes Sociales"]
};

// ==========================================
// MENÚ PERSONALIZADO
// ==========================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("⚡ CRM Solar")
    .addItem("Inicializar / Reconfigurar CRM", "inicializarCRMCompleto")
    .addItem("Importar Leads desde JSON", "mostrarFormularioImportacion")
    .addItem("Enviar resumen de atrasados ahora", "enviarCorreosSeguimientoDiario")
    .addToUi();
}

// ==========================================
// FUNCIÓN PRINCIPAL DE INSTALACIÓN
// ==========================================
function inicializarCRMCompleto() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.NOMBRE_HOJA_CRM);
  if (!sheet) sheet = ss.insertSheet(CONFIG.NOMBRE_HOJA_CRM);
  
  const filas = CONFIG.FILAS_CONFIG;
  
  // 1. Encabezados (21 columnas)
  const encabezados = [
    "ID de Lead", "Fecha de Ingreso", "Nombre del Cliente", "Teléfono", "Correo Electrónico", 
    "Ciudad / Localidad", "Origen del Lead", "Vendedor Asignado", "Tipo de Sistema", "Selección de Kit", 
    "Boleta Eléctrica Promedio", "Etapa Actual", "Motivo de Pérdida", "Fecha de Último Contacto", 
    "Siguiente Acción", "Fecha de Siguiente Acción", "Canal de Comunicación", "Estado de Alerta", 
    "Valor de Cotización", "Observación", "ID de Evento Calendar"
  ];
  sheet.getRange(1, 1, 1, encabezados.length).setValues([encabezados]);
  
  sheet.getRange(1, 1, 1, encabezados.length)
    .setFontWeight("bold")
    .setBackground("#34495e") // Slate oscuro
    .setFontColor("#ffffff")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
                  
  sheet.setRowHeight(1, 35);
  sheet.setFrozenRows(1);
  
  // Anchos de columna
  for (let c = 1; c <= encabezados.length; c++) sheet.setColumnWidth(c, 140);
  sheet.setColumnWidth(COL.NOMBRE_CLIENTE, 180);
  sheet.setColumnWidth(COL.TELEFONO, 180);
  sheet.setColumnWidth(COL.ESTADO_ALERTA, 150);
  sheet.setColumnWidth(COL.OBSERVACION, 250);
  
  // Ocultar columna de ID de Evento de Calendar para evitar alteración visual
  sheet.hideColumns(COL.ID_EVENTO);
  
  // Limpiar validaciones antiguas de toda la hoja para evitar que queden reglas obsoletas
  sheet.getRange(2, 1, filas, encabezados.length).clearDataValidations();
  
  // Limpiar fórmulas residuales en todas las columnas de datos (excepto la 18 que es el Estado de Alerta)
  // Esto previene que fórmulas antiguas del semáforo queden en columnas como Fecha de Siguiente Acción (Columna P)
  for (let c = 1; c <= encabezados.length; c++) {
    if (c === COL.ESTADO_ALERTA) continue;
    const rangoCol = sheet.getRange(2, c, filas, 1);
    const formulas = rangoCol.getFormulas();
    let valores = null;
    let modificado = false;
    for (let i = 0; i < formulas.length; i++) {
      if (formulas[i][0]) { // Si la celda contiene una fórmula (empieza por =)
        if (!valores) valores = rangoCol.getValues();
        valores[i][0] = ""; // Se borra la fórmula
        modificado = true;
      }
    }
    if (modificado) {
      rangoCol.setValues(valores);
    }
  }
  
  // 2. Listas desplegables
  configurarDesplegable(sheet, COL.ORIGEN, LISTAS.ORIGEN, filas);
  configurarDesplegable(sheet, COL.VENDEDOR, LISTAS.VENDEDOR, filas);
  configurarDesplegable(sheet, COL.SISTEMA, LISTAS.SISTEMA, filas);
  configurarDesplegable(sheet, COL.KIT, LISTAS.KIT, filas);
  configurarDesplegable(sheet, COL.ETAPA, LISTAS.ETAPA, filas);
  configurarDesplegable(sheet, COL.MOTIVO_PERDIDA, LISTAS.MOTIVO_PERDIDA, filas);
  configurarDesplegable(sheet, COL.SIG_ACCION, LISTAS.SIG_ACCION, filas);
  configurarDesplegable(sheet, COL.CANAL_COMUN, LISTAS.CANAL_COMUN, filas);
  
  // 3. Configurar validación de fechas (habilita el selector de calendario por doble click)
  configurarValidacionFecha(sheet, COL.FECHA_INGRESO, filas);
  configurarValidacionFecha(sheet, COL.ULTIMO_CONTACTO, filas);
  configurarValidacionFecha(sheet, COL.FECHA_ACCION, filas);
  
  // 4. Formatos de número (fechas y montos)
  const fmtFecha = "dd-mm-yyyy";
  const fmtFechaConHora = "dd-mm-yyyy hh:mm";
  const fmtMoneda = "$#,##0";
  sheet.getRange(2, COL.FECHA_INGRESO, filas, 1).setNumberFormat(fmtFecha);
  sheet.getRange(2, COL.ULTIMO_CONTACTO, filas, 1).setNumberFormat(fmtFechaConHora);
  sheet.getRange(2, COL.FECHA_ACCION, filas, 1).setNumberFormat(fmtFechaConHora);
  sheet.getRange(2, COL.BOLETA_PROM, filas, 1).setNumberFormat(fmtMoneda);
  sheet.getRange(2, COL.COTIZACION, filas, 1).setNumberFormat(fmtMoneda);
  
  // 5. Fórmula de Estado de Alerta (Columna R / 18) - Optimizado con INT() para mitigar las horas
  const formulaAlerta =
    '=IF($L2="","",IFS(' +
    '$L2="' + ETAPAS.PERDIDO + '","⚪ CERRADO",' +
    '$L2="' + ETAPAS.GANADO_CONECTADO + '","🟢 EN VIVO",' +
    '$P2="","⚪ SIN ACCIÓN",' +
    'INT($P2)<TODAY(),"🔴 ATRASADO",' +
    'INT($P2)=TODAY(),"🟡 HOY",' +
    'INT($P2)>TODAY(),"🔵 FUTURO",' +
    'TRUE,"⚪ SIN ACCIÓN"))';
  sheet.getRange(2, COL.ESTADO_ALERTA, filas, 1).setFormula(formulaAlerta);
  
  // 6. Configurar el Formato Condicional (Colores)
  configurarFormatoCondicional(sheet, filas);
  
  // 7. Instalar el gatillador onEdit y temporizado
  instalarTriggersCRM();
  
  SpreadsheetApp.getUi().alert(
    "CRM Inicializado",
    "La hoja '" + CONFIG.NOMBRE_HOJA_CRM + "' quedó configurada con encabezados, listas desplegables (incluyendo Vendedores y Canales de Comunicación), formatos de fecha y hora, y alertas de seguimiento.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// Auxiliar para configurar desplegables
function configurarDesplegable(sheet, columna, opciones, filas, filaInicio = 2) {
  const rango = sheet.getRange(filaInicio, columna, filas, 1);
  const regla = SpreadsheetApp.newDataValidation()
    .requireValueInList(opciones, true)
    .setAllowInvalid(false)
    .build();
  rango.setDataValidation(regla);
}

// Auxiliar para configurar validación de fecha (habilita el selector de calendario)
function configurarValidacionFecha(sheet, columna, filas, filaInicio = 2) {
  const rango = sheet.getRange(filaInicio, columna, filas, 1);
  const regla = SpreadsheetApp.newDataValidation()
    .requireDate()
    .setAllowInvalid(true) // Permite escribir texto para poder ingresar la hora junto a la fecha
    .build();
  rango.setDataValidation(regla);
}

// Auxiliar para configurar formato condicional
function configurarFormatoCondicional(sheet, filas) {
  sheet.clearConditionalFormatRules();
  const rango = sheet.getRange(2, COL.ESTADO_ALERTA, filas, 1);
  const reglas = [];
  
  const configColores = [
    { texto: "🔴 ATRASADO", bg: "#fce8e6", fg: "#c5221f" },
    { texto: "🟡 HOY", bg: "#fef7e0", fg: "#b06000" },
    { texto: "🟢 EN VIVO", bg: "#e6f4ea", fg: "#137333" },
    { texto: "🔵 FUTURO", bg: "#e8f0fe", fg: "#1a73e8" },
    { texto: "⚪ CERRADO", bg: "#f1f3f4", fg: "#5f6368" },
    { texto: "⚪ SIN ACCIÓN", bg: "#f1f3f4", fg: "#5f6368" }
  ];
  
  configColores.forEach(conf => {
    const regla = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(conf.texto)
      .setBackground(conf.bg)
      .setFontColor(conf.fg)
      .setRanges([rango])
      .build();
    reglas.push(regla);
  });
  
  sheet.setConditionalFormatRules(reglas);
}

// ==========================================
// TRIGGER: Al editar la hoja
// ==========================================
function onEditTrigger(e) {
  if (!e || !e.range) return;
  
  const sheet = e.range.getSheet();
  if (sheet.getName() !== CONFIG.NOMBRE_HOJA_CRM) return;
  
  const filaEditada = e.range.getRow();
  const columnaEditada = e.range.getColumn();
  
  if (filaEditada === 1) return;
  
  // Control de edición múltiple: si editan muchas celdas a la vez, procesamos con cuidado
  if (e.range.getNumRows() > 1 || e.range.getNumColumns() > 1) return;

  const valorCelda = e.range.getValue();
  
  // 1. PROTECCIÓN: Impedir que se modifique el ID de Lead manualmente
  if (columnaEditada === COL.ID_LEAD) {
    const valorViejo = e.oldValue;
    if (valorViejo !== undefined && valorViejo !== null && valorViejo !== "") {
      if (valorCelda !== valorViejo) {
        e.range.setValue(valorViejo);
        toast("El ID de Lead se genera automáticamente y no debe modificarse manualmente.", "ID Protegido", 6);
      }
    } else {
      const nombreActual = sheet.getRange(filaEditada, COL.NOMBRE_CLIENTE).getValue();
      if (nombreActual) {
        autocompletarLeadNuevo(sheet, filaEditada);
      }
    }
  }
  
  // 2. Nombre del cliente nuevo -> autogenerar ID y fecha de ingreso
  if (columnaEditada === COL.NOMBRE_CLIENTE) {
    autocompletarLeadNuevo(sheet, filaEditada);
  }
  
  // 3. Detectar cambio en la columna de Teléfono (Columna D / 4)
  if (columnaEditada === COL.TELEFONO) {
    autoFormatearEnlaceWhatsapp(e.range);
  }
  
  // 4. Detectar cambio en la Etapa Actual (Columna L / 12)
  if (columnaEditada === COL.ETAPA) {
    if (valorCelda === undefined || valorCelda === null) return;
    const nuevaEtapa = valorCelda.toString().trim();
    
    // Si la etapa es de cierre (Perdido o Ganado), limpiamos interacciones futuras
    if (nuevaEtapa === ETAPAS.PERDIDO || nuevaEtapa === ETAPAS.GANADO_CONECTADO || nuevaEtapa === ETAPAS.GANADO_INSTALANDO) {
      sheet.getRange(filaEditada, COL.SIG_ACCION).clearContent();
      sheet.getRange(filaEditada, COL.FECHA_ACCION).clearContent();
      sheet.getRange(filaEditada, COL.CANAL_COMUN).clearContent();
      
      // Si la etapa es Perdido, verificar si ya tiene motivo. Si no, alertar.
      if (nuevaEtapa === ETAPAS.PERDIDO) {
        const motivo = sheet.getRange(filaEditada, COL.MOTIVO_PERDIDA).getValue().toString().trim();
        if (!motivo) {
          toast("Por favor, selecciona un Motivo de Pérdida en la columna M.", "Lead Perdido", 6);
        }
      }
    }
    
    // Si se cambia a cualquier etapa que NO sea Perdido, borrar el motivo de pérdida
    if (nuevaEtapa !== ETAPAS.PERDIDO) {
      sheet.getRange(filaEditada, COL.MOTIVO_PERDIDA).clearContent();
    }
    
    // CASO A: Se agenda visita técnica
    if (nuevaEtapa === ETAPAS.VISITA_AGENDADA) {
      agendarVisitaCalendario(sheet, filaEditada);
    }
    
    // CASO B: Se gana el proyecto, crear carpetas en Drive
    if (nuevaEtapa === ETAPAS.GANADO_INSTALANDO) {
      crearCarpetasDriveCliente(sheet, filaEditada);
    }
  }
  
  // 5. Detectar cambio en Motivo de Pérdida (Columna M / 13)
  if (columnaEditada === COL.MOTIVO_PERDIDA) {
    const etapaActual = sheet.getRange(filaEditada, COL.ETAPA).getValue().toString().trim();
    if (etapaActual !== ETAPAS.PERDIDO && valorCelda) {
      e.range.clearContent();
      toast("Solo puedes registrar un Motivo de Pérdida si la etapa actual es '8. Cerrado Perdido'.", "Acción no permitida", 6);
    }
  }
}

// Autocompleta ID de Lead y Fecha de Ingreso al registrar cliente nuevo
function autocompletarLeadNuevo(sheet, fila) {
  const nombre = sheet.getRange(fila, COL.NOMBRE_CLIENTE).getValue().toString().trim();
  if (!nombre) return;
  
  const idCell = sheet.getRange(fila, COL.ID_LEAD);
  if (!idCell.getValue()) {
    idCell.setValue("L-" + Utilities.formatDate(new Date(), CONFIG.ZONA_HORARIA, "yyMMdd-HHmmss"));
  }
  
  const fechaCell = sheet.getRange(fila, COL.FECHA_INGRESO);
  if (!fechaCell.getValue()) {
    fechaCell.setValue(new Date());
  }
}

// ==========================================
// FUNCIÓN: Convertir número en enlace de WhatsApp
// ==========================================
function autoFormatearEnlaceWhatsapp(range) {
  const valorRaw = (range.getValue() || "").toString().trim();
  
  if (!valorRaw || valorRaw.startsWith("=")) return;
  
  const richActual = range.getRichTextValue();
  if (richActual && richActual.getLinkUrl()) return;
  
  const numeroLimpio = valorRaw.replace(/[^0-9]/g, "");
  
  if (numeroLimpio.length >= 8) {
    let numeroFinal = numeroLimpio;
    if (!numeroLimpio.startsWith(CONFIG.CODIGO_PAIS)) {
      numeroFinal = CONFIG.CODIGO_PAIS + numeroLimpio;
    }
    const urlWhatsapp = `https://wa.me/${numeroFinal}`;
    const richText = SpreadsheetApp.newRichTextValue()
      .setText(valorRaw)
      .setLinkUrl(urlWhatsapp)
      .build();
    
    range.setRichTextValue(richText);
  }
}

// ==========================================
// FUNCIÓN: Agendar Visita en Google Calendar
// ==========================================
function agendarVisitaCalendario(sheet, fila) {
  const nombreCliente = sheet.getRange(fila, COL.NOMBRE_CLIENTE).getValue();
  const idLead = sheet.getRange(fila, COL.ID_LEAD).getValue();
  const ciudad = sheet.getRange(fila, COL.CIUDAD).getValue();
  const fechaAccion = sheet.getRange(fila, COL.FECHA_ACCION).getValue();
  const telefonoCell = sheet.getRange(fila, COL.TELEFONO);
  
  const telefono = telefonoCell.getRichTextValue() ? telefonoCell.getRichTextValue().getText() : telefonoCell.getValue();
  const kit = sheet.getRange(fila, COL.KIT).getValue();
  
  // Validar correctamente si es una fecha válida (evita fallo de Date.parse con objetos Date en GAS)
  let parsedDate = fechaAccion;
  if (typeof fechaAccion === 'string') {
    parsedDate = new Date(fechaAccion);
  }
  if (!parsedDate || !(parsedDate instanceof Date) || isNaN(parsedDate.getTime())) {
    toast(
      "Fila " + fila + ": Escribe primero una fecha válida en 'Fecha de Siguiente Acción' (Columna P) antes de marcar la etapa.",
      "No se agendó la visita",
      8
    );
    return;
  }
  
  try {
    let calendar = CalendarApp.getCalendarsByName(CONFIG.CALENDARIO_VISITAS)[0] || CalendarApp.getDefaultCalendar();
    
    const fechaInicio = new Date(fechaAccion);
    const fechaFin = new Date(fechaAccion);
    
    if (fechaInicio.getHours() === 0 && fechaInicio.getMinutes() === 0) {
      fechaInicio.setHours(CONFIG.HORA_INICIO_VISITA, 0, 0, 0);
      fechaFin.setHours(CONFIG.HORA_FIN_VISITA, 0, 0, 0);
    } else {
      fechaFin.setTime(fechaInicio.getTime() + (2 * 60 * 60 * 1000));
    }
    
    const tituloEvento = `🚗 Visita Técnica: ${nombreCliente} (${idLead})`;
    const descripcionEvento = `Detalles de la Visita Técnica:\n` +
                              `- ID Lead: ${idLead}\n` +
                              `- Cliente: ${nombreCliente}\n` +
                              `- Teléfono: ${telefono}\n` +
                              `- Kit Cotizado: ${kit}\n` +
                              `- Ubicación: ${ciudad}\n\n` +
                              `Creado automáticamente desde el CRM.`;
                              
    // Buscar si ya existe un ID de evento guardado en la planilla
    let eventId = sheet.getRange(fila, COL.ID_EVENTO).getValue();
    let event = null;
    if (eventId) {
      try {
        event = calendar.getEventById(eventId);
      } catch (err) {
        console.warn("No se pudo obtener el evento con ID " + eventId + ": " + err.message);
      }
    }
    
    if (event) {
      // Si el evento existe, lo actualizamos (evita duplicados al re-agendar)
      event.setTime(fechaInicio, fechaFin);
      event.setTitle(tituloEvento);
      event.setDescription(descripcionEvento);
      event.setLocation(ciudad);
      
      sheet.getRange(fila, COL.SIG_ACCION).setValue("Visita en Terreno");
      toast("Fila " + fila + ": visita técnica re-agendada/actualizada en el calendario.", "Visita actualizada", 5);
    } else {
      // Si no hay evento previo, verificar si existe uno para el mismo Lead el mismo día (seguridad)
      const yaExiste = calendar.getEventsForDay(fechaInicio)
        .some(ev => idLead && ev.getTitle().indexOf(idLead) !== -1);
        
      if (yaExiste) {
        toast("Fila " + fila + ": ya existe una visita agendada para este lead ese día.", "Visita existente", 5);
        return;
      }
      
      let nuevoEvento = calendar.createEvent(tituloEvento, fechaInicio, fechaFin, {
        description: descripcionEvento,
        location: ciudad
      });
      
      // Guardar el ID del evento en la columna oculta U (21)
      sheet.getRange(fila, COL.ID_EVENTO).setValue(nuevoEvento.getId());
      
      sheet.getRange(fila, COL.SIG_ACCION).setValue("Visita en Terreno");
      toast("Fila " + fila + ": visita técnica agendada en el calendario.", "Visita agendada", 5);
    }
  } catch (error) {
    console.error("Error al agendar o re-agendar visita: " + error.message);
    toast("Fila " + fila + ": no se pudo procesar la visita (" + error.message + ").", "Error de calendario", 8);
  }
}

// ==========================================
// FUNCIÓN: Crear Carpetas de Proyecto en Drive
// ==========================================
function crearCarpetasDriveCliente(sheet, fila) {
  const nombreCliente = sheet.getRange(fila, COL.NOMBRE_CLIENTE).getValue();
  const idLead = sheet.getRange(fila, COL.ID_LEAD).getValue();
  
  if (!nombreCliente || !idLead) return;
  
  try {
    let carpetaRaiz = null;
    
    if (CONFIG.ID_CARPETA_RAIZ && CONFIG.ID_CARPETA_RAIZ !== "TU_ID_DE_CARPETA_AQUI") {
      try {
        carpetaRaiz = DriveApp.getFolderById(CONFIG.ID_CARPETA_RAIZ);
      } catch (err) {
        console.warn("No se pudo acceder a la carpeta por ID. Buscando por nombre...");
      }
    }
    
    if (!carpetaRaiz) {
      const carpetasBusqueda = DriveApp.getFoldersByName(CONFIG.CARPETA_RAIZ_DRIVE);
      while (carpetasBusqueda.hasNext()) {
        const folder = carpetasBusqueda.next();
        if (!folder.isTrashed()) {
          carpetaRaiz = folder;
          break;
        }
      }
      if (!carpetaRaiz) {
        carpetaRaiz = DriveApp.createFolder(CONFIG.CARPETA_RAIZ_DRIVE);
      }
    }
    
    const nombreCarpetaCliente = `${nombreCliente} - ${idLead}`;
    if (carpetaRaiz.getFoldersByName(nombreCarpetaCliente).hasNext()) {
      toast("Fila " + fila + ": la carpeta del cliente ya existía.", "Drive", 5);
      return;
    }
    
    const carpetaCliente = carpetaRaiz.createFolder(nombreCarpetaCliente);
    carpetaCliente.createFolder("1. Documentos y Contratos");
    carpetaCliente.createFolder("2. Fotos de Terreno y Factibilidad");
    carpetaCliente.createFolder("3. Declaracion SEC - TE1 y Netbilling");
    
    toast("Fila " + fila + ": carpetas de proyecto creadas en Drive.", "Drive", 5);
  } catch (error) {
    console.error("Error al crear las carpetas en Drive: " + error.message);
    toast("Fila " + fila + ": no se pudieron crear las carpetas (" + error.message + ").", "Error de Drive", 8);
  }
}

// ==========================================
// CORREO DIARIO: Envío de alertas de seguimiento
// ==========================================
function enviarCorreosSeguimientoDiario() {
  if (!CONFIG.EMAIL_NOTIFICACIONES || CONFIG.EMAIL_NOTIFICACIONES === "tu_correo@dominio.cl") {
    console.warn("EMAIL_NOTIFICACIONES no está configurado. No se envía el resumen.");
    return;
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.NOMBRE_HOJA_CRM);
  if (!sheet) return;
  
  const ultimaFila = sheet.getLastRow();
  if (ultimaFila <= 1) return;
  
  // Leemos todo el rango de datos incluyendo todas las columnas presentes en la hoja
  const ultimaCol = sheet.getLastColumn();
  if (ultimaCol < COL.OBSERVACION) return; // Si la hoja no tiene suficientes columnas, abortar para evitar desajustes
  const datos = sheet.getRange(2, 1, ultimaFila - 1, ultimaCol).getValues();
  let leadsAtrasados = [];
  
  datos.forEach(fila => {
    const nombreCliente = fila[COL.NOMBRE_CLIENTE - 1];
    const estadoAlerta = fila[COL.ESTADO_ALERTA - 1];
    
    // Validar si el lead tiene un cliente real y si su estado es exactamente Atrasado
    if (!nombreCliente || estadoAlerta !== "🔴 ATRASADO") return;
    
    const fechaAccion = fila[COL.FECHA_ACCION - 1];
    leadsAtrasados.push({
      id: fila[COL.ID_LEAD - 1] || "—",
      nombre: nombreCliente,
      ciudad: fila[COL.CIUDAD - 1] || "—",
      vendedor: fila[COL.VENDEDOR - 1] || "No asignado",
      accion: fila[COL.SIG_ACCION - 1] || "No especificada",
      canal: fila[COL.CANAL_COMUN - 1] || "No especificado",
      fecha: (fechaAccion instanceof Date)
        ? Utilities.formatDate(fechaAccion, CONFIG.ZONA_HORARIA, "dd-MM-yyyy HH:mm")
        : "Sin fecha y hora",
      observacion: fila[COL.OBSERVACION - 1] || "Sin observaciones"
    });
  });
  
  if (leadsAtrasados.length === 0) return;
  
  // Generar cuerpo del correo en HTML detallado con la información completa solicitada
  let filasHtml = "";
  leadsAtrasados.forEach(lead => {
    filasHtml += `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 12px; font-size: 13px; color: #333;">
          <strong>${lead.nombre}</strong><br>
          <span style="font-size: 11px; color: #666;">ID: ${lead.id}</span>
        </td>
        <td style="padding: 12px; font-size: 13px; color: #333;">${lead.ciudad}</td>
        <td style="padding: 12px; font-size: 13px; color: #333;"><strong>${lead.vendedor}</strong></td>
        <td style="padding: 12px; font-size: 13px; color: #d9534f; font-weight: bold;">${lead.accion}</td>
        <td style="padding: 12px; font-size: 13px; color: #333;">${lead.canal}</td>
        <td style="padding: 12px; font-size: 13px; color: #333;">${lead.fecha}</td>
        <td style="padding: 12px; font-size: 12px; color: #555; font-style: italic;">${lead.observacion}</td>
      </tr>
    `;
  });
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 900px; margin: auto; border: 1px solid #ccc; border-radius: 8px; padding: 25px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
      <h2 style="color: #d9534f; border-bottom: 2px solid #d9534f; padding-bottom: 12px; margin-top: 0;">⚠️ Alerta de Seguimientos Atrasados - CRM Solar</h2>
      <p style="font-size: 14px; color: #444;">Estimado Administrador,</p>
      <p style="font-size: 14px; color: #444;">Se han detectado los siguientes <strong>${leadsAtrasados.length} leads</strong> con tareas de seguimiento pendientes y vencidas en el sistema:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; text-align: left; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background-color: #34495e; color: #ffffff; border-bottom: 2px solid #ddd;">
            <th style="padding: 12px; font-size: 13px;">ID / Cliente</th>
            <th style="padding: 12px; font-size: 13px;">Zona Geográfica</th>
            <th style="padding: 12px; font-size: 13px;">Vendedor</th>
            <th style="padding: 12px; font-size: 13px;">Acción Pendiente</th>
            <th style="padding: 12px; font-size: 13px;">Canal</th>
            <th style="padding: 12px; font-size: 13px;">Fecha Límite</th>
            <th style="padding: 12px; font-size: 13px; width: 200px;">Observaciones</th>
          </tr>
        </thead>
        <tbody>
          ${filasHtml}
        </tbody>
      </table>
      
      <p style="margin-top: 25px; font-size: 14px; color: #444;">Por favor, ingresa al CRM en Google Sheets y actualiza la información o re-agenda estas tareas.</p>
      <hr style="border: 0; border-top: 1px solid #ddd; margin-top: 30px; margin-bottom: 15px;">
      <p style="font-size: 11px; color: #888; text-align: center; margin: 0;">Este es un correo electrónico generado automáticamente por el CRM Solar IA Patagonia.</p>
    </div>
  `;
    
  MailApp.sendEmail({
    to: CONFIG.EMAIL_NOTIFICACIONES,
    subject: "[CRM Solar IA Patagonia] ⚠️ Resumen de Seguimientos Atrasados (" + leadsAtrasados.length + " leads)",
    htmlBody: htmlBody
  });
}

// ==========================================
// INSTALACIÓN DE GATILLADORES
// ==========================================
function instalarTriggersCRM() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const handlersPropios = ["onEditTrigger", "enviarCorreosSeguimientoDiario"];
  
  ScriptApp.getProjectTriggers().forEach(t => {
    if (handlersPropios.indexOf(t.getHandlerFunction()) !== -1) ScriptApp.deleteTrigger(t);
  });
  
  ScriptApp.newTrigger("onEditTrigger")
    .forSpreadsheet(ss)
    .onEdit()
    .create();
    
  ScriptApp.newTrigger("enviarCorreosSeguimientoDiario")
    .timeBased()
    .everyDays(1)
    .atHour(CONFIG.HORA_CORREO_DIARIO)
    .inTimezone(CONFIG.ZONA_HORARIA)
    .create();
           
  console.log("Gatilladores del CRM Solar instalados correctamente.");
}

// ==========================================
// AUXILIAR: notificación tipo "toast"
// ==========================================
function toast(mensaje, titulo, segundos) {
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast(mensaje, titulo || "CRM Solar", segundos || 5);
  } catch (err) {
    console.log((titulo || "CRM Solar") + ": " + mensaje);
  }
}

// ==========================================
// IMPORTADOR DE LEADS DESDE JSON
// ==========================================

// Muestra el modal con el formulario para pegar el JSON
function mostrarFormularioImportacion() {
  const html = HtmlService.createHtmlOutput(
    `<div style="font-family: Arial, sans-serif; padding: 10px;">
       <h3 style="color: #2c3e50; margin-top: 0;">Importador de Leads desde JSON</h3>
       <p style="font-size: 13px; color: #555;">Pega el contenido completo del archivo <code>leads_extracted.json</code> en el recuadro de abajo:</p>
       <textarea id="jsonInput" placeholder="[ { 'id_lead': '...', ... }, ... ]" style="width: 100%; height: 200px; font-family: monospace; font-size: 11px; border: 1px solid #ccc; border-radius: 4px; padding: 8px; box-sizing: border-box;"></textarea>
       <br><br>
       <div style="text-align: right;">
         <span id="estado" style="margin-right: 15px; font-size: 13px; font-weight: bold; color: #16a085;"></span>
         <button id="btnImportar" onclick="importar()" style="padding: 8px 16px; background-color: #34495e; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: bold;">Procesar e Importar</button>
       </div>
     </div>
     <script>
       function importar() {
         var txt = document.getElementById('jsonInput').value;
         if (!txt.trim()) {
           alert('Por favor, pega el contenido JSON antes de presionar el botón.');
           return;
         }
         document.getElementById('btnImportar').disabled = true;
         document.getElementById('estado').innerText = 'Procesando e Importando...';
         google.script.run
           .withSuccessHandler(function(res) {
             alert(res);
             google.script.host.close();
           })
           .withFailureHandler(function(err) {
             alert('Error al importar: ' + err.message);
             document.getElementById('btnImportar').disabled = false;
             document.getElementById('estado').innerText = '';
           })
           .procesarImportacionJSON(txt);
       }
     </script>`
  )
  .setWidth(600)
  .setHeight(380);
  
  SpreadsheetApp.getUi().showModalDialog(html, "Carga Masiva de Leads");
}

// Procesa el JSON ingresado, valida duplicados y añade registros al final del CRM
function procesarImportacionJSON(jsonString) {
  try {
    const leads = JSON.parse(jsonString);
    if (!Array.isArray(leads)) {
      throw new Error("El contenido no es un arreglo de objetos JSON válido.");
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.NOMBRE_HOJA_CRM);
    if (!sheet) {
      throw new Error("No se encontró la pestaña '" + CONFIG.NOMBRE_HOJA_CRM + "'.");
    }
    
    let ultimaFila = sheet.getLastRow();
    if (ultimaFila < 1) {
      throw new Error("La hoja del CRM debe estar inicializada primero.");
    }
    
    // Encontrar la última fila real con datos del cliente (evita que las filas con solo fórmulas cuenten como ocupadas)
    let ultimaFilaReal = 1;
    const valoresCliente = sheet.getRange(1, COL.NOMBRE_CLIENTE, ultimaFila, 1).getValues();
    for (let i = valoresCliente.length - 1; i >= 0; i--) {
      if (valoresCliente[i][0] && valoresCliente[i][0].toString().trim() !== "") {
        ultimaFilaReal = i + 1;
        break;
      }
    }
    
    // Obtener los IDs de lead existentes para evitar duplicación
    const idsExistentes = new Set();
    if (ultimaFilaReal > 1) {
      const rangoIds = sheet.getRange(2, COL.ID_LEAD, ultimaFilaReal - 1, 1).getValues();
      rangoIds.forEach(fila => {
        const idStr = (fila[0] || "").toString().trim();
        if (idStr) idsExistentes.add(idStr);
      });
    }
    
    let filasNuevas = [];
    let formulasAlerta = [];
    
    leads.forEach((lead) => {
      let idLead = (lead.id_lead || lead.id || "").toString().trim();
      if (!idLead) {
        // Autogenerar ID si no viene en el registro
        idLead = "L-" + Utilities.formatDate(new Date(), CONFIG.ZONA_HORARIA, "yyMMdd-HHmmss") + "-" + Math.floor(Math.random() * 1000);
      }
      
      // Control de duplicados: omitir si ya existe en la hoja
      if (idsExistentes.has(idLead)) {
        return;
      }
      
      const numFila = ultimaFilaReal + filasNuevas.length + 1;
      const fila = [];
      
      // Mapear cada columna con los datos del JSON
      fila.push(idLead); // Col A: ID
      fila.push(lead.fecha_ingreso ? parsearFechaEsp(lead.fecha_ingreso) : new Date()); // Col B: Fecha Ingreso
      fila.push(lead.nombre_cliente || lead.nombre || ""); // Col C: Nombre
      fila.push(lead.telefono || ""); // Col D: Telefono
      fila.push(lead.email || lead.correo || ""); // Col E: Email
      fila.push(lead.ciudad || lead.localidad || ""); // Col F: Ciudad
      fila.push(lead.origen || ""); // Col G: Origen
      fila.push(lead.vendedor || ""); // Col H: Vendedor
      fila.push(lead.sistema || ""); // Col I: Sistema
      fila.push(lead.kit || ""); // Col J: Kit
      
      // Col K: Boleta promedio (limpieza de números)
      let boleta = lead.boleta_promedio || lead.boleta_prom || "";
      if (typeof boleta === "string") {
        boleta = boleta.replace(/[^0-9]/g, "");
      }
      fila.push(boleta ? Number(boleta) : "");
      
      fila.push(lead.etapa || ""); // Col L: Etapa
      fila.push(lead.motivo_perdida || ""); // Col M: Motivo de Perdida
      fila.push(lead.ultimo_contacto ? parsearFechaEsp(lead.ultimo_contacto) : ""); // Col N: Ultimo Contacto
      fila.push(lead.siguiente_accion || ""); // Col O: Siguiente Acción
      fila.push(lead.fecha_siguiente_accion ? parsearFechaEsp(lead.fecha_siguiente_accion) : ""); // Col P: Fecha Accion
      fila.push(lead.canal_comunicacion || lead.canal || ""); // Col Q: Canal Comun
      fila.push(""); // Col R: Estado de Alerta (Reservada para fórmula)
      
      // Col S: Valor de Cotización (limpieza de números)
      let cotiz = lead.cotizacion || lead.valor_cotizacion || "";
      if (typeof cotiz === "string") {
        cotiz = cotiz.replace(/[^0-9]/g, "");
      }
      fila.push(cotiz ? Number(cotiz) : "");
      
      fila.push(lead.observacion || lead.observaciones || ""); // Col T: Observacion
      fila.push(lead.id_evento || lead.id_evento_calendar || ""); // Col U: ID de Evento Calendar
      
      filasNuevas.push(fila);
      
      // Fórmula de alerta dinámica para la fila
      const formula =
        `=IF($L${numFila}="","",IFS(` +
        `$L${numFila}="8. Cerrado Perdido","⚪ CERRADO",` +
        `$L${numFila}="7. Cerrado Ganado (Conectado)","🟢 EN VIVO",` +
        `$P${numFila}="","⚪ SIN ACCIÓN",` +
        `INT($P${numFila})<TODAY(),"🔴 ATRASADO",` +
        `INT($P${numFila})=TODAY(),"🟡 HOY",` +
        `INT($P${numFila})>TODAY(),"🔵 FUTURO",` +
        `TRUE,"⚪ SIN ACCIÓN"))`;
      formulasAlerta.push([formula]);
    });
    
    if (filasNuevas.length === 0) {
      return "No se importaron nuevos registros. Todos los leads del JSON ya existen en el CRM.";
    }
    
    // Escribir datos básicos en bloque al final de la hoja
    const rangeData = sheet.getRange(ultimaFilaReal + 1, 1, filasNuevas.length, COL.ID_EVENTO);
    rangeData.setValues(filasNuevas);
    
    // Escribir fórmulas en bloque
    const rangeFormulas = sheet.getRange(ultimaFilaReal + 1, COL.ESTADO_ALERTA, formulasAlerta.length, 1);
    rangeFormulas.setFormulas(formulasAlerta);
    
    // Configurar listas desplegables (dropdowns) en las filas nuevas
    configurarDesplegable(sheet, COL.ORIGEN, LISTAS.ORIGEN, filasNuevas.length, ultimaFilaReal + 1);
    configurarDesplegable(sheet, COL.VENDEDOR, LISTAS.VENDEDOR, filasNuevas.length, ultimaFilaReal + 1);
    configurarDesplegable(sheet, COL.SISTEMA, LISTAS.SISTEMA, filasNuevas.length, ultimaFilaReal + 1);
    configurarDesplegable(sheet, COL.KIT, LISTAS.KIT, filasNuevas.length, ultimaFilaReal + 1);
    configurarDesplegable(sheet, COL.ETAPA, LISTAS.ETAPA, filasNuevas.length, ultimaFilaReal + 1);
    configurarDesplegable(sheet, COL.MOTIVO_PERDIDA, LISTAS.MOTIVO_PERDIDA, filasNuevas.length, ultimaFilaReal + 1);
    configurarDesplegable(sheet, COL.SIG_ACCION, LISTAS.SIG_ACCION, filasNuevas.length, ultimaFilaReal + 1);
    configurarDesplegable(sheet, COL.CANAL_COMUN, LISTAS.CANAL_COMUN, filasNuevas.length, ultimaFilaReal + 1);
    
    // Configurar selectores de calendario en filas nuevas
    configurarValidacionFecha(sheet, COL.FECHA_INGRESO, filasNuevas.length, ultimaFilaReal + 1);
    configurarValidacionFecha(sheet, COL.ULTIMO_CONTACTO, filasNuevas.length, ultimaFilaReal + 1);
    configurarValidacionFecha(sheet, COL.FECHA_ACCION, filasNuevas.length, ultimaFilaReal + 1);
    
    // Formatear WhatsApp y aplicar formatos de número
    const fmtFecha = "dd-mm-yyyy";
    const fmtFechaConHora = "dd-mm-yyyy hh:mm";
    const fmtMoneda = "$#,##0";
    
    sheet.getRange(ultimaFilaReal + 1, COL.FECHA_INGRESO, filasNuevas.length, 1).setNumberFormat(fmtFecha);
    sheet.getRange(ultimaFilaReal + 1, COL.ULTIMO_CONTACTO, filasNuevas.length, 1).setNumberFormat(fmtFechaConHora);
    sheet.getRange(ultimaFilaReal + 1, COL.FECHA_ACCION, filasNuevas.length, 1).setNumberFormat(fmtFechaConHora);
    sheet.getRange(ultimaFilaReal + 1, COL.BOLETA_PROM, filasNuevas.length, 1).setNumberFormat(fmtMoneda);
    sheet.getRange(ultimaFilaReal + 1, COL.COTIZACION, filasNuevas.length, 1).setNumberFormat(fmtMoneda);
    
    for (let i = 0; i < filasNuevas.length; i++) {
      const filaActual = ultimaFilaReal + i + 1;
      autoFormatearEnlaceWhatsapp(sheet.getRange(filaActual, COL.TELEFONO));
    }
    
    return "¡Importación masiva completada! Se ingresaron " + filasNuevas.length + " nuevos leads de forma exitosa.";
  } catch (err) {
    throw new Error("Error procesando los datos: " + err.message);
  }
}

// Analiza y convierte cadenas de fecha con formato de idioma español dd-mm-yyyy a objeto Date en GAS
function parsearFechaEsp(fechaStr) {
  if (!fechaStr) return "";
  if (fechaStr instanceof Date) return fechaStr;
  
  const limpia = fechaStr.toString().trim();
  if (!limpia) return "";
  
  const partesFechaHora = limpia.split(" ");
  const fechaParte = partesFechaHora[0];
  const horaParte = partesFechaHora[1] || "00:00";
  
  const sep = fechaParte.indexOf("-") !== -1 ? "-" : "/";
  const componentes = fechaParte.split(sep);
  if (componentes.length !== 3) {
    const parsed = Date.parse(limpia);
    return isNaN(parsed) ? "" : new Date(parsed);
  }
  
  const dia = parseInt(componentes[0], 10);
  const mes = parseInt(componentes[1], 10) - 1;
  const anio = parseInt(componentes[2], 10);
  
  const subPartesHora = horaParte.split(":");
  const horas = parseInt(subPartesHora[0] || 0, 10);
  const minutos = parseInt(subPartesHora[1] || 0, 10);
  
  const result = new Date(anio, mes, dia, horas, minutos, 0);
  return isNaN(result.getTime()) ? "" : result;
}

// ==========================================
// WEBHOOK ENDPOINT: Registro de Leads y Envío de Emails desde el Cotizador Web
// ==========================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === "send_quote") {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(CONFIG.NOMBRE_HOJA_CRM);
      if (!sheet) {
        throw new Error("No se encontró la hoja con nombre " + CONFIG.NOMBRE_HOJA_CRM);
      }
      
      const lastRow = sheet.getLastRow();
      // Encontrar la última fila real con datos (por si hay filas con fórmulas)
      let ultimaFilaReal = 1;
      const valoresCliente = sheet.getRange(1, COL.NOMBRE_CLIENTE, lastRow, 1).getValues();
      for (let i = valoresCliente.length - 1; i >= 0; i--) {
        if (valoresCliente[i][0] && valoresCliente[i][0].toString().trim() !== "") {
          ultimaFilaReal = i + 1;
          break;
        }
      }
      
      const targetRow = ultimaFilaReal + 1;
      const idLead = "L-" + Utilities.formatDate(new Date(), CONFIG.ZONA_HORARIA, "yyMMdd-HHmmss");
      
      const email = data.email || "";
      const nombre = data.name || "Cliente Web";
      const telefono = data.phone || "";
      const direccion = data.address || "Web Cotizador";
      const totalQuote = data.grandTotal ? Number(data.grandTotal) : 0;
      
      const row = [];
      row.push(idLead); // Col A: ID de Lead
      row.push(new Date()); // Col B: Fecha de Ingreso
      row.push(nombre); // Col C: Nombre
      row.push(telefono); // Col D: Teléfono
      row.push(email); // Col E: Correo
      row.push(direccion); // Col F: Ciudad/Localidad (Dirección del proyecto)
      row.push("Sitio Web"); // Col G: Origen
      row.push(""); // Col H: Vendedor (Vacio por defecto)
      row.push(data.invType === 'HIBRIDO' ? 'Híbrido' : 'On-Grid'); // Col I: Sistema
      row.push(`Kit ${data.powerKWp ? data.powerKWp.toFixed(2) : ""}kWp`); // Col J: Selección de Kit
      row.push(""); // Col K: Boleta Promedio
      row.push(ETAPAS.LEAD_NUEVO); // Col L: Etapa Actual
      row.push(""); // Col M: Motivo Pérdida
      row.push(new Date()); // Col N: Último Contacto
      row.push("Seguimiento de Propuesta"); // Col O: Siguiente Acción
      row.push(""); // Col P: Fecha Acción
      row.push("Correo"); // Col Q: Canal Común
      row.push(""); // Col R: Estado de Alerta (Fórmula)
      row.push(totalQuote); // Col S: Valor Cotización
      row.push(`Cotización web formalizada. Oferta N° ${data.offerCode || ""}. Dirección: ${direccion}. Distancia flete: ${data.distance || 0} km.`); // Col T: Observaciones
      row.push(""); // Col U: ID Evento Calendar
      
      // Escribir fila en la hoja
      sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
      
      // Aplicar validaciones y formatos en la fila nueva
      configurarDesplegable(sheet, COL.ORIGEN, LISTAS.ORIGEN, 1, targetRow);
      configurarDesplegable(sheet, COL.VENDEDOR, LISTAS.VENDEDOR, 1, targetRow);
      configurarDesplegable(sheet, COL.SISTEMA, LISTAS.SISTEMA, 1, targetRow);
      configurarDesplegable(sheet, COL.KIT, LISTAS.KIT, 1, targetRow);
      configurarDesplegable(sheet, COL.ETAPA, LISTAS.ETAPA, 1, targetRow);
      configurarDesplegable(sheet, COL.MOTIVO_PERDIDA, LISTAS.MOTIVO_PERDIDA, 1, targetRow);
      configurarDesplegable(sheet, COL.SIG_ACCION, LISTAS.SIG_ACCION, 1, targetRow);
      configurarDesplegable(sheet, COL.CANAL_COMUN, LISTAS.CANAL_COMUN, 1, targetRow);
      
      configurarValidacionFecha(sheet, COL.FECHA_INGRESO, 1, targetRow);
      configurarValidacionFecha(sheet, COL.ULTIMO_CONTACTO, 1, targetRow);
      configurarValidacionFecha(sheet, COL.FECHA_ACCION, 1, targetRow);
      
      sheet.getRange(targetRow, COL.FECHA_INGRESO).setNumberFormat("dd-mm-yyyy");
      sheet.getRange(targetRow, COL.ULTIMO_CONTACTO).setNumberFormat("dd-mm-yyyy hh:mm");
      sheet.getRange(targetRow, COL.FECHA_ACCION).setNumberFormat("dd-mm-yyyy hh:mm");
      sheet.getRange(targetRow, COL.BOLETA_PROM).setNumberFormat("$#,##0");
      sheet.getRange(targetRow, COL.COTIZACION).setNumberFormat("$#,##0");
      
      autoFormatearEnlaceWhatsapp(sheet.getRange(targetRow, COL.TELEFONO));
      
      // Semáforo dinámico de Alerta para esta fila
      const formulaAlerta =
        `=IF($L${targetRow}="","",IFS(` +
        `$L${targetRow}="${ETAPAS.PERDIDO}","⚪ CERRADO",` +
        `$L${targetRow}="${ETAPAS.GANADO_CONECTADO}","🟢 EN VIVO",` +
        `$P${targetRow}="","⚪ SIN ACCIÓN",` +
        `INT($P${targetRow})<TODAY(),"🔴 ATRASADO",` +
        `INT($P${targetRow})=TODAY(),"🟡 HOY",` +
        `INT($P${targetRow})>TODAY(),"🔵 FUTURO",` +
        `TRUE,"⚪ SIN ACCIÓN"))`;
      sheet.getRange(targetRow, COL.ESTADO_ALERTA).setFormula(formulaAlerta);
      
      // Enviar correo real
      const subject = `Cotización Formal - Proyecto Solar Fotovoltaico Llave en Mano - Oferta N° ${data.offerCode || ""}`;
      const mailOptions = {
        htmlBody: data.emailHtml,
        name: "IA Patagonia"
      };
      
      if (CONFIG.EMAIL_NOTIFICACIONES) {
        mailOptions.bcc = CONFIG.EMAIL_NOTIFICACIONES; // BCC al admin
      }
      
      MailApp.sendEmail(email, subject, "", mailOptions);
      
      const responseObj = {
        status: "success",
        leadId: idLead,
        message: "Cotización enviada y Lead registrado correctamente."
      };
      
      return ContentService.createTextOutput(JSON.stringify(responseObj))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Acción no reconocida."
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
