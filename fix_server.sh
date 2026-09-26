#!/bin/bash
echo "Iniciando reparación de base de datos..."
# Buscamos la base de datos real
REAL_DB="/var/www/dgg/server/prisma/prod.db"

if [ -f "$REAL_DB" ]; then
    echo "Base de datos real encontrada. Unificando..."
    # Sobrescribimos todas las posibles bases de datos con la real
    find /var/www/dgg -name "*.db" -exec cp "$REAL_DB" {} \;
    echo "Sincronización completada."
else
    echo "ERROR: No se encontró la base de datos real en $REAL_DB"
    exit 1
fi

# Reiniciamos la aplicación
if command -v pm2 &> /dev/null; then
    pm2 restart all
    echo "Servidor reiniciado con PM2."
else
    service nginx restart
    echo "Nginx reiniciado (PM2 no encontrado)."
fi
