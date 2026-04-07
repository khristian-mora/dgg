/**
 * Formatea un número como moneda de Pesos Colombianos (COP)
 * Ejemplo: 1234567 -> $ 1.234.567
 * 
 * @param {number} amount - El valor numérico a formatear
 * @returns {string} - El valor formateado con signo $ y puntos de miles
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount || 0);
};

/**
 * Formatea un valor para ser mostrado en un input (con puntos de miles)
 * @param {string|number} value - El valor a formatear
 * @returns {string} - Valor formateado con puntos
 */
export const formatInputValue = (value) => {
    if (value === null || value === undefined || value === '') return '';
    // Elimina todo lo que no sea número
    const number = value.toString().replace(/\D/g, '');
    if (number === '') return '';
    // Agrega separadores de miles
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Parsea un valor de input formateado a un número puro
 * @param {string} value - El valor del input con puntos u otros caracteres
 * @returns {number} - El número limpio
 */
export const parseAmount = (value) => {
    if (!value) return 0;
    const cleanValue = value.toString().replace(/\D/g, '');
    return cleanValue ? parseInt(cleanValue, 10) : 0;
};

/**
 * Formatea una fecha en formato legible para Colombia
 * @param {string|Date} date - La fecha a formatear
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};
