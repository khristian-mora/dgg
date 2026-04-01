const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getResourceUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    const base = API_URL.replace('/api', '');
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

const fetchWithAuth = async (url, options = {}) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token;

    const isFormData = options.body instanceof FormData;
    
    const headers = {
        ...options.headers,
    };

    if (!isFormData && options.method && ['POST', 'PUT', 'PATCH'].includes(options.method.toUpperCase())) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en la petición');
    }

    return response.json();
};

export const api = {
    auth: {
        login: async (email, password) => {
            const res = await fetch(`${API_URL}/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Credenciales inválidas');
            }
            
            return res.json();
        },
        me: () => fetchWithAuth('/auth/me'),
        changePassword: (data) => fetchWithAuth('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
        forgotPassword: async (email) => {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw { response: { data: { message: errorData.message || 'Error al enviar el correo' } } };
            }
            
            return res.json();
        },
        resetPassword: async (token, newPassword) => {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw { response: { data: { message: errorData.message || 'Error al restablecer la contraseña' } } };
            }
            
            return res.json();
        },
    },
    users: {
        getAll: () => fetchWithAuth('/users'),
        create: (data) => fetchWithAuth('/users', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => fetchWithAuth(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        updatePassword: (data) => fetchWithAuth('/users/me/password', { method: 'PUT', body: JSON.stringify(data) }),
        changePassword: (data) => fetchWithAuth('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
        delete: (id) => fetchWithAuth(`/users/${id}`, { method: 'DELETE' }),
    },
    clientes: {
        getAll: () => fetchWithAuth('/clientes'),
        getById: (id) => fetchWithAuth(`/clientes/${id}`),
        search: async (q) => {
            try {
                const data = await fetchWithAuth(`/search?q=${encodeURIComponent(q)}`);
                const clientes = (data.results || []).filter(r => r.type === 'CLIENTE');
                return clientes.map(c => ({
                    id: c.id,
                    nombres: c.title.split(' ')[0],
                    apellidos: c.title.split(' ').slice(1).join(' '),
                    cedula: c.subtitle.replace('Cédula: ', '')
                }));
            } catch { return []; }
        },
        create: (data) => fetchWithAuth('/clientes', { method: 'POST', body: JSON.stringify(data) }),
        enroll: (data) => fetch(`${API_URL}/clientes/public`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data) 
        }).then(async res => {
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Error en el registro');
            }
            return res.json();
        }),
        update: (id, data) => fetchWithAuth(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        uploadFoto: (id, formData) => {
            const user = JSON.parse(localStorage.getItem('user'));
            return fetch(`${API_URL}/clientes/${id}/foto`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user?.token}` },
                body: formData
            }).then(res => {
                if (!res.ok) return res.json().then(e => { throw e });
                return res.json();
            });
        },
        delete: (id) => fetchWithAuth(`/clientes/${id}`, { method: 'DELETE' }),
        hardDelete: (id) => fetchWithAuth(`/clientes/${id}/permanent`, { method: 'DELETE' }),
    },
    tramites: {
        getAll: (params) => fetchWithAuth(`/tramites?${new URLSearchParams(params)}`),
        getHistory: () => fetchWithAuth('/tramites/history/all'),
        getById: (id) => fetchWithAuth(`/tramites/${id}`),
        create: (data) => fetchWithAuth('/tramites', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => fetchWithAuth(`/tramites/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        addPaso: (id, data) => fetchWithAuth(`/tramites/${id}/pasos`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        avanzarPaso: (id, data) => fetchWithAuth(`/tramites/${id}/avanzar-paso`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        updateEstado: (id, data) => fetchWithAuth(`/tramites/${id}/estado`, {
            method: 'PUT',
            body: JSON.stringify(data)
        })
    },
    pagos: {
        getByTramite: (tramiteId) => fetchWithAuth(`/pagos/tramite/${tramiteId}`),
        create: (data) => fetchWithAuth('/pagos', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        delete: (id) => fetchWithAuth(`/pagos/${id}`, {
            method: 'DELETE'
        })
    },
    documentos: {
        getAll: (params) => {
            const q = params ? `?${new URLSearchParams(params)}` : '';
            return fetchWithAuth(`/documentos${q}`);
        },
        upload: (formData) => {
            const user = JSON.parse(localStorage.getItem('user'));
            return fetch(`${API_URL}/documentos/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user?.token}` },
                body: formData
            }).then(res => {
                if (!res.ok) return res.json().then(e => { throw e });
                return res.json();
            });
        },
        simpleUpload: (formData) => {
            const user = JSON.parse(localStorage.getItem('user'));
            return fetch(`${API_URL}/documentos/simple-upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user?.token}` },
                body: formData
            }).then(res => {
                if (!res.ok) return res.json().then(e => { throw e });
                return res.json();
            });
        },
        getByCliente: (clienteId) => fetchWithAuth(`/documentos/cliente/${clienteId}`),
        getByTramite: (tramiteId) => fetchWithAuth(`/documentos/tramite/${tramiteId}`),

        update: (id, data) => fetchWithAuth(`/documentos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id) => fetchWithAuth(`/documentos/${id}`, { method: 'DELETE' }),
    },
    citas: {
        getAll: (params) => {
            const query = new URLSearchParams(params).toString();
            return fetchWithAuth(`/citas?${query}`);
        },
        getEventosDia: (fecha) => fetchWithAuth(`/citas/agenda-dia?fecha=${fecha || ''}`),
        create: (data) => fetchWithAuth('/citas', { method: 'POST', body: JSON.stringify(data) }),
        updateStatus: (id, estado) => fetchWithAuth(`/citas/${id}/status`, { method: 'PUT', body: JSON.stringify({ estado }) }),
        delete: (id) => fetchWithAuth(`/citas/${id}`, { method: 'DELETE' }),
    },
    tareas: {
        getAll: (params) => {
            const query = new URLSearchParams(params).toString();
            return fetchWithAuth(`/tareas?${query}`);
        },
        create: (data) => fetchWithAuth('/tareas', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => fetchWithAuth(`/tareas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id) => fetchWithAuth(`/tareas/${id}`, { method: 'DELETE' }),
    },
    reportes: {
        getAnnual: () => fetchWithAuth('/reportes/resumen-anual'),
    },
    search: {
        global: (q) => fetchWithAuth(`/search?q=${q}`),
    },
    config: {
        getAll: () => fetchWithAuth('/config'),
        get: (clave) => fetchWithAuth(`/config/${clave}`),
        upsert: (data) => fetchWithAuth('/config/upsert', { method: 'POST', body: JSON.stringify(data) }),
    },
    stats: {
        getDashboard: () => fetchWithAuth('/stats/dashboard'),
    },
    formatos: {
        getAll: () => fetchWithAuth('/formatos'),
        getById: (id) => fetchWithAuth(`/formatos/${id}`),
        create: (data) => fetchWithAuth('/formatos', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => fetchWithAuth(`/formatos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        generar: async (id, clienteId, tramiteId) => {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`${API_URL}/formatos/${id}/generar`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({ clienteId, tramiteId })
            });
            if (!response.ok) {
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al generar el documento');
                } catch (e) {
                    throw new Error('El servidor no pudo generar el documento. Verifica las plantillas.');
                }
            }
            return response.blob();
        }
    },
    soporte: {
        getArmas: () => fetchWithAuth('/soporte/armas'),
        getContactos: () => fetchWithAuth('/soporte/contactos'),
        getDocs: () => fetchWithAuth('/soporte/docs-importantes'),
        createArma: (data) => fetchWithAuth('/soporte/armas', { method: 'POST', body: JSON.stringify(data) }),
        createContacto: (data) => fetchWithAuth('/soporte/contactos', { method: 'POST', body: JSON.stringify(data) }),
    },
    caja: {
        registrar: (data) => fetchWithAuth('/caja/movimiento', { method: 'POST', body: JSON.stringify(data) }),
        getByCliente: (clienteId) => fetchWithAuth(`/caja/cliente/${clienteId}`),
        getArqueoDiario: (fecha) => fetchWithAuth(`/caja/arqueo/diario?fecha=${fecha || ''}`),
        getArqueoMensual: (mes, anio) => fetchWithAuth(`/caja/arqueo/mensual?mes=${mes}&anio=${anio}`),
        getArqueoAnual: (anio) => fetchWithAuth(`/caja/arqueo/anual?anio=${anio}`)
    },
    notificaciones: {
        getAll: (limit) => fetchWithAuth(`/notificaciones?limit=${limit || 10}`),
        markAsEnviado: (id) => fetchWithAuth(`/notificaciones/${id}/enviado`, { method: 'PUT' }),
    },
    whatsapp: {
        getStatus: () => fetchWithAuth('/whatsapp/status'),
    },
    audit: {
        getSystem: () => fetchWithAuth('/audit')
    },
    armas: {
        create: (data) => fetchWithAuth('/armas', { method: 'POST', body: JSON.stringify(data) }),
        getByCliente: (clienteId) => fetchWithAuth(`/armas/cliente/${clienteId}`),
        getById: (id) => fetchWithAuth(`/armas/${id}`),
        update: (id, data) => fetchWithAuth(`/armas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        uploadFotos: (id, formData) => {
            const user = JSON.parse(localStorage.getItem('user'));
            return fetch(`${API_URL}/armas/${id}/fotos`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user?.token}` },
                body: formData
            }).then(res => {
                if (!res.ok) return res.json().then(e => { throw e });
                return res.json();
            });
        }
    },
    backups: {
        download: async () => {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`${API_URL}/backups/download`, {
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Error en el servidor' }));
                throw new Error(error.message || 'Error al descargar el backup');
            }
            return response.blob();
        }
    }
};
