const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:5000/api';
const SECRET = 'GESTOR_ARMAS_TOP_SECRET_PRO_2026'; // Actualizado desde .env

const generateToken = (role, id = 'test-user-id', clienteId = null) => {
    return jwt.sign({ id, rol: role, clienteId }, SECRET, { expiresIn: '1h' });
};

const testEndpoints = async () => {
    const roles = {
        SUPER_ADMIN: generateToken('SUPER_ADMIN'),
        GESTION: generateToken('GESTION'),
        CLIENTE: generateToken('CLIENTE', 'client-user', 'some-client-id')
    };

    const tests = [
        { name: 'Users List (Admin Only)', path: '/users', method: 'GET', roles: ['SUPER_ADMIN'], forbidden: ['GESTION', 'CLIENTE'] },
        { name: 'Client List (Admin/Gestion)', path: '/clientes', method: 'GET', roles: ['SUPER_ADMIN', 'GESTION'], forbidden: ['CLIENTE'] },
        { name: 'Tramites List (Multi-Role)', path: '/tramites', method: 'GET', roles: ['SUPER_ADMIN', 'GESTION', 'CLIENTE'], forbidden: [] },
        { name: 'Audit Logs (Admin Only)', path: '/audit', method: 'GET', roles: ['SUPER_ADMIN'], forbidden: ['GESTION', 'CLIENTE'] },
        
        // Ownership Tests
        { 
            name: 'Client Detail (Unauthorized for CLIENTE)', 
            path: '/clientes/cli_temp_0_2026', 
            method: 'GET', 
            roles: ['SUPER_ADMIN', 'GESTION'], 
            forbidden: ['CLIENTE'] // Su token tiene id: 'some-client-id'
        },
        { 
            name: 'Tramite Detail (Unauthorized for CLIENTE)', 
            path: '/tramites/cm9at5pve0039qqdhoc3zu773r', 
            method: 'GET', 
            roles: ['SUPER_ADMIN', 'GESTION'], 
            forbidden: ['CLIENTE'] // Su token tiene id: 'some-client-id'
        }
    ];

    console.log('--- INICIANDO PRUEBAS DE RBAC ---\n');

    for (const t of tests) {
        const urlFull = `${BASE_URL}${t.path}`;
        console.log(`PROBANDO: ${t.name} [${urlFull}]`);
        
        // Probar Roles Permitidos
        for (const role of t.roles) {
            try {
                const res = await fetch(urlFull, {
                    method: t.method,
                    headers: { 'Authorization': `Bearer ${roles[role]}` }
                });
                if (res.ok) {
                    console.log(`✅ [${role}] -> Acceso Concedido (Correcto)`);
                } else {
                    console.log(`❌ [${role}] -> Acceso Denegado (ERROR: Status ${res.status})`);
                }
            } catch (err) {
                console.log(`❌ [${role}] -> Error de Conexión: ${err.message}`);
            }
        }

        // Probar Roles Prohibidos
        for (const role of t.forbidden) {
            try {
                const res = await fetch(urlFull, {
                    method: t.method,
                    headers: { 'Authorization': `Bearer ${roles[role]}` }
                });
                if (res.ok) {
                    console.log(`❌ [${role}] -> Acceso Concedido (VULNERABILIDAD: Status ${res.status})`);
                } else if (res.status === 403) {
                    console.log(`✅ [${role}] -> Acceso Denegado 403 (Correcto)`);
                } else {
                    console.log(`❓ [${role}] -> Error Inesperado: Status ${res.status}`);
                }
            } catch (err) {
                console.log(`❌ [${role}] -> Error de Conexión: ${err.message}`);
            }
        }
        console.log('');
    }
};

testEndpoints().catch(console.error);
