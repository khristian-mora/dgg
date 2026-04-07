require('dotenv').config();
const jwt = require('jsonwebtoken');
const { checkRole, isAdmin } = require('./src/middlewares/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'GESTOR_ARMAS_TOP_SECRET_PRO_2026';

function createMockReq(user) {
    return { user };
}

function createMockRes() {
    const res = {
        statusCode: 200,
        status: function(code) { this.statusCode = code; return this; },
        json: function(data) { this.body = data; return this; }
    };
    return res;
}

function runTests() {
    let passed = 0;
    let failed = 0;

    console.log('\n=== PRUEBAS DE RBAC ===\n');

    // Test 1: checkRole permite el rol correcto
    console.log('Test 1: checkRole permite el rol correcto...');
    const req1 = createMockReq({ rol: 'SUPER_ADMIN' });
    const res1 = createMockRes();
    const next1 = () => { console.log('✅ PASSED: Rol SUPER_ADMIN permitido'); passed++; };
    
    checkRole(['SUPER_ADMIN'])(req1, res1, next1);
    if (res1.statusCode !== 200) failed++;

    // Test 2: checkRole rechaza rol incorrecto
    console.log('\nTest 2: checkRole rechaza rol incorrecto...');
    const req2 = createMockReq({ rol: 'CLIENTE' });
    const res2 = createMockRes();
    const next2 = () => { console.log('❌ FAILED: Rol CLIENTE debería ser rechazado'); failed++; };
    
    checkRole(['SUPER_ADMIN'])(req2, res2, next2);
    if (res2.statusCode === 403) {
        console.log('✅ PASSED: Rol CLIENTE rechazado con 403');
        passed++;
    } else {
        failed++;
    }

    // Test 3: checkRole permite uno de múltiples roles
    console.log('\nTest 3: checkRole permite uno de múltiples roles...');
    const req3 = createMockReq({ rol: 'GESTION' });
    const res3 = createMockRes();
    const next3 = () => { console.log('✅ PASSED: Rol GESTION permitido en lista'); passed++; };
    
    checkRole(['SUPER_ADMIN', 'GESTION'])(req3, res3, next3);
    if (res3.statusCode !== 200) failed++;

    // Test 4: checkRole rejects cuando no hay usuario
    console.log('\nTest 4: checkRole rechaza usuario no autenticado...');
    const req4 = createMockReq(null);
    const res4 = createMockRes();
    const next4 = () => { console.log('❌ FAILED: Usuario null debería ser rechazado'); failed++; };
    
    checkRole(['SUPER_ADMIN'])(req4, res4, next4);
    if (res4.statusCode === 401) {
        console.log('✅ PASSED: Usuario no autenticado rechazado con 401');
        passed++;
    } else {
        failed++;
    }

    // Test 5: isAdmin permite SUPER_ADMIN
    console.log('\nTest 5: isAdmin permite SUPER_ADMIN...');
    const req5 = createMockReq({ rol: 'SUPER_ADMIN' });
    const res5 = createMockRes();
    const next5 = () => { console.log('✅ PASSED: isAdmin permite SUPER_ADMIN'); passed++; };
    
    isAdmin(req5, res5, next5);
    if (res5.statusCode !== 200) failed++;

    // Test 6: isAdmin rechaza no-admin
    console.log('\nTest 6: isAdmin rechaza usuario no-admin...');
    const req6 = createMockReq({ rol: 'GESTION' });
    const res6 = createMockRes();
    const next6 = () => { console.log('❌ FAILED: isAdmin debería rechazar GESTION'); failed++; };
    
    isAdmin(req6, res6, next6);
    if (res6.statusCode === 403) {
        console.log('✅ PASSED: isAdmin rechaza no-admin con 403');
        passed++;
    } else {
        failed++;
    }

    // Test 7: Verificar token JWT válido
    console.log('\nTest 7: Verificar token JWT válido...');
    const token = jwt.sign({ id: 1, email: 'test@test.com', rol: 'SUPER_ADMIN' }, JWT_SECRET);
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.rol === 'SUPER_ADMIN') {
            console.log('✅ PASSED: Token JWT verificado correctamente');
            passed++;
        } else {
            console.log('❌ FAILED: Rol no encontrado en token');
            failed++;
        }
    } catch (err) {
        console.log('❌ FAILED: Token inválido');
        failed++;
    }

    // Test 8: Verificar token JWT inválido
    console.log('\nTest 8: Verificar token JWT inválido...');
    try {
        jwt.verify('token_invalido', JWT_SECRET);
        console.log('❌ FAILED: Token inválido debería fallar');
        failed++;
    } catch (err) {
        console.log('✅ PASSED: Token inválido rechazado');
        passed++;
    }

    // Resumen
    console.log('\n=== RESUMEN ===');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Total: ${passed + failed}`);
    
    if (failed > 0) {
        process.exit(1);
    } else {
        console.log('\n🎉 Todas las pruebas de RBAC pasaron!');
        process.exit(0);
    }
}

runTests();