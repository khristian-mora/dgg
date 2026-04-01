const PROCEDURE_ROADMAPS = {
  'Permiso para Porte': [
    { id: 1, label: 'Inicio', desc: 'Apertura de expediente y revisión inicial' },
    { id: 2, label: 'Documentación', desc: 'Carga de documentos legales en plataforma', action: 'TASK_DOCS' },
    { id: 3, label: 'Psicofísico', desc: 'Programación de examen médico especializado', action: 'APPOINTMENT_MEDICAL' },
    { id: 4, label: 'Curso Manejo', desc: 'Certificación de idoneidad y manejo de armas', action: 'TASK_CERT' },
    { id: 5, label: 'Radicación DCCAE', desc: 'Envío de información a plataforma nacional', action: 'TASK_DCCAE' },
    { id: 6, label: 'Biometría', desc: 'Toma de huellas y fotografía oficial', action: 'APPOINTMENT_BIO' },
    { id: 7, label: 'Comité', desc: 'En espera de aprobación por comité nacional' },
    { id: 8, label: 'Entrega', desc: 'Entrega física del carnet de porte' }
  ],
  'Permiso para Tenencia': [
    { id: 1, label: 'Inicio', desc: 'Apertura de expediente de tenencia' },
    { id: 2, label: 'Inspección', desc: 'Verificación del lugar de almacenamiento', action: 'APPOINTMENT_INSP' },
    { id: 3, label: 'Documentación', desc: 'Carga de documentos de propiedad', action: 'TASK_DOCS' },
    { id: 4, label: 'Plataforma', desc: 'Envío a plataforma centralizada' },
    { id: 5, label: 'Aprobación', desc: 'Emisión del permiso de tenencia' },
    { id: 6, label: 'Entrega', desc: 'Entrega de documentación final' }
  ],
  'Adquisición de Armas': [
    { id: 1, label: 'Solicitud', desc: 'Inicio de trámite de compra ante INDUMIL' },
    { id: 2, label: 'Documentación', desc: 'Recolección de requisitos para la compra', action: 'TASK_DOCS' },
    { id: 3, label: 'Liquidación', desc: 'Pago de valores a favor del estado' },
    { id: 4, label: 'Cita DCCAE', desc: 'Visita a la plataforma nacional', action: 'APPOINTMENT_DCCAE' },
    { id: 5, label: 'Entrega Arma', desc: 'Entrega física del elemento por la autoridad' }
  ],
  'Revalidación de Salvoconducto': [
    { id: 1, label: 'Inicio', desc: 'Solicitud de renovación de permiso' },
    { id: 2, label: 'Requisitos', desc: 'Revisión de vigencia de pólizas y exámenes', action: 'TASK_REQS' },
    { id: 3, label: 'Entrega Fisico', desc: 'Entrega del carnet anterior para anulación' },
    { id: 4, label: 'Procesamiento', desc: 'Actualización en sistema nacional' },
    { id: 5, label: 'Nuevo Carnet', desc: 'Entrega del documento revalidado' }
  ],
  'Cesión de Armas': [
    { id: 1, label: 'Solicitud', desc: 'Inicio de proceso de cesión de arma' },
    { id: 2, label: 'Peritaje', desc: 'Revisión técnica del arma por expertos', action: 'APPOINTMENT_TECH' },
    { id: 3, label: 'Poderes', desc: 'Firma de poderes y contratos legales', action: 'TASK_LEGAL' },
    { id: 4, label: 'Traspaso', desc: 'Cambio de titularidad en el sistema nacional' },
    { id: 5, label: 'Finalizado', desc: 'Cierre de proceso de cesión' }
  ],
  'Compra de Munición': [
    { id: 1, label: 'Solicitud', desc: 'Pedido de cupo para munición' },
    { id: 2, label: 'Verificación', desc: 'Validación de registro ante el estado' },
    { id: 3, label: 'Pago', desc: 'Liquidación de la munición autorizada' },
    { id: 4, label: 'Entrega', desc: 'Retiro de la munición en almacén militar' }
  ],
  'Permiso Nacional': [
    { id: 1, label: 'Solicitud', desc: 'Petición de permiso con cobertura nacional' },
    { id: 2, label: 'Justificación', desc: 'Documentación de motivos de seguridad', action: 'TASK_MEMO' },
    { id: 3, label: 'Comité Central', desc: 'Evaluación por parte del comité central' },
    { id: 4, label: 'Resolución', desc: 'Aceptación o rechazo del permiso nacional' }
  ],
  'Permiso Regional': [
    { id: 1, label: 'Solicitud', desc: 'Petición de permiso con cobertura regional' },
    { id: 2, label: 'Justificación', desc: 'Documentación de zona de influencia', action: 'TASK_MEMO' },
    { id: 3, label: 'Comité Regional', desc: 'Evaluación por el comando regional' },
    { id: 4, label: 'Resolución', desc: 'Emisión de permiso regional' }
  ],
  'Cambio de Correo': [
    { id: 1, label: 'Solicitud', desc: 'Petición de actualización de datos' },
    { id: 2, label: 'Validación', desc: 'Verificación de identidad del titular', action: 'TASK_ID' },
    { id: 3, label: 'Actualización', desc: 'Cambio de correo en plataforma DCCAE' }
  ],
  'Usuarios Bloqueados': [
    { id: 1, label: 'Análisis', desc: 'Investigación del motivo del bloqueo' },
    { id: 2, label: 'Descargo', desc: 'Preparación de documentos probatorios', action: 'TASK_LEGAL' },
    { id: 3, label: 'Radicación', desc: 'Envío de solicitud de desbloqueo' },
    { id: 4, label: 'Respuesta', desc: 'Decisión final sobre el estado del usuario' }
  ],
  'Otros Trámites': [
    { id: 1, label: 'Inicio', desc: 'Trámite no especificado iniciado' },
    { id: 2, label: 'Análisis', desc: 'Determinación de pasos administrativos' },
    { id: 3, label: 'Gestión', desc: 'Ejecución de actividades correspondientes' }
  ],
  'DEFAULT': [
    { id: 1, label: 'Inicio', desc: 'Trámite iniciado' },
    { id: 2, label: 'Proceso', desc: 'En gestión administrativa' },
    { id: 3, label: 'Finalizado', desc: 'Trámite concluido' }
  ]
};

module.exports = { PROCEDURE_ROADMAPS };
