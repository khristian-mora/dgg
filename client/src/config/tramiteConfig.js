// Requisitos oficiales de documentos por tipo de trámite
// Fuente única de verdad — importar desde aquí en Tramites.jsx y TramiteDetalle.jsx

export const REQUISITOS_OFICIALES = {
  'Permiso para Porte': [
    { id: 'cedula', label: 'Cédula original', descripcion: 'Documento de identidad vigente' },
    { id: 'psicofisico', label: 'Certificado Psicomédico ACE', descripcion: 'Emitido por entidad autorizada' },
    { id: 'curso_tiro', label: 'Curso de Tiro', descripcion: 'Certificado de idoneidad y manejo' },
    { id: 'cert_laboral', label: 'Certificado Laboral', descripcion: 'De empresa actual o actividad económica' },
    { id: 'extractos', label: 'Extractos bancarios (3 meses)', descripcion: 'Últimos 3 meses consecutivos' },
  ],
  'Permiso para Tenencia': [
    { id: 'cedula', label: 'Cédula original', descripcion: 'Documento de identidad vigente' },
    { id: 'psicofisico', label: 'Certificado Psicomédico ACE', descripcion: 'Emitido por entidad autorizada' },
    { id: 'curso_tiro', label: 'Curso de Tiro', descripcion: 'Certificado de idoneidad y manejo' },
    { id: 'escritura', label: 'Escritura o Contrato Arriendo', descripcion: 'Del inmueble donde se custodiará el arma' },
  ],
  'Adquisición de Armas': [
    { id: 'cedula', label: 'Cédula original', descripcion: 'Documento de identidad vigente' },
    { id: 'justificacion', label: 'Justificación de compra', descripcion: 'Carta explicando la necesidad del arma' },
    { id: 'idoneidad', label: 'Certificado de idoneidad', descripcion: 'Emitido por la autoridad competente' },
    { id: 'antecedentes', label: 'Antecedentes judiciales', descripcion: 'Certificado vigente' },
  ],
  'Revalidación de Salvoconducto': [
    { id: 'salvoconducto_ant', label: 'Salvoconducto anterior', descripcion: 'Original del permiso a revalidar' },
    { id: 'cedula', label: 'Cédula original', descripcion: 'Documento de identidad vigente' },
    { id: 'psicofisico', label: 'Certificado Psicomédico ACE', descripcion: 'Renovado con fecha vigente' },
    { id: 'fotos', label: 'Fotos 3x4 fondo azul', descripcion: '2 fotografías recientes' },
  ],
  'Cesión de Armas': [
    { id: 'cedulas', label: 'Cédula Cedente y Cesionario', descripcion: 'Ambas partes de la negociación' },
    { id: 'ficha_tecnica', label: 'Ficha técnica del arma', descripcion: 'Especificaciones y número de serie' },
    { id: 'improntas', label: 'Improntas del arma', descripcion: 'Tomadas por autoridad competente' },
    { id: 'paz_salvo', label: 'Paz y Salvo de Indumil', descripcion: 'Emanado de la autoridad militar' },
  ],
  'Compra de Munición': [
    { id: 'permiso_vigente', label: 'Permiso vigente (Porte/Tenencia)', descripcion: 'Salvoconducto activo' },
    { id: 'cedula', label: 'Cédula original', descripcion: 'Documento de identidad vigente' },
    { id: 'cupo_sistema', label: 'Cupo disponible en el sistema', descripcion: 'Verificación en plataforma DCCAE' },
  ],
  'Permiso Nacional': [
    { id: 'justificacion', label: 'Justificación de seguridad nacional', descripcion: 'Carta con motivo detallado' },
    { id: 'recomendacion', label: 'Recomendación de autoridad', descripcion: 'Aval de entidad gubernamental' },
    { id: 'doc_legal', label: 'Documentación legal', descripcion: 'Soporte jurídico del solicitante' },
  ],
  'Permiso Regional': [
    { id: 'justificacion', label: 'Justificación área de influencia', descripcion: 'Acreditación de zona de operación' },
    { id: 'cedula', label: 'Cédula original', descripcion: 'Documento de identidad vigente' },
    { id: 'cert_laboral', label: 'Certificado laboral', descripcion: 'De empresa o entidad en la región' },
  ],
  'Cambio de Correo': [
    { id: 'cedula', label: 'Cédula original', descripcion: 'Documento de identidad vigente' },
    { id: 'correo_nuevo', label: 'Nuevo correo electrónico', descripcion: 'Comprobante de acceso al nuevo correo' },
    { id: 'validacion', label: 'Validación de titular', descripcion: 'Autorización firmada por el usuario' },
  ],
  'Usuarios Bloqueados': [
    { id: 'notificacion', label: 'Copia de la notificación de bloqueo', descripcion: 'Documento oficial del bloqueo' },
    { id: 'antecedentes', label: 'Antecedentes actualizados', descripcion: 'Certificado reciente' },
    { id: 'descargo', label: 'Escrito de descargo', descripcion: 'Carta explicando la situación' },
  ],
  'Otros Trámites': [
    { id: 'identidad', label: 'Documento de identidad', descripcion: 'Cédula o documento válido' },
    { id: 'explicacion', label: 'Explicación del requerimiento', descripcion: 'Carta descriptiva del trámite' },
  ],
};

// Helper: obtener etiquetas planas (para mostrar en la lista de tarjetas en Tramites.jsx)
export const REQUISITOS_LABELS = Object.fromEntries(
  Object.entries(REQUISITOS_OFICIALES).map(([tipo, items]) => [tipo, items.map(i => i.label)])
);
