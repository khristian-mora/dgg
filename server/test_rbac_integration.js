const http = require('http');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'GESTOR_ARMAS_TOP_SECRET_PRO_2026';
const BASE_URL = 'http://localhost:5000';

function makeRequest(options, body = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch { resolve({ status: res.statusCode, body: data }); }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function testEndpoint() {
    console.log('\n=== PRUEBAS DE INTEGRACIÓN RBAC ===\n');

    // Generar tokens para diferentes roles
    const tokens = {
        SUPER_ADMIN: jwt.sign({ id: 1, email: 'admin@test.com', rol: 'SUPER_ADMIN' }, JWT_SECRET),
        GESTION: jwt.sign({ id: 2, email: 'gestion@test.com', rol: 'GESTION' }, JWT_SECRET),
        CLIENTE: jwt.sign({ id: 3, email: 'cliente@test.com', rol: 'CLIENTE' }, JWT_SECRET),
    };

    let passed = 0;
    let failed = 0;

    // Test 1: GET /api/users solo para SUPER_ADMIN
    console.log('Test 1: GET /api/users requiere SUPER_ADMIN...');
    try {
        const res = await makeRequest({
            hostname: 'localhost', port: 5000, path: '/api/users', method: 'GET',
            headers: { 'Authorization': `Bearer ${tokens.SUPER_ADMIN}` }
        });
        if (res.status === 200) {
            console.log('✅ PASSED: SUPER_ADMIN puede acceder a /api/users');
            passed++;
        } else {
            console.log(`❌ FAILED: Status ${res.status}`, res.body);
            failed++;
        }
    } catch (err) {
        console.log('❌ FAILED:', err.message);
        failed++;
    }

    // Test 2: GET /api/users con token CLIENTE debe fallar
    console.log('\nTest 2: GET /api/users rechaza CLIENTE...');
    try {
        const res = await makeRequest({
            hostname: 'localhost', port: 5000, path: '/api/users', method: 'GET',
            headers: { 'Authorization': `Bearer ${tokens.CLIENTE}` }
        });
        if (res.status === 403) {
            console.log('✅ PASSED: CLIENTE rechazado con 403');
            passed++;
        } else {
            console.log(`❌ FAILED: Status ${res.status}`, res.body);
            failed++;
        }
    } catch (err) {
        console.log('❌ FAILED:', err.message);
        failed++;
    }

    // Test 3: GET /api/config accesible para SUPER_ADMIN y GESTION
    console.log('\nTest 3: GET /api/config permite GESTION...');
    try {
        const res = await makeRequest({
            hostname: 'localhost', port: 5000, path: '/api/config', method: 'GET',
            headers: { 'Authorization': `Bearer ${tokens.GESTION}` }
        });
        if (res.status === 200) {
            console.log('✅ PASSED: GESTION puede acceder a /api/config');
            passed++;
        } else {
            console.log(`❌ FAILED: Status ${res.status}`, res.body);
            failed++;
        }
    } catch (err) {
        console.log('❌ FAILED:', err.message);
        failed++;
    }

    // Test 4: Sin token debe dar 401
    console.log('\nTest 4: Endpoint sin token devuelve 401...');
    try {
        const res = await makeRequest({
            hostname: 'localhost', port: 5000, path: '/api/users', method: 'GET'
        });
        if (res.status === 401) {
            console.log('✅ PASSED: Sin token da 401');
            passed++;
        } else {
            console.log(`❌ FAILED: Status ${res.status}`, res.body);
            failed++;
        }
    } catch (err) {
        console.log('❌ FAILED:', err.message);
        failed++;
    }

    // Test 5: Token inválido debe dar 401
    console.log('\nTest 5: Token inválido devuelve 401...');
    try {
        const res = await makeRequest({
            hostname: 'localhost', port: 5000, path: '/api/users', method: 'GET',
            headers: { 'Authorization': 'Bearer token_invalido' }
        });
        if (res.status === 401) {
            console.log('✅ PASSED: Token inválido da 401');
            passed++;
        } else {
            console.log(`❌ FAILED: Status ${res.status}`, res.body);
            failed++;
        }
    } catch (err) {
        console.log('❌ FAILED:', err.message);
        failed++;
    }

    // Test 6: Verificar que /api/audit requiere SUPER_ADMIN
    console.log('\nTest 6: GET /api/audit requiere SUPER_ADMIN...');
    try {
        const res = await makeRequest({
            hostname: 'localhost', port: 5000, path: '/api/audit', method: 'GET',
            headers: { 'Authorization': `Bearer ${tokens.GESTION}` }
        });
        if (res.status === 403) {
            console.log('✅ PASSED: GESTION rechazado de /api/audit');
            passed++;
        } else {
            console.log(`❌ FAILED: Status ${res.status}`, res.body);
            failed++;
        }
    } catch (err) {
        console.log('❌ FAILED:', err.message);
        failed++;
    }

    // Test 7: Verificar que /api/tareas requiere SUPER_ADMIN
    console.log('\nTest 7: POST /api/tareas requiere SUPER_ADMIN...');
    try {
        const res = await makeRequest({
            hostname: 'localhost', port: 5000, path: '/api/tareas', method: 'POST',
            headers: { 'Authorization': `Bearer ${tokens.GESTION}`, 'Content-Type': 'application/json' }
        }, { titulo: 'Test', descripcion: 'Test' });
        if (res.status === 403) {
            console.log('✅ PASSED: GESTION rechazado de POST /api/tareas');
            passed++;
        } else {
            console.log(`❌ FAILED: Status ${res.status}`, res.body);
            failed++;
        }
    } catch (err) {
        console.log('❌ FAILED:', err.message);
        failed++;
    }

    // Test 8: Health check público
    console.log('\nTest 8: GET /api/health es público...');
    try {
        const res = await makeRequest({
            hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET'
        });
        if (res.status === 200 && res.body.status === 'ok') {
            console.log('✅ PASSED: Health check público funciona');
            passed++;
        } else {
            console.log(`❌ FAILED: Status ${res.status}`, res.body);
            failed++;
        }
    } catch (err) {
        console.log('❌ FAILED:', err.message);
        failed++;
    }

    console.log('\n=== RESUMEN INTEGRACIÓN ===');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Total: ${passed + failed}`);

    if (failed > 0) {
        process.exit(1);
    } else {
        console.log('\n🎉 Todas las pruebas de integración RBAC pasaron!');
        process.exit(0);
    }
}

testEndpoint();