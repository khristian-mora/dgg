const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');

const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
                isActive: true,
                lastLogin: true,
                createdAt: true
            }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error al recuperar usuarios', error: err.message });
    }
};

const createUser = async (req, res) => {
    const { nombre, apellido, email, password, rol, username: manualUsername } = req.body;
    try {
        // Generar username automático si no viene uno manual: juan.perez
        let username = manualUsername;
        if (!username && nombre && apellido) {
            username = `${nombre.trim().toLowerCase()}.${apellido.trim().toLowerCase()}`.replace(/\s+/g, '');
        }

        // Si no hay email, usamos una versión ficticia o permitimos nulo según el schema
        const userEmail = email || `${username}@dgg.local`;

        // Verificar si el username o email ya existen
        const existing = await prisma.user.findFirst({ 
            where: { 
                OR: [
                    { email: userEmail },
                    { nombre: username } // Usamos el campo nombre para el login o agregamos username al schema
                ] 
            } 
        });
        
        if (existing) return res.status(400).json({ message: 'El usuario o correo ya está registrado.' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        const user = await prisma.user.create({
            data: {
                nombre: username, // Almacenamos el formato nombre.apellido aquí para el login
                email: userEmail,
                passwordHash,
                rol: rol || 'GESTION',
                isActive: true
            }
        });
        
        const { passwordHash: _, ...userData } = user;
        res.status(201).json(userData);
    } catch (err) {
        console.error('Error create user:', err);
        res.status(400).json({ message: 'Error al crear usuario', error: err.message });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { nombre, email, password, rol, isActive } = req.body;
    try {
        const data = { nombre, email, rol, isActive };
        
        // Si hay una nueva contraseña, hashearla
        if (password) {
            data.passwordHash = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id },
            data
        });
        
        const { passwordHash: _, ...userData } = user;
        res.json(userData);
    } catch (err) {
        res.status(400).json({ message: 'Error al actualizar usuario', error: err.message });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar usuario', error: err.message });
    }
};

const updatePassword = async (req, res) => {
    const { password } = req.body;
    const userId = req.user.id; // Viene del token decodificado por el middleware
    
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash }
        });
        
        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (err) {
        res.status(400).json({ message: 'Error al actualizar contraseña', error: err.message });
    }
};

module.exports = { getUsers, createUser, updateUser, deleteUser, updatePassword };
